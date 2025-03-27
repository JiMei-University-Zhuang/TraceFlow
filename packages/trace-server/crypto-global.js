/**
 * 全局 crypto 补丁
 *
 * 在 Node.js 环境中添加全局 crypto 对象，提供 randomUUID 方法
 * 这解决了 TypeORM 依赖 crypto.randomUUID 但在某些环境中未定义的问题
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodeCrypto = require('crypto');

// 检查全局 crypto 对象是否存在
if (!global.crypto) {
  try {
    // 创建全局 crypto 对象并提供 randomUUID 方法
    global.crypto = {
      randomUUID: function () {
        // 如果原生模块有 randomUUID 方法就用它
        if (typeof nodeCrypto.randomUUID === 'function') {
          return nodeCrypto.randomUUID();
        }

        // 否则使用备选方法生成唯一ID
        const hexDigits = '0123456789abcdef';
        let uuid = '';

        // 生成符合 UUID v4 格式的字符串
        for (let i = 0; i < 36; i++) {
          if (i === 8 || i === 13 || i === 18 || i === 23) {
            uuid += '-';
          } else if (i === 14) {
            uuid += '4'; // UUID 版本
          } else if (i === 19) {
            uuid += hexDigits[(Math.random() * 4) | 8]; // UUID 变体
          } else {
            uuid += hexDigits[(Math.random() * 16) | 0];
          }
        }

        return uuid;
      },
    };

    // Added global.crypto polyfill with randomUUID support
  } catch {
    // Failed to create crypto polyfill
  }
}
