import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module';
import { ErrorMonitoringModule } from './error-monitoring/error-monitoring.module';
import { EventsModule } from './events/events.module';
import { PerformanceModule } from './performance/performance.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DatabaseModule,
    // UsersModule,
    // AuthModule,
    ErrorMonitoringModule,
    EventsModule,
    PerformanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log('应用启动成功');
  }

  async onModuleDestroy() {
    console.log('应用关闭');
  }
}
