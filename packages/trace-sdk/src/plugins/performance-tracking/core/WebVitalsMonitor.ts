import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';
import { Callback } from '../types/type';

async function getWebVitals(callback: Callback): Promise<void> {
  const [CLS, FCP, LCP, TTFB, FP] = await Promise.all([
    new Promise(resolve => onCLS(res => resolve(res.value))),
    new Promise(resolve => onFCP(res => resolve(res.value))),
    new Promise(resolve => onLCP(res => resolve(res.value))),
    new Promise(resolve => onTTFB(res => resolve(res.value))),
    getFirstPaint(),
  ]);
  callback({
    LCP: LCP,
    FCP: FCP,
    TTFB: TTFB,
    CLS: CLS,
    FP: FP,
  });
  function getFirstPaint(): Promise<number> {
    return new Promise(resolve => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntriesByName('first-paint');
        if (entries.length > 0) {
          resolve(entries[0].startTime);
        } else {
          resolve(0);
        }
      });
      observer.observe({ type: 'paint', buffered: true });
    });
  }
}

export const initWebVitals = (callback: Callback): void => {
  getWebVitals(callback);
};
