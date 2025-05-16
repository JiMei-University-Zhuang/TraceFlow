const express = require('express');
const router = express.Router();

// 导入各个模块的路由
// const userRoutes = require('./userRoutes');
// const analyticsRoutes = require('./analyticsRoutes');
// const eventRoutes = require('./eventRoutes');

// 基础API路由
router.get('/', (req, res) => {
  res.json({
    message: 'TraceFlow API 服务',
    version: '1.0.0',
    status: 'running',
  });
});

// 注册路由模块
// router.use('/users', userRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/events', eventRoutes);

// 示例路由 - 埋点数据上报
router.post('/collect', (req, res) => {
  const eventData = req.body;
  console.log('收到埋点数据:', eventData);
  res.status(200).json({ success: true, message: '数据已收集' });
});

module.exports = router;
