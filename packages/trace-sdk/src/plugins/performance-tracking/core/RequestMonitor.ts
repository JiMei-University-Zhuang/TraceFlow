import axios from 'axios';
import { Config, CustomRequestConfig } from '../types/type';

const getRequestMonitor = (config: Config) => {
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
          console.log({ requestMonitor: sdkData }); //后续替换为上报
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
          console.log({ requestMonitor: errorData }); //后续替换为上报
        }
        return Promise.reject(error);
      },
    );
  };
  initInterceptors();
  return instance;
};

export const initMonitorAxios = (config: Config) => getRequestMonitor(config);
