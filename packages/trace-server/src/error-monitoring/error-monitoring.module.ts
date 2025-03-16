import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorMonitoringController } from './error-monitoring.controller';
import { ErrorMonitoringService } from './error-monitoring.service';
import { ErrorReport, ErrorReportSchema } from './entities/error-report.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ErrorReport.name, schema: ErrorReportSchema },
    ]),
  ],
  controllers: [ErrorMonitoringController],
  providers: [ErrorMonitoringService],
  exports: [ErrorMonitoringService],
})
export class ErrorMonitoringModule {}
