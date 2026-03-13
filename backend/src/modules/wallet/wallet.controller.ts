import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards';
import { ApiResponse, paginate } from '../../common/api-response';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
    constructor(private walletService: WalletService) { }

    @Get()
    async getWallet(@CurrentUser('id') userId: string) {
        const wallet = await this.walletService.getWallet(userId);
        return ApiResponse.ok(wallet);
    }

    @Get('transactions')
    async getTransactions(
        @CurrentUser('id') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        const result = await this.walletService.getTransactions(userId, page, limit);
        return ApiResponse.paginated(result.items, paginate(result.page, result.limit, result.total));
    }

    @Get('earnings')
    async getEarnings(
        @CurrentUser('id') userId: string,
        @Query('period') period: string = 'weekly',
    ) {
        const earnings = await this.walletService.getEarnings(userId, period);
        return ApiResponse.ok(earnings);
    }
}
