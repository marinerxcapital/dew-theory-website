import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../data/products.json' with {type:'json'};
const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
const colors=Object.fromEntries([...css.matchAll(/--dt-green-(\d+):\s*#([0-9a-f]{6});/gi)].map(m=>[m[1],m[2]]));
const luminance=h=>{const channels=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;};
export const contrast=(a,b)=>{const x=luminance(colors[a]),y=luminance(colors[b]);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
const pairs=[...[50,100,200,300,400].map(bg=>[900,bg,4.5]),...[50,100,200].map(bg=>[700,bg,4.5]),[50,700,4.5],[50,900,4.5],...[50,100,200,300].map(bg=>[700,bg,3])];
describe('green token WCAG contrast',()=>{for(const [fg,bg,min] of pairs)it(`${fg} on ${bg}: ${contrast(fg,bg).toFixed(2)} >= ${min}`,()=>assert.ok(contrast(fg,bg)>=min));});
describe('green release integrity',()=>{
 it('every catalog record has real required fields and resolvable images',()=>{for(const p of catalog.products){assert.ok(p.id&&p.name&&p.category);assert.ok(Number.isFinite(p.retail_price));assert.ok(Array.isArray(p.conditions_addressed));assert.ok(Array.isArray(p.key_actives));assert.ok(Array.isArray(p.images)&&p.images.length);for(const src of p.images)assert.ok(existsSync(new URL('../public'+src.split('?')[0],import.meta.url)),src);}});
 it('shipping rules remain $12 below $49',()=>{assert.equal(catalog._meta.shipping_rule.flat_rate_usd,12);assert.equal(catalog._meta.shipping_rule.free_shipping_threshold_usd,49);});
 it('sizes and alt text are normalized without inventing missing sizes',()=>{for(const p of catalog.products){assert.ok(!/\boz\./.test(p.size||''),p.id);assert.equal(p.image_alt,`Skin Script ${p.name} product photo`);}});
 it('Acai placeholder is hidden',()=>assert.ok(!catalog.products.find(p=>p.id==='acai-berry-moisturizer').description_short?.includes('sold retail at Dew Theory')));
 it('header and footer are shared by every public route',()=>{const layout=readFileSync(new URL('../app/layout.jsx',import.meta.url),'utf8');assert.equal((layout.match(/<Nav\s*\/>/g)||[]).length,1);assert.equal((layout.match(/<Footer\s*\/>/g)||[]).length,1);});
 it('developer booking notes are production guarded',()=>assert.match(readFileSync(new URL('../components/VirtualConsultationCheckout.jsx',import.meta.url),'utf8'),/process\.env\.NODE_ENV !== 'production'/));
});
