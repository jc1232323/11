import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Between, Like, MoreThan, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ChatSession } from '../entities/chat-session.entity';
import { ChatMessage } from '../entities/chat-message.entity';
import { ExamAttempt } from '../entities/exam-attempt.entity';
import { isPremium } from '../common/membership';
import { CreateUserDto, UpdateUserDto } from './dto/admin-user.dto';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function publicUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    defaultRole: u.defaultRole,
    emailVerified: u.emailVerified,
    isAdmin: u.isAdmin,
    plan: u.plan,
    planExpiresAt: u.planExpiresAt ? u.planExpiresAt.toISOString() : null,
    isPremium: isPremium(u),
    createdAt: u.createdAt?.toISOString() ?? null,
    updatedAt: u.updatedAt?.toISOString() ?? null,
  };
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(ChatSession)
    private readonly sessions: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private readonly messages: Repository<ChatMessage>,
    @InjectRepository(ExamAttempt)
    private readonly examAttempts: Repository<ExamAttempt>,
  ) {}

  /** Real dashboard statistics straight from the database. */
  async getStats() {
    const today = startOfToday();

    const [
      totalUsers,
      adminUsers,
      verifiedUsers,
      newUsersToday,
      totalSessions,
      totalMessages,
      userMessages,
      messagesToday,
      totalExamAttempts,
    ] = await Promise.all([
      this.users.count(),
      this.users.count({ where: { isAdmin: true } }),
      this.users.count({ where: { emailVerified: true } }),
      this.users.count({ where: { createdAt: MoreThan(today) } }),
      this.sessions.count(),
      this.messages.count(),
      this.messages.count({ where: { role: 'user' } }),
      this.messages.count({ where: { createdAt: MoreThan(today) } }),
      this.examAttempts.count(),
    ]);

    // Membership distribution
    const planRows = await this.users
      .createQueryBuilder('u')
      .select('u.plan', 'plan')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.plan')
      .getRawMany<{ plan: string; count: string }>();
    const planCounts: Record<string, number> = {
      free: 0,
      monthly: 0,
      quarterly: 0,
      yearly: 0,
    };
    for (const row of planRows) {
      planCounts[row.plan] = Number(row.count);
    }

    // Active paid members (not expired)
    const paidUsers = await this.users.find({
      where: [
        { plan: 'monthly' },
        { plan: 'quarterly' },
        { plan: 'yearly' },
      ],
      select: ['plan', 'planExpiresAt'],
    });
    const activePremium = paidUsers.filter((u) => isPremium(u)).length;

    // New users per day for the last 7 days
    const signupTrend = await this.signupTrend(7);

    return {
      users: {
        total: totalUsers,
        admins: adminUsers,
        verified: verifiedUsers,
        newToday: newUsersToday,
        activePremium,
      },
      chat: {
        sessions: totalSessions,
        messages: totalMessages,
        userMessages,
        messagesToday,
      },
      exam: {
        attempts: totalExamAttempts,
      },
      planCounts,
      signupTrend,
    };
  }

  /** New-user count for each of the last `days` days (oldest first). */
  private async signupTrend(days: number) {
    const result: Array<{ date: string; count: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const count = await this.users.count({
        where: { createdAt: Between(start, end) },
      });
      const label = `${start.getMonth() + 1}/${start.getDate()}`;
      result.push({ date: label, count });
    }
    return result;
  }

  /** Paginated, searchable user list. */
  async listUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    plan?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
    const search = (params.search ?? '').trim();

    const where: Record<string, unknown>[] = [];
    const base: Record<string, unknown> = {};
    if (params.plan && params.plan !== 'all') base.plan = params.plan;

    if (search) {
      where.push(
        { ...base, email: Like(`%${search}%`) },
        { ...base, nickname: Like(`%${search}%`) },
      );
    } else {
      where.push(base);
    }

    const [rows, total] = await this.users.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: rows.map(publicUser),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getUser(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    return publicUser(user);
  }

  async createUser(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new ConflictException('该邮箱已注册');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({
      email,
      passwordHash,
      nickname: dto.nickname?.trim() || email.split('@')[0],
      defaultRole: dto.defaultRole ?? 'guide',
      emailVerified: true,
      isAdmin: dto.isAdmin ?? false,
      plan: dto.plan ?? 'free',
      planExpiresAt: this.parsePlanExpiry(dto.planExpiresAt, dto.plan ?? 'free'),
    });
    const saved = await this.users.save(user);
    return publicUser(saved);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');

    if (dto.nickname !== undefined) user.nickname = dto.nickname.trim();
    if (dto.isAdmin !== undefined) user.isAdmin = dto.isAdmin;
    if (dto.plan !== undefined) {
      user.plan = dto.plan;
      user.planExpiresAt = this.parsePlanExpiry(
        dto.planExpiresAt !== undefined
          ? dto.planExpiresAt
          : user.planExpiresAt?.toISOString() ?? null,
        dto.plan,
      );
    } else if (dto.planExpiresAt !== undefined) {
      user.planExpiresAt = dto.planExpiresAt
        ? new Date(dto.planExpiresAt)
        : null;
    }
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const saved = await this.users.save(user);
    return publicUser(saved);
  }

  async deleteUser(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException('不能删除当前登录的账号');
    }
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    await this.users.delete(id);
    return { ok: true };
  }

  private parsePlanExpiry(
    raw: string | null | undefined,
    plan: string,
  ): Date | null {
    if (plan === 'free') return null;
    if (raw) {
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) return d;
    }
    // Default expiry by plan when none provided
    const d = new Date();
    if (plan === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (plan === 'quarterly') d.setMonth(d.getMonth() + 3);
    else if (plan === 'yearly') d.setFullYear(d.getFullYear() + 1);
    return d;
  }
}
