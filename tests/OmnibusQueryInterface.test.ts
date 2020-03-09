import { OmnibusQueryInterface } from '../src/OmnibusQueryInterface';

var fs = require('fs');

const fetchMock = require('fetch-mock').sandbox();
const omnibusSuccessGetJSON = JSON.parse(fs.readFileSync('./tests/datafiles/fetchOMNIbusGetResponse.json', 'utf8'));

fetchMock
  .mock('http://omnibus400Error', 400, { overwriteRoutes: true })
  .mock({
    url: 'http://omnibus401Error',
    status: 401,
    response: Promise.reject({ status: 401, statusText: 'Unauthorized' }),
    overwriteRoutes: true,
  })
  .mock({ url: 'http://omnibusSuccess', response: omnibusSuccessGetJSON, overwriteRoutes: false })
  .mock({
    url: 'http://omnibusFailStatus',
    response: Promise.reject({
      url: 'http://omnibusFailStatus/',
      status: 'Unknown error',
      statusText: 'Unknown Error',
    }),
    overwriteRoutes: false,
  })
  .mock({
    url: 'http://omnibusFailType',
    response: Promise.reject({
      code: 'CONNECTIONREFUSED',
      type: 'system',
      message: 'connection refused',
    }),
    overwriteRoutes: false,
  })
  .mock({
    url: 'http://omnibusFailOther',
    response: Promise.reject({
      url: 'http://omnibusFailOther/',
      unknownparameter: 'unknownsystem',
      statusText: 'Unknown Error',
    }),
    overwriteRoutes: false,
  });

const queryInterface = new OmnibusQueryInterface(fetchMock);

const connection = describe('Omnibus QueryInterface Class', () => {
  it('should work', async () => {
    await expect(queryInterface.send('http://omnibusSuccess', {})).resolves.toMatchObject(omnibusSuccessGetJSON);
  });

  it('Objectserver 400 Error', async () => {
    const jsonResponse = JSON.parse('{"status": 400, "statusText": "Bad Request"}');
    await expect(queryInterface.send('http://omnibus400Error', {})).rejects.toMatchObject(jsonResponse);
  });

  it('Objectserver 401 Error', async () => {
    const jsonResponse = JSON.parse('{"status": 401, "statusText": "Unauthorized"}');
    await expect(queryInterface.send('http://omnibus401Error', {})).rejects.toMatchObject(jsonResponse);
  });

  it('Fetch error - status', async () => {
    const jsonResponse = JSON.parse(
      '{"status": "Unknown error", "statusText": "Unknown Error", "url": "http://omnibusFailStatus/"}',
    );
    await expect(queryInterface.send('http://omnibusFailStatus', {})).rejects.toMatchObject(jsonResponse);
  });
  it('Fetch error -type', async () => {
    const jsonResponse = JSON.parse(
      '{"status": "CONNECTIONREFUSED", "statusText": "connection refused", "url": "http://omnibusFailType"}',
    );
    await expect(queryInterface.send('http://omnibusFailType', {})).rejects.toMatchObject(jsonResponse);
  });
  it('Fetch error -other', async () => {
    const jsonResponse = {
      status: 'ERROR UNKNOWN',
      statusText: {
        url: 'http://omnibusFailOther/',
        unknownparameter: 'unknownsystem',
        statusText: 'Unknown Error',
      },
    };
    await expect(queryInterface.send('http://omnibusFailOther', {})).rejects.toMatchObject(jsonResponse);
  });
});
