import { PageInformation, TagInfo } from '../types';

// 基础类
export interface IMetrics {
  jumpType?: string; // 事件类型，如 "click" | "keydown"
  timeStamp: number; // 时间戳（毫秒）
  pageInfo: PageInformation;
  tagInfo?: TagInfo;
}

export class UserMetricsStore {
  private metrics: Map<string, IMetrics>; // 使用 Map 存储数据，key 为 name 字段

  constructor() {
    this.metrics = new Map();
  }

  // 使用 name 作为 key 添加数据
  set(name: string, metric: IMetrics): void {
    this.metrics.set(name, metric); // 将 metric 存储到 Map 中
  }

  // 获取某个 name 对应的数据
  get(name: string): IMetrics | undefined {
    return this.metrics.get(name); // 根据 name 获取数据
  }

  // 获取所有存储的 metrics 数据
  getAll(): IMetrics[] {
    return Array.from(this.metrics.values()); // 返回所有的 values（IMetrics 数据）
  }
}
