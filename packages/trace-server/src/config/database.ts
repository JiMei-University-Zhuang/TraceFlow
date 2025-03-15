import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/traceflow';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');

    // 监听数据库连接事件
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    // 优雅退出
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

export const getDBStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState,
  };
};
