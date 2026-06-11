import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { KnowledgeNode } from '../entities/knowledge-node.entity';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeNode)
    private readonly nodes: Repository<KnowledgeNode>,
  ) {}

  async getTree() {
    const modules = await this.nodes.find({
      where: { type: 'module', parentId: IsNull() },
      order: { sortOrder: 'ASC' },
    });
    const chapters = await this.nodes.find({
      where: { type: 'chapter' },
      order: { sortOrder: 'ASC' },
    });
    const topics = await this.nodes.find({
      where: { type: 'topic' },
      order: { sortOrder: 'ASC' },
    });

    return modules.map((mod) => ({
      id: mod.id,
      slug: mod.slug,
      title: mod.title,
      type: mod.type,
      chapters: chapters
        .filter((c) => c.parentId === mod.id)
        .map((chapter) => ({
          id: chapter.id,
          slug: chapter.slug,
          title: chapter.title,
          type: chapter.type,
          topics: topics
            .filter((t) => t.parentId === chapter.id)
            .map((t) => ({
              id: t.id,
              slug: t.slug,
              title: t.title,
              type: t.type,
            })),
        })),
    }));
  }

  async getBySlug(slug: string) {
    const node = await this.nodes.findOne({ where: { slug } });
    if (!node || node.type !== 'topic') {
      throw new NotFoundException('知识点不存在');
    }
    let chapterTitle: string | null = null;
    let moduleTitle: string | null = null;
    if (node.parentId) {
      const chapter = await this.nodes.findOne({ where: { id: node.parentId } });
      chapterTitle = chapter?.title ?? null;
      if (chapter?.parentId) {
        const mod = await this.nodes.findOne({ where: { id: chapter.parentId } });
        moduleTitle = mod?.title ?? null;
      }
    }
    const allTopics = node.parentId
      ? await this.nodes.find({
          where: { parentId: node.parentId, type: 'topic' },
          order: { sortOrder: 'ASC' },
        })
      : [];
    const index = allTopics.findIndex((t) => t.id === node.id);
    const prev = index > 0 ? allTopics[index - 1] : null;
    const next = index < allTopics.length - 1 ? allTopics[index + 1] : null;
    return {
      id: node.id,
      slug: node.slug,
      title: node.title,
      chapterTitle,
      moduleTitle,
      mdBody: node.mdBody ?? '',
      prev: prev ? { slug: prev.slug, title: prev.title } : null,
      next: next ? { slug: next.slug, title: next.title } : null,
    };
  }

  async getTopicBodyBySlug(slug: string): Promise<string | null> {
    const node = await this.nodes.findOne({ where: { slug, type: 'topic' } });
    return node?.mdBody ?? null;
  }
}
