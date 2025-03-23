# TraceFlow SDK

A comprehensive frontend full-link monitoring SDK for capturing errors, performance metrics, and user behavior.

## Features

- **Error Tracking**: Automatically captures JavaScript errors, promise rejections, resource loading errors, and HTTP request failures
- **Performance Monitoring**: Tracks Web Vitals, page load times, resource loading, and API performance
- **User Behavior Tracking**: Records user interactions, page navigation, and session information
- **Flexible Configuration**: Customizable filtering, sampling, and reporting options
- **Real-time and Batch Reporting**: Send critical issues immediately while batching non-critical data

## Installation

```bash
npm install @traceflow/sdk
```

## Basic Usage

```javascript
import TraceSDK from '@traceflow/sdk';

const sdk = new TraceSDK({
  appId: 'your-app-id',
  reportUrl: 'https://your-backend-endpoint/report',
  environment: 'production',
  tags: {
    version: '1.0.0',
    team: 'frontend',
  },
});
```

## Advanced Configuration

```javascript
import TraceSDK from '@traceflow/sdk';

const sdk = new TraceSDK({
  appId: 'your-app-id',
  reportUrl: 'https://your-backend-endpoint/report',
  errorFilter: error => {
    // Filter out specific errors
    return !error.message.includes('ResizeObserver');
  },
  environment: 'production',
  release: 'v1.1.0',
  tags: {
    version: '1.0.0',
    team: 'frontend',
  },
});

// Initialize Axios monitoring
const http = sdk.initAxios();
```

## HTTP Monitoring

The SDK can automatically monitor HTTP requests through either native XMLHttpRequest/fetch or Axios:

```javascript
// For Axios
const http = sdk.initAxios();

// Use the returned instance for your API calls
http
  .get('/api/users')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

## Manual Event Tracking

You can manually track specific events:

```javascript
import { Tracker } from '@traceflow/sdk';

const tracker = new Tracker({
  endpoint: 'https://your-backend-endpoint/report',
  autoTrack: {
    pageView: true,
    click: true,
    performance: true,
  },
});

// Track custom events
tracker.trackEvent('custom_event', true, {
  action: 'button_click',
  label: 'submit_form',
  value: 1,
});

// Report performance metrics
tracker.reportPerformance({
  customMetric: 250,
  operation: 'data_processing',
});

// Report user behavior
tracker.reportBehavior('user_action', {
  action: 'toggle_setting',
  target: 'dark_mode',
  value: true,
});

// Report errors
tracker.reportError(new Error('Something went wrong'), {
  component: 'PaymentForm',
  userId: '12345',
});
```

## License

ISC
