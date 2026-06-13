export type TrainingPackId =
  | 'electrochemistry'
  | 'experiment'
  | 'organic'
  | 'gaokao-choices';

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

export const TRAINING_PACKS: TrainingPack[] = [
  {
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
        prompt:
          '用 Zn 片、Cu 片、ZnSO4 溶液、CuSO4 溶液和盐桥组装原电池。装置工作时，下列说法正确的是：',
        options: [
          { key: 'A', text: 'Zn 电极为正极' },
          { key: 'B', text: '电子经盐桥由 Zn 电极流向 Cu 电极' },
          { key: 'C', text: 'Cu 电极质量减小' },
          { key: 'D', text: '盐桥中的阴离子向 ZnSO4 溶液一侧迁移' },
        ],
        answer: 'D',
        analysis:
          'Zn 比 Cu 活泼，Zn 作负极，发生氧化反应：Zn - 2e^- = Zn^2+；电子只能经导线定向移动，不能经盐桥转移。Cu 电极上发生 Cu^2+ + 2e^- = Cu，电极质量增大。负极区 Zn^2+ 浓度增大，为维持电荷守恒，盐桥中的阴离子向 ZnSO4 溶液一侧迁移。',
        knowledgePoints: ['原电池工作原理', '电子流向与离子迁移', '电极质量变化'],
        source: '真题改编 · 2024 全国甲卷电化学选择题',
      },
      {
        id: 'elec-2',
        title: '粗铜精炼中的电极变化',
        type: '单选题',
        prompt:
          '以粗铜为阳极、纯铜为阴极，CuSO4-H2SO4 溶液为电解液精炼铜。下列说法正确的是：',
        options: [
          { key: 'A', text: '阳极只发生 Cu - 2e^- = Cu^2+' },
          { key: 'B', text: '阴极增重 64 g 时，电路中转移 1 mol 电子' },
          { key: 'C', text: '电解一段时间后，电解液中 Cu^2+ 浓度基本保持稳定' },
          { key: 'D', text: '阳极泥中只含 Ag 和 Au' },
        ],
        answer: 'C',
        analysis:
          '粗铜中比 Cu 活泼的杂质也会在阳极失电子，因此 A 错。阴极析出 64 g Cu 即 1 mol Cu，需要 2 mol 电子，B 错。精炼铜时阳极溶解和阴极析出以 Cu 为主，电解液中 Cu^2+ 浓度通常变化不大，C 对。阳极泥中还可能含 Pt 等不活泼金属或难溶杂质，D 错。',
        knowledgePoints: ['电解精炼铜', '电极反应式', '电子转移与质量计算'],
        source: '真题改编 · 2023 全国乙卷电解池题',
      },
      {
        id: 'elec-3',
        title: '离子交换膜法电解食盐水',
        type: '综合题',
        prompt: `某化学兴趣小组用离子交换膜电解饱和食盐水制备氯气、氢气和烧碱。回答下列问题：

1. 写出阴极的电极反应式。
2. 装置中应选用阳离子交换膜而不是阴离子交换膜，原因是什么？
3. 若阳极收集到标准状况下 11.2 L Cl2，理论上可得到 NaOH 多少 mol？`,
        answer: `1. 阴极反应式：2H2O + 2e^- = H2↑ + 2OH^-。
2. 选用阳离子交换膜是为了只允许 Na^+ 迁移到阴极区，避免 Cl^- 和 OH^- 在同一空间内发生副反应，同时提高 NaOH 纯度。
3. 标准状况下 11.2 L Cl2 的物质的量为 0.50 mol，对应转移 1.00 mol 电子，理论生成 NaOH 1.00 mol。`,
        analysis:
          '电解饱和食盐水时，阳极发生 2Cl^- - 2e^- = Cl2↑，阴极发生水得电子生成 H2 和 OH^-。离子交换膜的核心作用是分隔产物并定向迁移离子。由电子守恒可知，生成 1 mol Cl2 转移 2 mol 电子，同时阴极区生成 2 mol OH^-，因此 0.50 mol Cl2 对应生成 1.00 mol NaOH。',
        knowledgePoints: ['电解池电极反应', '离子交换膜作用', '电化学定量计算'],
        source: '真题改编 · 2022 山东卷工业电解题',
      },
      {
        id: 'elec-4',
        title: '甲醇燃料电池中的电子转移',
        type: '单选题',
        prompt:
          '酸性质子交换膜甲醇燃料电池中，负极反应为 CH3OH + H2O - 6e^- = CO2 + 6H^+。下列说法正确的是：',
        options: [
          { key: 'A', text: 'O2 在负极参加反应' },
          { key: 'B', text: '1 mol CH3OH 完全反应时只转移 4 mol 电子' },
          { key: 'C', text: '电路中转移 0.30 mol 电子时，消耗 O2 0.075 mol' },
          { key: 'D', text: '电池工作时 H^+ 由正极移向负极' },
        ],
        answer: 'C',
        analysis:
          'O2 在正极得电子，A 错。由负极反应式可知 1 mol CH3OH 完全氧化转移 6 mol 电子，B 错。正极反应可写为 3/2 O2 + 6H^+ + 6e^- = 3H2O，因此转移 0.30 mol 电子时消耗 O2 0.30 × 3/12 = 0.075 mol，C 对。H^+ 应由负极通过质子交换膜移向正极，D 错。',
        knowledgePoints: ['燃料电池', '电极反应式书写', '电子守恒计算'],
        source: '真题改编 · 2021 海南卷燃料电池题',
      },
    ],
  },
  {
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
        prompt: `用固体 Na2CO3 配制 250 mL 0.1000 mol/L 的 Na2CO3 溶液。回答下列问题：

1. 除烧杯、玻璃棒外，还需要哪些主要仪器？
2. 溶解后转移至容量瓶前，为什么要先冷却到室温？
3. 定容时若俯视刻度线，所得溶液浓度偏高还是偏低？`,
        answer: `1. 需要电子天平（或托盘天平，按题目精度要求选择）、250 mL 容量瓶、胶头滴管。
2. 若溶液温度较高，体积偏大，直接定容会使冷却后液面下降，导致实际体积小于 250 mL，配得溶液浓度偏高。
3. 俯视刻度线会使加入的水偏少，最终体积偏小，因此所得溶液浓度偏高。`,
        analysis:
          '容量瓶题的得分点通常是“称量-溶解-冷却-转移-洗涤-定容-摇匀”的完整表达，以及从“最终体积偏大还是偏小”判断浓度误差。只要最终体积偏小，浓度就偏高；最终体积偏大，浓度就偏低。',
        knowledgePoints: ['物质的量浓度', '容量瓶规范操作', '误差分析'],
        source: '真题改编 · 2023 北京卷实验基础题',
      },
      {
        id: 'exp-2',
        title: 'Fe2+ 与 Fe3+ 的检验表达',
        type: '填空题',
        prompt:
          '某溶液中可能同时含有 Fe2+ 和 Fe3+。请设计最简实验方案判断两种离子是否都存在，并写出相应现象。',
        answer: `取少量待测液于两支试管中：

1. 向第一支试管中滴加 KSCN 溶液，若溶液呈血红色，说明含有 Fe3+。
2. 向第二支试管中滴加 K3[Fe(CN)6] 溶液，若生成蓝色沉淀，说明含有 Fe2+。`,
        analysis:
          '这类题不只考“会不会”，更考“会不会准确表达”。应明确“取样分组”“加入何种试剂”“看到什么现象”“对应什么结论”。避免只写“加试剂检验”，不写取样和现象。',
        knowledgePoints: ['离子检验', '实验语言表达', '现象与结论对应'],
        source: '真题改编 · 2022 河北卷离子检验题',
      },
      {
        id: 'exp-3',
        title: '硫酸根检验中的“先酸后检”',
        type: '填空题',
        prompt:
          '检验某溶液中是否含有 SO4^2-，某同学直接滴加 BaCl2 溶液后出现白色沉淀，于是认定原溶液中含有 SO4^2-。该结论是否可靠？请写出正确操作，并说明原因。',
        answer: `该结论不可靠。

正确操作：先向待测液中加入足量稀盐酸酸化，若无明显现象，再滴加 BaCl2 溶液；若出现白色沉淀且沉淀不溶于稀盐酸，则说明原溶液中含有 SO4^2-。`,
        analysis:
          '直接加 BaCl2 时，CO3^2-、SO3^2- 等离子也可能生成白色沉淀，造成误判。先酸化是为了排除这些干扰离子。实验表述时要把“先酸化”“再加 BaCl2”“沉淀不溶于稀盐酸”三个得分点写全。',
        knowledgePoints: ['离子反应', '干扰离子排除', '实验方案设计'],
        source: '真题改编 · 2021 全国甲卷实验选择题',
      },
      {
        id: 'exp-4',
        title: '双氧水分解速率实验',
        type: '综合题',
        prompt: `用 5% H2O2 溶液研究催化剂对分解速率的影响，实验室提供等体积 H2O2 溶液、MnO2 粉末和 FeCl3 溶液。回答下列问题：

1. 比较两种催化剂效果时，除催化剂种类外还应控制哪些条件相同？
2. 用排水法收集 O2 时，开始记录数据前为什么要先排尽装置中的原有空气？
3. 若装置漏气，对测得的反应速率有何影响？`,
        answer: `1. 应控制 H2O2 溶液的体积、浓度、温度，以及催化剂的用量、反应容器等条件相同。
2. 若装置中原有空气未排尽，最初收集到的气体不全是 O2，会使测得气体体积偏大，影响速率判断。
3. 装置漏气会使部分 O2 未被收集，导致测得单位时间内气体体积偏小，从而使测得反应速率偏低。`,
        analysis:
          '探究实验的核心是“控制变量”。表达时既要写出被控制的量，也要说明控制原因。有关误差判断时，抓住“最终测得的气体体积偏大还是偏小”即可推断速率偏高还是偏低。',
        knowledgePoints: ['控制变量法', '气体收集误差', '实验方案评价'],
        source: '真题改编 · 2024 湖北卷实验探究题',
      },
    ],
  },
  {
    id: 'organic',
    title: '有机推断',
    color: '#8b5cf6',
    description: '官能团转化与合成路线综合推断',
    tags: ['官能团', '同分异构', '合成路线', '反应类型'],
    questions: [
      {
        id: 'org-1',
        title: '既能水解又能银镜反应的同分异构体',
        type: '填空题',
        prompt:
          '分子式为 C4H8O2 的链状有机物 X，既能发生水解反应，又能发生银镜反应。写出 X 的所有结构简式。',
        answer: `符合条件的结构有 2 种：

1. HCOOCH2CH2CH3
2. HCOOCH(CH3)2`,
        analysis:
          '“能水解”说明 X 为酯类；“能银镜反应”说明酯中必须含有甲酸形成的 HCOO- 结构。总碳数为 4，因此烃基部分为丙基，且丙基有正丙基和异丙基两种结构。',
        knowledgePoints: ['酯的结构判断', '同分异构体书写', '银镜反应条件'],
        source: '真题改编 · 2022 全国乙卷有机基础题',
      },
      {
        id: 'org-2',
        title: '由乙烯合成乙酸乙酯',
        type: '综合题',
        prompt: `以乙烯为原料合成乙酸乙酯，可设计如下路线：

CH2=CH2 → C2H5OH → CH3CHO → CH3COOH → CH3COOC2H5

回答下列问题：

1. C2H5OH → CH3CHO 的反应条件是什么？
2. CH3CHO → CH3COOH 的反应类型是什么？
3. 写出最后一步反应的化学方程式。`,
        answer: `1. 催化氧化，常用条件为 Cu 或 Ag 作催化剂、加热。
2. 氧化反应。
3. CH3COOH + C2H5OH ⇌ CH3COOC2H5 + H2O（浓 H2SO4、加热）。`,
        analysis:
          '这类题常把“合成路线”和“反应类型”绑在一起考。乙烯先水化得乙醇，乙醇催化氧化得乙醛，乙醛继续氧化得乙酸，最后乙酸与乙醇发生酯化反应生成乙酸乙酯。',
        knowledgePoints: ['官能团转化', '反应条件判断', '酯化反应方程式'],
        source: '真题改编 · 2023 新课标卷有机推断题',
      },
      {
        id: 'org-3',
        title: '芳香族化合物的官能团推断',
        type: '填空题',
        prompt:
          '某芳香族化合物 Y 的分子式为 C7H6O3，能与 FeCl3 溶液显紫色，1 mol Y 与足量 NaOH 反应可消耗 2 mol NaOH。写出任一种符合条件的 Y 的结构简式，并指出其中两种官能团。',
        answer: `任一种符合条件的结构均可，例如 o-HOC6H4COOH。

官能团为：酚羟基、羧基。`,
        analysis:
          '与 FeCl3 显紫色说明含有酚羟基；1 mol Y 消耗 2 mol NaOH 说明除酚羟基外，还含有可与 NaOH 反应的羧基。分子式为 C7H6O3 的芳香族化合物中，羟基苯甲酸类结构满足条件。',
        knowledgePoints: ['官能团性质', '分子式与结构式推断', '酚与羧酸鉴别'],
        source: '真题改编 · 2021 浙江卷有机推断题',
      },
      {
        id: 'org-4',
        title: '由丙烯制备 1,2-丙二醇',
        type: '综合题',
        prompt: `已知：

- 烯烃可与 Br2/CCl4 发生加成反应；
- 卤代烃在 NaOH 水溶液、加热条件下可发生水解反应。

以 CH2=CHCH3 为原料制备 1,2-丙二醇，可设计如下路线：

CH2=CHCH3 → A → HOCH2CHOHCH3

回答下列问题：

1. A 的结构简式是什么？
2. 第一步和第二步分别属于什么反应类型？
3. 第二步反应所需条件是什么？`,
        answer: `1. A 的结构简式为 CH2BrCHBrCH3。
2. 第一步为加成反应，第二步为水解反应（或取代反应）。
3. NaOH 水溶液、加热。`,
        analysis:
          '丙烯先与 Br2 加成生成 1,2-二溴丙烷，再在 NaOH 水溶液中加热，使两个 Br 被 OH 取代，得到 1,2-丙二醇。这类题的关键是先看官能团如何增减，再逆推每一步最典型的教材反应。',
        knowledgePoints: ['加成反应', '卤代烃水解', '合成路线推断'],
        source: '真题改编 · 2024 江苏卷有机合成题',
      },
    ],
  },
  {
    id: 'gaokao-choices',
    title: '高考高频选择题',
    color: '#ef4444',
    description: '覆盖必修全部模块的高考高频考点',
    tags: ['离子反应', '氧化还原', 'NA 判断', '元素周期律'],
    questions: [
      {
        id: 'choice-1',
        title: '阿伏伽德罗常数判断',
        type: '单选题',
        prompt: '设 NA 为阿伏伽德罗常数的值，下列说法正确的是：',
        options: [
          { key: 'A', text: '常温常压下，22.4 L CO2 中含有的氧原子数为 2NA' },
          { key: 'B', text: '1 mol Na2O2 与足量 H2O 反应，转移电子数为 NA' },
          { key: 'C', text: '17 g NH3 中含有的中子数为 10NA' },
          { key: 'D', text: '0.1 mol Fe 与足量 Cl2 反应，转移电子数为 0.2NA' },
        ],
        answer: 'B',
        analysis:
          'A 项未给出标准状况，22.4 L 不能直接对应 1 mol。B 项中 1 mol Na2O2 与水反应时，转移 1 mol 电子。C 项涉及中子数，天然氮元素同位素组成并不能这样简单计算。D 项中 Fe 与足量 Cl2 反应生成 FeCl3，0.1 mol Fe 转移 0.3NA 电子。',
        knowledgePoints: ['摩尔与阿伏伽德罗常数', '氧化还原电子转移'],
        source: '真题改编 · 2024 全国卷 NA 判断题',
      },
      {
        id: 'choice-2',
        title: '离子方程式正误判断',
        type: '单选题',
        prompt: '下列离子方程式正确的是：',
        options: [
          { key: 'A', text: '向 Na2CO3 溶液中滴加少量稀盐酸：CO3^2- + 2H^+ = CO2↑ + H2O' },
          { key: 'B', text: '向 FeCl3 溶液中加入铁粉：Fe + Fe^3+ = 2Fe^2+' },
          { key: 'C', text: '向澄清石灰水中通入过量 CO2：Ca^2+ + 2OH^- + CO2 = CaCO3↓ + H2O' },
          { key: 'D', text: '向 NaAlO2 溶液中滴加过量 HCl：AlO2^- + 4H^+ = Al^3+ + 2H2O' },
        ],
        answer: 'D',
        analysis:
          'A 项“少量酸”应生成 HCO3^-；B 项得失电子不守恒，正确应为 Fe + 2Fe^3+ = 3Fe^2+；C 项“过量 CO2”最终应生成可溶性的 Ca(HCO3)2；D 项满足原子守恒、电荷守恒，也符合“过量盐酸”的条件。',
        knowledgePoints: ['离子方程式', '反应限量分析', '守恒检验'],
        source: '真题改编 · 2023 新课标卷离子反应题',
      },
      {
        id: 'choice-3',
        title: '氧化还原中的电子守恒',
        type: '单选题',
        prompt:
          '在酸性条件下，Cr2O7^2- + 6Fe^2+ + 14H^+ = 2Cr^3+ + 6Fe^3+ + 7H2O。被 1 mol Cr2O7^2- 氧化的 Fe^2+ 的物质的量为：',
        options: [
          { key: 'A', text: '3 mol' },
          { key: 'B', text: '6 mol' },
          { key: 'C', text: '12 mol' },
          { key: 'D', text: '14 mol' },
        ],
        answer: 'B',
        analysis:
          '由配平后的离子方程式直接读出，1 mol Cr2O7^2- 恰好氧化 6 mol Fe^2+。这类题最好先写出得失电子关系，再和化学计量数对应，避免只看化合价变化不看整体配平。',
        knowledgePoints: ['氧化还原反应初步', '电子守恒', '离子方程式配平'],
        source: '真题改编 · 2022 全国甲卷氧化还原题',
      },
      {
        id: 'choice-4',
        title: '元素周期律基础判断',
        type: '单选题',
        prompt: '下列关于短周期元素性质大小规律的说法正确的是：',
        options: [
          { key: 'A', text: '原子半径：Na < Mg < Al' },
          { key: 'B', text: '第一电离能：Na > Mg > Al' },
          { key: 'C', text: '非金属性：P > S > Cl' },
          { key: 'D', text: '氢化物稳定性：HF > HCl > HBr' },
        ],
        answer: 'D',
        analysis:
          '同周期从左到右原子半径减小，因此 Na > Mg > Al，A 错。第一电离能一般增大，但 Mg 的 3s^2 较稳定，Mg > Al，B 错。非金属性大小规律应为 Cl > S > P，C 错。卤化氢稳定性大小规律为 HF > HCl > HBr > HI，D 对。',
        knowledgePoints: ['元素周期律', '原子半径', '第一电离能', '非金属性'],
        source: '真题改编 · 2021 山东卷周期律题',
      },
      {
        id: 'choice-5',
        title: '化学键与分子结构',
        type: '单选题',
        prompt: '下列关于化学键与分子结构的说法正确的是：',
        options: [
          { key: 'A', text: 'CO2 为极性分子' },
          { key: 'B', text: 'NaCl 晶体中只存在离子键' },
          { key: 'C', text: 'NH3 分子呈平面三角形结构' },
          { key: 'D', text: 'H2O 分子的键角大于 CO2 分子的键角' },
        ],
        answer: 'B',
        analysis:
          'CO2 虽然含极性键，但结构对称，为非极性分子，A 错。NaCl 为离子晶体，微粒间作用主要表现为离子键，B 对。NH3 为三角锥形，C 错。CO2 键角为 180°，H2O 键角约为 104.5°，D 错。',
        knowledgePoints: ['离子键与共价键', '分子极性', '空间构型'],
        source: '真题改编 · 2024 浙江卷结构选择题',
      },
    ],
  },
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
