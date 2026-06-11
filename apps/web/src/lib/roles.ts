export type RoleId =
  | 'direct'
  | 'guide'
  | 'foundation'
  | 'formula-derive'
  | 'gaokao-sprint'
  | 'exam-analyst'
  | 'memory-helper'
  | 'mistake-review'
  | 'experiment'
  | 'competition';

export type RoleGroup = 'daily' | 'exam' | 'special';

export type RoleMeta = {
  id: RoleId;
  label: string;
  description: string;
  group: RoleGroup;
};

export const ROLE_GROUP_LABELS: Record<RoleGroup, string> = {
  daily: '日常学习',
  exam: '备考冲刺',
  special: '专项提升',
};

export const AI_ROLES: RoleMeta[] = [
  {
    id: 'direct',
    label: '思路直达',
    description: '简洁高效，直接给解题思路与关键步骤',
    group: 'daily',
  },
  {
    id: 'guide',
    label: '温柔老师',
    description: '耐心引导，用提问帮助你自己推导',
    group: 'daily',
  },
  {
    id: 'foundation',
    label: '基础入门',
    description: '零基础友好，生活类比、小步讲解',
    group: 'daily',
  },
  {
    id: 'formula-derive',
    label: '公式推导',
    description: '从定义推导公式，讲清符号与适用条件',
    group: 'daily',
  },
  {
    id: 'gaokao-sprint',
    label: '高考冲刺',
    description: '考前抢分，高频考点与易错陷阱',
    group: 'exam',
  },
  {
    id: 'exam-analyst',
    label: '审题拆题',
    description: '读题定位考点，先搭解题框架',
    group: 'exam',
  },
  {
    id: 'memory-helper',
    label: '记忆助手',
    description: '口诀、对比表、考前速记卡片',
    group: 'exam',
  },
  {
    id: 'mistake-review',
    label: '错题复盘',
    description: '分析错因，归纳防错策略',
    group: 'exam',
  },
  {
    id: 'experiment',
    label: '实验达人',
    description: '实验装置、操作规范与误差分析',
    group: 'special',
  },
  {
    id: 'competition',
    label: '竞赛拓展',
    description: '学有余力的深度拓展与竞赛思路',
    group: 'special',
  },
];

export const DEFAULT_ROLE: RoleId = 'guide';

export function getRoleMeta(id: string): RoleMeta | undefined {
  return AI_ROLES.find((r) => r.id === id);
}

export function rolesByGroup(group: RoleGroup): RoleMeta[] {
  return AI_ROLES.filter((r) => r.group === group);
}

export const ROLE_GROUPS: RoleGroup[] = ['daily', 'exam', 'special'];
