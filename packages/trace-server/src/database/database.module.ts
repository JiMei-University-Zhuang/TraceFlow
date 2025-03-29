import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get('DB_TYPE', 'sqlite');

        if (dbType === 'sqlite') {
          return {
            type: 'sqlite',
            database: ':memory:',
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
            name: 'default',
          };
        } else {
          return {
            type: 'mysql',
            host: configService.get('DB_HOST', 'localhost'),
            port: configService.get('DB_PORT', 3306),
            username: configService.get('DB_USERNAME', 'root'),
            password: configService.get('DB_PASSWORD', 'password'),
            database: configService.get('DB_DATABASE', 'traceflow'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: configService.get('DB_SYNCHRONIZE', true), // 开发环境设为true，生产环境应设为false
            name: 'default',
          };
        }
      },
    }),
  ],
})
export class DatabaseModule {}
