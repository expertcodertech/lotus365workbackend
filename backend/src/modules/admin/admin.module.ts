import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/user.entity';
import { Wallet } from '../wallet/wallet.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Withdrawal } from '../withdrawals/withdrawal.entity';
import { Referral } from '../referrals/referral.entity';
import { AppConfig } from '../config/config.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Wallet, Transaction, Withdrawal, Referral, AppConfig]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
