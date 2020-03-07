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

describe('Omnibus Query Class - Enpoint tests', () => {
  const testQuery = new OmnibusQueryGenerator(fetchMock);
  test('should throw if format is not.db.table or db/table', () => {
    expect(() => {
      testQuery.setQueryPath('/alerts/status/thisiswrowng');
    }).toThrow('Incorrect Endpoint format : supplied path [/alerts/status/thisiswrowng] is incorrect');
    expect(() => {
      testQuery.setQueryPath('alerts.status.thisiswrowng');
    }).toThrow('Incorrect Endpoint format : supplied path [alerts.status.thisiswrowng] is incorrect');
    expect(() => {
      testQuery.setQueryPath('alerts');
    }).toThrow('Incorrect Endpoint format : supplied path [alerts] is incorrect');
    expect(() => {
      testQuery.setQueryPath('alerts_status');
    }).toThrow('Incorrect Endpoint format : supplied path [alerts_status] is incorrect');
  });
  test('should convert endpoint to correct format', () => {
    expect(testQuery.setQueryPath('alerts.status').getUrl).toMatch('alerts/status');
    expect(testQuery.setQueryPath('alerts/status').getUrl).toMatch('alerts/status');
    expect(testQuery.setQueryPath('').getUrl).toMatch('alerts/status');
  });
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
    testQuery.setAttributes(expectedParams);
    // test default paramtetrs
    expect(testQuery.getAttributes).toMatchObject(expectedParams);
    // Change some parameters
    let newParameters: OmnibusConnectionParameters = { host: 'newhost', password: 'newpassword', port: 'newPort' };
    // Update the parameters to test with
    Object.assign(expectedParams, newParameters);
    // set the parameters on the testQuery
    testQuery.setAttributes(newParameters);
    // get them and validate
    expect(testQuery.getAttributes).toMatchObject(expectedParams);
    // Change other parameters
    newParameters = { SSLEnable: true, SSLRejectUnauthorized: true, port: 'newPort' };
    // Update the parameters to test with
    Object.assign(expectedParams, newParameters);
    // set the parameters on the testQuery
    testQuery.setAttributes(newParameters);
    // get them and validate
    expect(testQuery.getAttributes).toMatchObject(expectedParams);
  });
});
