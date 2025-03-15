import { UserMetricsStore } from '../../core/base';
import { metricsName, OriginInformation } from '../../core/types';
import { getPageInfo } from '../../utils/index';
import { getOriginInfo, proxyHash, proxyHistory, wrHistory } from './monitoring/eventTracker';

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
  constructor() {
    //初始化
    this.metrics = new UserMetricsStore();
    wrHistory();
    this.initPageInfo();
    this.initOriginInfo();
    this.initPV();
    this.initRouteChange();
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
  initRouteChange = (): void => {
    const handler = (e: Event) => {
      //数据记录
      const metrics = {
        jumpType: e.type,
        timestamp: new Date().getTime(),
        pageInfo: getPageInfo(),
      };
      const behavior = {
        category: RCR,
        data: metrics,
      };
      console.log('metrics', metrics);
      console.log('behavior', behavior);
    };
    proxyHash(handler);

    proxyHistory(handler);
  };
}
