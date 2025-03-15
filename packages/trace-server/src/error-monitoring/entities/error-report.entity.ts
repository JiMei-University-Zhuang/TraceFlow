import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ErrorSeverity, ErrorCategory } from '../dto/error-report.dto';

@Entity('error_reports')
export class ErrorReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  stack?: string;

  @Column({ type: 'bigint' })
  timestamp: number;

  @Column()
  errorUid: string;

  @Column()
  url: string;

  @Column()
  userAgent: string;

  @Column()
  platform: string;

  @Column('jsonb')
  context: {
    severity: ErrorSeverity;
    category: ErrorCategory;
    environment: string;
    release?: string;
    tags?: Record<string, string>;
    metadata?: Record<string, unknown>;
    userId?: string;
    sessionId: string;
    deviceInfo?: {
      os: string;
      browser: string;
      device: string;
      screenResolution?: string;
    };
    networkInfo?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
  };

  @Column('jsonb')
  mechanism: {
    type: string;
    handled?: boolean;
    data?: Record<string, unknown>;
  };

  @Column('jsonb', { nullable: true })
  sampling?: {
    rate: number;
    isSelected: boolean;
  };

  @Column('jsonb', { nullable: true })
  breadcrumbs?: Array<{
    message: string;
    data?: Record<string, unknown>;
  }>;

  @Column('jsonb')
  meta: Record<string, unknown>;

  @Column()
  appId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
