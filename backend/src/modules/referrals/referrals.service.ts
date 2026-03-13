import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './referral.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ReferralsService {
    constructor(
        @InjectRepository(Referral) private referralRepo: Repository<Referral>,
        @InjectRepository(User) private userRepo: Repository<User>,
    ) { }

    async getReferrals(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });

        const referrals = await this.referralRepo
            .createQueryBuilder('r')
            .innerJoin(User, 'u', 'u.id = r."referredUserId"')
            .select([
                'r.id as id',
                'r."referredUserId" as "userId"',
                'u."fullName" as "name"',
                'u.status as status',
                'r."commissionEarned" as "commissionEarned"',
                'r."createdAt" as "joinedAt"',
            ])
            .where('r."referrerId" = :userId', { userId })
            .orderBy('r."createdAt"', 'DESC')
            .getRawMany();

        const totalCommission = referrals.reduce(
            (sum, r) => sum + Number(r.commissionEarned || 0), 0,
        );
        const activeCount = referrals.filter(r => r.status === 'active').length;

        return {
            referralCode: user?.referralCode,
            referralLink: `https://lotus365.app/ref/${user?.referralCode}`,
            totalReferrals: referrals.length,
            activeReferrals: activeCount,
            totalCommission,
            referrals,
        };
    }

    async getStats(userId: string) {
        const referrals = await this.referralRepo.find({
            where: { referrerId: userId },
        });

        const totalCommission = referrals.reduce(
            (sum, r) => sum + Number(r.commissionEarned || 0), 0,
        );

        return {
            totalReferrals: referrals.length,
            activeReferrals: referrals.filter(r => r.isActive).length,
            totalCommission,
        };
    }
}
