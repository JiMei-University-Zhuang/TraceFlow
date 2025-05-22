import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import webpack from 'webpack';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import type { Configuration } from 'webpack';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { DefinePlugin } = webpack;

// 读取tsconfig.json文件
const tsConfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf-8'));

const isDevelopment = process.env.NODE_ENV !== 'production';

const config = {
  mode: isDevelopment ? 'development' : 'production',
  entry: './src/main.tsx',
  output: {
    filename: isDevelopment ? 'bundle.js' : 'bundle.[contenthash].js',
    path: path.join(__dirname, 'dist'),
  },
  cache: {
    type: 'filesystem',
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
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'es2015',
          tsconfigRaw: tsConfig,
          // 在开发模式下启用react-refresh
          jsx: isDevelopment ? 'automatic' : 'transform',
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
    }),
    // 仅在开发模式下启用热更新
    ...(isDevelopment ? [new ReactRefreshWebpackPlugin()] : []),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    minimize: !isDevelopment,
    splitChunks: isDevelopment
      ? false
      : {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
    open: true,
    hot: true,
    client: {
      overlay: false,
    },
    historyApiFallback: true,
  },
} as Configuration & { devServer: any };

export default config;
