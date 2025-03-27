import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { PerformanceService } from '../performance/performance.service';
import { EventsService } from './events.service';
import { ApiResponse } from '../common/dto/api-response.dto';

@Controller('events')
export class EventsController {
  constructor(
    private readonly performanceService: PerformanceService,
    private readonly eventsService: EventsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createEvent(@Body() event: CreateEventDto) {
    // 保存事件到数据库
    const savedEvent = await this.eventsService.createEvent(event);

    return {
      success: true,
      message: 'Event received successfully',
      timestamp: new Date().toISOString(),
      event: savedEvent,
    };
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  async processBatchEvents(@Body() events: CreateEventDto[]) {
    console.log(`Processing ${events.length} batch events`);

    // 统计计数器
    const stats = {
      total: events.length,
      processed: 0,
      byType: {},
    };

    // 确保每个事件都有eventType
    const validEvents = events.filter((event) => {
      if (!event.eventType) {
        console.log('Skipping event without eventType:', event);
        return false;
      }
      return true;
    });

    if (validEvents.length === 0) {
      return new ApiResponse(
        { error: 'No valid events found' },
        '未找到有效事件',
      );
    }

    // 保存所有事件到数据库
    await this.eventsService.createEvents(validEvents);

    // 处理每个事件
    for (const event of validEvents) {
      // 统计事件类型
      const eventType = event.eventType;
      stats.byType[eventType] = (stats.byType[eventType] || 0) + 1;

      // 处理性能事件
      if (eventType === 'performance' && event.eventData) {
        stats.processed++;

        // 将每个性能指标转换为单独的指标记录并保存
        for (const [metricName, value] of Object.entries(event.eventData)) {
          if (typeof value === 'number') {
            await this.performanceService.saveMetric({
              metricName,
              value,
              timestamp: event.timestamp || Date.now(),
              pageUrl: event.pageUrl,
              userAgent: event.userAgent,
              appId: event.appId,
            });
          }
        }
      }
    }

    return new ApiResponse(stats, '批量事件处理完成');
  }

  @Get()
  async getEvents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    // 确保page和limit是数字类型
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const [events, total] = await this.eventsService.findAll(pageNum, limitNum);

    return {
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    };
  }

  @Get('stats')
  async getEventStats() {
    const stats = await this.eventsService.getEventStats();

    return {
      success: true,
      data: stats,
    };
  }
}
