import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [
    react(), // React支持
    tsconfigPaths(), // 支持tsconfig中的路径别名
    svgr(), // 将SVG作为React组件导入
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 路径别名配置
    },
  },
  css: {
    modules: {
      // CSS模块化配置
      localsConvention: 'camelCase', // 支持驼峰式访问类名
      generateScopedName: process.env.NODE_ENV === 'production' ? '[hash:base64]' : '[name]__[local]--[hash:base64:5]', // 类名生成规则
    },
    preprocessorOptions: {
      less: {
        // Less配置
        javascriptEnabled: true, // 启用JavaScript in Less
        additionalData: '@import "./src/styles/variables.module.less";', // 全局导入变量文件
      },
    },
  },
  server: {
    port: 8080, // 开发服务器端口
    open: true, // 自动打开浏览器
    host: true, // 监听所有地址，包括局域网和公网地址
    cors: true, // 启用CORS
  },
  build: {
    outDir: 'dist', // 输出目录
    sourcemap: process.env.NODE_ENV !== 'production', // 非生产环境生成sourcemap
    chunkSizeWarningLimit: 1600, // 块大小警告的限制（KB）
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ant-design': ['antd', '@ant-design/icons'],
          'chart-vendor': ['echarts', '@ant-design/charts'],
        },
      },
    },
  },
});
