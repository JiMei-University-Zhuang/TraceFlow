import { Layout, Menu } from 'antd';
import { Routes, Route, Link } from 'react-router-dom';
import { 
  DashboardOutlined,
  BugOutlined, 
  LineChartOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import './App.css'; // 需要创建这个CSS文件

import RealtimeOverview from './pages/RealtimeOverview/index';
import ErrorMonitor from './pages/ErrorMonitor/index';
import PerformanceAnalysis from './pages/PerformanceAnalysis/index';
import UserBehavior from './pages/UserBehavior/index';

const { Sider, Content } = Layout;

// 科技感颜色配置
const techColors = {
  primary: '#00f2fe',    // 科技蓝
  secondary: '#4facfe',  // 渐变蓝
  bgDark: '#0f172a',     // 深空背景
  accent: '#ff6b6b',     // 高亮红色
};

const App = () => {
  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined style={{ fontSize: '1.2rem', color: techColors.primary }} />,
      label: <Link to="/" className="neon-link">实时概览</Link>,
    },
    {
      key: '2',
      icon: <BugOutlined style={{ fontSize: '1.2rem', color: techColors.primary }} />,
      label: <Link to="/errors" className="neon-link">错误监控</Link>,
    },
    {
      key: '3',
      icon: <LineChartOutlined style={{ fontSize: '1.2rem', color: techColors.primary }} />,
      label: <Link to="/performance" className="neon-link">性能分析</Link>,
    },
    {
      key: '4',
      icon: <UserSwitchOutlined style={{ fontSize: '1.2rem', color: techColors.primary }} />,
      label: <Link to="/behavior" className="neon-link">用户行为</Link>,
    }
  ];

  return (
    <Layout className="h-screen tech-bg">
      <Sider
        theme="dark"
        width={240}
        breakpoint="lg"
        collapsedWidth="0"
        style={{ 
          background: `linear-gradient(195deg, ${techColors.bgDark} 0%, #1e293b 100%)`,
          borderRight: `1px solid rgba(79, 172, 254, 0.2)`
        }}
      >
        <div className="logo-container p-4 mb-4">
          <h1 className="text-xl font-bold text-gradient">DATA INSIGHT</h1>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          style={{ 
            background: 'transparent',
            borderRight: 'none',
            padding: '0 12px',
            color: '#fff' // 添加这行
          }}
          items={menuItems}
          className="tech-menu"
        />
      </Sider>
      
      <Layout>
        <Content className="p-6 bg-opacity-90" style={{ background: techColors.bgDark }}>
          <Routes>
            <Route path="/" element={<RealtimeOverview />} />
            <Route path="/errors" element={<ErrorMonitor />} />
            <Route path="/performance" element={<PerformanceAnalysis />} />
            <Route path="/behavior" element={<UserBehavior />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;