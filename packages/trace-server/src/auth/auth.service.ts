import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.service';

export interface LoginResponseDto {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    try {
      const user = await this.usersService.findByUsername(username);

      // 简单比较密码，实际应用中应该使用加密比较
      if (user.password !== password) {
        throw new UnauthorizedException('密码不正确');
      }

      return user;
    } catch {
      throw new UnauthorizedException('用户名或密码不正确');
    }
  }

  async login(user: User): Promise<LoginResponseDto> {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    return this.usersService.create({ username, email, password });
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('无效的令牌');
    }
  }
}
