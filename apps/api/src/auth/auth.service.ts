import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('该邮箱已注册');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({
      email: dto.email,
      passwordHash,
      nickname: dto.nickname?.trim() || dto.email.split('@')[0],
      defaultRole: 'guide',
    });
    return this.users.save(user);
  }

  async validateUser(dto: LoginDto): Promise<User> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('邮箱或密码错误');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('邮箱或密码错误');
    return user;
  }

  signToken(user: User): string {
    return this.jwt.sign({ sub: user.id, email: user.email });
  }

  sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      defaultRole: user.defaultRole,
    };
  }
}
