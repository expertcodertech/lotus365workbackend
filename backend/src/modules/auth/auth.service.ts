import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from '../users/user.entity';
import { Wallet } from '../wallet/wallet.entity';
import { Referral } from '../referrals/referral.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
        @InjectRepository(Referral) private referralRepo: Repository<Referral>,
        private jwtService: JwtService,
        private config: ConfigService,
    ) { }

    // ━━━━━━━━━━ Register ━━━━━━━━━━
    async register(dto: {
        phone: string;
        fullName: string;
        password: string;
        referralCode?: string;
    }) {
        // Check duplicate
        const exists = await this.userRepo.findOne({ where: { phone: dto.phone } });
        if (exists) throw new ConflictException('Phone number already registered');

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 12);

        // Generate unique referral code
        const referralCode = await this.generateReferralCode(dto.fullName);

        // Create user
        const user = this.userRepo.create({
            phone: dto.phone,
            fullName: dto.fullName,
            password: hashedPassword,
            referralCode,
            referredBy: dto.referralCode || undefined,
        });
        await this.userRepo.save(user);

        // Create wallet
        const wallet = this.walletRepo.create({ userId: user.id });
        await this.walletRepo.save(wallet);

        // Process referral if exists
        if (dto.referralCode) {
            const referrer = await this.userRepo.findOne({
                where: { referralCode: dto.referralCode },
            });
            if (referrer) {
                const referral = this.referralRepo.create({
                    referrerId: referrer.id,
                    referredUserId: user.id,
                });
                await this.referralRepo.save(referral);
                await this.userRepo.increment({ id: referrer.id }, 'totalReferrals', 1);
            }
        }

        return {
            userId: user.id,
            phone: user.phone,
            message: 'Registration successful. Please verify your phone.',
        };
    }

    // ━━━━━━━━━━ Login ━━━━━━━━━━
    async login(phone: string, password: string) {
        const user = await this.userRepo.findOne({
            where: { phone },
            select: ['id', 'phone', 'fullName', 'password', 'role', 'status'],
        });

        if (!user) throw new UnauthorizedException('Invalid credentials');
        if (user.status === UserStatus.BANNED) throw new UnauthorizedException('Account has been banned');
        if (user.status === UserStatus.SUSPENDED) throw new UnauthorizedException('Account suspended');

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.generateTokens(user.id, user.role);

        return {
            user: {
                id: user.id,
                phone: user.phone,
                fullName: user.fullName,
                role: user.role,
            },
            ...tokens,
        };
    }

    // ━━━━━━━━━━ OTP (Mockup) ━━━━━━━━━━
    async sendOtp(phone: string) {
        // In production: integrate Twilio/MSG91
        // For dev: return static OTP
        const otp = process.env.NODE_ENV === 'development' ? '123456' : this.generateOtp();
        // TODO: Store OTP in Redis with TTL, send via SMS
        return { message: 'OTP sent successfully', expiresIn: 300 };
    }

    async verifyOtp(phone: string, otp: string) {
        // In dev mode, accept 123456
        if (process.env.NODE_ENV === 'development' && otp === '123456') {
            await this.userRepo.update({ phone }, { isPhoneVerified: true });
            return { verified: true, message: 'Phone verified successfully' };
        }
        // TODO: Validate OTP from Redis
        throw new BadRequestException('Invalid OTP');
    }

    // ━━━━━━━━━━ Token Refresh ━━━━━━━━━━
    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
            const tokens = await this.generateTokens(payload.sub, payload.role);
            return tokens;
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    // ━━━━━━━━━━ Helpers ━━━━━━━━━━
    private async generateTokens(userId: string, role: string) {
        const payload = { sub: userId, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
                expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES', '7d'),
            }),
        ]);

        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes
        };
    }

    private async generateReferralCode(name: string): Promise<string> {
        const prefix = name.replace(/[^A-Za-z]/g, '').substring(0, 5).toUpperCase();
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const code = `${prefix}${suffix}`;

        const exists = await this.userRepo.findOne({ where: { referralCode: code } });
        if (exists) return this.generateReferralCode(name); // retry
        return code;
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
