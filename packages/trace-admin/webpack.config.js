import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import webpack from 'webpack';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'; // 新增
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'; // 新增

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { DefinePlugin } = webpack;

export default {
  mode: 'development',
  entry: './src/main.tsx',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
  },
  cache: {
    type: 'filesystem', // 启用持久化缓存
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpe?g|svg|gif)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 6 * 1024,
          },
        },
      },
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: ['react-refresh/babel'], // 添加 React Fast Refresh
              cacheDirectory: true, // 启用 Babel 缓存
            },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // 跳过类型检查
              compilerOptions: {
                jsx: 'react-jsx',
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false, // 开发模式不清理
    }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new ReactRefreshWebpackPlugin(), // 添加 React 热更新插件
    new ForkTsCheckerWebpackPlugin(), // 单独进程进行类型检查
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
    open: true,
    hot: true,
    client: {
      overlay: false, // 关闭浏览器全屏错误
    },
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'), // 添加路径别名
    },
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
  },
};
