import { Module } from '@nestjs/common';
import { ErrorMonitoringController } from './error-monitoring.controller';
import { ErrorMonitoringService } from './error-monitoring.service';

@Module({
  controllers: [ErrorMonitoringController],
  providers: [ErrorMonitoringService],
})
export class ErrorMonitoringModule {}
