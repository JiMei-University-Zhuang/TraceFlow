const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// 数据库配置信息
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'traceflow',
  dialect: process.env.DB_TYPE || 'mysql',
  timezone: '+08:00', // 使用中国时区
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true, // 使用下划线命名法 (snake_case)
    freezeTableName: true, // 不自动将表名变为复数形式
    timestamps: true, // 增加 createdAt 和 updatedAt 字段
    paranoid: true, // 软删除 (增加 deletedAt 字段)
    charset: 'utf8mb4', // 支持完整的 Unicode 字符集
    collate: 'utf8mb4_unicode_ci',
  },
};

// 创建 Sequelize 实例
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  timezone: dbConfig.timezone,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
  define: dbConfig.define,
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
};

// 导出
module.exports = {
  sequelize,
  testConnection,
};
