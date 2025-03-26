import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  eventType: string;

  @Column('bigint')
  @Index()
  timestamp: number;

  @Column({ nullable: true })
  pageUrl: string;

  @Column({ type: 'json', nullable: true })
  eventData: Record<string, any>;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  appId: string;

  @CreateDateColumn()
  createdAt: Date;
}
