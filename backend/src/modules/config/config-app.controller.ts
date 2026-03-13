import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigAppService } from './config-app.service';
import { JwtAuthGuard } from '../../common/guards';
import { ApiResponse } from '../../common/api-response';

@Controller('config')
export class ConfigAppController {
    constructor(private configService: ConfigAppService) { }

    @Get('rewards')
    @UseGuards(JwtAuthGuard)
    async getRewardConfig() {
        const config = await this.configService.getRewardConfig();
        return ApiResponse.ok(config);
    }

    @Get('app-version')
    async getAppVersion() {
        const config = await this.configService.getConfig('app_version');
        return ApiResponse.ok(config);
    }

    @Get('maintenance')
    async getMaintenanceStatus() {
        const config = await this.configService.getConfig('maintenance');
        return ApiResponse.ok(config);
    }
}
