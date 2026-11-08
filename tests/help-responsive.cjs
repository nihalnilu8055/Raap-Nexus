const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let bad=0;
for(const [w,h] of [[320,640],[375,812],[430,932],[768,1024],[1024,768],[1366,768],[1920,1080]]){const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
for(const path of ['/en/help','/en/help/connectors-overview']){await p.goto('http://localhost:4400'+path,{waitUntil:'load'});await p.waitForSelector('.hc .top');await p.waitForTimeout(900);
const r=await p.evaluate(()=>{const de=document.documentElement;const side=document.querySelector('.hc .side').getBoundingClientRect();const menu=document.querySelector('.hc .menu');const mv=getComputedStyle(menu).display!=='none';const s=document.querySelector('.hc .search input').getBoundingClientRect();return {ov:de.scrollWidth>innerWidth,sideVisible:side.right>0&&side.left<innerWidth,menu:mv,searchW:Math.round(s.width),topOv:[...document.querySelectorAll('.hc .top *')].some(e=>e.getBoundingClientRect().right>innerWidth+1)}});
let menuOk='-';if(r.menu){await p.click('.hc .menu');await p.waitForTimeout(400);const o=await p.evaluate(()=>{const s=document.querySelector('.hc .side').getBoundingClientRect();return s.left>=0&&s.right<=innerWidth&&!!document.querySelector('.hc .side .hc-back')});menuOk=o;await p.screenshot({path:`/tmp/hr-${w}-menu.png`});}
console.log(w+'x'+h,path,JSON.stringify(r),'menuOpens',menuOk);if(r.ov||r.topOv||(r.menu&&menuOk!==true))bad++;
if(path==='/en/help/connectors-overview')await p.screenshot({path:`/tmp/hr-${w}.png`})}
await c.close()}await b.close();console.log(bad?'FAIL':'PASS')})()
