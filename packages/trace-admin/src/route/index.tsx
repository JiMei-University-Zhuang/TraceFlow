import RealtimeOverview from '../pages/RealtimeOverview/index';
import ErrorMonitor from '../pages/ErrorMonitor/index';
import PerformanceAnalysis from '../pages/PerformanceAnalysis/index';
import UserBehavior from '../pages/UserBehavior/index';
import { JsError } from '../pages/ErrorMonitor/JsError';
import { PromiseError } from '../pages/ErrorMonitor/PromiseError';
import { StaticResourceError } from '../pages/ErrorMonitor/StaticResourceError';
import { HttpError } from '../pages/ErrorMonitor/HttpError';
import VisitMessages from '@/pages/UserBehavior/pages/VisitMessages';
import VisualCharts from '@/pages/UserBehavior/pages/VisualCharts';

const routes = [
  { path: '/', element: <RealtimeOverview /> },
  {
    path: '/errors',
    element: <ErrorMonitor />,
    children: [
      {
        key: '1',
        label: 'JS运行异常',
        element: <JsError />,
      },
      {
        key: '2',
        label: 'Promise异常',
        element: <PromiseError />,
      },
      {
        key: '3',
        label: '静态资源加载异常',
        element: <StaticResourceError />,
      },
      {
        key: '4',
        label: 'HTTP请求异常',
        element: <HttpError />,
      },
    ],
  },
  { path: '/performance', element: <PerformanceAnalysis /> },
  {
    path: '/behavior',
    element: <UserBehavior />,
    children: [
      {
        key: '1',
        label: '访问信息',
        element: <VisitMessages />,
      },
      {
        key: '2',
        label: '数据可视化',
        element: <VisualCharts />,
      },
    ],
  },
];

export default routes;
