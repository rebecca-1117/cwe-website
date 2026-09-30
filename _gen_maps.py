# -*- coding: utf-8 -*-
"""Generate self-hosted static map images (tiles from OSM, fetched once via proxy).
Output: 880x420 JPG with brand-orange pin at the map center."""
import io, math, os, urllib.request
from PIL import Image, ImageDraw

PROXY = "http://127.0.0.1:7890"
os.environ["HTTPS_PROXY"] = PROXY
os.environ["HTTP_PROXY"] = PROXY

OUT_DIRS = [
    r"E:\WORKBUDDY\2026-09-03-16-18-34\company-website-preview\assets",
    r"E:\WORKBUDDY\2026-09-03-16-18-34\company-website\assets",
    r"D:\我的坚果云\我的坚果云\网站\中西桥教育英文官网项目\assets",
]

W, H = 880, 420          # output size
ORANGE = (234, 88, 12)   # brand #EA580C
UA = "CWE-website-asset-generator/1.0 (one-time static map render)"

def deg2px(lat, lon, z):
    n = 2 ** z * 256.0
    x = (lon + 180.0) / 360.0 * n
    lat_r = math.radians(lat)
    y = (1 - math.log(math.tan(lat_r) + 1 / math.cos(lat_r)) / math.pi) / 2 * n
    return x, y

def fetch_tile(z, x, y):
    # Wikimedia osm-intl: light basemap, English-preferred labels
    url = f"https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
    req = urllib.request.Request(url, headers={"User-Agent": "CWE-website-asset-generator/1.0 (static map render; contact rebecca@zhongxiqiao.com)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGB")

def render(lat, lon, zoom, fname):
    cx, cy = deg2px(lat, lon, zoom)
    x0, y0 = cx - W / 2, cy - H / 2
    tx0, tx1 = int(x0 // 256), int((x0 + W) // 256)
    ty0, ty1 = int(y0 // 256), int((y0 + H) // 256)
    tiles = {}
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            tiles[(tx, ty)] = fetch_tile(zoom, tx, ty)
            print(f"  tile {zoom}/{tx}/{ty} ok")
    canvas = Image.new("RGB", (W, H))
    for (tx, ty), im in tiles.items():
        canvas.paste(im, (int(tx * 256 - x0), int(ty * 256 - y0)))
    # --- draw pin (tip exactly at center) ---
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    tipx, tipy = W / 2, H / 2
    # soft shadow
    d.ellipse([tipx - 16, tipy - 7, tipx + 16, tipy + 7], fill=(0, 0, 0, 70))
    # white outline pin (bigger), then orange pin
    for col, grow in [((255, 255, 255, 255), 4), (ORANGE + (255,), 0)]:
        r = 17 + grow
        hc = (tipx, tipy - 40)
        d.polygon([(tipx, tipy - 2), (hc[0] - r * 0.78, hc[1] + r * 0.62),
                   (hc[0] + r * 0.78, hc[1] + r * 0.62)], fill=col)
        d.ellipse([hc[0] - r, hc[1] - r, hc[0] + r, hc[1] + r], fill=col)
    d.ellipse([tipx - 7, tipy - 47, tipx + 7, tipy - 33], fill=(255, 255, 255, 255))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), ov).convert("RGB")
    # attribution strip (required by OSM/CARTO when serving map imagery)
    from PIL import ImageFont
    attr = "© OpenStreetMap contributors · Wikimedia Maps"
    font = ImageFont.load_default(size=11)
    tw = d.textlength(attr, font=font)
    d2 = ImageDraw.Draw(canvas)
    d2.rectangle([W - tw - 14, H - 20, W, H], fill=(255, 255, 255, 220))
    d2.text((W - tw - 7, H - 16), attr, fill=(90, 90, 90), font=font)
    for out in OUT_DIRS:
        canvas.save(os.path.join(out, fname), "JPEG", quality=88)
    print(f"saved {fname} -> {len(OUT_DIRS)} dirs")

print("== Beijing (z15) ==")
render(39.90400, 116.44690, 15, "map-beijing.jpg")
print("== Madrid (z16) ==")
render(40.42041, -3.70504, 16, "map-madrid.jpg")
print("DONE")
