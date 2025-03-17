import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ErrorSeverity, ErrorCategory } from '../enums';

@Schema({ timestamps: true })
export class ErrorReport extends Document {
  @Prop({ required: true })
  errorUid: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  stack?: string;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  url: string;

  @Prop()
  userAgent?: string;

  @Prop()
  platform?: string;

  @Prop({ required: true })
  appId: string;

  @Prop({ type: String, enum: ErrorSeverity, default: ErrorSeverity.MEDIUM })
  severity: ErrorSeverity;

  @Prop({ type: String, enum: ErrorCategory, default: ErrorCategory.CUSTOM })
  category: ErrorCategory;

  @Prop({ type: Object })
  context: {
    environment?: string;
    tags?: Record<string, string>;
    deviceInfo?: {
      os?: string;
      browser?: string;
      device?: string;
      screenResolution?: string;
    };
    networkInfo?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
    sessionId?: string;
    userId?: string;
  };

  @Prop({ type: Object })
  mechanism?: {
    type: string;
    handled: boolean;
    data?: Record<string, any>;
  };

  @Prop({ type: Object })
  sampling?: {
    rate: number;
    isSelected: boolean;
  };

  @Prop({ type: Object })
  meta?: Record<string, any>;
}

export const ErrorReportSchema = SchemaFactory.createForClass(ErrorReport);

// 创建索引
ErrorReportSchema.index({ timestamp: -1 });
ErrorReportSchema.index({ appId: 1 });
ErrorReportSchema.index({ errorUid: 1 }, { unique: true });
ErrorReportSchema.index({ 'context.userId': 1 });
ErrorReportSchema.index({ severity: 1 });
ErrorReportSchema.index({ category: 1 });
