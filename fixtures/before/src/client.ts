export interface ClientOptions {
  endpoint: string;
  token?: string;
}

export function createClient(options: ClientOptions): { endpoint: string } {
  return { endpoint: options.endpoint };
}
