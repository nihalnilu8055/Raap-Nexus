// Hero redesign: layout at 4 sizes, no blank gap on exit, slow + fast scroll, reduced motion, console errors.
const {chromium}=require('playwright');const PORT=process.env.PORT||4400
;(async()=>{const b=await chromium.launch();let bad=0;const ck=(n,ok,x='')=>{if(!ok)bad++;console.log(ok?'OK ':'BAD',n,x)}
for(const [n,w,h,m] of [['desktop',1440,900,0],['laptop',1280,720,0],['tablet',820,1180,1],['mobile',390,844,1]]){
 const c=await b.newContext({viewport:{width:w,height:h},isMobile:!!m,hasTouch:!!m});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));p.on('console',x=>x.type()==='error'&&!/ERR_TUNNEL|fonts\.g/.test(x.text())&&er.push(x.text()))
 await p.goto(`http://localhost:${PORT}/en/`,{waitUntil:'load'});await p.waitForTimeout(4200)
 await p.screenshot({path:`/tmp/hero-${n}.png`})
 const g=await p.evaluate(()=>{const h=document.querySelector('#top'),pl=document.querySelector('#platform');const r=h.getBoundingClientRect(),q=pl.getBoundingClientRect();
  const sticky=[...h.querySelectorAll('*')].some(e=>getComputedStyle(e).position==='sticky')||getComputedStyle(h).position==='sticky'
  const v=document.querySelector('#top [role=img]').getBoundingClientRect();const cp=document.querySelector('#top h1').getBoundingClientRect()
  return{heroH:Math.round(r.height),gap:Math.round(q.top-(r.top+r.height)),sticky,hscroll:document.documentElement.scrollWidth>innerWidth,vis:[Math.round(v.left),Math.round(v.width),Math.round(v.height)],h1:[Math.round(cp.left),Math.round(cp.right)],overlap:cp.right>v.left+20&&cp.bottom>v.top&&cp.top<v.bottom}})
 ck(`${n}: hero in flow, no gap to next section, no sticky`,g.gap===0&&!g.sticky,JSON.stringify(g))
 ck(`${n}: no horizontal scroll, copy/visual don't overlap`,!g.hscroll&&(!g.overlap||w<1024))
 // slow scroll through hero: at every step the viewport must be covered by hero or platform (no empty band)
 const heroH=g.heroH;let empty=0
 for(let y=0;y<=heroH+h;y+=Math.max(40,Math.round(h/12))){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(60)
  const cov=await p.evaluate(()=>{const hb=document.querySelector('#top').getBoundingClientRect(),pb=document.querySelector('#platform').getBoundingClientRect();return hb.bottom>=innerHeight-1||pb.top<=hb.bottom+1&&pb.top<innerHeight})
  if(!cov)empty++}
 ck(`${n}: slow scroll never shows an empty band`,empty===0)
 // fast scroll
 await p.evaluate(()=>scrollTo(0,0));await p.mouse.move(10,10);for(let i=0;i<6;i++){await p.evaluate(i=>scrollTo(0,i%2?0:innerHeight*1.5),i);await p.waitForTimeout(40)}
 const top=await p.evaluate(()=>{scrollTo(0,innerHeight*1.2);return 0});await p.waitForTimeout(700)
 await p.evaluate(()=>scrollTo(0,document.querySelector('#top').offsetHeight*0.55));await p.waitForTimeout(900);await p.screenshot({path:`/tmp/hero-${n}-mid.png`})
 await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(900)
 const back=await p.evaluate(()=>({o:getComputedStyle(document.querySelector('#top h1').parentElement).opacity}))
 ck(`${n}: copy fully visible again at top`,+back.o>.95,back.o)
 ck(`${n}: console clean`,er.length===0,er.join('|'))
 await c.close()}
// reduced motion + no webgl irrelevant (SVG); check static render
const c=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const p=await c.newPage();await p.goto(`http://localhost:${PORT}/en/`,{waitUntil:'load'});await p.waitForTimeout(1200)
const rm=await p.evaluate(()=>{const e=document.querySelector('#top .hv-draw');return{dash:getComputedStyle(e).strokeDashoffset,anim:getComputedStyle(document.querySelector('#top .hv-float')).animationName,bars:getComputedStyle(document.querySelector('#top .hv-bar')).transform}})
ck('reduced motion: chart drawn, no float animation',rm.dash==='0px'&&rm.anim==='none',JSON.stringify(rm));await p.screenshot({path:'/tmp/hero-reduced.png'})
await b.close();console.log(bad?'FAIL '+bad:'ALL PASS')})()
