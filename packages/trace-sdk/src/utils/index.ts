//获取页面信息
import { PageInformation } from '../plugins/event-tracking/types/types';

export const utils = {
  version: '1.0.0',
  init: () => {},
};

export const getPageInfo = (): PageInformation => {
  const { host, href, pathname } = window.location;
  const { width, height } = window.screen;
  const { language } = navigator;

  return {
    host,
    href,
    pathname,
    title: document.title,
    language: language.substring(0, 2),
    winScreen: `${width}×${height}`,
    docScreen: `${document.documentElement.clientWidth}×${document.documentElement.clientHeight}`,
  };
};
//获取页面信息以及时间
export const getExtends = (): { page: string; timestamp: number | string } => {
  return {
    page: getPageInfo().pathname,
    timestamp: new Date().getTime(),
  };
};

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
