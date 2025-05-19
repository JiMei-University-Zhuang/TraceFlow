//获取页面信息
export const utils = {
  version: '1.0.0',
  init: () => {},
};

/**
 * 获取页面信息
 */
export interface PageInformation {
  host: string;
  href: string;
  pathname: string;
  title: string;
  language: string;
  winScreen: string;
  docScreen: string;
}

/**
 * 获取页面信息
 */
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

/**
 * 格式化时间戳为字符串
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 数字补零
 */
function padZero(num: number): string {
  return num < 10 ? `0${num}` : String(num);
}

/**
 * 获取页面信息以及时间
 */
export const getExtends = (): { page: string; timestamp: string } => {
  return {
    page: getPageInfo().pathname,
    timestamp: formatTimestamp(new Date().getTime()),
  };
};

/**
 * 生成唯一ID
 */
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 防抖函数
 */
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
