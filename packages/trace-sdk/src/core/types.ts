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
}

// 用户行为记录
export interface behaviorStack {
  name: string;
  page: string;
  timeStamp: number | string;
  value: Record<string, any>;
}

export interface OriginInformation {
  referrer: string;
  type: number | string;
}
