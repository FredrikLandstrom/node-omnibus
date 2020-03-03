import { OmnibusQueryInterface } from './OmnibusQueryInterface';
import { OmnibusError } from './OmnibusError';

export interface OmnibusQueryParameters {
  filter?: string;
  collist?: string;
  orderby?: string;
}

export interface OmnibusConnectionParameters {
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  SSLEnable?: boolean;
  SSLRejectUnauthorized?: boolean;
}

export class OmnibusQueryGenerator {
  _queryPath: string = '';
  _url: URL = new URL('http://default.com');
  _requestBody: string = '';
  _parameters: OmnibusConnectionParameters = {};
  _httpAuth: string = '';
  _requestInit: RequestInit = {};
  queryInterface: OmnibusQueryInterface;

  constructor(public fetch: Function) {
    this.queryInterface = new OmnibusQueryInterface(fetch);
  }

  setQueryPath(_queryPath: string): OmnibusQueryGenerator {
    // Converting the queryPath to URL pathname format, example:
    // alerts.status => alerts/status
    // alerts/status => alerts/status (no change)

    // Custom Error object
    let throwError = (message: string): Error => {
      throw new OmnibusError(message);
    };

    // In no endpoint is set, set to default
    !_queryPath || _queryPath === '' ? (_queryPath = 'alerts.status') : null;

    // Validate queryPath format and set pathname or throw error
    const queryPathFormat = /^\w+[\.\/]\w+$/;

    if (queryPathFormat.test(_queryPath)) {
      this._queryPath = _queryPath.replace(/\./, '/');
      this._url.pathname = `objectserver/restapi/${this._queryPath}`;
    } else {
      throwError('Incorrect endpoint formtat');
    }
    return this;
  }

  get getUrl(): string {
    return this._url.href;
  }

  setRequestInit(parameters: RequestInit): OmnibusQueryGenerator {
    parameters = parameters || {};
    return this;
  }

  setAttributes(parameters: OmnibusConnectionParameters): OmnibusQueryGenerator {
    parameters = parameters || {};
    Object.assign(this._parameters, parameters);

    // Custom Error object
    let throwError = (message: string): Error => {
      throw new OmnibusError(message);
    };

    // Set SSLRejectUnauthorized parameter if not set
    !this._parameters.SSLRejectUnauthorized
      ? (this._parameters.SSLRejectUnauthorized = false)
      : (this._parameters.SSLRejectUnauthorized = true);

    // If SSLEnable, use https:// during request, otherwise http://
    this._parameters.SSLEnable ? (this._url.protocol = 'https') : (this._url.protocol = 'http');

    // Set port if available or set default '8080'
    this._parameters.port ? (this._url.port = this._parameters.port) : throwError('Parameter port is required');

    this._parameters.host ? (this._url.hostname = this._parameters.host) : throwError('Parameter host is required');

    // Create the HTTP Authentication headers
    if (!parameters.user) {
      throwError('Parameter user is required');
    } else {
      this._httpAuth =
        'Basic ' + Buffer.from(this._parameters.user + ':' + this._parameters.password).toString('base64');
    }

    // Set the default path
    this._url.pathname = '/objectserver/restapi';

    // Init the requestInit Parameter
    this._requestInit.method = 'get';
    this._requestInit.headers = {
      Host: 'localhost',
      Authorization: this._httpAuth,
      'Content-Type': 'application/json',
    };
    this._requestInit.rejectUnauthorized = this._parameters.SSLRejectUnauthorized;

    return this;
  }

  find(findstring: string): OmnibusQueryGenerator {
    // Performs the a query of method GET
    return this;
  }
  remove(findstring: string): OmnibusQueryGenerator {
    // Performs the query of method DELETE
    return this;
  }
  update(findstring: string): OmnibusQueryGenerator {
    // Performs the query of method UPDATE
    return this;
  }
  add(findstring: string): OmnibusQueryGenerator {
    // Performs the query of method PUT
    return this;
  }

  cols(columns: string[]): OmnibusQueryGenerator {
    // Limit colums to be returned
    return this;
  }

  order(order: string): OmnibusQueryGenerator {
    // Set the order
    return this;
  }

  sqlFactory(sqlQuery: string): Promise<{}> {
    this.setQueryPath('sql/factory');
    this._requestInit.method = 'post';
    this._requestInit.body = JSON.stringify({
      sqlcmd: sqlQuery,
    });
    return this.queryInterface.send(this._url.href, this._requestInit);
  }
}
