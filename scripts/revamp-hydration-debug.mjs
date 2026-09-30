import fs from 'node:fs';
import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const version=process.argv[2];const browser=await chromium.launch({channel:'chrome'});const results=[];
try{await Promise.all([390,768,1440].map(async width=>{const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
await context.route('**/*',async route=>{
 const request=route.request();const url=new URL(request.url());const headers={...request.headers()};if(url.origin==='https://dewtheoryco.com')headers['cloudflare-workers-version-overrides']=`dew-theory="${version}"`;
 if(/4bd1b696-.*\.js$/.test(url.pathname)){
  const response=await route.fetch({headers});let body=await response.text();
  body=body.replace('function rD(e){var n=Error',`function rD(e){try{console.error('QA_HYDRATION_DETAIL',JSON.stringify({type:String(e.type),tag:e.tag,expectedText:typeof e.pendingProps==='string'?e.pendingProps:null,expectedClass:e.pendingProps?.className,actual:rN?.outerHTML?.slice(0,1400),actualName:rN?.nodeName,actualValue:rN?.nodeValue,next:rN?.nextSibling?.outerHTML?.slice(0,800),parent:String(rP?.type)}))}catch{};var n=Error`);
  return route.fulfill({response,body});
 }return route.continue({headers});
});
const page=await context.newPage();let phase='navigation';page.on('console',m=>{if(m.type()==='error')results.push({url:page.url(),width,phase,message:m.text()});});
for(let i=0;i<3;i++)for(const route of ['/cart','/shop','/skin-quiz','/journal/order-of-operations']){phase='navigation';await page.goto('https://dewtheoryco.com'+route,{waitUntil:'networkidle'});await page.evaluate(async()=>{await document.fonts.ready;for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,30));}window.scrollTo(0,0);});await page.waitForTimeout(200);phase='axe';await new AxeBuilder({page}).analyze();phase='capture';const style=await page.addStyleTag({content:'* { content-visibility: visible !important; }'});await page.waitForTimeout(100);await style.evaluate(el=>el.remove());}
await context.close();}));}finally{await browser.close();fs.writeFileSync('docs/revamp/hydration-debug-parallel.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));}

