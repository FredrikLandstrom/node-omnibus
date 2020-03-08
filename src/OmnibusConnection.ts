import {
  OmnibusQueryGenerator,
  OmnibusQueryParameters,
  OmnibusConnectionParameters,
  OmnibusModel,
  OmnibusResponse,
} from './OmnibusQueryGenerator';

export default class OmnibusConnection {
  queryGenerator: OmnibusQueryGenerator;

  constructor(public fetch: Function, public parameters: OmnibusConnectionParameters) {
    this.queryGenerator = new OmnibusQueryGenerator(fetch);
    this.queryGenerator.setAttributes(parameters);
  }

  async syncModel(): Promise<OmnibusModel> {
    return this.queryGenerator.syncModel();
  }

  setQueryPath(queryPath: string): OmnibusQueryGenerator {
    return this.queryGenerator.setQueryPath(queryPath);
    // Sets the queryPath. Ex alerts/status on the queryGenerator object
  }

  setAttributes(parameters: OmnibusConnectionParameters): OmnibusQueryGenerator {
    return this.queryGenerator.setAttributes(parameters);
    // Set connection parameters on the queryGenerator object
  }

  getAttributes(): OmnibusConnectionParameters {
    return this.queryGenerator.getAttributes();
    // Returns all the connection parameters from the queryGenerator object
  }

  getUrl(): string {
    return this.queryGenerator.getUrl();
  }

  getModel(): Promise<OmnibusModel> {
    return this.queryGenerator.getModel();
  }

  async find(queryparams: OmnibusQueryParameters): Promise<OmnibusResponse> {
    // This will return the actual find
    return this.queryGenerator.find(queryparams);
  }

  async destroy(queryparams: OmnibusQueryParameters): Promise<OmnibusResponse> {
    return this.queryGenerator.destroy(queryparams);
  }

  async update(queryparams: OmnibusQueryParameters): Promise<OmnibusResponse> {
    // Performs the query of method UPDATE
    return this.queryGenerator.update(queryparams);
  }

  // Fix TYPE to OmnibusResponseObject
  async insert(insertFields: { [index: string]: any }): Promise<OmnibusResponse> {
    // Performs the query of method PUT
    return this.queryGenerator.insert(insertFields);
  }

  sqlFactory(sqlQuery: string): Promise<OmnibusResponse> {
    // Send SQL query direct to the connection
    return this.queryGenerator.sqlFactory(sqlQuery);
  }

  // Fallback for users of old library
  query(sqlQuery: string): Promise<OmnibusResponse> {
    console.warn('Function query is deprecated.');
    return this.queryGenerator.sqlFactory(sqlQuery);
  }

  // Fallback for users of old library
  sqlCommand(sqlQuery: string): Promise<OmnibusResponse> {
    console.warn('Function sqlQuery is deprecated');
    return this.queryGenerator.sqlFactory(sqlQuery);
  }
}
