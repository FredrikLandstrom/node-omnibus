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

export interface OmnibusQueryParams {
  filter?: {};
  collist?: [];
  orderby?: {};
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
    if (!this._parameters.user) {
      throwError('Parameter user is required');
    } else {
      this._httpAuth =
        'Basic ' + Buffer.from(this._parameters.user + ':' + this._parameters.password).toString('base64');
    }

    // Set the default path
    this._url.pathname = '/objectserver/restapi/alerts/status';

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

  get getAttributes(): Object {
    // Returns the parameters for the connection
    return this._parameters;
  }

  find(queryparams: OmnibusQueryParams): Promise<{}> {
    // performs the a query of method GET

    // just in case no queryparams were supplied, create a local object
    let _queryparams: OmnibusQueryParameters = {};
    Object.assign(_queryparams, queryparams);

    // check if a filter is supplied
    if (_queryparams.filter) {
      let _filter = ''; // default empty

      for (let [key, value] of Object.entries(_queryparams.filter)) {
        // if the value is of type string, add quotes
        if (typeof value === 'string') {
          _filter = `${key}='${value}'`;
        } else {
          _filter = `${key}=${value}`;
        }
      }
      // add filter to URL
      this._url.searchParams.append('filter', _filter);
    }

    // check if a collist is supplied
    if (_queryparams.collist) {
      // add collist to URL
      this._url.searchParams.append('collist', _queryparams.collist.toString());
    }

    // check if a orderby is supplied
    if (_queryparams.orderby) {
      let _orderby = ''; // default
      for (let [key, value] of Object.entries(_queryparams.orderby)) {
        _orderby = `${key} ${value}`;
      }
      //add orderby to the URL
      this._url.searchParams.append('orderby', _orderby);
    }

    // we are performing a get, no need for body
    this._requestInit.method = 'get';
    this._requestInit.body = null;

    // request
    return this.queryInterface.send(this._url.href, this._requestInit);
  }

  destroy(findstring: string): OmnibusQueryGenerator {
    // performs the query of method DELETE
    return this;
  }
  update(findstring: string): OmnibusQueryGenerator {
    // performs the query of method UPDATE
    return this;
  }
  insert(findstring: string): OmnibusQueryGenerator {
    // performs the query of method PUT
    return this;
  }

  sqlFactory(sqlQuery: string): Promise<{}> {
    // create a temporary URL object not to mess with users endpoint
    const { protocol, host, port } = this._url;
    const _sqlFactoryUrl = `${protocol}//${host}/objectserver/restapi/sql/factory`;

    // send query in the body
    this._requestInit.method = 'post';
    this._requestInit.body = JSON.stringify({
      sqlcmd: sqlQuery,
    });

    // request
    return this.queryInterface.send(_sqlFactoryUrl, this._requestInit);
  }
}
