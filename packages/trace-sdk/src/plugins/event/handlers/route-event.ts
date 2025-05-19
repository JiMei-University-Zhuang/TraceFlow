import { EventType } from '../types';

/**
 * 路由事件处理器类型
 */
type RouteEventHandler = (eventType: EventType, event: PopStateEvent | HashChangeEvent | Event, metadata?: Record<string, any>) => void;

/**
 * 保存上一个路由信息
 */
interface RouteInfo {
  path: string;
  query: Record<string, string>;
  hash: string;
  fullUrl: string;
}

/**
 * 初始化路由事件监听
 * @param handler 事件处理函数
 * @returns 移除事件监听的函数
 */
export function initRouteEvent(handler: RouteEventHandler): () => void {
  // 记录当前路由信息
  let prevRoute: RouteInfo = getRouteInfo();
  let initialized = false;

  /**
   * 获取当前路由信息
   */
  function getRouteInfo(): RouteInfo {
    const url = new URL(window.location.href);
    // 解析查询参数
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    return {
      path: url.pathname,
      query,
      hash: url.hash,
      fullUrl: url.href,
    };
  }

  /**
   * 路由变化处理函数
   * @param event 事件对象
   * @param type 触发类型
   */
  const handleRouteChange = (event: PopStateEvent | HashChangeEvent | Event, type: string): void => {
    try {
      const currentRoute = getRouteInfo();

      // 避免重复触发，只有路由确实发生变化才上报
      if (initialized && prevRoute.fullUrl === currentRoute.fullUrl) {
        return;
      }

      // 构建元数据
      const metadata = {
        from: prevRoute.path,
        to: currentRoute.path,
        fromUrl: prevRoute.fullUrl,
        toUrl: currentRoute.fullUrl,
        type, // 触发类型: popstate, hashchange, history等
        timestamp: Date.now(),
      };

      // 更新上一个路由信息
      prevRoute = currentRoute;
      initialized = true;

      // 传递给处理器
      handler(EventType.ROUTE, event, metadata);
    } catch (error) {
      console.error('[TraceSDK][RouteEvent] 处理路由事件错误:', error);
    }
  };

  // 监听popstate事件（浏览器前进后退）
  const handlePopState = (event: PopStateEvent) => {
    handleRouteChange(event, 'popstate');
  };
  window.addEventListener('popstate', handlePopState);

  // 监听hashchange事件
  const handleHashChange = (event: HashChangeEvent) => {
    handleRouteChange(event, 'hashchange');
  };
  window.addEventListener('hashchange', handleHashChange);

  // 重写history API
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    // 先调用原始方法
    originalPushState.apply(this, args);
    // 然后触发自定义的路由变化处理
    handleRouteChange(new Event('pushState'), 'pushState');
  };

  history.replaceState = function (...args) {
    // 先调用原始方法
    originalReplaceState.apply(this, args);
    // 然后触发自定义的路由变化处理
    handleRouteChange(new Event('replaceState'), 'replaceState');
  };

  // 初始化时触发一次，记录首次访问
  setTimeout(() => {
    handleRouteChange(new Event('init'), 'init');
  }, 0);

  // 返回移除监听的函数
  return () => {
    window.removeEventListener('popstate', handlePopState);
    window.removeEventListener('hashchange', handleHashChange);

    // 恢复原始的history方法
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };
}
