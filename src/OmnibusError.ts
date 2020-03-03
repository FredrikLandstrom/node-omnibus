export class OmnibusError extends Error {
  constructor(public message: string) {
    super(message);
    this.message = `❌ ${message}`;
    Error.stackTraceLimit = 1;
    this.name = 'OmnibusConnectionError';
  }
}
