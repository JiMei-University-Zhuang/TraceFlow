import resolve from '@rollup/plugin-node-resolve'; // 用于解析node_modules中的模块
import commonjs from '@rollup/plugin-commonjs'; // 用于转换CommonJS模块
import typescript from 'rollup-plugin-typescript2'; // 用于支持 TypeScript
import terser from '@rollup/plugin-terser'; // 用于压缩输出文件

export default {
  input: 'src/plugins/event-tracking/text.ts', // 输入文件，通常是项目的主入口文件
  output: {
    file: 'dist/bundle.js', // 输出文件路径
    format: 'umd', // UMD格式，适用于浏览器和Node.js
    name: 'MyLibrary', // 全局变量名
    sourcemap: true, // 启用sourcemap，方便调试
  },
  plugins: [
    resolve(), // 解析node_modules中的模块
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }), // 使用TypeScript插件并指定tsconfig.json
    terser(), // 压缩代码
  ],
};
