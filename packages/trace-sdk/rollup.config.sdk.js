import resolve from '@rollup/plugin-node-resolve'; // 用于解析node_modules中的模块
import commonjs from '@rollup/plugin-commonjs'; // 用于转换CommonJS模块
import typescript from 'rollup-plugin-typescript2'; // 用于支持 TypeScript
import terser from '@rollup/plugin-terser'; // 用于压缩输出文件
import json from '@rollup/plugin-json'; // 解析JSON文件
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
  input: 'src/index.ts', // 使用SDK的主入口文件
  output: [
    {
      file: 'dist/trace-sdk.umd.js', // UMD格式输出
      format: 'umd', // UMD格式，适用于浏览器和Node.js
      name: 'TraceFlow', // 全局变量名
      sourcemap: true, // 启用sourcemap，方便调试
      globals: {
        axios: 'axios', // 声明外部依赖的全局变量名
      },
    },
    {
      file: 'dist/trace-sdk.esm.js', // ESM格式输出
      format: 'esm', // ES模块格式
      sourcemap: true,
    },
    {
      file: 'dist/trace-sdk.cjs.js', // CommonJS格式输出
      format: 'cjs', // CommonJS格式
      sourcemap: true,
    },
  ],
  plugins: [
    json(), // 解析JSON文件
    nodePolyfills({
      include: ['node_modules/**/*.js'], // 默认仅处理 node_modules 中的文件
      exclude: ['src/**/*.ts'], // 排除特定文件
      sourceMap: true, // 生成 sourcemap
    }), // 填充Node.js模块
    resolve({ browser: true }), // 解析node_modules中的模块
    commonjs(), // 转换CommonJS模块
    typescript({
      tsconfig: './tsconfig.json',
      clean: true, // 清理临时文件
      tsconfigOverride: {
        compilerOptions: {
          declaration: true, // 生成类型声明文件
        },
      },
    }), // 使用TypeScript插件并指定tsconfig.json
    process.env.NODE_ENV === 'production' && terser(), // 仅在生产环境下压缩代码
  ],
  external: ['fs', 'path', 'http', 'crypto', 'stream', 'os', 'axios'], // 排除这些模块，避免打包它们
};
