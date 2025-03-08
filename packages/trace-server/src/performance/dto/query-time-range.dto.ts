import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryTimeRangeDto {
  @IsOptional()
  @IsString()
  range?: string; // 相对时间范围，如 '1h'(最近1小时), '1d'(最近1天), '7d'(最近7天)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startTime?: number; // 开始时间戳（毫秒）

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  endTime?: number; // 结束时间戳（毫秒）

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number; // 返回的最大条数
}
