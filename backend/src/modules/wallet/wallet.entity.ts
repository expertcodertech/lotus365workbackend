import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
    OneToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', unique: true })
    @Index()
    userId: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    balance: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalEarned: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalWithdrawn: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    todayEarning: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    referralEarned: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    bonusEarned: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    frozenBalance: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
