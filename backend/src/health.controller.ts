import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
    @Get('health')
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'lotus365-backend',
            version: '1.0.0'
        };
    }

    @Get('v1/health')
    getHealthV1() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'lotus365-backend',
            version: '1.0.0'
        };
    }
}