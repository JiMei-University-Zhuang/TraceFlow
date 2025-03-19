import { IMetrics, UserMetricsStore } from './core/base';
import { metricsName, OriginInformation } from './types';
import { getExtends, getPageInfo } from '../../utils/index';
import { getOriginInfo, proxyHash, proxyHistory, wrHistory } from './core/eventTracker';
import behaviorStore from './core/behaviorStore';
import { proxyFetch, proxyXmlHttp } from './core/httpInterceptor';
import { recordNextPage, routeList, routeTemplate } from './core/monitor';

const PI = metricsName.PI;
const RCR = metricsName.RCR;
export class EventTracking {
  private static instance: EventTracking | null = null;

  public static init(): EventTracking {
    if (!EventTracking.instance) {
      EventTracking.instance = new EventTracking();
    }
    return EventTracking.instance;
  }

  //本地暂存数据Map
  private metrics: UserMetricsStore;
  public breadcrumbs: behaviorStore;
  public maxBehaviorRecords: number;
  //允许捕获click事件的DOM标签比如button,div,img
  clickMountList: Array<string>;
  constructor() {
    //初始化
    this.metrics = new UserMetricsStore();
    //限制最大行为追踪记录数
    this.maxBehaviorRecords = 100;
    // 首次进入页面初始化记录
    //    const time = new Date().getTime();
    //    routeList.push({
    //        ...routeTemplate,
    //        startTime: time,
    //        url: window.location.pathname,
    //        duration: 0,
    //        endTime: 0
    //    });
    // //初始化行为追踪记录
    this.breadcrumbs = new behaviorStore({ maxBehaviorRecords: this.maxBehaviorRecords });
    this.clickMountList = ['button'].map(x => x.toLowerCase());
    wrHistory();
    this.initPageInfo();
    this.initOriginInfo();
    this.initPV();
    this.initRouteChange();
    this.initClickHandler(this.clickMountList);
    this.initHttpHandler();
    this.inidUsertime();
    this.getAll();
  }
  //获取页面信息
  initPageInfo = (): void => {
    const info = getPageInfo();
    console.log(PI, info);
  };
  //获取页面来源
  initOriginInfo = (): void => {
    const info: OriginInformation = getOriginInfo();
    console.log('用户来源', info);
  };
  //获取页面访问量
  initPV = (): void => {
    const handler = () => {
      const metrics = {
        //记得传入一些表示用户身份信息比如userID

        //创建时间
        timeStamp: new Date().getTime(),
        //页面信息
        pageInfo: getPageInfo(),
        //用户来源
        originInformation: getOriginInfo(),
      };
      this.metrics.set(metricsName.PI, metrics);
      //数据上报
      console.log('meteics:', metrics);
    };
    handler();
    proxyHash(handler);
    proxyHistory(handler);
  };
  //获取路由改变的基本信息
  initRouteChange = (): void => {
    const handler = (e: Event) => {
      //数据记录
      const metrics = {
        jumpType: e.type,
        timeStamp: new Date().getTime(),
        pageInfo: getPageInfo(),
      } as IMetrics;
      this.metrics.set(metricsName.RCR, metrics);
      // console.log('用户输入的数据', this.metrics);

      const behavior = {
        category: RCR,
        data: metrics,
        ...getExtends(),
      };
      this.breadcrumbs.push(behavior);
      console.log('metrics', metrics);
      console.log('behavior', behavior);
    };
    proxyHash(handler);
    proxyHistory(handler);
  };
  //初始话点击事件的获取与返回
  initClickHandler = (mountList: Array<string>): void => {
    const handler = (e: MouseEvent | any) => {
      let target = e.path?.find((x: Element) => mountList.includes(x.tagName?.toLocaleLowerCase()));
      target = target || (mountList.includes(e.target.tagName?.toLowerCase()) ? e.target : undefined);
      if (!target) return;
      const meteics = {
        tagInfo: {
          id: target.id,
          classList: Array.from(target.classList),
          tagName: target.tagName,
          text: target.textContent,
        },
        timeStamp: new Date().getTime(),
        pageInfo: getPageInfo(),
      } as IMetrics;
      this.metrics.set(metricsName.CBR, meteics);
      console.log('点击事件：', meteics);

      const behavior = {
        category: metricsName.CBR,
        data: meteics,
      };
      this.breadcrumbs.push(behavior);
    };
    window.addEventListener(
      'click',
      e => {
        handler(e);
      },
      true,
    );
  };
  //初始化http请求的数据获取与上报
  initHttpHandler = (): void => {
    const loadHandler = (metrics: any) => {
      if (metrics.status < 400) {
        //对于正常请求的http不需要记录请求体和响应体
        delete metrics.body;
        delete metrics.response;
      }
      this.metrics.set(metricsName.HT, metrics);
      console.log('http请求', metrics);
      //记录到用户行为记录栈
      this.breadcrumbs.push({
        category: metricsName.HT,
        data: metrics,
        ...getExtends(),
      });
    };
    proxyXmlHttp(null, loadHandler);
    proxyFetch(null, loadHandler);
  };
  //记录用户的页面留存时间
  inidUsertime = (): void => {
    // 第一次进入页面记录
    window.addEventListener('load', () => {
      const time = new Date().getTime();
      routeList.push({
        ...routeTemplate,
        startTime: time,
        url: window.location.pathname,
        duration: 0,
        endTime: 0,
      });
    });
    //单页面应用触发的replaceState事件上报
    window.addEventListener('replaceState', () => {
      recordNextPage();
    });
    //浏览器回退，前进时间行为出发
    window.addEventListener('popstate', () => {
      recordNextPage();
    });
    window.addEventListener('beforeunload', () => {
      const time = new Date().getTime();
      routeList[routeList.length - 1].endTime = time;
      routeList[routeList.length - 1].duration = time - routeList[routeList.length - 1].startTime;
      // 推一个页面的停留记录
      routeList.push({
        ...routeTemplate,
        startTime: time,
        url: window.location.pathname,
        duration: 0,
        endTime: 0,
      });
    });
    console.log('routeList', routeList, 'routeTemplate', routeTemplate);
  };
  // 输出所有用户存储的数据
  getAll = (): any => {
    console.log('用户行为数据', this.metrics);
  };
}
