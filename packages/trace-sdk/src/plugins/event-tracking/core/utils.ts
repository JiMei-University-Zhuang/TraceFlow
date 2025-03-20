export function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp); // 将时间戳转换为 Date 对象

  // 获取各个时间部分
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从 0 开始，所以加 1
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // 拼接成 "YYYY-MM-DD HH:mm:ss" 格式
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function parseFormattedDate(dateString: string) {
  // 使用正则表达式解析日期字符串
  const regex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
  const match = dateString.match(regex);

  if (match) {
    const [, year, month, day, hours, minutes, seconds] = match;

    // 创建 Date 对象 (注意：JavaScript 的月份从 0 开始，所以需要减去 1)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));

    // 返回时间戳
    return date.getTime();
  } else {
    throw new Error('Invalid date format');
  }
}
