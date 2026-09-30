# -*- coding: utf-8 -*-
"""Round-5: 首页新增「Latest news」左右结构区（插在 about 与 universities 之间）。
含占位内容，用户后续给素材直接替换文字/图片即可。三镜像同步。"""

import io, os

DIRS = [
    r"E:\WORKBUDDY\2026-09-03-16-18-34\company-website-preview",
    r"E:\WORKBUDDY\2026-09-03-16-18-34\company-website",
    r"D:\我的坚果云\我的坚果云\网站\中西桥教育英文官网项目",
]

# ---------- CSS（追加到 </style> 前） ----------
CSS_ANCHOR = "  /* ===== mobile: hero typography (round-3) ===== */"
# 实际锚点用 round-4 那段的块首（确认存在）
CSS_BLOCK = """
  /* ===== Latest news section (round-5) ===== */
  .news-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:44px;align-items:center;margin-top:34px}
  .news-media{position:relative;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-soft);background:var(--brand-50);aspect-ratio:4/3}
  .news-media img{width:100%;height:100%;object-fit:cover;display:block}
  .news-media .news-tag{position:absolute;top:16px;left:16px;background:var(--brand-600);color:#fff;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 12px;border-radius:var(--radius-pill)}
  .news-body h3{font-size:clamp(20px,2.4vw,26px);line-height:1.28;color:var(--brand-900);margin:10px 0 12px;letter-spacing:-.01em}
  .news-body .news-date{font-size:12.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--brand-600)}
  .news-body p{font-size:15.5px;line-height:1.72;color:var(--ink-2);margin-bottom:18px}
  .news-body .news-link{display:inline-flex;align-items:center;gap:8px;font-weight:600;color:var(--brand-700);font-size:15px}
  .news-body .news-link:hover{gap:12px}
  @media(max-width:900px){
    .news-grid{grid-template-columns:1fr;gap:26px}
    .news-media{aspect-ratio:16/10}
    .news-body h3{font-size:20px}
  }
"""

# ---------- HTML 区块（插在 about section 结尾之后） ----------
HTML_ANCHOR = """  </section>

  <section id="universities" data-page-node-id="e2ytpSE0SYwRl7YZHOQgNj">"""

HTML_BLOCK = """  </section>

  <section id="news" class="alt" data-page-node-id="nw1LatestNewsSec01">
    <div class="wrap" data-page-node-id="nw1LatestNewsWrap01">
      <div class="sec-head center" data-page-node-id="nw1LatestNewsHead01">
        <p class="eyebrow" data-page-node-id="nw1LatestNewsEyebrow1">Latest news</p>
        <h2 data-page-node-id="nw1LatestNewsTitle01">Recent developments</h2>
      </div>
      <div class="news-grid" data-page-node-id="nw1LatestNewsGrid01">
        <figure class="news-media" data-page-node-id="nw1LatestNewsMedia01">
          <img src="assets/news-01.jpg" alt="Placeholder image for the latest CWE news item" loading="lazy" data-page-node-id="nw1LatestNewsImg001">
          <span class="news-tag" data-page-node-id="nw1LatestNewsTag001">News</span>
        </figure>
        <div class="news-body" data-page-node-id="nw1LatestNewsBody01">
          <span class="news-date" data-page-node-id="nw1LatestNewsDate001">Month 2026</span>
          <h3 data-page-node-id="nw1LatestNewsH3001">News headline goes here</h3>
          <p data-page-node-id="nw1LatestNewsP0001">A short summary of this update — two or three lines describing what happened, who it involves and why it matters to our partner universities. Replace this placeholder text with the real announcement.</p>
          <a class="news-link" href="#" data-page-node-id="nw1LatestNewsLink01">Read more <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </div>
  </section>

  <section id="universities" data-page-node-id="e2ytpSE0SYwRl7YZHOQgNj">"""

print("== applying ==")
for d in DIRS:
    fp = os.path.join(d, "index.html")
    if not os.path.exists(fp):
        print("  skip (missing):", d); continue
    s = io.open(fp, encoding="utf-8").read()

    # 1) CSS
    if "Latest news section (round-5)" in s:
        print("  css already present:", os.path.basename(d))
    else:
        if s.count("</style>") != 1:
            print("  ✗ style anchor issue:", os.path.basename(d)); continue
        s = s.replace("</style>", CSS_BLOCK.strip("\n") + "\n</style>")

    # 2) HTML
    if 'id="news"' in s:
        print("  html already present:", os.path.basename(d))
    else:
        if s.count(HTML_ANCHOR) != 1:
            print("  ✗ html anchor issue:", os.path.basename(d)); continue
        s = s.replace(HTML_ANCHOR, HTML_BLOCK)

    io.open(fp, "w", encoding="utf-8", newline="").write(s)
    print("  ✓ done:", os.path.basename(d))
print("ALL DONE")
