#!/bin/bash
set -e

echo "=== TraceFlow 服务器部署脚本 ==="
echo "这个脚本将在宝塔服务器上配置和部署 TraceFlow 应用"

# 检查目录
if [ ! -d "/www/wwwroot/traceflow/trace-server" ]; then
  echo "错误：找不到目标目录 /www/wwwroot/traceflow/trace-server"
  echo "请确保你在正确的目录运行此脚本"
  exit 1
fi

# 切换到服务器应用目录
cd /www/wwwroot/traceflow/trace-server || exit 1

# 步骤 1: 安装依赖
echo "步骤 1: 安装依赖..."
if command -v pnpm &> /dev/null; then
  pnpm install
else
  echo "安装 pnpm..."
  npm install -g pnpm
  pnpm install
fi

# 步骤 2: 创建正确的 .env 文件
echo "步骤 2: 创建 .env 文件..."
cat > .env << 'EOF'
# 数据库配置
DB_TYPE=mysql
DB_HOST=222.186.21.30
DB_PORT=13306
DB_USERNAME=traceflow
DB_PASSWORD=nx8fwRsh2kF3cRan
DB_DATABASE=traceflow
DB_SYNCHRONIZE=true

# 应用配置
PORT=3000
EOF

echo ".env 文件已创建"

# 步骤 3: 创建 crypto-global.js 补丁
echo "步骤 3: 创建 crypto 补丁..."
cat > crypto-global.js << 'EOF'
if (!global.crypto) {
  try {
    const nodeCrypto = require('crypto');
    global.crypto = {
      randomUUID: function() {
        if (typeof nodeCrypto.randomUUID === 'function') {
          return nodeCrypto.randomUUID();
        }
        
        const hexDigits = '0123456789abcdef';
        let uuid = '';
        
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
      }
    };
    
    console.log('Added global.crypto polyfill with randomUUID support');
  } catch (error) {
    console.error('Failed to create crypto polyfill:', error.message);
  }
}
EOF

echo "crypto-global.js 已创建"

# 步骤 4: 修补 TypeORM 源码
echo "步骤 4: 修补 TypeORM 源码..."
cat > patch-typeorm.js << 'EOF'
const fs = require('fs');
const path = require('path');

// 尝试查找 typeorm.utils.js 文件
const findTypeormUtils = () => {
  const possiblePaths = [
    './node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js',
    './node_modules/typeorm/dist/common/TypeormUtils.js',
    './node_modules/typeorm/lib/common/TypeormUtils.js'
  ];

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }

  // 如果没有找到预定义的路径，尝试查找
  const typeormPath = path.join('node_modules', 'typeorm');
  if (fs.existsSync(typeormPath)) {
    const files = fs.readdirSync(typeormPath, { recursive: true });
    const utilsFile = files.find(file => file.includes('utils.js') || file.includes('Utils.js'));
    if (utilsFile) {
      return path.join(typeormPath, utilsFile);
    }
  }

  return null;
};

// 修改 MysqlDriver.js 文件
const patchMysqlDriver = () => {
  const possiblePaths = [
    './node_modules/typeorm/driver/mysql/MysqlDriver.js',
    './node_modules/typeorm/lib/driver/mysql/MysqlDriver.js',
    './node_modules/typeorm/dist/driver/mysql/MysqlDriver.js'
  ];

  let driverPath = null;
  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      driverPath = path;
      break;
    }
  }

  if (!driverPath) {
    console.error('无法找到 MysqlDriver.js 文件');
    return;
  }

  let content = fs.readFileSync(driverPath, 'utf8');
  
  // 备份原文件
  fs.writeFileSync(`${driverPath}.bak`, content);
  
  // 检查并替换 createPool 方法
  if (content.includes('this.mysql.createPool')) {
    console.log('找到 createPool 方法，正在修改...');
    content = content.replace(
      'this.mysql.createPool(this.options)',
      'this.mysql.createPool ? this.mysql.createPool(this.options) : { getConnection: (cb) => { const conn = this.mysql.createConnection(this.options); cb(null, conn); return conn; } }'
    );
    fs.writeFileSync(driverPath, content);
    console.log('已成功修改 MysqlDriver.js');
  } else {
    console.log('无法找到 createPool 方法，跳过修改');
  }
};

// 查找并修补 TypeORM utils 文件
const typeormUtilsPath = findTypeormUtils();
if (typeormUtilsPath) {
  console.log(`找到 TypeORM utils 文件: ${typeormUtilsPath}`);
  
  // 读取文件内容
  let content = fs.readFileSync(typeormUtilsPath, 'utf8');
  
  // 备份原文件
  fs.writeFileSync(`${typeormUtilsPath}.bak`, content);
  
  // 替换 crypto.randomUUID 的使用
  const oldCode = 'const generateString = () => crypto.randomUUID();';
  const newCode = 'const generateString = () => `uuid_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;';
  
  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(typeormUtilsPath, content);
    console.log('成功修补 TypeORM utils 文件');
  } else {
    console.log('在 TypeORM utils 文件中未找到 crypto.randomUUID，跳过修补');
  }
} else {
  console.error('无法找到 TypeORM utils 文件');
}

// 修补 MysqlDriver.js 文件
patchMysqlDriver();
EOF

echo "patch-typeorm.js 已创建"

# 执行补丁脚本
echo "执行补丁脚本..."
node patch-typeorm.js

# 步骤 5: 修改数据库模块
echo "步骤 5: 修改数据库模块..."
if [ -f "./dist/database/database.module.js" ]; then
  # 备份原文件
  cp ./dist/database/database.module.js ./dist/database/database.module.js.bak
  
  # 使用 sed 修改文件，改变 MySQL 配置
  sed -i 's/type: "mysql"/type: "mysql", driverPackage: "mysql2"/g' ./dist/database/database.module.js
  
  echo "数据库模块已更新"
else
  echo "警告: 找不到 database.module.js，请确保你已经构建了项目"
fi

# 步骤 6: 创建测试脚本
echo "步骤 6: 创建数据库连接测试脚本..."
cat > test-db.js << 'EOF'
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('测试数据库连接...');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT}`);
  console.log(`User: ${process.env.DB_USERNAME}`);
  console.log(`Database: ${process.env.DB_DATABASE}`);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });
    
    console.log('连接成功!');
    
    const [rows] = await connection.execute('SELECT 1 as result');
    console.log('查询执行成功:', rows);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('连接失败:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    return false;
  }
}

testConnection();
EOF

echo "test-db.js 已创建"

# 步骤 7: 创建启动脚本
echo "步骤 7: 创建启动脚本..."
cat > start.sh << 'EOF'
#!/bin/bash

echo "=== 启动 TraceFlow 服务 ==="

# 使用 crypto 补丁启动
NODE_OPTIONS="--require=./crypto-global.js" node dist/main.js
EOF

chmod +x start.sh
echo "start.sh 已创建并设置可执行权限"

# 步骤 8: 创建 PM2 配置文件
echo "步骤 8: 创建 PM2 配置文件..."
cat > pm2.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "traceflow",
      script: "./dist/main.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      node_args: "--require=./crypto-global.js",
      env: {
        NODE_ENV: "production"
      },
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    }
  ]
};
EOF

echo "pm2.config.js 已创建"

# 创建日志目录
mkdir -p logs

echo ""
echo "=== 部署完成 ==="
echo ""
echo "请按照以下步骤继续操作:"
echo ""
echo "1. 先测试数据库连接:"
echo "   node test-db.js"
echo ""
echo "2. 如果数据库连接正常，使用以下方式之一启动应用:"
echo "   - 直接启动: ./start.sh"
echo "   - 使用 PM2: pm2 start pm2.config.js"
echo ""
echo "如果遇到问题，请检查:"
echo "- MySQL 用户权限和认证插件"
echo "- 防火墙/安全组设置"
echo "- 网络连接"
echo ""
echo "祝您部署顺利!" 