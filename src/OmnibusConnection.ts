import { OmnibusQueryGenerator, OmnibusQueryParams, OmnibusConnectionParameters } from './OmnibusQueryGenerator';

export default class OmnibusConnection {
  queryGenerator: OmnibusQueryGenerator;

  constructor(public fetch: Function, public parameters: OmnibusConnectionParameters) {
    this.queryGenerator = new OmnibusQueryGenerator(fetch);
    this.queryGenerator.setAttributes(parameters);
  }

  setQueryPath(queryPath: string): OmnibusQueryGenerator {
    return this.queryGenerator.setQueryPath(queryPath);
    // Sets the queryPath. Ex alerts/status on the queryGenerator object
  }

  setAttributes(parameters: OmnibusConnectionParameters): OmnibusQueryGenerator {
    return this.queryGenerator.setAttributes(parameters);
    // Set connection parameters on the queryGenerator object
  }

  get getAttributes(): OmnibusConnectionParameters {
    return this.queryGenerator.getAttributes;
    // Returns all the connection parameters from the queryGenerator object
  }

  get getUrl(): string {
    return this.queryGenerator.getUrl;
  }

  find(queryparams: OmnibusQueryParams): Promise<{}> {
    // This will return the actual find
    return this.queryGenerator.find(queryparams);
  }

  destroy(findstring: string): OmnibusQueryGenerator {
    // Performs the query of method DELETE
    return this.queryGenerator.destroy(findstring);
  }
  update(findstring: string): OmnibusQueryGenerator {
    // Performs the query of method UPDATE
    return this.queryGenerator.update(findstring);
  }
  insert(findstring: string): OmnibusQueryGenerator {
    // Performs the query of method PUT
    return this.queryGenerator.insert(findstring);
  }

  sqlFactory(sqlQuery: string): Promise<{}> {
    // Send SQL query direct to the connection
    return this.queryGenerator.sqlFactory(sqlQuery);
  }
}
