import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorMonitoringController } from './error-monitoring.controller';
import { ErrorMonitoringService } from './error-monitoring.service';
import { ErrorReport, ErrorReportSchema } from './entities/error-report.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
export class ErrorMonitoringModule {
  configure(consumer: MiddlewareConsumer) {
    // 使用 JWT 认证中间件保护错误报告端点
    consumer.apply(JwtAuthGuard).forRoutes({
      path: 'error-monitoring/report',
      method: RequestMethod.POST,
    });
  }
}
