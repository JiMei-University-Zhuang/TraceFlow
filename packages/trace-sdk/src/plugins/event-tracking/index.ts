import { UserMetricsStore } from '../../core/base';
import { metricsName, OriginInformation } from '../../core/types';
import { getPageInfo } from '../../utils/index';
import { getOriginInfo, proxyHash, proxyHistory, wrHistory } from './monitoring/eventTracker';

const PI = metricsName.PI;
const RCR = metricsName.RCR;
export class EventTracking {
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

  initPageInfo = (): void => {
    const info = getPageInfo();
    console.log(PI, info);
  };
  initOriginInfo = (): void => {
    const info: OriginInformation = getOriginInfo();
    console.log('用户来源', info);
  };
  initPV = (): void => {
    console.log('初始化页面浏览量的获取');
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
