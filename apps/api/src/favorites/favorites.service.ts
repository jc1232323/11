import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite) private readonly favorites: Repository<Favorite>,
  ) {}

  async add(userId: string, type: 'topic' | 'question', targetId: string, note?: string) {
    const existing = await this.favorites.findOne({ where: { userId, type, targetId } });
    if (existing) return existing;
    const fav = this.favorites.create({ userId, type, targetId, note: note ?? null });
    return this.favorites.save(fav);
  }

  async remove(userId: string, type: string, targetId: string) {
    await this.favorites.delete({ userId, type: type as 'topic' | 'question', targetId });
    return { ok: true };
  }

  async list(userId: string, type?: string) {
    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    return this.favorites.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async check(userId: string, type: string, targetId: string) {
    const count = await this.favorites.count({ where: { userId, type: type as 'topic' | 'question', targetId } });
    return { favorited: count > 0 };
  }
}
