//监控页面的事件
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
