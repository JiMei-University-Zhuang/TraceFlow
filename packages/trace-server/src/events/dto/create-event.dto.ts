import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  eventType: string;

  @IsNumber()
  timestamp: number;

  @IsString()
  pageUrl: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  eventData: Record<string, any>;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  appId?: string;
}
