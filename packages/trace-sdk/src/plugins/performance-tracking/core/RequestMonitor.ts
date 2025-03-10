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
          const sdkdata = {
            timestamp: Date.now(),
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            duration: performance.now() - metadata.startTime,
          };
          console.log({ requestMonitor: sdkdata }); //后续替换为上报
        }
        return response;
      },
      error => {
        const { metadata } = error.config as CustomRequestConfig;
        if (metadata?.startTime) {
          const errordata = {
            timestamp: Date.now(),
            url: error.config.url,
            method: error.config.method,
            status: error.response.status,
            duration: performance.now() - metadata.startTime,
            error: error.message,
          };
          console.log({ requestMonitor: errordata }); //后续替换为上报
        }
        return Promise.reject(error);
      },
    );
  };
  initInterceptors();
  return instance;
};

export const initMonitorAxios = (config: Config) => getRequestMonitor(config);
