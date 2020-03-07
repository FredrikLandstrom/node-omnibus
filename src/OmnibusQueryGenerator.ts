import { OmnibusQueryInterface } from './OmnibusQueryInterface';
import { OmnibusError } from './OmnibusError';

export interface OmnibusQueryParameters {
  filter?: {};
  collist?: string[];
  orderby?: {};
  update?: OmnibusField;
}

export interface OmnibusConnectionParameters {
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  SSLEnable?: boolean;
  SSLRejectUnauthorized?: boolean;
}

export interface OmnibusResponse {
  rowset?: {
    osname: string;
    dbname: string;
    tblname: string;
    affectedRows: number;
    coldesc: [{}];
    rows: [{}];
  };
}

export interface OmnibusSearchParams {
  filter: string;
  collist: string;
  orderby: string;
}

export interface OmnibusModel {
  [index: string]: string;
}

export interface OmnibusField {
  [index: string]: any;
}

export type ColumnDefinition = {
  name: string;
  type: string;
};

export interface OmnibusPayload {
  rowset: {
    coldesc: { name: string; type: string }[];
    rows: { [index: string]: any }[];
    affectedRows: number;
  };
}

export interface OmnibusFilter {
  [index: string]: any;
}

export class OmnibusQueryGenerator {
  private _queryPath: string = '';
  private _url: URL = new URL('http://default.com');
  private _parameters: OmnibusConnectionParameters = {};
  private _httpAuth: string = '';
  private _requestInit: RequestInit = {};

  private _model = <OmnibusModel>{};

  private _queryInterface: OmnibusQueryInterface;

  constructor(public fetch: Function) {
    this._queryInterface = new OmnibusQueryInterface(this.fetch);
  }

  async syncModel(): Promise<OmnibusModel> {
    // syncs the _model
    // _model contains all the columns of the selected querypath, used for update and insert
    // Query with a query that doesn't recieve any answer ('AlertGroup="#SYNCREQUEST FROM NODE-OMNIBUS"');
    const _queryParams = {
      filter: { AlertGroup: '#SYNCREQUEST FROM NODE-OMNIBUS' },
    };

    // request
    this._requestInit.method = 'get';
    return this.find(_queryParams)
      .then(res => {
        if (res.rowset) {
          res.rowset.coldesc.forEach((value: any, index, array) => {
            this._model[value.name] = value.type;
          });
          return Promise.resolve(this._model);
        } else {
          return Promise.reject({
            url: this._url.href,
            status: 'ERRORINSYNC',
            statusText: 'Error in sync with the objectserver',
          });
        }
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }

  setQueryPath(_queryPath: string): OmnibusQueryGenerator {
    // Converting the queryPath to URL pathname format, example:
    // alerts.status => alerts/status
    // alerts/status => alerts/status (no change)

    // In no endpoint is set, set to default
    !_queryPath || _queryPath === '' ? (_queryPath = 'alerts.status') : null;

    // Validate queryPath format and set pathname or throw error
    const queryPathFormat = /^\w+[\.\/]\w+$/;

    if (queryPathFormat.test(_queryPath)) {
      this._queryPath = _queryPath.replace(/\./, '/');
      this._url.pathname = `objectserver/restapi/${this._queryPath}`;
    } else {
      throw new OmnibusError('INCORRECTENDPOINTFORMAT', `supplied path [${_queryPath}] is incorrect`);
    }
    return this;
  }

  get getUrl(): string {
    return this._url.href;
  }

  async getModel(): Promise<OmnibusModel> {
    if (Object.entries(this._model).length === 0) {
      return Promise.resolve(this.syncModel());
    } else {
      return Promise.resolve(this._model);
    }
  }

  setRequestInit(parameters: RequestInit): OmnibusQueryGenerator {
    parameters = parameters || {};
    return this;
  }

  setAttributes(parameters: OmnibusConnectionParameters): OmnibusQueryGenerator {
    parameters = parameters || {};
    Object.assign(this._parameters, parameters);

    let throwError = (errorType: string, shortMessage?: string) => {
      throw new OmnibusError(errorType, shortMessage);
    };

    // Set SSLRejectUnauthorized parameter if not set
    !this._parameters.SSLRejectUnauthorized
      ? (this._parameters.SSLRejectUnauthorized = false)
      : (this._parameters.SSLRejectUnauthorized = true);

    // If SSLEnable, use https:// during request, otherwise http://
    this._parameters.SSLEnable ? (this._url.protocol = 'https') : (this._url.protocol = 'http');

    // Set port if available or set default '8080'
    this._parameters.port
      ? (this._url.port = this._parameters.port)
      : throwError('PARAMETERMISSING', 'Parameter port is missing');

    this._parameters.host
      ? (this._url.hostname = this._parameters.host)
      : throwError('PARAMETERMISSING', 'Parameter host is missing');

    // Create the HTTP Authentication headers
    if (!this._parameters.user) {
      throwError('PARAMETERMISSING', 'Parameter user is missing');
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

    // sync model
    // this.syncModel();

    return this;
  }

  get getAttributes(): Object {
    // Returns the parameters for the connection
    return this._parameters;
  }

  async find(queryparams: OmnibusQueryParameters): Promise<OmnibusResponse> {
    // performs the a query of method GET

    let _omnibusSearchParams = this.constructSearchParams(queryparams);
    this._url.searchParams.append('filter', _omnibusSearchParams.filter);
    this._url.searchParams.append('collist', _omnibusSearchParams.collist);
    this._url.searchParams.append('orderby', _omnibusSearchParams.orderby);

    // we are performing a get, no need for body
    this._requestInit.method = 'get';
    this._requestInit.body = null;

    // request
    return this._queryInterface.send(this._url.href, this._requestInit);
  }

  destroy(queryparams: OmnibusQueryParameters): Promise<OmnibusResponse> {
    // performs the query of method DELETE

    if (!queryparams) {
      // Query params is required
      return Promise.reject('ERROR: You need filter as a parameter to .destroy()');
    }

    if (!queryparams.filter) {
      // Do not delete everything from the OS, require a filter
      return Promise.reject(new OmnibusError('DESTROYFILTERMISSING', 'Parameter "filter" is missing'));
    }

    let _omnibusSearchParams = this.constructSearchParams(queryparams);
    this._url.searchParams.append('filter', _omnibusSearchParams.filter);

    // Perform a PATCH request (update)
    this._requestInit.method = 'delete';

    // Make request to the Objectserver

    return this._queryInterface.send(this._url.href, this._requestInit);
  }

  async update(queryparams: OmnibusQueryParameters): Promise<OmnibusResponse> {
    // Check if update statement was sent
    let _payload = <OmnibusPayload>{};

    if (!queryparams) {
      throw new OmnibusError('UPDATEPARAMETERMISSING', '.update() is missing required parameters');
    }

    if (queryparams.update) {
      _payload = await this.constructPayload(queryparams.update);
    } else {
      throw new OmnibusError('UPDATEPARAMETERMISSING', '.update() is missing required parameters');
    }

    let _omnibusSearchParams = this.constructSearchParams(queryparams);

    this._url.searchParams.append('filter', _omnibusSearchParams.filter);

    // Perform a PATCH request (update)
    this._requestInit.method = 'patch';

    // Add the payload (what to insert to the body)
    this._requestInit.body = JSON.stringify(_payload, null, 2);

    // Make request to the Objectserver
    return this._queryInterface.send(this._url.href, this._requestInit);
  }

  async insert(fields: OmnibusField): Promise<OmnibusResponse> {
    if (!fields) {
      return Promise.reject(new OmnibusError('INSERTPARAMETERMISSING', '.insert() is missing required parameters'));
    }
    const _payload = await this.constructPayload(fields);

    // Remove search params from the URL in case they exist
    this._url.search = '';

    // Perform a POST request (INSERT)
    this._requestInit.method = 'post';

    // Add the payload (what to insert to the body)
    this._requestInit.body = JSON.stringify(_payload, null, 2);

    // Make request to the Objectserver
    return this._queryInterface.send(this._url.href, this._requestInit);
  }

  sqlFactory(sqlQuery: string): Promise<OmnibusResponse> {
    // create a temporary URL object not to mess with users endpoint
    const { protocol, host, port } = this._url;
    const _sqlFactoryUrl = `${protocol}//${host}/objectserver/restapi/sql/factory`;

    // send query in the body
    this._requestInit.method = 'post';
    this._requestInit.body = JSON.stringify({
      sqlcmd: sqlQuery,
    });

    // request
    return this._queryInterface.send(_sqlFactoryUrl, this._requestInit);
  }

  async constructPayload(fields: OmnibusField): Promise<OmnibusPayload> {
    let _rows = <OmnibusField>{};
    //let _coldesc: ColumnDefinition[] = [];
    let _coldesc = <ColumnDefinition[]>[];

    // get the model
    const model = await this.getModel();

    // Construct the coldesc and rows that are required for an POST Request
    Object.entries(fields).forEach(field => {
      // Check if field is valid
      const _key = field[0]; // ex. Summary, Node
      const _value = field[1]; // Value of key
      _rows[_key] = _value;
      _coldesc.push({ name: _key, type: model[_key] }); // {Name: 'Summary', type: 'string'}
    });

    const _payload = {
      rowset: {
        coldesc: _coldesc,
        rows: [_rows],
        affectedRows: 0,
      },
    };

    return Promise.resolve(_payload);
  }

  constructSearchParams(queryparams: OmnibusQueryParameters): OmnibusSearchParams {
    // just in case no queryparams were supplied, create a local object
    let _queryparams: OmnibusQueryParameters = {};
    let _filter = '';
    let _collist = '';
    let _orderby = '';

    Object.assign(_queryparams, queryparams);

    // check if a filter is supplied
    if (_queryparams.filter) {
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
      _collist = _queryparams.collist.toString();
    }

    // check if a orderby is supplied
    if (_queryparams.orderby) {
      let _orderby = ''; // default
      for (let [key, value] of Object.entries(_queryparams.orderby)) {
        _orderby = `${key} ${value}`;
      }
    }

    return {
      filter: _filter,
      collist: _collist,
      orderby: _orderby,
    };
  }
}
