import {
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  RUNTIME = 'runtime',
  NETWORK = 'network',
  RESOURCE = 'resource',
  PROMISE = 'promise',
  SYNTAX = 'syntax',
  SECURITY = 'security',
  CUSTOM = 'custom',
}

export class DeviceInfoDto {
  @IsString()
  os: string;

  @IsString()
  browser: string;

  @IsString()
  device: string;

  @IsOptional()
  @IsString()
  screenResolution?: string;
}

export class NetworkInfoDto {
  @IsOptional()
  @IsString()
  effectiveType?: string;

  @IsOptional()
  @IsNumber()
  downlink?: number;

  @IsOptional()
  @IsNumber()
  rtt?: number;
}

export class ErrorContextDto {
  @IsEnum(ErrorSeverity)
  severity: ErrorSeverity;

  @IsEnum(ErrorCategory)
  category: ErrorCategory;

  @IsOptional()
  @IsObject()
  tags?: Record<string, string>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  sessionId: string;

  @IsString()
  environment: string;

  @IsOptional()
  @IsString()
  release?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NetworkInfoDto)
  networkInfo?: NetworkInfoDto;
}

export class ErrorMechanismDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsObject()
  handled?: boolean;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class ErrorReportDto {
  @IsString()
  type: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  stack?: string;

  @IsNumber()
  timestamp: number;

  @IsString()
  errorUid: string;

  @IsString()
  url: string;

  @IsString()
  userAgent: string;

  @IsString()
  platform: string;

  @ValidateNested()
  @Type(() => ErrorContextDto)
  context: ErrorContextDto;

  @ValidateNested()
  @Type(() => ErrorMechanismDto)
  mechanism: ErrorMechanismDto;

  @IsOptional()
  @IsObject()
  sampling?: {
    rate: number;
    isSelected: boolean;
  };

  @IsOptional()
  @IsArray()
  breadcrumbs?: Array<{
    message: string;
    data?: Record<string, unknown>;
  }>;

  @IsObject()
  meta: Record<string, unknown>;

  @IsString()
  appId: string;
}
