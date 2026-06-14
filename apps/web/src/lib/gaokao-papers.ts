/**
 * 高考旧卷数据
 *
 * 每套卷子包含试卷元数据和题目占位。
 * 题目内容需要手动填入：找到对应年份真题后，按格式填写 questions 数组。
 *
 * 填写格式参考：
 * {
 *   id: 'gaokao-2024-national1-q1',
 *   title: '题目标题',
 *   type: '单选题' | '填空题' | '综合题',
 *   prompt: '题目正文...',
 *   options: [{ key: 'A', text: '...' }, ...] | null,
 *   answer: '正确答案',
 *   analysis: '解析...',
 *   knowledgePoints: ['考点1', '考点2'],
 *   source: '2024年全国甲卷第X题',
 * }
 */

import type { ExamQuestion } from './exam-questions';

export type GaokaoPaper = {
  examId: string;
  title: string;
  description: string;
  year: number;
  region: string;
  duration: number;
  totalScore: number;
  questions: ExamQuestion[];
};

// 地区/卷种列表（供参考）
// const REGIONS = ['全国甲卷', '全国乙卷', ...] as const;

// 年份范围（供参考）
// const YEARS = [2026, ..., 2010] as const;

/**
 * 生成高考旧卷列表
 * 注：questions 为空数组的试卷在前端会显示"待填充"状态
 */
function generateGaokaoPapers(): GaokaoPaper[] {
  const papers: GaokaoPaper[] = [];

  // 2024-2026: 新高考全国卷 + 部分省份自主命题
  const newExamYears = [2026, 2025, 2024];
  const newExamRegions = ['新课标Ⅰ卷', '新课标Ⅱ卷', '北京卷', '上海卷', '浙江卷', '黑龙江卷', '广东卷', '山东卷', '湖北卷', '湖南卷', '河北卷'];
  for (const year of newExamYears) {
    for (const region of newExamRegions) {
      papers.push({
        examId: `gaokao-${year}-${slugify(region)}`,
        title: `${year}年高考化学 ${region}`,
        description: `${year}年普通高等学校招生全国统一考试 化学 ${region}`,
        year,
        region,
        duration: 75,
        totalScore: 100,
        questions: [],
      });
    }
  }

  // 2021-2023: 新高考过渡期
  const transitionYears = [2023, 2022, 2021];
  const transitionRegions = ['全国甲卷', '全国乙卷', '新课标卷', '北京卷', '上海卷', '浙江卷', '山东卷', '广东卷', '湖北卷'];
  for (const year of transitionYears) {
    for (const region of transitionRegions) {
      papers.push({
        examId: `gaokao-${year}-${slugify(region)}`,
        title: `${year}年高考化学 ${region}`,
        description: `${year}年普通高等学校招生全国统一考试 化学 ${region}`,
        year,
        region,
        duration: 50,
        totalScore: 100,
        questions: [],
      });
    }
  }

  // 2017-2020: 全国卷为主
  const nationalYears = [2020, 2019, 2018, 2017];
  const nationalRegions = ['全国Ⅰ卷', '全国Ⅱ卷', '全国Ⅲ卷', '北京卷', '上海卷', '江苏卷', '浙江卷'];
  for (const year of nationalYears) {
    for (const region of nationalRegions) {
      papers.push({
        examId: `gaokao-${year}-${slugify(region)}`,
        title: `${year}年高考化学 ${region}`,
        description: `${year}年普通高等学校招生全国统一考试 理综化学部分 ${region}`,
        year,
        region,
        duration: 50,
        totalScore: 100,
        questions: [],
      });
    }
  }

  // 2010-2016: 早期全国卷
  const earlyYears = [2016, 2015, 2014, 2013, 2012, 2011, 2010];
  const earlyRegions = ['全国Ⅰ卷', '全国Ⅱ卷', '北京卷', '上海卷', '江苏卷'];
  for (const year of earlyYears) {
    for (const region of earlyRegions) {
      papers.push({
        examId: `gaokao-${year}-${slugify(region)}`,
        title: `${year}年高考化学 ${region}`,
        description: `${year}年普通高等学校招生全国统一考试 理综化学部分 ${region}`,
        year,
        region,
        duration: 50,
        totalScore: 100,
        questions: [],
      });
    }
  }

  return papers;
}

function slugify(region: string): string {
  return region
    .replace(/[Ⅰ]/g, '1')
    .replace(/[Ⅱ]/g, '2')
    .replace(/[Ⅲ]/g, '3')
    .replace(/卷/g, '')
    .replace(/[^\w一-鿿]/g, '')
    .toLowerCase();
}

export const GAOKAO_PAPERS = generateGaokaoPapers();

/** Get available years for filter */
export function getGaokaoYears(): number[] {
  return [...new Set(GAOKAO_PAPERS.map((p) => p.year))].sort((a, b) => b - a);
}

/** Get available regions for filter */
export function getGaokaoRegions(): string[] {
  return [...new Set(GAOKAO_PAPERS.map((p) => p.region))];
}
