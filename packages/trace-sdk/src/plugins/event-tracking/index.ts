import { IMetrics, UserMetricsStore } from './core/base';
import { behaviorStack, httpMetrics, metricsName, OriginInformation } from './types/types';
import { getExtends, getPageInfo } from './core/getpage';
import { getOriginInfo, proxyHash, proxyHistory, wrHistory } from './core/eventTracker';
import { timeStamp } from 'console';
import behaviorStore from './core/behaviorStore';
import { proxyXmlHttp } from './core/httpInterceptor';

const PI = metricsName.PI;
const RCR = metricsName.RCR;
export class EventTracking {
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
    //初始化行为追踪记录
    this.breadcrumbs = new behaviorStore({ maxBehaviorRecords: this.maxBehaviorRecords });
    this.clickMountList = ['button'].map(x => x.toLowerCase());
    wrHistory();
    this.initPageInfo();
    this.initOriginInfo();
    this.initPV();
    this.initRouteChange();
    this.initClickHandler(this.clickMountList);
    this.initHttpHandler();
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
  };
}
