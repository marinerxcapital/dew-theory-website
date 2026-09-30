from pathlib import Path
import re,json
root=Path.cwd()
def edit(file,fn):
 p=root/file;s=p.read_text(encoding='utf-8-sig');p.write_text(fn(s),encoding='utf-8')
# Keep taxonomy authoritative; show six homepage families, full seven on index.
p=root/'components/home/ShopByConcern.jsx';s=p.read_text();s=s.replace("import { SPECTRAL_FAMILIES } from '@/lib/spectral';","import { concernFamiliesWithCounts } from '@/lib/concerns';")
a=s.index('  const tiles =');b=s.index('\n\n  if (!tiles.length)',a)
s=s[:a]+"  const tiles = concernFamiliesWithCounts(visible).filter(f => f.count > 0 && f.slug !== 'lips').map(family => ({family, concern: family.label}));"+s[b:]
s=s.replace('family.key','family.slug').replace('href={`/shop?concern=${encodeURIComponent(concern)}`}','href={`/skin-concerns/${family.slug}`}');p.write_text(s)
edit('app/skin-concerns/page.jsx',lambda s:s.replace('intro="Forty products is a wall. Three to five is a routine. Pick what your skin is doing right now and start there — every shelf below shows only the products that declare that concern."','intro={`${visible.length} products is a wall. Three to five is a routine. Pick what your skin is doing right now and start there — every shelf below shows only the products that declare that concern.`}'))
edit('app/ingredients/page.jsx',lambda s:s.replace('href: `/shop/${products[0].id}`','href: products.length > 1 ? `/shop?ingredient=${encodeURIComponent(name)}` : `/shop/${products[0].id}`'))
edit('components/ShopGrid.jsx',lambda s:s.replace("const q = searchParams.get('q') || '';","const q = searchParams.get('q') || '';\n  const ingredient = searchParams.get('ingredient') || '';" ).replace('let list = filterProducts(catalog, state);','let list = filterProducts(catalog, state);\n    if (ingredient) list = list.filter(p => (p.key_actives || []).some(a => (typeof a === "string" ? a : a.name) === ingredient));').replace('[catalog, state, q]','[catalog, state, q, ingredient]').replace('if (q) params.set(\'q\', q);','if (q) params.set(\'q\', q);\n      if (ingredient) params.set(\'ingredient\', ingredient);').replace('[pathname, q, router]','[pathname, q, router, ingredient]').replace("countActiveFilters(state) + (q ? 1 : 0)","countActiveFilters(state) + (q ? 1 : 0) + (ingredient ? 1 : 0)"))
edit('components/Nav.jsx',lambda s:s.replace("{ href: '/consultation', label: 'Consultation' }","{ href: '/virtual-consultation', label: 'Consultation' }").replace('aria-label={bagLabel}','aria-label="Bag"').replace('className="hidden min-h-[44px] min-w-[44px] items-center','className="inline-flex min-h-[44px] min-w-[44px] items-center').replace("'border-b border-transparent bg-transparent'","'border-b border-border bg-void/75 backdrop-blur-xl'").replace('max-h-[min(100dvh-5rem,42rem)]','h-[calc(100dvh-7rem)]').replace('lg:flex xl:gap-8','xl:flex xl:gap-8').replace('lg:hidden','xl:hidden'))
# Existing consultation subroutes remain functional for saved questionnaires; root is requested redirect.
(root/'app/consultation/page.jsx').write_text("import { permanentRedirect } from 'next/navigation';\nexport default function ConsultationRedirect() { permanentRedirect('/virtual-consultation'); }\n")
edit('components/VirtualConsultationCheckout.jsx',lambda s:s.replace('<h2\n        id="vc-book-heading"','<h3\n        id="vc-book-heading"').replace('Book your consultation\n      </h2>','Your details\n      </h3>').replace("When Stripe is configured, checkout runs on Stripe&apos;s hosted page (no card fields on\n            this form). Local/dev without Stripe may use a clearly labeled mock checkout — never a\n            silent live charge. Production without keys returns an error instead of charging.","Secure payment: checkout runs on Stripe&apos;s hosted page. No card fields on this form.\n            {process.env.NODE_ENV !== 'production' ? (\n              <span className=\"mt-2 block\">Local/dev without Stripe may use a clearly labeled mock checkout. Production without keys returns an error instead of charging.</span>\n            ) : null}"))
edit('components/LegalPdfActions.jsx',lambda s:re.sub(r'      <a\s+href=\{doc.pdfPath\}\s+target="_blank"[\s\S]*?Print / PDF[\s\S]*?</a>','',s,count=1) if False else s[:s.rfind('      <a\n')]+s[s.rfind('      </a>')+len('      </a>'):])
# Fix product data without changing commerce/identity/ingredients except the specified typo.
p=root/'data/products.json';data=json.loads(p.read_text(encoding='utf-8-sig'));products=data['products']; changes=[]
for product in products:
 old=product.get('size');
 if old: product['size']=re.sub(r'\boz\.(?=\s|$)','oz',old).strip()
 for active in product.get('key_actives',[]):
  if isinstance(active,dict) and active.get('name')=='Hyaluronic Acid + Sodium Hyalurona':active['name']='Hyaluronic Acid + Sodium Hyaluronate'
 product['image_alt']=f"Skin Script {product['name']} product photo"
 if product['id']=='acai-berry-moisturizer' and 'sold retail at Dew Theory' in product.get('description_short',''):product['description_short']='';changes.append('Acai placeholder hidden; owner copy needed')
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
edit('lib/product-image.js',lambda s:s.replace("'pearl-20260926'","'green-20260929'").replace('${product.name} professional skincare product photo','${product.name} product photo'))
edit('components/ProductCard.jsx',lambda s:s.replace('{product.size || product.category}','{product.category}').replace("'text-[1.125rem]' : 'text-[1.3125rem]'","'text-[1.25rem]' : 'text-[1.3125rem]'"))
p=root/'lib/skin-quiz.js';s=p.read_text();a=s.index('function pairBlurb(');b=s.index('\n/**',a)
s=s[:a]+'''function pairBlurb(base, other) {
  const labels = {
    Cleanser: 'Cleansing step', Toner: 'Toning step', Serum: 'Serum step',
    Moisturizer: 'Moisturizing step', SPF: 'Morning protection step',
    Exfoliant: 'Exfoliation step', Mask: 'Mask step', 'Lip Treatment': 'Lip care step',
    'Eye Treatment': 'Eye care step', 'Spot Treatment': 'Targeted treatment step', Kit: 'Routine kit'
  };
  return `${labels[other.category] || other.category}: ${other.name}. ${other.size || ''}`.trim();
}
''' +s[b:];p.write_text(s)
# US spelling outside policy body and product facts.
legal={'terms','privacy','shipping','returns','booking-policy','aesthetic-disclaimer','accessibility','cookies'}
for dirname in ['app','components','lib']:
 for p in (root/dirname).rglob('*'):
  if p.suffix not in ['.js','.jsx']:continue
  if dirname=='app' and len(p.relative_to(root/'app').parts)>1 and p.relative_to(root/'app').parts[0] in legal:continue
  s=p.read_text(encoding='utf-8-sig');s=s.replace('catalogue','catalog').replace('Catalogue','Catalog').replace('moisturisers','moisturizers').replace('centre','center');p.write_text(s,encoding='utf-8')
# Shop categories present in footer.
edit('components/Footer.jsx',lambda s:s.replace("['Shop all', '/shop'],","['Shop all', '/shop'],\n      ['Cleansers', '/shop?type=Cleanser'],\n      ['Serums', '/shop?type=Serum'],\n      ['Moisturizers', '/shop?type=Moisturizer'],\n      ['SPF', '/shop?type=SPF'],").replace('lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]','sm:grid-cols-2 lg:grid-cols-4').replace('className="min-w-0"','className="min-w-0 sm:col-span-2 lg:col-span-4"'))
edit('components/LegalPageShell.jsx',lambda s:s.replace('max-w-shell','max-w-measure'))
# Policy metadata only, preserve rendered policy text.
for name in legal:
 p=root/'app'/name/'page.jsx';s=p.read_text();m=re.search(r'export const metadata = \{([\s\S]*?)\n\};',s)
 if m:
  block=m.group(0).replace('FIXED V2 ','').replace(' FIXED V2','');s=s[:m.start()]+block+s[m.end():];s=s.replace('max-w-shell','max-w-measure');p.write_text(s)
print('Copy/data corrections applied; catalog:',len(products),'records;',changes)
