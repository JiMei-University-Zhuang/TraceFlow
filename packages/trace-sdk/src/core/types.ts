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

//基础事件类型
export type TrackEvent = {
  eventType: string;
  eventData?: Record<string, any>;
  timestamp: number;
  pageUrl: string;
  userId?: string;
  attempts?: number; //重试次数
};

//上报函数类型
export type ReportHandler = (event: TrackEvent) => void;

//SDK配置类型
export interface TrackerConfig {
  endpoint: Endpoint; //上报地址
  autoTrack?: {
    pageView?: boolean; //自动跟踪页面访问
    click?: boolean; //自动跟踪点击事件
    performance?: boolean; //自动跟踪性能指标
  }; //自动跟踪配置
  userId?: string; //用户id
  reportStrategy?: 'BEACON' | 'XHR' | 'IMG' | 'auto'; //上报策略
}

//上报方法：
export type ReportStrategy = 'BEACON' | 'XHR' | 'IMG';

export type ReportData = {
  type: 'immediate' | 'batch';
  data: Record<string, any>;
};

//上报地址
export type Endpoint = {
  immediate: string;
  batch: string;
};
