import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventsController {
  @Post()
  @HttpCode(HttpStatus.OK)
  async createEvent(@Body() event: CreateEventDto) {
    // 打印接收到的事件数据
    console.log('Received event:', JSON.stringify(event, null, 2));
    // 返回成功响应
    return {
      success: true,
      message: 'Event received successfully',
      timestamp: new Date().toISOString(),
      event: event,
    };
  }
}
