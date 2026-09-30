from pathlib import Path
import re,json
from PIL import Image
root=Path.cwd();css=(root/'app/globals.css').read_text();m=re.search(r'--dt-green-100:\s*(#[a-fA-F0-9]{6})',css);hex=m[1];bg=tuple(int(hex[i:i+2],16) for i in (1,3,5))
(root/'lib/design-tokens.js').write_text('// Generated from app/globals.css by scripts/generate-green-assets.py.\nexport const PAGE_GREEN = '+json.dumps('rgb('+', '.join(map(str,bg))+')')+';\n')
logo=Image.open(root/'public/logo-dewtheory-glass-wordmark-transparent.png').convert('RGBA')
im=Image.new('RGBA',(1200,630),bg+(255,)); logo.thumbnail((950,320),Image.Resampling.LANCZOS);im.alpha_composite(logo,((1200-logo.width)//2,(630-logo.height)//2));im.convert('RGB').save(root/'public/og-green.png')
# Use original brand mark at natural aspect ratio; keep source assets unchanged.
files=list((root/'public').glob('*mark*.png'));markpath=next((p for p in files if 'wordmark' not in p.name and 'ivory' not in p.name),root/'public/logo-dewtheory-glass-wordmark-transparent.png')
for n,name in [(64,'favicon-green.png'),(180,'apple-touch-icon-green.png'),(192,'icon-green-192.png'),(512,'icon-green-512.png')]:
 mark=Image.open(markpath).convert('RGBA');mark.thumbnail((int(n*.8),int(n*.8)),Image.Resampling.LANCZOS);icon=Image.new('RGBA',(n,n),bg+(255,));icon.alpha_composite(mark,((n-mark.width)//2,(n-mark.height)//2));icon.save(root/'public'/name)
print('OG',im.size,'icons generated; originals preserved; mark:',markpath.name)
