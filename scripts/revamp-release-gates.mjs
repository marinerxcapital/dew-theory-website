import fs from 'node:fs';
import path from 'node:path';
const crawlDir=process.argv[2]||'docs/revamp/after';
const lighthouseDir=process.argv[3]||'docs/revamp/lighthouse-inline-preview';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass,detail});
const routes=read('docs/revamp/routes.json');
const crawl=read(path.join(crawlDir,'results.json'));
check('complete route/viewport crawl',crawl.length===routes.length*3,{routes:routes.length,cases:crawl.length});
const issues=[];
for(const r of crawl){
 const expected404=r.route==='/missing-green-audit';
 const privateRoute=/\/virtual-consultation\/(intake|plan)\//.test(r.url||'');
 const canonicalPath=expected404?'/404':privateRoute?'/virtual-consultation':r.url;
 const expectedCanonical='https://dewtheoryco.com'+canonicalPath;
 const errors=(r.errors||[]).filter(e=>!expected404||!e.includes('404'));
 const missing=(r.missing||[]).filter(m=>!expected404||new URL(m.url).pathname!==r.route||m.status!==404);
 if(r.failure||r.status!==(expected404?404:200)||errors.length||missing.length||r.violations?.length||r.horizontal||r.overflow?.length||r.brokenImages?.length||r.darkSurfaces?.length||r.headerCount!==1||r.footerCount!==1||r.background!=='rgb(228, 236, 225)'||r.theme!=='rgb(228, 236, 225)'||r.canonical!==expectedCanonical||!r.ogUrl||new URL(r.ogUrl).href!==expectedCanonical||!r.ogTitle||!r.ogDescription||!r.twitterTitle||!r.twitterDescription||JSON.stringify(r).includes('FIXED V2')||(/^\/(cart|account)(\/|$)/.test(r.url||'')&&!r.robots?.includes('noindex'))){issues.push({route:r.route,width:r.width,failure:r.failure,status:r.status,errors,missing,axe:r.violations?.length,canonical:r.canonical,expectedCanonical});}
}
check('render, accessibility, metadata and chrome',issues.length===0,issues);
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const raw=[];for(const file of [...walk('app'),...walk('components'),...walk('lib'),'tailwind.config.js','public/site.webmanifest'].filter(p=>fs.existsSync(p)&&/\.(jsx?|css|webmanifest)$/.test(p)&&p!==path.join('app','globals.css'))){if(/#[\da-f]{3,8}\b/i.test(fs.readFileSync(file,'utf8')))raw.push(file);}
check('active UI has no raw hex outside token file',raw.length===0,raw);
const integrity=read('docs/revamp/build-image-integrity.json');
check('release assets and privacy',integrity.references===115&&!integrity.missing.length&&!integrity.altered.length&&!integrity.runtimeFiles.length&&!integrity.legalAltered.length,integrity);
const source=read('docs/revamp/source-release-integrity.json');
check('concurrent source and protected data preserved',!source.source_changed_since_snapshot.length&&!source.source_missing.length&&source.protected_files.every(f=>f.unchanged_normalized)&&source.catalog_protected_projection_equal&&source.legal_pdf_bytes_unchanged,{sourceChanges:source.source_changed_since_snapshot});
const commerce=read('docs/revamp/commerce/results.json');check('local commerce smoke',commerce.length===22&&commerce.every(r=>r.pass),{checks:commerce.length});
const stripe=read('docs/revamp/stripe-handoff-real.json');check('real Stripe test handoff',stripe.externalStripe&&stripe.testMode&&stripe.hostedPageLoaded&&!stripe.charged,stripe);
const metrics=read(path.join(lighthouseDir,'summary.json'));check('mobile Lighthouse release targets',metrics.length===3&&metrics.every(r=>r.performance>=90&&r.accessibility===100&&r.lcpMs<2500&&r.cls<0.05),metrics);
for(const [name,file,count] of [['unit','docs/revamp/unit-tests.log',396],['contrast','docs/revamp/contrast.log',20]]){const log=fs.readFileSync(file,'utf8');check(name+' recorded test gate',new RegExp('(?:#|ℹ) pass '+count+'\\b').test(log)&&/(?:#|ℹ) fail 0\b/.test(log),{expectedPass:count});}
const result={time:new Date().toISOString(),releaseReady:checks.every(c=>c.pass),checks};fs.writeFileSync('docs/revamp/release-gates.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.releaseReady)process.exitCode=1;
