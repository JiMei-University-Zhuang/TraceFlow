//获取页面信息
import { formatTimestamp } from 'src/plugins/event-tracking/core/utils';
import { PageInformation } from '../plugins/event-tracking/types';

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
    timestamp: formatTimestamp(new Date().getTime()),
  };
};

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function debounce(func: () => void, delay: number) {
  let clickTimer: number | null = null;
  if (clickTimer) {
    clearTimeout(clickTimer);
  }
  clickTimer = window.setTimeout(() => {
    func();
    clickTimer = null;
  }, delay);
}
