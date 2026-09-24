#!/usr/bin/env python3
import json, subprocess, sys, tempfile, textwrap
from pathlib import Path

data = json.loads(Path(sys.argv[1]).read_text())
render = data.get("render") or {}
date = render.get("date") or data.get("date")
if not date:
    raise SystemExit("date is required")

out = Path("media/social") / date
out.mkdir(parents=True, exist_ok=True)

headline = str(render.get("headline") or data.get("topic") or "Bitcoin4Retail")
subheadline = str(render.get("subheadline") or "Practical Bitcoin payments for retailers.")
metric = str(render.get("metric") or "")
footer = str(render.get("footer") or "bitcoin4retail.com")

bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
regular = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def wrap(s, width):
    return "\n".join(textwrap.wrap(s, width=width, break_long_words=False, break_on_hyphens=False))

def run(args):
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y",*args], check=True)

with tempfile.TemporaryDirectory() as td:
    td = Path(td)
    (td/"headline.txt").write_text(wrap(headline, 22))
    (td/"subheadline.txt").write_text(wrap(subheadline, 32))
    (td/"metric.txt").write_text(wrap(metric, 24))
    (td/"footer.txt").write_text(footer)

    vf1 = f"drawbox=x=70:y=150:w=180:h=14:color=0xF7931A:t=fill,drawtext=fontfile={bold}:textfile={td/'headline.txt'}:fontcolor=white:fontsize=78:x=70:y=520:line_spacing=18,drawtext=fontfile={regular}:textfile={td/'subheadline.txt'}:fontcolor=0xD7D7D2:fontsize=34:x=70:y=820:line_spacing=12,drawtext=fontfile={bold}:textfile={td/'footer.txt'}:fontcolor=0xF7931A:fontsize=36:x=70:y=1760"
    run(["-f","lavfi","-i","color=c=0x11110F:s=1080x1920:d=3","-vf",vf1,"-r","30",str(td/"s1.mp4")])

    vf2 = f"drawbox=x=70:y=160:w=940:h=5:color=0xD9D5CA:t=fill,drawtext=fontfile={bold}:text='THE MERCHANT MATH':fontcolor=0xF7931A:fontsize=36:x=70:y=420,drawtext=fontfile={bold}:textfile={td/'metric.txt'}:fontcolor=0x11110F:fontsize=78:x=70:y=650:line_spacing=18,drawtext=fontfile={regular}:text='Measure the economics. Keep the workflow simple.':fontcolor=0x6C6F68:fontsize=30:x=70:y=1250,drawtext=fontfile={bold}:textfile={td/'footer.txt'}:fontcolor=0x11110F:fontsize=36:x=70:y=1760"
    run(["-f","lavfi","-i","color=c=0xF7F5EF:s=1080x1920:d=3","-vf",vf2,"-r","30",str(td/"s2.mp4")])

    vf3 = f"drawbox=x=70:y=150:w=180:h=14:color=0xF7931A:t=fill,drawtext=fontfile={bold}:text='NO HYPE. JUST RETAIL.':fontcolor=white:fontsize=68:x=70:y=620,drawtext=fontfile={regular}:text='Fees. Setup. Hardware. Real-world use.':fontcolor=0xD7D7D2:fontsize=34:x=70:y=780,drawtext=fontfile={bold}:textfile={td/'footer.txt'}:fontcolor=0xF7931A:fontsize=44:x=70:y=1500"
    run(["-f","lavfi","-i","color=c=0x11110F:s=1080x1920:d=3","-vf",vf3,"-r","30",str(td/"s3.mp4")])

    concat = td/"concat.txt"
    concat.write_text("\n".join([f"file '{td/'s1.mp4'}'", f"file '{td/'s2.mp4'}'", f"file '{td/'s3.mp4'}'"]))
    run(["-f","concat","-safe","0","-i",str(concat),"-c","copy","-movflags","+faststart",str(out/"vertical.mp4")])

    vf_img = f"drawbox=x=60:y=60:w=150:h=12:color=0xF7931A:t=fill,drawtext=fontfile={bold}:textfile={td/'headline.txt'}:fontcolor=0x11110F:fontsize=62:x=60:y=190:line_spacing=14,drawtext=fontfile={regular}:textfile={td/'subheadline.txt'}:fontcolor=0x6C6F68:fontsize=28:x=60:y=410:line_spacing=10,drawtext=fontfile={bold}:textfile={td/'footer.txt'}:fontcolor=0xF7931A:fontsize=32:x=60:y=595"
    run(["-f","lavfi","-i","color=c=0xF7F5EF:s=1200x675:d=1","-frames:v","1","-vf",vf_img,str(out/"x.jpg")])

print(json.dumps({"date":date,"vertical":str(out/"vertical.mp4"),"x":str(out/"x.jpg")}))
