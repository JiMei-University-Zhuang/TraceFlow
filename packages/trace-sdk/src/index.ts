import { errorTracking } from './plugins/error-tracking/index';
import { eventTracking } from './plugins/event-tracking/index';
import { performanceTracking } from './plugins/performance-tracking/index';
import { utils } from './utils/index';

export const TraceSDK = {
  ...utils,
  errorTracking,
  eventTracking,
  performanceTracking,
  init: () => {
    utils.init();
    errorTracking.init();
    eventTracking.init();
    performanceTracking.init();
  },
};
