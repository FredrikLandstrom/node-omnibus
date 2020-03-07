import OmnibusConnection from '../src/OmnibusConnection';
import { OmnibusQueryParameters, OmnibusConnectionParameters } from '../src/OmnibusQueryGenerator';

const parameters = {};

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
    expect(connection.getUrl).toMatch('http://omnihost:8080/objectserver/restapi');
  });

  test('URL when using SSL should contain https://', () => {
    testParams.SSLEnable = true;
    connection = new OmnibusConnection(fetchMock, testParams);
    expect(connection.getUrl).toMatch('https://omnihost:8080/objectserver/restapi');
  });

  /* To be included when Query Class is done
  test('baseUrl when not using SSL', () => {
    connection = new OmnibusConnection(fakeFetch, testParams);
    connection.find('');
    expect(fakeFetch).toBeCalledWith('http://omnihost:8080/objectserver/restapi', {
      headers: { Authorization: 'Basic cm9vdDo=', 'Content-Type': 'application/json', Host: 'localhost' },
      method: 'GET',
      rejectUnauthorized: false,
    });
  });
  test('baseUrl when using SSL', () => {
    testParams.SSLEnable = true;
    connection = new OmnibusConnection(fakeFetch, testParams);
    connection.find('');

    expect(fakeFetch).toBeCalledWith('https://omnihost:8080/objectserver/restapi', {
      headers: { Authorization: 'Basic cm9vdDo=', 'Content-Type': 'application/json', Host: 'localhost' },
      method: 'GET',
      rejectUnauthorized: false,
    });
  });
  */
});
