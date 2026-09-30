import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PRODUCTS } from '../lib/products.js';
import { isShopVisible } from '../lib/shop.js';
import { calculateShipping } from '../lib/shipping.js';
const BASE=process.argv[2]||'http://localhost:3101',dir=process.argv[4]||'docs/revamp/commerce';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();const results=[];
if(process.argv[3])await context.route('**/*',async route=>{
 const headers={...route.request().headers()};
 if(new URL(route.request().url()).origin===new URL(BASE).origin)headers['cloudflare-workers-version-overrides']=`dew-theory="${process.argv[3]}"`;
 await route.continue({headers});
});
const check=(name,pass,detail='')=>{results.push({name,pass,detail});console.log(pass?'PASS':'FAIL',name);};
const capture=async name=>{await page.screenshot({path:`${dir}/${name}.png`,fullPage:true});const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();check(`axe ${name}`,axe.violations.length===0,JSON.stringify(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))));};
try {
 await page.goto(BASE+'/cart');await capture('cart-empty');
 const product=PRODUCTS.find(p=>isShopVisible(p)&&p.retail_price<49&&!p.variants?.length&&p.stock_status!=='out_of_stock');
 await page.goto(BASE+'/shop/'+product.id);await page.getByRole('button',{name:/^Add to bag$/i}).first().click();await page.waitForTimeout(350);check('add to bag',await page.evaluate(()=>JSON.parse(localStorage.getItem('dew_theory_cart_v1')||'{}').items?.length>0));
 await page.goto(BASE+'/cart');await page.waitForTimeout(350);const summary=page.locator('dl').first();check('$12 flat below $49',(await summary.innerText()).includes('$12'));
 const qty=page.getByRole('spinbutton').first();await qty.fill(String(Math.ceil(49/product.retail_price)));await qty.blur();await page.waitForTimeout(350);check('quantity changes',Number(await qty.inputValue())===Math.ceil(49/product.retail_price));check('free shipping at threshold',(await summary.innerText()).includes('Free'));check('exact $49 shipping math',calculateShipping(49)===0&&calculateShipping(48.99)===12);await capture('cart-filled');
 await page.goto(BASE+'/skin-quiz');for(let i=0;i<4;i++){await capture(`quiz-step-${i+1}`);await page.getByRole('option').first().click();}await capture('quiz-result');const quizAdd=page.getByRole('button',{name:'Add full routine to bag'});await quizAdd.click();await expect(page.getByRole('button',{name:'Added to bag',exact:true})).toBeVisible();check('quiz to bag',await page.evaluate(()=>JSON.parse(localStorage.getItem('dew_theory_cart_v1')||'{}').items?.length>1));
 await page.goto(BASE+'/routine');await capture('routine-am');await page.getByRole('button',{name:'Add morning routine'}).click();check('AM routine to bag',await page.getByRole('button',{name:'Added to bag'}).count()>0);await page.getByRole('tab',{name:/evening|PM/i}).click();await capture('routine-pm');await page.getByRole('button',{name:'Add evening routine'}).click();check('PM routine to bag',await page.getByRole('button',{name:'Added to bag'}).count()>0);
 await page.goto(BASE+'/virtual-consultation');const submit=page.getByRole('button',{name:'Book your consultation',exact:true});check('consultation empty validation',await submit.isDisabled());await page.getByLabel('Full name').fill('Green Revamp QA');await page.getByLabel('Email',{exact:true}).fill('qa@example.com');await page.getByRole('checkbox').check();check('consultation complete validation',await submit.isEnabled());check('duplicate booking heading removed',await page.getByRole('heading',{name:'Book your consultation',exact:true}).count()===1);check('production developer copy hidden',!(await page.locator('body').innerText()).includes('Local/dev without Stripe'));
 // Explicitly simulated redirect contract: no real Stripe key and no charge.
 await page.route('**/api/consultations/checkout',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({url:'https://checkout.stripe.com/c/pay/cs_test_green_revamp_contract'})}));await page.route('https://checkout.stripe.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<html><head><title>Simulated test handoff</title></head><body>Simulated Stripe test-mode redirect contract</body></html>'}));await submit.click();await page.waitForURL('https://checkout.stripe.com/**');check('simulated Stripe test-mode redirect contract',new URL(page.url()).hostname==='checkout.stripe.com','Browser/API contract fixture; external Stripe test account not verified');
} catch(e){check('commerce execution',false,e.message);}finally{fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));await browser.close();}
if(results.some(r=>!r.pass))process.exitCode=1;
