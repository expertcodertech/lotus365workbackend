import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual } from 'typeorm';
import { User, UserStatus, UserRole } from '../users/user.entity';
import { Wallet } from '../wallet/wallet.entity';
import { Transaction, TransactionStatus } from '../transactions/transaction.entity';
import { Withdrawal, WithdrawalStatus } from '../withdrawals/withdrawal.entity';
import { Referral } from '../referrals/referral.entity';
import { AppConfig } from '../config/config.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
        @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
        @InjectRepository(Withdrawal) private withdrawalRepo: Repository<Withdrawal>,
        @InjectRepository(Referral) private referralRepo: Repository<Referral>,
        @InjectRepository(AppConfig) private configRepo: Repository<AppConfig>,
        private dataSource: DataSource,
    ) { }

    // ━━━━━━━━━━━━━ DASHBOARD ━━━━━━━━━━━━━
    async getDashboard() {
        const totalUsers = await this.userRepo.count();
        const activeUsers = await this.userRepo.count({ where: { status: UserStatus.ACTIVE } });
        const totalTransactions = await this.txRepo.count();
        const pendingWithdrawals = await this.withdrawalRepo.count({
            where: { status: WithdrawalStatus.PENDING },
        });

        // Revenue stats
        const walletStats = await this.walletRepo
            .createQueryBuilder('w')
            .select('SUM(w.totalEarned)', 'totalPaidOut')
            .addSelect('SUM(w.balance)', 'totalBalance')
            .addSelect('SUM(w.frozenBalance)', 'totalFrozen')
            .getRawOne();

        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTx = await this.txRepo.count({
            where: { createdAt: MoreThanOrEqual(today) },
        });
        const todayUsers = await this.userRepo.count({
            where: { createdAt: MoreThanOrEqual(today) },
        });

        return {
            totalUsers,
            activeUsers,
            totalTransactions,
            pendingWithdrawals,
            totalPaidOut: parseFloat(walletStats?.totalPaidOut || '0'),
            totalBalance: parseFloat(walletStats?.totalBalance || '0'),
            totalFrozen: parseFloat(walletStats?.totalFrozen || '0'),
            todayTransactions: todayTx,
            todayNewUsers: todayUsers,
        };
    }

    // ━━━━━━━━━━━━━ USERS ━━━━━━━━━━━━━
    async getUsers(page = 1, limit = 20, search?: string, status?: string) {
        const qb = this.userRepo.createQueryBuilder('u')
            .leftJoinAndSelect('u.wallet', 'w')
            .orderBy('u.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (search) {
            qb.andWhere('(u.phone ILIKE :s OR u.fullName ILIKE :s OR u.email ILIKE :s)', { s: `%${search}%` });
        }
        if (status) {
            qb.andWhere('u.status = :status', { status });
        }

        const [users, total] = await qb.getManyAndCount();
        return {
            users: users.map((u) => ({
                id: u.id,
                phone: u.phone,
                fullName: u.fullName,
                email: u.email,
                role: u.role,
                status: u.status,
                kycStatus: u.kycStatus,
                referralCode: u.referralCode,
                referredBy: u.referredBy,
                isPhoneVerified: u.isPhoneVerified,
                totalReferrals: u.totalReferrals,
                createdAt: u.createdAt,
                wallet: u.wallet ? {
                    balance: u.wallet.balance,
                    totalEarned: u.wallet.totalEarned,
                    totalWithdrawn: u.wallet.totalWithdrawn,
                    frozenBalance: u.wallet.frozenBalance,
                } : null,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async updateUserStatus(userId: string, status: UserStatus) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        user.status = status;
        await this.userRepo.save(user);
        return { id: user.id, status: user.status, fullName: user.fullName };
    }

    async getUserDetail(userId: string) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['wallet'],
        });
        if (!user) throw new NotFoundException('User not found');

        const txCount = await this.txRepo.count({ where: { userId } });
        const referralCount = await this.referralRepo.count({ where: { referrerId: userId } });
        const withdrawals = await this.withdrawalRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 10,
        });

        return {
            ...user,
            password: undefined,
            transactionCount: txCount,
            referralCount,
            recentWithdrawals: withdrawals,
        };
    }

    // ━━━━━━━━━━━━━ TRANSACTIONS ━━━━━━━━━━━━━
    async getTransactions(page = 1, limit = 20, type?: string, status?: string) {
        const qb = this.txRepo.createQueryBuilder('t')
            .leftJoin('t.user', 'u')
            .addSelect(['u.fullName', 'u.phone'])
            .orderBy('t.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (type) qb.andWhere('t.type = :type', { type });
        if (status) qb.andWhere('t.status = :status', { status });

        const [transactions, total] = await qb.getManyAndCount();
        return {
            transactions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    // ━━━━━━━━━━━━━ WITHDRAWALS ━━━━━━━━━━━━━
    async getWithdrawals(page = 1, limit = 20, status?: string) {
        const qb = this.withdrawalRepo.createQueryBuilder('w')
            .leftJoin('w.user', 'u')
            .addSelect(['u.fullName', 'u.phone'])
            .orderBy('w.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (status) qb.andWhere('w.status = :status', { status });

        const [withdrawals, total] = await qb.getManyAndCount();
        return {
            withdrawals,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async processWithdrawal(id: string, action: 'approve' | 'reject', adminNote?: string) {
        return this.dataSource.transaction(async (manager) => {
            const withdrawal = await manager.findOne(Withdrawal, {
                where: { id },
                relations: ['user'],
            });
            if (!withdrawal) throw new NotFoundException('Withdrawal not found');
            if (withdrawal.status !== WithdrawalStatus.PENDING) {
                throw new BadRequestException(`Withdrawal already ${withdrawal.status}`);
            }

            if (action === 'approve') {
                withdrawal.status = WithdrawalStatus.APPROVED;
                // Deduct from frozen, add to withdrawn
                const wallet = await manager.findOne(Wallet, { where: { userId: withdrawal.userId } });
                if (wallet) {
                    wallet.frozenBalance = Math.max(0, wallet.frozenBalance - withdrawal.amount);
                    wallet.totalWithdrawn += withdrawal.amount;
                    await manager.save(wallet);
                }
            } else {
                withdrawal.status = WithdrawalStatus.REJECTED;
                // Unfreeze the amount
                const wallet = await manager.findOne(Wallet, { where: { userId: withdrawal.userId } });
                if (wallet) {
                    wallet.frozenBalance = Math.max(0, wallet.frozenBalance - withdrawal.amount);
                    wallet.balance += withdrawal.amount; // Return to available balance
                    await manager.save(wallet);
                }
            }

            if (adminNote) withdrawal.adminNote = adminNote;
            withdrawal.processedAt = new Date();
            await manager.save(withdrawal);

            return {
                id: withdrawal.id,
                status: withdrawal.status,
                amount: withdrawal.amount,
                processedAt: withdrawal.processedAt,
            };
        });
    }

    // ━━━━━━━━━━━━━ CONFIG ━━━━━━━━━━━━━
    async getAllConfigs() {
        return this.configRepo.find({ order: { key: 'ASC' } });
    }

    async updateConfig(key: string, value: any) {
        let config = await this.configRepo.findOne({ where: { key } });
        if (!config) {
            config = this.configRepo.create({ key, value });
        } else {
            config.value = value;
        }
        return this.configRepo.save(config);
    }

    // ━━━━━━━━━━━━━ ANALYTICS ━━━━━━━━━━━━━
    async getAnalytics(days = 7) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        // Daily transaction counts
        const dailyTx = await this.txRepo
            .createQueryBuilder('t')
            .select("DATE(t.createdAt)", 'date')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(t.amount)', 'volume')
            .where('t.createdAt >= :since', { since })
            .groupBy("DATE(t.createdAt)")
            .orderBy('date', 'ASC')
            .getRawMany();

        // Daily user signups
        const dailyUsers = await this.userRepo
            .createQueryBuilder('u')
            .select("DATE(u.createdAt)", 'date')
            .addSelect('COUNT(*)', 'count')
            .where('u.createdAt >= :since', { since })
            .groupBy("DATE(u.createdAt)")
            .orderBy('date', 'ASC')
            .getRawMany();

        return { dailyTransactions: dailyTx, dailySignups: dailyUsers };
    }
}
