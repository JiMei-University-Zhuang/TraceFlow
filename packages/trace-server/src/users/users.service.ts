import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User, UserRole } from './schemas/user.schema';

// 用内存模拟 User 类型
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  apiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  // 模拟用户数据存储
  private users: User[] = [];
  private nextId = 1;

  constructor() {
    // 初始化一些测试用户
    this.createInitialUsers();
  }

  private createInitialUsers() {
    const adminUser: User = {
      id: String(this.nextId++),
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // 实际应用中应该是加密的
      role: UserRole.ADMIN,
      apiKey: 'admin-api-key-12345',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const regularUser: User = {
      id: String(this.nextId++),
      username: 'user',
      email: 'user@example.com',
      password: 'user123', // 实际应用中应该是加密的
      role: UserRole.USER,
      apiKey: 'user-api-key-67890',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(adminUser, regularUser);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUsername = this.users.find(
      (user) => user.username === createUserDto.username,
    );
    if (existingUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = this.users.find(
      (user) => user.email === createUserDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('邮箱已存在');
    }

    const newUser: User = {
      id: String(this.nextId++),
      ...createUserDto,
      role: createUserDto.role || UserRole.USER,
      apiKey: `api-key-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return Promise.resolve({ ...newUser });
  }

  async findAll(): Promise<User[]> {
    return Promise.resolve([...this.users]);
  }

  async findById(id: string): Promise<User> {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }
    return Promise.resolve({ ...user });
  }

  async findByUsername(username: string): Promise<User> {
    const user = this.users.find((user) => user.username === username);
    if (!user) {
      throw new NotFoundException(`用户名为${username}的用户不存在`);
    }
    return Promise.resolve({ ...user });
  }

  async findByEmail(email: string): Promise<User> {
    const user = this.users.find((user) => user.email === email);
    return user ? Promise.resolve({ ...user }) : null;
  }

  async update(
    id: string,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<User> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }

    // 更新用户
    this.users[index] = {
      ...this.users[index],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    return Promise.resolve({ ...this.users[index] });
  }

  async remove(id: string): Promise<User> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }

    const deletedUser = { ...this.users[index] };
    this.users.splice(index, 1);

    return Promise.resolve(deletedUser);
  }
}
