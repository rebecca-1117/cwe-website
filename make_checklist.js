const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak
} = require("docx");

const CW = 9026; // A4 content width with 1" margins: 11906-2880
const ACCENT = "C2410C", DEEP = "7C2D12", SOFT = "FFF3E8";
const border = { style: BorderStyle.SINGLE, size: 4, color: "E5D5C3" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 70, bottom: 70, left: 110, right: 110 };

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

// 三列表格行：字段 | 说明/示例 | 填写
function row3(label, hint, fillEmpty = true, labelBold = true) {
  return new TableRow({
    children: [
      new TableCell({ borders, width: { size: 2100, type: WidthType.DXA }, margins: cellMargins, verticalAlign: VerticalAlign.CENTER,
        children: [p(r(label, { bold: labelBold, size: 21 }))] }),
      new TableCell({ borders, width: { size: 4400, type: WidthType.DXA }, margins: cellMargins,
        children: [p(r(hint, { size: 20, color: "5F5E5A" }))] }),
      new TableCell({ borders, width: { size: 2526, type: WidthType.DXA }, margins: cellMargins,
        children: fillEmpty ? [new Paragraph({ children: [] })] : [p(r(hint, { italics: true, color: "B4B2A9", size: 18 }))] }),
    ],
  });
}
function header3(t1, t2, t3) {
  return new TableRow({
    tableHeader: true,
    children: [t1, t2, t3].map((t, i) => new TableCell({
      borders, width: { size: [2100, 4400, 2526][i], type: WidthType.DXA },
      margins: cellMargins, shading: { fill: SOFT, type: ShadingType.CLEAR },
      children: [p(r(t, { bold: true, color: DEEP }))],
    })),
  });
}
function tbl3(rows) {
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [2100, 4400, 2526],
    rows,
  });
}

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 280, after: 120 }, children: [r(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 180, after: 80 }, children: [r(text)] });
}
function note(text) {
  return new Paragraph({ spacing: { after: 90 }, children: [r(text, { size: 20, color: "5F5E5A" })] });
}

// ---------- 4 列登记表（合作院校） ----------
function uniTable() {
  const heads = ["院校名称（中/英文）", "城市 · 合作形式 · 起始年", "一句话合作成果 / 亮点", "Logo 文件 · 可否公开"];
  const widths = [2300, 2500, 2726, 1500];
  const rows = [
    new TableRow({ tableHeader: true, children: heads.map((t, i) => new TableCell({
      borders, width: { size: widths[i], type: WidthType.DXA }, margins: cellMargins,
      shading: { fill: SOFT, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
      children: [p(r(t, { bold: true, color: DEEP }))],
    })) }),
  ];
  for (let i = 0; i < 6; i++) {
    rows.push(new TableRow({ children: widths.map((w) => new TableCell({
      borders, width: { size: w, type: WidthType.DXA }, margins: cellMargins,
      children: i === 0 ? [p(r(i === 0 ? "UHU 韦尔瓦大学 …" : "", { size: 18, color: "B4B2A9" }))] : [new Paragraph({ children: [] })],
    })) }));
  }
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: widths, rows });
}

// ---------- 服务条目（每行=一条服务线，已按用户定位预填） ----------
function svcRows() {
  const widths = [1600, 3100, 4326];
  const mk = (name, en, one, points) => new TableRow({
    children: [
      new TableCell({ borders, width: { size: widths[0], type: WidthType.DXA }, margins: cellMargins,
        children: [p(r(name, { bold: true })), p(r(en, { size: 16, color: "8F7A66" }))] }),
      new TableCell({ borders, width: { size: widths[1], type: WidthType.DXA }, margins: cellMargins,
        children: [p(r(one, { size: 20, color: "5F5E5A" }))] }),
      new TableCell({ borders, width: { size: widths[2], type: WidthType.DXA }, margins: cellMargins,
        children: [p(r("你的素材（覆盖灰字）", { size: 16, bold: true, color: ACCENT }), { spacing: { after: 40 } }),
          ...points.map((t) => p(r(t, { size: 20, color: "B4B2A9" }), { spacing: { after: 30 } }))] }),
    ],
  });
  const head = new TableRow({ tableHeader: true, children: ["服务线（可增删改）", "面向学校的英文定位参考（我来润色）", "你的中文素材 / 要点"].map((t, i) => new TableCell({
    borders, width: { size: widths[i], type: WidthType.DXA }, margins: cellMargins,
    shading: { fill: SOFT, type: ShadingType.CLEAR }, children: [p(r(t, { bold: true, color: DEEP }))],
  })) });
  return new Table({
    width: { size: CW, type: WidthType.DXA }, columnWidths: widths,
    rows: [head,
      mk("中外合作办学", "Cooperative education programs", "与西班牙大学共建学位项目（联合培养 / 学分互认等）", ["现有或推进中的合作办学项目名称与模式", "中方与外方院校各是谁、专业方向", "招生规模与学制（协议进展到哪一步）"]),
      mk("定制硕士班级", "Tailor-made master's cohorts", "专为中国学生（含专科背景）定制的硕士项目班级，如英语授课、1 年制", ["哪些大学开设了定制班、入学门槛", "开班周期、每期规模、授课语言", "毕业文凭与认证情况（留服认证等）"]),
      mk("留学申请送生", "Study-abroad admissions", "协助中国学生申请西班牙大学本科 / 硕士 / 博士", ["主要输送的大学层次与专业方向", "年均申请与录取人数（真实数字）", "签证成功率等可展示数据"]),
      mk("访学 · 游学营", "Study visits & short programmes", "寒暑假访学、游学营、教师考察团等短期项目", ["面向对象（学生 / 教师）、时长与城市", "每期规模与每年频次", "往期案例或照片素材"]),
    ],
  });
}

const children = [];

// ===== 封面 =====
children.push(
  new Paragraph({ spacing: { before: 1200, after: 160 }, alignment: AlignmentType.CENTER,
    children: [r("公司官网 · 内容准备清单", { bold: true, size: 52, color: DEEP })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
    children: [r("面向国外高校展示的英西双语企业官网（配橙色首页 demo）", { size: 24, color: "5F5E5A" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
    children: [r("版本 1.1 · 按你的定位预排四大服务线：合作办学 · 定制硕士班 · 留学送生 · 访学游学营", { size: 20, color: "8F7A66" })] }),
  h2("怎么用这份清单"),
  note("① 每个方框区域直接打字填写即可；填多少发多少，不必等全部齐。"),
  note("② 文案只需给中文事实与意思，英文与西语由我统一润色，你不用写英文。"),
  note("③ 数字必须真实，宁少勿夸——国外学校最看重可信度。"),
  note("④ Logo 找不到高清版不用急：告诉我学校名，我从对方官网获取并处理版权与尺寸。"),
  h2("优先级说明"),
  p(r("P0 开工必须有", { bold: true, color: ACCENT }) + r("　P1 强烈建议提供　", { color: "404040" }) + r("P2 可后补，不影响上线", { color: "8F7A66" })),
  new Paragraph({ children: [new PageBreak()] })
);

// ===== 1 品牌 =====
children.push(h1("1 · 品牌基本信息（全站统一使用）"));
children.push(note("这是网站的“脸面”，决定 Logo、域名和页眉，优先准备。"));
children.push(tbl3([
  header3("字段", "说明 / 示例", "填写"),
  row3("机构英文正式名称", "出现在 Logo、页眉和域名。当前占位 “Puente Education”（西语“桥”）可沿用或替换"),
  row3("机构中文名称", "如果中文版/国内展示需要；英文版可不放"),
  row3("Logo 文件", "透明底 PNG/SVG，宽不低于 1000px；暂无则先用文字版"),
  row3("成立年份 / 主体", "如 2015 年创立；公司或个人主体名（可不公开展示）"),
  row3("总部城市", "北京 / 马德里……可写“北京，中国 · 马德里，西班牙”"),
  row3("一句定位语 slogan", "中文意思即可。建议突出“专注西班牙”：例“专注西班牙：连接中国学生与西班牙大学的伙伴”，我据此给 2–3 个英文备选"),
  row3("机构简介素材", "散句或 bullet 即可。建议包含：专注西班牙（只做西班牙大学）、团队专业、国内外渠道网络、四大服务线概况"),
]));
children.push(spacer());

// ===== 2 首页 =====
children.push(h1("2 · 首页 Home"));
children.push(tbl3([
  header3("素材", "说明 / 示例", "填写"),
  row3("Hero 主标题", "给外校的第一印象，2–3 个候选或一段中文意思"),
  row3("数据条数字 ①", "合作院校数量，如 4+（写真实数字）"),
  row3("数据条数字 ②", "累计输送学生数，如 300+"),
  row3("数据条数字 ③", "成立年限或其他亮点，如 10+ 年"),
  row3("机构简介段落", "首页“关于我们”摘要，3–4 句素材"),
  row3("主视觉照片", "横向 16:9 高清，无主视觉可先留白"),
  row3("为什么选我们（2–3 条）", "国外学校选你合作的理由。三个天然优势可展开写：专注西班牙一国 → 更懂更深；团队专业、中西两地 → 执行靠谱；国内外渠道网络广 → 生源稳定（P0，全站文案围绕它）"),
]));
children.push(spacer());

// ===== 3 关于 =====
children.push(h1("3 · 关于我们 About"));
children.push(tbl3([
  header3("素材", "说明 / 示例", "填写"),
  row3("机构故事", "为什么做中欧教育合作；可写时间线（哪年、做了什么、怎么发展）"),
  row3("使命 / 愿景一句话", "你们想达成的目标（P1）"),
  row3("团队 / 资质（P2）", "团队规模、负责人简介、相关资质证书"),
  row3("照片（P2）", "办公室 / 团队合影 / 校园活动"),
]));
children.push(spacer());

// ===== 4 合作院校 =====
children.push(h1("4 · 合作院校与项目（全站重点页）"));
children.push(note("这是国外学校最看重的一页——证明你们是“有真实合作的伙伴”。每所学校填一行即可，合作形式参考：学位项目输送 / 中外合作办学共建 / 招生合作 / 语言桥梁 / 其他。"));
children.push(note("注意：是否公开展示某所学校的合作，务必以双方约定为准；拿不准就先标“需确认”。"));
children.push(uniTable());
children.push(spacer());

// ===== 5 服务 =====
children.push(h1("5 · 服务项目 Services"));
children.push(note("已按你确认的定位预填四条服务线：中外合作办学 / 定制硕士班级 / 留学申请送生 / 访学游学营。灰字是提示示例，直接覆盖成真实素材即可；名称与数量可自行增删。"));
children.push(svcRows());
children.push(spacer());

// ===== 6 成果 =====
children.push(h1("6 · 成果与评价 Outcomes"));
children.push(tbl3([
  header3("素材", "说明 / 示例", "填写"),
  row3("成果数字", "如录取率 / 签证成功率 / 奖学金人数等（有则填，没有就只保留首页数据）"),
  row3("学生去向案例（P2）", "2–3 个：学生背景 → 去向院校与专业 → 时间。可匿名（“某专科毕业生 → XX 大学硕士”）"),
  row3("外方院校评价（P2）", "合作校方一句正面评价，最好取得对方同意"),
]));
children.push(spacer());

// ===== 7 联系 =====
children.push(h1("7 · 联系方式 Contact"));
children.push(note("国外学校主要通过邮件联系你们，邮箱是唯一必填项。上线后建议再配一个 info@你的域名 的邮箱，更显专业。"));
children.push(tbl3([
  header3("字段", "说明 / 示例", "填写"),
  row3("联系邮箱", "必填。国外学校主要联系渠道"),
  row3("备用邮箱", "国内合作方联系用（可选）"),
  row3("电话 / WhatsApp", "建议 +86…（中国）/ +34…（西班牙）分别标注"),
  row3("微信", "国内学生家长联系用（网站英文版可不展示）"),
  row3("办公地址", "写到城市级别即可，无需门牌（可选）"),
  row3("网站语言确认", "已定：英文 + 西班牙语。未来是否加中文版？（可选）"),
]));
children.push(spacer());

// ===== 8 图片 =====
children.push(h1("8 · 图片素材清单（P1，可分批）"));
children.push(note("照片能大幅提升可信度，但全部可后补——没有的话我先用专业占位图顶替，你之后随时替换。"));

// photo table
function photoTable() {
  const widths = [1700, 4200, 1260, 950, 916];
  const head = new TableRow({ tableHeader: true, children: ["用途", "内容建议", "规格", "数量", "已备？"].map((t, i) => new TableCell({
    borders, width: { size: widths[i], type: WidthType.DXA }, margins: cellMargins,
    shading: { fill: SOFT, type: ShadingType.CLEAR }, children: [p(r(t, { bold: true, color: DEEP }))],
  })) });
  const data = [
    ["首页主视觉", "有学生/校园/城市氛围的大图，横向 16:9", "≥1600px 宽", "1"],
    ["签约 / 授牌仪式", "与高校签约、揭牌、正式访问合影", "≥1200px 宽", "2–3"],
    ["会议 / 校园访问", "与外方院校开会、参观校园", "≥1200px 宽", "2–3"],
    ["学生活动 / 上课", "学生在上课、活动、机场送行等", "≥1200px 宽", "2–3"],
    ["办公室 / 团队", "办公环境或团队合影（体现真实机构）", "≥1200px 宽", "1–2"],
  ];
  const rows = data.map((d) => new TableRow({
    children: d.map((txt, i) => new TableCell({ borders, width: { size: widths[i], type: WidthType.DXA }, margins: cellMargins,
      children: [p(r(txt, { size: 20, color: i === 1 ? "5F5E5A" : "404040" }))] })),
  }));
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: widths, rows: [head, ...rows] });
}
children.push(photoTable());
children.push(spacer());

// ===== 9 文件 =====
children.push(h1("9 · 可下载文件（P2）"));
children.push(note("可选：在网站放“下载区”，供校方下载项目介绍。注意：合作协议等含保密条款的文件切勿直接公开，如需展示请先与对方确认公开版本。"));
children.push(tbl3([
  header3("文件", "说明", "填写"),
  row3("项目介绍 PDF", "中 / 英 / 西语版均可，英文优先", true, true),
  row3("合作名录 / 简章", "可公开的院校合作或项目简章", true, true),
]));
children.push(spacer());

// ===== 10 提交 =====
children.push(h1("10 · 填好后怎么发我"));
children.push(new Paragraph({ spacing: { after: 90 }, numbering: { reference: "tips", level: 0 },
  children: [r("核心先发：机构英文名 + slogan 中文意思 + 合作院校名单（含每校合作形式），我就能先把整站内容填实。", { size: 21 })] }));
children.push(new Paragraph({ spacing: { after: 90 }, numbering: { reference: "tips", level: 0 },
  children: [r("照片与 Logo 可以打包发我（微信/文件夹均可），文件命名写清用途即可。", { size: 21 })] }));
children.push(new Paragraph({ spacing: { after: 90 }, numbering: { reference: "tips", level: 0 },
  children: [r("收到后我的流程：替换全站真实内容 → 西班牙语版 → 部署给你正式网址预览 → 你确认后买域名绑定 → 配好 /admin 自助后台交给你。", { size: 21 })] }));

const doc = new Document({
  styles: {
    default: { document: { run: { font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }, size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: DEEP, font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" } },
        paragraph: { spacing: { before: 320, after: 140 } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: ACCENT, font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" } },
        paragraph: { spacing: { before: 200, after: 100 } } },
    ],
  },
  numbering: {
    config: [{
      reference: "tips", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 460, hanging: 260 } } } }],
    }],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new (require("docx").Header)({ children: [p(r("公司官网 · 内容准备清单", { size: 18, color: "8F7A66" }))] }) },
    footers: { default: new (require("docx").Footer)({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [r("第 ", { size: 18, color: "8F7A66" }), new (require("docx").TextRun)({ children: [require("docx").PageNumber.CURRENT], size: 18, color: "8F7A66" }), r(" 页", { size: 18, color: "8F7A66" })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("E:/WORKBUDDY/2026-09-03-16-18-34/company-website/公司官网内容准备清单.docx", buf);
  console.log("OK written");
});
