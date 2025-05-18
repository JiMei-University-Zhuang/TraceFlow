// 导入TraceSDK
import { init } from '@traceflow/trace-sdk';
import { createPerformancePlugin } from '@traceflow/trace-sdk/plugins';

// 初始化SDK，加载性能监控插件
const traceSDK = init({
  appId: 'your-app-id',
  endpoint: 'https://api.example.com/collect',
  plugins: [
    createPerformancePlugin({
      // 仅监控页面加载和资源加载性能
      pageLoadMetrics: true,
      resourceMetrics: true,

      // 设置资源采样率为20%，减少数据上报量
      resourceSamplingRate: 0.2,

      // 可以通过配置忽略某些资源
      ignoreMetrics: [
        // 忽略图片和字体资源
        /\.(png|jpg|jpeg|gif|webp|svg|ttf|woff|woff2)$/i,
        // 忽略第三方资源
        /https?:\/\/(www\.)?(google|facebook|linkedin)\.com/i,
      ],
    }),
  ],
});

// SDK会自动收集性能数据并上报
console.log('性能监控已启动');

// 如果需要手动停止监控
setTimeout(() => {
  traceSDK.stop();
  console.log('性能监控已停止');
}, 30000); // 30秒后停止

// 重新启动监控
setTimeout(() => {
  traceSDK.start();
  console.log('性能监控已重新启动');
}, 35000); // 35秒后重新启动
