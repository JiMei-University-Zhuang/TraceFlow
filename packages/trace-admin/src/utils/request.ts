import axios from 'axios';

const http = axios.create({
  baseURL: 'http://47.122.48.232:3000', //根域名配置
  timeout: 10000, //超时时间配置
});

// 添加请求拦截器
http.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  },
);

// 添加响应拦截器
http.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    return response;
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  },
);

export { http };
