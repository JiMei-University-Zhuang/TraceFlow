import resolve from '@rollup/plugin-node-resolve'; // 用于解析node_modules中的模块
import commonjs from '@rollup/plugin-commonjs'; // 用于转换CommonJS模块
import typescript from 'rollup-plugin-typescript2'; // 用于支持 TypeScript
import terser from '@rollup/plugin-terser'; // 用于压缩输出文件
import json from '@rollup/plugin-json'; // 解析JSON文件
// import polyfillNode from 'rollup-plugin-polyfill-node'; // 用于在Node.js环境中填充缺失的Node.js模块
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
  input: 'src/plugins/event-tracking/text.ts', // 输入文件，通常是项目的主入口文件
  output: {
    file: 'dist/bundle.js', // 输出文件路径
    format: 'umd', // UMD格式，适用于浏览器和Node.js
    name: 'MyLibrary', // 全局变量名
    sourcemap: true, // 启用sourcemap，方便调试
  },
  plugins: [
    json(), // 解析JSON文件
    nodePolyfills({
      include: ['node_modules/**/*.js'], // 默认仅处理 node_modules 中的文件
      exclude: ['src/**/*.ts'], // 排除特定文件
      sourceMap: true, // 生成 sourcemap
    }), // 填充Node.js模块
    resolve({ browser: true }), // 解析node_modules中的模块
    commonjs(), // 转换CommonJS模块
    typescript({ tsconfig: './tsconfig.json' }), // 使用TypeScript插件并指定tsconfig.json
    terser(), // 压缩代码
  ],
  external: ['fs', 'path', 'http', 'crypto', 'stream', 'os'], // 排除这些模块，避免打包它们
};
