# -*- coding: utf-8 -*-
"""2026-09-09 round 2: mobile nav hamburger + footer stacking + hero center-crop + badge/see-more removal + 4 copy tweaks."""
import io, os, sys

# ---------- CSS block appended to every page before </style> ----------
CSS_BLOCK = """
  /* ===== mobile: hamburger nav (round-2) ===== */
  .nav-toggle-input{display:none}
  .nav-toggle{display:none}
  @media(max-width:860px){
    .nav-in{height:60px}
    .nav-toggle{display:inline-flex;flex-direction:column;justify-content:center;gap:5px;width:44px;height:44px;margin-left:auto;cursor:pointer;z-index:70}
    .nav-toggle span{display:block;width:22px;height:2px;border-radius:2px;background:var(--brand-900);transition:transform .25s,opacity .2s}
    .nav-toggle-input:checked ~ .nav-toggle span:nth-child(1){transform:translateY(7px) rotate(45deg)}
    .nav-toggle-input:checked ~ .nav-toggle span:nth-child(2){opacity:0}
    .nav-toggle-input:checked ~ .nav-toggle span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
    .nav-links{position:absolute;top:100%;left:0;right:0;z-index:65;display:flex;flex-direction:column;align-items:stretch;gap:0;margin:0;background:#fff;border-top:1px solid var(--line);box-shadow:0 30px 50px rgba(124,45,18,.16);padding:6px 28px 26px;opacity:0;visibility:hidden;transform:translateY(-10px);transition:opacity .22s,transform .22s,visibility .22s;max-height:calc(100vh - 60px);overflow-y:auto}
    .nav-toggle-input:checked ~ .nav-links{opacity:1;visibility:visible;transform:none}
    .nav-links a{display:block;padding:13px 2px;font-size:15px;font-weight:600;border-bottom:1px solid var(--line);color:var(--brand-900)}
    .nav-links a:hover{color:var(--brand-600)}
    .nav-links .drop{width:100%}
    .drop>a{padding:13px 2px}
    .drop-menu{position:static;display:block;transform:none;background:transparent;border:none;box-shadow:none;border-radius:0;padding:0 0 4px 16px;min-width:0}
    .drop-menu::before{display:none}
    .drop-menu a{border-bottom:none;padding:9px 2px;font-size:14px;font-weight:500;color:var(--ink-2)}
    .nav-links .btn{margin:18px 0 0;text-align:center;padding:12px}
    .nav-links .btn{border:none}
  }
  /* ===== mobile: footer stacking (round-2) ===== */
  @media(max-width:760px){
    .foot-top{gap:22px 16px}
    .foot-brand{width:100%;max-width:none;margin-bottom:4px}
    .foot-col{width:calc(50% - 8px)}
    .foot-bottom{flex-direction:column;align-items:center;gap:8px;text-align:center}
    footer{padding:44px 0 32px}
  }
"""

# anchor: every page has exactly one </style>
CSS_ANCHOR_OLD = "</style>"

# ---------- hamburger markup inserted before <nav class="nav-links" ... ----------
TOGGLE_HTML = ('    <input type="checkbox" id="navToggle" class="nav-toggle-input" />\n'
               '    <label for="navToggle" class="nav-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></label>\n'
               '    <nav class="nav-links"')
NAV_ANCHOR_OLD = "    <nav class=\"nav-links\""

# ---------- index-only edits ----------
INDEX_EDITS = [
    # remove hero badge line entirely
    ('\n      <span class="badge" data-page-node-id="VsHwhRoNwtbejAjcL9ilsM"><i data-page-node-id="u5tEXwWYeOuFG5zyIiEEV5"></i>Beijing Zhongxiqiao Education Consulting</span>', '', 1),
    # remove the four "See how we work" links (whole lines)
    ('\n          <a class="svc-more" href="cooperative-education.html" data-page-node-id="kFKwa3H8QVvLCWarAGbRq0">See how we work</a>', '', 1),
    ('\n          <a class="svc-more" href="tailor-made-master.html" data-page-node-id="glgmAoww8UwP3Dftn5LtvB">See how we work</a>', '', 1),
    ('\n          <a class="svc-more" href="admissions.html" data-page-node-id="O359Soe10pRFEo0Dxc3NCG">See how we work</a>', '', 1),
    ('\n          <a class="svc-more" href="study-visits.html" data-page-node-id="HKqyqumoHytHidDcugwWGR">See how we work</a>', '', 1),
    # copy tweak 1: about h2 Spanish -> abroad
    ('A China-based team focused on Spanish higher education', 'A China-based team focused on higher education abroad', 1),
    # copy tweak 2: why-section lead -> European market
    ('We focus on one country and know its system deeply, so universities get a partner who delivers \u2014 not a middleman who spreads thin.',
     'We focus on the European market and know it deeply, so universities get a partner who delivers \u2014 not a middleman who spreads thin.', 1),
    # hero image: mobile shows full-width center of the image, no side mask
    ('@media(max-width:560px){.hero-media .side.r{display:none}.hero-media .side.l{left:0;width:100%}}',
     '@media(max-width:560px){.hero-media .side.r{display:none}.hero-media .side.l{left:0;width:100%;background-position:center;-webkit-mask-image:none;mask-image:none}}', 1),
]

# ---------- about-only edits ----------
ABOUT_EDITS = [
    # copy tweak 3: h3 -> European market
    ('Deep focus on one country', 'Deep focus on the European market', 1),
    # copy tweak 4: SEO meta description Spain -> Europe
    ('focused exclusively on Spain. Beijing', 'focused exclusively on Europe. Beijing', 1),
]

PAGES = ["index.html", "about.html", "partners.html", "cooperative-education.html",
         "tailor-made-master.html", "admissions.html", "study-visits.html", "contact.html"]

DIRS = [
    r"E:\WORKBUDDY\2026-09-03-16-18-34\company-website-preview",
    r"E:\WORKBUDDY\2026-09-03-16-18-34\company-website",
    r"D:\我的坚果云\我的坚果云\网站\中西桥教育英文官网项目",
]

def apply_file(path, page):
    s = io.open(path, encoding="utf-8").read()
    edits = [(NAV_ANCHOR_OLD, TOGGLE_HTML, 1),
             (CSS_ANCHOR_OLD, CSS_BLOCK + "</style>", 1)]
    if page == "index.html":
        edits += INDEX_EDITS
    elif page == "about.html":
        edits += ABOUT_EDITS
    for old, new, exp in edits:
        n = s.count(old)
        if n != exp:
            print(f"  FAIL {page}: count={n} expected={exp} :: {old[:80]!r}")
            return False
        s = s.replace(old, new)
    io.open(path, "w", encoding="utf-8", newline="").write(s)
    return True

ok = True
for d in DIRS:
    print("DIR:", d)
    for p in PAGES:
        fp = os.path.join(d, p)
        if not os.path.exists(fp):
            print(f"  SKIP {p} (missing)")
            continue
        print(("  OK   " if apply_file(fp, p) else "  FAIL "), p)
        ok = ok and True
sys.exit(0)
