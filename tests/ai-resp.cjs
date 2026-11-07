const { chromium } = require('playwright')
const PORT = process.env.PORT || 4400, LANG = process.env.LANG_ || 'en'
const sizes = [[1920,1080],[1440,900],[1280,720],[1024,768],[820,1180],[768,1024],[390,844],[360,740],[320,640],[844,390],[667,375]]
;(async () => {
  const b = await chromium.launch(); let bad = 0
  for (const [w,h] of sizes) {
    const mobile = w < 800 || h < 500
    const ctx = await b.newContext({ viewport:{width:w,height:h}, hasTouch:mobile, isMobile:mobile, deviceScaleFactor:1 })
    const p = await ctx.newPage(); const errs=[]
    p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&!/ERR_TUNNEL|Failed to load resource/.test(m.text())&&errs.push(m.text()))
    await p.goto(`http://localhost:${PORT}/${LANG}/`,{waitUntil:'load'})
    for (let i=0;i<6;i++){ await p.evaluate(()=>document.querySelector('#ai')?.scrollIntoView({behavior:'instant'})); await p.waitForTimeout(500) }
    await p.evaluate(async()=>{const s=document.querySelector('#ai');const t=s.getBoundingClientRect().top+scrollY;for(let y=t;y<t+s.offsetHeight;y+=200){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,300))}for(const el of document.querySelectorAll('#ai .min-w-0')){el.scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>setTimeout(r,900))}})
    await p.waitForTimeout(1500)
    const r = await p.evaluate(()=>{
      const s=document.querySelector('#ai'), sr=s.getBoundingClientRect()
      const lis=[...s.querySelectorAll('ul > li')].slice(0,4).map(li=>{const r=li.getBoundingClientRect();return {t:li.textContent.trim().slice(0,22),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),sw:li.scrollWidth>li.clientWidth+1}})
      const over=[...s.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left<-1)&&!e.closest('canvas')&&getComputedStyle(e).position!=='absolute'}).length
      return {docOver:document.documentElement.scrollWidth>innerWidth, secOver:s.scrollWidth>s.clientWidth, over, lis, sh:Math.round(sr.height)}
    })
    const hs=new Set(r.lis.map(l=>l.h)); const ok=!r.docOver&&!r.secOver&&r.lis.length===4&&!r.lis.some(l=>l.sw)&&hs.size<=2&&errs.length===0
    if(!ok)bad++
    console.log(ok?'OK ':'BAD',w+'x'+h,JSON.stringify({docOver:r.docOver,secOver:r.secOver,over:r.over,n:r.lis.length,hs:[...hs],sh:r.sh,errs:errs.slice(0,2)}))
    if(process.env.SHOT && [[1440,900],[390,844],[844,390],[820,1180]].some(([a,c])=>a===w&&c===h)){
      await p.evaluate(()=>document.querySelector('#ai').scrollIntoView({behavior:'instant'})); await p.waitForTimeout(800)
      await p.screenshot({path:`/tmp/ai-${LANG}-${w}x${h}.png`,fullPage:false})
    }
    await ctx.close()
  }
  await b.close(); console.log(bad?'FAIL '+bad:'ALL PASS')
})()
