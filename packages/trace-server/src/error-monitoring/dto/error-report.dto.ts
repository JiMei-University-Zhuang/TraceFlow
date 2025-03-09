import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class ErrorReportDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  stack: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsNumber()
  @IsNotEmpty()
  timestamp: number;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  environment?: string;
}
