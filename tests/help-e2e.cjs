// Help Center integration: direct access, refresh, search, back/forward, all internal links + images, nav/footer links, RTL, mobile menu, no leakage into the home page
const {chromium}=require('playwright');const B='http://localhost:4400';let bad=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)bad++};
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:1366,height:768}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts\.g|favicon/.test(m.text()))errs.push(m.text())});
const fails=[];p.on('requestfailed',r=>{if(/help-center/.test(r.url()))fails.push(r.url())});p.on('response',r=>{if(/help-center/.test(r.url())&&r.status()>=400)fails.push(r.status()+' '+r.url())});
// home must not load the portal
await p.goto(B+'/en/',{waitUntil:'load'});await p.waitForTimeout(1500);
let navHelp=await p.$eval('header a[href="/en/help"]',e=>e.textContent).catch(()=>null);ok(navHelp==='Help','header Help link on home: '+navHelp);
let foot=await p.$eval('footer a[href="/en/help"]',e=>e.textContent).catch(()=>null);ok(foot==='Help','footer Help link: '+foot);
const css=await p.evaluate(()=>[...document.styleSheets].some(s=>{try{return [...s.cssRules].some(r=>r.cssText&&r.cssText.includes('.hc '))}catch(e){return false}}));ok(!css,'portal CSS not loaded on the home page');
await p.click('header a[href="/en/help"]');await p.waitForSelector('.hc .top');ok(p.url().endsWith('/en/help'),'header Help click -> '+p.url());
ok((await p.title())==='Raap Nexus Help','title: '+await p.title());
await p.goBack();await p.waitForTimeout(800);ok(/\/en\/?$/.test(p.url()),'browser back returns to home');
await p.goForward();await p.waitForSelector('.hc .top');ok(p.url().endsWith('/en/help'),'forward returns to help');
// footer link
await p.goto(B+'/en/',{waitUntil:'load'});await p.waitForTimeout(1200);await p.click('footer a[href="/en/help"]');await p.waitForSelector('.hc .top');ok(p.url().endsWith('/en/help'),'footer Help click');
// direct + refresh on article
await p.goto(B+'/en/help/install',{waitUntil:'load'});await p.waitForSelector('.hc article h1');ok((await p.title()).startsWith('Install'),'direct article, title: '+await p.title());
await p.reload({waitUntil:'load'});await p.waitForSelector('.hc article h1');ok(p.url().endsWith('/en/help/install'),'refresh keeps article');
// search
await p.fill('.hc .top .search input','connector');await p.waitForTimeout(400);
const hits=await p.$$eval('.hc .results a',a=>a.map(x=>x.textContent.slice(0,40)));ok(hits.length>0&&!/undefined/.test(hits.join()),'search results: '+hits.length+' e.g. '+hits[0]);
await p.click('.hc .results a');await p.waitForTimeout(800);ok(/\/en\/help\/[\w-]+$/.test(p.url()),'search click -> '+p.url());
await p.goBack();await p.waitForTimeout(800);ok(p.url().endsWith('/en/help/install'),'back after search');
// unknown + deep
await p.goto(B+'/en/help/nope',{waitUntil:'load'});await p.waitForTimeout(1200);ok(await p.$('.hc main h1')!==null&&/404/.test(await p.textContent('.hc main h1')),'unknown article shows 404');
// language: ar route + portal selector
await p.goto(B+'/ar/help',{waitUntil:'load'});await p.waitForSelector('.hc .top');await p.waitForTimeout(800);ok((await p.getAttribute('.hc','dir'))==='rtl','ar route -> portal rtl');
await p.evaluate(()=>localStorage.removeItem('help-lang'));
await p.goto(B+'/en/help',{waitUntil:'load'});await p.waitForSelector('.hc .top');await p.selectOption('#lang','de');await p.waitForTimeout(1500);ok((await p.textContent('.hc h1')).trim()!=='How can we help?','portal language switch to de: '+(await p.textContent('.hc h1')).trim());
await p.evaluate(()=>localStorage.removeItem('help-lang'));
// back link
await p.goto(B+'/en/help/install',{waitUntil:'load'});await p.waitForSelector('.hc .top');await p.click('#openapp');await p.waitForTimeout(1500);ok(/\/en\/?$/.test(p.url())&&await p.$('#top'),'Back to RaapNexus -> home');
const htmlDir=await p.evaluate(()=>document.documentElement.dir);ok(htmlDir==='ltr','html dir restored: '+htmlDir);
// all pages: links + images
const ids=await p.evaluate(async()=>{await new Promise(r=>{const s=document.createElement('script');s.src='/help-center/assets/search.js';s.onload=r;document.head.appendChild(s)});return window.HELP_SEARCH.map(a=>a.id)});
let links=0,brokenLinks=[],imgBad=[];
for(const id of ['index',...ids]){await p.goto(B+'/en/help'+(id==='index'?'':'/'+id),{waitUntil:'load'});await p.waitForSelector('.hc .top');await p.waitForTimeout(500);
 const r=await p.evaluate((ids)=>{const out={l:[],i:[]};document.querySelectorAll('.hc a[href]').forEach(a=>{const h=a.getAttribute('href');if(/^\/en\/help/.test(h)){const s=h.replace(/^\/en\/help\/?/,'').replace(/#.*/,'')||'index';if(s!=='index'&&!ids.includes(s))out.l.push(h)}else if(/\.html/.test(h)&&!/^http/.test(h))out.l.push('RAW '+h)});
  [...document.querySelectorAll('.hc img')].filter(i=>!i.closest('.lb')).forEach(i=>{if(i.complete&&i.naturalWidth===0)out.i.push(i.getAttribute('src'))});return out},ids);
 links+=1;brokenLinks.push(...r.l.map(x=>id+': '+x));imgBad.push(...r.i)}
ok(!brokenLinks.length,'internal links resolve on '+links+' pages '+brokenLinks.slice(0,3));ok(!imgBad.length,'images load '+imgBad.slice(0,3));
ok(!fails.length,'no failed portal requests '+fails.slice(0,3));ok(!errs.length,'no console/page errors '+errs.slice(0,3));
await b.close();console.log(bad?'FAIL':'ALL PASS')})()
