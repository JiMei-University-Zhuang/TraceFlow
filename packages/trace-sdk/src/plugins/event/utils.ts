/**
 * 格式化时间戳
 * @param timestamp 时间戳
 * @param format 格式化字符串，默认为 'yyyy-MM-dd HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(timestamp: number, format: string = 'yyyy-MM-dd HH:mm:ss'): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return format.replace('yyyy', String(year)).replace('MM', month).replace('dd', day).replace('HH', hours).replace('mm', minutes).replace('ss', seconds);
}

/**
 * 数字补零
 * @param num 需要补零的数字
 * @returns 补零后的字符串
 */
function padZero(num: number): string {
  return num < 10 ? `0${num}` : String(num);
}

/**
 * 获取当前页面信息
 * @returns 页面信息对象
 */
export function getPageInfo() {
  return {
    url: window.location.href,
    title: document.title,
    referrer: document.referrer,
    path: window.location.pathname,
    host: window.location.host,
  };
}
