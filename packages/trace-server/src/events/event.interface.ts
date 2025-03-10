export interface TraceEvent {
  // 事件类型
  type: string;
  // 事件发生时间
  timestamp: number;
  // 事件来源页面URL
  url: string;
  // 用户标识
  userId?: string;
  // 会话标识
  sessionId?: string;
  // 事件相关的额外数据
  data?: Record<string, any>;
}
