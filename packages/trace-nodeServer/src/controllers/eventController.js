const Event = require('../models/Event');
const { body, validationResult } = require('express-validator');
const { sequelize, Op } = require('sequelize');

/**
 * 数据上报验证中间件
 */
const validateEventData = [body('eventType').notEmpty().withMessage('事件类型不能为空'), body('eventTime').optional().isISO8601().withMessage('事件时间格式无效')];

/**
 * 收集埋点事件数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const collectEvent = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: '请求数据验证失败',
      });
    }

    const eventData = req.body;

    // 记录客户端 IP
    eventData.ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || '未知';

    // 创建事件记录
    const event = await Event.create(eventData);

    return res.status(201).json({
      success: true,
      message: '事件数据已收集',
      eventId: event.id,
    });
  } catch (error) {
    console.error('收集事件数据失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，无法收集事件数据',
    });
  }
};

/**
 * 获取事件统计数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const getEventStats = async (req, res) => {
  try {
    // 获取查询参数
    const { startDate, endDate, eventType } = req.query;

    // 构建查询条件
    let whereClause = {};

    if (startDate && endDate) {
      whereClause.eventTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (eventType) {
      whereClause.eventType = eventType;
    }

    // 获取事件数量
    const totalEvents = await Event.count({ where: whereClause });

    // 按事件类型分组统计
    const eventsByType = await Event.findAll({
      where: whereClause,
      attributes: ['eventType', [sequelize.fn('count', sequelize.col('id')), 'count']],
      group: ['eventType'],
      raw: true,
    });

    return res.json({
      success: true,
      data: {
        totalEvents,
        eventsByType,
      },
    });
  } catch (error) {
    console.error('获取事件统计数据失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，无法获取统计数据',
    });
  }
};

module.exports = {
  validateEventData,
  collectEvent,
  getEventStats,
};
