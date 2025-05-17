import { EventType } from '../types';

/**
 * 点击事件处理器类型
 */
type ClickEventHandler = (eventType: EventType, event: MouseEvent, metadata?: Record<string, any>) => void;

/**
 * 需要过滤的元素标签名列表
 */
const IGNORE_TAGS = ['HTML', 'BODY', 'SCRIPT', 'STYLE', 'META', 'HEAD'];

/**
 * 初始化点击事件监听
 * @param handler 事件处理函数
 * @returns 移除事件监听的函数
 */
export function initClickEvent(handler: ClickEventHandler): () => void {
  /**
   * 点击事件处理函数
   * @param event 鼠标事件对象
   */
  const handleClick = (event: MouseEvent): void => {
    try {
      const target = event.target as HTMLElement;

      // 忽略特定标签
      if (!target || IGNORE_TAGS.includes(target.tagName)) {
        return;
      }

      // 提取额外元数据
      const metadata = {
        x: event.clientX,
        y: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
        button: event.button,
      };

      // 传递给处理器
      handler(EventType.CLICK, event, metadata);
    } catch (error) {
      console.error('[TraceSDK][ClickEvent] 处理点击事件错误:', error);
    }
  };

  // 添加事件监听
  document.addEventListener('click', handleClick, {
    capture: true,
    passive: true,
  });

  // 返回移除监听的函数
  return () => {
    document.removeEventListener('click', handleClick, true);
  };
}
