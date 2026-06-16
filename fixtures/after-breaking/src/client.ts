export interface ClientOptions {
  endpoint: string;
  token: string;
}

export function createClient(options: ClientOptions, timeoutMs: number): { endpoint: string; timeoutMs: number } {
  return { endpoint: options.endpoint, timeoutMs };
}
