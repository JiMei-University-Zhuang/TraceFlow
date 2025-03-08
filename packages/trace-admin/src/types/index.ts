//性能指标定义：

//性能四指标+首屏渲染
export interface PerformanceMetric {
  timestamp: number;
  FP: number;
  FCP: number;
  LCP: number;
  CLS: number;
  firstScreenTime: number;
}

//接口请求耗时：
export interface ApiRequest {
  timestamp: number;
  url: string;
  duration: number;
  method: string;
  status: number;
}

//资源加载耗时
export interface ResourceLoad {
  timestamp: number;
  url: string;
  type: string;
  duration: number;
  size: number;
}
