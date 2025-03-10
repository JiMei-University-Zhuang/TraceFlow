import { errorTracking } from './plugins/error-tracking/index';
import { EventTracking } from './plugins/event-tracking/index';

import { performanceTracking } from './plugins/performance-tracking/index';
import { utils } from './plugins/event-tracking/core/getpage';

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
