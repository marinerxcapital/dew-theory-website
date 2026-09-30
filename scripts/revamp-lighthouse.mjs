import fs from 'node:fs';
import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
const BASE=process.argv[2]||'http://localhost:3101';const out=process.argv[3]||'docs/revamp/lighthouse';fs.mkdirSync(out,{recursive:true});const results=[];
const extraHeaders=process.argv[4]?{'Cloudflare-Workers-Version-Overrides':`dew-theory="${process.argv[4]}"`}:undefined;
for(const [name,route] of [['home','/'],['shop','/shop'],['product','/shop/green-tea-citrus-cleanser']]){
 const chrome=await launch({chromePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',chromeFlags:['--headless','--no-first-run','--disable-dev-shm-usage']});
 try {const report=await lighthouse(BASE+route,{port:chrome.port,extraHeaders,output:['json','html'],onlyCategories:['performance','accessibility'],logLevel:'error'});const lhr=report.lhr;fs.writeFileSync(`${out}/${name}.json`,report.report[0]);fs.writeFileSync(`${out}/${name}.html`,report.report[1]);const result={page:name,performance:Math.round(lhr.categories.performance.score*100),accessibility:Math.round(lhr.categories.accessibility.score*100),lcpMs:lhr.audits['largest-contentful-paint'].numericValue,cls:lhr.audits['cumulative-layout-shift'].numericValue,tbtMs:lhr.audits['total-blocking-time'].numericValue};results.push(result);console.log(JSON.stringify(result));}finally{await chrome.kill();}
}
fs.writeFileSync(out+'/summary.json',JSON.stringify(results,null,2));
