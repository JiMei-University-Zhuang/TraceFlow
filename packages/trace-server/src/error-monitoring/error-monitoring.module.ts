import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorMonitoringController } from './error-monitoring.controller';
import { ErrorMonitoringService } from './error-monitoring.service';
import { ErrorReport } from './entities/error-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorReport])],
  controllers: [ErrorMonitoringController],
  providers: [ErrorMonitoringService],
  exports: [ErrorMonitoringService],
})
export class ErrorMonitoringModule {}
