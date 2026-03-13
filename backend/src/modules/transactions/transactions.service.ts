import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from './transaction.entity';
import { Wallet } from '../wallet/wallet.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
        @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
        private dataSource: DataSource,
    ) { }

    async buy(userId: string, amount: number) {
        if (amount <= 0) throw new BadRequestException('Amount must be positive');

        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) throw new BadRequestException('Wallet not found');
        if (Number(wallet.balance) < amount) throw new BadRequestException('Insufficient balance');

        // Use transaction for atomicity
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const rewardPercentage = 0.02; // 2% reward — admin configurable
            const rewardAmount = amount * rewardPercentage;

            const tx = this.txRepo.create({
                userId,
                type: TransactionType.BUY,
                amount,
                rewardAmount,
                status: TransactionStatus.COMPLETED,
                referenceId: `TXN-BUY-${Date.now()}-${uuid().substring(0, 4)}`,
                description: `Buy order of ₹${amount}`,
            });

            await queryRunner.manager.save(tx);
            await queryRunner.manager.decrement(Wallet, { userId }, 'balance', amount);
            await queryRunner.manager.increment(Wallet, { userId }, 'totalEarned', rewardAmount);
            await queryRunner.commitTransaction();

            return tx;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async sell(userId: string, amount: number) {
        if (amount <= 0) throw new BadRequestException('Amount must be positive');

        const rewardPercentage = 0.02;
        const rewardAmount = amount * rewardPercentage;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const tx = this.txRepo.create({
                userId,
                type: TransactionType.SELL,
                amount,
                rewardAmount,
                status: TransactionStatus.COMPLETED,
                referenceId: `TXN-SELL-${Date.now()}-${uuid().substring(0, 4)}`,
                description: `Sell order of ₹${amount}`,
            });

            await queryRunner.manager.save(tx);
            await queryRunner.manager.increment(Wallet, { userId }, 'balance', amount + rewardAmount);
            await queryRunner.manager.increment(Wallet, { userId }, 'totalEarned', rewardAmount);
            await queryRunner.commitTransaction();

            return tx;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getHistory(userId: string, type?: string, page = 1, limit = 20) {
        const where: any = { userId };
        if (type) where.type = type;

        const [items, total] = await this.txRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { items, total, page, limit };
    }
}
