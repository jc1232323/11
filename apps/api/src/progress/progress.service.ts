import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from '../entities/user-progress.entity';
import { PracticeRecord } from '../entities/practice-record.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserProgress) private readonly progress: Repository<UserProgress>,
    @InjectRepository(PracticeRecord) private readonly records: Repository<PracticeRecord>,
  ) {}

  async recordView(userId: string, topicSlug: string) {
    const existing = await this.progress.findOne({ where: { userId, topicSlug } });
    if (existing) return existing;
    const entry = this.progress.create({ userId, topicSlug });
    return this.progress.save(entry);
  }

  async recordAnswer(userId: string, questionId: string, correct: boolean) {
    const record = this.records.create({ userId, questionId, correct });
    return this.records.save(record);
  }

  async getViewedTopicSlugs(userId: string): Promise<string[]> {
    const entries = await this.progress.find({
      where: { userId },
      select: ['topicSlug'],
    });
    return entries.map((e) => e.topicSlug);
  }

  async getStats(userId: string) {
    const topicsViewed = await this.progress.count({ where: { userId } });
    const questionsAnswered = await this.records.count({ where: { userId } });
    const correctAnswers = await this.records.count({ where: { userId, correct: true } });

    // Calculate streak: consecutive days with activity
    const allDates = await this.getActivityDates(userId);
    const { current, longest } = this.calculateStreak(allDates);

    return {
      topicsViewed,
      questionsAnswered,
      correctAnswers,
      currentStreak: current,
      longestStreak: longest,
    };
  }

  private async getActivityDates(userId: string): Promise<string[]> {
    // Get unique dates from both tables
    const progressDates = await this.progress
      .createQueryBuilder('p')
      .select('DATE(p.viewed_at)', 'date')
      .where('p.user_id = :userId', { userId })
      .groupBy('date')
      .getRawMany<{ date: string }>();

    const recordDates = await this.records
      .createQueryBuilder('r')
      .select('DATE(r.answered_at)', 'date')
      .where('r.user_id = :userId', { userId })
      .groupBy('date')
      .getRawMany<{ date: string }>();

    const dateSet = new Set([
      ...progressDates.map((d) => d.date),
      ...recordDates.map((d) => d.date),
    ]);

    return [...dateSet].sort();
  }

  private calculateStreak(dates: string[]): { current: number; longest: number } {
    if (dates.length === 0) return { current: 0, longest: 0 };

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let longest = 1;
    let current = 0;
    let streak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) {
        streak++;
        longest = Math.max(longest, streak);
      } else {
        streak = 1;
      }
    }

    // Check if current streak includes today or yesterday
    const lastDate = dates[dates.length - 1];
    if (lastDate === today || lastDate === yesterday) {
      current = streak;
    }

    return { current, longest };
  }
}
