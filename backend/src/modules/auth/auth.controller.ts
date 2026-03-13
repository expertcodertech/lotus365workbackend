import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../common/api-response';
import { IsString, IsNotEmpty, MinLength, IsOptional, Matches } from 'class-validator';

// ━━━━━━━━━━ DTOs ━━━━━━━━━━
export class RegisterDto {
    @IsString() @IsNotEmpty()
    phone: string;

    @IsString() @IsNotEmpty()
    fullName: string;

    @IsString() @MinLength(6)
    password: string;

    @IsString() @IsOptional()
    referralCode?: string;
}

export class LoginDto {
    @IsString() @IsNotEmpty()
    phone: string;

    @IsString() @IsNotEmpty()
    password: string;
}

export class OtpDto {
    @IsString() @IsNotEmpty()
    phone: string;
}

export class VerifyOtpDto {
    @IsString() @IsNotEmpty()
    phone: string;

    @IsString() @MinLength(6)
    otp: string;
}

export class RefreshTokenDto {
    @IsString() @IsNotEmpty()
    refreshToken: string;
}

// ━━━━━━━━━━ Controller ━━━━━━━━━━
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        const result = await this.authService.register(dto);
        return ApiResponse.ok(result, 'Registration successful');
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        const result = await this.authService.login(dto.phone, dto.password);
        return ApiResponse.ok(result, 'Login successful');
    }

    @Post('send-otp')
    @HttpCode(HttpStatus.OK)
    async sendOtp(@Body() dto: OtpDto) {
        const result = await this.authService.sendOtp(dto.phone);
        return ApiResponse.ok(result);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        const result = await this.authService.verifyOtp(dto.phone, dto.otp);
        return ApiResponse.ok(result);
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() dto: RefreshTokenDto) {
        const result = await this.authService.refreshToken(dto.refreshToken);
        return ApiResponse.ok(result);
    }
}
