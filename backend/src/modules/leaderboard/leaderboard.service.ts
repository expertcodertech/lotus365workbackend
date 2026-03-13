import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';
import { User } from '../users/user.entity';

@Injectable()
export class LeaderboardService {
    constructor(
        @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
        @InjectRepository(User) private userRepo: Repository<User>,
    ) { }

    async getRankings(period: string = 'weekly', page = 1, limit = 50) {
        // TODO: In production, cache this in Redis with 1-min TTL
        const query = this.walletRepo
            .createQueryBuilder('w')
            .innerJoin(User, 'u', 'u.id = w."userId"')
            .select([
                'w."userId" as "userId"',
                'u."fullName" as "fullName"',
                'u."avatarUrl" as "avatarUrl"',
                'w."totalEarned" as "totalEarned"',
            ])
            .orderBy('w."totalEarned"', 'DESC')
            .offset((page - 1) * limit)
            .limit(limit);

        const results = await query.getRawMany();
        const total = await this.walletRepo.count();

        // Separate top 3 and rest
        const topThree = results.slice(0, 3).map((r, i) => ({
            rank: i + 1,
            userId: r.userId,
            fullName: r.fullName,
            avatarUrl: r.avatarUrl,
            totalEarned: r.totalEarned,
        }));

        const rankings = results.slice(3).map((r, i) => ({
            rank: i + 4,
            userId: r.userId,
            fullName: r.fullName,
            avatarUrl: r.avatarUrl,
            totalEarned: r.totalEarned,
        }));

        return { period, topThree, rankings, total };
    }

    async getMyRank(userId: string) {
        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) return { rank: 0, totalEarned: 0 };

        const higherCount = await this.walletRepo
            .createQueryBuilder('w')
            .where('w."totalEarned" > :earned', { earned: wallet.totalEarned })
            .getCount();

        return { rank: higherCount + 1, totalEarned: wallet.totalEarned };
    }
}
