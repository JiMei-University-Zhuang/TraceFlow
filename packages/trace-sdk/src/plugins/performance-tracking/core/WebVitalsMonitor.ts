import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';
import { Callback } from '../types';

export function getWebVitals(callback: Callback): void {
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
