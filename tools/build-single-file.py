"""Gộp cả thiệp thành MỘT file HTML tự chứa để mở thẳng trên máy (không cần mạng, không cần server).

CSS, JS, ảnh và font chữ được nhúng thẳng vào file (ảnh/font dạng base64).
Chạy:  python3 tools/build-single-file.py   ->  dist/thiep-ngo-quyen.html
"""
import base64
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "thiep-ngo-quyen.html"
FONT_CSS = re.compile(r'<link rel="stylesheet" href="(https://fonts\.googleapis\.com/[^"]+)">')
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36"
KEEP_SUBSETS = ("vietnamese", "latin-ext", "latin")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def inline_fonts(css_url):
    """Tải CSS Google Fonts, giữ subset tiếng Việt + Latin, nhúng woff2 dạng base64."""
    css = fetch(css_url).decode()
    blocks = re.findall(r"/\* ([\w-]+) \*/\s*(@font-face \{.*?\})", css, re.S)
    out = []
    for subset, block in blocks:
        if subset not in KEEP_SUBSETS:
            continue
        def embed(m):
            data = base64.b64encode(fetch(m.group(1))).decode()
            return "url(data:font/woff2;base64," + data + ")"
        out.append(re.sub(r"url\((https://[^)]+)\)", embed, block))
    return "<style>\n" + "\n".join(out) + "\n</style>"


def data_uri(rel):
    path = ROOT / rel
    mime = "image/png" if path.suffix == ".png" else "image/jpeg"
    return "data:" + mime + ";base64," + base64.b64encode(path.read_bytes()).decode()


def main():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    html = re.sub(r'<link rel="preconnect"[^>]*>\n?', "", html)
    html = FONT_CSS.sub(lambda m: inline_fonts(m.group(1)), html)
    html = re.sub(
        r'<link rel="stylesheet" href="(assets/[^"?]+)(\?[^"]*)?">',
        lambda m: "<style>\n" + (ROOT / m.group(1)).read_text(encoding="utf-8") + "\n</style>",
        html,
    )
    html = re.sub(
        r'<script src="(assets/[^"?]+)(\?[^"]*)?"></script>',
        lambda m: "<script>\n" + (ROOT / m.group(1)).read_text(encoding="utf-8") + "\n</script>",
        html,
    )
    html = re.sub(r'src="(images/[^"]+)"', lambda m: 'src="' + data_uri(m.group(1)) + '"', html)
    left = re.findall(r'(?:src|href)="(?:assets|images)/[^"]+"', html)
    if left:
        raise SystemExit("Còn tham chiếu file ngoài chưa nhúng: " + ", ".join(left))
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"{OUT}  ({OUT.stat().st_size / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main()
