import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  // 保存单个事件
  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  // 批量保存事件
  async createEvents(createEventDtos: CreateEventDto[]): Promise<Event[]> {
    const events = createEventDtos.map((dto) =>
      this.eventsRepository.create(dto),
    );
    return this.eventsRepository.save(events);
  }

  // 获取事件列表，支持分页
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<[Event[], number]> {
    // 确保page和limit是数字类型
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    return this.eventsRepository.findAndCount({
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      order: { timestamp: 'DESC' },
    });
  }

  // 按类型统计事件
  async getEventStats(): Promise<any> {
    const eventTypes = await this.eventsRepository
      .createQueryBuilder('event')
      .select('event.eventType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.eventType')
      .getRawMany();

    // 过去24小时的事件数
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const last24Hours = await this.eventsRepository.count({
      where: { timestamp: Between(yesterday, Date.now()) },
    });

    // 构建统计结果
    const byType = {};
    let total = 0;

    eventTypes.forEach((item) => {
      byType[item.type] = parseInt(item.count);
      total += parseInt(item.count);
    });

    return {
      total,
      byType,
      last24Hours,
    };
  }
}
