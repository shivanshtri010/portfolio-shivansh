import re, os, urllib.request

css_path = os.path.join(os.environ.get("TEMP", "."), "fonts.css")
css = open(css_path, encoding="utf-8").read()
blocks = re.findall(r"/\* ([^*]+) \*/\s*@font-face \{(.*?)\}", css, re.S)
out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "fonts")
os.makedirs(out_dir, exist_ok=True)
lines = []
seen = set()
for subset, body in blocks:
    if subset.strip() != "latin":
        continue
    fam = re.search(r"font-family: '([^']+)'", body).group(1)
    style = re.search(r"font-style: (\w+)", body).group(1)
    weight = re.search(r"font-weight: ([\d ]+)", body).group(1)
    url = re.search(r"url\((https[^)]+)\)", body).group(1)
    key = (fam, style, weight)
    if key in seen:
        continue
    seen.add(key)
    slug = fam.lower().replace(" ", "-") + "-" + style.replace("italic", "italic") + "-" + weight.replace(" ", "-")
    filename = slug + ".woff2"
    urllib.request.urlretrieve(url, os.path.join(out_dir, filename))
    lines.append(
        "@font-face {\n"
        f"  font-family: '{fam}';\n"
        f"  font-style: {style};\n"
        f"  font-weight: {weight};\n"
        "  font-display: swap;\n"
        f"  src: url('../fonts/{filename}') format('woff2');\n"
        "}"
    )
    print("saved", filename)
css_out = "\n\n".join(lines) + "\n"
open(os.path.join(os.path.dirname(out_dir), "css", "fonts.css"), "w", encoding="utf-8").write(css_out)
print("done", len(lines))
