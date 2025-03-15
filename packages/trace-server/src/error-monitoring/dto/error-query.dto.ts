import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ErrorSeverity, ErrorCategory } from './error-report.dto';

export class ErrorQueryDto {
  @IsOptional()
  @IsString()
  appId?: string;

  @IsOptional()
  @IsEnum(ErrorSeverity)
  severity?: ErrorSeverity;

  @IsOptional()
  @IsEnum(ErrorCategory)
  category?: ErrorCategory;

  @IsOptional()
  @IsString()
  errorUid?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  environment?: string;

  @IsOptional()
  @IsString()
  release?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  searchText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: 'timestamp' | 'severity' | 'category' = 'timestamp';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
