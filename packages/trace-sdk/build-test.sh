#!/bin/bash

# 设置颜色变量
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 颜色结束符

echo -e "${YELLOW}开始构建TraceFlow SDK...${NC}"

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
    const ErrorType = {
        JS: 'js',
        PROMISE: 'promise',
        RESOURCE: 'resource',
        HTTP: 'http',
        MANUAL: 'manual'
    };
    
    class MockErrorPlugin {
        constructor() {
            this.name = 'error';
            console.log('[TraceFlow] 错误监控插件初始化');
            
            // 注册错误监听
            window.addEventListener('error', this.handleJsError.bind(this));
            window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
        }
        
        handleJsError(event) {
            console.log('[TraceFlow] 捕获到JS错误:', event.error);
        }
        
        handlePromiseError(event) {
            console.log('[TraceFlow] 捕获到Promise错误:', event.reason);
        }
        
        captureError(error, metadata) {
            console.log('[TraceFlow] 手动上报错误:', error, metadata);
        }
    }
    
    const init = function(options) {
        console.log('[TraceFlow] SDK初始化配置:', options);
        
        return {
            captureError: function(error, metadata) {
                console.log('[TraceFlow] 调用captureError方法');
                const errorPlugin = new MockErrorPlugin();
                errorPlugin.captureError(error, metadata);
            }
        };
    };
    
    exports.init = init;
    exports.ErrorType = ErrorType;
    
    Object.defineProperty(exports, '__esModule', { value: true });
}));
EOL
fi

# 检查测试HTML文件是否存在
if [ ! -f "test-error.html" ]; then
    echo -e "${RED}错误: 未找到test-error.html文件${NC}"
    exit 1
fi

# 检查是否安装了Node.js
if command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}使用Node.js服务器提供测试页面...${NC}"
    echo -e "${YELLOW}在浏览器中访问 http://localhost:3030 查看测试页面${NC}"
    echo -e "${YELLOW}按Ctrl+C退出服务器${NC}"
    
    # 启动HTTP服务器
    node server.js
else
    echo -e "${YELLOW}未找到Node.js，请使用浏览器直接打开test-error.html${NC}"
    
    # 根据操作系统选择不同的打开命令
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open test-error.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open >/dev/null 2>&1; then
            xdg-open test-error.html
        else
            echo -e "${YELLOW}请手动打开 test-error.html 文件${NC}"
        fi
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        start test-error.html
    else
        # 其他系统
        echo -e "${YELLOW}请手动打开 test-error.html 文件${NC}"
    fi
fi

echo -e "${GREEN}完成！${NC}"
echo -e "${YELLOW}注意: 如果浏览器没有自动打开，请手动打开 test-error.html 文件${NC}" 