import {
    Controller, Get, Patch, Put, Post, Body, Param, Query,
    UseGuards, HttpCode,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common/guards';
import { ApiResponse } from '../../common/api-response';
import { UserStatus } from '../users/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ━━━━━━━━━━━━━ DASHBOARD ━━━━━━━━━━━━━
    @Get('dashboard')
    async getDashboard() {
        const data = await this.adminService.getDashboard();
        return ApiResponse.ok(data, 'Dashboard data retrieved');
    }

    // ━━━━━━━━━━━━━ USERS ━━━━━━━━━━━━━
    @Get('users')
    async getUsers(
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        const data = await this.adminService.getUsers(+page, +limit, search, status);
        return ApiResponse.ok(data, 'Users retrieved');
    }

    @Get('users/:id')
    async getUserDetail(@Param('id') id: string) {
        const data = await this.adminService.getUserDetail(id);
        return ApiResponse.ok(data, 'User details retrieved');
    }

    @Patch('users/:id/status')
    async updateUserStatus(
        @Param('id') id: string,
        @Body('status') status: UserStatus,
    ) {
        const data = await this.adminService.updateUserStatus(id, status);
        return ApiResponse.ok(data, `User ${status} successfully`);
    }

    // ━━━━━━━━━━━━━ TRANSACTIONS ━━━━━━━━━━━━━
    @Get('transactions')
    async getTransactions(
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('type') type?: string,
        @Query('status') status?: string,
    ) {
        const data = await this.adminService.getTransactions(+page, +limit, type, status);
        return ApiResponse.ok(data, 'Transactions retrieved');
    }

    // ━━━━━━━━━━━━━ WITHDRAWALS ━━━━━━━━━━━━━
    @Get('withdrawals')
    async getWithdrawals(
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('status') status?: string,
    ) {
        const data = await this.adminService.getWithdrawals(+page, +limit, status);
        return ApiResponse.ok(data, 'Withdrawals retrieved');
    }

    @Patch('withdrawals/:id')
    @HttpCode(200)
    async processWithdrawal(
        @Param('id') id: string,
        @Body('action') action: 'approve' | 'reject',
        @Body('adminNote') adminNote?: string,
    ) {
        const data = await this.adminService.processWithdrawal(id, action, adminNote);
        return ApiResponse.ok(data, `Withdrawal ${action}d successfully`);
    }

    // ━━━━━━━━━━━━━ CONFIG ━━━━━━━━━━━━━
    @Get('config')
    async getAllConfigs() {
        const data = await this.adminService.getAllConfigs();
        return ApiResponse.ok(data, 'Configurations retrieved');
    }

    @Put('config/:key')
    async updateConfig(
        @Param('key') key: string,
        @Body('value') value: any,
    ) {
        const data = await this.adminService.updateConfig(key, value);
        return ApiResponse.ok(data, `Config '${key}' updated`);
    }

    // ━━━━━━━━━━━━━ ANALYTICS ━━━━━━━━━━━━━
    @Get('analytics')
    async getAnalytics(@Query('days') days = 7) {
        const data = await this.adminService.getAnalytics(+days);
        return ApiResponse.ok(data, 'Analytics retrieved');
    }
}
