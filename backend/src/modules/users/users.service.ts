import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Wallet } from '../wallet/wallet.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    ) { }

    async getProfile(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const wallet = await this.walletRepo.findOne({ where: { userId } });

        return {
            id: user.id,
            phone: user.phone,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            referralCode: user.referralCode,
            role: user.role,
            status: user.status,
            kycStatus: user.kycStatus,
            isPhoneVerified: user.isPhoneVerified,
            totalReferrals: user.totalReferrals,
            balance: wallet?.balance || 0,
            totalEarned: wallet?.totalEarned || 0,
            referralEarned: wallet?.referralEarned || 0,
            memberSince: user.createdAt,
        };
    }

    async updateProfile(userId: string, dto: { fullName?: string; email?: string; avatarUrl?: string }) {
        await this.userRepo.update(userId, dto);
        return this.getProfile(userId);
    }
}
