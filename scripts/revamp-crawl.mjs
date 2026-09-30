import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PRODUCTS } from '../lib/products.js';
import { isShopVisible } from '../lib/shop.js';
import { CONCERN_FAMILIES } from '../lib/concerns.js';
import { getAllJournalEntries } from '../lib/journal.js';
const stage=process.argv[2]||'before', base=process.argv[3]||'https://dewtheoryco.com';
const override=process.argv[4];
const dir=`docs/revamp/${stage}`; fs.mkdirSync(dir,{recursive:true});
const pages=JSON.parse(fs.readFileSync('docs/revamp/app-route-inventory.json','utf8'));
const staticRoutes=pages.filter(p=>!p.includes('[')).map(p=>'/'+p);
const routes=[...new Set([...staticRoutes,...PRODUCTS.filter(isShopVisible).map(p=>'/shop/'+p.id),...CONCERN_FAMILIES.map(p=>'/skin-concerns/'+p.slug),...getAllJournalEntries().map(p=>'/journal/'+p.slug),'/shop?type=Cleanser','/shop?concern=dehydration','/routine?time=pm','/missing-green-audit','/virtual-consultation/intake/invalid-audit-token','/virtual-consultation/plan/invalid-audit-token'])];
fs.writeFileSync('docs/revamp/routes.json',JSON.stringify(routes,null,2));
const browser=await chromium.launch({channel:'chrome',headless:true}); const results=[];
try {
await Promise.all([390,768,1440].map(async width => {
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',extraHTTPHeaders:override?{'Cloudflare-Workers-Version-Overrides':`dew-theory="${override}"`}:undefined});
 const page=await context.newPage();
 for(const route of routes) {
  const errors=[]; const missing=[]; const onError=e=>errors.push(e.message); const onConsole=m=>{if(m.type()==='error') errors.push(m.text().slice(0,240));};
  const onResponse=r=>{if(r.status()>=400)missing.push({url:r.url(),status:r.status()});};page.on('response',onResponse);page.on('pageerror',onError);page.on('console',onConsole);
  try {
   const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:45000});
   await page.evaluate(async()=>{await document.fonts.ready;for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,30));}window.scrollTo(0,0);});
   await page.waitForTimeout(200);
   const metrics=await page.evaluate(()=>({url:location.pathname,theme:document.querySelector('meta[name="theme-color"]')?.content,background:getComputedStyle(document.body).backgroundColor,horizontal:document.documentElement.scrollWidth>innerWidth,canonical:document.querySelector('link[rel="canonical"]')?.href,ogUrl:document.querySelector('meta[property="og:url"]')?.content, ogTitle:document.querySelector('meta[property="og:title"]')?.content, ogDescription:document.querySelector('meta[property="og:description"]')?.content, twitterTitle:document.querySelector('meta[name="twitter:title"]')?.content,twitterDescription:document.querySelector('meta[name="twitter:description"]')?.content,robots:document.querySelector('meta[name="robots"]')?.content,headerCount:document.querySelectorAll('[data-nav]').length,footerCount:document.querySelectorAll('.site-footer').length,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src')).slice(0,10),darkSurfaces:[...document.querySelectorAll('header,footer,section,.announcement-bar')].filter(e=>{const b=getComputedStyle(e).backgroundColor.match(/[\d.]+/g)?.map(Number);return b&&b.length>=3&&(b[3]??1)>0.5&&Math.max(...b.slice(0,3))<110;}).map(e=>e.tagName+' '+e.className).slice(0,10),overflow:[...document.querySelectorAll('h1,h2,h3,p,a,button,label')].filter(e=>e.clientWidth>0&&e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX==='visible').slice(0,8).map(e=>e.textContent.trim().slice(0,90))}));
   const axe=stage==='before'?null:await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
   // Expand offscreen content only for the exported full-page evidence.
   const captureStyle=await page.addStyleTag({content:'* { content-visibility: visible !important; }'});
   await page.screenshot({path:path.join(dir,`${route.replace(/[^a-z0-9]+/gi,'_')||'home'}-${width}.png`),fullPage:true,animations:'disabled'});
   await captureStyle.evaluate(el=>el.remove());
   results.push({route,width,status:response?.status(),...metrics,errors,missing,violations:axe?.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,15)}))||[]});
  }catch(e){results.push({route,width,failure:e.message,errors});}
  page.off('pageerror',onError);page.off('console',onConsole);page.off('response',onResponse);
  fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2));
  console.log(stage,width,route,results.at(-1).status??'failed');
 }
 await context.close();
}));
} finally {await browser.close();}
console.log(JSON.stringify({screens:results.length,failures:results.filter(r=>r.failure).length,violations:results.reduce((n,r)=>n+r.violations?.length||n,0)}));
