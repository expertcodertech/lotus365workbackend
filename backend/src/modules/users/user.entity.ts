import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
    OneToOne, OneToMany, Index, JoinColumn,
} from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    BANNED = 'banned',
}

export enum KycStatus {
    NONE = 'none',
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 20 })
    @Index()
    phone: string;

    @Column({ nullable: true, length: 100 })
    email: string;

    @Column({ length: 100 })
    fullName: string;

    @Column({ select: false })
    password: string;

    @Column({ unique: true, length: 20 })
    @Index()
    referralCode: string;

    @Column({ nullable: true, length: 20 })
    referredBy: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    @Column({ type: 'enum', enum: KycStatus, default: KycStatus.NONE })
    kycStatus: KycStatus;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ nullable: true })
    transactionPin: string;

    @Column({ default: false })
    isPhoneVerified: boolean;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ type: 'int', default: 0 })
    totalReferrals: number;

    @OneToOne(() => Wallet, (w) => w.userId, { nullable: true })
    wallet: Wallet;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
