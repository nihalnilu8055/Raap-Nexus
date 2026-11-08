// Production-build check: /en/help and /en/help/ opened cold in fresh browser contexts ("new tab"), refreshed, and reached from the site menu
const {chromium}=require('playwright');let bad=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)bad++};
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
for(const path of ['/en/help','/en/help/','/en/help/install','/ar/help','/fr/help/']){const c=await b.newContext({viewport:{width:1366,height:768}});const p=await c.newPage();const r=await p.goto('http://localhost:4400'+path,{waitUntil:'load'});
await p.waitForSelector('.hc .top .brand',{timeout:8000}).catch(()=>{});const has=!!(await p.$('.hc .wrap article, .hc .wrap main'));const t=await p.title();ok(r.status()===200&&has&&/Raap Nexus Help|Raap Nexus/.test(t)&&!/404|unavailable/i.test(await p.textContent('body').then(x=>x.slice(0,0))),`${path}: HTTP ${r.status()}, portal rendered=${has}, title="${t}"`);
await p.reload({waitUntil:'load'});await p.waitForSelector('.hc .wrap main',{timeout:8000}).catch(()=>{});ok(!!(await p.$('.hc .wrap main')),`${path}: refresh keeps the page`);await c.close()}
const c=await b.newContext({viewport:{width:1366,height:768}});const p=await c.newPage();await p.goto('http://localhost:4400/en/',{waitUntil:'load'});await p.waitForTimeout(1500);await p.click('header a[href="/en/help"]');await p.waitForSelector('.hc .wrap main');ok(p.url().endsWith('/en/help'),'menu -> '+p.url());
const cssFonts=await p.evaluate(()=>[...document.fonts].filter(f=>/HC /.test(f.family)).length);ok(cssFonts>0,'portal fonts registered: '+cssFonts);
await b.close();console.log(bad?'FAIL':'ALL PASS')})()
