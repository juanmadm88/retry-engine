import { CacheStore } from '@nestjs/cache-manager';
export type TypeCall = {
  request: string;
  response: string;
};

export type Error = {
  code?: any;
  message?: any;
  status?: any;
  response?: {
    status: any;
  };
};

export interface CacheConnectionOptions {
  store: CacheStore;
  host: string;
  password: string;
  port: number;
  tls?: any;
}
