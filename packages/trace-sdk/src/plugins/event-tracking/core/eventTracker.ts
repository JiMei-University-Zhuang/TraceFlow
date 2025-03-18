//监控页面的事件 负责记录和跟踪页面的事件

import { OriginInformation } from '../types';

// 派发出新的 Event
const wr = (type: keyof History) => {
  const orig = history[type];
  return function (this: unknown, ...args: unknown[]) {
    const rv = orig.apply(this, args);
    const e = new Event(type);
    window.dispatchEvent(e);
    return rv;
  };
};

export const wrHistory = (): void => {
  history.pushState = wr('pushState');
  history.replaceState = wr('replaceState');
};

export const proxyHistory = (handler: (event: Event) => void): void => {
  //添加replaceState的监听
  window.addEventListener('replaceState', e => handler(e), true);
  //添加pushState的监听
  window.addEventListener('pushState', e => handler(e), true);
};
export const proxyHash = (handler: (event: Event) => void): void => {
  //添加对hashchange的监听
  window.addEventListener('hashchange', e => handler(e), true);
  //添加对propstate的监听 浏览器回退或前进时添加
  window.addEventListener('popstate', e => handler(e), true);
};

// 返回OI用户来源信息
export const getOriginInfo = (): OriginInformation => {
  let type = '';
  // 获取页面的导航类型
  const navigationEntries = performance.getEntriesByType('navigation');
  if (navigationEntries.length > 0) {
    // 数组中的第一个条目就是当前页面的导航数据。
    const navTiming = navigationEntries[0] as PerformanceNavigationTiming;
    type = navTiming.type; // type 可以是 "navigate"、"reload"、"back_forward"、"reserved" 等
  }
  return {
    // 可以获取用户的来源信息
    referrer: document.referrer,
    type: type || '',
  };
};
