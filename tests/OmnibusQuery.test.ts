import { OmnibusQueryGenerator } from '../src/OmnibusQueryGenerator';

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
});
