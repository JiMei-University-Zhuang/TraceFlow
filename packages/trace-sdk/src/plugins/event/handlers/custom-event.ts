import { EventType } from '../types';

/**
 * 自定义事件处理器类型
 */
type CustomEventHandler = (eventType: EventType, event: CustomEvent, metadata?: Record<string, any>) => void;

/**
 * 初始化自定义事件监听
 * @param handler 事件处理函数
 * @returns 移除事件监听的函数
 */
export function initCustomEvent(handler: CustomEventHandler): () => void {
  /**
   * 自定义事件名前缀，用于识别需要追踪的自定义事件
   */
  const CUSTOM_EVENT_PREFIX = 'trace:';

  /**
   * 处理自定义事件
   * @param event 自定义事件对象
   */
  const handleCustomEvent = (event: Event): void => {
    try {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      // 提取事件名，去掉前缀
      const eventName = event.type.startsWith(CUSTOM_EVENT_PREFIX) ? event.type.substring(CUSTOM_EVENT_PREFIX.length) : event.type;

      // 提取事件数据
      const eventData = event.detail || {};

      // 构建元数据
      const metadata = {
        name: eventName,
        ...eventData,
      };

      // 传递给处理器
      handler(EventType.CUSTOM, event, metadata);
    } catch (error) {
      console.error('[TraceSDK][CustomEvent] 处理自定义事件错误:', error);
    }
  };

  // 使用事件委托，监听document上的所有自定义事件
  const handleCapture = (event: Event): void => {
    // 检查是否是需要追踪的自定义事件
    if (
      event.type.startsWith(CUSTOM_EVENT_PREFIX) ||
      event.type === 'trace-event' // 兼容旧版本
    ) {
      handleCustomEvent(event);
    }
  };

  document.addEventListener('trace-event', handleCustomEvent);

  // 动态添加监听器，捕获所有trace:前缀的事件
  // 使用MutationObserver来监听新增的自定义事件
  const observeCustomEvents = new MutationObserver(() => {
    // 这里不执行实际操作，只需确保observer在运行
    // 实际处理在事件捕获阶段进行
  });

  // 监听整个文档
  observeCustomEvents.observe(document, {
    childList: true,
    subtree: true,
  });

  // 使用事件捕获，确保可以拦截所有自定义事件
  document.addEventListener('trace:*', handleCapture, {
    capture: true,
    passive: true,
  } as EventListenerOptions);

  // 返回移除监听的函数
  return () => {
    document.removeEventListener('trace-event', handleCustomEvent);
    document.removeEventListener('trace:*', handleCapture, {
      capture: true,
    } as EventListenerOptions);
    observeCustomEvents.disconnect();
  };
}
