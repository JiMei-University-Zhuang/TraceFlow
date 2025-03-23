import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService, LoginResponseDto } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from '../users/users.service';

interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<LoginResponseDto> {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );
  }
}
