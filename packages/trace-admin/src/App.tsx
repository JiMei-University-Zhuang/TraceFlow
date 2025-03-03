import { Layout, Menu } from 'antd';
import { Routes, Route, Link } from'react-router-dom';
import RealtimeOverview from './pages/RealtimeOverview/index';
import ErrorMonitor from './pages/ErrorMonitor/index';
import PerformanceAnalysis from './pages/PerformanceAnalysis/index';
import UserBehavior from './pages/UserBehavior/index';


const { Header, Content } = Layout;

const App = () => {
  // 定义菜单项数组
  const menuItems = [
    {
      key: '1',
      label: <Link to="/">实时概览</Link>
    },
    {
      key: '2',
      label: <Link to="/errors">错误监控</Link>
    },
    {
      key: '3',
      label: <Link to="/performance">性能分析</Link>
    },
    {
      key: '4',
      label: <Link to="/behavior">用户行为</Link>
    }
  ];

  return (
    <Layout className="h-screen">
      <Header>
        {/* 使用 items 属性 */}
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} items={menuItems} />
      </Header>

      <Content className="p-6">
        <Routes>
          <Route path="/" element={<RealtimeOverview />} />
          <Route path="/errors" element={<ErrorMonitor />} />
          <Route path="/performance" element={<PerformanceAnalysis />} />
          <Route path="/behavior" element={<UserBehavior />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default App;