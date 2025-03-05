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
  type: string;

  @IsNumber()
  timestamp: number;

  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  data?: Record<string, any>;
}
