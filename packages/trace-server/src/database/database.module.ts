import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { generateSimpleUUID } from '../common/utils/uuid.util';
import * as mysql2 from 'mysql2';

// 使用我们自己的生成函数创建一个固定的连接名
// 这个固定名称能避免TypeORM尝试使用crypto.randomUUID()
const CONNECTION_NAME = generateSimpleUUID();

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get('DB_TYPE', 'sqlite');

        const commonConfig = {
          // 确保name属性存在，避免TypeORM内部生成UUID
          name: CONNECTION_NAME,
          // 确保有实体定义
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        };

        if (dbType === 'sqlite') {
          return {
            ...commonConfig,
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
          };
        } else {
          return {
            ...commonConfig,
            type: 'mysql',
            host: configService.get('DB_HOST', 'localhost'),
            port: configService.get('DB_PORT', 3306),
            username: configService.get('DB_USERNAME', 'root'),
            password: configService.get('DB_PASSWORD', 'password'),
            database: configService.get('DB_DATABASE', 'traceflow'),
            synchronize: configService.get('DB_SYNCHRONIZE', true),
            extra: {
              authPlugin: 'mysql_native_password',
            },
            driver: mysql2,
            retryAttempts: 10,
            retryDelay: 3000,
            logging: ['error', 'warn', 'schema'],
          };
        }
      },
    }),
  ],
})
export class DatabaseModule {}
