import { OmnibusResponse } from './OmnibusQueryGenerator';

export class OmnibusQueryInterface {
  constructor(public fetch: Function) {}

  async send(url: RequestInfo, init?: RequestInit): Promise<OmnibusResponse> {
    return await this.fetch(url, init)
      .then((res: Response) => {
        // Check statuscode
        if (res.status === 200 || res.status === 201) {
          // All ok, continue
          return res.json();
        } else {
          // Something went wrong, construct errormessage
          return this.formatResponse(null, res);
        }
      })
      .then((json: any) => {
        return this.formatResponse(json, null);
      })
      .catch((error: any) => {
        // Check if we have a fetch error by checking if error.status exist
        if (error.status) {
          return this.formatResponse(null, error);
        } else if (error.type && (error.type = 'system')) {
          // This is a NodeJS system error we need to handle differently
          return this.formatResponse(null, {
            url: url.toString(),
            status: error.code,
            statusText: error.message,
          });
        } else {
          // Error type not known.
          return this.formatResponse(null, {
            url: url.toString(),
            status: 'ERROR UKNOWN',
            statusText: JSON.stringify(error, null, 2),
          });
        }
      });
  }

  //{ url: string; status: string | number; statusText: string }
  formatResponse(data: any, error: { url: string; status: string | number; statusText: string } | null): Promise<{}> {
    if (error) {
      return Promise.reject({
        url: error.url,
        status: error.status,
        statusText: error.statusText,
      });
    } else {
      return Promise.resolve(data);
    }
  }
}
