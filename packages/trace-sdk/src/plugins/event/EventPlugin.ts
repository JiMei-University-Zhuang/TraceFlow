import { AbstractPlugin, PluginState } from '../system/AbstractPlugin';
import { TraceEventType, TraceEvent } from '../../core/types';
import { initClickEvent, initRouteEvent, initCustomEvent, initExposureEvent } from './handlers';
import { EventPluginOptions, EventType, EventInfo } from './types';

/**
 * 行为监控插件
 * 负责捕获用户点击、路由变化、自定义事件、元素曝光等行为
 */
export class EventPlugin extends AbstractPlugin {
  /**
   * 插件名称
   */
  name = 'event';

  /**
   * 插件版本
   */
  version = '1.0.0';

  /**
   * 插件配置项
   */
  private config: EventPluginOptions = {
    clickEvent: true,
    routeEvent: true,
    exposureEvent: true,
    customEvent: true,
    samplingRate: 1.0,
    maxEventCount: 1000,
    ignoreEvents: [],
    rules: [],
  };

  /**
   * 事件计数器
   */
  private eventCount = 0;

  /**
   * 是否启用追踪
   */
  private enabled = true;

  /**
   * 事件处理器移除函数集合
   */
  private removeHandlers: Array<() => void> = [];

  /**
   * 核心API，用于事件上报
   */
  private traceCore: any;

  /**
   * 初始化插件
   * @param options 配置选项
   */
  protected onInit(options: Record<string, any>): void {
    // 合并配置项
    this.config = {
      ...this.config,
      ...options,
    };

    // 获取核心API
    if (options.context && options.context.traceCore) {
      this.traceCore = options.context.traceCore;
    } else {
      this.logError('缺少traceCore上下文，行为监控插件无法正常工作');
      this.state = PluginState.ERROR;
      return;
    }

    // 安装事件监听器
    this.installEventHandlers();

    this.logInfo('行为监控插件初始化完成');
  }

  /**
   * 销毁插件
   */
  protected onDestroy(): void {
    // 移除所有事件处理器
    this.removeAllEventHandlers();
    this.logInfo('行为监控插件已销毁');
  }

  /**
   * 安装事件处理器
   */
  private installEventHandlers(): void {
    try {
      // 安装点击事件监听
      if (this.config.clickEvent) {
        const removeClickEvent = initClickEvent(this.handleEvent.bind(this));
        this.removeHandlers.push(removeClickEvent);
      }

      // 安装路由事件监听
      if (this.config.routeEvent) {
        const removeRouteEvent = initRouteEvent(this.handleEvent.bind(this));
        this.removeHandlers.push(removeRouteEvent);
      }

      // 安装曝光事件监听
      if (this.config.exposureEvent) {
        const removeExposureEvent = initExposureEvent(this.handleEvent.bind(this));
        this.removeHandlers.push(removeExposureEvent);
      }

      // 安装自定义事件监听
      if (this.config.customEvent) {
        const removeCustomEvent = initCustomEvent(this.handleEvent.bind(this));
        this.removeHandlers.push(removeCustomEvent);
      }
    } catch (error) {
      this.logError(`安装事件处理器失败: ${error}`);
    }
  }

  /**
   * 移除所有事件处理器
   */
  private removeAllEventHandlers(): void {
    this.removeHandlers.forEach(remove => {
      try {
        remove();
      } catch (error) {
        this.logError(`移除事件处理器失败: ${error}`);
      }
    });
    this.removeHandlers = [];
  }

  /**
   * 处理捕获到的事件
   * @param eventType 事件类型
   * @param event 事件对象
   * @param metadata 附加元数据
   */
  private handleEvent(eventType: EventType, event: Event | CustomEvent, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    // 控制采样率
    if (Math.random() > (this.config.samplingRate || 1.0)) return;

    // 控制事件数量
    if (this.config.maxEventCount && this.eventCount >= this.config.maxEventCount) {
      if (this.eventCount === this.config.maxEventCount) {
        this.logWarn(`事件数量已达上限 ${this.config.maxEventCount}，后续事件将被忽略`);
        this.eventCount++;
      }
      return;
    }

    try {
      // 提取事件信息
      const eventInfo = this.extractEventInfo(eventType, event, metadata);

      // 应用过滤规则
      if (this.shouldIgnoreEvent(eventInfo)) {
        return;
      }

      // 上报事件
      this.reportEvent(eventInfo);
      this.eventCount++;
    } catch (e) {
      this.logError(`处理事件时发生异常: ${e}`);
    }
  }

  /**
   * 提取事件信息
   * @param eventType 事件类型
   * @param event 事件对象
   * @param metadata 附加信息
   * @returns 事件信息对象
   */
  private extractEventInfo(eventType: EventType, event: Event | CustomEvent, metadata?: Record<string, any>): EventInfo {
    let detail: Record<string, any> = {};
    let element: HTMLElement | null = null;

    // 根据事件类型提取信息
    if (event instanceof CustomEvent && event.detail) {
      detail = { ...event.detail };
    }

    if (event.target instanceof HTMLElement) {
      element = event.target;
    }

    // 当前页面信息
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
    };

    const eventInfo: EventInfo = {
      type: eventType,
      time: Date.now(),
      pageInfo,
      userAgent: navigator.userAgent,
      detail: {
        ...detail,
        ...metadata,
      },
    };

    // 对于DOM事件，添加元素信息
    if (element) {
      const elementInfo = this.extractElementInfo(element);
      eventInfo.element = elementInfo;
    }

    return eventInfo;
  }

  /**
   * 提取元素信息
   * @param element DOM元素
   * @returns 元素信息
   */
  private extractElementInfo(element: HTMLElement): {
    tagName: string;
    id: string;
    className: string;
    innerText?: string;
    path: string;
    attributes: Record<string, string>;
  } {
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      innerText: element.innerText?.substring(0, 50),
      path: this.getDomPath(element),
      attributes: this.getElementAttributes(element),
    };
  }

  /**
   * 获取元素的DOM路径
   * @param element DOM元素
   * @returns DOM路径字符串
   */
  private getDomPath(element: HTMLElement): string {
    const path = [];
    let currentElement = element;

    while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
      let selector = currentElement.nodeName.toLowerCase();

      if (currentElement.id) {
        selector += `#${currentElement.id}`;
        path.unshift(selector);
        break;
      } else {
        let sibling = currentElement;
        let siblingIndex = 1;

        while (sibling.previousElementSibling) {
          sibling = sibling.previousElementSibling as HTMLElement;
          siblingIndex++;
        }

        selector += `:nth-child(${siblingIndex})`;
      }

      path.unshift(selector);

      // 添加空值检查
      if (!currentElement.parentElement) break;
      currentElement = currentElement.parentElement;

      // 限制路径长度
      if (path.length >= 5) break;
    }

    return path.join(' > ');
  }

  /**
   * 获取元素的关键属性
   * @param element DOM元素
   * @returns 属性对象
   */
  private getElementAttributes(element: HTMLElement): Record<string, string> {
    const result: Record<string, string> = {};
    const allowedAttrs = ['data-track', 'data-id', 'href', 'src', 'alt', 'title', 'name', 'value', 'type'];

    for (const attr of allowedAttrs) {
      const value = element.getAttribute(attr);
      if (value) {
        result[attr] = value;
      }
    }

    return result;
  }

  /**
   * 判断是否应该忽略此事件
   * @param eventInfo 事件信息
   * @returns 是否忽略
   */
  private shouldIgnoreEvent(eventInfo: EventInfo): boolean {
    // 检查忽略列表
    if (this.config.ignoreEvents) {
      for (const pattern of this.config.ignoreEvents) {
        if (typeof pattern === 'string' && eventInfo.type === pattern) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(eventInfo.type)) {
          return true;
        }
      }
    }

    // 应用自定义规则
    if (this.config.rules && this.config.rules.length > 0) {
      for (const rule of this.config.rules) {
        if (rule(eventInfo) === false) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 上报事件信息
   * @param eventInfo 事件信息
   */
  private reportEvent(eventInfo: EventInfo): void {
    if (!this.traceCore) return;

    const eventData: TraceEvent = {
      type: TraceEventType.BEHAVIOR,
      name: `${eventInfo.type}_event`,
      timestamp: eventInfo.time,
      data: eventInfo,
    };

    this.traceCore.report(eventData);
  }

  /**
   * 暂停事件监控
   */
  public pause(): void {
    this.enabled = false;
    this.logInfo('行为监控已暂停');
  }

  /**
   * 恢复事件监控
   */
  public resume(): void {
    this.enabled = true;
    this.logInfo('行为监控已恢复');
  }

  /**
   * 手动上报自定义事件
   * @param eventName 事件名称
   * @param eventData 事件数据
   */
  public captureEvent(eventName: string, eventData?: Record<string, any>): void {
    this.handleEvent(EventType.CUSTOM, new CustomEvent(eventName, { detail: eventData }), { manualCapture: true, eventName });
  }

  /**
   * 获取事件计数
   * @returns 已捕获事件数量
   */
  public getEventCount(): number {
    return this.eventCount;
  }

  /**
   * 重置事件计数
   */
  public resetEventCount(): void {
    this.eventCount = 0;
  }
}
