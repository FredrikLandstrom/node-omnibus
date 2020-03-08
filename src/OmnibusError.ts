export const ErrorTypes: { [index: string]: { message: string; explanation: string } } = {
  DESTROYFILTERMISSING: {
    message: 'Parameter for destroy missing',
    explanation: 'Filter is required. To delete evertything, supply filter: {}',
  },
  INCORRECTENDPOINTFORMAT: {
    message: 'Incorrect Endpoint format',
    explanation: 'Should be in format database/table or database.table',
  },
  PARAMETERMISSING: {
    message: 'Parameter missing',
    explanation: 'Required parameters are {host:, port:, user: , password: }',
  },
  ERRORINSYNC: {
    message: 'Error in sync',
    explanation: 'This could be any connection paramaeter to the objectserver or network problem.',
  },
  UPDATEPARAMETERMISSING: {
    message: 'Parameter for update missing',
    explanation: 'Add parameter update: {Field: "value", Field: "value"}',
  },
  UPDATEFILTERMISSING: {
    message: 'Parameter for update missing',
    explanation: 'Filter is required. To update evertything, supply filter: {}',
  },
};

export class OmnibusError extends Error {
  explanation: string = '';
  constructor(public errorType: string, public errorDetail?: string) {
    super(errorType);
    if (Object.keys(ErrorTypes).includes(errorType)) {
      this.name = errorType;
      // If there are details supplied with the error, add them to the errormessage
      if (errorDetail) {
        this.message = `${ErrorTypes[errorType].message} : ${errorDetail}`;
      } else {
        this.message = `${ErrorTypes[errorType].message}`;
      }
      this.explanation = ErrorTypes[errorType].explanation;
    } else {
      errorDetail ? (this.message = errorDetail) : (this.message = `${errorType}`);
      errorDetail ? (this.name = `${errorType}`) : (this.name = 'UNDEFINED_ERROR');
      this.explanation = 'UNDEFINED_ERROR';
    }
  }
}
