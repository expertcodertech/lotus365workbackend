import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('referrals')
export class Referral {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    @Index()
    referrerId: string; // The user who referred

    @Column({ type: 'uuid' })
    @Index()
    referredUserId: string; // The user who was referred

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    commissionEarned: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
