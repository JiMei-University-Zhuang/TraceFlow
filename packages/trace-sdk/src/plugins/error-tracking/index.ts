export enum mechanismType {
  JS = 'js',
  RS = 'resource',
  UJ = 'unhandledrejection',
  HP = 'http',
  CS = 'cors',
  REACT = 'react',
}

export interface ExceptionMetrics {
  mechanism: object;
  value?: string;
  type: string;
  stackTrace?: object;
  pageInformation?: object;
  breadcrumbs?: Array<behaviorStack>;
  errorUid: string;
  meta?: any;
}

export interface ResourceErrorTarget {
  src?: string;
  tagName?: string;
  outerHTML?: string;
}

export interface httpMetrics {
  method: string;
  url: string | URL;
  body: Document | XMLHttpRequestBodyInit | null | undefined | ReadableStream;
  requestTime: number;
  responseTime: number;
  status: number;
  statusText: string;
  response?: any;
}

// 判断是 JS异常、静态资源异常、还是跨域异常
export const getErrorKey = (event: ErrorEvent | Event) => {
  const isJsError = event instanceof ErrorEvent;
  if (!isJsError) return mechanismType.RS;
  return event.message === 'Script error.' ? mechanismType.CS : mechanismType.JS;
};

export const getErrorUid = (input: string) => {
  return window.btoa(encodeURIComponent(input));
};

export default class errorTracking {
  private engineInstance: EngineInstance;
  private submitErrorUids: Array<string>;

  constructor(engineInstance: EngineInstance) {
    this.engineInstance = engineInstance;
    this.submitErrorUids = [];
    // 初始化 js错误
    this.initJsError();
    // 初始化 静态资源加载错误
    this.initResourceError();
    // 初始化 Promise异常
    this.initPromiseError();
    // 初始化 HTTP请求异常
    this.initHttpError();
  }
  //封装错误的上报入口，上报前判断错误是否已经发生过
  errorSendHandler = (data: ExceptionMetrics) => {
    //统一加上用户行为追踪和页面基本信息
    const submitParams = {
      ...data,
      breadcrumbs: this.engineInstance.userInstance.breadcrumbs.get(),
      pageInformation: this.engineInstance.userInstance.metrics.get('page-information'),
    } as ExceptionMetrics;

    //判断同一个错误在本次页面访问中是否已经发生过
    const hasSubmitStatus = this.submitErrorUids.includes(submitParams.errorUid);
    //检查一下错误在本次页面访问中是否已经产生过了
    if (hasSubmitStatus) return; //如果已经产生过了就直接返回
    this.submitErrorUids.push(submitParams.errorUid); //如果没有产生过就在submitErrorUids中记录
    //记录之后清除breadcrumbs
    this.engineInstance.userInstance.breadcrumbs.clear();
    //一般来说，有报错就立刻上报
    this.engineInstance.transportInstance.kernelTransportHandler(this.engineInstance.transportInstance.formatTransportData(transportCategory.ERROR, submitParams));
  };

  // 初始化 JS异常 的数据获取和上报
  initJsError = (): void => {
    const handler = (event: ErrorEvent) => {
      //阻止向上抛出控制台报错
      event.preventDefault();
      //如果不是JS异常就结束
      if (getErrorKey(event) !== mechanismType.JS) return;
      const exception = {
        mechanism: {
          type: mechanismType.JS, //上报错误归类
        },
        value: event.message, // 错误信息
        type: (event.error && event.error.name) || 'UnKnown', // 错误类型
        stackTrace: {
          frames: parseStackFrames(event.error), // 解析后的错误堆栈
        },
        errorUid: getErrorUid(`${mechanismType.JS}-${event.message}-${event.filename}`),
        //附带信息
        meta: {
          file: event.filename, //错误所处的文件地址
          col: event.colno,
          row: event.lineno,
        },
      } as ExceptionMetrics;
      //一般错误立刻上报，不用换存在本地
      this.errorSendHandler(exception);
    };
    window.addEventListener('error', event => {
      handler(event), true;
    });
  };

  // 初始化 静态资源异常 的数据获取和上报
  initResourceError = (): void => {
    const handler = (event: Event) => {
      event.preventDefault(); //阻止向上抛出控制台报错
      //如果不是跨域脚本异常，就结束
      if (getErrorKey(event) !== mechanismType.RS) return;
      const target = event.target as ResourceErrorTarget;
      const exception = {
        mechanism: {
          type: mechanismType.RS,
        },
        //错误信息
        value: '',
        type: 'ResourceError',
        errorUid: getErrorUid(`${mechanismType.RS}-${target.src}-${target.tagName}`),
        meta: {
          url: target.src,
          html: target.outerHTML,
          type: target.tagName,
        },
      } as ExceptionMetrics;
      this.errorSendHandler(exception);
    };
    window.addEventListener('error', event => handler(event), true);
  };

  // 初始化 Promise异常 的数据获取和上报
  initPromiseError = (): void => {
    const handler = (event: PromiseRejectionEvent) => {
      event.preventDefault(); //阻止向上抛出控制台报错
      const value = event.reason.message || event.reason;
      const type = event.reason.name || 'UnKnown';
      const exception = {
        //上报错误归类
        mechanism: {
          type: mechanismType.UJ,
        },
        value, //错误信息
        type, //错误类型
        stackTrace: {
          frames: parseStackFrames(event.reason),
        },
        errorUid: getErrorUid(`${mechanismType.UJ} - ${value} - ${type}`),
        meta: {},
      } as ExceptionMetrics;
      this.errorSendHandler(exception);
    };
    window.addEventListener('unhandledrejection', event => handler(event), true);
  };

  // 初始化 HTTP请求异常 的数据获取和上报
  initHttpError = (): void => {
    //... 详情代码在下
    const loadHandler = (metrics: httpMetrics) => {
      if (metrics.status < 400) return;
      const value = metrics.response;
      const exception = {
        // 上报错误归类
        mechanism: {
          type: mechanismType.HP,
        },
        // 错误信息
        value,
        // 错误类型
        type: 'HttpError',
        // 错误的标识码
        errorUid: getErrorUid(`${mechanismType.HP}-${value}-${metrics.statusText}`),
        // 附带信息
        meta: {
          metrics,
        },
      } as ExceptionMetrics;
      this.errorSendHandler(exception);
    };
    proxyXmlHttp(null, loadHandler);
    proxyFetch(null, loadHandler);
  };
}
