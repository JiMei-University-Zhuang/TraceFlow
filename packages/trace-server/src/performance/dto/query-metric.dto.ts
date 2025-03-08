import { IsString } from 'class-validator';

export class QueryMetricDto {
  @IsString()
  metricName: string;
}
