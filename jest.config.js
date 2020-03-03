// Test configuration for Jest
module.exports = {
  moduleFileExtensions: ['js', 'ts', 'json'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};
