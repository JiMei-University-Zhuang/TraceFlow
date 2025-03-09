import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { PerformanceModule } from './performance/performance.module';
import { ErrorMonitoringModule } from './error-monitoring/error-monitoring.module';

@Module({
  imports: [EventsModule, PerformanceModule, ErrorMonitoringModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
