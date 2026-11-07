// Menu / header anchor links must land exactly on their section (top == 0) at phone, tablet and desktop sizes.
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});let bad=0;
for(const [n,w,h,m] of [['320',320,640,1],['375',375,812,1],['768',768,1024,1],['1366',1366,768,0]]){const c=await b.newContext({viewport:{width:w,height:h},hasTouch:!!m,isMobile:w<500});const p=await c.newPage();await p.goto('http://localhost:4400/en/',{waitUntil:'load'});await p.waitForTimeout(3500);
const out=[];for(const id of ['ai','services','about','platform','ai','platform']){
 if(w<1024){await p.locator('button[aria-controls=mobile-menu]').click();await p.waitForTimeout(400);await p.locator(`#mobile-menu a[href="#${id}"]`).first().click()}else{await p.locator(`header a[href="#${id}"]`).first().click()}
 await p.waitForTimeout(600);{let last=-1,same=0;for(let i=0;i<60&&same<4;i++){await p.waitForTimeout(250);const y=await p.evaluate(()=>Math.round(scrollY));same=y===last?same+1:0;last=y}}await p.waitForTimeout(700);const t=await p.evaluate(id=>Math.round(document.getElementById(id).getBoundingClientRect().top),id);if(Math.abs(t)>6)bad++;out.push(id+':'+t)}
console.log(n,out.join(' '));await c.close()}await b.close();console.log(bad?'FAIL '+bad:'ALL PASS')})()
