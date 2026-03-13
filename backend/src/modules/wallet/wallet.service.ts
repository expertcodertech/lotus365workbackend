import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
        @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    ) { }

    async getWallet(userId: string) {
        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) throw new NotFoundException('Wallet not found');
        return wallet;
    }

    async getTransactions(userId: string, page = 1, limit = 20) {
        const [items, total] = await this.txRepo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { items, total, page, limit };
    }

    async getEarnings(userId: string, period: string = 'weekly') {
        const wallet = await this.getWallet(userId);
        return {
            period,
            totalEarned: wallet.totalEarned,
            todayEarning: wallet.todayEarning,
            referralEarned: wallet.referralEarned,
            bonusEarned: wallet.bonusEarned,
        };
    }
}
