import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards';
import { ApiResponse, paginate } from '../../common/api-response';
import { IsNumber, IsString, IsObject, Min } from 'class-validator';

class WithdrawDto {
    @IsNumber() @Min(100)
    amount: number;

    @IsString()
    paymentMethod: string;

    @IsObject()
    paymentDetails: any;
}

@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalsController {
    constructor(private withdrawService: WithdrawalsService) { }

    @Post()
    async request(@CurrentUser('id') userId: string, @Body() dto: WithdrawDto) {
        const result = await this.withdrawService.requestWithdrawal(userId, dto);
        return ApiResponse.ok(result, 'Withdrawal request submitted');
    }

    @Get()
    async list(
        @CurrentUser('id') userId: string,
        @Query('page') page: number = 1,
    ) {
        const result = await this.withdrawService.getWithdrawals(userId, page);
        return ApiResponse.paginated(result.items, paginate(result.page, result.limit, result.total));
    }
}
