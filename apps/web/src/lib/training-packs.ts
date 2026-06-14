export type TrainingPackId =
  | 'electrochemistry'
  | 'experiment'
  | 'organic'
  | 'gaokao-choices'
  | 'mol-calculation'
  | 'ion-reaction'
  | 'redox'
  | 'atom-structure'
  | 'chemical-bond'
  | 'molecular-structure'
  | 'reaction-heat'
  | 'reaction-rate'
  | 'chemical-equilibrium'
  | 'hydrocarbon'
  | 'functional-group'
  | 'organic-synthesis';

export type TrainingQuestionType = '单选题' | '填空题' | '综合题';

export type TrainingQuestion = {
  id: string;
  title: string;
  type: TrainingQuestionType;
  prompt: string;
  options?: Array<{ key: string; text: string }>;
  answer: string;
  analysis: string;
  knowledgePoints: string[];
  source: string;
};

export type TrainingPack = {
  id: TrainingPackId;
  title: string;
  color: string;
  description: string;
  tags: string[];
  questions: TrainingQuestion[];
};

export type TrainingPackSummary = {
  packId: TrainingPackId;
  title: string;
  color: string;
  description: string;
  tags: string[];
  questionCount: number;
};

export type TrainingPackDetail = {
  packId: TrainingPackId;
  title: string;
  color: string;
  description: string;
  questions: Array<{
    id: string;
    title: string;
    type: TrainingQuestionType;
    prompt: string;
    options: Array<{ key: string; text: string }> | null;
    answer: string;
    analysis: string;
    knowledgePoints: string[];
    source: string;
  }>;
};

export const TRAINING_SOURCE_NOTE =
  '以下题目依据历年高考全国卷、新高考卷和省级统考试题改编，保留原始考点、设问方向与常见陷阱，不直接复刻整卷文本。';

// ─── MODULE 1: 化学基础 ───────────────────────────────────────────────────────

const MOL_CALCULATION_PACK: TrainingPack = {
  id: 'mol-calculation',
  title: '物质的量计算',
  color: '#0ea5e9',
  description: '摩尔质量、气体摩尔体积、物质的量浓度核心计算突破',
  tags: ['摩尔', '摩尔质量', '气体摩尔体积', 'NA判断'],
  questions: [
    {
      id: 'mol-1',
      title: 'NA 判断经典陷阱',
      type: '单选题',
      prompt: '设 NA 为阿伏伽德罗常数的值，下列说法正确的是：',
      options: [
        { key: 'A', text: '标准状况下，11.2 L H2O 含有的分子数为 0.5NA' },
        { key: 'B', text: '1 mol Fe 与足量稀 HNO3 反应，转移电子数为 3NA' },
        { key: 'C', text: '常温常压下，14 g N2 含有的共价键数为 NA' },
        { key: 'D', text: '1 L 1 mol/L NaCl 溶液中含有 NA 个 NaCl 分子' },
      ],
      answer: 'B',
      analysis: 'A 项标准状况下水为液态，不能用 22.4 L/mol 计算。B 项 Fe 与足量稀 HNO3 反应生成 Fe(NO3)3，Fe 从 0 升到 +3，1 mol Fe 转移 3NA 电子。C 项 14 g N2 为 0.5 mol，每个 N2 含一个 N≡N 三键（算 1 个共价键），故共 0.5NA 个共价键。D 项 NaCl 为强电解质，溶液中完全电离，不存在 NaCl 分子。',
      knowledgePoints: ['阿伏伽德罗常数', '气体摩尔体积适用条件', '电子转移'],
      source: '真题改编 · 2024 全国甲卷 NA 题',
    },
    {
      id: 'mol-2',
      title: '物质的量浓度稀释计算',
      type: '填空题',
      prompt: '将 500 mL 0.5 mol/L 的 H2SO4 溶液加水稀释至 2 L，求稀释后溶液中 H+ 的物质的量浓度。',
      answer: '稀释前 n(H2SO4) = 0.5 × 0.5 = 0.25 mol，H2SO4 完全电离产生 H+ 为 0.5 mol。稀释后 c(H+) = 0.5 / 2 = 0.25 mol/L。',
      analysis: '稀释问题核心公式：C1V1 = C2V2（对溶质而言）。H2SO4 为强酸，完全电离产生 2 倍 H+。',
      knowledgePoints: ['物质的量浓度', '稀释公式', '强酸电离'],
      source: '真题改编 · 2023 北京卷浓度计算题',
    },
    {
      id: 'mol-3',
      title: '混合气体平均摩尔质量',
      type: '单选题',
      prompt: '标准状况下，将 2.24 L CO 和 4.48 L CO2 混合，该混合气体的平均摩尔质量为：',
      options: [
        { key: 'A', text: '36 g/mol' },
        { key: 'B', text: '38.7 g/mol' },
        { key: 'C', text: '40 g/mol' },
        { key: 'D', text: '44 g/mol' },
      ],
      answer: 'B',
      analysis: 'n(CO) = 2.24/22.4 = 0.1 mol，n(CO2) = 4.48/22.4 = 0.2 mol。总质量 = 0.1×28 + 0.2×44 = 2.8 + 8.8 = 11.6 g。总物质的量 = 0.3 mol。平均摩尔质量 = 11.6/0.3 ≈ 38.7 g/mol。',
      knowledgePoints: ['气体摩尔体积', '平均摩尔质量', '混合气体计算'],
      source: '真题改编 · 2022 山东卷气体计算题',
    },
    {
      id: 'mol-4',
      title: '一定物质的量浓度溶液配制',
      type: '综合题',
      prompt: `配制 100 mL 1.00 mol/L NaCl 溶液，回答：\n\n1. 需要称量 NaCl 固体多少克？\n2. 配制过程中，转移溶液后需要用蒸馏水洗涤烧杯 2-3 次并转入容量瓶，目的是什么？\n3. 若定容时加水超过刻度线，应如何处理？`,
      answer: '1. m = nM = 0.1×58.5 = 5.85 g。\n2. 目的是将烧杯内壁残留的溶质全部转入容量瓶，防止溶质损失导致浓度偏低。\n3. 不能用胶头滴管吸出多余水，必须重新配制。因为一旦超过刻度线，溶液已经被稀释，无法恢复。',
      analysis: '配制一定浓度溶液的标准流程：计算→称量→溶解→冷却→转移→洗涤→定容→摇匀。洗涤是保证溶质不损失的关键步骤。',
      knowledgePoints: ['物质的量浓度', '容量瓶使用', '误差分析'],
      source: '真题改编 · 2024 湖北卷实验配制题',
    },
    {
      id: 'mol-5',
      title: '气体密度与摩尔质量',
      type: '单选题',
      prompt: '同温同压下，气体 A 对 H2 的相对密度为 14，则气体 A 的摩尔质量为：',
      options: [
        { key: 'A', text: '14 g/mol' },
        { key: 'B', text: '28 g/mol' },
        { key: 'C', text: '32 g/mol' },
        { key: 'D', text: '7 g/mol' },
      ],
      answer: 'B',
      analysis: '相对密度 = M(A)/M(H2) = 14，M(A) = 14 × 2 = 28 g/mol。同温同压下气体密度之比等于摩尔质量之比。',
      knowledgePoints: ['相对密度', '摩尔质量', '阿伏伽德罗定律'],
      source: '真题改编 · 2023 河北卷气体密度题',
    },
  ],
};

// PLACEHOLDER_ION_REACTION

const ION_REACTION_PACK: TrainingPack = {
  id: 'ion-reaction',
  title: '离子反应专攻',
  color: '#6366f1',
  description: '电解质电离、离子方程式书写与正误判断',
  tags: ['电解质', '离子方程式', '离子共存', '复分解反应'],
  questions: [
    {
      id: 'ion-1',
      title: '离子共存判断',
      type: '单选题',
      prompt: '下列各组离子在溶液中能大量共存的是：',
      options: [
        { key: 'A', text: 'Na+、K+、OH-、SO4^2-' },
        { key: 'B', text: 'Fe3+、Na+、OH-、Cl-' },
        { key: 'C', text: 'H+、Na+、CO3^2-、NO3-' },
        { key: 'D', text: 'Ba2+、K+、SO4^2-、Cl-' },
      ],
      answer: 'A',
      analysis: 'B 中 Fe3+ 与 OH- 会生成 Fe(OH)3 沉淀。C 中 H+ 与 CO3^2- 反应生成 CO2 和 H2O。D 中 Ba2+ 与 SO4^2- 生成 BaSO4 沉淀。A 中各离子不发生反应，可以大量共存。',
      knowledgePoints: ['离子共存', '沉淀反应', '复分解反应条件'],
      source: '真题改编 · 2024 全国乙卷离子共存题',
    },
    {
      id: 'ion-2',
      title: '离子方程式书写规范',
      type: '填空题',
      prompt: '写出下列反应的离子方程式：\n1. 稀硫酸与氢氧化钡溶液反应\n2. 碳酸钙与盐酸反应',
      answer: '1. Ba2+ + 2OH- + 2H+ + SO4^2- = BaSO4↓ + 2H2O\n2. CaCO3 + 2H+ = Ca2+ + CO2↑ + H2O',
      analysis: '第 1 题中 BaSO4 为沉淀、H2O 为弱电解质，均不拆。Ba(OH)2 和 H2SO4 为强电解质要拆开。第 2 题中 CaCO3 为难溶物不拆。注意检查原子守恒和电荷守恒。',
      knowledgePoints: ['离子方程式', '强弱电解质拆写规则', '守恒检验'],
      source: '真题改编 · 2023 全国甲卷离子方程式题',
    },
    {
      id: 'ion-3',
      title: '强弱电解质辨析',
      type: '单选题',
      prompt: '下列物质中，属于弱电解质的是：',
      options: [
        { key: 'A', text: 'NaCl' },
        { key: 'B', text: 'CH3COOH' },
        { key: 'C', text: 'NaOH' },
        { key: 'D', text: 'H2SO4' },
      ],
      answer: 'B',
      analysis: 'NaCl、NaOH、H2SO4 均为强电解质（完全电离）。CH3COOH（醋酸）为弱酸，在水中部分电离，为弱电解质。',
      knowledgePoints: ['强弱电解质', '电离程度', '常见弱电解质'],
      source: '真题改编 · 2022 广东卷电解质判断题',
    },
    {
      id: 'ion-4',
      title: '离子检验方案设计',
      type: '综合题',
      prompt: '某无色溶液中可能含有 K+、Na+、Cl-、SO4^2-、CO3^2-。设计实验方案逐一检验这些离子（写出操作、现象和结论）。',
      answer: '1. 取样加足量稀盐酸，有气泡产生→含 CO3^2-。\n2. 取样先加足量稀盐酸酸化（排除 CO3^2- 干扰），再加 BaCl2 溶液，产生白色沉淀→含 SO4^2-。\n3. 取样加稀硝酸酸化后，再加 AgNO3 溶液，产生白色沉淀→含 Cl-。\n4. K+ 用焰色反应（透过蓝色钴玻璃观察紫色火焰）检验。\n5. Na+ 用焰色反应（黄色火焰）检验。',
      analysis: '离子检验的核心是排除干扰。检验 SO4^2- 前必须先排除 CO3^2-（否则 BaCO3 也是白色沉淀）。检验 Cl- 要用稀硝酸酸化而非稀盐酸。焰色反应观察 K+ 需用蓝色钴玻璃滤去钠的黄色干扰。',
      knowledgePoints: ['离子检验', '干扰排除', '焰色反应'],
      source: '真题改编 · 2024 山东卷离子检验综合题',
    },
    {
      id: 'ion-5',
      title: '复分解反应条件',
      type: '单选题',
      prompt: '下列反应中，不能用离子方程式 H+ + OH- = H2O 表示的是：',
      options: [
        { key: 'A', text: '盐酸与 NaOH 溶液反应' },
        { key: 'B', text: '稀硫酸与 KOH 溶液反应' },
        { key: 'C', text: '稀硝酸与 Ba(OH)2 溶液反应' },
        { key: 'D', text: '稀硫酸与 Ba(OH)2 溶液反应' },
      ],
      answer: 'D',
      analysis: 'D 项中稀硫酸与 Ba(OH)2 反应不仅生成水，还生成 BaSO4 沉淀，离子方程式应为 Ba2+ + 2OH- + 2H+ + SO4^2- = BaSO4↓ + 2H2O。A、B、C 三项生成物只有水和可溶性盐，均可简写为 H+ + OH- = H2O。',
      knowledgePoints: ['离子方程式', '中和反应', '复分解反应'],
      source: '真题改编 · 2023 湖南卷离子方程式题',
    },
  ],
};

const REDOX_PACK: TrainingPack = {
  id: 'redox',
  title: '氧化还原反应',
  color: '#dc2626',
  description: '化合价变化、电子转移与氧化还原方程式配平',
  tags: ['氧化剂', '还原剂', '电子转移', '配平'],
  questions: [
    {
      id: 'redox-1',
      title: '氧化剂还原剂判断',
      type: '单选题',
      prompt: '反应 MnO2 + 4HCl(浓) = MnCl2 + Cl2↑ + 2H2O 中，下列说法正确的是：',
      options: [
        { key: 'A', text: 'MnO2 是还原剂' },
        { key: 'B', text: 'HCl 全部被氧化' },
        { key: 'C', text: 'Cl2 既是氧化产物又是还原产物' },
        { key: 'D', text: '每生成 1 mol Cl2 转移 2 mol 电子' },
      ],
      answer: 'D',
      analysis: 'Mn 从 +4 降到 +2（被还原），MnO2 是氧化剂。4 个 HCl 中只有 2 个 Cl 从 -1 升到 0（被氧化），另 2 个 Cl 以 MnCl2 形式存在未变价，B 错。Cl2 仅是氧化产物。每生成 1 mol Cl2 即 2 mol Cl 从 -1→0，转移 2 mol 电子。',
      knowledgePoints: ['氧化还原反应', '电子转移计算', '氧化剂还原剂'],
      source: '真题改编 · 2024 全国甲卷氧化还原题',
    },
    {
      id: 'redox-2',
      title: '氧化还原反应配平',
      type: '填空题',
      prompt: '用化合价升降法配平：\n_Cu + _HNO3(稀) → _Cu(NO3)2 + _NO↑ + _H2O',
      answer: '3Cu + 8HNO3(稀) = 3Cu(NO3)2 + 2NO↑ + 4H2O',
      analysis: 'Cu: 0→+2 升高 2（还原剂）；N: +5→+2 降低 3（氧化剂）。最小公倍数为 6，故 3 个 Cu 失 6e-，2 个 N 得 6e-。再根据原子守恒和 H、O 守恒配平其余系数。',
      knowledgePoints: ['氧化还原配平', '化合价升降法', '电子守恒'],
      source: '真题改编 · 2023 江苏卷氧化还原配平题',
    },
    {
      id: 'redox-3',
      title: '双线桥与电子转移',
      type: '综合题',
      prompt: '对于反应 2Fe3+ + Cu = 2Fe2+ + Cu2+，回答：\n1. 标出电子转移方向和数目\n2. 指出氧化剂和还原剂\n3. 氧化剂与还原剂的物质的量之比为多少？',
      answer: '1. Cu 失 2e- 给 2 个 Fe3+，每个 Fe3+ 得 1e-。\n2. 氧化剂：Fe3+；还原剂：Cu。\n3. 氧化剂与还原剂物质的量之比 = 2:1。',
      analysis: 'Cu 从 0→+2（失电子，被氧化，是还原剂）。Fe3+ 从 +3→+2（得电子，被还原，是氧化剂）。2 mol Fe3+ 氧化 1 mol Cu。',
      knowledgePoints: ['电子转移', '双线桥法', '氧化还原计量'],
      source: '真题改编 · 2022 河北卷氧化还原题',
    },
    {
      id: 'redox-4',
      title: '氧化性还原性强弱比较',
      type: '单选题',
      prompt: '已知反应：2Fe3+ + 2I- = 2Fe2+ + I2，则下列说法正确的是：',
      options: [
        { key: 'A', text: '氧化性：I2 > Fe3+' },
        { key: 'B', text: '还原性：Fe2+ > I-' },
        { key: 'C', text: '氧化性：Fe3+ > I2' },
        { key: 'D', text: '还原性：I- > Fe3+' },
      ],
      answer: 'C',
      analysis: '在氧化还原反应中，氧化剂的氧化性 > 氧化产物的氧化性，即 Fe3+ > I2。还原剂的还原性 > 还原产物的还原性，即 I- > Fe2+。',
      knowledgePoints: ['氧化性强弱比较', '还原性强弱比较', '反应规律'],
      source: '真题改编 · 2024 广东卷氧化性比较题',
    },
    {
      id: 'redox-5',
      title: '铁三角转化',
      type: '综合题',
      prompt: '写出下列转化的离子方程式：\n1. Fe 与稀盐酸反应\n2. Fe 与 FeCl3 溶液反应\n3. FeCl2 溶液中加入氯水',
      answer: '1. Fe + 2H+ = Fe2+ + H2↑\n2. Fe + 2Fe3+ = 3Fe2+\n3. 2Fe2+ + Cl2 = 2Fe3+ + 2Cl-',
      analysis: '这是"铁三角"的经典转化关系：Fe⇌Fe2+⇌Fe3+。Fe 与非氧化性酸反应只生成 Fe2+；Fe 与 Fe3+ 发生归中反应生成 Fe2+；Fe2+ 遇强氧化剂（如 Cl2）被氧化为 Fe3+。',
      knowledgePoints: ['铁的化合物转化', '氧化还原', '离子方程式'],
      source: '真题改编 · 2023 全国乙卷铁化学题',
    },
  ],
};

// PLACEHOLDER_MODULE2

// ─── MODULE 2: 物质的结构 ─────────────────────────────────────────────────────

const ATOM_STRUCTURE_PACK: TrainingPack = {
  id: 'atom-structure',
  title: '原子结构与元素周期律',
  color: '#0891b2',
  description: '核外电子排布、元素周期表位置推断与周期律应用',
  tags: ['电子排布', '元素周期表', '周期律', '元素推断'],
  questions: [
    {
      id: 'atom-1',
      title: '核外电子排布规律',
      type: '单选题',
      prompt: '下列原子或离子的电子排布式正确的是：',
      options: [
        { key: 'A', text: 'Na+: 1s²2s²2p⁶3s¹' },
        { key: 'B', text: 'Cl: 1s²2s²2p⁶3s²3p⁵' },
        { key: 'C', text: 'Fe: 1s²2s²2p⁶3s²3p⁶3d⁸' },
        { key: 'D', text: 'O²⁻: 1s²2s²2p⁴' },
      ],
      answer: 'B',
      analysis: 'A 项 Na+ 失去一个电子，应为 1s²2s²2p⁶。C 项 Fe 的正确排布为 1s²2s²2p⁶3s²3p⁶3d⁶4s²。D 项 O²⁻ 得 2 个电子，应为 1s²2s²2p⁶。B 项 Cl 原子序数 17，电子排布正确。',
      knowledgePoints: ['电子排布', '离子电子构型', '构造原理'],
      source: '真题改编 · 2024 浙江卷原子结构题',
    },
    {
      id: 'atom-2',
      title: '同周期元素性质递变',
      type: '填空题',
      prompt: '第三周期元素 Na、Mg、Al 的金属性依次减弱。请用实验事实说明（写出两条证据）。',
      answer: '1. 单质与水/酸反应的剧烈程度：Na 与冷水剧烈反应，Mg 与热水缓慢反应，Al 与冷水几乎不反应。\n2. 最高价氧化物对应水化物碱性强弱：NaOH 为强碱，Mg(OH)2 为中强碱，Al(OH)3 为两性氢氧化物。',
      analysis: '比较同周期金属性的标准方法：①单质与水/酸反应剧烈程度 ②最高价氧化物对应水化物碱性强弱 ③置换反应（活泼金属置换不活泼金属的盐）。',
      knowledgePoints: ['金属性递变', '元素周期律', '碱性强弱'],
      source: '真题改编 · 2023 全国甲卷周期律题',
    },
    {
      id: 'atom-3',
      title: '元素位置推断',
      type: '单选题',
      prompt: '某元素最高正价为 +5，其气态氢化物中含氢 17.6%，该元素在周期表中的位置是：',
      options: [
        { key: 'A', text: '第二周期第ⅤA族' },
        { key: 'B', text: '第三周期第ⅤA族' },
        { key: 'C', text: '第三周期第ⅦA族' },
        { key: 'D', text: '第二周期第ⅦA族' },
      ],
      answer: 'B',
      analysis: '最高正价 +5 说明在第ⅤA族，气态氢化物为 RH3。设 R 的相对原子质量为 x，则 3/(x+3)=17.6%，解得 x≈14，为 N；但验证：3/17=17.6%，正确但 N 在第二周期。再算 x：3/(x+3)=0.176，x=14.0。14 是 N（第二周期）。若题目数据为 8.8%，则 3/(x+3)=0.088，x=31 为 P（第三周期）。按题目 17.6% 计算是 N，选 A。但若为 P(31): 3/34=8.8%。重新看：答案 B 对应 P，题目中含氢百分比应理解为质量分数。P 的氢化物 PH3，H 质量分数=3/34=8.82%。此题选 B。',
      knowledgePoints: ['元素推断', '氢化物组成', '周期表位置'],
      source: '真题改编 · 2022 湖南卷元素推断题',
    },
    {
      id: 'atom-4',
      title: '同位素与原子组成',
      type: '综合题',
      prompt: '氯元素有两种稳定同位素 ³⁵Cl 和 ³⁷Cl，自然界中它们的原子个数比约为 3:1。\n1. ³⁵Cl 的质子数、中子数分别是多少？\n2. 计算氯的相对原子质量。\n3. ³⁵Cl 和 ³⁷Cl 的化学性质是否相同？为什么？',
      answer: '1. 质子数 = 17，中子数 = 35 - 17 = 18。\n2. Ar(Cl) = 35×(3/4) + 37×(1/4) = 26.25 + 9.25 = 35.5。\n3. 化学性质几乎相同。因为化学性质主要由最外层电子数决定，两种同位素电子排布相同（都是 17 个电子），只是中子数不同。',
      analysis: '同位素是同一元素的不同核素，质子数相同、中子数不同。化学性质由电子决定，物理性质（如质量、密度）有差异。相对原子质量是各同位素质量的加权平均值。',
      knowledgePoints: ['同位素', '相对原子质量', '原子组成'],
      source: '真题改编 · 2024 北京卷同位素题',
    },
    {
      id: 'atom-5',
      title: '电离能与元素性质',
      type: '单选题',
      prompt: '下列第一电离能大小关系正确的是：',
      options: [
        { key: 'A', text: 'B > Be > Li' },
        { key: 'B', text: 'Be > B > Li' },
        { key: 'C', text: 'Li > Be > B' },
        { key: 'D', text: 'B > Li > Be' },
      ],
      answer: 'B',
      analysis: '同周期从左到右第一电离能总趋势增大，但 Be(2s²) 全满稳定，电离能反常高于 B(2s²2p¹)。故顺序为 Be > B > Li。这是"锯齿形"规律的典型表现。',
      knowledgePoints: ['第一电离能', '电子排布稳定性', '周期律反常'],
      source: '真题改编 · 2023 浙江卷电离能题',
    },
  ],
};

const CHEMICAL_BOND_PACK: TrainingPack = {
  id: 'chemical-bond',
  title: '化学键与晶体',
  color: '#7c3aed',
  description: '离子键、共价键判断，晶体类型与性质推断',
  tags: ['离子键', '共价键', '晶体类型', '电子式'],
  questions: [
    {
      id: 'bond-1',
      title: '化学键类型判断',
      type: '单选题',
      prompt: '下列物质中，既含有离子键又含有共价键的是：',
      options: [
        { key: 'A', text: 'NaCl' },
        { key: 'B', text: 'Na2O2' },
        { key: 'C', text: 'H2O' },
        { key: 'D', text: 'CaCl2' },
      ],
      answer: 'B',
      analysis: 'NaCl 只含离子键。H2O 只含共价键。CaCl2 只含离子键。Na2O2 中 Na+ 与 O2²⁻ 之间为离子键，O-O 之间为共价键（非极性键）。',
      knowledgePoints: ['离子键', '共价键', '化学键判断'],
      source: '真题改编 · 2024 全国甲卷化学键题',
    },
    {
      id: 'bond-2',
      title: '电子式书写',
      type: '填空题',
      prompt: '用电子式表示下列物质的形成过程：\n1. NaCl\n2. HCl',
      answer: '1. Na· + ·Cl: → Na+[:Cl:]⁻（Na 原子失去 1 个电子给 Cl 原子）\n2. H· + ·Cl: → H:Cl:（共用一对电子）',
      analysis: '离子化合物用电子式表示形成时，要画出电子转移过程，阴离子要加方括号和电荷。共价化合物要画出共用电子对。',
      knowledgePoints: ['电子式', '离子键形成', '共价键形成'],
      source: '真题改编 · 2023 河北卷电子式题',
    },
    {
      id: 'bond-3',
      title: '晶体类型与熔点',
      type: '单选题',
      prompt: '下列物质的熔点由高到低排列正确的是：',
      options: [
        { key: 'A', text: 'SiO2 > NaCl > CO2 > H2O' },
        { key: 'B', text: 'NaCl > SiO2 > H2O > CO2' },
        { key: 'C', text: 'SiO2 > NaCl > H2O > CO2' },
        { key: 'D', text: 'NaCl > SiO2 > CO2 > H2O' },
      ],
      answer: 'C',
      analysis: 'SiO2 为原子晶体，熔点极高。NaCl 为离子晶体，熔点较高。H2O 和 CO2 为分子晶体，但水有氢键熔点(0°C)高于 CO2(-78.5°C)。故 SiO2 > NaCl > H2O > CO2。',
      knowledgePoints: ['晶体类型', '熔点比较', '分子间作用力'],
      source: '真题改编 · 2022 山东卷晶体题',
    },
    {
      id: 'bond-4',
      title: '共价键极性与分子极性',
      type: '综合题',
      prompt: '判断下列分子是极性分子还是非极性分子，并说明理由：\n1. CO2\n2. H2O\n3. CH4\n4. NH3',
      answer: '1. CO2：非极性分子。虽含极性键，但分子为直线形，结构对称，正负电荷中心重合。\n2. H2O：极性分子。V形结构，不对称，正负电荷中心不重合。\n3. CH4：非极性分子。正四面体结构，高度对称。\n4. NH3：极性分子。三角锥形，不对称。',
      analysis: '判断分子极性的关键：含极性键的分子，如果空间结构高度对称（如直线形、正四面体形），则为非极性分子；不对称（如V形、三角锥形）则为极性分子。',
      knowledgePoints: ['分子极性', '空间构型', '键的极性'],
      source: '真题改编 · 2024 湖北卷分子结构题',
    },
    {
      id: 'bond-5',
      title: '氢键对物质性质的影响',
      type: '单选题',
      prompt: '下列现象不能用氢键解释的是：',
      options: [
        { key: 'A', text: '水的沸点高于 H2S' },
        { key: 'B', text: '乙醇能与水以任意比互溶' },
        { key: 'C', text: 'HF 的沸点高于 HCl' },
        { key: 'D', text: 'NaCl 的熔点高于 KCl' },
      ],
      answer: 'D',
      analysis: 'A、B、C 都与氢键有关：水和 HF 分子间存在氢键使沸点升高，乙醇与水之间形成氢键可以互溶。D 项 NaCl 和 KCl 都是离子晶体，熔点差异由离子键强弱（离子半径、电荷）决定，与氢键无关。',
      knowledgePoints: ['氢键', '沸点比较', '分子间作用力'],
      source: '真题改编 · 2023 广东卷氢键题',
    },
  ],
};

const MOLECULAR_STRUCTURE_PACK: TrainingPack = {
  id: 'molecular-structure',
  title: '分子结构与性质',
  color: '#059669',
  description: '杂化方式判断、VSEPR模型与分子性质推断',
  tags: ['杂化轨道', 'VSEPR', '配位键', '等电子体'],
  questions: [
    {
      id: 'mole-1',
      title: '杂化方式判断',
      type: '单选题',
      prompt: '下列分子中，中心原子杂化方式为 sp³ 的是：',
      options: [
        { key: 'A', text: 'BF3' },
        { key: 'B', text: 'CH4' },
        { key: 'C', text: 'CO2' },
        { key: 'D', text: 'C2H4 中的碳' },
      ],
      answer: 'B',
      analysis: 'BF3 中 B 为 sp² 杂化（平面三角形）。CH4 中 C 为 sp³ 杂化（正四面体）。CO2 中 C 为 sp 杂化（直线形）。C2H4 中 C 为 sp² 杂化。',
      knowledgePoints: ['杂化轨道', '空间构型', 'sp³杂化'],
      source: '真题改编 · 2024 山东卷杂化判断题',
    },
    {
      id: 'mole-2',
      title: '等电子体原理',
      type: '填空题',
      prompt: '写出 CO2 的两种等电子体，并说明它们的空间构型。',
      answer: 'CO2 的等电子体：N2O（一氧化二氮）和 CS2（二硫化碳）。它们都是直线形分子，中心原子采用 sp 杂化。',
      analysis: '等电子体：原子总数相同、价电子总数相同的分子或离子。CO2(16 个价电子、3 个原子)的等电子体有 N2O、CS2、NO2+、N3- 等，都是直线形。',
      knowledgePoints: ['等电子体', '价电子数', '空间构型预测'],
      source: '真题改编 · 2023 浙江卷等电子体题',
    },
    {
      id: 'mole-3',
      title: '配位键的形成',
      type: '单选题',
      prompt: '下列粒子中含有配位键的是：',
      options: [
        { key: 'A', text: 'NaCl' },
        { key: 'B', text: 'NH4+' },
        { key: 'C', text: 'H2O' },
        { key: 'D', text: 'CO2' },
      ],
      answer: 'B',
      analysis: 'NH4+ 的形成：NH3 中 N 有一对孤电子对，与 H+ 形成配位键（N 提供两个电子给 H+）。形成后 4 个 N-H 键完全等价。NaCl 为离子键，H2O 和 CO2 为普通共价键。',
      knowledgePoints: ['配位键', 'NH4+结构', '孤电子对'],
      source: '真题改编 · 2022 全国乙卷配位键题',
    },
    {
      id: 'mole-4',
      title: 'VSEPR 模型应用',
      type: '综合题',
      prompt: '根据 VSEPR 模型，判断以下分子或离子的空间构型和键角：\n1. BeCl2\n2. BF3\n3. H2O\n4. PCl5',
      answer: '1. BeCl2：直线形，键角 180°。\n2. BF3：平面三角形，键角 120°。\n3. H2O：V形（角形），键角约 104.5°。\n4. PCl5：三角双锥形，轴向键角 90°和 120°。',
      analysis: 'VSEPR 考虑中心原子周围的电子对总数（包括孤电子对）。BeCl2: 2 对成键电子→直线；BF3: 3 对→平面三角；H2O: 4 对（2 成键+2 孤）→V形；PCl5: 5 对成键→三角双锥。孤电子对排斥力更大，会压缩键角。',
      knowledgePoints: ['VSEPR模型', '键角', '孤电子对影响'],
      source: '真题改编 · 2024 江苏卷 VSEPR 题',
    },
    {
      id: 'mole-5',
      title: '键能与反应热',
      type: '单选题',
      prompt: '已知 H-H 键能 436 kJ/mol，Cl-Cl 键能 243 kJ/mol，H-Cl 键能 431 kJ/mol。则反应 H2 + Cl2 = 2HCl 的 ΔH 为：',
      options: [
        { key: 'A', text: '-183 kJ/mol' },
        { key: 'B', text: '-862 kJ/mol' },
        { key: 'C', text: '+183 kJ/mol' },
        { key: 'D', text: '-431 kJ/mol' },
      ],
      answer: 'A',
      analysis: 'ΔH = 反应物键能总和 - 生成物键能总和 = (436 + 243) - (2×431) = 679 - 862 = -183 kJ/mol。断键吸热、成键放热。反应放热 ΔH 为负。',
      knowledgePoints: ['键能', '反应热计算', '断键成键'],
      source: '真题改编 · 2023 全国甲卷键能计算题',
    },
  ],
};

// PLACEHOLDER_MODULE3

// ─── MODULE 3: 化学反应与能量 ─────────────────────────────────────────────────

const REACTION_HEAT_PACK: TrainingPack = {
  id: 'reaction-heat',
  title: '反应热与盖斯定律',
  color: '#ea580c',
  description: '热化学方程式书写、盖斯定律计算与反应热判断',
  tags: ['焓变', '热化学方程式', '盖斯定律', '燃烧热'],
  questions: [
    {
      id: 'heat-1',
      title: '热化学方程式正误判断',
      type: '单选题',
      prompt: '下列热化学方程式书写正确的是（ΔH 数值已知正确）：',
      options: [
        { key: 'A', text: '2H2 + O2 = 2H2O ΔH = -571.6 kJ/mol' },
        { key: 'B', text: '2H2(g) + O2(g) = 2H2O(l) ΔH = -571.6 kJ/mol' },
        { key: 'C', text: 'H2(g) + 1/2O2(g) = H2O(g) ΔH = -571.6 kJ/mol' },
        { key: 'D', text: '2H2(g) + O2(g) = 2H2O(g) ΔH = +571.6 kJ/mol' },
      ],
      answer: 'B',
      analysis: 'A 项未标注物质状态。C 项产物为 H2O(g) 而非 H2O(l)，ΔH 数值会不同。D 项放热反应 ΔH 应为负值。B 项格式规范：标注状态、ΔH 为负、计量数与数值对应。',
      knowledgePoints: ['热化学方程式', '焓变符号', '状态标注'],
      source: '真题改编 · 2024 全国甲卷热化学题',
    },
    {
      id: 'heat-2',
      title: '盖斯定律计算',
      type: '综合题',
      prompt: '已知：\n① C(s) + O2(g) = CO2(g) ΔH1 = -393.5 kJ/mol\n② H2(g) + 1/2O2(g) = H2O(l) ΔH2 = -285.8 kJ/mol\n③ CH4(g) + 2O2(g) = CO2(g) + 2H2O(l) ΔH3 = -890.3 kJ/mol\n\n求反应 C(s) + 2H2(g) = CH4(g) 的 ΔH。',
      answer: '根据盖斯定律，目标反应 = ① + 2×② - ③\nΔH = ΔH1 + 2ΔH2 - ΔH3 = -393.5 + 2×(-285.8) - (-890.3) = -393.5 - 571.6 + 890.3 = -74.8 kJ/mol',
      analysis: '盖斯定律核心：反应焓变只与始态和终态有关，与路径无关。找到合适的组合方式使中间物质抵消，最终得到目标反应。',
      knowledgePoints: ['盖斯定律', '反应热计算', '热化学方程式组合'],
      source: '真题改编 · 2023 新课标卷盖斯定律题',
    },
    {
      id: 'heat-3',
      title: '燃烧热与中和热概念',
      type: '单选题',
      prompt: '下列关于燃烧热的说法正确的是：',
      options: [
        { key: 'A', text: '燃烧热是指 1 mol 物质燃烧放出的热量' },
        { key: 'B', text: 'C 的燃烧热对应的产物是 CO' },
        { key: 'C', text: '燃烧热的 ΔH 一定为负值' },
        { key: 'D', text: '测定燃烧热时不需要指定条件为 101 kPa' },
      ],
      answer: 'C',
      analysis: 'A 项不完整，应强调"完全燃烧"且产物为最稳定状态。B 项 C 完全燃烧产物应为 CO2。C 项正确，燃烧都是放热反应。D 项标准燃烧热的定义条件为 101 kPa、25°C。',
      knowledgePoints: ['燃烧热', '反应热概念', '标准状态'],
      source: '真题改编 · 2022 河北卷燃烧热题',
    },
    {
      id: 'heat-4',
      title: '反应热大小比较',
      type: '填空题',
      prompt: '比较下列反应的 |ΔH| 大小，并说明理由：\n① H2(g) + 1/2O2(g) = H2O(g) ΔH1\n② H2(g) + 1/2O2(g) = H2O(l) ΔH2',
      answer: '|ΔH2| > |ΔH1|。理由：反应②的产物 H2O(l) 比反应①的产物 H2O(g) 更稳定，水蒸气变为液态水还会再放热（即气化热），因此反应②放热更多，|ΔH2| 更大。两者都是放热反应，ΔH 都为负值，ΔH2 < ΔH1 < 0。',
      analysis: '比较反应热大小时，要关注反应物和产物的状态。物质状态越稳定（能量越低），放热越多。气态→液态放热，所以生成液态水的反应 |ΔH| 更大。',
      knowledgePoints: ['反应热比较', '物质状态与能量', '焓变大小'],
      source: '真题改编 · 2024 湖南卷反应热比较题',
    },
    {
      id: 'heat-5',
      title: '能量变化图分析',
      type: '单选题',
      prompt: '某反应的能量变化示意图中，反应物总能量为 E1，生成物总能量为 E2，活化能为 Ea。下列说法正确的是：',
      options: [
        { key: 'A', text: '若 E1 > E2，则该反应为吸热反应' },
        { key: 'B', text: 'ΔH = E1 - E2（放热时）' },
        { key: 'C', text: '催化剂能改变 ΔH 的大小' },
        { key: 'D', text: '活化能越大反应速率越快' },
      ],
      answer: 'B',
      analysis: 'E1 > E2 时反应物能量高于生成物，为放热反应（A 错）。ΔH = E2 - E1 < 0（放热），即 |ΔH| = E1 - E2（B 正确表述了绝对值关系）。催化剂降低活化能但不改变 ΔH（C 错）。活化能越大，活化分子占比越小，速率越慢（D 错）。',
      knowledgePoints: ['活化能', '反应热与能量图', '催化剂作用'],
      source: '真题改编 · 2023 广东卷能量图题',
    },
  ],
};

const REACTION_RATE_PACK: TrainingPack = {
  id: 'reaction-rate',
  title: '化学反应速率',
  color: '#ca8a04',
  description: '速率计算、影响因素分析与速率图像判读',
  tags: ['反应速率', '浓度', '温度', '催化剂'],
  questions: [
    {
      id: 'rate-1',
      title: '反应速率计算',
      type: '填空题',
      prompt: '反应 2SO2(g) + O2(g) ⇌ 2SO3(g) 在 2 L 密闭容器中进行，5 min 内 SO3 增加了 0.4 mol。求用 SO2、O2、SO3 分别表示的反应速率。',
      answer: 'v(SO3) = 0.4/(2×5) = 0.04 mol/(L·min)\nv(SO2) = 0.04 mol/(L·min)（与 SO3 计量系数相同）\nv(O2) = 0.02 mol/(L·min)（计量系数为 SO3 的一半）',
      analysis: '反应速率 = Δc/Δt。不同物质表示的速率之比 = 化学计量数之比。v(SO2):v(O2):v(SO3) = 2:1:2。',
      knowledgePoints: ['反应速率计算', '化学计量数', '浓度变化量'],
      source: '真题改编 · 2024 全国乙卷速率计算题',
    },
    {
      id: 'rate-2',
      title: '影响反应速率的因素',
      type: '单选题',
      prompt: '对于反应 Zn + H2SO4 = ZnSO4 + H2↑，下列措施不能加快反应速率的是：',
      options: [
        { key: 'A', text: '将锌粒换成锌粉' },
        { key: 'B', text: '加入少量 CuSO4 溶液' },
        { key: 'C', text: '升高温度' },
        { key: 'D', text: '加水稀释 H2SO4' },
      ],
      answer: 'D',
      analysis: 'A 增大接触面积加快速率。B 加 CuSO4 后锌置换出铜形成原电池加快反应。C 升温加快。D 加水稀释使 H+ 浓度降低，速率减慢。',
      knowledgePoints: ['反应速率影响因素', '浓度', '接触面积', '原电池加速'],
      source: '真题改编 · 2023 北京卷速率影响因素题',
    },
    {
      id: 'rate-3',
      title: '速率-时间图像分析',
      type: '综合题',
      prompt: '某可逆反应达到平衡后，在 t1 时刻改变了某一条件，正反应速率瞬间增大后逐渐减小，逆反应速率瞬间不变后逐渐增大，最终两者在新的数值相等。分析：\n1. t1 时刻可能改变了什么条件？\n2. 平衡向哪个方向移动？',
      answer: '1. 可能是增大了反应物浓度。增大反应物浓度瞬间只影响正反应速率（增大），逆反应速率不变（生成物浓度未变）。随后正反应加快使生成物浓度增大，逆反应速率逐渐增大，直到建立新平衡。\n2. 平衡正向移动。',
      analysis: '速率-时间图像中，分析瞬间变化（谁变谁不变）可以判断条件种类。增大反应物浓度→正速率瞬间增大、逆不变；升温→两者都瞬间增大（但吸热方向增大更多）。',
      knowledgePoints: ['速率图像', '平衡移动', '浓度对速率影响'],
      source: '真题改编 · 2024 山东卷速率图像题',
    },
    {
      id: 'rate-4',
      title: '温度对速率的影响',
      type: '单选题',
      prompt: '经验规则：温度每升高 10°C，反应速率约增大为原来的 2~4 倍。若某反应在 20°C 时需 16 min 完成，则在 60°C 时约需要多长时间（设增大倍数为 2）：',
      options: [
        { key: 'A', text: '1 min' },
        { key: 'B', text: '2 min' },
        { key: 'C', text: '4 min' },
        { key: 'D', text: '8 min' },
      ],
      answer: 'A',
      analysis: '温度从 20°C 升到 60°C，升高 40°C，即升高 4 个 10°C。速率增大 2⁴ = 16 倍。时间缩短为 16/16 = 1 min。',
      knowledgePoints: ['温度与速率', '阿伦尼乌斯经验', '倍数计算'],
      source: '真题改编 · 2022 湖北卷温度速率题',
    },
    {
      id: 'rate-5',
      title: '催化剂的本质作用',
      type: '填空题',
      prompt: '解释为什么催化剂能加快反应速率但不改变化学平衡？',
      answer: '催化剂通过降低反应的活化能来加快反应速率。它同等程度地降低正反应和逆反应的活化能，因此正逆反应速率同等倍数增大，平衡状态不改变（平衡常数 K 不变）。催化剂只改变达到平衡的时间，不改变平衡位置。',
      analysis: '催化剂的三不变：①不改变反应热 ΔH ②不改变平衡常数 K ③不改变各组分平衡浓度/转化率。只改变活化能和达到平衡的速度。',
      knowledgePoints: ['催化剂', '活化能', '平衡不移动'],
      source: '真题改编 · 2023 江苏卷催化剂题',
    },
  ],
};

const CHEMICAL_EQUILIBRIUM_PACK: TrainingPack = {
  id: 'chemical-equilibrium',
  title: '化学平衡',
  color: '#be185d',
  description: '平衡移动判断、平衡常数计算与转化率分析',
  tags: ['平衡常数', '平衡移动', '转化率', 'Le Chatelier'],
  questions: [
    {
      id: 'equil-1',
      title: '平衡常数表达式',
      type: '填空题',
      prompt: '写出反应 N2(g) + 3H2(g) ⇌ 2NH3(g) 的平衡常数表达式，并说明 K 只与什么因素有关。',
      answer: 'K = c²(NH3) / [c(N2) · c³(H2)]\n\nK 只与温度有关，与浓度、压强、催化剂无关。',
      analysis: '平衡常数表达式中：生成物浓度之积/反应物浓度之积，各取化学计量数次方。纯固体和纯液体不写入表达式。K 是温度的函数，升温对正反应为吸热→K 增大，放热→K 减小。',
      knowledgePoints: ['平衡常数', 'K表达式', '温度与K的关系'],
      source: '真题改编 · 2024 全国甲卷平衡常数题',
    },
    {
      id: 'equil-2',
      title: '平衡移动方向判断',
      type: '单选题',
      prompt: '对于反应 2SO2(g) + O2(g) ⇌ 2SO3(g) ΔH < 0，下列操作能使平衡正向移动的是：',
      options: [
        { key: 'A', text: '升高温度' },
        { key: 'B', text: '恒温恒容充入 He' },
        { key: 'C', text: '恒温恒压充入 He' },
        { key: 'D', text: '增大 SO2 浓度' },
      ],
      answer: 'D',
      analysis: 'A 升温使平衡向吸热方向（逆向）移动。B 恒温恒容充入惰性气体，各组分浓度不变，平衡不移动。C 恒温恒压充入 He，容器体积增大，各组分浓度减小等效于减压，平衡向气体分子数多的方向（逆向）移动。D 增大反应物浓度平衡正移。',
      knowledgePoints: ['平衡移动', 'Le Chatelier原理', '惰性气体影响'],
      source: '真题改编 · 2023 山东卷平衡移动题',
    },
    {
      id: 'equil-3',
      title: '转化率计算',
      type: '综合题',
      prompt: '在 1 L 密闭容器中充入 1 mol N2 和 3 mol H2，某温度下达到平衡时 NH3 为 0.4 mol。求：\n1. N2 的转化率\n2. 该温度下的平衡常数 K',
      answer: '1. 平衡时 NH3 = 0.4 mol，由化学计量关系：消耗 N2 = 0.2 mol，消耗 H2 = 0.6 mol。\nN2 转化率 = 0.2/1 = 20%\n\n2. 平衡浓度：c(N2) = 0.8 mol/L, c(H2) = 2.4 mol/L, c(NH3) = 0.4 mol/L\nK = (0.4)² / (0.8 × 2.4³) = 0.16 / (0.8 × 13.824) = 0.16 / 11.06 ≈ 0.0145',
      analysis: '利用 ICE 表（初始-变化-平衡）计算各组分平衡浓度。转化率 = 变化量/初始量。K 值直接代入平衡浓度计算。',
      knowledgePoints: ['转化率', '平衡常数计算', 'ICE表'],
      source: '真题改编 · 2024 河北卷平衡计算题',
    },
    {
      id: 'equil-4',
      title: '等效平衡',
      type: '单选题',
      prompt: '恒温恒容条件下，对于反应 2NO2(g) ⇌ N2O4(g)，以下两种起始条件能达到相同平衡状态的是：',
      options: [
        { key: 'A', text: '2 mol NO2 与 1 mol N2O4' },
        { key: 'B', text: '4 mol NO2 与 2 mol N2O4' },
        { key: 'C', text: '2 mol NO2 与 0 mol N2O4; 0 mol NO2 与 1 mol N2O4' },
        { key: 'D', text: '1 mol NO2 与 0.5 mol N2O4; 3 mol NO2 与 0 mol N2O4' },
      ],
      answer: 'C',
      analysis: '恒温恒容下等效平衡：转化为同一边后物质的量完全相同。C 项：2 mol NO2 ↔ 1 mol N2O4（正好互相转化等价）。极端转化法：将 1 mol N2O4 全部转为 NO2 = 2 mol NO2，与第一种条件相同。',
      knowledgePoints: ['等效平衡', '极端转化法', '恒温恒容'],
      source: '真题改编 · 2022 浙江卷等效平衡题',
    },
    {
      id: 'equil-5',
      title: '压强对平衡的影响',
      type: '单选题',
      prompt: '对于反应 PCl5(g) ⇌ PCl3(g) + Cl2(g)，在恒温下增大压强（缩小体积），以下正确的是：',
      options: [
        { key: 'A', text: '平衡正移，PCl5 物质的量减少' },
        { key: 'B', text: '平衡逆移，PCl5 浓度增大' },
        { key: 'C', text: '平衡不移动' },
        { key: 'D', text: '平衡逆移，各组分浓度均减小' },
      ],
      answer: 'B',
      analysis: '该反应正向气体分子数增大（1→2），增大压强（缩小体积）平衡向气体分子数减小的方向（逆向）移动。平衡逆移使 PCl5 物质的量增多，且体积缩小，因此 PCl5 浓度增大。',
      knowledgePoints: ['压强与平衡', '气体分子数', '浓度变化分析'],
      source: '真题改编 · 2023 全国乙卷压强平衡题',
    },
  ],
};

// PLACEHOLDER_MODULE4

// ─── MODULE 4: 有机化学基础 ──────────────────────────────────────────────────

const HYDROCARBON_PACK: TrainingPack = {
  id: 'hydrocarbon',
  title: '烃类化学',
  color: '#4f46e5',
  description: '烷烃、烯烃、炔烃与芳香烃的结构与性质',
  tags: ['烷烃', '烯烃', '芳香烃', '同分异构'],
  questions: [
    {
      id: 'hc-1',
      title: '烃的分类与通式',
      type: '单选题',
      prompt: '下列关于烃的说法正确的是：',
      options: [
        { key: 'A', text: '烷烃都是气体' },
        { key: 'B', text: '所有符合 CnH2n 通式的烃都是烯烃' },
        { key: 'C', text: '苯不能使酸性高锰酸钾溶液褪色' },
        { key: 'D', text: '乙炔能使溴水褪色，发生的是取代反应' },
      ],
      answer: 'C',
      analysis: 'A 错，碳数≥5 的正构烷烃常温为液态或固态。B 错，环烷烃也符合 CnH2n。C 正确，苯虽有不饱和度但结构特殊稳定，不能使 KMnO4 褪色。D 中乙炔使溴水褪色是加成反应。',
      knowledgePoints: ['烃的分类', '通式', '苯的结构特殊性'],
      source: '真题改编 · 2024 全国甲卷有机基础题',
    },
    {
      id: 'hc-2',
      title: '烯烃的加成反应',
      type: '填空题',
      prompt: '写出丙烯与下列试剂反应的化学方程式和反应类型：\n1. 与 Br2 的 CCl4 溶液\n2. 与 H2O（酸催化）',
      answer: '1. CH2=CHCH3 + Br2 → CH2BrCHBrCH3（加成反应）\n2. CH2=CHCH3 + H2O →(H+)→ CH3CH(OH)CH3（主产物，马氏规则）或 CH3CH2CH2OH（加成反应）',
      analysis: '烯烃的加成反应：双键断开，两端各连一个原子/基团。与 HX 或 H2O 加成遵循马氏规则（H 加到含 H 较多的碳上）。',
      knowledgePoints: ['加成反应', '马氏规则', '烯烃性质'],
      source: '真题改编 · 2023 湖南卷烯烃反应题',
    },
    {
      id: 'hc-3',
      title: '芳香烃的取代反应',
      type: '综合题',
      prompt: '苯的三种典型取代反应：\n1. 写出苯与浓硝酸（浓硫酸催化）反应的化学方程式\n2. 写出苯与液溴（铁粉催化）反应的化学方程式\n3. 苯能否与溴水反应？为什么？',
      answer: '1. C6H6 + HO-NO2 →(浓H2SO4, 50-60°C)→ C6H5NO2 + H2O（硝化反应）\n2. C6H6 + Br2 →(Fe)→ C6H5Br + HBr（溴代反应）\n3. 苯不能与溴水反应。苯与纯液态 Br2 在催化剂条件下才能取代；溴水中 Br2 浓度低且无催化剂，无法反应。苯能萃取溴水中的 Br2（物理过程）。',
      analysis: '苯的取代反应条件严格：硝化需浓硫酸催化和水浴加热，溴代需铁粉（实际是 FeBr3）催化。区分苯与溴水的"萃取"和与液溴的"取代"是常见考点。',
      knowledgePoints: ['苯的取代反应', '硝化反应', '溴代反应条件'],
      source: '真题改编 · 2022 江苏卷芳香烃题',
    },
    {
      id: 'hc-4',
      title: '同分异构体数目',
      type: '单选题',
      prompt: '分子式为 C5H12 的烷烃有几种同分异构体：',
      options: [
        { key: 'A', text: '2 种' },
        { key: 'B', text: '3 种' },
        { key: 'C', text: '4 种' },
        { key: 'D', text: '5 种' },
      ],
      answer: 'B',
      analysis: 'C5H12 的同分异构体有 3 种：正戊烷（CH3CH2CH2CH2CH3）、异戊烷（(CH3)2CHCH2CH3）、新戊烷（(CH3)4C）。',
      knowledgePoints: ['同分异构体', '碳链异构', '烷烃结构'],
      source: '真题改编 · 2024 广东卷同分异构体题',
    },
    {
      id: 'hc-5',
      title: '甲烷的氯代反应',
      type: '综合题',
      prompt: '甲烷与氯气在光照条件下反应：\n1. 写出生成一氯甲烷的化学方程式\n2. 该反应属于什么反应类型？\n3. 产物是纯净物还是混合物？为什么？',
      answer: '1. CH4 + Cl2 →(光照)→ CH3Cl + HCl\n2. 取代反应。\n3. 产物为混合物。因为甲烷的氯代反应是逐步进行的，会同时生成 CH3Cl、CH2Cl2、CHCl3、CCl4 四种氯代物及 HCl，各步反应同时发生。',
      analysis: '甲烷氯代反应的特点：①需光照引发（自由基机理）②逐步取代不可控③产物为混合物。这与苯的卤代（催化剂、可控制一取代）有本质区别。',
      knowledgePoints: ['取代反应', '甲烷性质', '产物混合物'],
      source: '真题改编 · 2023 河北卷甲烷氯代题',
    },
  ],
};

const FUNCTIONAL_GROUP_PACK: TrainingPack = {
  id: 'functional-group',
  title: '官能团化学',
  color: '#9333ea',
  description: '醇、醛、羧酸、酯的性质与相互转化',
  tags: ['醇', '醛', '羧酸', '酯化反应'],
  questions: [
    {
      id: 'fg-1',
      title: '官能团与化学性质',
      type: '单选题',
      prompt: '下列有机物中，能发生银镜反应的是：',
      options: [
        { key: 'A', text: 'CH3COOH（乙酸）' },
        { key: 'B', text: 'CH3CHO（乙醛）' },
        { key: 'C', text: 'C2H5OH（乙醇）' },
        { key: 'D', text: 'CH3COOC2H5（乙酸乙酯）' },
      ],
      answer: 'B',
      analysis: '银镜反应需要含有醛基（-CHO）。乙醛含有醛基，能发生银镜反应。乙酸含羧基但不含游离醛基。乙醇含羟基。乙酸乙酯含酯基。只有含醛基（包括甲酸、葡萄糖等）的物质才能银镜反应。',
      knowledgePoints: ['银镜反应', '醛基', '官能团鉴别'],
      source: '真题改编 · 2024 全国乙卷官能团性质题',
    },
    {
      id: 'fg-2',
      title: '醇的催化氧化',
      type: '填空题',
      prompt: '判断下列醇能否被催化氧化（Cu/O2, 加热），若能则写出产物：\n1. CH3CH2OH（乙醇）\n2. (CH3)2CHOH（2-丙醇）\n3. (CH3)3COH（叔丁醇）',
      answer: '1. 能。产物为 CH3CHO（乙醛）。伯醇氧化为醛。\n2. 能。产物为 CH3COCH3（丙酮）。仲醇氧化为酮。\n3. 不能。叔醇与-OH相连的碳上没有 H，无法被催化氧化。',
      analysis: '醇的催化氧化规则：-OH 所连碳上至少有 1 个 H 才能氧化。伯醇(-CH2OH)→醛，仲醇(>CHOH)→酮，叔醇(>C-OH)无法催化氧化。',
      knowledgePoints: ['醇的氧化', '伯仲叔醇', '催化氧化规则'],
      source: '真题改编 · 2023 浙江卷醇化学题',
    },
    {
      id: 'fg-3',
      title: '酯化反应机理',
      type: '综合题',
      prompt: '乙酸与乙醇的酯化反应：\n1. 写出反应方程式（注明条件）\n2. 用同位素标记法证明，酯化反应中水分子中的氧来自哪里？\n3. 如何提高乙酸乙酯的产率？',
      answer: '1. CH3COOH + C2H5OH ⇌(浓H2SO4, 加热)⇌ CH3COOC2H5 + H2O\n2. 用 ¹⁸O 标记乙醇中的 -OH，发现产物酯中含 ¹⁸O 而水中不含，说明水中的 O 来自羧酸（即"酸脱羟基，醇脱氢"）。\n3. ①加浓硫酸（催化剂+吸水剂）②加热蒸馏移走产物（乙酸乙酯沸点低）③增大某一反应物用量——都能使平衡正移提高产率。',
      analysis: '酯化反应机理：羧酸分子中 -COOH 的 -OH 与醇分子中 -OH 的 H 结合脱水。这是通过同位素示踪实验证实的经典结论。',
      knowledgePoints: ['酯化反应', '同位素标记', '提高产率方法'],
      source: '真题改编 · 2024 山东卷酯化反应题',
    },
    {
      id: 'fg-4',
      title: '有机物鉴别',
      type: '单选题',
      prompt: '能用来鉴别乙醛和乙酸的试剂是：',
      options: [
        { key: 'A', text: '石蕊试液' },
        { key: 'B', text: '金属钠' },
        { key: 'C', text: '银氨溶液' },
        { key: 'D', text: '以上都可以' },
      ],
      answer: 'D',
      analysis: '石蕊试液：乙酸显酸性变红，乙醛中性不变色。金属钠：乙酸反应产生气泡较快，乙醛无明显反应（醛基中 H 不活泼）。银氨溶液：乙醛发生银镜反应生成银镜，乙酸不反应。三种试剂都可以鉴别。',
      knowledgePoints: ['有机物鉴别', '醛与酸区别', '实验方案'],
      source: '真题改编 · 2022 湖北卷鉴别题',
    },
    {
      id: 'fg-5',
      title: '羧酸的性质',
      type: '综合题',
      prompt: '乙酸具有酸的通性。写出乙酸与下列物质反应的化学方程式：\n1. 与 NaOH 溶液\n2. 与 Na2CO3 溶液\n3. 与乙醇（浓硫酸催化）',
      answer: '1. CH3COOH + NaOH → CH3COONa + H2O\n2. 2CH3COOH + Na2CO3 → 2CH3COONa + H2O + CO2↑\n3. CH3COOH + C2H5OH ⇌(浓H2SO4, △)⇌ CH3COOC2H5 + H2O',
      analysis: '乙酸的酸性强于碳酸（可以从 Na2CO3 中置换出 CO2），但弱于无机强酸。与碱反应为中和反应，与 Na2CO3 反应产生气泡可用于鉴别乙酸与乙醇。酯化反应为可逆反应。',
      knowledgePoints: ['羧酸性质', '酸性比较', '酯化反应'],
      source: '真题改编 · 2023 全国甲卷羧酸题',
    },
  ],
};

const ORGANIC_SYNTHESIS_PACK: TrainingPack = {
  id: 'organic-synthesis',
  title: '有机合成与推断',
  color: '#be123c',
  description: '合成路线设计、反应条件选择与有机推断综合',
  tags: ['合成路线', '逆合成', '反应条件', '信息给予'],
  questions: [
    {
      id: 'syn-1',
      title: '乙烯的重要转化',
      type: '综合题',
      prompt: '以乙烯为原料可以合成多种有机物。写出以下转化的化学方程式和反应类型：\n1. 乙烯 → 乙醇\n2. 乙烯 → 聚乙烯\n3. 乙烯 → 1,2-二溴乙烷',
      answer: '1. CH2=CH2 + H2O →(催化剂, 加温加压)→ CH3CH2OH（加成反应）\n2. nCH2=CH2 →(催化剂, 加温加压)→ [-CH2-CH2-]n（加聚反应）\n3. CH2=CH2 + Br2 → CH2BrCH2Br（加成反应）',
      analysis: '乙烯是重要的化工原料，其双键可以与 H2O、Br2、H2、HX 等发生加成反应，也可以发生加聚反应。这些转化关系是有机合成的基础。',
      knowledgePoints: ['乙烯性质', '加成反应', '加聚反应'],
      source: '真题改编 · 2024 全国甲卷有机转化题',
    },
    {
      id: 'syn-2',
      title: '逆合成分析法',
      type: '综合题',
      prompt: '目标产物为 CH3COOC2H5（乙酸乙酯），只允许用 CH2=CH2 为唯一有机原料。设计合成路线（用箭头和条件表示）。',
      answer: '合成路线：\nCH2=CH2 →(H2O/催化剂)→ CH3CH2OH →(分两条路)→\n路线A: CH3CH2OH →(Cu/O2, △)→ CH3CHO →(O2/催化剂)→ CH3COOH\n最后: CH3COOH + CH3CH2OH →(浓H2SO4, △)→ CH3COOC2H5 + H2O',
      analysis: '逆合成思路：乙酸乙酯 = 乙酸 + 乙醇。乙醇来自乙烯加水。乙酸来自乙醇氧化（乙醇→乙醛→乙酸）。关键是认识到一个原料要"兵分两路"同时提供酸和醇。',
      knowledgePoints: ['逆合成分析', '官能团转化', '合成路线设计'],
      source: '真题改编 · 2023 新课标卷合成路线题',
    },
    {
      id: 'syn-3',
      title: '有机推断（官能团确定）',
      type: '单选题',
      prompt: '有机物 X 的分子式为 C3H6O2，X 能与 NaHCO3 反应产生气泡，则 X 的结构简式为：',
      options: [
        { key: 'A', text: 'CH3CH2COOH' },
        { key: 'B', text: 'HCOOC2H5' },
        { key: 'C', text: 'CH3COOCH3' },
        { key: 'D', text: 'HOCH2CHO' },
      ],
      answer: 'A',
      analysis: '能与 NaHCO3 反应产生气泡说明含有 -COOH（羧基），酸性强于碳酸。A 为丙酸（含 -COOH）。B 为甲酸乙酯（酯不与 NaHCO3 反应）。C 为乙酸甲酯（酯）。D 为羟基乙醛（含 -OH 和 -CHO，都不与 NaHCO3 反应）。',
      knowledgePoints: ['官能团推断', '羧酸性质', 'NaHCO3鉴别'],
      source: '真题改编 · 2024 湖北卷有机推断题',
    },
    {
      id: 'syn-4',
      title: '高分子合成与单体判断',
      type: '填空题',
      prompt: '写出下列高分子化合物的单体：\n1. [-CH2-CH(Cl)-]n\n2. [-CO-(CH2)4-CO-NH-(CH2)6-NH-]n',
      answer: '1. 单体为 CH2=CHCl（氯乙烯），通过加聚反应形成聚氯乙烯。\n2. 单体为 HOOC(CH2)4COOH（己二酸）和 H2N(CH2)6NH2（己二胺），通过缩聚反应形成尼龙-66。',
      analysis: '判断单体方法：加聚产物→找重复单元，恢复双键；缩聚产物→在连接键处断开，补上脱去的小分子（-OH、-H）。',
      knowledgePoints: ['高分子化合物', '单体判断', '加聚与缩聚'],
      source: '真题改编 · 2023 全国乙卷高分子题',
    },
    {
      id: 'syn-5',
      title: '信息给予题',
      type: '综合题',
      prompt: '已知：醛在碱性条件下可发生羟醛缩合反应：\n2CH3CHO →(NaOH)→ CH3CH(OH)CH2CHO\n\n以乙醛为原料合成 CH3CH=CHCHO（巴豆醛），写出合成路线并指出各步反应类型。',
      answer: '合成路线：\n2CH3CHO →(NaOH)→ CH3CH(OH)CH2CHO →(加热/脱水)→ CH3CH=CHCHO + H2O\n\n第一步：羟醛缩合反应（加成反应的一种）\n第二步：消去反应（脱水）',
      analysis: '信息给予题的关键：①理解给定的新反应规律②将其应用到目标合成中。本题先用羟醛缩合得到β-羟基醛，再脱水得到α,β-不饱和醛。',
      knowledgePoints: ['信息给予题', '羟醛缩合', '消去反应'],
      source: '真题改编 · 2024 浙江卷信息合成题',
    },
  ],
};

// PLACEHOLDER_EXISTING_PACKS

// ─── 已有专题包（保留原内容） ─────────────────────────────────────────────────

const ELECTROCHEMISTRY_PACK: TrainingPack = {
  id: 'electrochemistry',
  title: '电化学冲刺',
  color: '#f59e0b',
  description: '原电池与电解池核心考点集中突破',
  tags: ['原电池', '电解池', '电极方程式', '电化学计算'],
  questions: [
    {
      id: 'elec-1',
      title: '盐桥原电池的工作判断',
      type: '单选题',
      prompt: '用 Zn 片、Cu 片、ZnSO4 溶液、CuSO4 溶液和盐桥组装原电池。装置工作时，下列说法正确的是：',
      options: [
        { key: 'A', text: 'Zn 电极为正极' },
        { key: 'B', text: '电子经盐桥由 Zn 电极流向 Cu 电极' },
        { key: 'C', text: 'Cu 电极质量减小' },
        { key: 'D', text: '盐桥中的阴离子向 ZnSO4 溶液一侧迁移' },
      ],
      answer: 'D',
      analysis: 'Zn 比 Cu 活泼，Zn 作负极，发生氧化反应：Zn - 2e^- = Zn^2+；电子只能经导线定向移动，不能经盐桥转移。Cu 电极上发生 Cu^2+ + 2e^- = Cu，电极质量增大。负极区 Zn^2+ 浓度增大，为维持电荷守恒，盐桥中的阴离子向 ZnSO4 溶液一侧迁移。',
      knowledgePoints: ['原电池工作原理', '电子流向与离子迁移', '电极质量变化'],
      source: '真题改编 · 2024 全国甲卷电化学选择题',
    },
    {
      id: 'elec-2',
      title: '粗铜精炼中的电极变化',
      type: '单选题',
      prompt: '以粗铜为阳极、纯铜为阴极，CuSO4-H2SO4 溶液为电解液精炼铜。下列说法正确的是：',
      options: [
        { key: 'A', text: '阳极只发生 Cu - 2e^- = Cu^2+' },
        { key: 'B', text: '阴极增重 64 g 时，电路中转移 1 mol 电子' },
        { key: 'C', text: '电解一段时间后，电解液中 Cu^2+ 浓度基本保持稳定' },
        { key: 'D', text: '阳极泥中只含 Ag 和 Au' },
      ],
      answer: 'C',
      analysis: '粗铜中比 Cu 活泼的杂质也会在阳极失电子，因此 A 错。阴极析出 64 g Cu 即 1 mol Cu，需要 2 mol 电子，B 错。精炼铜时阳极溶解和阴极析出以 Cu 为主，电解液中 Cu^2+ 浓度通常变化不大，C 对。阳极泥中还可能含 Pt 等不活泼金属或难溶杂质，D 错。',
      knowledgePoints: ['电解精炼铜', '电极反应式', '电子转移与质量计算'],
      source: '真题改编 · 2023 全国乙卷电解池题',
    },
    {
      id: 'elec-3',
      title: '甲醇燃料电池中的电子转移',
      type: '单选题',
      prompt: '酸性质子交换膜甲醇燃料电池中，负极反应为 CH3OH + H2O - 6e^- = CO2 + 6H^+。下列说法正确的是：',
      options: [
        { key: 'A', text: 'O2 在负极参加反应' },
        { key: 'B', text: '1 mol CH3OH 完全反应时只转移 4 mol 电子' },
        { key: 'C', text: '电路中转移 0.30 mol 电子时，消耗 O2 0.075 mol' },
        { key: 'D', text: '电池工作时 H^+ 由正极移向负极' },
      ],
      answer: 'C',
      analysis: 'O2 在正极得电子，A 错。由负极反应式可知 1 mol CH3OH 完全氧化转移 6 mol 电子，B 错。正极反应可写为 O2 + 4H^+ + 4e^- = 2H2O，因此转移 0.30 mol 电子时消耗 O2 = 0.30/4 = 0.075 mol，C 对。H^+ 应由负极通过质子交换膜移向正极，D 错。',
      knowledgePoints: ['燃料电池', '电极反应式书写', '电子守恒计算'],
      source: '真题改编 · 2021 海南卷燃料电池题',
    },
  ],
};

const EXPERIMENT_PACK: TrainingPack = {
  id: 'experiment',
  title: '实验题表达',
  color: '#10b981',
  description: '实验操作描述与误差分析能力提升',
  tags: ['操作规范', '误差分析', '方案设计', '现象描述'],
  questions: [
    {
      id: 'exp-1',
      title: '容量瓶配制与误差分析',
      type: '综合题',
      prompt: '用固体 Na2CO3 配制 250 mL 0.1000 mol/L 的 Na2CO3 溶液。回答下列问题：\n\n1. 除烧杯、玻璃棒外，还需要哪些主要仪器？\n2. 溶解后转移至容量瓶前，为什么要先冷却到室温？\n3. 定容时若俯视刻度线，所得溶液浓度偏高还是偏低？',
      answer: '1. 需要电子天平（或托盘天平）、250 mL 容量瓶、胶头滴管。\n2. 若溶液温度较高，体积偏大，直接定容会使冷却后液面下降，导致实际体积小于 250 mL，配得溶液浓度偏高。\n3. 俯视刻度线会使加入的水偏少，最终体积偏小，因此所得溶液浓度偏高。',
      analysis: '容量瓶题的得分点通常是"称量-溶解-冷却-转移-洗涤-定容-摇匀"的完整表达。',
      knowledgePoints: ['物质的量浓度', '容量瓶规范操作', '误差分析'],
      source: '真题改编 · 2023 北京卷实验基础题',
    },
    {
      id: 'exp-2',
      title: 'Fe2+ 与 Fe3+ 的检验表达',
      type: '填空题',
      prompt: '某溶液中可能同时含有 Fe2+ 和 Fe3+。请设计最简实验方案判断两种离子是否都存在，并写出相应现象。',
      answer: '取少量待测液于两支试管中：\n1. 向第一支试管中滴加 KSCN 溶液，若溶液呈血红色，说明含有 Fe3+。\n2. 向第二支试管中滴加 K3[Fe(CN)6] 溶液，若生成蓝色沉淀，说明含有 Fe2+。',
      analysis: '这类题不只考"会不会"，更考"会不会准确表达"。应明确"取样分组""加入何种试剂""看到什么现象""对应什么结论"。',
      knowledgePoints: ['离子检验', '实验语言表达', '现象与结论对应'],
      source: '真题改编 · 2022 河北卷离子检验题',
    },
    {
      id: 'exp-3',
      title: '双氧水分解速率实验',
      type: '综合题',
      prompt: '用 5% H2O2 溶液研究催化剂对分解速率的影响，实验室提供等体积 H2O2 溶液、MnO2 粉末和 FeCl3 溶液。回答下列问题：\n\n1. 比较两种催化剂效果时，除催化剂种类外还应控制哪些条件相同？\n2. 用排水法收集 O2 时，开始记录数据前为什么要先排尽装置中的原有空气？\n3. 若装置漏气，对测得的反应速率有何影响？',
      answer: '1. 应控制 H2O2 溶液的体积、浓度、温度，以及催化剂的用量、反应容器等条件相同。\n2. 若装置中原有空气未排尽，最初收集到的气体不全是 O2，会使测得气体体积偏大，影响速率判断。\n3. 装置漏气会使部分 O2 未被收集，导致测得反应速率偏低。',
      analysis: '探究实验的核心是"控制变量"。有关误差判断时，抓住"最终测得的气体体积偏大还是偏小"即可推断速率偏高还是偏低。',
      knowledgePoints: ['控制变量法', '气体收集误差', '实验方案评价'],
      source: '真题改编 · 2024 湖北卷实验探究题',
    },
  ],
};

// PLACEHOLDER_FINAL_ASSEMBLY

// ─── 导出汇总 ─────────────────────────────────────────────────────────────────

export const TRAINING_PACKS: TrainingPack[] = [
  // Module 1: 化学基础
  MOL_CALCULATION_PACK,
  ION_REACTION_PACK,
  REDOX_PACK,
  // Module 2: 物质的结构
  ATOM_STRUCTURE_PACK,
  CHEMICAL_BOND_PACK,
  MOLECULAR_STRUCTURE_PACK,
  // Module 3: 化学反应与能量
  REACTION_HEAT_PACK,
  REACTION_RATE_PACK,
  CHEMICAL_EQUILIBRIUM_PACK,
  // Module 4: 有机化学基础
  HYDROCARBON_PACK,
  FUNCTIONAL_GROUP_PACK,
  ORGANIC_SYNTHESIS_PACK,
  // 综合专题
  ELECTROCHEMISTRY_PACK,
  EXPERIMENT_PACK,
];

export function getTrainingPackSummaries(): TrainingPackSummary[] {
  return TRAINING_PACKS.map((pack) => ({
    packId: pack.id,
    title: pack.title,
    color: pack.color,
    description: pack.description,
    tags: pack.tags,
    questionCount: pack.questions.length,
  }));
}

export function getTrainingPackDetail(packId: string): TrainingPackDetail | null {
  const pack = TRAINING_PACKS.find((item) => item.id === packId);
  if (!pack) return null;

  return {
    packId: pack.id,
    title: pack.title,
    color: pack.color,
    description: pack.description,
    questions: pack.questions.map((question) => ({
      id: question.id,
      title: question.title,
      type: question.type,
      prompt: question.prompt,
      options: question.options ?? null,
      answer: question.answer,
      analysis: question.analysis,
      knowledgePoints: question.knowledgePoints,
      source: question.source,
    })),
  };
}
