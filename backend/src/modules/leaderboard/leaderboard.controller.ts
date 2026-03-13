import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards';
import { ApiResponse } from '../../common/api-response';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
    constructor(private lbService: LeaderboardService) { }

    @Get()
    async getRankings(
        @Query('period') period: string = 'weekly',
        @Query('page') page: number = 1,
    ) {
        const result = await this.lbService.getRankings(period, page);
        return ApiResponse.ok(result);
    }

    @Get('my-rank')
    async getMyRank(@CurrentUser('id') userId: string) {
        const rank = await this.lbService.getMyRank(userId);
        return ApiResponse.ok(rank);
    }
}
