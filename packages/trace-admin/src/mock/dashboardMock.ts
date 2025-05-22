// 仪表盘模拟数据文件

// 错误状态对应的标签颜色
export const statusColors = {
  critical: '#ff4d4f',
  high: '#ff7a45',
  medium: '#faad14',
  low: '#52c41a',
};

// 最近错误的模拟数据
export const recentErrorsData = [
  {
    key: '1',
    type: 'JavaScript',
    message: 'Uncaught TypeError: Cannot read property "length" of undefined',
    url: '/user/profile',
    time: '2分钟前',
    browser: 'Chrome 98.0.4758',
    status: 'critical',
  },
  {
    key: '2',
    type: 'Network',
    message: 'Failed to load resource: the server responded with a status of 503',
    url: '/api/users',
    time: '15分钟前',
    browser: 'Safari 15.4',
    status: 'high',
  },
  {
    key: '3',
    type: 'Promise',
    message: 'Uncaught (in promise) SyntaxError: Unexpected token < in JSON at position 0',
    url: '/dashboard',
    time: '42分钟前',
    browser: 'Firefox 97.0.1',
    status: 'medium',
  },
  {
    key: '4',
    type: 'React',
    message: 'Invalid hook call. Hooks can only be called inside of the body of a function component',
    url: '/products',
    time: '1小时前',
    browser: 'Edge 99.0.1150',
    status: 'low',
  },
];

// 性能趋势的模拟数据
export const performanceData = [
  { day: '周一', loadTime: 1.2, apiResponseTime: 0.4, renderTime: 0.8 },
  { day: '周二', loadTime: 1.5, apiResponseTime: 0.5, renderTime: 1.0 },
  { day: '周三', loadTime: 1.3, apiResponseTime: 0.4, renderTime: 0.9 },
  { day: '周四', loadTime: 2.0, apiResponseTime: 0.7, renderTime: 1.3 },
  { day: '周五', loadTime: 1.8, apiResponseTime: 0.6, renderTime: 1.2 },
  { day: '周六', loadTime: 1.4, apiResponseTime: 0.5, renderTime: 0.9 },
  { day: '周日', loadTime: 1.1, apiResponseTime: 0.3, renderTime: 0.8 },
];

// 统计数据
export const statisticsData = {
  errorCount: 128,
  successRate: 99.8,
  avgLoadTime: 1.5,
  activeUsers: 1834,
};
