import { OmnibusQueryGenerator, OmnibusConnectionParameters } from '../src/OmnibusQueryGenerator';
import { isExportDeclaration } from 'typescript';
var fs = require('fs');

const params = {
  host: 'omnihost',
  user: 'root',
  port: '8080',
  password: '',
  SSLEnable: false,
  SSLRejectUnauthorized: false,
};

const omnibusSuccessGetJSON = JSON.parse(fs.readFileSync('./tests/datafiles/fetchOMNIbusGetResponse.json', 'utf8'));
const omnibusModel = JSON.parse(fs.readFileSync('./tests/datafiles/OMNIbusModel.json', 'utf8'));
const omnibus401Error = JSON.parse(fs.readFileSync('./tests/datafiles/fetchOMNIbus401error.json', 'utf8'));

const fetchMock = require('fetch-mock').sandbox();

// Fetch to run with the right password (see headers)
fetchMock.get({
  url: 'begin:http://omnihost',
  headers: { Authorization: 'Basic cm9vdDo=' },
  response: omnibusSuccessGetJSON,
  overwriteRoutes: false,
});

fetchMock.delete({
  url: 'begin:http://omnihost',
  headers: { Authorization: 'Basic cm9vdDo=' },
  response: omnibusSuccessGetJSON,
  overwriteRoutes: false,
});

fetchMock.patch({
  url: 'begin:http://omnihost',
  headers: { Authorization: 'Basic cm9vdDo=' },
  response: omnibusSuccessGetJSON,
  overwriteRoutes: false,
});

fetchMock.post({
  url: 'begin:http://omnihost',
  headers: { Authorization: 'Basic cm9vdDo=' },
  response: omnibusSuccessGetJSON,
  overwriteRoutes: false,
});

// Fetch to run with the wrong password (see headers)
fetchMock.get({
  url: 'begin:http://omnihost',
  headers: { Authorization: 'Basic cm9vdDp3cm9uZ3Bhc3N3b3Jk' },
  response: omnibus401Error,
  overwriteRoutes: false,
});

describe('OmnibusQueryGenerator - syncModel()', () => {
  const queryGenerator = new OmnibusQueryGenerator(fetchMock);
  queryGenerator.setAttributes(params);

  test('should return a model', async () => {
    await expect(queryGenerator.syncModel()).resolves.toMatchObject(omnibusModel);
  });
  test('should return an error when connection to OS lost', async () => {
    queryGenerator.setAttributes({ password: 'wrongpassword' });
    try {
      // This should fail with an error
      await queryGenerator.syncModel();
    } catch (e) {
      expect(e).toMatchObject({ name: 'ERRORINSYNC' });
    }
  });
});

describe('OmnibusQueryGenerator - setQueryPath()', () => {
  const queryGenerator = new OmnibusQueryGenerator(fetchMock);
  test('should throw if format is not.db.table or db/table', () => {
    expect(() => {
      queryGenerator.setQueryPath('/alerts/status/thisiswrowng');
    }).toThrow('Incorrect Endpoint format : supplied path [/alerts/status/thisiswrowng] is incorrect');
    expect(() => {
      queryGenerator.setQueryPath('alerts.status.thisiswrowng');
    }).toThrow('Incorrect Endpoint format : supplied path [alerts.status.thisiswrowng] is incorrect');
    expect(() => {
      queryGenerator.setQueryPath('alerts');
    }).toThrow('Incorrect Endpoint format : supplied path [alerts] is incorrect');
    expect(() => {
      queryGenerator.setQueryPath('alerts_status');
    }).toThrow('Incorrect Endpoint format : supplied path [alerts_status] is incorrect');
  });
  test('should convert endpoint to correct format', () => {
    expect(queryGenerator.setQueryPath('alerts.status').getUrl()).toMatch('alerts/status');
    expect(queryGenerator.setQueryPath('alerts/status').getUrl()).toMatch('alerts/status');
    expect(queryGenerator.setQueryPath('').getUrl()).toMatch('alerts/status');
  });
});

describe('OmnibusQueryGenerator - getModel()', () => {
  const queryGenerator = new OmnibusQueryGenerator(fetchMock);
  queryGenerator.setAttributes(params);
  test('should get model when it doesent exist', async () => {
    await expect(queryGenerator.getModel()).resolves.toMatchObject(omnibusModel);
  });

  test('should get stored model when exist', async () => {
    await expect(queryGenerator.getModel()).resolves.toMatchObject(omnibusModel);
  });
});

describe('OmnibusQueryGenerator - setAttributes()', () => {
  const queryGeneratory = new OmnibusQueryGenerator(fetchMock);
  test('setAttributes should set attributes correctly', () => {
    // Set default attributes
    const expectedParams = {
      host: 'omnihost',
      user: 'root',
      port: '8080',
      password: '',
      SSLEnable: false,
      SSLRejectUnauthorized: false,
    };
    // Empty parameters

    expect(() => {
      queryGeneratory.setAttributes();
    }).toThrow('Parameter missing : Parameter port is missing');

    queryGeneratory.setAttributes(expectedParams);
    // test default paramtetrs
    expect(queryGeneratory.getAttributes()).toMatchObject(expectedParams);
    // Change some parameters
    let newParameters: OmnibusConnectionParameters = { host: 'newhost', password: 'newpassword', port: 'newPort' };
    // Update the parameters to test with
    Object.assign(expectedParams, newParameters);
    // set the parameters on the testQuery
    queryGeneratory.setAttributes(newParameters);
    // get them and validate
    expect(queryGeneratory.getAttributes()).toMatchObject(expectedParams);
    // Change other parameters
    newParameters = { SSLEnable: true, SSLRejectUnauthorized: true, port: 'newPort' };
    // Update the parameters to test with
    Object.assign(expectedParams, newParameters);
    // set the parameters on the testQuery
    queryGeneratory.setAttributes(newParameters);
    // get them and validate
    expect(queryGeneratory.getAttributes()).toMatchObject(expectedParams);
  });
});

describe('OmnibusQueryGenerator - find()', () => {
  const queryGenerator = new OmnibusQueryGenerator(fetchMock);
  queryGenerator.setAttributes(params);
  test('it should return a response', async () => {
    await expect(queryGenerator.find({ filter: { Node: 'hostname.domain.com' } })).resolves.toMatchObject(
      omnibusSuccessGetJSON,
    );
  });
  test('url should update with filter,collist and orderby when used', async () => {
    // Test filter
    await queryGenerator.find({ filter: { Node: 'hostname.domain.com' } }).then(res => {
      expect(queryGenerator.getUrl()).toEqual(
        'http://omnihost:8080/objectserver/restapi/alerts/status?filter=Node%3D%27hostname.domain.com%27&collist=&orderby=',
      );
    });
    // Test collist
    await queryGenerator.find({ filter: { Node: 'hostname.domain.com' }, collist: ['Node', 'Summary'] }).then(res => {
      expect(queryGenerator.getUrl()).toEqual(
        'http://omnihost:8080/objectserver/restapi/alerts/status?filter=Node%3D%27hostname.domain.com%27&collist=Node%2CSummary&orderby=',
      );
    });
    // Test orderby
    await queryGenerator
      .find({ filter: { Node: 'hostname.domain.com' }, collist: ['Node', 'Summary'], orderby: { Node: 'ASC' } })
      .then(res => {
        expect(queryGenerator.getUrl()).toEqual(
          'http://omnihost:8080/objectserver/restapi/alerts/status?filter=Node%3D%27hostname.domain.com%27&collist=Node%2CSummary&orderby=Node+ASC',
        );
      });
  });
});

describe('OmnibusQueryGenerator - destroy()', () => {
  const queryGenerator = new OmnibusQueryGenerator(fetchMock);
  queryGenerator.setAttributes(params);
  test('should throw error if query parameters are missing', async () => {
    try {
      await queryGenerator.destroy();
    } catch (e) {
      expect(e).toMatchObject({ errorType: 'DESTROYFILTERMISSING' });
    }
  });
  test('should throw error if query parameter filter is missing', async () => {
    try {
      await queryGenerator.destroy({ orderby: 'this could delete the whole table if used' });
    } catch (e) {
      expect(e).toMatchObject({ errorType: 'DESTROYFILTERMISSING' });
    }
  });
  test('should return promise if filter is supplied', async () => {
    await expect(queryGenerator.destroy({ filter: { Node: 'omnihost' } })).resolves.toMatchObject(
      omnibusSuccessGetJSON,
    );
  });
});

describe('OmnibusQueryGenerator - update()', () => {
  const queryGenerator = new OmnibusQueryGenerator(fetchMock);
  queryGenerator.setAttributes(params);
  test('should throw error if query parameters are missing', async () => {
    try {
      await queryGenerator.update();
    } catch (e) {
      expect(e).toMatchObject({ errorType: 'UPDATEPARAMETERMISSING' });
    }
  });
  test('should throw error if query parameter update is missing', async () => {
    try {
      await queryGenerator.update({ orderby: 'this is not a parameter for update' });
    } catch (e) {
      expect(e).toMatchObject({ errorType: 'UPDATEPARAMETERMISSING' });
    }
  });
  test('should throw error if query parameter filter is missing', async () => {
    try {
      await queryGenerator.update({ update: { Node: 'omnihost_new' } });
    } catch (e) {
      expect(e).toMatchObject({ errorType: 'UPDATEFILTERMISSING' });
    }
  });
  test('should return promise if update and filter is supplied', async () => {
    await expect(
      queryGenerator.update({ filter: { Node: 'omnihost' }, update: { Node: 'omnihost_new' } }),
    ).resolves.toMatchObject(omnibusSuccessGetJSON);
  });
});

describe('OmnibusQueryGenerator - insert()', () => {
  const queryGenerator = new OmnibusQueryGenerator(fetchMock);
  queryGenerator.setAttributes(params);
  test('should throw error if query parameters are missing', async () => {
    try {
      await queryGenerator.insert();
    } catch (e) {
      expect(e).toMatchObject({ errorType: 'INSERTPARAMETERMISSING' });
    }
  });
  test('should throw error if query parameter fields is missing', async () => {
    try {
      await queryGenerator.insert({ orderby: 'this is not a parameter for insert' });
    } catch (e) {
      expect(e).toMatchObject({ errorType: 'INSERTPARAMETERMISSING' });
    }
  });
  test('should return promise if fields is supplied', async () => {
    await expect(queryGenerator.insert({ fields: { Node: 'omnihost' } })).resolves.toMatchObject(omnibusSuccessGetJSON);
  });
});

describe('OmnibusQueryGenerator - sqlFactory()', () => {
  const queryGenerator = new OmnibusQueryGenerator(fetchMock);
  queryGenerator.setAttributes(params);
  test('should return promise if fields is supplied', async () => {
    await expect(queryGenerator.sqlFactory('select * from alerts.status')).resolves.toMatchObject(
      omnibusSuccessGetJSON,
    );
  });
});

describe('OmnibusQueryGenerator - constructSearchParams()', () => {
  const queryGenerator = new OmnibusQueryGenerator(fetchMock);
  test('should return correct searchParams - filter:integers', async () => {
    expect(queryGenerator.constructSearchParams({ filter: { Severity: 5 } })).toMatchObject({
      filter: 'Severity=5',
    });
  });
  test('should return correct searchParams - filter:strings', async () => {
    expect(queryGenerator.constructSearchParams({ filter: { Node: 'omnihost' } })).toMatchObject({
      filter: "Node='omnihost'",
    });
  });
  test('should return correct searchParams - collist', async () => {
    expect(queryGenerator.constructSearchParams({ collist: ['Node,Summary'] })).toMatchObject({
      collist: 'Node,Summary',
    });
  });
  test('should return correct searchParams - orderby', async () => {
    expect(queryGenerator.constructSearchParams({ orderby: { Node: 'ASC' } })).toMatchObject({
      orderby: 'Node ASC',
    });
    expect(queryGenerator.constructSearchParams({ orderby: { Node: 'DESC' } })).toMatchObject({
      orderby: 'Node DESC',
    });
  });
  test('should return correct searchParams - mixed', async () => {
    const mixedQueryParams = {
      filter: { Node: 'omnihost' },
      collist: ['Node,Summary'],
      orderby: { Node: 'DESC' },
    };
    expect(queryGenerator.constructSearchParams(mixedQueryParams)).toMatchObject({
      filter: "Node='omnihost'",
      collist: 'Node,Summary',
      orderby: 'Node DESC',
    });
  });
});
