import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingPack } from '../entities/training-pack.entity';
import { TrainingQuestion } from '../entities/training-question.entity';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingPack) private readonly packs: Repository<TrainingPack>,
    @InjectRepository(TrainingQuestion) private readonly questions: Repository<TrainingQuestion>,
  ) {}

  async listPacks() {
    const packs = await this.packs.find({ order: { sortOrder: 'ASC' } });
    const counts = await this.questions
      .createQueryBuilder('q')
      .select('q.pack_id', 'packId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('q.pack_id')
      .getRawMany<{ packId: string; count: string }>();
    const countMap = new Map(counts.map((c) => [c.packId, Number(c.count)]));

    return packs.map((pack) => ({
      ...pack,
      questionCount: countMap.get(pack.packId) ?? 0,
    }));
  }

  async getPackWithQuestions(packId: string) {
    const pack = await this.packs.findOne({ where: { packId } });
    if (!pack) return null;
    const questions = await this.questions.find({
      where: { packId },
      order: { sortOrder: 'ASC' },
    });
    return { ...pack, questions };
  }
}
