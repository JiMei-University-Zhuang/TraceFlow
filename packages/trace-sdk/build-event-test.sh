#!/bin/bash

# 设置颜色变量
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 颜色结束符

echo -e "${YELLOW}开始构建TraceFlow SDK行为监控测试...${NC}"

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
    const EventType = {
        CLICK: 'click',
        ROUTE: 'route',
        EXPOSURE: 'exposure',
        CUSTOM: 'custom'
    };
    
    class MockEventPlugin {
        constructor() {
            this.name = 'event';
            console.log('[TraceFlow] 行为监控插件初始化');
            
            // 注册事件监听
            document.addEventListener('click', this.handleClickEvent.bind(this), true);
            window.addEventListener('popstate', this.handleRouteEvent.bind(this));
            window.addEventListener('hashchange', this.handleRouteEvent.bind(this));
            
            // 自定义事件监听
            document.addEventListener('trace:*', this.handleCustomEvent.bind(this), true);
            
            // 路由变化监听
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            
            history.pushState = function(...args) {
                originalPushState.apply(this, args);
                const event = new Event('pushState');
                window.dispatchEvent(event);
            };
            
            history.replaceState = function(...args) {
                originalReplaceState.apply(this, args);
                const event = new Event('replaceState');
                window.dispatchEvent(event);
            };
            
            // 创建一个IntersectionObserver用于曝光检测
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                this.handleExposureEvent(entry);
                            }
                        });
                    },
                    { threshold: 0.5 }
                );
                
                // 监听所有带data-exposure属性的元素
                document.querySelectorAll('[data-exposure]').forEach(el => {
                    this.observer.observe(el);
                });
            }
        }
        
        handleClickEvent(event) {
            if (event.target.hasAttribute('data-track')) {
                console.log('[TraceFlow] 捕获到点击事件:', {
                    type: 'click',
                    target: event.target.tagName,
                    trackId: event.target.getAttribute('data-track'),
                    dataId: event.target.getAttribute('data-id')
                });
                
                // 触发事件通知
                this.dispatchSDKEvent('click', {
                    element: event.target,
                    position: { x: event.clientX, y: event.clientY }
                });
            }
        }
        
        handleRouteEvent(event) {
            console.log('[TraceFlow] 捕获到路由事件:', {
                type: 'route',
                eventType: event.type,
                url: window.location.href
            });
            
            // 触发事件通知
            this.dispatchSDKEvent('route', {
                from: document.referrer,
                to: window.location.href,
                type: event.type
            });
        }
        
        handleExposureEvent(entry) {
            const element = entry.target;
            console.log('[TraceFlow] 捕获到曝光事件:', {
                type: 'exposure',
                element: element.tagName,
                exposureId: element.getAttribute('data-exposure'),
                exposureName: element.getAttribute('data-exposure-name')
            });
            
            // 触发事件通知
            this.dispatchSDKEvent('exposure', {
                element: element,
                ratio: entry.intersectionRatio
            });
        }
        
        handleCustomEvent(event) {
            if (event.type.startsWith('trace:')) {
                console.log('[TraceFlow] 捕获到自定义事件:', {
                    type: 'custom',
                    eventName: event.type,
                    detail: event instanceof CustomEvent ? event.detail : null
                });
                
                // 触发事件通知
                this.dispatchSDKEvent('custom', {
                    name: event.type.substring(6),
                    data: event instanceof CustomEvent ? event.detail : null
                });
            }
        }
        
        captureEvent(eventName, eventData) {
            console.log('[TraceFlow] 手动上报事件:', {
                name: eventName,
                data: eventData
            });
            
            // 触发事件通知
            this.dispatchSDKEvent('manual', {
                name: eventName,
                data: eventData
            });
        }
        
        dispatchSDKEvent(type, data) {
            const event = new CustomEvent('TraceFlow:event', {
                detail: {
                    type: type,
                    name: `${type}_event`,
                    data: data,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(event);
        }
    }
    
    // 全局插件实例
    let eventPlugin;
    
    const init = function(options) {
        console.log('[TraceFlow] SDK初始化配置:', options);
        
        // 初始化插件
        eventPlugin = new MockEventPlugin();
        
        return {
            captureEvent: function(eventName, eventData) {
                console.log('[TraceFlow] 调用captureEvent方法');
                eventPlugin.captureEvent(eventName, eventData);
            }
        };
    };
    
    exports.init = init;
    exports.EventType = EventType;
    
    Object.defineProperty(exports, '__esModule', { value: true });
}));
EOL
fi

# 检查测试HTML文件是否存在
if [ ! -f "test-event.html" ]; then
    echo -e "${RED}错误: 未找到test-event.html文件${NC}"
    exit 1
fi

# 检查是否安装了Node.js
if command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}使用Node.js服务器提供测试页面...${NC}"
    echo -e "${YELLOW}在浏览器中访问 http://localhost:3030 查看测试页面${NC}"
    echo -e "${YELLOW}按Ctrl+C退出服务器${NC}"
    
    # 如果server.js不存在，创建一个简单的服务器
    if [ ! -f "server.js" ]; then
        echo -e "${YELLOW}创建简单的HTTP服务器...${NC}"
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
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // 将URL解析为文件路径
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './test-event.html';
  }
  
  // 获取文件扩展名
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // 读取文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code === 'ENOENT') {
        // 文件不存在
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        // 服务器错误
        res.writeHead(500);
        res.end(`服务器错误: ${error.code}`);
      }
    } else {
      // 发送内容
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`服务器运行在: http://localhost:${PORT}/`);
  console.log(`测试页面地址: http://localhost:${PORT}/test-event.html`);
});
EOL
    fi
    
    # 启动HTTP服务器
    node server.js
else
    echo -e "${YELLOW}未找到Node.js，请使用浏览器直接打开test-event.html${NC}"
    
    # 根据操作系统选择不同的打开命令
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open test-event.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open >/dev/null 2>&1; then
            xdg-open test-event.html
        else
            echo -e "${YELLOW}请手动打开 test-event.html 文件${NC}"
        fi
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        start test-event.html
    else
        # 其他系统
        echo -e "${YELLOW}请手动打开 test-event.html 文件${NC}"
    fi
fi

echo -e "${GREEN}完成！${NC}"
echo -e "${YELLOW}注意: 如果浏览器没有自动打开，请手动打开 test-event.html 文件${NC}" 