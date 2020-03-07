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

fetchMock.get({
  url: 'begin:http://omnihost',
  headers: { Authorization: 'Basic cm9vdDo=' },
  response: omnibusSuccessGetJSON,
  overwriteRoutes: false,
});
fetchMock.get({
  url: 'begin:http://omnihost',
  headers: { Authorization: 'Basic cm9vdDp3cm9uZ3Bhc3N3b3Jk' },
  response: omnibus401Error,
  overwriteRoutes: false,
});

describe('Omnibus Query Class - SyncModel tests', () => {
  const testQuery = new OmnibusQueryGenerator(fetchMock);
  testQuery.setAttributes(params);

  test('should return a model', async () => {
    await expect(testQuery.syncModel()).resolves.toMatchObject(omnibusModel);
  });
  test('should return an error', async () => {
    testQuery.setAttributes({ password: 'wrongpassword' });
    await expect(testQuery.syncModel()).rejects.toMatchObject({
      status: 'ERRORINSYNC',
      statusText: 'Error in sync with the objectserver',
    });
  });
});

describe('OmnibusQueryGenerator - syncModel()', () => {
  test('Test1', async () => {});
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
    expect(queryGenerator.setQueryPath('alerts.status').getUrl).toMatch('alerts/status');
    expect(queryGenerator.setQueryPath('alerts/status').getUrl).toMatch('alerts/status');
    expect(queryGenerator.setQueryPath('').getUrl).toMatch('alerts/status');
  });
});

describe('OmnibusQueryGenerator - getModel()', () => {
  test('Test1', async () => {});
});

describe('OmnibusQueryGenerator - setRequestInit()', () => {
  test('Test1', async () => {});
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
    queryGeneratory.setAttributes(expectedParams);
    // test default paramtetrs
    expect(queryGeneratory.getAttributes).toMatchObject(expectedParams);
    // Change some parameters
    let newParameters: OmnibusConnectionParameters = { host: 'newhost', password: 'newpassword', port: 'newPort' };
    // Update the parameters to test with
    Object.assign(expectedParams, newParameters);
    // set the parameters on the testQuery
    queryGeneratory.setAttributes(newParameters);
    // get them and validate
    expect(queryGeneratory.getAttributes).toMatchObject(expectedParams);
    // Change other parameters
    newParameters = { SSLEnable: true, SSLRejectUnauthorized: true, port: 'newPort' };
    // Update the parameters to test with
    Object.assign(expectedParams, newParameters);
    // set the parameters on the testQuery
    queryGeneratory.setAttributes(newParameters);
    // get them and validate
    expect(queryGeneratory.getAttributes).toMatchObject(expectedParams);
  });
});

describe('OmnibusQueryGenerator - getAttributes()', () => {
  test('Test1', async () => {});
});

describe('OmnibusQueryGenerator - find()', () => {
  const queryGeneratory = new OmnibusQueryGenerator(fetchMock);
  queryGeneratory.setAttributes(params);
  test('it should return a response', async () => {
    await expect(queryGeneratory.find({ filter: { Node: 'hostname.domain.com' } })).resolves.toMatchObject(
      omnibusSuccessGetJSON,
    );
  });
});

describe('OmnibusQueryGenerator - destroy()', () => {
  test('Test1', async () => {});
});

describe('OmnibusQueryGenerator - update()', () => {
  test('Test1', async () => {});
});

describe('OmnibusQueryGenerator - insert()', () => {
  test('Test1', async () => {});
});

describe('OmnibusQueryGenerator - sqlFactory()', () => {
  test('Test1', async () => {});
});

describe('OmnibusQueryGenerator - constructPayload()', () => {
  test('Test1', async () => {});
});

describe('OmnibusQueryGenerator - constructSearchParams()', () => {
  test('Test1', async () => {});
});
