// Scrolls through "Where the Model Runs": reports pin distance, stage changes and the longest stretch where nothing changes
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const [w,h] of [[1366,768],[390,844]]){const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
await p.goto('http://localhost:4400/en/',{waitUntil:'load'});await p.waitForSelector('[data-orbit-word]');await p.waitForTimeout(3000);
const g=await p.evaluate(()=>{const s=document.getElementById('deploy');const st=[...s.querySelectorAll('*')].find(e=>getComputedStyle(e).position==='sticky');const tr=st.parentElement;return {top:s.getBoundingClientRect().top+scrollY,trackTop:tr.getBoundingClientRect().top+scrollY,trackH:tr.offsetHeight,secH:s.offsetHeight}});
const pin=g.trackH-h;console.log(w+'x'+h,'trackH',g.trackH,'pin distance',pin,'=',(pin/h).toFixed(2)+'vh');
let last='',changes=[];for(let y=g.trackTop-h;y<=g.trackTop+g.trackH+h*0.5;y+=Math.round(h*0.08)){await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await p.waitForTimeout(400);
const r=await p.evaluate(()=>{const s=document.getElementById('deploy');const txt=[...s.querySelectorAll('[aria-live],h3,[aria-pressed=true]')].map(e=>e.textContent.trim().slice(0,24)).join('|');const st=[...s.querySelectorAll('*')].find(e=>getComputedStyle(e).position==='sticky').getBoundingClientRect();return txt+'@'+Math.round(st.top)+'/'+Math.round(st.bottom)});
const key=r.split('@')[0];if(key!==last){changes.push(Math.round((y-g.trackTop)/h*100)+'vh:'+key);last=key}}
console.log(' stage changes (scroll offset from pin start):',changes.join(' ; '));
const after=await p.evaluate(()=>{const n=document.getElementById('demo-videos').getBoundingClientRect(),d=document.getElementById('deploy').getBoundingClientRect();return {gapToNext:Math.round(n.top-d.bottom)}});console.log(' gap deploy→demo',JSON.stringify(after));await c.close()}
await b.close()})()
