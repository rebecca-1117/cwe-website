# -*- coding: utf-8 -*-
"""
给静态站图片引用加内容哈希版本号，解决浏览器/CDN 缓存旧图问题。
用法：python _version_assets.py
说明：对每个 HTML 里的 assets/xxx.jpg 引用，按文件内容算短哈希，
      写成 assets/xxx.jpg?v=<hash前8位>。文件不变则版本号不变（无谓 diff）。
"""
import os, re, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(ROOT, "assets")
PAGES = [f for f in sorted(os.listdir(ROOT)) if f.endswith(".html")]

# 匹配 src="assets/xxx.ext" 或 url(assets/xxx.ext)，已带 ?v= 的会被重新计算
PAT = re.compile(r'(assets/[A-Za-z0-9_\-.]+\.(?:jpg|jpeg|png|webp|svg|gif))(\?v=[0-9a-f]+)?', re.I)

def short_hash(path):
    try:
        with open(path, "rb") as fh:
            return hashlib.md5(fh.read()).hexdigest()[:8]
    except OSError:
        return None

def main():
    cache = {}
    changed_files = 0
    missing = set()
    for page in PAGES:
        p = os.path.join(ROOT, page)
        if not os.path.isfile(p):
            continue
        src = open(p, encoding="utf-8").read()

        def repl(m):
            rel = m.group(1)
            if rel not in cache:
                cache[rel] = short_hash(os.path.join(ROOT, rel.replace("/", os.sep)))
            h = cache[rel]
            if h is None:
                missing.add(rel)
                return m.group(0)
            return "%s?v=%s" % (rel, h)

        out = PAT.sub(repl, src)
        if out != src:
            open(p, "w", encoding="utf-8").write(out)
            changed_files += 1
            print("updated:", page)
        else:
            print("unchanged:", page)

    print("\nfiles updated:", changed_files, "| unique assets:", len(cache))
    if missing:
        print("MISSING FILES (referenced but not found):")
        for m in sorted(missing):
            print("  ", m)

if __name__ == "__main__":
    main()
