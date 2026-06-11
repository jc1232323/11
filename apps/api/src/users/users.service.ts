import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  getProfile(user: User) {
    return {
      email: user.email,
      nickname: user.nickname,
      defaultRole: user.defaultRole,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.users.findOneOrFail({ where: { id: userId } });
    if (dto.nickname !== undefined) user.nickname = dto.nickname;
    if (dto.defaultRole !== undefined) user.defaultRole = dto.defaultRole;
    await this.users.save(user);
    return this.getProfile(user);
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.users.findOneOrFail({ where: { id: userId } });
    const ok = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('旧密码不正确');
    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.users.save(user);
    return { ok: true };
  }
}
