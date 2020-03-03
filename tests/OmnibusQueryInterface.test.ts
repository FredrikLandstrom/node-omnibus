import { OmnibusQueryInterface } from '../src/OmnibusQueryInterface';
import * as fs from 'fs';

//import fetchMock from 'fetch-mock';
import OmnibusConnection from '../src/OmnibusConnection';
import fetch from 'node-fetch';
const fetchMock = require('fetch-mock').sandbox();

//jest.mock('node-fetch', () => require('fetch-mock').sandbox());

// Init fetchmock to create the connection
fetchMock.get('http://omnihost', {});

const queryInterface = new OmnibusQueryInterface(fetchMock);

//let rawdata = fs.readFileSync('./tests/datafiles/omnibusGetResponse.json');
//console.log(JSON.parse(rawdata.toString()));
const connection = describe('Omnibus QueryInterface Class', () => {
  it('400 Error', async () => {
    fetchMock.get('http://omnihost', 400, { overwriteRoutes: true });
    const jsonResponse = JSON.parse('{"status": 400, "statusText": "Bad Request", "url": "http://omnihost/"}');
    //queryInterface.send.fetchMock.mock('http://nodomain12345.info', { body: { verybad: '100' }, status: 200 });
    await expect(queryInterface.send('http://omnihost', {})).rejects.toMatchObject(jsonResponse);
  });
  it('401 Error', async () => {
    fetchMock.get('http://omnihost', 401, { overwriteRoutes: true });
    const jsonResponse = JSON.parse('{"status": 401, "statusText": "Unauthorized", "url": "http://omnihost/"}');
    //queryInterface.send.fetchMock.mock('http://nodomain12345.info', { body: { verybad: '100' }, status: 200 });
    await expect(queryInterface.send('http://omnihost', {})).rejects.toMatchObject(jsonResponse);
  });
});
