import { httpMetrics } from '../types/types';

//调用proxyXmlHttp完成全局监听XMLHttpRequest
export const proxyXmlHttp = (sendHandler: Function | null | undefined, loadHandler: Function) => {
  if ('XMLHttpRequest' in window && typeof window.XMLHttpRequest === 'function') {
    const oXMLHttpRequest = window.XMLHttpRequest;
    if (!(window as any).oXMLHttpRequest) {
      (window as any).oXMLHttpRequest = oXMLHttpRequest;
    }
    (window as any).XMLHttpRequest = function () {
      //重写window.XMLHttpRequest
      const xhr = new oXMLHttpRequest();
      const { open, send } = xhr;
      let metrics = {} as httpMetrics;
      xhr.open = (method, url) => {
        metrics.method = method;
        metrics.url = url;
        open.call(xhr, method, url, true);
      };
      xhr.send = body => {
        metrics.body = body || '';
        metrics.requestTime = new Date().getTime();
        // sendHandler 可以在发送 Ajax 请求之前，挂载一些信息，比如 header 请求头
        // setRequestHeader 设置请求header，用来传输关键参数等
        // xhr.setRequestHeader('xxx-id', 'VQVE-QEBQ');
        send.call(xhr, body);
      };
      xhr.addEventListener('loadend', () => {
        // XMLHttpRequest 添加了一个 loadend 事件监听器，
        // 该事件在请求完成后触发。它记录了一些重要的请求信息，如请求的状态码、状态文本和响应数据
        const { status, statusText, response } = xhr;
        metrics = {
          ...metrics,
          status,
          statusText,
          response,
          responseTime: new Date().getTime(),
        };
        // console.log('metrics',metrics);
        if (typeof loadHandler === 'function') {
          loadHandler(metrics);
        }
      });
      return xhr;
      // 在 proxyXmlHttp 函数中，
      // window.XMLHttpRequest 被重写为一个新的构造函数，
      // 而 return xhr; 允许每次调用 new XMLHttpRequest() 时，
      // 返回修改后的 xhr 实例，使其仍然具有原生 XMLHttpRequest 的功能，
      // 同时添加了额外的监控逻辑。
    };
  }
};
