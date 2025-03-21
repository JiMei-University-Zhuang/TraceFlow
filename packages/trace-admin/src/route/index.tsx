import RealtimeOverview from '../pages/RealtimeOverview/index';
import ErrorMonitor from '../pages/ErrorMonitor/index';
import PerformanceAnalysis from '../pages/PerformanceAnalysis/index';
import UserBehavior from '../pages/UserBehavior/index';
const element = [
  { path: '/', element: <RealtimeOverview /> },
  { path: '/errors', element: <ErrorMonitor /> },
  { path: '/performance', element: <PerformanceAnalysis /> },
  { path: '/behavior', element: <UserBehavior /> },
];
export default element;
