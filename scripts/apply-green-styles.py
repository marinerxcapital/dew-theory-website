from pathlib import Path
import re,json
root=Path.cwd(); css=root/'app/globals.css';s=css.read_text(encoding='utf-8-sig')
# Replace old color literals by semantic green token references throughout CSS.
palette={50:'#F3F7F1',100:'#E4ECE1',200:'#D3E0CE',300:'#BBCFB5',400:'#97B592',700:'#2F5D46',900:'#1E2B22'}
def rgb(hex):
 h=hex.lstrip('#');h=''.join(c*2 for c in h) if len(h)==3 else h;return tuple(int(h[i:i+2],16) for i in (0,2,4))
def green(hex):
 r,g,b=rgb(hex);avg=(r+g+b)/3
 return 50 if avg>=243 else 100 if avg>=223 else 200 if avg>=199 else 300 if avg>=170 else 400 if avg>=135 else 700 if avg>=80 else 900
s=re.sub(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b',lambda m:f'var(--dt-green-{green(m.group())})',s)
def rgba(m):
 r,g,b=float(m[1]),float(m[2]),float(m[3]);alpha=float(m[4]) if m[4] else 1
 if max(r,g,b)>200: level=50
 elif max(r,g,b)>100: level=300
 else:level=900
 return f'rgb(var(--dt-green-{level}-rgb) / {alpha:g})'
s=re.sub(r'rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)',rgba,s)
# Tokenize legacy CSS structural values, keeping authored timing/motion while centralizing declarations.
values={};props=r'border(?:-radius|-width|-style|-color)?|border-(?:top|right|bottom|left)(?:-width|-style|-color)?|box-shadow|backdrop-filter|opacity|z-index|transition(?:-duration|-timing-function|-property)?|animation(?:-duration|-delay|-timing-function)?'
def structural(m):
 prop,value=m[1],m[2].strip()
 if value.startswith('var(') or value in ['inherit','initial','unset','none']:return m[0]
 if prop=='box-shadow':value='var(--dt-shadow-card)'
 if prop=='border-radius':
  value='var(--dt-radius-pill)' if '999' in value or value=='50%' else 'var(--dt-radius-md)'
 key=(prop,value)
 if key not in values:values[key]='--dt-legacy-'+str(len(values)+1)
 return f'{prop}: var({values[key]});'
s=re.sub(r'(?<![-\w])('+props+r')\s*:\s*([^;{}]+);',structural,s)
# One final token block overrides retired aliases; hex values appear only here.
tokens=['\n/* GREEN SYSTEM: authoritative palette and semantic tokens. */',':root {']
for level,color in palette.items():tokens += [f'  --dt-green-{level}: {color};',f'  --dt-green-{level}-rgb: {" ".join(map(str,rgb(color)))};']
tokens += ['  --dt-border: 1px solid rgb(var(--dt-green-900-rgb) / 0.14);','  --dt-border-strong: 1.5px solid var(--dt-green-400);','  --dt-radius-sm: 10px;','  --dt-radius-md: 16px;','  --dt-radius-lg: 24px;','  --dt-radius-pill: 9999px;','  --dt-shadow-card: 0 8px 24px rgb(var(--dt-green-900-rgb) / 0.06);','  --dt-shadow-hover: 0 12px 32px rgb(var(--dt-green-900-rgb) / 0.12);','  --dt-glass: rgb(var(--dt-green-50-rgb) / 0.68);','  --dt-blur: 16px;','  --dt-motion: 240ms cubic-bezier(0.22, 1, 0.36, 1);','  --dt-focus: 2px solid var(--dt-green-700);']
levels={900:['color-forest','color-black','color-ink','color-graphite','color-charcoal','text-primary','text-secondary'],700:['color-muted','color-chrome','color-sage-deep','color-dew','color-dew-dark','color-promo','color-promo-dark','text-tertiary','text-eyebrow','accent-ink','accent-pink','accent-pink-bright','accent-pink-dim'],50:['color-surface','color-pearl','color-specular','bg-elevated','surface-elevated'],100:['color-ivory','bg-void','surface-void'],200:['color-surface-light','color-stone','color-dew-soft','color-ice','color-lavender','color-blush','bg-elevated-2','surface-elevated-2'],300:['color-dew-surface','color-sage','color-dew-mid','color-aqua','color-lilac','color-champagne','color-peach','color-botanical','refract-champagne','refract-blush','refract-ice','refract-lavender'],400:['color-border-strong']}
for level,names in levels.items():tokens += [f'  --{name}: var(--dt-green-{level});' for name in names]
tokens += ['  --color-border: rgb(var(--dt-green-900-rgb) / 0.14);','  --hairline: var(--color-border);','  --hairline-solid: var(--color-border);','  --accent-pink-wash: var(--dt-green-200);']
for (prop,value),name in values.items(): tokens += [f'  {name}: {value};']
tokens += ['}']
s+='\n'.join(tokens)+'''
/* Shared green surfaces, typography and interaction states. */
body { background: var(--dt-green-100); color: var(--dt-green-900); font-size: 1.0625rem; line-height: 1.65; }
h1, h2, h3 { font-family: var(--font-display), Georgia, serif; font-variation-settings: "SOFT" 100; text-transform: none; letter-spacing: -0.02em; }
h1 { font-size: clamp(2.75rem, 6vw, 5rem) !important; line-height: 1.08 !important; }
h2 { font-size: clamp(2rem, 4vw, 3.25rem) !important; line-height: 1.15 !important; }
h3 { font-size: 1.5rem; line-height: 1.3; }
.product-card h3 { font-size: 1.25rem; }
.editorial-label, .type-label, .eyebrow-line, .text-micro { font-size: 0.75rem; letter-spacing: 0.14em; }
.font-body, .font-label { font-family: var(--font-body), system-ui, sans-serif; }
.font-body { font-variant-numeric: tabular-nums; }
.journal-prose { font-family: var(--font-journal), Georgia, serif; font-size: 1.125rem; line-height: 1.8; }
:where(a, button, input, select, textarea, summary):focus-visible { outline: var(--dt-focus) !important; outline-offset: 2px; box-shadow: 0 0 0 2px var(--dt-green-50); }
:where(button, input, select, summary) { min-height: 44px; }
:where(input:not([type="checkbox"]):not([type="radio"]), select, textarea) { background: var(--dt-green-50); border: var(--dt-border-strong); border-radius: var(--dt-radius-sm); }
.glass-1, .glass-2, .glass-3 { background: var(--dt-glass); border: var(--dt-border); border-radius: var(--dt-radius-md); backdrop-filter: blur(var(--dt-blur)); box-shadow: var(--dt-shadow-card); }
.product-card, .card-edge { border: var(--dt-border); border-radius: var(--dt-radius-md); background: var(--dt-green-50); box-shadow: var(--dt-shadow-card); }
.product-card:hover { box-shadow: var(--dt-shadow-hover); border-color: var(--dt-green-400); }
.product-card .card-micro { background: var(--dt-green-50); }
.product-card .card-add { background: var(--dt-green-50); opacity: 1; transform: none; }
.btn-primary, .btn-dew, .btn-promo { background: var(--dt-green-700); color: var(--dt-green-50); border: 1px solid var(--dt-green-700); border-radius: var(--dt-radius-pill); min-height: 48px; }
.btn-primary:hover, .btn-dew:hover, .btn-promo:hover, .btn-primary:active { background: var(--dt-green-900); color: var(--dt-green-50); box-shadow: var(--dt-shadow-hover); }
.btn-primary:disabled, .btn-primary[aria-disabled="true"] { background: var(--dt-green-300); color: var(--dt-green-900); opacity: 0.65; cursor: not-allowed; }
.btn-ghost, .btn-secondary, .btn-dew-outline { border: var(--dt-border-strong); border-radius: var(--dt-radius-pill); background: var(--dt-green-50); color: var(--dt-green-700); min-height: 48px; }
.btn-ghost:hover, .btn-secondary:hover, .btn-dew-outline:hover { background: var(--dt-green-300); color: var(--dt-green-900); }
.btn-tertiary { color: var(--dt-green-700); background: transparent; min-height: 44px; }
.concern-pill, .goal-tile, .feature-panel { background: var(--dt-green-300); color: var(--dt-green-900); border-radius: var(--dt-radius-md); }
.goal-tile:hover { background: var(--dt-green-200); }
.announcement-bar, .announcement-bar--promo, .announcement-bar--service { background: var(--dt-green-200); color: var(--dt-green-900); }
.site-footer { background: var(--dt-green-200); color: var(--dt-green-900); margin-top: 0; }
.site-footer a { display: inline-flex; align-items: center; min-height: 44px; color: var(--dt-green-700); }
#main > section:nth-of-type(even), #main > div > section:nth-of-type(even) { background-color: var(--dt-green-200); }
#main > section:nth-of-type(odd), #main > div > section:nth-of-type(odd) { background-color: var(--dt-green-100); }
#main > .mx-auto { background-color: transparent; }
.hero-art__glass, .hero-art__bloom { background: radial-gradient(ellipse at center, var(--dt-green-50), transparent 70%); }
.hero-art__shadow { background: radial-gradient(ellipse at center, rgb(var(--dt-green-900-rgb) / 0.06), transparent 70%); }
.motion-bg { background: var(--dt-green-100); }
.motion-bg__glass, .motion-bg__vignette, .ambient-glow, .grain::after { display: none; }
.hero-art__glass, .hero-art__streak { filter: none; }
[data-reveal] { opacity: 1; transform: none; }
.nav-link { font-size: 0.75rem; letter-spacing: 0.06em; min-height: 44px; display: inline-flex; align-items: center; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }
'''
css.write_text(s,encoding='utf-8')
# Remap Tailwind colors through alpha-capable CSS channel variables; authoritative values stay in globals.
p=root/'tailwind.config.js';s=p.read_text(encoding='utf-8-sig');start=s.index('      colors: {');end=s.index('\n      fontFamily:',start)
def tw(n):return f"'rgb(var(--dt-green-{n}-rgb) / <alpha-value>)'"
colors='      colors: {\n'
for name,n in [('ivory',100),('forest',900),('ink',900),('charcoal',900),('graphite',900),('black',900),('white',50),('surface',50),('surface-light',200),('surface-warm',50),('muted',700),('chrome',700),('border',400),('hairline',400),('pearl',50),('stone',200),('ice',200),('lavender',200),('blush',200),('sage-deep',700)]: colors+=f"        '{name}': {tw(n)},\n"
for name,entries in {'void':{'DEFAULT':100,'elevated':50,'elevated2':200},'pink':{'DEFAULT':700,'bright':700,'dim':900,'wash':200},'dew':{'DEFAULT':700,'dark':900,'mid':300,'soft':200,'surface':300},'sage':{'DEFAULT':300,'deep':700,'soft':200,'surface':300},'promo':{'DEFAULT':700,'dark':900},'champagne':{'DEFAULT':300,'deep':700},'aqua':{'DEFAULT':300,'deep':700,'soft':200},'lilac':{'DEFAULT':300,'deep':700,'soft':200},'peach':{'DEFAULT':300,'deep':700,'soft':200},'botanical':{'DEFAULT':300,'deep':700,'soft':200},'green':{str(n):n for n in palette}}.items():
 colors+=f'        {name}: {{ '+', '.join(f"'{k}': {tw(v)}" for k,v in entries.items())+' },\n'
colors+='      },\n';s=s[:start]+colors+s[end:];s=s.replace('Bodoni Moda','Fraunces').replace('Inter','Figtree').replace("shell: '88rem'","shell: '75rem'").replace("card: '2px'","card: 'var(--dt-radius-md)'\n        ,sm: 'var(--dt-radius-sm)', lg: 'var(--dt-radius-lg)'").replace("'section-sm': '6rem'","'section-sm': '4rem'").replace("'section-md': '8rem'","'section-md': '5rem'").replace("'section-lg': '10rem'","'section-lg': '6rem'").replace("'section-xl': '12rem'","'section-xl': '7rem'")
a=s.index('      boxShadow:');b=s.index('\n      keyframes:',a);s=s[:a]+"      boxShadow: { card: 'var(--dt-shadow-card)', 'card-hover': 'var(--dt-shadow-hover)', glow: 'var(--dt-shadow-card)', 'glow-soft': 'var(--dt-shadow-card)' },\n"+s[b:];s=re.sub(r'#[0-9a-fA-F]{3,8}\b','[retired color]',s);p.write_text(s)
# Migrate component colors, opacity text that fails AA, and radius literals.
for dirname in ['app','components','lib']:
 for p in (root/dirname).rglob('*'):
  if p.suffix not in ['.js','.jsx']:continue
  s=p.read_text(encoding='utf-8-sig')
  def replacehex(m):return 'rgb('+', '.join(map(str,rgb(palette[green(m.group())])))+')'
  s=re.sub(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b',replacehex,s)
  s=re.sub(r'text-(charcoal|ink|forest|graphite|chrome|muted|dew|sage-deep)/\d+',r'text-\1',s)
  s=re.sub(r'rounded-(?:t-)?\[(?:[0-9.]+px)\]','rounded-card',s)
  s=re.sub(r'(bg-(?:ink|forest|graphite|charcoal|black))(?![-\w/])','bg-green-300',s)
  s=re.sub(r'(className="[^"]*font-display[^"]*)\buppercase\s*',r'\1',s)
  p.write_text(s,encoding='utf-8')
# Server-only metadata reads the single CSS source of truth.
(root/'lib/design-tokens.js').write_text("import fs from 'node:fs';\nimport path from 'node:path';\nconst css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8');\nexport const PAGE_GREEN = css.match(/--dt-green-100:\\s*([^;]+);/)[1].trim();\n")
p=root/'app/layout.jsx';s=p.read_text();s=s.replace("import { Bodoni_Moda, Inter }", "import { Fraunces, Figtree, Newsreader }");s=s.replace("import Nav", "import { PAGE_GREEN } from '@/lib/design-tokens';\nimport Nav",1).replace('Bodoni_Moda({','Fraunces({').replace("style: ['normal', 'italic'],","style: 'normal',\n  axes: ['SOFT'],").replace('Inter({','Figtree({');s=s.replace("const siteUrl =", "const journal = Newsreader({ subsets: ['latin'], style: 'normal', variable: '--font-journal', display: 'swap', preload: false });\n\nconst siteUrl =");s=re.sub(r"color: 'rgb\([^']+\)'","color: PAGE_GREEN",s);s=s.replace('${body.variable}`}','${body.variable} ${journal.variable}`}').replace("url: '/logo-dewtheory-glass-wordmark-transparent.png',\n        width: 1200","url: '/og-green.png',\n        width: 1200").replace("images: ['/logo-dewtheory-glass-wordmark-transparent.png']","images: ['/og-green.png']").replace("icon: [{ url: '/logo-dewtheory-glass-wordmark-transparent.png'","icon: [{ url: '/favicon-green.png'").replace("apple: [{ url: '/logo-dewtheory-glass-wordmark-transparent.png'","apple: [{ url: '/apple-touch-icon-green.png'");p.write_text(s)
# Green manifest, generated from palette rather than duplicate source literals.
p=root/'public/site.webmanifest';data=json.loads(p.read_text());data['background_color']='rgb('+', '.join(map(str,rgb(palette[100])))+')';data['theme_color']=data['background_color'];data['icons']=[{'src':'/icon-green-192.png','sizes':'192x192','type':'image/png','purpose':'any'},{'src':'/icon-green-512.png','sizes':'512x512','type':'image/png','purpose':'any'}];p.write_text(json.dumps(data,indent=2))
print('Green palette, semantic aliases, typography, shared surfaces and Tailwind applied')
