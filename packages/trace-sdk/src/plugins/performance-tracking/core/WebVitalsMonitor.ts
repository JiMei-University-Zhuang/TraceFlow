import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';
import { Callback } from '../types';

function getWebVitals(callback: Callback): void {
  {
    onCLS(res => {
      callback(res);
    });
    onFCP(res => {
      callback(res);
    });
    onLCP(res => {
      callback(res);
    });
    onTTFB(res => {
      callback(res);
    });
  }
}

export const initWebVitals = (callback: Callback): void => {
  getWebVitals(callback);
};
