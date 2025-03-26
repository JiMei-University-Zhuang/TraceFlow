import { IsString, IsNumber, IsOptional } from 'class-validator';

export class PerformanceMetricDto {
  @IsString()
  metricName: string;

  @IsNumber()
  value: number;

  @IsNumber()
  timestamp: number;

  @IsString()
  @IsOptional()
  pageUrl?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  appId?: string;
}
