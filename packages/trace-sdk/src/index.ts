import { errorTracking } from './plugins/error-tracking/index';
import { EventTracking } from './plugins/event-tracking/index';

import { performanceTracking } from './plugins/performance-tracking/index';
import { utils } from './utils/index';

export const TraceSDK = {
  ...utils,
  errorTracking,
  EventTracking,
  performanceTracking,
  init: () => {
    utils.init();
    errorTracking.init();
    EventTracking.length;
    performanceTracking.init(console.log);
  },
};
