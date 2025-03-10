import { IsString, IsNumber } from 'class-validator';

export class PerformanceMetricDto {
  @IsString()
  metricName: string;

  @IsNumber()
  value: number;

  @IsNumber()
  timestamp: number;
}
