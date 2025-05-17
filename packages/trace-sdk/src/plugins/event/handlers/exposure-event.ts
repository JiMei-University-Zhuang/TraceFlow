import { EventType } from '../types';

/**
 * 曝光事件处理器类型
 */
type ExposureEventHandler = (eventType: EventType, event: Event, metadata?: Record<string, any>) => void;

/**
 * 曝光元素选择器
 */
const EXPOSURE_SELECTOR = '[data-exposure]';

/**
 * 曝光元素记录Map
 */
const exposedElements = new WeakMap<Element, boolean>();

/**
 * 初始化元素曝光监听
 * @param handler 事件处理函数
 * @returns 移除事件监听的函数
 */
export function initExposureEvent(handler: ExposureEventHandler): () => void {
  let observer: IntersectionObserver | null = null;

  /**
   * 检查元素是否在视口中
   * @param entries IntersectionObserver条目数组
   */
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      try {
        const target = entry.target;

        // 元素进入视口且未被记录过
        if (entry.isIntersecting && !exposedElements.has(target)) {
          // 标记为已曝光
          exposedElements.set(target, true);

          // 提取曝光元素的关键数据
          const exposureId = target.getAttribute('data-exposure');
          const exposureName = target.getAttribute('data-exposure-name') || '';
          const exposureIndex = target.getAttribute('data-exposure-index') || '';

          // 构建元数据
          const metadata = {
            exposureId,
            exposureName,
            exposureIndex,
            viewablePercentage: entry.intersectionRatio,
            position: {
              top: entry.boundingClientRect.top,
              left: entry.boundingClientRect.left,
              width: entry.boundingClientRect.width,
              height: entry.boundingClientRect.height,
            },
          };

          // 传递给处理器
          handler(EventType.EXPOSURE, new Event('exposure'), metadata);
        }
      } catch (error) {
        console.error('[TraceSDK][ExposureEvent] 处理曝光事件错误:', error);
      }
    }
  };

  /**
   * 初始化IntersectionObserver
   */
  const initObserver = () => {
    // 创建交叉观察器
    observer = new IntersectionObserver(handleIntersection, {
      // 元素可见50%时触发
      threshold: 0.5,
      // 记录根元素的交叉状态
      root: null,
    });

    // 监听所有具有data-exposure属性的元素
    document.querySelectorAll(EXPOSURE_SELECTOR).forEach(element => {
      observer?.observe(element);
    });
  };

  /**
   * 处理DOM变化，监听新增的曝光元素
   */
  const mutationCallback = (mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // 检查新增元素本身
            if (element.matches && element.matches(EXPOSURE_SELECTOR)) {
              observer?.observe(element);
            }

            // 检查新增元素的子元素
            element.querySelectorAll?.(EXPOSURE_SELECTOR)?.forEach(el => {
              observer?.observe(el);
            });
          }
        });
      }
    }
  };

  // 创建MutationObserver
  const mutationObserver = new MutationObserver(mutationCallback);

  // 初始化观察器
  initObserver();

  // 监听DOM变化
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 监听滚动和调整窗口大小事件，重新检查曝光元素
  const checkExposures = () => {
    document.querySelectorAll(EXPOSURE_SELECTOR).forEach(element => {
      if (!exposedElements.has(element)) {
        observer?.observe(element);
      }
    });
  };

  window.addEventListener('scroll', checkExposures, { passive: true });
  window.addEventListener('resize', checkExposures, { passive: true });

  // 返回移除监听的函数
  return () => {
    observer?.disconnect();
    observer = null;
    mutationObserver.disconnect();
    window.removeEventListener('scroll', checkExposures);
    window.removeEventListener('resize', checkExposures);
    // 清空记录
    // 注意：WeakMap会自动垃圾回收引用的元素，无需手动清除
  };
}
