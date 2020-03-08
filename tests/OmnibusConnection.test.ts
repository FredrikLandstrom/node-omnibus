import OmnibusConnection from '../src/OmnibusConnection';
import { OmnibusQueryParameters, OmnibusConnectionParameters } from '../src/OmnibusQueryGenerator';
var fs = require('fs');

const omnibusSuccessGetJSON = JSON.parse(fs.readFileSync('./tests/datafiles/fetchOMNIbusGetResponse.json', 'utf8'));
const omnibusModel = JSON.parse(fs.readFileSync('./tests/datafiles/OMNIbusModel.json', 'utf8'));

const fetchMock = require('fetch-mock').sandbox();

//const omnibusConnection = new OmnibusConnection(fakeFetch, parameters);
const params = {
  host: 'omnihost',
  user: 'root',
  port: '8080',
  password: '',
  SSLEnable: false,
  SSLRejectUnauthorized: false,
};

let testParams: OmnibusConnectionParameters = {
  host: '',
  port: '',
  user: '',
  password: '',
  SSLEnable: false,
  SSLRejectUnauthorized: false,
};

fetchMock.get({
  url: 'begin:http://omnibussuccess',
  headers: { Authorization: 'Basic cm9vdDo=' },
  response: omnibusSuccessGetJSON,
  overwriteRoutes: false,
});

fetchMock.delete({
  url: 'begin:http://omnibussuccess',
  headers: { Authorization: 'Basic cm9vdDo=' },
  response: omnibusSuccessGetJSON,
  overwriteRoutes: false,
});

fetchMock.post({
  url: 'begin:http://omnibussuccess',
  headers: { Authorization: 'Basic cm9vdDo=' },
  response: omnibusSuccessGetJSON,
  overwriteRoutes: false,
});

fetchMock.patch({
  url: 'begin:http://omnibussuccess',
  headers: { Authorization: 'Basic cm9vdDo=' },
  response: omnibusSuccessGetJSON,
  overwriteRoutes: false,
});

describe('OmnibusConnection Class #1- Constructor', () => {
  test('should throw PARAMETERMISSING if host is missing', () => {
    Object.assign(testParams, params);
    delete testParams.host;
    expect(() => {
      new OmnibusConnection(fetchMock, testParams);
    }).toThrow('Parameter missing : Parameter host is missing');
  });
  test('should throw PARAMETERMISSING if port is missing', () => {
    Object.assign(testParams, params);
    delete testParams.port;
    expect(() => {
      new OmnibusConnection(fetchMock, testParams);
    }).toThrow('Parameter missing : Parameter port is missing');
  });
  test('should throw PARAMETERMISSING if user is missing', () => {
    Object.assign(testParams, params);
    delete testParams.user;
    expect(() => {
      new OmnibusConnection(fetchMock, testParams);
    }).toThrow('Parameter missing : Parameter user is missing');
  });
});

describe('OmnibusConnection Class #2 - Connection Parameters', () => {
  let connection: OmnibusConnection;

  const omnibusQueryParameters: OmnibusQueryParameters = {
    filter: 'test',
    collist: ['Node', 'Summary'],
    orderby: 'test',
  };

  beforeEach(() => {
    Object.assign(testParams, params);
  });

  test('URL when not using SSL should contain http://', () => {
    testParams.SSLEnable = false;
    connection = new OmnibusConnection(fetchMock, testParams);
    expect(connection.getUrl()).toMatch('http://omnihost:8080/objectserver/restapi');
  });

  test('URL when using SSL should contain https://', () => {
    testParams.SSLEnable = true;
    connection = new OmnibusConnection(fetchMock, testParams);
    expect(connection.getUrl()).toMatch('https://omnihost:8080/objectserver/restapi');
  });
});

describe('OmnibusConnection - syncModel()', () => {
  test('syncModel() returns a model', async () => {
    params.host = 'omnibussuccess';
    const connection = new OmnibusConnection(fetchMock, params);
    await expect(connection.syncModel()).resolves.toMatchObject(omnibusModel);
  });
});

describe('OmnibusConnection - setQueryPath()', () => {
  const connection = new OmnibusConnection(fetchMock, params);
  test('should throw if format is not.db.table or db/table', () => {
    expect(() => {
      connection.setQueryPath('/alerts/status/thisiswrowng');
    }).toThrow('Incorrect Endpoint format : supplied path [/alerts/status/thisiswrowng] is incorrect');
    expect(() => {
      connection.setQueryPath('alerts.status.thisiswrowng');
    }).toThrow('Incorrect Endpoint format : supplied path [alerts.status.thisiswrowng] is incorrect');
    expect(() => {
      connection.setQueryPath('alerts');
    }).toThrow('Incorrect Endpoint format : supplied path [alerts] is incorrect');
    expect(() => {
      connection.setQueryPath('alerts_status');
    }).toThrow('Incorrect Endpoint format : supplied path [alerts_status] is incorrect');
  });
  test('should convert endpoint to correct format', () => {
    expect(connection.setQueryPath('alerts.status').getUrl()).toMatch('alerts/status');
    expect(connection.setQueryPath('alerts/status').getUrl()).toMatch('alerts/status');
    expect(connection.setQueryPath('').getUrl()).toMatch('alerts/status');
  });
});

describe('OmnibusConnection - set & getAttributes()()', () => {
  const connection = new OmnibusConnection(fetchMock, params);
  const newAttributes = {
    host: 'omnihostNew',
    user: 'rootNew',
    port: '8081',
    password: 'NewPassword',
    SSLEnable: true,
    SSLRejectUnauthorized: true,
  };
  test('should set and get attributes', () => {
    connection.setAttributes(newAttributes);
    expect(connection.getAttributes()).toMatchObject(newAttributes);
  });
});

describe('OmnibusConnection - getUrl()()', () => {
  test('url can be read', async () => {
    params.host = 'omnibussuccess';
    const connection = new OmnibusConnection(fetchMock, params);
    expect(connection.getUrl()).toMatch('http://omnibussuccess');
  });
});

describe('OmnibusConnection - getModel()', () => {
  test('model is correct', async () => {
    params.host = 'omnibussuccess';
    const connection = new OmnibusConnection(fetchMock, params);
    await expect(connection.getModel()).resolves.toMatchObject(omnibusModel);
  });
});

describe('OmnibusConnection - find()', () => {
  test('should return omnibus response', async () => {
    params.host = 'omnibussuccess';
    const connection = new OmnibusConnection(fetchMock, params);
    expect(connection.find({ filter: { Node: 'omnihost' } })).resolves.toMatchObject(omnibusSuccessGetJSON);
  });
});

describe('OmnibusConnection - destroy()', () => {
  test('should return omnibus response', () => {
    params.host = 'omnibussuccess';
    const connection = new OmnibusConnection(fetchMock, params);
    expect(connection.destroy({ filter: { Node: 'omnihost' } })).resolves.toMatchObject(omnibusSuccessGetJSON);
  });
});

describe('OmnibusConnection - update()', () => {
  test('should return omnibus response', () => {
    params.host = 'omnibussuccess';
    const connection = new OmnibusConnection(fetchMock, params);
    expect(connection.update({ filter: { Node: 'omnihost' }, update: { Node: 'newnode' } })).resolves.toMatchObject(
      omnibusSuccessGetJSON,
    );
  });
});

describe('OmnibusConnection - insert()', () => {
  test('should return omnibus response', () => {
    params.host = 'omnibussuccess';
    const connection = new OmnibusConnection(fetchMock, params);
    expect(connection.insert({ Node: 'newNode', Summary: 'This was inserted from test' })).resolves.toMatchObject(
      omnibusSuccessGetJSON,
    );
  });
});

describe('OmnibusConnection - sqlFactory()', () => {
  test('should return omnibus response', () => {
    params.host = 'omnibussuccess';
    const connection = new OmnibusConnection(fetchMock, params);
    expect(connection.sqlFactory('select * from alerts.status')).resolves.toMatchObject(omnibusSuccessGetJSON);
  });
});

describe('OmnibusConnection - (old) query()', () => {
  test('should return omnibus response', () => {
    params.host = 'omnibussuccess';
    const connection = new OmnibusConnection(fetchMock, params);
    expect(connection.query('select * from alerts.status')).resolves.toMatchObject(omnibusSuccessGetJSON);
  });
});

describe('OmnibusConnection - (old) sqlCommand()', () => {
  test('should return omnibus response', () => {
    params.host = 'omnibussuccess';
    const connection = new OmnibusConnection(fetchMock, params);
    expect(connection.sqlCommand('select * from alerts.status')).resolves.toMatchObject(omnibusSuccessGetJSON);
  });
});
