import { OmnibusQueryGenerator, OmnibusConnectionParameters } from './OmnibusQueryGenerator';

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

  find(findparameter: string): OmnibusQueryGenerator {
    // This will return the actual find
    return this.queryGenerator.find(findparameter);
  }

  remove(findstring: string): OmnibusQueryGenerator {
    // Performs the query of method DELETE
    return this.queryGenerator.remove(findstring);
  }
  update(findstring: string): OmnibusQueryGenerator {
    // Performs the query of method UPDATE
    return this.queryGenerator.update(findstring);
  }
  add(findstring: string): OmnibusQueryGenerator {
    // Performs the query of method PUT
    return this.queryGenerator.add(findstring);
  }

  cols(columns: string[]): OmnibusQueryGenerator {
    // Filter which fields should be returned
    return this.queryGenerator.cols(columns);
  }

  order(order: string): OmnibusQueryGenerator {
    // Sets the sort order
    return this.queryGenerator.order(order);
  }

  sqlFactory(sqlQuery: string): Promise<{}> {
    // Send SQL query direct to the connection
    return this.queryGenerator.sqlFactory(sqlQuery);
  }
}
