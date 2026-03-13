import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from './config.entity';

@Injectable()
export class ConfigAppService implements OnModuleInit {
    constructor(
        @InjectRepository(AppConfig) private configRepo: Repository<AppConfig>,
    ) { }

    async onModuleInit() {
        // Seed default config values if they don't exist
        const defaults = [
            { key: 'reward_config', value: { buyRewardPercent: 2, sellRewardPercent: 2, referralCommissionPercent: 5, minWithdrawal: 100, maxWithdrawal: 50000 }, description: 'Reward percentages and withdrawal limits' },
            { key: 'app_version', value: { latest: '1.0.0', minSupported: '1.0.0', updateUrl: '' }, description: 'App version control' },
            { key: 'maintenance', value: { enabled: false, message: '' }, description: 'Maintenance mode' },
        ];

        for (const def of defaults) {
            const exists = await this.configRepo.findOne({ where: { key: def.key } });
            if (!exists) {
                await this.configRepo.save(this.configRepo.create(def));
            }
        }
    }

    async getConfig(key: string) {
        const config = await this.configRepo.findOne({ where: { key } });
        return config?.value;
    }

    async getRewardConfig() {
        return this.getConfig('reward_config');
    }

    async getAllConfigs() {
        return this.configRepo.find();
    }

    async updateConfig(key: string, value: any) {
        await this.configRepo.update({ key }, { value });
        return this.getConfig(key);
    }
}
