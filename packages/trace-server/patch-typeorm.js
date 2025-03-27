/**
 * TypeORM 补丁脚本 - 解决 crypto is not defined 问题
 *
 * 该脚本将直接修改 @nestjs/typeorm 包中使用 crypto.randomUUID 的代码
 * 替换为一个不依赖 crypto 的简单 UUID 生成函数
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// 目标文件路径 - 根据实际包管理器和安装路径进行调整
const possiblePaths = [
  // pnpm 路径
  path.join(
    __dirname,
    '../../node_modules/.pnpm/@nestjs+typeorm@11.0.0_*/node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js',
  ),
  // 常规 node_modules 路径
  path.join(
    __dirname,
    'node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js',
  ),
  path.join(
    __dirname,
    '../../node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js',
  ),
];

let targetFile = null;
for (const filePath of possiblePaths) {
  try {
    // 使用 glob 模式查找匹配的文件
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { globSync } = require('glob');

    const matches = globSync(filePath);

    if (matches && matches.length > 0) {
      targetFile = matches[0];
      console.log(`找到目标文件: ${targetFile}`);
      break;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // 如果 glob 未安装，则尝试直接检查文件是否存在
    try {
      if (fs.existsSync(filePath.replace('*/', ''))) {
        targetFile = filePath.replace('*/', '');
        console.log(`找到目标文件: ${targetFile}`);
        break;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.log(`路径 ${filePath} 不存在，继续检查下一个路径...`);
    }
  }
}

if (!targetFile) {
  console.error('无法找到 TypeORM utils.js 文件。请检查安装路径。');
  console.log('尝试手动查找文件:');
  console.log(
    'find ../../node_modules -name "typeorm.utils.js" | grep -v "dts"',
  );
  process.exit(1);
}

try {
  // 读取文件内容
  let content = fs.readFileSync(targetFile, 'utf8');

  // 替换使用 crypto.randomUUID 的代码
  const oldCode = 'const generateString = () => crypto.randomUUID();';
  const newCode =
    'const generateString = () => `uuid_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;';

  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    // 写回文件
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('✅ 成功修补 TypeORM utils 文件');
  } else {
    console.log(
      '⚠️ 未找到目标代码模式。文件可能已被修改或使用了不同的代码模式。',
    );
    console.log('请手动检查文件内容:');
    console.log(`cat ${targetFile} | grep -n "crypto.randomUUID"`);
  }
} catch (error) {
  console.error('❌ 补丁应用失败:', error.message);
}
