import { behaviorStack } from '../../../core/types';

export enum mechanismType {
  JS = 'js',
  RS = 'resource',
  UJ = 'unhandledrejection',
  HTTP = 'http',
  CS = 'cors',
  REACT = 'react',
}

export interface ExceptionMetrics {
  mechanism: object;
  message: string;
  type: string;
  stackTrace?: object;
  pageInformation?: object;
  breadcrumbs?: Array<behaviorStack>;
  errorUid: string;
  meta: { [key: string]: unknown };
  timestamp?: number;
  url?: string;
  userAgent?: string;
  platform?: string;
}

export interface ResourceErrorTarget {
  src?: string;
  tagName?: string;
  outerHTML?: string;
}

export interface httpMetrics {
  method: string;
  url: string | URL;
  body: Document | XMLHttpRequestBodyInit | null | undefined | ReadableStream;
  requestTime: number;
  responseTime: number;
  status: number;
  statusText: string;
  response?: { [key: string]: unknown };
}
