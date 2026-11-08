const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});let bad=0;const ok=(n,c,x='')=>{console.log(c?'PASS':'FAIL',n,x);if(!c)bad++};
const B='http://localhost:4400';
for(const [n,w,h] of [['desktop',1440,900],['tablet',820,1180],['mobile',390,844]]){const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();const errs=[],fails=[];p.on('pageerror',e=>errs.push(e.message));p.on('response',r=>{if(r.status()>=400)fails.push(r.status()+' '+r.url())});
await p.goto(B+'/en/',{waitUntil:'load'});await p.waitForTimeout(2500);
// header
if(w<1280){await p.click('button[aria-controls=mobile-menu]');await p.waitForTimeout(500)}
const hdr=p.locator(w<1280?'#mobile-menu a[href="/help/"]':'header a[href="/help/"]');ok(n+' header Help visible',await hdr.isVisible(),await hdr.textContent());
await Promise.all([p.waitForURL('**/help/'),hdr.click()]);await p.waitForSelector('h1');
ok(n+' header→/help/ title',(await p.title())==='Help',await p.title());ok(n+' h1',/help/i.test(await p.textContent('h1')),await p.textContent('h1'));
await p.waitForTimeout(800);await p.screenshot({path:`/tmp/help-${n}.png`});
ok(n+' no overflow',!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
// refresh
await p.reload();await p.waitForSelector('h1');ok(n+' refresh /help/ ok',p.url().endsWith('/help/'));
await p.goto(B+'/help/welcome.html');ok(n+' inner page refresh',/What is/i.test(await p.textContent('article h1')));
// footer
await p.goto(B+'/en/',{waitUntil:'load'});await p.waitForTimeout(1500);const f=p.locator('footer a[href="/help/"]');await f.scrollIntoViewIfNeeded();ok(n+' footer Help visible',await f.isVisible());
const order=await p.evaluate(()=>[...document.querySelectorAll('footer li')].map(l=>l.textContent.trim()).filter(t=>/Contact|Help/.test(t)).join('>'));ok(n+' footer order near Contact',/Contact Us>Help/.test(order),order);
await Promise.all([p.waitForURL('**/help/'),f.click()]);ok(n+' footer→/help/',true);
if(n==='desktop'){
 await p.goto(B+'/help');ok('direct /help→/help/',p.url().endsWith('/help/'));
 await p.goto(B+'/en/help');await p.waitForURL('**/help/');ok('/en/help→/help/',true);
 await p.goto(B+'/ar/help');await p.waitForURL('**/help/');ok('/ar/help→/help/',true);
 // language sync
 const c2=await b.newContext();const q=await c2.newPage();await q.goto(B+'/ar/',{waitUntil:'load'});await q.waitForTimeout(2000);await q.click('header a[href="/help/"]');await q.waitForURL('**/help/');await q.waitForTimeout(800);ok('help opens in site language (ar)',await q.evaluate(()=>document.documentElement.lang)==='ar'||await q.evaluate(()=>document.documentElement.dir)==='rtl',await q.evaluate(()=>document.documentElement.lang+'/'+document.documentElement.dir));
 const nonhelp=await q.goto(B+'/en/demo-videos');ok('existing route still works',nonhelp.status()===200);await c2.close();
 // images load on a help page with shots
 await p.goto(B+'/help/chat-basics.html');await p.waitForTimeout(1500);const broken=await p.evaluate(()=>[...document.images].filter(i=>i.getAttribute('src')&&i.complete&&i.naturalWidth===0).length);ok('help images load',broken===0,'broken '+broken);
}
ok(n+' no page errors',errs.length===0,errs.join(';'));ok(n+' no 4xx assets',fails.length===0,fails.slice(0,3).join(' | '));await c.close()}
await b.close();console.log(bad?'FAIL':'ALL PASS')})()
