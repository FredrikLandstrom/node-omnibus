import OmnibusConnection from './OmnibusConnection';
import { OmnibusConnectionParameters } from './OmnibusQueryGenerator';
import { OmnibusError } from './OmnibusError';
import fetch from 'node-fetch';

export function createConnection(parameters: OmnibusConnectionParameters): OmnibusConnection {
  const omnibusConnection = new OmnibusConnection(fetch, parameters);
  return omnibusConnection;
}
