#!/bin/bash
set -e

# TraceFlow 服务端部署脚本
echo "=== TraceFlow 服务端部署脚本 ==="
echo "该脚本将帮助您部署 TraceFlow 服务端应用"

# 检查目录位置
if [ ! -f "package.json" ]; then
  echo "错误: 请在 trace-server 目录下运行此脚本"
  exit 1
fi

# 安装依赖
echo "正在安装依赖..."
if command -v pnpm &> /dev/null; then
  pnpm install
else
  echo "未找到 pnpm，正在尝试安装..."
  npm install -g pnpm
  pnpm install
fi

# 修复 crypto 未定义问题
echo "应用 TypeORM 补丁 (解决 crypto 未定义问题)..."
if [ -f "patch-typeorm.js" ]; then
  node patch-typeorm.js
else
  echo "警告: 未找到 patch-typeorm.js 文件，跳过补丁步骤"
fi

# 构建项目
echo "正在构建项目..."
pnpm run build

# 创建启动脚本
echo "创建启动脚本..."
cat > start.sh << 'EOF'
#!/bin/bash

echo "启动 TraceFlow 服务..."

# 优先尝试修补过的 TypeORM 方式启动
if [ -f "dist/main.js" ]; then
  node dist/main.js
else
  echo "错误: 未找到构建文件，请先运行 pnpm run build"
  exit 1
fi

# 如果上述方法失败，尝试使用全局 crypto 补丁
if [ $? -ne 0 ] && [ -f "crypto-global.js" ]; then
  echo "尝试使用全局 crypto 补丁启动..."
  NODE_OPTIONS="--require=./crypto-global.js" node dist/main.js
fi
EOF

chmod +x start.sh

echo "=== 部署完成 ==="
echo "您可以使用以下命令启动应用:"
echo "  ./start.sh"
echo ""
echo "或者使用 PM2 进行进程管理:"
echo "  pm2 start dist/main.js --name traceflow"
echo "  (如需 crypto 补丁) pm2 start dist/main.js --name traceflow --node-args=\"--require=./crypto-global.js\"" 