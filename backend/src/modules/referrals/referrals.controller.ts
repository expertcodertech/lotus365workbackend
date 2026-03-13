import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards';
import { ApiResponse } from '../../common/api-response';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
    constructor(private referralsService: ReferralsService) { }

    @Get()
    async getReferrals(@CurrentUser('id') userId: string) {
        const data = await this.referralsService.getReferrals(userId);
        return ApiResponse.ok(data);
    }

    @Get('stats')
    async getStats(@CurrentUser('id') userId: string) {
        const stats = await this.referralsService.getStats(userId);
        return ApiResponse.ok(stats);
    }
}
