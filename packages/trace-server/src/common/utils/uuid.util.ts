/**
 * 简单的UUID生成工具，不依赖crypto模块
 */

/**
 * 生成一个简单的UUID字符串
 * 注意：这不是加密安全的，但对于TypeORM连接名称已经足够
 */
export function generateSimpleUUID(): string {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000);
  return `uuid_${timestamp}_${random}`;
}
