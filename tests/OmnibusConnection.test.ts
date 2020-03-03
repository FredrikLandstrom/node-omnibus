import OmnibusConnection from '../src/OmnibusConnection';
import { OmnibusQueryParameters, OmnibusConnectionParameters } from '../src/OmnibusQueryGenerator';

const parameters = {};

const fakeFetch = jest.fn().mockReturnValue(
  Promise.resolve({
    json: () =>
      Promise.resolve({
        data: {
          mydata: 20,
        },
      }),
  }),
);

//const omnibusConnection = new OmnibusConnection(fakeFetch, parameters);
const params = {
  host: 'omnihost',
  user: 'root',
  port: '8080',
  password: '',
  SSLEnable: false,
  SSLRejectUnauthorized: false,
  endpoint: 'alerts.status',
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
  test('should throw PARAMETER_ERROR if host is missing', () => {
    Object.assign(testParams, params);
    delete testParams.host;
    expect(() => {
      new OmnibusConnection(fakeFetch, testParams);
    }).toThrow('Parameter host is required');
  });
  test('should throw PARAMETER_ERROR if port is missing', () => {
    Object.assign(testParams, params);
    delete testParams.port;
    expect(() => {
      new OmnibusConnection(fakeFetch, testParams);
    }).toThrow('Parameter port is required');
  });
  test('should throw PARAMETER_ERROR if user is missing', () => {
    Object.assign(testParams, params);
    delete testParams.user;
    expect(() => {
      new OmnibusConnection(fakeFetch, testParams);
    }).toThrow('Parameter user is required');
  });
});

describe('OmnibusConnection Class #2 - Connection Parameters', () => {
  let connection: OmnibusConnection;

  const omnibusQueryParameters: OmnibusQueryParameters = { filter: 'test', collist: 'test', orderby: 'test' };

  beforeEach(() => {
    Object.assign(testParams, params);
  });

  test('URL when not using SSL should contain http://', () => {
    testParams.SSLEnable = false;
    connection = new OmnibusConnection(fakeFetch, testParams);
    expect(connection.getUrl).toMatch('http://omnihost:8080/objectserver/restapi');
  });

  test('URL when using SSL should contain https://', () => {
    testParams.SSLEnable = true;
    connection = new OmnibusConnection(fakeFetch, testParams);
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
