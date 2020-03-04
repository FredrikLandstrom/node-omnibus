import { OmnibusQueryGenerator, OmnibusConnectionParameters } from '../src/OmnibusQueryGenerator';

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

describe('Omnibus Query Class - Enpoint tests', () => {
  const testQuery = new OmnibusQueryGenerator(fakeFetch);
  test('should throw if format is not.db.table or db/table', () => {
    expect(() => {
      testQuery.setQueryPath('/alerts/status/thisiswrowng');
    }).toThrow('Incorrect endpoint formtat');
    expect(() => {
      testQuery.setQueryPath('alerts.status.thisiswrowng');
    }).toThrow('Incorrect endpoint formtat');
    expect(() => {
      testQuery.setQueryPath('alerts');
    }).toThrow('Incorrect endpoint formtat');
    expect(() => {
      testQuery.setQueryPath('alerts_status');
    }).toThrow('Incorrect endpoint formtat');
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
