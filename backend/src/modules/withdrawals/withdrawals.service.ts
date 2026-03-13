import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Withdrawal, WithdrawalStatus } from './withdrawal.entity';
import { Wallet } from '../wallet/wallet.entity';

@Injectable()
export class WithdrawalsService {
    constructor(
        @InjectRepository(Withdrawal) private withdrawRepo: Repository<Withdrawal>,
        @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
        private dataSource: DataSource,
    ) { }

    async requestWithdrawal(userId: string, dto: {
        amount: number;
        paymentMethod: string;
        paymentDetails: any;
    }) {
        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) throw new BadRequestException('Wallet not found');
        if (Number(wallet.balance) < dto.amount) throw new BadRequestException('Insufficient balance');
        if (dto.amount < 100) throw new BadRequestException('Minimum withdrawal is ₹100');

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Freeze the amount
            await queryRunner.manager.decrement(Wallet, { userId }, 'balance', dto.amount);
            await queryRunner.manager.increment(Wallet, { userId }, 'frozenBalance', dto.amount);

            const withdrawal = this.withdrawRepo.create({
                userId,
                amount: dto.amount,
                paymentMethod: dto.paymentMethod,
                paymentDetails: dto.paymentDetails,
            });
            await queryRunner.manager.save(withdrawal);

            await queryRunner.commitTransaction();
            return withdrawal;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getWithdrawals(userId: string, page = 1, limit = 20) {
        const [items, total] = await this.withdrawRepo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { items, total, page, limit };
    }
}
