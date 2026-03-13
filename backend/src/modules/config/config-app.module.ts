import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigAppController } from './config-app.controller';
import { ConfigAppService } from './config-app.service';
import { AppConfig } from './config.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AppConfig])],
    controllers: [ConfigAppController],
    providers: [ConfigAppService],
    exports: [ConfigAppService],
})
export class ConfigAppModule { }
