import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { PerformanceModule } from './performance/performance.module';

@Module({
  imports: [EventsModule, PerformanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
