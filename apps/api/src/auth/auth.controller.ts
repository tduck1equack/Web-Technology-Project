import { Controller, Post, Body, Req, UnauthorizedException, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { SupabaseService } from './supabase-auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: SupabaseService) {}

  @Post('register')
  async register(@Body() registerDto: any) {
    try {
      if (!registerDto.email || !registerDto.password) {
        throw new BadRequestException('Email and password are required');
      }
      
      const result = await this.authService.register(registerDto);
      return result;
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: any) {
    try {
      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const result = await this.authService.login(loginDto);
      return result;
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Invalid credentials');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: any) {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No token provided');
      }

      const token = authHeader.substring(7);
      const result = await this.authService.logout(token);
      return result;
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Logout failed');
    }
  }
}
