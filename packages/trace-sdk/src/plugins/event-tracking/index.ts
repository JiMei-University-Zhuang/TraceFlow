import { metricsName, PageInformation } from '../../core/types';

const PI = metricsName.PI;
export class EventTracking {
  constructor() {
    //初始化
    this.initPageInfo();
    this.initOriginInfo();
    this.initPV();
  }

  initPageInfo = (): void => {
    const info = this.getPageInfo();
    console.log(PI, info);
  };
  initOriginInfo = (): void => {
    console.log('初始化用户来源信息');
  };
  initPV = (): void => {
    console.log('初始化页面浏览量的获取');
  };

  getPageInfo = (): PageInformation => {
    const { host, href } = window.location;
    const { width, height } = window.screen;
    const { language } = navigator;

    return {
      host,
      href,
      title: document.title,
      language: language.substring(0, 2),
      winScreen: `${width}×${height}`,
      docScreen: `emm`,
    };
  };
}
