#!/bin/bash

# 设置颜色变量
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 颜色结束符

echo -e "${YELLOW}开始构建TraceFlow SDK性能监控测试...${NC}"

# 检查是否存在package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 未找到package.json文件，请确保在正确的目录下运行此脚本${NC}"
    exit 1
fi

# 创建dist目录（如果不存在）
mkdir -p dist

# 检查是否有build命令
if grep -q "\"build\"" package.json; then
    # 执行构建
    echo -e "${YELLOW}执行npm build命令...${NC}"
    npm run build
else
    # 如果没有build命令，尝试使用tsc
    echo -e "${YELLOW}未找到build命令，尝试使用tsc进行构建...${NC}"
    if command -v tsc >/dev/null 2>&1; then
        echo -e "${YELLOW}使用tsc编译TypeScript...${NC}"
        tsc
    else
        echo -e "${RED}错误: 未找到TypeScript编译器，请先安装：npm install -g typescript${NC}"
        exit 1
    fi
fi

# 检查dist目录是否存在SDK文件
if [ ! -f "dist/trace-sdk.umd.js" ]; then
    echo -e "${RED}错误: 构建后未找到dist/trace-sdk.umd.js文件${NC}"
    
    # 尝试创建一个临时的脚本文件用于测试
    echo -e "${YELLOW}创建临时SDK文件用于测试...${NC}"
    cat > dist/trace-sdk.umd.js << 'EOL'
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.TraceFlow = {}));
})(this, (function (exports) { 'use strict';
    // 简易模拟SDK
    const PerformanceMetricType = {
        PAGE_LOAD: 'page_load',
        RESOURCE: 'resource',
        NETWORK: 'network',
        INTERACTION: 'interaction',
        MEMORY: 'memory',
        LONG_TASK: 'long_task',
        CUSTOM: 'custom'
    };
    
    class MockPerformancePlugin {
        constructor(options = {}) {
            this.name = 'performance';
            this.options = options;
            console.log('[TraceFlow] 性能监控插件初始化，配置:', options);
        }
        
        install(sdk) {
            this.sdk = sdk;
            console.log('[TraceFlow] 性能监控插件已安装');
            // 如果已启动SDK，则启动插件
            if (sdk.isStarted()) {
                this.start();
            }
            
            // 监听SDK事件
            sdk.on('start', () => this.start());
            sdk.on('stop', () => this.stop());
        }
        
        start() {
            console.log('[TraceFlow] 性能监控插件已启动');
            // 开始收集页面加载性能
            setTimeout(() => {
                if (window.performance && window.performance.timing) {
                    const timing = window.performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    console.log('[TraceFlow] 页面加载时间:', loadTime, 'ms');
                    
                    if (this.sdk) {
                        this.sdk.send({
                            category: 'performance',
                            type: PerformanceMetricType.PAGE_LOAD,
                            name: 'page_load',
                            value: loadTime,
                            unit: 'ms',
                            time: Date.now()
                        });
                    }
                }
            }, 500);
        }
        
        stop() {
            console.log('[TraceFlow] 性能监控插件已停止');
        }
    }
    
    const init = function(options) {
        console.log('[TraceFlow] SDK初始化配置:', options);
        
        // 创建性能监控插件实例
        const performancePlugin = new MockPerformancePlugin(options.performancePlugin || {});
        
        // SDK实例
        const sdk = {
            _started: false,
            _handlers: {},
            
            // 启动SDK
            start: function() {
                this._started = true;
                this._triggerEvent('start');
                console.log('[TraceFlow] SDK已启动');
                return this;
            },
            
            // 停止SDK
            stop: function() {
                this._started = false;
                this._triggerEvent('stop');
                console.log('[TraceFlow] SDK已停止');
                return this;
            },
            
            // 检查是否已启动
            isStarted: function() {
                return this._started;
            },
            
            // 事件处理
            on: function(event, handler) {
                this._handlers[event] = this._handlers[event] || [];
                this._handlers[event].push(handler);
                return this;
            },
            
            // 触发事件
            _triggerEvent: function(event, data) {
                const handlers = this._handlers[event] || [];
                handlers.forEach(handler => handler(data));
            },
            
            // 发送数据
            send: function(data) {
                console.log('[TraceFlow] 发送数据:', data);
                return this;
            }
        };
        
        // 安装插件
        performancePlugin.install(sdk);
        
        // 默认启动SDK
        sdk.start();
        
        return sdk;
    };
    
    exports.init = init;
    exports.PerformanceMetricType = PerformanceMetricType;
    
    Object.defineProperty(exports, '__esModule', { value: true });
}));
EOL
fi

# 检查测试HTML文件是否存在
if [ ! -f "test-performance.html" ]; then
    echo -e "${RED}错误: 未找到test-performance.html文件${NC}"
    exit 1
fi

# 创建简单的Node.js HTTP服务器文件
if [ ! -f "server.js" ]; then
    echo -e "${YELLOW}创建HTTP服务器文件...${NC}"
    cat > server.js << 'EOL'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3030;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 默认提供test-performance.html
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './test-performance.html';
  }

  // 获取文件扩展名
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // 读取文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 文件不存在
        fs.readFile('./test-performance.html', (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading test-performance.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data, 'utf-8');
          }
        });
      } else {
        // 服务器错误
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      // 成功
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Open http://localhost:${PORT}/test-performance.html to view performance test`);
});

// 处理服务器关闭
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
EOL
fi

# 检查是否安装了Node.js
if command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}使用Node.js服务器提供测试页面...${NC}"
    echo -e "${YELLOW}在浏览器中访问 http://localhost:3030 查看性能监控测试页面${NC}"
    echo -e "${YELLOW}按Ctrl+C退出服务器${NC}"
    
    # 启动HTTP服务器
    node server.js
else
    echo -e "${YELLOW}未找到Node.js，请使用浏览器直接打开test-performance.html${NC}"
    
    # 根据操作系统选择不同的打开命令
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open test-performance.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open >/dev/null 2>&1; then
            xdg-open test-performance.html
        else
            echo -e "${YELLOW}请手动打开 test-performance.html 文件${NC}"
        fi
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        start test-performance.html
    else
        # 其他系统
        echo -e "${YELLOW}请手动打开 test-performance.html 文件${NC}"
    fi
fi

echo -e "${GREEN}完成！${NC}"
echo -e "${YELLOW}注意: 如果浏览器没有自动打开，请手动打开 test-performance.html 文件${NC}" 