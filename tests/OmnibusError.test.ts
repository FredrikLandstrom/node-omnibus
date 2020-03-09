import { OmnibusError, ErrorTypes } from '../src/OmnibusError';

let throwError = (errorType: string, errorMessage?: string) => {
  throw new OmnibusError(errorType, errorMessage);
};

describe('OmnibusError Class', () => {
  const errorTypeKeys = Object.keys(ErrorTypes);
  test('Check if errors are in alphabetical order', () => {
    expect(errorTypeKeys.sort()).toEqual(errorTypeKeys);
  });
  test('Check if correct message is recieved for a random errortype', () => {
    expect.assertions(3);
    const randomErrorTypeKey = errorTypeKeys[Math.floor(Math.random() * errorTypeKeys.length)];

    try {
      throwError(randomErrorTypeKey);
    } catch (error) {
      expect(error).toBeInstanceOf(OmnibusError);
      expect(error).toHaveProperty('message', ErrorTypes[randomErrorTypeKey].message);
      expect(error).toHaveProperty('explanation', ErrorTypes[randomErrorTypeKey].explanation);
    }
  });
  test('Check if correct message is recieved for a unknown errortype', () => {
    const customErrorMessage = 'Unknown error';
    try {
      throwError('THIS_SHOULD_NOT_BE_FOUND_IN_THE_ERRORTYPES', customErrorMessage);
    } catch (error) {
      expect(error).toBeInstanceOf(OmnibusError);
      expect(error).toHaveProperty('message', customErrorMessage);
      expect(error).toHaveProperty('name', 'THIS_SHOULD_NOT_BE_FOUND_IN_THE_ERRORTYPES');
      expect(error).toHaveProperty('explanation', 'UNDEFINED_ERROR');
    }
    try {
      throwError('THIS_SHOULD_NOT_BE_FOUND_IN_THE_ERRORTYPES');
    } catch (error) {
      expect(error).toBeInstanceOf(OmnibusError);
      expect(error).toHaveProperty('message', 'THIS_SHOULD_NOT_BE_FOUND_IN_THE_ERRORTYPES');
      expect(error).toHaveProperty('name', 'UNDEFINED_ERROR');
      expect(error).toHaveProperty('explanation', 'UNDEFINED_ERROR');
    }
  });
});
