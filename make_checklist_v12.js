const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, Header, Footer, PageNumber
} = require("docx");

const CW = 9026;
const ACCENT = "C2410C", DEEP = "7C2D12", SOFT = "FFF3E8";
const GREEN = "2E7D32", GREEN_BG = "EAF5EA", GREY = "8F7A66";
const border = { style: BorderStyle.SINGLE, size: 4, color: "E5D5C3" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 70, bottom: 70, left: 110, right: 110 };
const FONT = { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" };

function r(text, opts = {}) {
  return new TextRun({ text, ...opts });
}
function p(children, opts = {}) {
  let arr;
  if (Array.isArray(children)) arr = children;
  else if (children instanceof TextRun) arr = [children];
  else arr = [r(children)];
  return new Paragraph({ children: arr, ...opts });
}
function spacer(pts = 6) {
  return new Paragraph({ spacing: { after: pts }, children: [] });
}
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 280, after: 120 }, children: [r(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 90 }, children: [r(text)] });
}
function note(text, color = "5F5E5A", size = 20) {
  return new Paragraph({ spacing: { after: 90 }, children: [r(text, { size, color })] });
}
function blist(text, color = "404040") {
  return new Paragraph({ spacing: { after: 60 }, numbering: { reference: "tips", level: 0 },
    children: [r(text, { size: 20, color })] });
}

// ---- 3 列工具表 ----
function tcell(t, w, opts = {}) {
  return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER, shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    children: Array.isArray(t) ? t : [p(r(t, opts.run || {}))] });
}
// label | hint | fill(填写格)
function row3(label, hint, fill, opts = {}) {
  const W = [2000, 4400, 2626];
  const fillCell = fill === "" ? [new Paragraph({ children: [] })] :
    [p(r(fill, { size: 20, color: opts.fillColor || (opts.pre ? GREEN : "404040"), bold: opts.pre }))];
  return new TableRow({
    children: [
      tcell([p(r(label, { bold: true, size: 21, color: opts.labelColor || "404040" }))], W[0]),
      tcell([p(r(hint, { size: 19, color: "5F5E5A" }))], W[1]),
      tcell(fillCell, W[2], { fill: opts.fill ? opts.fill : (opts.pre ? GREEN_BG : undefined) }),
    ],
  });
}
function header3(t1, t2, t3) {
  const W = [2000, 4400, 2626];
  return new TableRow({
    tableHeader: true,
    children: [t1, t2, t3].map((t, i) => new TableCell({
      borders, width: { size: W[i], type: WidthType.DXA }, margins: cellMargins,
      shading: { fill: SOFT, type: ShadingType.CLEAR }, children: [p(r(t, { bold: true, color: DEEP }))],
    })),
  });
}
function tbl3(rows) {
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [2000, 4400, 2626], rows });
}

// ---- 4 列通用表 ----
function header4(titles, widths) {
  return new TableRow({
    tableHeader: true,
    children: titles.map((t, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA }, margins: cellMargins,
      shading: { fill: SOFT, type: ShadingType.CLEAR }, children: [p(r(t, { bold: true, color: DEEP }))],
    })),
  });
}
function row4(cells, widths, colors = []) {
  return new TableRow({ children: cells.map((c, i) => tcell(
    Array.isArray(c) ? c : [p(r(c, { size: 20, color: colors[i] || "404040", bold: colors[i] === GREEN || i === 0 && false }))], widths[i])) });
}

const children = [];

// ================= 封面 =================
children.push(
  new Paragraph({ spacing: { before: 900, after: 160 }, alignment: AlignmentType.CENTER,
    children: [r("公司官网素材清单", { bold: true, size: 52, color: DEEP })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
    children: [r("v1.2 · 进度核对版", { bold: true, size: 26, color: ACCENT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 },
    children: [r("橙色首页已定稿 · 8 所合作院校已上墙 · 剩余待填 14 项", { size: 22, color: "5F5E5A" })] }),
  h2("怎么用这份清单"),
  blist("第 1 部分（✅ 绿字）= 已经从 PPT 和你确认的素材，锁定不用再填；发现错误直接圈出告诉我。", DEEP),
  blist("第 2 部分 = 真正需要你补充的。先填 P0（只有 5 件事卡着开工），再 P1，P2 上线前给即可。", DEEP),
  blist("第 3 部分 = 文案代笔清单。公司介绍、优势、简介这类文案我来写初稿，你只需审，不用写。", DEEP),
  blist("每格给中文意思即可，英文与西语由我润色。填多少发多少，不必等齐。", DEEP),
  spacer(4),
  new Paragraph({ children: [new PageBreak()] })
);

// ================= 1 已确认总览 =================
children.push(h1("第 1 部分 · 已确认素材总览（核对用，不用填）"));

// A 品牌档案
children.push(h2("A. 品牌档案（来源：你的英文宣传 PPT + 对话确认）"));
children.push(tbl3([
  header3("字段", "内容", "状态"),
  row3("机构中文名", "北京中西桥教育（对外英文名写法见 P0-3）", "北京中西桥教育", { pre: true }),
  row3("英文全称", "Beijing Zhongxiqiao Education Consulting", "已确认", { pre: true }),
  row3("品牌缩写", "CWE = Chinese and Western Exchanges（是否对外展示 → P0-3）", "已确认", { pre: true }),
  row3("成立年份", "2011 年创立", "已确认", { pre: true }),
  row3("总部与分支", "北京（总部）· 马德里 · 巴塞罗那", "已确认", { pre: true }),
  row3("Logo 样式", "多彩折纸图标 + “中西桥 · CWE” 字标（矢量源文件 → P1-7）", "已见样稿", { pre: true }),
  row3("创始团队", "三位合伙人，平级关系（展示方案 → P1-6）", "待你勾选", { pre: false }),
]));
children.push(spacer());

// B 合作院校
children.push(h2("B. 西班牙合作院校（8 所，均有 MOU/协议，已上首页）"));
children.push(note("❓ 标记的 4 所，其卡片描述目前是 AI 按校名推断的初稿，需要你各补一句真实合作内容（见 P0-1）。"));
const uniW = [2300, 1500, 1400, 3826];
children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: uniW, rows: [
  header4(["院校", "城市", "性质", "网站描述状态"], uniW),
  row4(["UAB 巴塞罗那自治大学", "巴塞罗那", "公立", "✅ 已确证：2016 起中国推广与招生伙伴；CAU 带学分预科在运行"], uniW, ["404040", "404040", "404040", GREEN]),
  row4(["CETT · 巴塞罗那大学", "巴塞罗那", "公立", "❓ 待你补一句合作内容（P0-1）"], uniW, ["404040", "404040", "404040", ACCENT]),
  row4(["USAL 萨拉曼卡大学", "萨拉曼卡", "公立", "✅ 已确证：ELE USAL Beijing 语言学院(2021)；国际项目中国独家代理(2025)；CAU 预科"], uniW, ["404040", "404040", "404040", GREEN]),
  row4(["IQS · 拉蒙尤以大学", "巴塞罗那", "私立", "❓ 待你补一句合作内容（P0-1）"], uniW, ["404040", "404040", "404040", ACCENT]),
  row4(["EAE 商学院", "巴塞罗那/马德里", "私立", "❓ 待你补一句合作内容（P0-1）"], uniW, ["404040", "404040", "404040", ACCENT]),
  row4(["UEM 马德里欧洲大学", "马德里", "私立", "❓ 待你补一句合作内容（P0-1）"], uniW, ["404040", "404040", "404040", ACCENT]),
  row4(["UCJC 卡米洛·何塞·塞拉大学", "马德里", "私立", "✅ 与你确认一致：为中国学生定制的硕士班"], uniW, ["404040", "404040", "404040", GREEN]),
  row4(["UAX 智者阿方索十世大学", "马德里", "私立", "✅ 与你确认一致：健康科学方向合作（含与中方大学联合项目）"], uniW, ["404040", "404040", "404040", GREEN]),
  row4(["UHU 韦尔瓦大学 ⚠️", "韦尔瓦", "公立", "名单外 —— 待你决定去留（P0-2）"], uniW, [ACCENT, "404040", "404040", ACCENT]),
]}));
children.push(spacer());

// C 服务线
children.push(h2("C. 四大服务线（英文名已定，网站服务区已按此排好）"));
children.push(tbl3([
  header3("中文服务线", "英文名（用于网站）", "状态"),
  row3("中外合作办学", "Cooperative education programs", "已排好", { pre: true }),
  row3("定制硕士班级", "Tailor-made master's cohorts", "已排好", { pre: true }),
  row3("留学申请送生", "Study-abroad admissions", "已排好", { pre: true }),
  row3("访学 · 游学营", "Study visits & short programmes", "已排好", { pre: true }),
]));
children.push(note("说明：PPT 里的语言培训、CAU 预科、全学段项目等资源，将并入上述四大线的详情或 About 页，无需单独列服务。"));
children.push(spacer());

// D 数字与荣誉
children.push(h2("D. 核心数字与荣誉时间线（来源：PPT，需你最后过目措辞）"));
children.push(tbl3([
  header3("内容", "PPT 原始表述", "网站处理建议"),
  row3("签证成功率", "99% Visa approval rate", "✅ 可直接用：99% visa success rate", { pre: true }),
  row3("团队海外经历", "90% team with study-abroad experience", "✅ 可用", { pre: true }),
  row3("团队硕士学历", "70% team with master's degree", "✅ 可用", { pre: true }),
  row3("合作院校数", "nearly 100 universities & colleges", "✅ 建议“近 100 所”（涵盖语言培训合作，非全部上墙）", { pre: true }),
  row3("“中国最大”表述", "the largest Spanish training institution in China", "⚠️ 建议改 “a leading / one of the largest”（→ P2-13）", { pre: true }),
  row3("“100% 录取率”", "100% admission rate", "⚠️ 建议注明语境或改为更稳妥说法（→ P2-13）", { pre: true }),
]));
children.push(h2("荣誉时间线（已确认，将用于 About 页）"));
children.push(note("2015 全国留学服务联盟成员 · 2016 UAB 中国唯一战略推广伙伴 · 2017 获马德里市长接见 · 2018《光明日报》“留学”杂志 Bright Elite / Bright Messenger 奖（CEO）· 2021 成立 ELE USAL Beijing · 2025 USAL 国际项目中国独家总代理", "404040"));
children.push(spacer());
children.push(new Paragraph({ children: [new PageBreak()] }));

// ================= 2 待补充 =================
children.push(h1("第 2 部分 · 待你补充（v1.2 真正要填的都在这里）"));

// P0
children.push(h2("P0 · 开工前必须有（5 件事，卡着整站文案定稿）"));
children.push(tbl3([
  header3("编号 / 要什么", "说明", "填写（中文即可）"),
  row3("P0-1 · 四所院校合作内容", "CETT / IQS / EAE / UEM 各一句即可。示例：“和 XX 合作招生/共建项目/输送硕士生，已落地 XX 届”。只写事实，不用润色。", ""),
  row3("", "", ""),
  row3("", "", ""),
  row3("", "", ""),
  row3("P0-2 · UHU 是否上墙", "☐ 加入合作名单（补一句合作形式）　☐ 暂不上（理由可留空）", "☐"),
  row3("P0-3 · 对外英文名三选一", "决定站名/Logo/域名。☐ 用全称 Beijing Zhongxiqiao Education Consulting　☐ 用简称 Zhongxiqiao Education　☐ 主打品牌 CWE (Chinese and Western Exchanges)＋全称小字", "☐"),
  row3("P0-4 · 联系邮箱（必填）", "国外学校联系主渠道。上线后可升级为 info@你的域名", ""),
  row3("P0-5 · 公司注册名", "法人主体中/英文名。只用于法律声明页（Aviso Legal），不必公开展示", ""),
]));
children.push(spacer());

// P1
children.push(h2("P1 · 强烈建议提供（5 项，视觉与 About 页完善）"));
children.push(tbl3([
  header3("编号 / 要什么", "说明", "填写（中文即可）"),
  row3("P1-6 · 创始人展示方案", "三选一（决定 About 页结构）：☐ 三人同框展示（推荐，Co-founders 平级称谓）　☐ 三人都不放（About 只写公司）　☐ 其他想法", "☐"),
  row3("P1-6a · 若选同框：创始人 1", "姓名 / 英文名（可无）/ 职务统一写 Co-founder / 一句话背景（如“负责中西院校合作”）/ 照片文件", ""),
  row3("P1-6b · 创始人 2", "", ""),
  row3("P1-6c · 创始人 3", "", ""),
  row3("P1-7 · Logo 矢量文件", ".ai / .svg / 透明底高清 PNG（顶栏、页脚、页签都要用）", ""),
  row3("P1-8 · 办公地址", "写到城市级即可，如“北京 · 马德里 · 巴塞罗那”", ""),
  row3("P1-9 · 电话 / WhatsApp", "格式建议：+86 …（中国）+34 …（西班牙），分别标注", ""),
  row3("P1-10 · 照片素材", "见下方照片清单（优先无学生脸的照片）", "见下表"),
]));
children.push(spacer());

// photo table
children.push(h2("照片素材清单（P1，可分批补）"));
children.push(note("重要：PPT 中带学生脸/姓名的合影涉及 GDPR（欧盟数据隐私），未获本人书面授权前不用于对外网站。下列用途请优先选无学生脸或已获授权的照片；没有就先留占位。"));
function photoTable() {
  const widths = [1700, 4200, 1260, 950, 916];
  const head = new TableRow({ tableHeader: true, children: ["用途", "内容建议", "规格", "数量", "已备？"].map((t, i) => new TableCell({
    borders, width: { size: widths[i], type: WidthType.DXA }, margins: cellMargins,
    shading: { fill: SOFT, type: ShadingType.CLEAR }, children: [p(r(t, { bold: true, color: DEEP }))],
  })) });
  const data = [
    ["首页主视觉", "有校园/城市氛围的大图，无学生正脸，横向 16:9", "≥1600px", "1"],
    ["签约 / 授牌仪式", "与高校签约、揭牌、正式访问（无正脸或获授权）", "≥1200px", "2–3"],
    ["会议 / 校园访问", "与外方院校开会、参观校园", "≥1200px", "2–3"],
    ["办公室 / 团队", "办公环境或团队合影（体现真实机构）", "≥1200px", "1–2"],
  ];
  const rows = data.map((d) => new TableRow({
    children: d.map((txt, i) => new TableCell({ borders, width: { size: widths[i], type: WidthType.DXA }, margins: cellMargins,
      children: [p(r(txt, { size: 20, color: i === 1 ? "5F5E5A" : "404040" }))] })),
  }));
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: widths, rows: [head, ...rows] });
}
children.push(photoTable());
children.push(spacer());

// P2
children.push(h2("P2 · 可后补（不影响我先出整站初稿）"));
children.push(tbl3([
  header3("编号 / 要什么", "说明", "填写"),
  row3("P2-11 · 累计送生总数", "替换首页数据条占位“300+”；没有就删掉该格", ""),
  row3("P2-12 · 域名备选 1–3 个", "如 zhongxiqiao-edu.com / cwe-education.com / 你的想法", ""),
  row3("P2-13 · 两处措辞决策", "“largest”：☐ one of the largest　☐ a leading；“100% admission”：☐ 注明项目语境　☐ 改为 high admission rate", "☐"),
  row3("P2-14 · 院校 Logo 授权流程", "我方流程：从各校官网获取 Logo → 上线前发邮件知会对方国际处。☐ 同意按此流程", "☐"),
]));
children.push(spacer());
children.push(new Paragraph({ children: [new PageBreak()] }));

// ================= 3 代笔清单 =================
children.push(h1("第 3 部分 · 我为你代笔的文案（你只需审，不用写）"));
children.push(note("下列内容我会基于 PPT + 你的定位 + 已确认信息直接写好初稿（英西双语），按顺序发你审。你逐条回“OK”或指出修改处即可。"));
const W = [2600, 6426];
children.push(new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: W, rows: [
  header4(["代笔内容", "说明"], W),
  row4(["一句定位语 slogan", "基于“专注西班牙、连接中国学生与西班牙大学”方向，给出 2–3 个英文候选供你选"], W),
  row4(["公司简介 About", "机构故事 + 使命 + 中西两地团队，150–200 词英文版"], W),
  row4(["首页 Hero 与 Why us", "主标题/副标题 + “为什么选我们”4 条（专注西班牙 / 团队专业 / 渠道网络 / 可核实合作）"], W),
  row4(["四大服务详情", "每条服务的英文描述与要点列表，基于你确认的定位扩写"], W),
  row4(["8 校合作描述定稿", "你补完 P0-1 后，我逐校改写为最终英文卡片文案"], W),
  row4(["荣誉时间线英文", "2015–2025 里程碑英文表述"], W),
  row4(["合规两页（法律声明+隐私政策）", "Aviso Legal 与 Privacy Policy 的标准英西模板，只需公司注册名即可生成"], W),
  row4(["整站文案英→西", "全部页面文案的西班牙语版本"], W),
]}));
children.push(spacer());

// ================= 提交 =================
children.push(h1("填好后怎么发我"));
children.push(new Paragraph({ spacing: { after: 90 }, numbering: { reference: "tips", level: 0 },
  children: [r("优先发 P0 的 5 项（四校描述 / UHU / 英文名 / 邮箱 / 注册名），我即可把首页文案定稿并开始做其余页面。", { size: 21 })] }));
children.push(new Paragraph({ spacing: { after: 90 }, numbering: { reference: "tips", level: 0 },
  children: [r("照片与 Logo 打包发我即可，文件命名写清用途（如 hero.jpg / office-1.jpg）。", { size: 21 })] }));
children.push(new Paragraph({ spacing: { after: 90 }, numbering: { reference: "tips", level: 0 },
  children: [r("收到素材后流程：填实整站 → 出西班牙语版 → 部署预览 → 域名 → 免费 /admin 后台交付。", { size: 21 })] }));

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: DEEP, font: FONT }, paragraph: { spacing: { before: 320, after: 140 } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: ACCENT, font: FONT }, paragraph: { spacing: { before: 200, after: 100 } } },
    ],
  },
  numbering: { config: [{ reference: "tips", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 460, hanging: 260 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [p(r("公司官网素材清单 v1.2", { size: 18, color: GREY }))] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [r("第 ", { size: 18, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GREY }), r(" 页", { size: 18, color: GREY })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("E:/WORKBUDDY/2026-09-03-16-18-34/company-website/公司官网素材清单 v1.2.docx", buf);
  console.log("OK v1.2 written");
});
