//类型定义
//用户行为参数
export enum metricsName {
  PI = 'page-information',
  OI = 'origin-information',
  RCR = 'router-change-record',
  CBR = 'click-behavior-record',
  CDR = 'custom-define-record',
  HT = 'http-record',
}
//用户页面基本信息
export interface PageInformation {
  host: string; //主机名
  href: string; //完整url
  title: string;
  language: string;
  winScreen: string;
  docScreen: string;
  pathname: string;
}

// 用户行为记录
export interface behaviorStack {
  name: metricsName;
  page: string;
  timestamp: number | string;
  value: Record<string, unknown>;
}

export interface OriginInformation {
  referrer: string;
  type: number | string;
}

//基础事件类型
export type TrackEvent = {
  eventType: string;
  eventData?: Record<string, any>;
  timeStamp?: number;
  pageUrl?: string;
  userId?: string;
};

//上报函数类型
export type ReportHandler = (event: TrackEvent) => void;

//SDK配置类型
export interface TrackerConfig {
  report: ReportHandler;
  autoTrack?: {
    pageView?: boolean;
    click?: boolean;
    componentLifeCycle?: boolean;
  };
  userId?: string;
}

// 点击事件返回数据类型
export interface TagInfo {
  id: string | null; // 元素 ID 可能为空
  classList: string[]; // 类名列表
  tagName: string; // 标签名称，如 "button", "div"
  text: string | null; // 文本内容，可能为空
}

/**
 * 定义 HTTP 请求和响应的相关指标信息。
 *
 * @template T 响应数据的类型。
 */
export interface httpMetrics<T = any> {
  /**
   * HTTP 请求的方法，例如 GET、POST、PUT、DELETE 等。
   */
  method: string;

  /**
   * 请求的 URL，可以是普通的字符串类型，也可以是 URL 对象类型。
   */
  url: string | URL;

  /**
   * 请求体，可以是 Document 对象、XMLHttpRequestBodyInit 类型（如 FormData、Blob 等）、null、undefined 或者 ReadableStream 类型。
   */
  body: Document | XMLHttpRequestBodyInit | null | undefined | ReadableStream;

  /**
   * 请求发出的时间，通常是时间戳。
   */
  requestTime: number;

  /**
   * 接收到响应的时间，通常是时间戳。
   */
  responseTime: number;

  /**
   * HTTP 响应的状态码，例如 200、404、500 等。
   */
  status: number;

  /**
   * HTTP 响应的状态文本，例如 OK、Not Found 等。
   */
  statusText: string;

  /**
   * HTTP 响应的内容，使用泛型 T 来指定具体类型。
   */
  response: T;
}

// 传给平台进行展示的数据
export interface visitsData {
  routeInfo: string;
  timeStamp: string;
  httpRequest: string;
  visitTime: string;
}

export type visitsArray = visitsData[];
