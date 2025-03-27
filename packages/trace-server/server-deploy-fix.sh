#!/bin/bash
set -e

# TraceFlow 服务端部署修复脚本
echo "=== TraceFlow 服务端部署修复脚本 ==="
echo "该脚本将修复 TraceFlow 服务端的部署问题"

# 当前目录检查
if [ ! -d "node_modules" ]; then
  echo "错误: 未找到 node_modules 目录，请确保已安装依赖"
  exit 1
fi

# 1. 修复 crypto 未定义问题
echo "Step 1: 创建 crypto 全局补丁文件..."
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

# 2. 修复 TypeORM 中的 crypto 依赖
echo "Step 2: 修补 TypeORM 源代码..."
TYPEORM_UTILS=$(find ./node_modules -path "*/typeorm/dist/common/typeorm.utils.js")

if [ -n "$TYPEORM_UTILS" ]; then
  echo "找到 TypeORM utils 文件: $TYPEORM_UTILS"
  
  # 创建备份
  cp "$TYPEORM_UTILS" "${TYPEORM_UTILS}.bak"
  
  # 替换代码
  sed -i 's/const generateString = () => crypto.randomUUID();/const generateString = () => `uuid_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;/g' "$TYPEORM_UTILS"
  
  echo "✅ TypeORM utils 文件修补完成"
else
  echo "⚠️ 未找到 TypeORM utils 文件，跳过此步骤"
fi

# 3. 修复 MySQL 驱动程序问题
echo "Step 3: 检查 MySQL 驱动依赖..."
if ! npm list mysql2 | grep -q mysql2; then
  echo "安装 mysql2 包..."
  npm install mysql2
else
  echo "mysql2 已安装"
fi

# 4. 修复 driver 和 driverPackage 配置
echo "Step 4: 检查数据库配置..."
DB_MODULE=$(find ./dist -name "database.module.js")

if [ -n "$DB_MODULE" ]; then
  echo "找到数据库模块文件: $DB_MODULE"
  
  # 创建备份
  cp "$DB_MODULE" "${DB_MODULE}.bak"
  
  # 检查并添加 driverPackage 配置
  if ! grep -q "driverPackage:" "$DB_MODULE"; then
    sed -i 's/type: '\''mysql'\'',/type: '\''mysql'\'', driverPackage: '\''mysql2'\'',/g' "$DB_MODULE"
    echo "✅ 已添加 driverPackage 配置"
  else
    echo "driverPackage 配置已存在"
  fi
  
  echo "✅ 数据库模块配置修复完成"
else
  echo "⚠️ 未找到数据库模块文件，跳过此步骤"
fi

# 5. 创建启动脚本
echo "Step 5: 创建启动脚本..."
cat > start.sh << 'EOF'
#!/bin/bash

echo "启动 TraceFlow 服务..."

# 使用 crypto 补丁启动
NODE_OPTIONS="--require=./crypto-global.js" node dist/main.js
EOF

chmod +x start.sh

echo ""
echo "=== 修复完成 ==="
echo "您可以使用以下命令启动应用:"
echo "  ./start.sh"
echo ""
echo "或者使用 PM2 进行管理:"
echo "  pm2 start dist/main.js --name traceflow --node-args=\"--require=./crypto-global.js\""
echo ""
echo "如果仍然遇到问题，请尝试检查 .env 文件中的数据库配置是否正确" 