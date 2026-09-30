# -*- coding: utf-8 -*-
"""Apply copy-master-table changes (2026-09-09 batch) to all 8 html pages across mirror dirs."""
import io, sys, os

# --- text fragments (using \u2013 en-dash, \u2014 em-dash) ---
SLOGAN_OLD = "Education cooperation between China and Spain. Beijing \u00b7 Madrid."
SLOGAN_NEW = "Education cooperation between China and Europe. Beijing \u00b7 Madrid."

COMMON = [  # applied to every one of the 8 pages, expected 3 hits each (og:desc + twitter:desc + footer)
    (SLOGAN_OLD, SLOGAN_NEW, 3),
]

INDEX = [
    # <title> + og:title share the same substring (2 hits)
    ("Zhongxiqiao Education \u2014 Building bridges for Sino\u2013Spanish education",
     "Zhongxiqiao Education \u2014 Bridging China-Europe Academic Partnerships", 2),
    # hero h1 (keep <em> emphasis)
    ('<em data-page-node-id="7kIctFZUmE9YTvtZDFzydx">Sino\u2013Spanish education</em>',
     '<em data-page-node-id="7kIctFZUmE9YTvtZDFzydx">China-Europe Academic Partnerships</em>', 1),
    # hero lead (translated from user's Chinese)
    ('We help Spanish universities and Chinese institutions build lasting education partnerships \u2014 and help Chinese students find the right path in Spain.',
     'We help overseas partner universities expand their cooperation with China \u2014 connecting them with Chinese institutions and building two-way channels for academic exchanges and research collaboration.',
     1),
    # #about paragraph (keep <strong>)
    ('Founded in Beijing in 2011, <strong>Beijing Zhongxiqiao Education Consulting</strong> is one of China\'s earliest consultancies focused exclusively on Spain. Headquartered in Beijing, with our Madrid office and resident staff across major Chinese cities, plus a resident coordinator in Barcelona \u2014 we work on both sides of the bridge with Spanish institutions seeking qualified Chinese students, and with Chinese institutions building international programmes.',
     'Founded in Beijing in 2011, <strong>Beijing Zhongxiqiao Education Consulting</strong> is one of China\'s earliest consultancies focused on Spain and other European countries. Headquartered in Beijing, with our Madrid office and resident staff across major Chinese cities, plus a resident coordinator in Barcelona \u2014 we work on both sides of the bridge: helping universities abroad enter the Chinese market and connect with Chinese institutions, while opening more study opportunities and pathways for Chinese students overseas.',
     1),
    # universities sec-head: eyebrow + h2 (identical wording, distinct nodes)
    ('<p class="eyebrow" data-page-node-id="GKo7mVwianWtEeT0lLp5mn">A selection of our partners</p>',
     '<p class="eyebrow" data-page-node-id="GKo7mVwianWtEeT0lLp5mn">Our partners</p>', 1),
    ('<h2 data-page-node-id="SJonQmOBjvNHqg7hVFEKJT">A selection of our partners</h2>',
     '<h2 data-page-node-id="SJonQmOBjvNHqg7hVFEKJT">Our partners</h2>', 1),
    ('A selection of the Spanish universities we work with under formal cooperation agreements. The full list and our specific role with each institution are on the Partners page.',
     'A selection of the Spanish universities we work with.', 1),
    # hero metric (same sentence the user changed on About page -> keep whole site consistent)
    ('students guided to Spain since 2011', 'students guided to Europe since 2011', 1),
    # svc-card 1 (translated from user's Chinese)
    ('We help Spanish universities and Chinese institutions design, launch and run joint programmes \u2014 from credit-recognition pathways to full joint colleges.',
     'We help partner universities and Chinese institutions establish cooperative-education programmes and academic research exchanges.', 1),
    ('Joint colleges &amp; joint institutes', 'Sino-foreign cooperative education programmes', 1),
    ('Curriculum co-design &amp; credit recognition', 'Inter-university academic visits', 1),
    ('Approval filing &amp; project operations', 'Research collaboration', 1),
    # svc-card 3: CAU -> language
    ('Guided admissions for Chinese students to Spanish institutions \u2014 from application and CAU pathway to visa and arrival.',
     'Guided admissions for Chinese students to Spanish institutions \u2014 from application and language pathway to visa and arrival.', 1),
    ('CAU preparatory pathway &amp; visa guidance', 'Language preparatory pathway &amp; visa guidance', 1),
    # why section
    ('Experts in both Chinese and Spanish education', 'Experts in both Chinese and European education', 1),
    ('Focused on Spain alone', 'Focused on the European market alone', 1),
    ('One education system, one market, deep relationships. Our team members have studied and worked in Spain.',
     'One education system, one market, deep relationships. Our team members have studied and worked in Europe.', 1),
]

ABOUT = [
    # hero lead: drop company-name prefix, branch fix, "Spanish univ" -> "universities abroad"
    ('<b data-page-node-id="UPl5kNTaiGOxBOEHW3abmR">Beijing Zhongxiqiao Education</b> (CWE \u2014 Chinese and Western Exchanges) is one of China\'s earliest consultancies focused exclusively on cooperation between China and Spain. Founded in Beijing in 2011, with an office in Madrid and a resident coordinator in Barcelona, we work on both sides of the relationship \u2014 with Spanish universities seeking qualified Chinese students, and with Chinese institutions building international programmes.',
     '<b data-page-node-id="UPl5kNTaiGOxBOEHW3abmR">CWE \u2014 Chinese and Western Exchanges</b>, is one of China\'s earliest consultancies focused exclusively on cooperation between China and Spain. Founded in Beijing in 2011, with a branch office in Madrid and a resident coordinator in Barcelona, we work on both sides of the relationship \u2014 with universities abroad seeking qualified Chinese students, and with Chinese institutions building international programmes.',
     1),
    ('students guided to Spain since 2011', 'students guided to Europe since 2011', 1),
    ('Spain-focused by design', 'Europe-focused by design', 1),
    # main paragraph (translated from user's Chinese-inline draft)
    ('Unlike general study-abroad agencies, we concentrate on Spain alone. This focus lets us know the Spanish higher-education system deeply \u2014 and today we serve as the China-based admissions office for several leading Spanish universities, including the University of Salamanca and the Autonomous University of Barcelona. We also pioneered the CAU university-pathway programme, a preparatory course that takes Chinese students from school-level Spanish to university readiness.',
     'Unlike general study-abroad agencies, we concentrate on Europe alone. This focus lets us know the European higher-education system deeply \u2014 and today we serve as the China-based admissions office for several leading universities abroad, including the University of Salamanca and the Autonomous University of Barcelona in Spain. We also pioneered the language-preparatory pathway programme, a preparatory course that takes Chinese students from school-level Spanish to university readiness.',
     1),
    ('Our four service lines cover', 'Our service lines cover', 1),
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
    groups = list(COMMON)
    if page == "index.html":
        groups += INDEX
    elif page == "about.html":
        groups += ABOUT
    for old, new, exp in groups:
        n = s.count(old)
        if n != exp:
            print(f"  FAIL {os.path.basename(path)}: count={n} expected={exp} :: {old[:70]!r}")
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
            print(f"  SKIP (missing): {p}")
            continue
        if apply_file(fp, p):
            print(f"  OK   {p}")
        else:
            ok = False
sys.exit(0 if ok else 1)
