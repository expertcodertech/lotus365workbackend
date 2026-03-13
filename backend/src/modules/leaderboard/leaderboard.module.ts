import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { Wallet } from '../wallet/wallet.entity';
import { User } from '../users/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Wallet, User])],
    controllers: [LeaderboardController],
    providers: [LeaderboardService],
})
export class LeaderboardModule { }
