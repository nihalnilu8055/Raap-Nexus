// ─────────────────────────────────────────────────────────────────────────────
// BEFORE & AFTER SECTION — self-contained and removable.
// To remove: delete this file, plus the import and <BeforeAfter /> line (both tagged
// "BEFORE-AFTER-SECTION") in src/pages/Home.tsx. Nothing else depends on it.
//
// Full-screen interactive workspace: a vertical slider in the centre reveals the traditional
// finance desk (left) or the connected RaapNexus environment (right).
// Illustrative demonstration using simulated sample data. No live ERP, database or API.
// Rendered inside a Shadow DOM so its styles never touch the rest of the site.
// Works on desktop, laptop, tablet and phone (simplified stacked layout on narrow screens).
// ─────────────────────────────────────────────────────────────────────────────
// @ts-nocheck  (self-contained vanilla scene code mounted into a Shadow DOM)
import { useEffect, useRef } from 'react'

const CSS = `

:host{display:block;color-scheme:dark;--bg:#040a1c;--ink:#eaf1ff;--mut:#9db0d3;--dim:#6b7fa6;--b4:#60a5fa;--b5:#3b82f6;--cy:#38bdf8;--em:#34d399;--am:#fbbf24;--rd:#fb7185;--line:rgba(120,165,255,.2)}
*{box-sizing:border-box;margin:0}
.root{background:var(--bg);color:var(--ink);font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;-webkit-font-smoothing:antialiased}
.root{min-height:100svh;overflow-x:hidden;background:radial-gradient(900px 500px at 85% -5%,rgba(37,99,235,.22),transparent 60%),radial-gradient(700px 500px at 0 60%,rgba(56,189,248,.07),transparent 60%),var(--bg)}
.pg{padding-block:64px 20px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:flex;flex-direction:column;align-items:center}
.hd{text-align:center;width:100%;max-width:1100px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:10.5px;font-weight:700;letter-spacing:.18em;color:var(--b4)}
.eyebrow:before{content:"";width:22px;height:1px;background:var(--b4);opacity:.7}
h1{font-size:clamp(22px,3.1vw,38px);line-height:1.1;font-weight:800;letter-spacing:-.02em;margin:3px 0 4px;text-wrap:balance}
h1 b{background:linear-gradient(90deg,#93c5fd,#38bdf8);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{font-size:clamp(12px,1.1vw,14px);color:var(--mut);max-width:760px;margin:0 auto;text-wrap:balance}
.ctl{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:8px}
.seg{display:inline-flex;padding:3px;border-radius:99px;background:rgba(20,40,90,.45);border:1px solid var(--line)}
.seg button,.rep{font:700 11px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);background:transparent;border:0;border-radius:99px;padding:8px 14px;cursor:pointer;transition:.25s}
.seg button.on{color:#fff;background:linear-gradient(135deg,#3b82f6,#0ea5e9)}
.seg button:hover:not(.on){color:#fff}
.chip{font:700 10px Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--am);border:1px solid rgba(251,191,36,.4);background:rgba(251,191,36,.08);border-radius:99px;padding:6px 11px;display:inline-flex;gap:6px;align-items:center}
.chip:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--am)}
.rep{border:1px solid var(--line);background:rgba(20,40,90,.35);color:var(--ink);padding:8px 14px}
.rep:hover{border-color:var(--b4)}
button:focus-visible,.hnd:focus-visible{outline:2px solid var(--cy);outline-offset:3px}

/* ---------- stage & scene ---------- */
.stage{position:relative;margin-top:10px;border-radius:18px;overflow:hidden;border:1px solid var(--line);box-shadow:0 30px 80px -20px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.02) inset;touch-action:pan-y;user-select:none;-webkit-user-select:none}
.scene{position:absolute;left:0;top:0;transform-origin:0 0;--p:50;contain:layout paint}
.layer{position:absolute;inset:0;overflow:hidden;z-index:1}.after{z-index:2}
.after{clip-path:inset(0 0 0 calc(var(--p)*1%));-webkit-mask-image:linear-gradient(90deg,transparent calc(var(--p)*1% - 1px),#000 calc(var(--p)*1% + 5%));mask-image:linear-gradient(90deg,transparent calc(var(--p)*1% - 1px),#000 calc(var(--p)*1% + 5%));will-change:clip-path}
.o{position:absolute;left:var(--x);top:var(--y);width:var(--w);transform:rotate(var(--r,0deg));z-index:var(--z,1);transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s,filter .35s}
.o:hover{transform:rotate(var(--r,0deg)) translateY(-7px) scale(1.018);z-index:70}
.portrait .o{left:var(--px);top:var(--py);width:var(--pw)}
.portrait .np{display:none!important}
.sh{box-shadow:0 18px 34px -6px rgba(0,0,0,.6),0 3px 6px rgba(0,0,0,.45)}
.o:hover.sh{box-shadow:0 28px 46px -8px rgba(0,0,0,.7),0 4px 8px rgba(0,0,0,.45)}

/* BEFORE : desk */
.before{background:
 radial-gradient(900px 560px at 30% 40%,rgba(120,90,50,.16),transparent 70%),
 radial-gradient(700px 500px at 80% 70%,rgba(60,90,150,.10),transparent 70%),
 repeating-linear-gradient(94deg,rgba(255,255,255,.012) 0 2px,transparent 2px 9px),
 linear-gradient(160deg,#0c1426,#0a1020 60%,#0b1224)}
.before:after{content:"";position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 45%,transparent 55%,rgba(0,0,0,.45));pointer-events:none;z-index:90}
.paper{background:linear-gradient(#f7f2e5,#ebe3cd);color:#2b2b2b;border-radius:3px;padding:14px 16px;font-size:12px}
.paper h5{font:700 12px Inter;letter-spacing:.08em;color:#444;display:flex;justify-content:space-between}
.hw{font-family:Caveat,'Segoe Print',cursive;font-weight:700;color:#1b3a8a;font-size:19px;line-height:1.05}
.hwr{color:#b42318}
.ln{height:6px;border-radius:3px;background:rgba(0,0,0,.14);margin:7px 0}
.tag{position:absolute;z-index:5;font:700 10px Inter;letter-spacing:.06em;text-transform:uppercase;padding:4px 8px;border-radius:5px;color:#3b2a00;background:#fbbf24;box-shadow:0 4px 10px rgba(0,0,0,.4);white-space:nowrap}
.tag.r{background:#fb7185;color:#3b0a14}.tag.g{background:#e2e8f0;color:#1e293b}
.sticky{background:linear-gradient(#fde68a,#fcd34d);color:#4a3200;padding:14px 13px 16px;font-family:Caveat,cursive;font-weight:700;font-size:21px;line-height:1.05;border-radius:2px;box-shadow:0 14px 22px -6px rgba(0,0,0,.6)}
.sticky.p{background:linear-gradient(#fbcfe8,#f9a8d4);color:#5b1038}
.sticky.b{background:linear-gradient(#bae6fd,#7dd3fc);color:#0b3a55}
.xw{background:#fff;color:#1f2933;border-radius:4px;overflow:hidden;font:12px 'Segoe UI',Arial,sans-serif}
.xw .tb{background:#1f7a46;color:#fff;font-weight:600;font-size:11.5px;padding:6px 10px;display:flex;align-items:center;gap:6px}
.xw .tb i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.55)}
.xw table{width:100%;border-collapse:collapse}
.xw th{background:#e9eef2;font-weight:600;color:#4b5b68;font-size:11px;border:1px solid #cfd8de;padding:4px 7px;text-align:left}
.xw td{border:1px solid #dbe3e8;padding:5px 7px;font-variant-numeric:tabular-nums}
.xw td.n{text-align:right}.xw td.bad{background:#fff0b3;outline:2px solid #f59e0b;outline-offset:-2px}.xw td.rd{background:#ffd6d6;color:#8a1111}
.xw.csv{background:#f1ecdd;font-family:'JetBrains Mono',monospace;font-size:11.5px}
.xw.csv .tb{background:#6b5a3a}.xw.csv th{background:#e4dcc6}.xw.csv td{border-color:#d8cfb6}
.pdf{background:#f4f4f2;color:#222;border-radius:3px;padding:0;font-size:11px}
.pdf .tb{background:#c0392b;color:#fff;font:700 11px Inter;padding:6px 10px}
.pdf .bd{padding:12px}
.pdf .ln{background:rgba(0,0,0,.13)}
.docx .tb{background:#2b579a}
.folder{background:linear-gradient(#e7c887,#d9b46a);border-radius:4px 10px 6px 6px;height:var(--h,170px);position:relative;color:#4b3410;font:700 12px Inter;padding:34px 16px 0}
.folder:before{content:"";position:absolute;left:0;top:-16px;width:42%;height:18px;background:#e7c887;border-radius:6px 10px 0 0}
.calc{background:linear-gradient(#2b3140,#1d222e);border-radius:12px;padding:12px;border:1px solid #3a4153}
.calc .dp{background:#b7c9a8;color:#1c2b14;font:600 22px 'JetBrains Mono';text-align:right;padding:8px 10px;border-radius:5px;margin-bottom:10px}
.calc .ks{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.calc .ks i{height:22px;border-radius:5px;background:#4a5266;box-shadow:0 2px 0 #11141b}
.calc .ks i.o2{background:#e08a2d}
.receipt{background:#fbfaf6;color:#333;font:11px 'JetBrains Mono',monospace;padding:12px 11px 18px;clip-path:polygon(0 0,100% 0,100% 100%,94% 97%,88% 100%,82% 97%,76% 100%,70% 97%,64% 100%,58% 97%,52% 100%,46% 97%,40% 100%,34% 97%,28% 100%,22% 97%,16% 100%,10% 97%,5% 100%,0 97%)}
.receipt div{display:flex;justify-content:space-between;margin:3px 0}
.ledger{display:flex;border-radius:4px;overflow:hidden;background:#d8cfb4;padding:6px;gap:0}
.ledger .pgx{flex:1;background:repeating-linear-gradient(#efe8d2 0 22px,#cdd9c0 22px 23px);padding:8px 10px;color:#1b3a8a;min-height:190px}
.ledger .pgx+.pgx{border-left:2px solid #b3a77f}
.ledger .hw{font-size:17px;display:flex;justify-content:space-between;height:23px;line-height:23px}
.pen{height:9px;border-radius:5px;background:linear-gradient(90deg,#1d4ed8 0 78%,#e5e7eb 78% 86%,#111 86%)}
.clip{position:absolute;width:16px;height:42px;border:3px solid #9aa4b2;border-radius:9px;z-index:6;top:-14px;left:26px}
.neq{position:absolute;z-index:8;font:800 11px Inter;color:#fff;background:#e11d48;border-radius:99px;padding:5px 10px;box-shadow:0 6px 14px rgba(0,0,0,.5);white-space:nowrap}
.circ{position:absolute;border:3px solid #e11d48;border-radius:50%;z-index:4;transform:rotate(-6deg);pointer-events:none}

/* AFTER : digital */
.after{background:
 radial-gradient(800px 520px at 70% 10%,rgba(37,99,235,.22),transparent 65%),
 radial-gradient(600px 400px at 15% 85%,rgba(56,189,248,.12),transparent 65%),
 linear-gradient(rgba(96,165,250,.05) 1px,transparent 1px) 0 0/48px 48px,
 linear-gradient(90deg,rgba(96,165,250,.05) 1px,transparent 1px) 0 0/48px 48px,#050c20}
.gl{background:linear-gradient(160deg,rgba(14,30,68,.94),rgba(8,20,48,.94));border:1px solid var(--line);border-radius:14px;box-shadow:0 22px 44px -12px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.05);transition:box-shadow .3s,border-color .3s,transform .35s cubic-bezier(.2,.8,.2,1)}
.o.gl:hover,.gl.glow{border-color:rgba(96,165,250,.7);box-shadow:0 22px 44px -12px rgba(0,0,0,.7),0 0 0 1px rgba(96,165,250,.5),0 0 34px rgba(59,130,246,.35)}
.gl.glow{animation:pulse 1.2s ease-in-out infinite alternate}
@keyframes pulse{to{box-shadow:0 22px 44px -12px rgba(0,0,0,.7),0 0 0 1px rgba(96,165,250,.8),0 0 46px rgba(56,189,248,.55)}}
.tbar{display:flex;align-items:center;gap:7px;padding:9px 13px;border-bottom:1px solid var(--line);font-size:12px;font-weight:600;color:var(--mut)}
.tbar i{width:8px;height:8px;border-radius:50%;background:rgba(157,176,211,.35)}
.tbar b{color:var(--ink);font-weight:700}
.tbar .sp{margin-left:auto;font:600 10px Inter;letter-spacing:.06em;color:var(--em);display:flex;align-items:center;gap:5px}
.tbar .sp:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--em);box-shadow:0 0 8px var(--em)}
.pb{padding:12px 14px}
.h4{font:700 11px Inter;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}
.kpi{background:rgba(30,58,120,.28);border:1px solid var(--line);border-radius:10px;padding:10px 11px;transition:.25s;cursor:default}
.kpi:hover,.kpi.glow{background:rgba(59,130,246,.22);border-color:rgba(96,165,250,.6)}
.kpi small{font:600 10.5px Inter;color:var(--dim);letter-spacing:.06em;text-transform:uppercase}
.kpi .v{font:700 25px 'JetBrains Mono',monospace;letter-spacing:-.02em;margin-top:2px}
.kpi .d{font:600 11px Inter;margin-top:1px}.up{color:var(--em)}.dn{color:var(--rd)}.nt{color:var(--am)}
.xd{width:100%;border-collapse:collapse;font:12px 'JetBrains Mono',monospace}
.xd th{font:700 10px Inter;letter-spacing:.07em;text-transform:uppercase;color:var(--dim);text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);background:rgba(30,58,120,.25)}
.xd td{padding:6px 8px;border-bottom:1px solid rgba(120,165,255,.09);color:#cfe0ff;transition:background .15s}
.xd td.n,.xd th.n{text-align:right}
.xd tr.tot td{font-weight:700;color:#fff;border-top:1px solid var(--line)}
.xd td.hl{background:rgba(59,130,246,.2)}.xd td.hl2{background:rgba(59,130,246,.38);color:#fff}
.pill{display:inline-block;font:700 10px Inter;letter-spacing:.05em;padding:3px 7px;border-radius:99px}
.pa{background:rgba(251,191,36,.14);color:var(--am);border:1px solid rgba(251,191,36,.35)}
.pg2{background:rgba(52,211,153,.12);color:var(--em);border:1px solid rgba(52,211,153,.35)}
.pr{background:rgba(251,113,133,.13);color:var(--rd);border:1px solid rgba(251,113,133,.35)}
.erp{display:grid;grid-template-columns:78px 1fr}
.erp .nav{border-right:1px solid var(--line);padding:9px 6px;display:flex;flex-direction:column;gap:3px}
.erp .nav span{font:600 11px Inter;color:var(--dim);padding:6px 8px;border-radius:6px}
.erp .nav span.on{background:rgba(59,130,246,.25);color:#fff}
.mini{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.mini div{background:rgba(30,58,120,.28);border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:11px;color:var(--mut)}
.mini b{display:block;font:700 15px 'JetBrains Mono';color:var(--ink);margin-top:1px}
.chat{display:flex;flex-direction:column;gap:9px}
.q{align-self:flex-end;background:linear-gradient(135deg,#2563eb,#0ea5e9);border-radius:12px 12px 3px 12px;padding:9px 12px;font-size:13px;font-weight:500;max-width:88%}
.a{background:rgba(30,58,120,.35);border:1px solid var(--line);border-radius:12px 12px 12px 3px;padding:11px 13px;font-size:12.5px;line-height:1.5;color:#d4e2ff}
.a b{color:#fff}.a ul{padding-left:16px;margin-top:5px}.a li{margin:2px 0}
.qs{display:flex;gap:6px;flex-wrap:wrap}
.qs button{font:600 11px Inter;color:var(--mut);background:rgba(30,58,120,.3);border:1px solid var(--line);border-radius:99px;padding:6px 10px;cursor:pointer;transition:.2s}
.qs button:hover{color:#fff;border-color:var(--b4)}.qs button.on{color:#fff;background:rgba(59,130,246,.35);border-color:var(--b4)}
.ai-t{display:flex;gap:5px;align-items:center;font:700 10px Inter;letter-spacing:.08em;color:var(--cy);margin-bottom:2px}
.ins{display:flex;flex-direction:column;gap:8px}
.ins li{list-style:none;display:grid;grid-template-columns:20px 1fr auto;gap:8px;align-items:start;background:rgba(30,58,120,.25);border:1px solid var(--line);border-radius:9px;padding:9px 10px;font-size:12px;line-height:1.4;color:#d4e2ff;cursor:default;transition:.2s}
.ins li:hover{background:rgba(59,130,246,.22);border-color:rgba(96,165,250,.6)}
.ins li b{color:#fff}.ins li em{font-style:normal;color:var(--dim);display:block;font-size:11px}
.ic{width:20px;height:20px;border-radius:6px;display:grid;place-items:center;font:800 11px Inter}
.srcchip{position:absolute;z-index:3;font:700 11px Inter;letter-spacing:.04em;color:#cfe0ff;background:rgba(14,30,68,.95);border:1px solid rgba(96,165,250,.45);border-radius:99px;padding:6px 12px;display:flex;gap:7px;align-items:center;box-shadow:0 0 22px rgba(59,130,246,.25)}
.srcchip:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--cy);box-shadow:0 0 8px var(--cy)}
svg.cn{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}
.cn path{fill:none;stroke:rgba(96,165,250,.55);stroke-width:1.6;stroke-dasharray:5 6;animation:flow 1.6s linear infinite}
.cn circle{fill:var(--cy);filter:drop-shadow(0 0 5px var(--cy))}
@keyframes flow{to{stroke-dashoffset:-22}}
.rec{display:flex;gap:10px;align-items:center;padding:10px 14px;font-size:12px;color:var(--mut)}
.rec b{color:var(--cy);font:700 10.5px Inter;letter-spacing:.1em;white-space:nowrap}
.rec span{background:rgba(30,58,120,.3);border:1px solid var(--line);border-radius:8px;padding:6px 10px;color:#d4e2ff;flex:1}
.bar{height:8px;border-radius:4px;background:rgba(96,165,250,.15);overflow:hidden}.bar i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,#3b82f6,#38bdf8)}
.hv{cursor:pointer}.hv:hover{filter:brightness(1.3)}
text{font-family:'JetBrains Mono',monospace}

/* divider */
.edge{position:absolute;top:0;bottom:0;left:calc(var(--p)*1% - 36px);width:72px;z-index:95;pointer-events:none;backdrop-filter:blur(2.5px);-webkit-backdrop-filter:blur(2.5px);-webkit-mask-image:linear-gradient(90deg,transparent,#000 50%,transparent);mask-image:linear-gradient(90deg,transparent,#000 50%,transparent);background:linear-gradient(90deg,transparent,rgba(56,189,248,.09),transparent)}
.dv{position:absolute;top:0;bottom:0;left:calc(var(--p)*1%);width:0;z-index:100;pointer-events:none}
.dv .ln2{position:absolute;left:-1px;top:0;bottom:0;width:2px;background:linear-gradient(#38bdf8,#60a5fa 50%,#38bdf8);box-shadow:0 0 18px 2px rgba(56,189,248,.65),0 0 2px #fff}
.hit{position:absolute;left:-30px;width:60px;top:0;bottom:0;pointer-events:auto;cursor:ew-resize;touch-action:none;outline:0}
.hnd{position:absolute;left:50%;top:50%;width:calc(54px*var(--is,1));height:calc(54px*var(--is,1));margin:calc(-27px*var(--is,1)) 0 0 calc(-27px*var(--is,1));border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#cfe3ff 55%,#8fb7f5);border:calc(3px*var(--is,1)) solid rgba(255,255,255,.9);box-shadow:0 0 0 calc(6px*var(--is,1)) rgba(56,189,248,.25),0 10px 30px rgba(0,0,0,.6),0 0 30px rgba(56,189,248,.6);display:grid;place-items:center;transition:box-shadow .2s,transform .2s;color:#1e3a8a}
.hnd svg{width:55%;height:55%}
.hit:hover .hnd,.drag .hnd{transform:scale(1.07);box-shadow:0 0 0 calc(9px*var(--is,1)) rgba(56,189,248,.3),0 10px 30px rgba(0,0,0,.6),0 0 40px rgba(56,189,248,.8)}
.hint{position:absolute;left:50%;top:calc(50% + 44px*var(--is,1));transform:translateX(-50%);white-space:nowrap;font:700 calc(11px*var(--is,1)) Inter;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:rgba(5,12,32,.85);border:1px solid rgba(56,189,248,.5);padding:calc(6px*var(--is,1)) calc(11px*var(--is,1));border-radius:99px;transition:opacity .4s;animation:nudge 2.2s ease-in-out infinite}
.moved .hint{opacity:0;animation:none}
@keyframes nudge{50%{transform:translateX(-50%) translateY(3px)}}
.cap{position:absolute;top:calc(14px*var(--is,1));z-index:96;font:800 calc(11px*var(--is,1)) Inter;letter-spacing:.14em;text-transform:uppercase;padding:calc(7px*var(--is,1)) calc(13px*var(--is,1));border-radius:99px;pointer-events:none;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:opacity .25s}
.cap.b{left:calc(16px*var(--is,1));color:var(--am);background:rgba(40,28,6,.7);border:1px solid rgba(251,191,36,.5)}
.cap.a{right:calc(16px*var(--is,1));color:var(--cy);background:rgba(5,30,50,.7);border:1px solid rgba(56,189,248,.55)}
#tip{position:fixed;z-index:999;pointer-events:none;background:rgba(5,12,32,.96);border:1px solid rgba(96,165,250,.55);border-radius:9px;padding:8px 11px;font:600 12px Inter;color:#eaf1ff;box-shadow:0 12px 30px rgba(0,0,0,.6);opacity:0;transform:translateY(4px);transition:opacity .12s,transform .12s;max-width:240px;line-height:1.45}
#tip.on{opacity:1;transform:none}#tip small{color:var(--mut);font-weight:500}
@media(max-width:700px){.seg{display:none}.sub{font-size:12px}h1{font-size:22px}.cap .f{display:none}}
.cap .s{display:none}.portrait .cap .f{display:none}.portrait .cap .s{display:inline}
.tbar{white-space:nowrap;overflow:hidden}.tbar .sp{white-space:nowrap;flex:none}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}

.portrait .np-svg{display:none}.m .gd{opacity:0;transition:opacity .15s}.m:hover .gd{opacity:1}.sl{transition:stroke-width .15s}.sl:hover{stroke-width:23}.a{animation:fi .35s ease}@keyframes fi{from{opacity:0;transform:translateY(4px)}}.portrait .kpis{grid-template-columns:repeat(2,1fr)}.portrait .kpi .v{font-size:22px}
.lgs{pointer-events:auto}
.pOnly{display:none!important}.portrait .pOnly{display:block!important}
.lgt{position:relative;width:100%;aspect-ratio:var(--ar,2.4);transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.lgt img{position:absolute;inset:0;margin:auto;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;opacity:0;transition:opacity .8s ease;user-select:none;-webkit-user-drag:none;filter:drop-shadow(0 0 1.2px rgba(255,255,255,.7)) drop-shadow(0 0 10px rgba(255,255,255,.16)) drop-shadow(0 10px 10px rgba(0,0,0,.55))}
.lgt img.on{opacity:1}
.ink img{filter:none!important;mix-blend-mode:multiply;opacity:0}.ink img.on{opacity:.88}
.lgs:hover .lgt{transform:translateY(-3px) scale(1.04)}
@media (prefers-reduced-motion:reduce){.lgt,.lgt img{transition:none}}
`

const HTML = `<div class="root"><div class="pg">
 <header class="hd" id="hd">
  <div class="eyebrow">THE RAAPNEXUS DIFFERENCE</div>
  <h1>Your Business Data. One Clearer <b>Financial Picture.</b></h1>
  <p class="sub">RaapNexus connects your existing business data with AI-powered financial analysis, auditing insights and business intelligence.</p>
  <div class="ctl">
   <div class="seg" role="group" aria-label="Jump to"><button id="bB" type="button">Without RaapNexus</button><button id="bA" type="button">Powered by RaapNexus</button></div>
   <span class="chip">Simulated sample data</span>
   <button class="rep" id="rep" type="button">&#8635; Replay transition</button>
  </div>
 </header>
 <div class="stage" id="stage"><div class="scene" id="scene"></div></div>
</div>
<div id="tip" role="tooltip"></div></div>`

function mountBeforeAfter(ROOT) {
  const $=(s,r=ROOT)=>r.querySelector(s), $$=(s,r=ROOT)=>[...r.querySelectorAll(s)];
  const ac=new AbortController(), sg={signal:ac.signal};
const stage=$('#stage'), scene=$('#scene'), hd=$('#hd'), tip=$('#tip');
const MO=['May','Jun','Jul','Aug','Sep','Oct'];
const RV=[2140,2105,2230,2290,2385,2470], EX=[1745,1701,1835,1857,1901,1938];
const OP=RV.map((v,i)=>v-EX[i]), NP=OP.map(v=>Math.round(v*.91)), MG=NP.map((v,i)=>(v/RV[i]*100).toFixed(1));
const fmtK=v=>v>=1000?(v/1000).toFixed(3).replace(/0+$/,'').replace(/\.$/,'')+'M':v+'K';
const T=(h)=>h.replace(/"/g,'&quot;');
/* object helper: landscape x,y,w,r,z  + optional portrait px,py,pw */
function O(cls,p,inner,attr=''){
  const st=`--x:${p.x}px;--y:${p.y}px;--w:${p.w}px;--r:${p.r||0}deg;--z:${p.z||1};`+(p.pw?`--px:${p.px}px;--py:${p.py}px;--pw:${p.pw}px;`:'');
  return `<div class="o ${cls}${p.pw?'':' np'}" style="${st}" ${attr}>${inner}</div>`;
}
const tipOf=(t,s)=>`data-tip="${T('<b>'+t+'</b>'+(s?'<br><small>'+s+'</small>':''))}"`;

/* ================= BEFORE ================= */
const xlw=(file,head,rows,cls='')=>`<div class="xw ${cls} sh"><div class="tb"><i></i><i></i><i></i>&nbsp;${file}</div><table><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map((c,i)=>{let k='',v=c;if(typeof c==='object'){k=c.k;v=c.v}if(/^[\d.,KM%+-]+$/.test(v)&&i)k+=' n';return `<td class="${k}">${v}</td>`}).join('')}</tr>`).join('')}</table></div>`;
let B='';
B+=O('',{x:330,y:62,w:290,r:3,z:1,px:20,py:30,pw:300},`<div class="folder sh" style="--h:170px">SUPPLIERS · 2026<div class="hw" style="color:#6b4a12;margin-top:8px;font-size:21px">unpaid → check!</div></div>`);
B+=O('',{x:60,y:104,w:250,r:-5,z:4,px:14,py:56,pw:236},`<div class="paper sh"><span class="clip"></span><span class="tag" style="top:-12px;right:-8px">Manual Verification</span><h5><span>INVOICE</span><span>#INV-10421</span></h5><div style="display:flex;justify-content:space-between;margin:8px 0 4px;font-size:11px;color:#555"><span>Cust A · 01-Oct</span><span>Net 30</span></div><div class="ln"></div><div style="display:flex;justify-content:space-between"><span>Consulting</span><b>45,790</b></div><div style="display:flex;justify-content:space-between"><span>VAT 5%</span><b>2,410</b></div><div class="ln"></div><div style="display:flex;justify-content:space-between;font-size:14px"><b>TOTAL</b><b>48,200</b></div><div class="hw hwr" style="margin-top:8px">✓ typed in 2 files</div></div>`,tipOf('Invoice INV-10421','Re-keyed into the sales sheet and the ledger by hand'));
B+=O('',{x:392,y:150,w:340,r:-3,z:3,px:170,py:160,pw:300},`<span class="tag" style="top:-13px;right:10px;z-index:9">Different File Versions</span>`+xlw('Sales_Q3_final_v2.xlsx',['Date','Customer','Amt','Tax'],[['01-Oct','Cust A','48,200','2,410'],['02-Oct','Cust B','12,950','648'],['05-Oct','Cust C','33,900','1,695'],['06-Oct','Cust D','21,400','1,070'],['Total','','2.41M','']]),tipOf('Sales_Q3_final_v2.xlsx','v2 and v3 are both in circulation. Total 2.41M vs 2.47M in the ledger.'));
B+=O('',{x:760,y:70,w:330,r:2,z:3,px:150,py:390,pw:310},`<span class="tag r" style="top:-13px;left:14px;z-index:9">Review Required</span>`+xlw('Expenses_Oct.xlsx',['Date','Vendor','Amt','Cat'],[['03-Oct','Vendor 1','8,760','Travel'],['05-Oct','Vendor 2','49,900','Supp'],['05-Oct',{k:'bad',v:'Vendor 2'},{k:'bad',v:'49,900'},{k:'bad',v:'Supp'}],['09-Oct','Vendor 4','15,320','Rent']]),tipOf('Expenses_Oct.xlsx','Manually prepared · same payment appears twice'));
B+=O('',{x:1128,y:92,w:330,r:3,z:2},xlw('ERP_ledger_export.csv',['Ref','Acct','Dr','Cr'],[['INV-10421','4000','','48,200'],['PAY-2204','2100','49,900',''],['JV-0388','2400','125,000',''],['INV-10433','4000','','21,400']],'csv'),tipOf('ERP_ledger_export.csv','Outdated export · ledger total 2.47M'));
B+=O('',{x:56,y:408,w:150,r:-3,z:5,px:340,py:24,pw:128},`<div class="sticky">Call bank re: PAY-2204</div>`);
B+=O('',{x:236,y:384,w:132,r:-8,z:4,px:20,py:340,pw:116},`<div class="receipt sh"><div><b>STATIONERY CO</b></div><div><span>Paper A4</span><span>14.50</span></div><div><span>Toner</span><span>62.00</span></div><div><span>VAT</span><span>3.83</span></div><div style="border-top:1px dashed #999;padding-top:4px"><b>TOTAL</b><b>80.33</b></div><div style="margin-top:6px;color:#888"><span>04-Oct-26</span><span>#8841</span></div></div>`,tipOf('Paper receipt','Waiting to be entered'));
B+=O('',{x:404,y:430,w:330,r:2,z:3},xlw('Tax_workings_VAT.xlsx',['Item','Rate','Base','VAT'],[['Sales','5%','1.23M','61.5K'],['Input','5%',{k:'bad',v:'0.80M'},'40.0K'],['Net','','','21.5K']]),tipOf('Tax_workings_VAT.xlsx','Input base keyed by hand · ledger shows 0.84M'));
B+=O('',{x:770,y:388,w:240,r:-2,z:4,px:20,py:740,pw:250},`<span class="tag g" style="top:-12px;right:10px;z-index:9">Pending Reconciliation</span><div class="pdf sh"><div class="tb">Bank_statement_Oct.pdf</div><div class="bd"><div class="ln"></div><div class="ln" style="width:80%"></div><div class="ln"></div><div class="ln" style="width:65%"></div><div class="ln"></div><div class="hw hwr" style="font-size:18px">49,900 ?? (2 entries)</div></div></div>`,tipOf('Bank_statement_Oct.pdf','Printed and ticked against the ledger line by line'));
B+=O('',{x:1090,y:372,w:276,r:3,z:5},`<div class="paper sh"><span class="clip"></span><h5><span>AUDIT WORKING PAPER</span><span>WP-14</span></h5><div class="ln"></div><div style="display:grid;grid-template-columns:1fr auto;gap:4px 8px;font-size:11.5px;margin-top:6px"><span>Revenue testing</span><b class="hw" style="font-size:20px">✓</b><span>Expense vouchers</span><b class="hw hwr" style="font-size:20px">?</b><span>VAT reconciliation</span><b class="hw" style="font-size:20px">…</b><span>AR confirmations</span><b class="hw" style="font-size:20px">✓</b></div><div class="hw" style="margin-top:8px">Sample 40 of 1,300 → re-check next week</div></div>`,tipOf('Audit working paper','Sampled by hand · only 40 of 1,300 entries tested'));
B+=O('',{x:1412,y:340,w:150,r:6,z:3},`<div class="paper sh" style="font-size:11px"><h5><span>PURCHASE ORDER</span></h5><div class="ln"></div><div>PO-5521 · Vendor 4</div><div style="margin-top:4px">Qty 120 · 15,320</div><div class="hw" style="margin-top:6px">approved?</div></div>`);
B+=O('',{x:46,y:626,w:430,r:-2,z:3,px:20,py:920,pw:440},`<div class="ledger sh"><div class="pgx"><div class="hw"><span>Cust A</span><span>48,200</span></div><div class="hw"><span>Cust B</span><span>12,950</span></div><div class="hw"><span>Cust C</span><span>33,900</span></div><div class="hw hwr"><span>diff?</span><span>60,000</span></div><div class="hw"><span>Cash</span><span>320,000</span></div></div><div class="pgx"><div class="hw"><span>Vendor 1</span><span>8,760</span></div><div class="hw hwr"><span>Vendor 2</span><span>49,900 ×2</span></div><div class="hw"><span>Rent</span><span>15,320</span></div><div class="hw"><span>VAT</span><span>21.5K?</span></div><div class="hw"><span>Total</span><span>…</span></div></div></div>`,tipOf('Ledger book','Handwritten · totals recalculated each month'));
B+=O('',{x:508,y:690,w:154,r:6,z:5,px:310,py:750,pw:150},`<div class="calc sh"><div class="dp">48,200.00</div><div class="ks">${'<i></i>'.repeat(10)}<i class="o2"></i><i class="o2"></i><i class="o2"></i><i class="o2"></i></div></div>`);
B+=O('',{x:716,y:650,w:332,r:-2,z:3,px:20,py:590,pw:300},xlw('Receivables_ageing.xlsx',['Cust','0-30','31-60','60+'],[['A','320K','120K','40K'],['B','210K','90K',{k:'rd',v:'30K'}],['C','95K','—','12K']]),tipOf('Receivables_ageing.xlsx','Updated by hand last Friday'));
B+=O('',{x:1070,y:690,w:150,r:5,z:5,px:340,py:600,pw:128},`<div class="sticky p" style="font-size:22px">Report needed by Friday!!</div>`);
B+=O('',{x:1268,y:620,w:262,r:3,z:2},`<span class="tag" style="top:-12px;left:12px;z-index:9">Report Preparation</span><div class="pdf docx sh"><div class="tb" style="background:#2b579a">Management_report_DRAFT.docx</div><div class="bd"><div class="ln"></div><div class="ln" style="width:85%"></div><div class="ln"></div><div class="ln" style="width:70%"></div><div class="hw hwr" style="font-size:18px;margin-top:6px">[figures TBC] [chart?]</div></div></div>`,tipOf('Management_report_DRAFT.docx','Missing figures · waiting on 3 files'));
B+=`<div class="tag np" style="left:560px;top:22px;z-index:8;transform:rotate(-1deg)">Data from Multiple Sources</div>`;
B+=`<div class="neq np" style="left:640px;top:352px;transform:rotate(-4deg)">Sales 2.41M ≠ Ledger 2.47M</div>`;
B+=`<div class="neq np" style="left:1020px;top:296px;transform:rotate(3deg)">49,900 paid twice?</div>`;
B+=`<div class="circ np" style="left:1108px;top:526px;width:90px;height:34px"></div>`;
B+=O('',{x:640,y:818,w:220,r:-12,z:2},`<div class="pen"></div>`);

/* ERP logos (Before layer only): bare logos, some printed on the paper props, some floating. Cycles slowly. */
const LGF={"odoo": "odoo-wordmark.svg", "sap": "sap.svg", "oracle": "oracle.svg", "dynamics": "dynamics-365.svg", "zoho": "zoho.svg", "quickbooks": "quickbooks.svg", "tally": "tally.png", "sage": "sage.svg"}, LGN={"odoo": "Odoo", "sap": "SAP", "oracle": "Oracle", "dynamics": "Microsoft Dynamics 365", "zoho": "Zoho", "quickbooks": "QuickBooks", "tally": "Tally", "sage": "Sage"}, LSL=[{"x": 52, "y": 540, "w": 150, "r": -2, "ar": 2.4, "px": 36, "py": 544, "pw": 104}, {"x": 72, "y": 762, "w": 160, "r": -1, "ar": 2.6, "cls": "ink"}, {"x": 508, "y": 68, "w": 118, "r": -1.5, "ar": 2.7, "cls": "ink"}, {"x": 0, "y": 0, "w": 10, "r": 0, "ar": 2.4, "px": 310, "py": 544, "pw": 104, "cls": "pOnly"}, {"x": 0, "y": 0, "w": 10, "r": 0, "ar": 2.4, "px": 170, "py": 1076, "pw": 140, "cls": "pOnly"}, {"x": 1290, "y": 8, "w": 200, "r": 2, "ar": 2.4}, {"x": 1318, "y": 772, "w": 170, "r": -1, "ar": 2.2}], LSETS=[["sap", "tally", "odoo", "dynamics", "zoho", "zoho", "dynamics"], ["zoho", "tally", "odoo", "quickbooks", "oracle", "sage", "oracle"], ["oracle", "tally", "odoo", "sap", "dynamics", "quickbooks", "sage"]];
LSL.forEach((s,i)=>{
  const used=[...new Set(LSETS.map(x=>x[i]))];
  B+=O('lgs '+(s.cls||''),{x:s.x,y:s.y,w:s.w,r:s.r,z:6,px:s.px,py:s.py,pw:s.pw},`<div class="lgt" style="--ar:${s.ar||2.4}">${used.map(k=>`<img data-l="${k}" src="/assets/erp/${LGF[k]}" alt="${LGN[k]} logo" draggable="false">`).join('')}</div>`);
});
let LT=0;
const setLogoSet=i=>{$$('.lgs').forEach((el,si)=>$$('img',el).forEach(im=>im.classList.toggle('on',im.dataset.l===LSETS[i][si])))};

/* ================= AFTER ================= */
let A='';
A+=`<svg class="cn np-svg" viewBox="0 0 1600 880" preserveAspectRatio="none"><path d="M440 250H470"/><path d="M440 520H470"/><path d="M1120 240H1150"/><path d="M1120 470H1150"/><path d="M575 52V78"/><path d="M725 52V78"/><path d="M875 52V78"/><path d="M1025 52V78"/><circle cx="455" cy="250" r="3.5"/><circle cx="455" cy="520" r="3.5"/><circle cx="1135" cy="240" r="3.5"/><circle cx="575" cy="65" r="3.5"/><circle cx="725" cy="65" r="3.5"/><circle cx="875" cy="65" r="3.5"/><circle cx="1025" cy="65" r="3.5"/></svg>`;
[['ERP',520],['Excel files',672],['Bank feeds',826],['Tax records',970]].forEach(([n,x])=>A+=`<div class="srcchip np" style="left:${x}px;top:24px">${n}</div>`);
/* chart */
const cx=i=>44+i*108.8, cy=v=>12+(2600-v)/1000*160;
const pts=a=>a.map((v,i)=>`${cx(i).toFixed(1)},${cy(v).toFixed(1)}`).join(' ');
const chart=`<svg viewBox="0 0 600 200" width="100%" style="display:block;overflow:visible"><defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3b82f6" stop-opacity=".45"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/></linearGradient></defs>
${[1800,2100,2400].map(v=>`<line x1="44" x2="588" y1="${cy(v)}" y2="${cy(v)}" stroke="rgba(120,165,255,.13)"/><text x="38" y="${cy(v)+3}" font-size="10" fill="#6b7fa6" text-anchor="end">${(v/1000).toFixed(1)}M</text>`).join('')}
<polygon points="${cx(0)},${cy(1600)} ${pts(RV)} ${cx(5)},${cy(1600)}" fill="url(#ga)"/>
<polyline points="${pts(RV)}" fill="none" stroke="#60a5fa" stroke-width="2.6" stroke-linejoin="round"/><polyline points="${pts(EX)}" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linejoin="round"/>
${MO.map((m,i)=>`<text x="${cx(i)}" y="194" font-size="10.5" fill="#6b7fa6" text-anchor="middle">${m}</text>`).join('')}
${MO.map((m,i)=>`<g class="m" ${tipOf(m+' 2026','Revenue <b>'+fmtK(RV[i])+'</b> · Expenses <b>'+fmtK(EX[i])+'</b><br>Net profit <b>'+NP[i]+'K</b> · margin <b>'+MG[i]+'%</b>')}><rect x="${cx(i)-54}" y="0" width="108.8" height="180" fill="transparent"/><line class="gd" x1="${cx(i)}" x2="${cx(i)}" y1="6" y2="172" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 3"/><circle class="gd" cx="${cx(i)}" cy="${cy(RV[i])}" r="4.5" fill="#60a5fa" stroke="#fff" stroke-width="1.5"/><circle class="gd" cx="${cx(i)}" cy="${cy(EX[i])}" r="4.5" fill="#fbbf24" stroke="#fff" stroke-width="1.5"/></g>`).join('')}</svg>`;
A+=O('gl',{x:470,y:78,w:650,z:3,px:20,py:64,pw:440},
`<div class="tbar"><i></i><i></i><i></i>&nbsp;<b>RaapNexus</b> · Financial Intelligence · Oct 2026<span class="sp">LIVE · 4 SOURCES</span></div><div class="pb">
<div class="kpis"><div class="kpi" id="kRev" ${tipOf('Revenue · Oct','Up 3.6% on September (2.385M)')}><small>Revenue</small><div class="v">2.47M</div><div class="d up">▲ 3.6%</div></div>
<div class="kpi" id="kExp" ${tipOf('Expenses · Oct','Up 2.0% on September (1.901M)')}><small>Expenses</small><div class="v">1.94M</div><div class="d nt">▲ 2.0%</div></div>
<div class="kpi" id="kNet" ${tipOf('Net profit · Oct','After tax and other items · 19.6% margin')}><small>Net profit</small><div class="v">484K</div><div class="d up">▲ 10.0% · 19.6%</div></div>
<div class="kpi" id="kCash" ${tipOf('Cash flow · Oct','Net cash movement for the month')}><small>Cash flow</small><div class="v">+320K</div><div class="d up">▲ healthy</div></div></div>
<div class="h4" style="margin:12px 0 4px"><span>Revenue vs expenses · 6 months</span><span><i style="display:inline-block;width:14px;height:3px;background:#60a5fa;vertical-align:middle;margin-right:4px"></i>Revenue <i style="display:inline-block;width:14px;height:3px;background:#fbbf24;vertical-align:middle;margin:0 4px 0 10px"></i>Expenses</span></div>${chart}
<div class="mini" style="grid-template-columns:repeat(3,1fr);margin-top:6px"><div>Receivables<b>2.05M</b></div><div>Payables<b>1.32M</b></div><div id="kVat">VAT payable<b>21.5K</b></div></div></div>`);
/* ERP */
A+=O('gl',{x:40,y:78,w:400,z:2},`<div class="tbar"><i></i><i></i><i></i>&nbsp;<b>Your ERP</b> · Ledger<span class="sp">READ-ONLY SYNC</span></div><div class="erp"><div class="nav"><span>Sales</span><span>Purchase</span><span class="on">Ledger</span><span>Stock</span></div><div class="pb" style="padding:10px"><table class="xd xl"><tr><th>Ref</th><th>Account</th><th class="n">Dr</th><th class="n">Cr</th></tr><tr><td>INV-10421</td><td>Sales</td><td class="n"></td><td class="n">48,200</td></tr><tr><td>PAY-2204</td><td>Payables</td><td class="n">49,900</td><td class="n"></td></tr><tr><td>JV-0388</td><td>VAT</td><td class="n">125,000</td><td class="n"></td></tr><tr><td>INV-10433</td><td>Sales</td><td class="n"></td><td class="n">21,400</td></tr></table>
<div class="mini"><div>Customers · 412<b>AR 2.05M</b></div><div>Suppliers · 138<b>AP 1.32M</b></div></div></div></div>`);
/* Excel structured */
const xr=MO.map((m,i)=>`<tr><td>${m}</td><td class="n">${RV[i].toLocaleString('en-US')}</td><td class="n">${EX[i].toLocaleString('en-US')}</td><td class="n">${NP[i]}</td><td class="n">${MG[i]}%</td></tr>`).join('');
const sum=a=>a.reduce((x,y)=>x+y,0);
A+=O('gl',{x:40,y:462,w:400,z:2},`<div class="tbar"><i></i><i></i><i></i>&nbsp;<b>Financial_Summary.xlsx</b><span class="sp">1 VERSION</span></div><div class="pb" style="padding:10px"><table class="xd xl"><tr><th>Period</th><th class="n">Revenue K</th><th class="n">Expenses K</th><th class="n">Net K</th><th class="n">Margin</th></tr>${xr}<tr class="tot"><td>6M</td><td class="n">${sum(RV).toLocaleString('en-US')}</td><td class="n">${sum(EX).toLocaleString('en-US')}</td><td class="n">${sum(NP)}</td><td class="n">${(sum(NP)/sum(RV)*100).toFixed(1)}%</td></tr></table></div>`);
/* donut */
const CAT=[['Payroll',736,'#3b82f6'],['Purchases',562,'#38bdf8'],['Rent & utilities',213,'#34d399'],['Marketing',155,'#fbbf24'],['Logistics',136,'#a78bfa'],['Other',136,'#64748b']];
let off=0;const C=2*Math.PI*48;
const arcs=CAT.map(([n,v,c])=>{const L=v/1938*C;const s=`<circle class="sl hv" cx="60" cy="60" r="48" fill="none" stroke="${c}" stroke-width="18" stroke-dasharray="${(L-1.5).toFixed(2)} ${(C-L+1.5).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 60 60)" data-n="${n}" data-v="${v}" data-p="${(v/1938*100).toFixed(0)}" ${tipOf(n,v+'K · '+(v/1938*100).toFixed(0)+'% of expenses')}/>`;off+=L;return s}).join('');
A+=O('gl',{x:470,y:556,w:310,z:2,px:20,py:548,pw:212},`<div class="pb"><div class="h4"><span>Expenses · Oct</span></div><div style="display:flex;gap:12px;align-items:center"><svg viewBox="0 0 120 120" width="108" height="108" style="flex:none">${arcs}<text id="dN" x="60" y="57" text-anchor="middle" font-size="9" fill="#9db0d3">Total</text><text id="dV" x="60" y="72" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">1.94M</text></svg><div style="font-size:11px;line-height:1.75;color:#cfe0ff;min-width:0">${CAT.slice(0,4).map(([n,v,c])=>`<div style="white-space:nowrap"><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${c};margin-right:6px"></i>${n.split(' ')[0]} <b>${(v/1938*100).toFixed(0)}%</b></div>`).join('')}</div></div></div>`);
/* profitability bars */
A+=O('gl',{x:810,y:556,w:310,z:2,px:248,py:548,pw:212},`<div class="pb"><div class="h4"><span>Net profit &amp; margin</span></div><svg viewBox="0 0 280 118" width="100%" style="display:block;overflow:visible">${NP.map((v,i)=>{const h=v/484*78,x=8+i*45;return `<g ${tipOf(MO[i]+' 2026','Net profit <b>'+v+'K</b><br>Margin <b>'+MG[i]+'%</b>')}><rect class="hv" x="${x}" y="${96-h}" width="32" height="${h}" rx="4" fill="${i===5?'#38bdf8':'#3b82f6'}" opacity="${i===5?1:.7}"/><text x="${x+16}" y="${90-h}" font-size="9.5" text-anchor="middle" fill="#cfe0ff">${v}</text><text x="${x+16}" y="112" font-size="9.5" text-anchor="middle" fill="#6b7fa6">${MO[i]}</text></g>`}).join('')}</svg><div style="display:flex;justify-content:space-between;font-size:11px;color:#9db0d3;margin-top:4px"><span>Margin May → Oct</span><b style="color:#34d399">16.8% → 19.6%</b></div></div>`);
/* AI */
A+=O('gl',{x:1150,y:78,w:410,z:3,px:20,py:790,pw:440},`<div class="tbar"><i></i><i></i><i></i>&nbsp;<b>AI Agent</b> · Ask your numbers<span class="sp">READY</span></div><div class="pb"><div class="chat"><div class="qs" id="qs"></div><div class="q" id="aq"></div><div class="a" id="aa"></div></div></div>`);
/* audit + tax insights */
A+=O('gl',{x:1150,y:478,w:410,z:2},`<div class="tbar"><i></i><i></i><i></i>&nbsp;<b>Audit &amp; tax observations</b><span class="sp" style="color:var(--am)">3 TO REVIEW</span></div><div class="pb"><ul class="ins">
<li data-hl="#kExp"><span class="ic pr">!</span><span><b>Possible duplicate payment</b><em>Vendor 2 · 49,900 · 05-Oct · 2 entries</em></span><span class="pill pr">Review</span></li>
<li data-hl="#kVat"><span class="ic pa">%</span><span><b>VAT input base differs</b><em>Workings 0.80M vs ledger 0.84M · VAT may be understated by 2.0K</em></span><span class="pill pa">Check</span></li>
<li data-hl="#kRev"><span class="ic pg2">↗</span><span><b>Receivables over 60 days: 82K</b><em>Follow up Cust A (40K) and Cust B (30K)</em></span><span class="pill pg2">Action</span></li></ul></div>`);
A+=O('gl',{x:40,y:808,w:1080,z:2},`<div class="rec"><b>RECOMMENDED</b><span>Review the duplicate Vendor 2 payment before month-end close</span><span>Align the VAT input base with the ledger figure</span><span>Send reminders for balances over 60 days</span></div>`);

/* ================= mount ================= */
scene.innerHTML=`<div class="layer before" id="Lb">${B}</div><div class="layer after" id="La">${A}</div><div class="edge"></div><div class="cap b"><span class="f">Without RaapNexus</span><span class="s">Before</span></div><div class="cap a"><span class="f">Powered by RaapNexus</span><span class="s">After</span></div><div class="dv"><div class="ln2"></div><div class="hit" id="hit"><div class="hnd" id="hnd" role="slider" tabindex="0" aria-label="Compare before and after" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg></div><div class="hint">Drag to compare</div></div></div>`;

/* ================= layout / scale ================= */
let portrait=false;
function layout(){
  const hostW=ROOT.host.clientWidth||innerWidth, vh=innerHeight;
  const availW=hostW-32, availH=Math.max(vh-hd.offsetHeight-64-20-14,420);
  portrait=availW/availH<0.95||hostW<700;
  const SW=portrait?480:1600, SH=portrait?1140:880;
  const s=portrait?Math.min(availW/SW,1.25):Math.min(availW/SW,availH/SH,1.3);
  stage.style.width=SW*s+'px';stage.style.height=SH*s+'px';
  scene.style.width=SW+'px';scene.style.height=SH+'px';scene.style.transform=`scale(${s})`;
  scene.style.setProperty('--is',(1/s).toFixed(4));
  scene.classList.toggle('portrait',portrait);
}
layout();addEventListener('resize',layout,sg);const lro=new ResizeObserver(layout);lro.observe(ROOT.host);if(document.fonts)document.fonts.ready.then(layout);

/* ================= slider ================= */
let P=50,anim=0;
function setP(v,fromUser){
  P=Math.max(0,Math.min(100,v));scene.style.setProperty('--p',P);
  $('#hnd').setAttribute('aria-valuenow',Math.round(P));
  $('#bB').classList.toggle('on',P>=88);$('#bA').classList.toggle('on',P<=12);
  $('.cap.b').style.opacity=P<9?0:1;$('.cap.a').style.opacity=P>91?0:1;
  if(fromUser)stage.classList.add('moved');
}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function to(target,dur=900,done){
  cancelAnimationFrame(anim);const from=P;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){setP(target,true);done&&done();return}
  const t0=performance.now();
  (function f(n){const k=Math.min((n-t0)/dur,1);setP(from+(target-from)*ease(k),true);if(k<1)anim=requestAnimationFrame(f);else done&&done()})(t0);
}
const hit=$('#hit');let dragging=false;
const fromEvt=e=>{const r=scene.getBoundingClientRect();return (e.clientX-r.left)/r.width*100};
hit.addEventListener('pointerdown',e=>{cancelAnimationFrame(anim);dragging=true;hit.setPointerCapture(e.pointerId);scene.classList.add('drag');setP(fromEvt(e),true);e.preventDefault()});
hit.addEventListener('pointermove',e=>{if(dragging)setP(fromEvt(e),true)});
const end=()=>{dragging=false;scene.classList.remove('drag')};
hit.addEventListener('pointerup',end);hit.addEventListener('pointercancel',end);
$('#hnd').addEventListener('keydown',e=>{const k={ArrowLeft:-3,ArrowDown:-3,ArrowRight:3,ArrowUp:3,PageDown:-10,PageUp:10}[e.key];if(k){setP(P+k,true);e.preventDefault()}else if(e.key==='Home'){setP(0,true);e.preventDefault()}else if(e.key==='End'){setP(100,true);e.preventDefault()}});
$('#bB').onclick=()=>to(100,900);$('#bA').onclick=()=>to(0,900);
$('#rep').onclick=()=>{setP(100,true);setTimeout(()=>to(0,3400,()=>to(50,900)),250)};
setP(50);

/* ================= interactions ================= */
$('.root').addEventListener('mouseover',e=>{
  const t=e.target.closest('[data-tip]');
  if(t){tip.innerHTML=t.dataset.tip;tip.classList.add('on');place(e)}else tip.classList.remove('on');
  const td=e.target.closest('.xl td');
  if(td){const tb=td.closest('table'),tr=td.parentElement,ci=[...tr.children].indexOf(td);
    $$('td',tb).forEach(c=>c.classList.remove('hl','hl2'));
    $$('tr',tb).forEach(r=>{const c=r.children[ci];if(c&&c.tagName==='TD')c.classList.add('hl')});
    $$('td',tr).forEach(c=>c.classList.add('hl'));td.classList.add('hl2')}
  const sl=e.target.closest('.sl');
  if(sl){$('#dN').textContent=sl.dataset.n;$('#dV').textContent=sl.dataset.v+'K'}
  const li=e.target.closest('[data-hl]');
  if(li)$$(li.dataset.hl).forEach(x=>x.classList.add('glow'));
});
$('.root').addEventListener('mouseout',e=>{
  const rt=e.relatedTarget&&e.relatedTarget.closest?e.relatedTarget:null;
  const li=e.target.closest('[data-hl]');if(li)$$(li.dataset.hl).forEach(x=>x.classList.remove('glow'));
  const sl=e.target.closest('.sl');if(sl&&!(rt&&rt.closest('.sl'))){$('#dN').textContent='Total';$('#dV').textContent='1.94M'}
  const xt=e.target.closest('.xl');if(xt&&!(rt&&rt.closest('.xl')===xt))$$('td',xt).forEach(c=>c.classList.remove('hl','hl2'));
  if(e.target.closest('[data-tip]')&&!(rt&&rt.closest('[data-tip]')))tip.classList.remove('on');
});
$('.root').addEventListener('mousemove',e=>{if(tip.classList.contains('on'))place(e)});
function place(e){const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+16,y=e.clientY+16;if(x+w>innerWidth-8)x=e.clientX-w-16;if(y+h>innerHeight-8)y=e.clientY-h-16;tip.style.left=x+'px';tip.style.top=y+'px'}

/* AI agent */
const QA=[
 ['Why did net profit rise in October?','Net profit rose to <b>484K</b> (+10.0% from 440K). Revenue grew <b>3.6%</b> (2.385M → 2.47M) while expenses grew only <b>2.0%</b> (1.901M → 1.938M), lifting margin from 18.4% to <b>19.6%</b>.<ul><li>Operating profit: 532K</li><li>Net profit after tax and other items: 484K</li></ul>'],
 ['Which invoices are overdue?','Among the top three customers, <b>292K</b> is more than 30 days old: 210K at 31–60 days and <b>82K</b> over 60 days.<ul><li>Cust A: 160K past 30 days (largest)</li><li>Cust B: 120K · Cust C: 12K</li></ul>Total receivables: <b>2.05M</b>.'],
 ['Summarise October for management','<b>October 2026</b><ul><li>Revenue 2.47M (+3.6%), expenses 1.94M (+2.0%)</li><li>Net profit 484K · margin 19.6% · cash flow +320K</li><li>2 items for review: duplicate Vendor 2 payment (49,900) and VAT input base (2.0K)</li></ul>']];
const qs=$('#qs');
qs.innerHTML=QA.map((q,i)=>`<button type="button" data-i="${i}">${['Why did profit rise?','Overdue invoices','October summary'][i]}</button>`).join('');
function ask(i){$$('button',qs).forEach((b,j)=>b.classList.toggle('on',j===i));$('#aq').textContent=QA[i][0];const a=$('#aa');a.style.animation='none';a.offsetWidth;a.style.animation='';a.innerHTML='<div class="ai-t">✦ ANSWER</div>'+QA[i][1]}
qs.addEventListener('click',e=>{const b=e.target.closest('button');if(b)ask(+b.dataset.i)});
ask(0);
setLogoSet(0);
if(!matchMedia('(prefers-reduced-motion:reduce)').matches){let lc=0;LT=setInterval(()=>{if(document.hidden||ROOT.host.matches(':hover'))return;lc=(lc+1)%LSETS.length;setLogoSet(lc)},6500)}
return()=>{clearInterval(LT);ac.abort();lro.disconnect();cancelAnimationFrame(anim)};
}

export default function BeforeAfter() {
  const host = useRef(null)
  useEffect(() => {
    const el = host.current
    if (!el) return
    // handwriting font used by the paper notes (Inter / JetBrains Mono are already loaded by the site)
    if (!document.getElementById('ba-caveat-font')) {
      const l = document.createElement('link')
      l.id = 'ba-caveat-font'; l.rel = 'stylesheet'
      l.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap'
      document.head.appendChild(l)
    }
    const root = el.shadowRoot ?? el.attachShadow({ mode: 'open' })
    root.innerHTML = `<style>${CSS}</style>${HTML}`
    return mountBeforeAfter(root)
  }, [])
  return <div ref={host} id="before-after" />
}
