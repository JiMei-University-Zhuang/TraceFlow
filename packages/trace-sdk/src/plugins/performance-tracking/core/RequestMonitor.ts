import axios from 'axios';
import { Config, CustomRequestConfig, Callback } from '../types/type';

const getRequestMonitor = (callback: Callback, config?: Config) => {
  const instance = axios.create(config);

  // 初始化拦截器
  const initInterceptors = () => {
    // 请求拦截器
    instance.interceptors.request.use((config: CustomRequestConfig) => {
      config.metaData = { startTime: performance.now() };
      return config;
    });

    // 响应拦截器
    instance.interceptors.response.use(
      response => {
        const { metaData } = response.config as CustomRequestConfig;
        if (metaData?.startTime) {
          const sdkData = {
            timestamp: Date.now(),
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            duration: performance.now() - metaData.startTime,
          };
          callback({ requestMonitor: sdkData });
        }
        return response;
      },
      error => {
        const { metaData } = error.config as CustomRequestConfig;
        if (metaData?.startTime) {
          const errorData = {
            timestamp: Date.now(),
            url: error.config.url,
            method: error.config.method,
            status: error.response.status,
            duration: performance.now() - metaData.startTime,
            error: error.message,
          };
          callback({ requestMonitor: errorData });
        }
        return Promise.reject(error);
      },
    );
  };
  initInterceptors();
  return instance;
};

export const initMonitorAxios = (callback: Callback, config?: Config) => getRequestMonitor(callback, config);
