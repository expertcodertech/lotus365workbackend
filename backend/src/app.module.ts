import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { ConfigAppModule } from './modules/config/config-app.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Environment vars
    ConfigModule.forRoot({ isGlobal: true }),

    // PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_NAME', 'postgres'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') === 'development', // Never in prod
        logging: config.get('NODE_ENV') === 'development',
        ssl: config.get('DB_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 60),
        },
      ],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    WalletModule,
    TransactionsModule,
    WithdrawalsModule,
    LeaderboardModule,
    ReferralsModule,
    ConfigAppModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule { }
