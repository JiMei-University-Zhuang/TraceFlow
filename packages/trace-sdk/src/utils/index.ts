import { PageInformation } from '../core/types';

export const utils = {
  version: '1.0.0',
  init: () => {
    console.log('Utils initialized');
  },
};

export const getPageInfo = (): PageInformation => {
  const { host, href } = window.location;
  const { width, height } = window.screen;
  const { language } = navigator;

  return {
    host,
    href,
    title: document.title,
    language: language.substring(0, 2),
    winScreen: `${width}×${height}`,
    docScreen: `${document.documentElement.clientWidth}×${document.documentElement.clientHeight}`,
  };
};
