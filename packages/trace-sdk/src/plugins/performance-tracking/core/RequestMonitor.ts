import axios from 'axios';
import { Config, CustomRequestConfig } from '../types';

const getRequestMonitor = (config: Config) => {
  const instance = axios.create(config);

  // 初始化拦截器
  const initInterceptors = () => {
    // 请求拦截器
    instance.interceptors.request.use((config: CustomRequestConfig) => {
      config.metadata = { startTime: performance.now() };
      return config;
    });

    // 响应拦截器
    instance.interceptors.response.use(
      response => {
        const { metadata } = response.config as CustomRequestConfig;
        if (metadata?.startTime) {
          console.log(`请求耗时：${Date.now() - metadata.startTime}ms`);
        }
        return response;
      },
      error => {
        const duration = performance.now() - error.config.metadata.startTime;
        console.log(`请求失败：${error.message}，耗时：${duration}ms`);
        return Promise.reject(error);
      },
    );
  };
  initInterceptors();
  return instance;
};

export const initMonitorAxios = (config: Config) => getRequestMonitor(config);
