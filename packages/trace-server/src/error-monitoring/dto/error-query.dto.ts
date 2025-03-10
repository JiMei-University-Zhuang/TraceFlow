import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum ErrorType {
  ERROR = 'Error',
  TYPE_ERROR = 'TypeError',
  REFERENCE_ERROR = 'ReferenceError',
  SYNTAX_ERROR = 'SyntaxError',
  RANGE_ERROR = 'RangeError',
  OTHER = 'Other',
}

export class ErrorQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startTime?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  endTime?: number;

  @IsOptional()
  @IsEnum(ErrorType)
  type?: ErrorType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  userId?: string;
}
