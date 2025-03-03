export default {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react', // 新增 React 预设
                '@babel/preset-typescript',
              ],
            },
          },
          'ts-loader',
        ],
        exclude: /node_modules/,
      },
      // ...其他规则
    ],
  },
  // ...其他配置
};
