// Samples the orbit for ~6s and reports the closest approach (px) between the headline text and any orbit label that is vertically level with it
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});let bad=0;
for(const [w,h] of [[768,1024],[900,700],[1024,768],[1100,720],[1180,820],[1280,720],[1366,768],[1440,900],[1536,864],[1920,1080]]){const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
await p.goto('http://localhost:4400/en/',{waitUntil:'load'});await p.waitForSelector('[data-orbit-word]');await p.waitForTimeout(4200);
let min=1e9,art=0;for(let i=0;i<14;i++){const r=await p.evaluate(()=>{const rows=[...document.querySelectorAll('.hx-row')];let tr=0,tt=1e9,tb=0;rows.forEach(e=>[...e.children].forEach(c=>{const r=c.getBoundingClientRect();tr=Math.max(tr,r.right);tt=Math.min(tt,r.top);tb=Math.max(tb,r.bottom)}));
const cta=[...document.querySelectorAll('#top a,#top button')].find(e=>/explore/i.test(e.textContent)).getBoundingClientRect();tb=Math.max(tb,cta.bottom);tr=Math.max(tr,cta.right);
let m=1e9;document.querySelectorAll('[data-orbit-word]').forEach(e=>{const r=e.getBoundingClientRect();if(r.bottom>tt-6&&r.top<tb+6)m=Math.min(m,r.left-tr)});return {m,tr}});min=Math.min(min,r.m);await p.waitForTimeout(450)}
const stacked=w<1024;console.log(w+'x'+h,'closest gap',min>1e8?'none level':Math.round(min)+'px',stacked?'(stacked layout)':'');if(!stacked&&min<16)bad++;await c.close()}
await b.close();console.log(bad?'FAIL':'PASS')})()
