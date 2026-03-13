import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import { Withdrawal } from './withdrawal.entity';
import { Wallet } from '../wallet/wallet.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Withdrawal, Wallet])],
    controllers: [WithdrawalsController],
    providers: [WithdrawalsService],
})
export class WithdrawalsModule { }
