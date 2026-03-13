import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, CurrentUser } from '../../common/guards';
import { ApiResponse } from '../../common/api-response';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('me')
    async getProfile(@CurrentUser('id') userId: string) {
        const profile = await this.usersService.getProfile(userId);
        return ApiResponse.ok(profile);
    }

    @Patch('me')
    async updateProfile(
        @CurrentUser('id') userId: string,
        @Body() dto: { fullName?: string; email?: string },
    ) {
        const profile = await this.usersService.updateProfile(userId, dto);
        return ApiResponse.ok(profile, 'Profile updated');
    }
}
