import { InternalAxiosRequestConfig } from 'axios';

export interface Callback {
  ([...res]: any): void;
}

export interface Config {
  url?: string;
  baseURL?: string;
  timeout?: number;
  method?: string;
  [key: string]: any;
}

export interface CustomRequestConfig extends InternalAxiosRequestConfig {
  metaData?: {
    startTime: number;
    traceId?: string;
  };
}
