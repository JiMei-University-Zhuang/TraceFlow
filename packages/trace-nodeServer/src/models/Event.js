const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * 埋点事件模型
 * 用于存储用户行为、页面访问、性能指标等埋点数据
 */
const Event = sequelize.define(
  'Event',
  {
    // 事件ID
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // 事件类型 (page_view, click, custom, error, performance)
    eventType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '事件类型',
    },

    // 事件名称
    eventName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '事件名称',
    },

    // 事件发生时间
    eventTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '事件发生时间',
    },

    // 用户ID (可选)
    userId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '用户ID',
    },

    // 会话ID
    sessionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '会话ID',
    },

    // 设备信息
    deviceInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '设备信息(浏览器、操作系统等)',
    },

    // URL信息
    url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: '页面URL',
    },

    // 页面标题
    pageTitle: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '页面标题',
    },

    // 引荐来源
    referrer: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: '引荐来源',
    },

    // 事件详细数据
    eventData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '事件相关的详细数据',
    },

    // IP地址
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址',
    },
  },
  {
    tableName: 'events',
    indexes: [{ fields: ['eventType'] }, { fields: ['userId'] }, { fields: ['sessionId'] }, { fields: ['eventTime'] }],
    comment: '埋点事件数据表',
  },
);

module.exports = Event;
