import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { ErrorMonitoringController } from './error-monitoring.controller';
import { ErrorMonitoringService } from './error-monitoring.service';
// import { ErrorReport, ErrorReportSchema } from './entities/error-report.entity';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // 禁用 MongoDB 模块
    // MongooseModule.forFeature([
    //   { name: ErrorReport.name, schema: ErrorReportSchema },
    // ]),
  ],
  controllers: [ErrorMonitoringController],
  providers: [ErrorMonitoringService],
  exports: [ErrorMonitoringService],
})
export class ErrorMonitoringModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(JwtAuthGuard)
  //     .forRoutes({ path: 'error-monitoring/report', method: RequestMethod.POST });
  // }
}
