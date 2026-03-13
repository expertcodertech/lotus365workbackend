import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards';
import { ApiResponse, paginate } from '../../common/api-response';
import { IsNumber, Min } from 'class-validator';

class OrderDto {
    @IsNumber() @Min(1)
    amount: number;
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
    constructor(private txService: TransactionsService) { }

    @Post('buy')
    async buy(@CurrentUser('id') userId: string, @Body() dto: OrderDto) {
        const tx = await this.txService.buy(userId, dto.amount);
        return ApiResponse.ok(tx, 'Buy order placed successfully');
    }

    @Post('sell')
    async sell(@CurrentUser('id') userId: string, @Body() dto: OrderDto) {
        const tx = await this.txService.sell(userId, dto.amount);
        return ApiResponse.ok(tx, 'Sell order placed successfully');
    }

    @Get('history')
    async getHistory(
        @CurrentUser('id') userId: string,
        @Query('type') type?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        const result = await this.txService.getHistory(userId, type, page, limit);
        return ApiResponse.paginated(result.items, paginate(result.page, result.limit, result.total));
    }
}
