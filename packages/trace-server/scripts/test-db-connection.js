/**
 * 数据库连接测试脚本
 *
 * 使用方法:
 * node scripts/test-db-connection.js
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mysql = require('mysql2/promise');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require('dotenv');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');

// 加载环境变量
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env file found, using existing environment variables');
  dotenv.config();
}

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Connection details:');
  console.log(`- Host: ${process.env.DB_HOST}`);
  console.log(`- Port: ${process.env.DB_PORT}`);
  console.log(`- Database: ${process.env.DB_DATABASE}`);
  console.log(`- Username: ${process.env.DB_USERNAME}`);
  console.log(`- Password: ${process.env.DB_PASSWORD ? '******' : 'Not set'}`);

  try {
    // 创建连接
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    console.log('✅ Connection successful!');

    // 测试查询
    console.log('Testing query execution...');
    const [rows] = await connection.execute('SELECT 1 as result');
    console.log('✅ Query executed successfully:', rows);

    // 关闭连接
    await connection.end();
    console.log('Connection closed');

    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }

    // 提供解决建议
    provideTroubleshootingTips(error);

    return false;
  }
}

function provideTroubleshootingTips(error) {
  console.log('\n--- Troubleshooting Tips ---');

  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.log('1. 用户名或密码可能不正确');
    console.log('2. MySQL用户可能没有足够的权限');
    console.log('3. MySQL可能使用了不同的身份验证插件');
    console.log('\n建议:');
    console.log(
      '- 在MySQL中执行: `SELECT user, host, plugin FROM mysql.user WHERE user="root";`',
    );
    console.log(
      '- 如果plugin是"auth_socket"或"caching_sha2_password", 尝试修改为mysql_native_password:',
    );
    console.log(
      '  `ALTER USER "root"@"localhost" IDENTIFIED WITH mysql_native_password BY "your_password";`',
    );
    console.log('  `FLUSH PRIVILEGES;`');
  } else if (error.code === 'ECONNREFUSED') {
    console.log('1. MySQL服务可能未运行');
    console.log('2. 主机名或端口可能不正确');
    console.log('\n建议:');
    console.log('- 检查MySQL服务状态: `service mysql status`');
    console.log('- 尝试重启MySQL: `service mysql restart`');
  } else if (error.code === 'ER_DB_CREATE_EXISTS') {
    console.log('1. 尝试创建已存在的数据库');
    console.log('\n建议:');
    console.log('- 检查数据库是否已存在: `SHOW DATABASES;`');
  } else if (error.code === 'ER_BAD_DB_ERROR') {
    console.log('1. 数据库不存在');
    console.log('\n建议:');
    console.log('- 创建数据库: `CREATE DATABASE traceflow;`');
  }

  console.log('\n其他通用建议:');
  console.log('1. 确认MySQL服务器已启动');
  console.log(
    '2. 检查用户权限: `GRANT ALL PRIVILEGES ON traceflow.* TO "root"@"localhost";`',
  );
  console.log('3. 创建新的专用数据库用户:');
  console.log('   ```');
  console.log(
    '   CREATE USER "traceflow"@"localhost" IDENTIFIED BY "password";',
  );
  console.log(
    '   GRANT ALL PRIVILEGES ON traceflow.* TO "traceflow"@"localhost";',
  );
  console.log('   FLUSH PRIVILEGES;');
  console.log('   ```');
}

testConnection();
