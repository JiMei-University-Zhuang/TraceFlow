import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';
import { Callback } from '../types/type';

async function getWebVitals(callback: Callback): Promise<void> {
  const [CLS, FCP, LCP, TTFB] = await Promise.all([
    new Promise(resolve => onCLS(res => resolve(res.value))),
    new Promise(resolve => onFCP(res => resolve(res.value))),
    new Promise(resolve => onLCP(res => resolve(res.value))),
    new Promise(resolve => onTTFB(res => resolve(res.value))),
  ]);
  callback({
    LCP: LCP,
    FCP: FCP,
    TTFB: TTFB,
    CLS: CLS,
  });
}

export const initWebVitals = (callback: Callback): void => {
  getWebVitals(callback);
};
