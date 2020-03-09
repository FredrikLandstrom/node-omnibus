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
    // Syncronize local model with ObjectServer
    return this.queryGenerator.syncModel();
  }

  setQueryPath(queryPath: string): OmnibusQueryGenerator {
    // Sets or updates the queryPath. Ex alerts/status
    return this.queryGenerator.setQueryPath(queryPath);
  }

  setAttributes(parameters: OmnibusConnectionParameters): OmnibusQueryGenerator {
    // Set or update connection parameters
    return this.queryGenerator.setAttributes(parameters);
  }

  getAttributes(): OmnibusConnectionParameters {
    // Get all the connection parameters
    return this.queryGenerator.getAttributes();
  }

  getUrl(): string {
    // Get the last/current Url
    return this.queryGenerator.getUrl();
  }

  getModel(): Promise<OmnibusModel> {
    // Get the locally stored data-model
    return this.queryGenerator.getModel();
  }

  async find(queryparams: OmnibusQueryParameters): Promise<OmnibusResponse> {
    // Performs the query of method GET
    return this.queryGenerator.find(queryparams);
  }

  async destroy(queryparams: OmnibusQueryParameters): Promise<OmnibusResponse> {
    // Performs the query of method DELETE
    return this.queryGenerator.destroy(queryparams);
  }

  async update(queryparams: OmnibusQueryParameters): Promise<OmnibusResponse> {
    // Performs the query of method UPDATE
    return this.queryGenerator.update(queryparams);
  }

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
