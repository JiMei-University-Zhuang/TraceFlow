import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('performance_metrics')
export class PerformanceMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  metricName: string;

  @Column('float')
  value: number;

  @Column('bigint')
  @Index()
  timestamp: number;

  @Column({ nullable: true })
  pageUrl: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  appId: string;

  @CreateDateColumn()
  createdAt: Date;
}
