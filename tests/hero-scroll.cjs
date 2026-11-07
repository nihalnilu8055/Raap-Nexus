// Scrolls through the hero in steps: the text side must always show visible copy (no blank), and the next section must follow without a gap.
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});let bad=0;
for(const [n,w,h,m] of [['desktop',1440,900,0],['laptop',1280,720,0],['tablet',820,1180,1],['mobile',390,844,1]]){const c=await b.newContext({viewport:{width:w,height:h},hasTouch:!!m,isMobile:w<500});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));p.on('console',x=>x.type()==='error'&&!/fonts|ERR_|GL/.test(x.text())&&er.push(x.text()));
await p.goto('http://localhost:4400/en/',{waitUntil:'load'});await p.waitForSelector('[data-orbit-word]');await p.waitForTimeout(4200);
const H=await p.evaluate(()=>document.getElementById('top').offsetHeight);const nxt=await p.evaluate(()=>{const t=document.getElementById('top');return t.nextElementSibling.tagName+'#'+t.nextElementSibling.id});
const steps=[];for(let y=0;y<=H;y+=Math.round(h*0.12)){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(450);
 const r=await p.evaluate(()=>{const vis=e=>{const s=getComputedStyle(e);return s.visibility!=='hidden'&&parseFloat(s.opacity)>0.2};const sec=document.querySelector('#top section');const sr=sec.getBoundingClientRect();
  const texts=[...sec.querySelectorAll('h1,p')].filter(e=>vis(e)&&e.closest('[style*="opacity"]')!==null||true).filter(e=>{let x=e,o=1,v=true;while(x&&x!==sec){const s=getComputedStyle(x);o*=parseFloat(s.opacity);if(s.visibility==='hidden')v=false;x=x.parentElement}return v&&o>0.3&&e.getBoundingClientRect().height>0});
  const nx=document.getElementById('top').nextElementSibling.getBoundingClientRect();const cta=[...sec.querySelectorAll('a,button')].find(e=>/Explore Platform/.test(e.textContent));let ctaVis=false;if(cta){let x=cta,o=1;while(x&&x!==sec){const st=getComputedStyle(x);o*=parseFloat(st.opacity);if(st.visibility==='hidden')o=0;x=x.parentElement}ctaVis=o>0.9}
  return {ctaVis,secBottom:Math.round(sr.bottom),nextTop:Math.round(nx.top),vis:texts.length,over:document.documentElement.scrollWidth>innerWidth}});
 steps.push({y,...r})}
const wrapBottom=H-h; // after the pin ends the section scrolls away; blank = viewport region with neither hero text nor next section
let blank=0;steps.forEach(s=>{const heroVisible=s.secBottom>80; if(heroVisible&&s.vis===0)blank++;});
const ctaGone=steps.filter(s=>s.secBottom>=h-1&&!s.ctaVis).length;if(ctaGone)bad++;const gap=steps.some(s=>s.nextTop>s.secBottom+2&&s.nextTop<h);
console.log(n,'wrapH',H,'next',nxt,'steps',steps.length,'steps with hero on screen but no text:',blank,'gap between hero and next:',gap,'CTA hidden steps (pinned):',ctaGone,'overflowX',steps.some(s=>s.over),er);
steps.filter((_,i)=>i%2==0).forEach(s=>console.log('  y',s.y,'texts',s.vis,'secBottom',s.secBottom,'nextTop',s.nextTop));
if(blank||gap||er.length)bad++;
for(const f of [0.12,0.3,0.55,0.9]){await p.evaluate(([y])=>scrollTo(0,y),[Math.round((H-h)*f)]);await p.waitForTimeout(700);if(n==='desktop'||n==='mobile')await p.screenshot({path:`/tmp/hs-${n}-${Math.round(f*100)}.png`})}
await c.close()}await b.close();console.log(bad?'FAIL':'ALL PASS')})()
