// ==UserScript==
// @name         개드립 Plus+ (Userscript)
// @namespace    https://github.com/z3ro2201/dogdrip-plus-mobilejs
// @version      1.1.13
// @description  개드립(dogdrip.net) 사용자차단 / 개드립콘차단 / 키워드차단 / 메모등록 / 설정 백업·복구 (모바일 지원)
// @author       z3ro2201
// @match        *://*.dogdrip.net/*
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @run-at       document-idle
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/dogdrip-plus.user.js
// @downloadURL  https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/dogdrip-plus.user.js
// ==/UserScript==

"use strict";(()=>{var se="ddplus_";function fe(t){if(t!=null){if(typeof t=="string")try{return JSON.parse(t)}catch{return t}return t}}function xe(t){return typeof t=="string"?t:JSON.stringify(t)}var de=typeof GM<"u"&&typeof GM.getValue=="function"?{async get(t){try{return fe(await GM.getValue(t,null))}catch(o){console.warn("[\uAC1C\uB4DC\uB9BDPlus] GM.getValue \uC624\uB958:",t,o);return}},async set(t,o){try{await GM.setValue(t,xe(o))}catch(r){console.warn("[\uAC1C\uB4DC\uB9BDPlus] GM.setValue \uC624\uB958:",t,r)}},async remove(t){try{await GM.deleteValue(t)}catch{}}}:(console.warn("[\uAC1C\uB4DC\uB9BDPlus] GM API \uC5C6\uC74C \u2192 localStorage \uD3F4\uBC31"),{async get(t){try{return fe(localStorage.getItem(se+t))}catch{return}},async set(t,o){try{localStorage.setItem(se+t,xe(o))}catch{}},async remove(t){try{localStorage.removeItem(se+t)}catch{}}}),oe=class{async get(o){let r=Array.isArray(o)?o:[o],n={};return await Promise.all(r.map(async f=>{let i=await de.get(f);i!==void 0&&(n[f]=i)})),n}async set(o){await Promise.all(Object.entries(o).map(([r,n])=>de.set(r,n)))}async remove(o){await de.remove(o)}};function ze(){let t=document.querySelector('[class*="rhymix_content"][class*="xe_content"]');return t?Array.from(t.querySelectorAll("img")).filter(o=>{if(o.classList.contains("dogcon-clickable")||o.hasAttribute("data-dogcon-srl")||o.hasAttribute("data-dogcon-file-srl")||o.naturalWidth>0&&o.naturalWidth<=32||o.width>0&&o.width<=32)return!1;let r=o.getAttribute("src")||o.src;return!(!r||r.startsWith("data:"))}).map(o=>{let r=new URL(o.getAttribute("src")||o.src,location.origin).href,n=decodeURIComponent(r.split("/").pop()?.split("?")[0]||r);return{src:r,filename:n}}):[]}var $=0,j=[],T=null,ge=!1;function he(){let t=document.querySelector('[class*="rhymix_content"][class*="xe_content"]');if(!t)return;let o=Array.from(t.querySelectorAll("img")).filter(r=>{if(r.classList.contains("dogcon-clickable")||r.hasAttribute("data-dogcon-srl")||r.hasAttribute("data-dogcon-file-srl")||r.naturalWidth>0&&r.naturalWidth<=32||r.width>0&&r.width<=32)return!1;let n=r.getAttribute("src")||r.src;return!(!n||n.startsWith("data:"))});o.length&&o.forEach((r,n)=>{r.dataset.extGalleryBound||(r.dataset.extGalleryBound="true",r.style.cursor="zoom-in",r.addEventListener("click",f=>{f.preventDefault(),f.stopPropagation();let i=ze();Oe(i,n)}))})}function Oe(t,o){t.length&&(j=t,$=o,T||(T=Re(),document.body.appendChild(T)),ge||(Ge(),ge=!0),Pe(),T.style.display="flex",document.body.style.overflow="hidden",ye())}function ce(){T&&(T.style.display="none"),document.body.style.overflow=""}function Z(t){$=(t+j.length)%j.length,ye()}function ye(){if(!T)return;let t=j[$];T.querySelector("#ext-gallery-main-img").src=t.src,T.querySelector("#ext-gallery-filename").textContent=t.filename,T.querySelector("#ext-gallery-counter").textContent=`${$+1} / ${j.length}`,T.querySelectorAll(".ext-gallery-thumb").forEach((f,i)=>{f.classList.toggle("active",i===$),i===$&&f.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"})});let o=T.querySelector("#ext-gallery-prev"),r=T.querySelector("#ext-gallery-next"),n=j.length<=1;o.style.visibility=n?"hidden":"visible",r.style.visibility=n?"hidden":"visible"}function Pe(){if(!T)return;let t=T.querySelector("#ext-gallery-strip");t.innerHTML="",j.forEach((o,r)=>{let n=document.createElement("img");n.src=o.src,n.className="ext-gallery-thumb",n.alt=o.filename,n.title=o.filename,n.addEventListener("click",()=>Z(r)),t.appendChild(n)})}function Re(){if(!document.getElementById("ext-gallery-style")){let o=document.createElement("style");o.id="ext-gallery-style",o.textContent=`
      #ext-gallery-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.90);
        z-index: 1000010;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
      }
      #ext-gallery-modal {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 920px;
        max-height: 90vh;
        background: #111827;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 24px 80px rgba(0,0,0,0.6);
      }
      #ext-gallery-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        background: #0f172a;
        border-bottom: 1px solid #1e293b;
        min-height: 44px;
        flex-shrink: 0;
      }
      #ext-gallery-filename {
        flex: 1;
        font-size: 12px;
        color: #94a3b8;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #ext-gallery-counter {
        font-size: 12px;
        color: #475569;
        white-space: nowrap;
        flex-shrink: 0;
      }
      #ext-gallery-download {
        background: none;
        border: 1px solid #334155;
        color: #94a3b8;
        font-size: 12px;
        padding: 3px 10px;
        border-radius: 5px;
        cursor: pointer;
        white-space: nowrap;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
      }
      #ext-gallery-download:hover { background: #1e293b; color: #e2e8f0; }
      #ext-gallery-close {
        background: none;
        border: none;
        color: #64748b;
        font-size: 20px;
        cursor: pointer;
        padding: 2px 6px;
        line-height: 1;
        border-radius: 6px;
        flex-shrink: 0;
        transition: background 0.15s, color 0.15s;
      }
      #ext-gallery-close:hover { background: #1e293b; color: #f1f5f9; }
      #ext-gallery-main-wrap {
        display: flex;
        align-items: stretch;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      #ext-gallery-prev, #ext-gallery-next {
        flex-shrink: 0;
        width: 48px;
        background: rgba(255,255,255,0.03);
        border: none;
        color: #475569;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, color 0.15s;
      }
      #ext-gallery-prev:hover, #ext-gallery-next:hover {
        background: rgba(255,255,255,0.08);
        color: #e2e8f0;
      }
      #ext-gallery-img-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px 0;
        overflow: hidden;
      }
      #ext-gallery-main-img {
        max-width: 100%;
        max-height: calc(90vh - 160px);
        object-fit: contain;
        border-radius: 4px;
        display: block;
        user-select: none;
      }
      #ext-gallery-strip-wrap {
        flex-shrink: 0;
        background: #0f172a;
        border-top: 1px solid #1e293b;
        padding: 8px 12px;
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: #334155 transparent;
      }
      #ext-gallery-strip {
        display: flex;
        gap: 6px;
        width: max-content;
        align-items: center;
      }
      .ext-gallery-thumb {
        width: 52px;
        height: 52px;
        flex-shrink: 0;
        object-fit: cover;
        border-radius: 6px;
        cursor: pointer;
        border: 2px solid transparent;
        opacity: 0.45;
        transition: opacity 0.15s, border-color 0.15s, transform 0.1s;
      }
      .ext-gallery-thumb:hover { opacity: 0.8; transform: scale(1.06); }
      .ext-gallery-thumb.active {
        border-color: #3b82f6;
        opacity: 1;
        transform: scale(1.08);
      }
    `,(document.head||document.documentElement).appendChild(o)}let t=document.createElement("div");return t.id="ext-gallery-overlay",t.innerHTML=`
    <div id="ext-gallery-modal">
      <div id="ext-gallery-header">
        <span id="ext-gallery-filename"></span>
        <span id="ext-gallery-counter"></span>
        <a id="ext-gallery-download" href="#" download target="_blank">
          <i class="fas fa-download"></i> \uC800\uC7A5
        </a>
        <button id="ext-gallery-close">\u2715</button>
      </div>
      <div id="ext-gallery-main-wrap">
        <button id="ext-gallery-prev"><i class="fas fa-chevron-left"></i></button>
        <div id="ext-gallery-img-wrap">
          <img id="ext-gallery-main-img" src="" alt="" draggable="false" />
        </div>
        <button id="ext-gallery-next"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div id="ext-gallery-strip-wrap">
        <div id="ext-gallery-strip"></div>
      </div>
    </div>
  `,t}function Ge(){if(!T)return;T.querySelector("#ext-gallery-close").addEventListener("click",ce),T.querySelector("#ext-gallery-prev").addEventListener("click",()=>Z($-1)),T.querySelector("#ext-gallery-next").addEventListener("click",()=>Z($+1));let t=T.querySelector("#ext-gallery-download");T.querySelector("#ext-gallery-main-img").addEventListener("load",()=>{let o=j[$];o&&(t.href=o.src,t.download=o.filename)}),T.addEventListener("click",o=>{o.target===T&&ce()}),document.addEventListener("keydown",o=>{if(!(!T||T.style.display==="none"))switch(o.key){case"ArrowLeft":Z($-1);break;case"ArrowRight":Z($+1);break;case"Escape":case"Esc":ce();break}})}function ve(){if(document.getElementById("ext-mobile-style"))return;let t=document.createElement("style");t.id="ext-mobile-style",t.textContent=`
    /* \u2500\u2500 \uB85C\uB529 \uC624\uBC84\uB808\uC774 \u2500\u2500 */
    #ext-loading-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(46,67,97,0.12); z-index: 999999;
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      transition: opacity 0.2s ease-out; font-family: sans-serif;
    }
    .ext-spinner {
      width: 36px; height: 36px;
      border: 4px solid rgba(255,255,255,0.25); border-top: 4px solid #3b82f6;
      border-radius: 50%; animation: extSpin 0.9s linear infinite; margin-bottom: 12px;
    }
    @keyframes extSpin { to { transform: rotate(360deg); } }
    .ext-loading-text { font-size: 13px; color: #334155; }

    /* \u2500\u2500 \uACF5\uD1B5 \uBAA8\uB2EC \u2500\u2500 */
    .ext-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.45); display: none;
      align-items: center; justify-content: center; z-index: 1000001; font-family: sans-serif;
    }
    .ext-modal-overlay.show { display: flex; }
    .ext-modal-box {
      background: #fff; border-radius: 14px; padding: 22px 20px;
      width: 90%; max-width: 360px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    }
    .ext-modal-title { margin: 0 0 14px; font-size: 14px; font-weight: bold; color: #111827; }
    .ext-modal-input {
      width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1;
      border-radius: 8px; font-size: 13px; box-sizing: border-box; margin-bottom: 10px;
    }
    .ext-modal-btns { display: flex; gap: 8px; justify-content: flex-end; align-items: center; margin-top: 14px; }
    .ext-btn { padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer; }
    .ext-btn-primary { background: #3b82f6; color: #fff; }
    .ext-btn-danger  { background: #f43f5e; color: #fff; }
    .ext-btn-ghost   { background: #e5e7eb; color: #4b5563; }
    .ext-btn-warn    { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; margin-right: auto; }

    /* \u2500\u2500 \uBE14\uB77C\uC778\uB4DC \u2500\u2500 */
    .ext-blind-wrapper { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 4px 0; }
    .ext-blind-label {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 10px; background: #f8fafc; font-size: 12px; color: #64748b;
    }
    .ext-blind-toggle-btn { font-size: 12px; color: #3b82f6; text-decoration: none; white-space: nowrap; background: none; border: none; cursor: pointer; }
    .ext-blind-content { display: none; }

    /* \u2500\u2500 \uC720\uC800 \uBA54\uBAA8 \uBC30\uC9C0 \u2500\u2500 */
    .ext-user-memo-badge {
      display: inline-block; padding: 1px 6px; border-radius: 4px;
      font-size: 11px; font-weight: bold; margin-left: 4px; cursor: default;
    }
    .ext-memo-blue   { background:#dbeafe; color:#1d4ed8; }
    .ext-memo-green  { background:#d1fae5; color:#065f46; }
    .ext-memo-red    { background:#fee2e2; color:#991b1b; }
    .ext-memo-yellow { background:#fef9c3; color:#92400e; }
    .ext-memo-purple { background:#ede9fe; color:#5b21b6; }
    .ext-memo-pink   { background:#fce7f3; color:#9d174d; }
    .ext-memo-cyan   { background:#cffafe; color:#155e75; }
    .ext-memo-orange { background:#ffedd5; color:#9a3412; }
    .ext-memo-teal   { background:#ccfbf1; color:#134e4a; }
    .ext-memo-gray   { background:#f1f5f9; color:#334155; }
    .ext-memo-red-solid { background:#f43f5e; color:#fff; }

    /* \u2500\u2500 \uAC1C\uB4DC\uB9BD\uCF58 \uCEE8\uD14D\uC2A4\uD2B8 \uBA54\uB274 \u2500\u2500 */
    #ext-dogcon-menu {
      position: absolute; background: #fff; border: 1px solid #e2e8f0;
      border-radius: 10px; padding: 6px; z-index: 999990; min-width: 180px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.13); display: none;
    }
    .dogcon-menu-item {
      padding: 9px 14px; border-radius: 7px; cursor: pointer; font-size: 13px;
      display: block; white-space: nowrap;
    }
    .dogcon-menu-item:hover { background: #f1f5f9; }
    .dogcon-menu-item.block-action   { color: #f43f5e; font-weight: bold; }
    .dogcon-menu-item.unblock-action { color: #16a34a; font-weight: bold; }
    .ext-dogcon-blocked {
      display: inline-flex; align-items: center; padding: 2px 8px;
      background: #fff1f2; border: 1px dashed #f43f5e; border-radius: 6px;
      font-size: 12px; color: #f43f5e; cursor: pointer; gap: 4px;
    }

    /* \u2500\u2500 \uCC28\uB2E8 \uC720\uC800 \uAC15\uC870 \u2500\u2500 */
    .ext-blocked-user-layout { background-color: #fff1f2 !important; }

    /* \u2500\u2500 \uBA54\uBAA8 \uC0C9\uC0C1 \uD53C\uCEE4 \u2500\u2500 */
    #ext-memo-color-picker { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 16px; }
    .ext-color-chip {
      width: 22px; height: 22px; border-radius: 50%; cursor: pointer;
      box-sizing: border-box; transition: all 0.15s; border: 2px solid transparent;
    }
    .ext-color-chip.selected { border-color: #111827; transform: scale(1.2); box-shadow: 0 2px 6px rgba(0,0,0,0.18); }

    /* \u2500\u2500 \u2699\uFE0F \uD50C\uB85C\uD305 \uAE30\uC5B4 \uBC84\uD2BC \u2500\u2500 */
    #ext-gear-wrap {
      position: fixed; bottom: 24px; right: 16px; z-index: 999998;
      display: flex; flex-direction: column; align-items: center;
    }
    #ext-gear-btn {
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(30,30,40,0.72);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      color: #e2e8f0; border: 1px solid rgba(255,255,255,0.12);
      font-size: 19px; cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.28);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.18s, background 0.18s;
    }
    #ext-gear-btn:active { transform: scale(0.88); }
    #ext-gear-btn.has-update {
      background: rgba(234,88,12,0.88);
      border-color: rgba(255,160,60,0.5);
      animation: extGearPulse 2.4s ease-in-out infinite;
    }
    @keyframes extGearPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(234,88,12,0.5); }
      50%      { box-shadow: 0 0 0 7px rgba(234,88,12,0); }
    }
    #ext-update-badge {
      display: none;
      background: #ef4444; color: #fff;
      font-size: 10px; font-weight: bold;
      padding: 2px 5px; border-radius: 6px;
      margin-bottom: 3px; white-space: nowrap;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }
    #ext-update-badge.show { display: block; }

    /* \u2500\u2500 \uC124\uC815 \uD328\uB110 (\uBC14\uD140\uC2DC\uD2B8) \u2500\u2500 */
    #ext-settings-panel {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.45); z-index: 999999;
      display: none; align-items: flex-end; justify-content: center;
      font-family: sans-serif;
    }
    #ext-settings-panel.show { display: flex; }
    #ext-settings-inner {
      background: #fff; border-radius: 20px 20px 0 0;
      width: 100%; max-width: 560px; max-height: 90vh;
      overflow-y: auto; padding: 0 0 env(safe-area-inset-bottom, 0) 0;
      animation: extSlideUp 0.25s ease;
    }
    @keyframes extSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    #ext-settings-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 18px 10px; border-bottom: 1px solid #f1f5f9;
      position: sticky; top: 0; background: #fff; z-index: 1;
    }
    #ext-settings-header h2 { margin: 0; font-size: 16px; color: #111827; }
    #ext-settings-close {
      background: #f1f5f9; border: none; border-radius: 50%;
      width: 30px; height: 30px; font-size: 16px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    .ext-tab-bar {
      display: flex; overflow-x: auto; border-bottom: 2px solid #f1f5f9;
      padding: 0 8px; gap: 4px; white-space: nowrap; scrollbar-width: none;
    }
    .ext-tab-bar::-webkit-scrollbar { display: none; }
    .ext-tab {
      padding: 10px 14px; border: none; background: none; cursor: pointer;
      font-size: 13px; color: #64748b; font-weight: 600;
      border-bottom: 2px solid transparent; margin-bottom: -2px;
    }
    .ext-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
    .ext-tab-panel { display: none; padding: 16px 18px 20px; }
    .ext-tab-panel.active { display: block; }
    .ext-section-label { font-size: 12px; font-weight: bold; color: #64748b; margin: 12px 0 6px; text-transform: uppercase; letter-spacing: 0.04em; }
    .ext-input-row { display: flex; gap: 8px; margin-bottom: 10px; }
    .ext-input-row input, .ext-input-row select {
      flex: 1; padding: 9px 11px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px;
    }
    .ext-input-row button {
      padding: 9px 14px; background: #3b82f6; color: #fff; border: none;
      border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer; white-space: nowrap;
    }
    .ext-badge-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; min-height: 32px; }
    .ext-badge-item {
      display: inline-flex; align-items: center; gap: 5px;
      background: #f1f5f9; border-radius: 8px; padding: 4px 8px 4px 10px;
      font-size: 12px; color: #334155;
    }
    .ext-badge-del {
      background: #e2e8f0; border: none; border-radius: 50%;
      width: 18px; height: 18px; font-size: 12px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; color: #64748b;
    }
    .ext-empty-msg { color: #94a3b8; font-size: 13px; padding: 8px 0; }
    .ext-switch-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f8fafc; }
    .ext-switch-row label { font-size: 14px; color: #334155; }
    .ext-toggle { position: relative; width: 42px; height: 24px; }
    .ext-toggle input { opacity: 0; width: 0; height: 0; }
    .ext-toggle-slider {
      position: absolute; inset: 0; background: #cbd5e1; border-radius: 24px; cursor: pointer; transition: background 0.2s;
    }
    .ext-toggle-slider::before {
      content: ""; position: absolute; left: 3px; top: 3px;
      width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform 0.2s;
    }
    .ext-toggle input:checked + .ext-toggle-slider { background: #3b82f6; }
    .ext-toggle input:checked + .ext-toggle-slider::before { transform: translateX(18px); }
    .ext-radio-group { display: flex; gap: 8px; margin: 8px 0; flex-wrap: wrap; }
    .ext-radio-item { display: flex; align-items: center; gap: 5px; font-size: 13px; cursor: pointer; }
    .ext-backup-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
    .ext-backup-btn {
      flex: 1; min-width: 120px; padding: 11px; border: 1.5px solid #cbd5e1;
      border-radius: 10px; background: #f8fafc; font-size: 13px; font-weight: bold;
      cursor: pointer; color: #334155; text-align: center;
    }
    .ext-backup-btn:active { background: #e2e8f0; }

    /* \u2500\u2500 \uB808\uC774\uC544\uC6C3 \uC81C\uC5B4 \u2500\u2500 */
    html.ext-hide-notice li.notice,
    html.ext-hide-notice tr.notice { display: none !important; }
    html.ext-hide-popular li.popular-item,
    html.ext-hide-popular tr.popular-item { display: none !important; }
    html.ext-hide-sidebar .clayerbox-right { display: none !important; }
    html.ext-hide-compact .recent_wrap,
    html.ext-hide-compact .favorite { display: none !important; }
    html.ext-hide-compact .secontent,
    html.ext-hide-compact .board-list,
    html.ext-hide-compact .ed.board.container {
      width: 100% !important; max-width: 100% !important; box-sizing: border-box !important;
    }
    html.ext-hide-vote .wgtRv.ed_vote.visited { display: none !important; }
    html[style*="--ext-custom-width"] .container {
      width: var(--ext-custom-width) !important;
      max-width: var(--ext-custom-width) !important;
      min-width: var(--ext-custom-width) !important;
      margin: 0 auto !important;
    }


    /* \u2500\u2500 \uB9C1\uD06C \uBCF5\uC0AC / \uC77D\uAE30 \uBAA8\uB4DC \uBC84\uD2BC \u2500\u2500 */
    button.ext-copy-link-btn { border: none; font-family: inherit; }
    a.ext-copy-link-btn, button.ext-copy-link-btn {
      display: inline-flex;
      align-items: center;
      margin-left: 8px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
      color: #0284c7;
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
      vertical-align: middle;
      white-space: nowrap;
    }
    a.ext-copy-link-btn:hover, button.ext-copy-link-btn:hover { background: #bae6fd; color: #0369a1; }
    body.color_scheme_dark a.ext-copy-link-btn, body.color_scheme_dark button.ext-copy-link-btn {
      color: #7dd3fc;
      background: #1e3a4a;
      border-color: #2d5a72;
    }
    body.color_scheme_dark a.ext-copy-link-btn:hover, body.color_scheme_dark button.ext-copy-link-btn:hover { background: #264d63; color: #bae6fd; }

    /* \u2500\u2500 \uD56B\uB51C \uC885\uB8CC \uCC98\uB9AC \u2500\u2500 */
    /* webzine\uD615 \uC624\uBC84\uB808\uC774 */
    .ext-hotdeal-ended-overlay {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0,0,0,0.25);
      color: #fff;
      font-size: 1.25rem;
      font-weight: bold;
      letter-spacing: 0.5rem;
      pointer-events: none;
      border-radius: 4px;
      z-index: 1;
    }
    .ext-hotdeal-ended-overlay {
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background-color: rgba(0,0,0,0.25);
      color: #fff; font-size: 1.25rem; font-weight: bold; letter-spacing: 1rem;
      pointer-events: none; z-index: 1;
    }
    .ext-hotdeal-ended-overlay::after { content: "\uC885\uB8CC"; }

    /* table\uD615 \uBC30\uC9C0 */
    .ext-hotdeal-badge {
      display: inline-flex; align-items: center;
      padding: 2px 7px; margin-right: 6px;
      font-size: 11px; font-weight: 700;
      color: #fff; background-color: #64748b;
      border: 1px solid #475569;
      border-radius: 5px; vertical-align: middle; white-space: nowrap;
      letter-spacing: 0.02em;
    }
    body.color_scheme_dark .ext-hotdeal-badge {
      color: #e2e8f0; background-color: #334155; border-color: #475569;
    }
    tr.ext-hotdeal-ended-row { opacity: 0.6; }

    /* \u2500\u2500 \uB808\uBCA8 \uC544\uC774\uCF58 \uC228\uAE30\uAE30 \u2500\u2500 */
    html.ext-hide-level-icon img.xe_point_level_icon { display: none !important; }

    /* \u2500\u2500 \uC77D\uAE30 \uBAA8\uB4DC \u2500\u2500 */
    /* \uD398\uC774\uC9C0 \uD504\uB808\uC784 \uC228\uAE40 */
    html.ext-reader-mode .gnb,
    html.ext-reader-mode .eq.navbar,
    html.ext-reader-mode .eq.nav-drawer,
    html.ext-reader-mode .sidebar,
    html.ext-reader-mode .clayerbox-right,
    html.ext-reader-mode .ed.board-header,
    html.ext-reader-mode .ed.board-list,
    html.ext-reader-mode .ed.pagination-container,
    html.ext-reader-mode .ed.board-footer,
    html.ext-reader-mode .ed.article-footer,
    html.ext-reader-mode .ed.related-articles,
    html.ext-reader-mode footer,
    html.ext-reader-mode .footer,
    html.ext-reader-mode .xe-widget-wrapper { display: none !important; }

    /* \uAC8C\uC2DC\uAE00 \uB0B4\uBD80 \u2014 \uBCF8\uBB38 \uC81C\uC678 \uC228\uAE40 */
    html.ext-reader-mode .wgtRv { display: none !important; }
    html.ext-reader-mode .ed.article-toolbar { display: none !important; }
    html.ext-reader-mode .ed.article-head .title-toolbar .ed.flex.flex-wrap,
    html.ext-reader-mode .ed.article-head .title-toolbar .ed.flex.flex-right { display: none !important; }
    html.ext-reader-mode .ed.clearfix.margin-vertical-large > .ed.flex.flex-right,
    html.ext-reader-mode .ed.clearfix.margin-vertical-large > .ed.flex.flex-left.flex-middle { display: none !important; }

    /* \uB313\uAE00 */
    html.ext-reader-mode #comment_list,
    html.ext-reader-mode #comment_top,
    html.ext-reader-mode #comment_end,
    html.ext-reader-mode .comment-list-wrap,
    html.ext-reader-mode .ed.comment-list,
    html.ext-reader-mode .ed.comment-content,
    html.ext-reader-mode .ed.comment-item,
    html.ext-reader-mode .ed.comment-write,
    html.ext-reader-mode .ed.comment,
    html.ext-reader-mode .comment-wrap,
    html.ext-reader-mode .comment_list { display: none !important; }

    /* \uBAA8\uBC14\uC77C UI \uC694\uC18C\uB294 \uC77D\uAE30 \uBAA8\uB4DC\uC5D0\uC11C\uB3C4 \uC720\uC9C0 */
    html.ext-reader-mode #ext-gear-wrap,
    html.ext-reader-mode #ext-settings-panel,
    html.ext-reader-mode #ext-block-modal,
    html.ext-reader-mode #ext-memo-modal,
    html.ext-reader-mode #ext-dogcon-menu,
    html.ext-reader-mode #ext-gallery-overlay,
    html.ext-reader-mode #ext-loading-overlay { display: revert !important; }

    html.ext-reader-mode .container,
    html.ext-reader-mode .ed.board.container {
      max-width: 720px !important;
      width: 100% !important;
      margin: 0 auto !important;
      padding: 0 20px !important;
      box-sizing: border-box !important;
    }

    html.ext-reader-mode .xe_content,
    html.ext-reader-mode .rhymix_content {
      font-size: 17px !important;
      line-height: 1.9 !important;
    }
  `,(document.head||document.documentElement).appendChild(t)}function Ee(){return`
    <div id="ext-settings-inner">
      <div id="ext-settings-header">
        <h2>\u2699\uFE0F \uAC1C\uB4DC\uB9BD Plus+ <small style="font-size:11px;color:#94a3b8;font-weight:normal;">(Mobile)</small></h2>
        <button id="ext-settings-close">\u2715</button>
      </div>
      <div class="ext-tab-bar">
        <button class="ext-tab active" data-tab="tab-block-user">\u{1F464} \uC0AC\uC6A9\uC790\uCC28\uB2E8</button>
        <button class="ext-tab" data-tab="tab-keyword">\u2328\uFE0F \uD0A4\uC6CC\uB4DC\uCC28\uB2E8</button>
        <button class="ext-tab" data-tab="tab-dogcon">\u{1F436} \uAC1C\uB4DC\uB9BD\uCF58</button>
        <button class="ext-tab" data-tab="tab-memo">\u{1F4DD} \uBA54\uBAA8</button>
        <button class="ext-tab" data-tab="tab-display">\u{1F5A5} \uD45C\uC2DC</button>
        <button class="ext-tab" data-tab="tab-backup">\u{1F4BE} \uBC31\uC5C5</button>
      </div>

      <div class="ext-tab-panel active" id="tab-block-user">
        <p class="ext-section-label">\uCC28\uB2E8 \uBAA9\uB85D <span id="s-block-count" style="font-weight:normal;color:#94a3b8;"></span></p>
        <div class="ext-badge-list" id="s-block-list"></div>
        <p style="margin-top:12px;font-size:12px;color:#94a3b8;">\uB2C9\uB124\uC784 \uD31D\uC5C5 \uBA54\uB274 \u2192 '\uCC28\uB2E8'\uC73C\uB85C \uCD94\uAC00\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p>
      </div>

      <div class="ext-tab-panel" id="tab-keyword">
        <p class="ext-section-label">\uD0A4\uC6CC\uB4DC \uCD94\uAC00</p>
        <div class="ext-input-row">
          <input id="s-kw-word" type="text" placeholder="\uD0A4\uC6CC\uB4DC" style="flex:2;" />
          <select id="s-kw-target">
            <option value="all">\uC804\uCCB4</option>
            <option value="posts">\uAC8C\uC2DC\uAE00</option>
            <option value="comments">\uB313\uAE00</option>
          </select>
        </div>
        <div class="ext-input-row" style="margin-top:-4px;">
          <select id="s-kw-method">
            <option value="includes">\uD3EC\uD568</option>
            <option value="starts">\uC2DC\uC791</option>
          </select>
          <button id="s-kw-add">\uCD94\uAC00</button>
        </div>
        <p class="ext-section-label">\uD0A4\uC6CC\uB4DC \uBAA9\uB85D</p>
        <div class="ext-badge-list" id="s-kw-list"></div>
      </div>

      <div class="ext-tab-panel" id="tab-dogcon">
        <p class="ext-section-label">\uCC28\uB2E8\uB41C \uAC1C\uB4DC\uB9BD\uCF58</p>
        <div class="ext-badge-list" id="s-dogcon-list"></div>
        <p class="ext-section-label" style="margin-top:14px;">\uCC28\uB2E8\uB41C \uAC1C\uB4DC\uB9BD\uCF58 \uADF8\uB8F9</p>
        <div class="ext-badge-list" id="s-dogcon-group-list"></div>
        <p style="margin-top:12px;font-size:12px;color:#94a3b8;">\uAC1C\uB4DC\uB9BD\uCF58 \uC774\uBBF8\uC9C0\uB97C \uD074\uB9AD\uD558\uBA74 \uCC28\uB2E8/\uD574\uC81C \uBA54\uB274\uAC00 \uB098\uD0C0\uB0A9\uB2C8\uB2E4.</p>
      </div>

      <div class="ext-tab-panel" id="tab-memo">
        <p class="ext-section-label">\uB4F1\uB85D\uB41C \uC720\uC800 \uBA54\uBAA8</p>
        <div class="ext-badge-list" id="s-memo-list"></div>
        <p style="margin-top:12px;font-size:12px;color:#94a3b8;">\uB2C9\uB124\uC784 \uD31D\uC5C5 \uBA54\uB274 \u2192 '\uBA54\uBAA8'\uB85C \uB4F1\uB85D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p>
      </div>

      <div class="ext-tab-panel" id="tab-display">
        <p class="ext-section-label">\uB808\uC774\uC544\uC6C3</p>
        <div class="ext-switch-row"><label>\uACF5\uC9C0 \uC228\uAE30\uAE30</label><label class="ext-toggle"><input type="checkbox" id="s-hide-notice"><span class="ext-toggle-slider"></span></label></div>
        <div class="ext-switch-row"><label>\uC778\uAE30\uAE00 \uC228\uAE30\uAE30</label><label class="ext-toggle"><input type="checkbox" id="s-hide-popular"><span class="ext-toggle-slider"></span></label></div>
        <div class="ext-switch-row"><label>\uCEF4\uD329\uD2B8 \uBAA8\uB4DC</label><label class="ext-toggle"><input type="checkbox" id="s-compact"><span class="ext-toggle-slider"></span></label></div>
        <div class="ext-switch-row"><label>\uCD94\uCC9C\uC218 \uBE44\uACF5\uAC1C</label><label class="ext-toggle"><input type="checkbox" id="s-disable-vote"><span class="ext-toggle-slider"></span></label></div>
        <div class="ext-switch-row"><label>\uC720\uD29C\uBE0C \uC54C\uACE0\uB9AC\uC998 \uBC29\uC9C0</label><label class="ext-toggle"><input type="checkbox" id="s-no-yt"><span class="ext-toggle-slider"></span></label></div>
        <div class="ext-switch-row"><label>\uB808\uBCA8 \uC544\uC774\uCF58 \uC228\uAE30\uAE30</label><label class="ext-toggle"><input type="checkbox" id="s-hide-level-icon"><span class="ext-toggle-slider"></span></label></div>
        <p class="ext-section-label" style="margin-top:14px;">\uCC28\uB2E8 \uBC29\uC2DD</p>
        <div class="ext-radio-group">
          <label class="ext-radio-item"><input type="radio" name="s-block-method" value="remove" id="s-bm-remove"> \uC81C\uAC70</label>
          <label class="ext-radio-item"><input type="radio" name="s-block-method" value="blind" id="s-bm-blind"> \uBE14\uB77C\uC778\uB4DC</label>
          <label class="ext-radio-item"><input type="radio" name="s-block-method" value="badge" id="s-bm-badge"> \uBC30\uC9C0\uB9CC</label>
        </div>
      </div>

      <div class="ext-tab-panel" id="tab-backup">
        <p class="ext-section-label">\uC124\uC815 \uBC31\uC5C5 / \uBCF5\uAD6C</p>
        <div class="ext-backup-row">
          <button class="ext-backup-btn" id="s-backup">\u2B07\uFE0F \uBC31\uC5C5 \uB2E4\uC6B4\uB85C\uB4DC</button>
          <button class="ext-backup-btn" id="s-restore-btn">\u2B06\uFE0F \uBC31\uC5C5 \uBCF5\uAD6C</button>
        </div>
        <input type="file" id="s-restore-file" accept=".json" style="display:none;" />
        <p class="ext-section-label" style="margin-top:18px;">Dogdrip++ \uBC31\uC5C5\uBCF8 \uBCF5\uC6D0</p>
        <div class="ext-backup-row">
          <button class="ext-backup-btn" id="s-restore-pp-btn" style="border-color:#f59e0b;color:#b45309;">\u{1F4E5} Dogdrip++ \uB370\uC774\uD130 \uAC00\uC838\uC624\uAE30</button>
        </div>
        <input type="file" id="s-restore-pp-file" accept=".json" style="display:none;" />
        <p style="margin-top:16px;font-size:12px;color:#94a3b8; line-height:1.7;">
          \uBC31\uC5C5 \uD30C\uC77C\uC740 JSON \uD615\uC2DD\uC73C\uB85C \uC800\uC7A5\uB418\uBA70, \uB3D9\uC77C \uC720\uC800\uC2A4\uD06C\uB9BD\uD2B8 \uD658\uACBD\uC5D0\uC11C \uBCF5\uAD6C \uAC00\uB2A5\uD569\uB2C8\uB2E4.<br>
          Dogdrip++ \uB370\uC774\uD130 \uBCF5\uC6D0 \uC2DC \uCC28\uB2E8 \uC720\uC800\xB7\uD0A4\uC6CC\uB4DC\uB9CC \uAC00\uC838\uC624\uBA70, \uB098\uBA38\uC9C0 \uD604\uC7AC \uC124\uC815\uC740 \uC720\uC9C0\uB429\uB2C8\uB2E4.<br>
          \u203B \uC124\uC815 \uBCC0\uACBD \uD6C4 \uD398\uC774\uC9C0 \uC0C8\uB85C\uACE0\uCE68 \uC2DC \uBC18\uC601\uB429\uB2C8\uB2E4.
        </p>
      </div>
    </div>`}var me=0,ke=!1;function Ve(t,o){me=window.scrollY,document.body.style.cssText+=";overflow:hidden;position:fixed;top:-"+me+"px;left:0;right:0;",o.classList.add("show"),Me("tab-block-user",t),He(t),je(t,o)}function ue(t){t.classList.remove("show"),document.body.style.overflow="",document.body.style.position="",document.body.style.top="",document.body.style.left="",document.body.style.right="",window.scrollTo(0,me)}function we(t,o,r,n,f){o.addEventListener("click",()=>{if(o.classList.contains("has-update")&&window._extLatestVersion&&confirm(`\u{1F195} \uC0C8 \uBC84\uC804\uC774 \uC788\uC2B5\uB2C8\uB2E4!
\uD604\uC7AC: v${f}  \u2192  \uCD5C\uC2E0: v${window._extLatestVersion}

\uC5C5\uB370\uC774\uD2B8 \uD398\uC774\uC9C0\uB85C \uC774\uB3D9\uD560\uAE4C\uC694?`)){window.open("https://github.com/z3ro2201/dogdrip-plus-mobilejs/raw/main/dogdrip-plus.user.js","_blank");return}Ve(t,n)}),n.querySelector("#ext-settings-close")?.addEventListener("click",()=>ue(n)),n.addEventListener("click",i=>{i.target===n&&ue(n)}),n.querySelectorAll(".ext-tab").forEach(i=>{i.addEventListener("click",()=>{n.querySelectorAll(".ext-tab").forEach(E=>E.classList.remove("active")),n.querySelectorAll(".ext-tab-panel").forEach(E=>E.classList.remove("active")),i.classList.add("active");let w=i.dataset.tab;n.querySelector(`#${w}`)?.classList.add("active"),Me(w,t)})}),n.querySelector("#s-kw-add")?.addEventListener("click",()=>{let i=n.querySelector("#s-kw-word").value.trim();if(!i){alert("\uD0A4\uC6CC\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694.");return}let w=n.querySelector("#s-kw-target").value,E=n.querySelector("#s-kw-method").value;t.get(["keywords"]).then(a=>{let k=a.keywords||[];if(k.some(v=>(v.word||v.keyword)===i)){alert("\uC774\uBBF8 \uB4F1\uB85D\uB41C \uD0A4\uC6CC\uB4DC\uC785\uB2C8\uB2E4.");return}k.push({date:new Date().toISOString().slice(0,10),word:i,method:E,target:w}),t.set({keywords:k}).then(()=>{n.querySelector("#s-kw-word").value="",pe(t)})})}),n.querySelector("#s-backup")?.addEventListener("click",()=>Ue(t)),n.querySelector("#s-restore-btn")?.addEventListener("click",()=>n.querySelector("#s-restore-file").click()),n.querySelector("#s-restore-file")?.addEventListener("change",i=>We(i,t)),n.querySelector("#s-restore-pp-btn")?.addEventListener("click",()=>n.querySelector("#s-restore-pp-file").click()),n.querySelector("#s-restore-pp-file")?.addEventListener("change",i=>Ye(i,t))}function je(t,o){if(ke)return;ke=!0,[["s-hide-notice","hideNotice"],["s-hide-popular","hidePopular"],["s-compact","compactMode"],["s-disable-vote","disableVote"],["s-no-yt","preventYoutubeAlgorithm"],["s-hide-level-icon","hideLevelIcon"]].forEach(([n,f])=>{o.querySelector(`#${n}`)?.addEventListener("change",i=>{let w=i.target.checked;t.set({[f]:w}).then(()=>{t.get(["hideNotice","hidePopular","hideSidebar","compactMode","disableVote"]).then(Fe)})})}),["s-bm-remove","s-bm-blind","s-bm-badge"].forEach(n=>{o.querySelector(`#${n}`)?.addEventListener("change",f=>{f.target.checked&&t.set({blockMethod:f.target.value}).then(()=>{ue(o),location.reload()})})})}function Me(t,o){switch(t){case"tab-block-user":Se(o);break;case"tab-keyword":pe(o);break;case"tab-dogcon":Te(o);break;case"tab-memo":_e(o);break;case"tab-display":He(o);break}}function Se(t){t.get(["blocked_users"]).then(o=>{let r=o.blocked_users||[],n=document.getElementById("s-block-list");if(!n)return;n.innerHTML="";let f=document.getElementById("s-block-count");if(f&&(f.textContent=r.length?`(${r.length}\uBA85)`:""),!r.length){n.innerHTML='<span class="ext-empty-msg">\uCC28\uB2E8\uB41C \uC0AC\uC6A9\uC790\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</span>';return}r.forEach(i=>{let w=document.createElement("span");w.className="ext-badge-item",w.innerHTML=`<span>\u{1F464} ${i.member_num}${i.memo?` <em style="color:#64748b;font-style:normal;font-size:11px;">(${i.memo})</em>`:""}</span>`;let E=document.createElement("button");E.className="ext-badge-del",E.textContent="\xD7",E.addEventListener("click",()=>{confirm(`${i.member_num} \uCC28\uB2E8\uC744 \uD574\uC81C\uD560\uAE4C\uC694?`)&&t.get(["blocked_users"]).then(a=>{let k=(a.blocked_users||[]).filter(v=>v.member_num!==i.member_num);t.set({blocked_users:k}).then(Se.bind(null,t))})}),w.appendChild(E),n.appendChild(w)})})}function pe(t){t.get(["keywords"]).then(o=>{let r=o.keywords||[],n=document.getElementById("s-kw-list");if(!n)return;if(n.innerHTML="",!r.length){n.innerHTML='<span class="ext-empty-msg">\uCC28\uB2E8 \uD0A4\uC6CC\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</span>';return}let f={all:"\uC804\uCCB4",posts:"\uAC8C\uC2DC\uAE00",post:"\uAC8C\uC2DC\uAE00",comments:"\uB313\uAE00",comment:"\uB313\uAE00"},i={includes:"\uD3EC\uD568",starts:"\uC2DC\uC791"};r.forEach(w=>{let E=w.word||w.keyword,a=document.createElement("span");a.className="ext-badge-item",a.innerHTML=`<span>\u2328\uFE0F ${E}<br/><em style="font-size:10px;color:#2563eb;font-style:normal;">[${f[w.target]||"\uC804\uCCB4"}] [${i[w.method]||"\uD3EC\uD568"}]</em></span>`;let k=document.createElement("button");k.className="ext-badge-del",k.textContent="\xD7",k.addEventListener("click",v=>{v.stopPropagation(),t.get(["keywords"]).then(q=>{let N=(q.keywords||[]).filter(I=>(I.word||I.keyword)!==E);t.set({keywords:N}).then(pe.bind(null,t))})}),a.appendChild(k),n.appendChild(a)})})}function Te(t){t.get(["blockedDogcons","blockedDogconGroups"]).then(o=>{Le(o.blockedDogcons||[],"s-dogcon-list","blockedDogcons",r=>r.name,"\uCC28\uB2E8\uB41C \uAC1C\uB4DC\uB9BD\uCF58\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",t),Le(o.blockedDogconGroups||[],"s-dogcon-group-list","blockedDogconGroups",r=>r.name,"\uCC28\uB2E8\uB41C \uADF8\uB8F9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",t)})}function Le(t,o,r,n,f,i){let w=document.getElementById(o);if(w){if(w.innerHTML="",!t.length){w.innerHTML=`<span class="ext-empty-msg">${f}</span>`;return}t.forEach(E=>{let a=document.createElement("span");a.className="ext-badge-item",a.innerHTML=`<span>${n(E)}</span>`;let k=document.createElement("button");k.className="ext-badge-del",k.textContent="\xD7",k.addEventListener("click",()=>{i.get([r]).then(v=>{let q=(v[r]||[]).filter(N=>N.id!==E.id);i.set({[r]:q}).then(()=>Te(i))})}),a.appendChild(k),w.appendChild(a)})}}function _e(t){t.get(["userMemos"]).then(o=>{let r=o.userMemos||{},n=document.getElementById("s-memo-list");if(!n)return;n.innerHTML="";let f=Object.keys(r);if(!f.length){n.innerHTML='<span class="ext-empty-msg">\uB4F1\uB85D\uB41C \uBA54\uBAA8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</span>';return}f.forEach(i=>{let w=r[i],E=w,a="blue";if(w.includes(":")){let v=w.split(":");E=v[0],a=v[1]||"blue"}let k=document.createElement("span");k.className=`ext-badge-item ext-user-memo-badge ext-memo-${a}`,k.style.cssText="cursor:pointer;",k.title=`ID: ${i} / \uD074\uB9AD\uD558\uBA74 \uC0AD\uC81C`,k.innerHTML=`${E} <small>(${i})</small>`,k.addEventListener("click",()=>{confirm(`"${E}" \uBA54\uBAA8\uB97C \uC0AD\uC81C\uD560\uAE4C\uC694?`)&&t.get(["userMemos"]).then(v=>{let q=v.userMemos||{};delete q[i],t.set({userMemos:q}).then(()=>_e(t))})}),n.appendChild(k)})})}function Fe(t){let o=document.documentElement;o.classList.toggle("ext-hide-notice",!!t.hideNotice),o.classList.toggle("ext-hide-popular",!!t.hidePopular),o.classList.toggle("ext-hide-sidebar",!!t.hideSidebar),o.classList.toggle("ext-hide-compact",!!t.compactMode),o.classList.toggle("ext-hide-vote",!!t.disableVote)}function He(t){t.get(["hideNotice","hidePopular","hideSidebar","compactMode","disableVote","preventYoutubeAlgorithm","hideLevelIcon","blockMethod"]).then(o=>{[["s-hide-notice","hideNotice"],["s-hide-popular","hidePopular"],["s-hide-sidebar","hideSidebar"],["s-compact","compactMode"],["s-disable-vote","disableVote"],["s-no-yt","preventYoutubeAlgorithm"],["s-hide-level-icon","hideLevelIcon"]].forEach(([i,w])=>{let E=document.getElementById(i);E&&(E.checked=!!o[w])});let n=o.blockMethod||"remove",f=document.getElementById(`s-bm-${n}`);f&&(f.checked=!0)})}function Ue(t){t.get(["keywords","blocked_users","blockedDogcons","blockedDogconGroups","hideNotice","hidePopular","hideSidebar","compactMode","disableVote","preventYoutubeAlgorithm","contentWidth","blockMethod","userMemos","hideLevelIcon"]).then(o=>{let r=new Blob([JSON.stringify(o,null,2)],{type:"application/json"}),n=URL.createObjectURL(r),f=document.createElement("a");f.href=n,f.download=`dogdrip_plus_backup_${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(f),f.click(),document.body.removeChild(f),URL.revokeObjectURL(n)})}function We(t,o){let r=t.target.files?.[0];if(!r)return;let n=new FileReader;n.onload=f=>{try{let i=JSON.parse(f.target.result),w=(i.keywords||[]).map(a=>typeof a=="string"?{date:"",method:"includes",target:"all",word:a}:{date:a.date||"",method:a.method||"includes",target:a.target||"all",word:a.word||a.keyword}),E=(i.blocked_users||i.nicknames||[]).map(a=>{if(typeof a=="string"&&a.includes(":")){let k=a.split(":");return{date:"",member_num:k[0].trim(),memo:k[2]||""}}return{date:a.date||"",member_num:String(a.member_num||"").trim(),memo:a.memo||""}});o.set({keywords:w,blocked_users:E,blockedDogcons:i.blockedDogcons||[],blockedDogconGroups:i.blockedDogconGroups||[],hideNotice:!!i.hideNotice,hidePopular:!!i.hidePopular,hideSidebar:!!i.hideSidebar,compactMode:!!i.compactMode,disableVote:!!i.disableVote,preventYoutubeAlgorithm:!!i.preventYoutubeAlgorithm,contentWidth:i.contentWidth||"",blockMethod:i.blockMethod||"remove",userMemos:i.userMemos||{}}).then(()=>{alert("\u{1F389} \uBCF5\uAD6C \uC644\uB8CC! \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C\uACE0\uCE68\uD569\uB2C8\uB2E4."),location.reload()})}catch{alert("\u274C \uD30C\uC77C \uD615\uC2DD \uC624\uB958: \uC62C\uBC14\uB978 \uBC31\uC5C5 JSON \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.")}t.target.value=""},n.readAsText(r)}function Ye(t,o){let r=t.target.files?.[0];if(!r)return;let n=new FileReader;n.onload=f=>{try{let i=JSON.parse(f.target.result),w=Array.isArray(i.blocked_members)?i.blocked_members:[],E=Array.isArray(i.keywords)?i.keywords:[],a=w.map(v=>({date:v.date||"",member_num:String(v.member_num||"").trim(),memo:v.memo||""})),k=E.map(v=>({date:v.date||"",method:v.method||"includes",target:v.target||"all",word:v.keyword||v.word||""}));o.get(["blockedDogcons","blockedDogconGroups","hideNotice","hidePopular","hideSidebar","compactMode","disableVote","preventYoutubeAlgorithm","contentWidth","blockMethod","userMemos"]).then(v=>{o.set({keywords:k,blocked_users:a,blockedDogcons:v.blockedDogcons||[],blockedDogconGroups:v.blockedDogconGroups||[],hideNotice:!!v.hideNotice,hidePopular:!!v.hidePopular,hideSidebar:!!v.hideSidebar,compactMode:!!v.compactMode,disableVote:!!v.disableVote,preventYoutubeAlgorithm:!!v.preventYoutubeAlgorithm,contentWidth:v.contentWidth||"",blockMethod:v.blockMethod||"remove",userMemos:v.userMemos||{}}).then(()=>{alert(`\u{1F389} Dogdrip++ \uB370\uC774\uD130 \uBCF5\uC6D0 \uC644\uB8CC!
\uCC28\uB2E8 \uC720\uC800 ${a.length}\uBA85, \uD0A4\uC6CC\uB4DC ${k.length}\uAC1C\uB97C \uAC00\uC838\uC654\uC2B5\uB2C8\uB2E4.
\uD398\uC774\uC9C0\uB97C \uC0C8\uB85C\uACE0\uCE68\uD569\uB2C8\uB2E4.`),location.reload()})})}catch{alert("\u274C \uD30C\uC77C \uD615\uC2DD \uC624\uB958: Dogdrip++ \uBC31\uC5C5 JSON \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.")}t.target.value=""},n.readAsText(r)}function K(t,o){return`<div class="ext-blind-wrapper">
    <div class="ext-blind-label">
      <span>\u{1F6AB} \uCC28\uB2E8\uB41C ${t}\uC785\uB2C8\uB2E4.</span>
      <button class="ext-blind-toggle-btn">\uB0B4\uC6A9 \uBCF4\uAE30</button>
    </div>
    <div class="ext-blind-content" style="display:none;">${o}</div>
  </div>`}function F(t){t.querySelectorAll(".ext-blind-wrapper:not([data-bound])").forEach(o=>{o.dataset.bound="true";let r=o.querySelector(".ext-blind-toggle-btn"),n=o.querySelector(".ext-blind-content");!r||!n||(r.addEventListener("click",f=>{f.preventDefault(),f.stopPropagation();let i=n.style.display!=="none";n.style.display=i?"none":"block",r.textContent=i?"\uB0B4\uC6A9 \uBCF4\uAE30":"\uB0B4\uC6A9 \uC228\uAE30\uAE30"}),o.addEventListener("mouseenter",()=>{n.style.display==="none"&&(n.style.display="block",r.textContent="\uB0B4\uC6A9 \uC228\uAE30\uAE30")}),o.addEventListener("mouseleave",()=>{o.dataset.pinned!=="true"&&(n.style.display="none",r.textContent="\uB0B4\uC6A9 \uBCF4\uAE30")}),r.addEventListener("click",f=>{f.stopPropagation(),o.dataset.pinned=o.dataset.pinned==="true"?"false":"true"}))})}function A(t,o,r){if(!o)return null;let n=document.createElement("span");return n.className=`ext-user-memo-badge ext-memo-${r||"blue"} ext-badge-id-${t}`,n.innerText=o,n.title=`\uBA54\uBAA8: ${o}
(\uD68C\uC6D0\uBC88\uD638: ${t})`,n}function Q(t,o,r){if(!t||!o)return!1;let n=typeof o=="string"?o:o.word||o.keyword,f=typeof o=="string"?"includes":o.method||"includes",i=typeof o=="string"?"all":o.target||"all",w=i==="post"?"posts":i==="comment"?"comments":i;if(w!=="all"&&w!==r)return!1;let E=t.replace(/[\s\n\r\t]+/g," ");E=E.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g,"").trim();let a=n.trim();return f==="includes"?E.includes(a):f==="starts"?E.startsWith(a):!1}function ne(){let t=document.getElementById("ext-loading-overlay");t&&(t.style.opacity="0",setTimeout(()=>{t.remove()},200))}var re="f43f5e",le="16a34a";function qe(t){let{storage:o,openBlockModal:r,openDogconMenu:n,injectDownloadAllButton:f,injectCopyLinkButton:i}=t,w=new Promise(a=>setTimeout(a,1e3)),E=o.get(["keywords","blocked_users","blockedDogcons","blockedDogconGroups","hideNotice","hidePopular","hideSidebar","compactMode","disableVote","preventYoutubeAlgorithm","contentWidth","blockMethod","userMemos","readabilityMode","legacyToolbar","hiddenMenus","hiddenSubMenus","hideLevelIcon"]).then(a=>{let k=a.keywords||[],v=a.blocked_users||[],q=a.blockedDogcons||[],N=a.blockedDogconGroups||[],I=a.blockMethod==="blind",D=a.blockMethod==="badge",W=Array.isArray(a.userMemos)?a.userMemos:[],R=new Map(W.map(e=>[String(e.member_num),e])),z=v.map(e=>String(e.member_num).trim()).filter(e=>e!==""),C=new Map(v.map(e=>[String(e.member_num).trim(),e])),ie=q.map(e=>e.id),ae=N.map(e=>e.id),_=document.documentElement;_&&(a.contentWidth&&a.contentWidth.trim()!==""&&_.style.setProperty("--ext-custom-width",a.contentWidth.trim()),a.hideNotice===!0&&_.classList.add("ext-hide-notice"),a.hidePopular===!0&&_.classList.add("ext-hide-popular"),a.hideSidebar===!0&&_.classList.add("ext-hide-sidebar"),a.compactMode===!0&&_.classList.add("ext-hide-compact"),a.disableVote===!0&&_.classList.add("ext-hide-vote"),a.readabilityMode===!0?_.classList.add("ext-readability-mode"):_.classList.remove("ext-readability-mode"),a.legacyToolbar===!0?_.classList.add("ext-legacy-toolbar"):_.classList.remove("ext-legacy-toolbar"),a.hideLevelIcon===!0?_.classList.add("ext-hide-level-icon"):_.classList.remove("ext-hide-level-icon"));function U(e){let c=R.get(String(e));return c?{text:c.memo||"",color:c.color||"blue"}:{text:"",color:"blue"}}document.querySelectorAll("li.webzine").forEach(e=>{let c=e.querySelector(".title-link"),p=e.querySelector('a[class*="member_"]'),g=!1,b=!1;if(c&&k.length>0){let u=c.textContent.trim();k.some(h=>Q(u,h,"posts"))&&(g=!0)}let l="";if(p){let u=p.className.match(/member_(\d+)/);u&&(l=u[1],z.includes(l)&&(b=!0))}if(g){e.remove();return}if(b){if(D){if(l&&p&&!e.querySelector(`.ext-badge-id-${l}`)){let u=C.get(l),h=u&&u.memo&&u.memo.trim()!==""?u.memo.trim():"\uCC28\uB2E8\uB428",y=A(l,h,"red-solid");y&&p.after(y)}e.classList.add("ext-blocked-user-layout");return}if(e.dataset.extFiltered)return;if(e.dataset.extFiltered="true",I){if(p&&!e.querySelector(`.ext-badge-id-${l}`)){let h=C.get(l),y=h&&h.memo&&h.memo.trim()!==""?h.memo.trim():"\uCC28\uB2E8\uB428",M=A(l,y,"red-solid");M&&p.after(M)}let u=e.innerHTML;e.innerHTML=K("\uAC8C\uC2DC\uAE00",u),F(e)}else e.remove()}else if(l&&R.has(l)&&p&&!e.querySelector(`.ext-badge-id-${l}`)){let u=U(l),h=A(l,u.text,u.color);h&&p.after(h)}}),document.querySelectorAll("li span.title a, li div.eq span.text-link").forEach(e=>{let c=e.closest("li");if(!c)return;let p=c.querySelector('a[class*="member_"]'),g="";if(p){let b=p.className.match(/member_(\d+)/);b&&(g=b[1])}if(k.length>0){let b=e.textContent.trim();if(k.some(l=>Q(b,l,"posts"))){c.remove();return}}if(g&&z.includes(g)){if(D){if(p&&!c.querySelector(`.ext-badge-id-${g}`)){let b=C.get(g),l=b&&b.memo&&b.memo.trim()!==""?b.memo.trim():"\uCC28\uB2E8\uB428",u=A(g,l,"red-solid");u&&p.after(u)}c.style.backgroundColor="#fff1f2",c.classList.add("ext-blocked-user-layout");return}if(c.dataset.extFiltered)return;if(c.dataset.extFiltered="true",I){if(p&&!c.querySelector(`.ext-badge-id-${g}`)){let l=C.get(g),u=l&&l.memo&&l.memo.trim()!==""?l.memo.trim():"\uCC28\uB2E8\uB428",h=A(g,u,"red-solid");h&&p.after(h)}let b=c.innerHTML;c.innerHTML=K("\uAC8C\uC2DC\uAE00",b),F(c)}else c.remove()}else if(g&&R.has(g)&&p&&!c.querySelector(`.ext-badge-id-${g}`)){let b=U(g),l=A(g,b.text,b.color);l&&p.after(l)}}),document.querySelectorAll("tr.ed").forEach(e=>{let c=e.querySelector(".title"),p=e.querySelector(".author a[class*='member_']"),g=!1,b=!1;if(c&&k.length>0){let u=c.querySelector(".title-link"),h="";if(u)h=u.textContent.trim();else{let M=c.querySelector('a[href*="dogdrip.net/"], a[href^="/"]');if(M){let O=M.cloneNode(!0),te=O.querySelector(".text-primary");te&&te.remove(),h=O.textContent.replace(/\[.*?\]/g,"").trim()}else h=c.textContent.trim()}let y=h.replace(/[\s\n\r\t]+/g," ").trim();k.some(M=>Q(y,M,"posts"))&&(g=!0)}let l="";if(p){let u=p.className.match(/member_(\d+)/);u&&(l=u[1],z.includes(l)&&(b=!0))}if(g){e.remove();return}if(b){if(D){if(l&&p&&!e.querySelector(`.ext-badge-id-${l}`)){let u=C.get(l),h=u&&u.memo&&u.memo.trim()!==""?u.memo.trim():"\uCC28\uB2E8\uB428",y=A(l,h,"red-solid");y&&p.after(y)}e.style.backgroundColor="#fff1f2",e.classList.add("ext-blocked-user-layout");return}if(e.dataset.extFiltered)return;if(e.dataset.extFiltered="true",I){if(p&&!e.querySelector(`.ext-badge-id-${l}`)){let y=C.get(l),M=y&&y.memo&&y.memo.trim()!==""?y.memo.trim():"\uCC28\uB2E8\uB428",O=A(l,M,"red-solid");O&&p.after(O)}let u=e.querySelectorAll("td, th").length||6,h=e.innerHTML;e.innerHTML=`<td colspan="${u}" style="padding: 0;">${K("\uAC8C\uC2DC\uAE00",`<table style="width:100%"><tbody><tr>${h}</tr></tbody></table>`)}</td>`,F(e)}else e.remove()}else if(l&&R.has(l)&&p&&!e.querySelector(`.ext-badge-id-${l}`)){let u=U(l),h=A(l,u.text,u.color);h&&p.after(h)}}),document.querySelectorAll(".ed.comment-content").forEach(e=>{let c=e.querySelector('a[class*="member_"]'),p=!1,g=e.querySelector(".xe_content, .comment-text");if(g&&k.length>0){let u=(g.innerText||g.textContent||"").replace(/[\s\n\r\t]+/g," ").trim();k.some(h=>Q(u,h,"comments"))&&(p=!0)}if(p){let l=e.closest("li, div.comment-item")||e;if(l.dataset.extFiltered)return;if(l.dataset.extFiltered="true",I){let u=l.innerHTML;l.innerHTML=K("\uD0A4\uC6CC\uB4DC\uAC00 \uD3EC\uD568\uB41C \uB313\uAE00",u),F(l)}else l.remove();return}let b="";if(c){let l=c.className.match(/member_(\d+)/);l&&(b=l[1])}if(b&&z.length>0&&z.includes(b)){let l=e.closest("li, div.comment-item")||e;if(D){if(c&&!e.querySelector(`.ext-badge-id-${b}`)){let u=C.get(b),h=u&&u.memo&&u.memo.trim()!==""?u.memo.trim():"\uCC28\uB2E8\uB428",y=A(b,h,"red-solid");y&&c.after(y)}l.style.backgroundColor="#fff1f2",l.classList.add("ext-blocked-user-layout");return}if(l.dataset.extFiltered)return;if(l.dataset.extFiltered="true",I){if(c&&!l.querySelector(`.ext-badge-id-${b}`)){let h=C.get(b),y=h&&h.memo&&h.memo.trim()!==""?h.memo.trim():"\uCC28\uB2E8\uB428",M=A(b,y,"red-solid");M&&c.after(M)}let u=l.innerHTML;l.innerHTML=K("\uB313\uAE00",u),F(l)}else l.remove();return}if(c&&b&&R.has(b)&&!e.querySelector(`.ext-badge-id-${b}`)){let l=U(b),u=A(b,l.text,l.color);u&&c.after(u)}if(c&&b){let l=c.textContent.trim(),u=e.querySelector("ul.dropdown-menu");if(u){let h=Array.from(u.querySelectorAll("li")).filter(y=>y.innerHTML.trim()==="");if(h.length>0){let y=h[0];y.querySelector(".ext-block-menu-item")||(y.innerHTML='<a class="ext-block-menu-item"><span class="ed icon"><i class="fas fa-user-slash"></i></span>\uCC28\uB2E8</a>',y.querySelector("a").addEventListener("click",M=>{M.preventDefault(),r(l,b)}))}}}});let J=document.querySelector(".title-toolbar");if(J){let e=J.querySelector('a[class*="member_"]'),c=J.querySelector("ul.dropdown-menu");if(e&&c){let p=e.className.match(/member_(\d+)/)?.[1];if(p){if(z.includes(p)){if(!e.querySelector(`.ext-badge-id-${p}`)&&!e.nextElementSibling?.classList.contains("ext-user-memo-badge")){let l=C.get(p),u=l&&l.memo&&l.memo.trim()!==""?l.memo.trim():"\uCC28\uB2E8\uB428",h=A(p,u,"red-solid");h&&e.after(h)}}else if(R.has(p)&&!e.nextElementSibling?.classList.contains("ext-user-memo-badge")){let l=U(p),u=A(p,l.text,l.color);u&&e.after(u)}let g=c.querySelector(".ext-toolbar-member-block");g&&g.remove();let b=document.createElement("li");b.className="ext-toolbar-member-block",z.includes(p)?(b.innerHTML=`<a class="ext-block-menu-item" href="#popup_menu_area" onclick="return false;" style="color: #${le}; font-weight: bold;"><span class="ed icon"><i class="fas fa-user-check"></i></span> \uCC28\uB2E8 \uD574\uC81C</a>`,b.querySelector("a").addEventListener("click",l=>{l.preventDefault(),o.get(["blocked_users"]).then(u=>{let h=u.blocked_users||[];h=h.filter(y=>String(y.member_num)!==String(p)),o.set({blocked_users:h}).then(()=>{window.location.reload()})})})):(b.innerHTML=`<a class="ext-block-menu-item" href="#popup_menu_area" onclick="return false;" style="color: #${re}; font-weight: bold;"><span class="ed icon"><i class="fas fa-user-slash"></i></span> \uCC28\uB2E8</a>`,b.querySelector("a").addEventListener("click",l=>{l.preventDefault(),r(e.textContent.trim(),p)})),c.insertBefore(b,c.firstChild)}}}document.querySelectorAll(".ed.dropdown .ed.dropdown-menu").forEach(e=>{f(e)}),document.querySelectorAll("img.dogcon-clickable, img[data-dogcon-srl]").forEach(e=>{let c=e.getAttribute("data-dogcon-srl"),p=e.getAttribute("data-dogcon-file-srl"),g=e.getAttribute("data-title")||e.getAttribute("title")||"\uAC1C\uB4DC\uB9BD\uCF58",b=e.getAttribute("alt")||"\uCF58";if(e.dataset.extProcessed)return;e.dataset.extProcessed="true";let l=ae.includes(c),u=ie.includes(p),h=`https://www.dogdrip.net/?mid=dogcon&dogcon_srl=${c}`;if(l||u){let y=document.createElement("div");y.className="ext-dogcon-blocked",y.innerHTML=`\u{1F6AB} <span>${g} (${b}) \uCC28\uB2E8\uB428</span><a href="${h}" target="_blank" class="dogcon-info-link" style="margin-left:6px; color:#0284c7; text-decoration:underline; font-weight:bold;">[\u2139\uFE0F \uC815\uBCF4]</a>`,y.querySelector(".dogcon-info-link").addEventListener("click",M=>{M.stopPropagation()}),y.dataset.srl=c,y.dataset.fileSrl=p,y.dataset.title=g,y.dataset.alt=b,y.dataset.isSingleBlocked=String(u),y.dataset.isGroupBlocked=String(l),y.addEventListener("click",M=>{M.stopPropagation(),M.preventDefault(),n(M,y,!0)}),e.parentNode.insertBefore(y,e),e.remove()}else e.addEventListener("click",y=>{y.stopPropagation(),y.preventDefault();let M=document.createElement("div");M.dataset.srl=c,M.dataset.fileSrl=p,M.dataset.title=g,M.dataset.alt=b,M.dataset.isSingleBlocked="false",M.dataset.isGroupBlocked="false",n(y,M,!1)})}),a.disableVote===!0&&(document.querySelectorAll("td.ed.voteNum.text-primary").forEach(e=>{e.dataset.extVoteProcessed||(e.dataset.extVoteProcessed="true",e.innerHTML='<i class="fas fa-baby"></i>')}),document.querySelectorAll("i.far.fa-thumbs-up").forEach(e=>{if(!e.dataset.extVoteProcessed){e.dataset.extVoteProcessed="true",e.className="fas fa-baby";let c=e.closest("span.text-primary");c?.nextElementSibling?.classList.contains("text-primary")&&c.nextElementSibling.remove()}}),document.querySelectorAll("a.votebtn").forEach(e=>{if(!e.dataset.extVoteProcessed){if(e.dataset.extVoteProcessed="true",e.getAttribute("title")==="\uCD94\uCC9C"){let c=e.querySelector("i");c&&(c.className="fas fa-baby");let p=e.querySelector("span.count");p&&p.remove();let g=e.parentElement;g?.tagName.toLowerCase()==="span"&&(g.parentNode.insertBefore(e,g),g.remove())}e.getAttribute("title")==="\uBE44\uCD94\uCC9C"&&e.remove()}}),document.querySelectorAll("a.comment-item-tool").forEach(e=>{e.classList.remove("border-left-dotted")})),a.preventYoutubeAlgorithm===!0&&document.querySelectorAll('iframe[src*="youtube.com/embed/"]').forEach(e=>{if(!e.dataset.extYoutubeProcessed){e.dataset.extYoutubeProcessed="true";let c=e.getAttribute("src");c&&e.setAttribute("src",c.replace("youtube.com/embed/","youtube-nocookie.com/embed/"))}}),(!a.contentWidth||a.contentWidth.trim()==="")&&document.querySelectorAll(".container").forEach(e=>{e.style.maxWidth="960px"});let Y=a.hiddenMenus||[],G=a.hiddenSubMenus||[];(Y.length>0||G.length>0)&&document.querySelectorAll(".eq.navbar-nav, .eq.nav-menu").forEach(c=>{c.querySelectorAll(":scope > li").forEach(p=>{let g=p.querySelector("a[href]");if(g)try{let l=new URL(g.href,location.origin).pathname.split("/").filter(Boolean)[0]||"";if(Y.includes(l)){p.style.display="none";return}G.length>0&&p.querySelectorAll("ul a[href], .child a[href]").forEach(h=>{let y=new URL(h.href,location.origin),M=ee(y);if(G.includes(M)){let O=h.closest("li");O&&(O.style.display="none")}})}catch{}})}),(Y.length>0||G.length>0)&&document.querySelectorAll(".xe-widget-wrapper").forEach(e=>{let c=e.querySelector(".widget-title-text, .eq.widget-title h4, .eq.widget-title .col-6:first-child");if(!c)return;let p=c.querySelector("a[href]");if(p)try{let g=p.getAttribute("href")||"",b=new URL(g,location.origin),l=b.pathname.split("/").filter(Boolean)[0]||"";if(l&&Y.includes(l)){e.style.display="none";return}if(G.length>0){let u=ee(b);u&&G.includes(u)&&(e.style.display="none")}}catch{}});function ee(e){let p=e.pathname.split("/").filter(Boolean)[0]||"",g=e.searchParams.get("sort_index"),b=e.searchParams.get("category"),l=e.searchParams.get("mid")||p;return g?`${l}__${g}`:b?`${l}__cat_${b}`:p}document.querySelectorAll("li.webzine").forEach(e=>{if(e.dataset.extHotdealProcessed)return;let c=e.querySelector("a.title-link");if(!(!c||!(c.getAttribute("style")||"").includes("line-through"))&&(e.dataset.extHotdealProcessed="true",e.style.position="relative",!e.querySelector(".ext-hotdeal-ended-overlay"))){let g=document.createElement("div");g.className="ext-hotdeal-ended-overlay",e.appendChild(g)}}),document.querySelectorAll("tr.ed").forEach(e=>{if(e.dataset.extHotdealProcessed)return;let c=e.querySelector(".title a[data-document-srl], .title .title-link");if(!c||!(c.getAttribute("style")||"").includes("line-through"))return;e.dataset.extHotdealProcessed="true",e.classList.add("ext-hotdeal-ended-row");let g=e.querySelector("td.title a[data-document-srl]");if(g&&!e.querySelector(".ext-hotdeal-badge")){let b=document.createElement("span");b.className="ext-hotdeal-badge",b.textContent="\uC885\uB8CC",g.parentNode.insertBefore(b,g)}}),i()});Promise.all([w,E]).then(()=>{ne()})}function Ie(t){if(!t)return 0;let o=t.replace(/[vV\s]/g,"").split(".").map(Number),r=o[0]||0,n=o[1]||0,f=o[2]||0;return r*1e6+n*1e3+f}function Ce(t,o){return Ie(t)-Ie(o)}var Be=[{key:"blue",hex:"#3b82f6",name:"\uBE14\uB8E8"},{key:"green",hex:"#10b981",name:"\uADF8\uB9B0"},{key:"red",hex:"#ef4444",name:"\uB808\uB4DC"},{key:"yellow",hex:"#f59e0b",name:"\uC610\uB85C\uC6B0"},{key:"purple",hex:"#8b5cf6",name:"\uD37C\uD50C"},{key:"pink",hex:"#ec4899",name:"\uD551\uD06C"},{key:"cyan",hex:"#06b6d4",name:"\uC2DC\uC548"},{key:"orange",hex:"#f97316",name:"\uC624\uB80C\uC9C0"},{key:"teal",hex:"#14b8a6",name:"\uD2F0\uC77C"},{key:"gray",hex:"#64748b",name:"\uADF8\uB808\uC774"}];(function(){"use strict";let t="1.1.13",o="https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/version.txt",r=new oe;ve();let n="",f="",i="",w="blue",E={memberId:"",nickname:""},a=null,k=document.createElement("div");k.id="ext-block-modal",k.className="ext-modal-overlay",k.innerHTML=`
    <div class="ext-modal-box">
      <p class="ext-modal-title" id="ext-block-msg"></p>
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;">\uCC28\uB2E8 \uC0AC\uC720 (\uC120\uD0DD)</p>
      <input class="ext-modal-input" id="ext-block-reason" placeholder="\uD55C\uAE00, \uC22B\uC790, \uC601\uC5B4, ,. \uB9CC \uC785\uB825 \uAC00\uB2A5" />
      <div class="ext-modal-btns">
        <button class="ext-btn ext-btn-ghost" id="ext-block-cancel">\uCDE8\uC18C</button>
        <button class="ext-btn ext-btn-danger" id="ext-block-confirm">\uCC28\uB2E8</button>
      </div>
    </div>`;let v=document.createElement("div");v.id="ext-memo-modal",v.className="ext-modal-overlay",v.innerHTML=`
    <div class="ext-modal-box">
      <p class="ext-modal-title" id="ext-memo-modal-title"></p>
      <input class="ext-modal-input" id="ext-memo-input" placeholder="\uC774 \uC0AC\uC6A9\uC790\uC5D0 \uB300\uD55C \uBA54\uBAA8..." />
      <p style="margin:0 0 6px;font-size:12px;font-weight:bold;color:#64748b;">\u{1F3A8} \uBC30\uC9C0 \uC0C9\uC0C1</p>
      <div id="ext-memo-color-picker"></div>
      <div class="ext-modal-btns">
        <button class="ext-btn ext-btn-warn" id="ext-memo-delete" style="display:none;">\uC0AD\uC81C</button>
        <button class="ext-btn ext-btn-ghost" id="ext-memo-cancel">\uCDE8\uC18C</button>
        <button class="ext-btn ext-btn-primary" id="ext-memo-confirm">\uC800\uC7A5</button>
      </div>
    </div>`;let q=document.createElement("div");q.id="ext-dogcon-menu";let N=document.createElement("div");N.id="ext-gear-wrap";let I=document.createElement("div");I.id="ext-update-badge",I.textContent="NEW";let D=document.createElement("button");D.id="ext-gear-btn",D.title="\uAC1C\uB4DC\uB9BD Plus+ \uC124\uC815",D.textContent="\u2699\uFE0F",N.appendChild(I),N.appendChild(D);let W=document.createElement("div");W.id="ext-settings-panel",W.innerHTML=Ee();function R(){return document.body?(document.getElementById("ext-block-modal")||(document.body.appendChild(k),document.body.appendChild(v),document.body.appendChild(q),document.body.appendChild(N),document.body.appendChild(W),ie(),J(),we(r,D,I,W,t)),!0):!1}if(!R()){let d=new MutationObserver(()=>{R()&&d.disconnect()});d.observe(document,{childList:!0,subtree:!0})}function z(d,m){n=d,f=m,document.getElementById("ext-block-reason").value="",document.getElementById("ext-block-msg").innerHTML=`<strong>${d}${m?`(${m})`:""}</strong>\uB2D8\uC744 \uCC28\uB2E8\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?<br/><small style="color:#64748b;">\uCC28\uB2E8 \uC2DC \uD574\uB2F9 \uC0AC\uC6A9\uC790\uC758 \uAE00\xB7\uB313\uAE00\uC774 \uC228\uACA8\uC9D1\uB2C8\uB2E4.</small>`,k.classList.add("show"),setTimeout(()=>document.getElementById("ext-block-reason").focus(),50)}function C(){k.classList.remove("show"),n="",f=""}function ie(){k.querySelector("#ext-block-reason")?.addEventListener("input",m=>{m.target.value=m.target.value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9.,\s]/g,"")}),k.querySelector("#ext-block-cancel")?.addEventListener("click",C),k.addEventListener("click",m=>{m.target===k&&C()}),k.querySelector("#ext-block-confirm")?.addEventListener("click",()=>{if(!n||!f){C();return}let m=k.querySelector("#ext-block-reason").value.trim(),s={date:new Date().toISOString().slice(0,10),member_num:String(f).trim(),memo:m};r.get(["blocked_users"]).then(L=>{let S=L.blocked_users||[];S.some(H=>String(H.member_num)===String(f))?(alert("\uC774\uBBF8 \uCC28\uB2E8\uB41C \uC0AC\uC6A9\uC790\uC785\uB2C8\uB2E4."),C()):(S.push(s),r.set({blocked_users:S}).then(()=>{C(),location.reload()}))})})}function ae(d,m,x){i=m;let s="",L="blue";if(x)if(x.includes(":")){let H=x.split(":");s=H[0],L=H[1]||"blue"}else s=x;w=L,document.getElementById("ext-memo-modal-title").innerHTML=`\u{1F4DD} <strong>${d}</strong> \uBA54\uBAA8`;let S=document.getElementById("ext-memo-input");S.value=s,document.getElementById("ext-memo-delete").style.display=s?"block":"none",U(),v.classList.add("show"),setTimeout(()=>S.focus(),50)}function _(){v.classList.remove("show"),i=""}function U(){let d=document.getElementById("ext-memo-color-picker");d&&(d.innerHTML="",Be.forEach(m=>{let x=document.createElement("div");x.className=`ext-color-chip${w===m.key?" selected":""}`,x.style.background=m.hex,x.title=m.key,x.addEventListener("click",()=>{w=m.key,d.querySelectorAll(".ext-color-chip").forEach(s=>s.classList.remove("selected")),x.classList.add("selected")}),d.appendChild(x)}))}function J(){v.querySelector("#ext-memo-cancel")?.addEventListener("click",_),v.addEventListener("click",x=>{x.target===v&&_()});let d=v.querySelector("#ext-memo-input"),m=v.querySelector("#ext-memo-confirm");d?.addEventListener("keydown",x=>{x.key==="Enter"&&(x.preventDefault(),m.click())}),m?.addEventListener("click",()=>{if(!i){_();return}let x=d.value.trim();r.get(["userMemos"]).then(s=>{let L=s.userMemos||{};x?L[i]=`${x}:${w}`:delete L[i],r.set({userMemos:L}).then(()=>{_(),location.reload()})})}),v.querySelector("#ext-memo-delete")?.addEventListener("click",()=>{if(!i){_();return}r.get(["userMemos"]).then(x=>{let s=x.userMemos||{};delete s[i],r.set({userMemos:s}).then(()=>{_(),location.reload()})})})}function be(d,m,x){a={srl:m.dataset.srl,fileSrl:m.dataset.fileSrl,title:m.dataset.title,alt:m.dataset.alt,isSingleBlocked:m.dataset.isSingleBlocked==="true",isGroupBlocked:m.dataset.isGroupBlocked==="true"};let s=a,L=`https://www.dogdrip.net/?mid=dogcon&dogcon_srl=${s.srl}`,S=s.isSingleBlocked?"\u{1F7E2} \uC774 \uAC1C\uB4DC\uB9BD\uCF58 \uCC28\uB2E8 \uD574\uC81C":"\u274C \uC774 \uAC1C\uB4DC\uB9BD\uCF58\uB9CC \uCC28\uB2E8",H=s.isGroupBlocked?"\u{1F7E2} \uC774 \uADF8\uB8F9 \uC804\uCCB4 \uCC28\uB2E8 \uD574\uC81C":"\u274C \uC774 \uAC1C\uB4DC\uB9BD\uCF58 \uADF8\uB8F9 \uC804\uCCB4 \uCC28\uB2E8",V=s.isSingleBlocked?"unblock-action":"block-action",X=s.isGroupBlocked?"unblock-action":"block-action",B=s.isGroupBlocked?"":`<div class="dogcon-menu-item ${V}" id="ext-dc-single">${S}</div>`;q.innerHTML=`${B}<div class="dogcon-menu-item ${X}" id="ext-dc-group">${H}</div>
      <div style="border-top:1px solid #e2e8f0;margin-top:4px;padding-top:4px;">
        <a href="${L}" target="_blank" class="dogcon-menu-item" style="text-decoration:none;color:#475569;">\u{1F517} ${s.title} \uC815\uBCF4</a>
      </div>`,q.style.left=`${d.pageX}px`,q.style.top=`${d.pageY}px`,q.style.display="block",q.querySelector("#ext-dc-single")?.addEventListener("click",Y),q.querySelector("#ext-dc-group")?.addEventListener("click",G)}function Y(){if(!a)return;let d=a.fileSrl,m=`${a.title}(${a.alt})`;r.get(["blockedDogcons"]).then(x=>{let s=x.blockedDogcons||[];a.isSingleBlocked?s=s.filter(L=>L.id!==d):s.some(L=>L.id===d)||s.push({id:d,name:m}),r.set({blockedDogcons:s}).then(()=>location.reload())})}function G(){if(!a)return;let d=a.srl,m=a.title;r.get(["blockedDogconGroups"]).then(x=>{let s=x.blockedDogconGroups||[];a.isGroupBlocked?s=s.filter(L=>L.id!==d):s.some(L=>L.id===d)||s.push({id:d,name:m}),r.set({blockedDogconGroups:s}).then(()=>location.reload())})}document.addEventListener("click",d=>{let m=document.getElementById("ext-dogcon-menu");m&&(m.style.display="none");let x=d.target.closest('a[class*="member_"]');if(x){let s=x.className.match(/member_(\d+)/);s&&(E.memberId=s[1],E.nickname=x.textContent.trim());let L=document.getElementById("popup_menu_area");L&&window.getComputedStyle(L).display!=="none"&&e(L)}});function ee(d,m,x,s){let L=document.getElementById("popup_menu_area");if(!L)return;let S=L.querySelector("ul");if(!S)return;S.querySelectorAll(".ext-ins-block, .ext-ins-memo").forEach(P=>P.remove());let H=s.includes(":")?s.split(":")[0]:s,V=document.createElement("li");V.className="ext-ins-memo";let X=H?` <span style="font-size:11px;color:#64748b;">(${H.length>8?H.slice(0,8)+"...":H})</span>`:"";V.innerHTML=`<a href="#" style="color:#0284c7;font-weight:bold;">\uBA54\uBAA8${X}</a>`,V.querySelector("a").addEventListener("click",P=>{P.preventDefault(),P.stopPropagation(),L.style.display="none",ae(m,d,s)});let B=document.createElement("li");B.className="ext-ins-block",x?(B.innerHTML=`<a href="#" style="color:#${le};font-weight:bold;">\uCC28\uB2E8 \uD574\uC81C</a>`,B.querySelector("a").addEventListener("click",P=>{P.preventDefault(),P.stopPropagation(),L.style.display="none",r.get(["blocked_users"]).then(De=>{let $e=(De.blocked_users||[]).filter(Ne=>String(Ne.member_num)!==d);r.set({blocked_users:$e}).then(()=>location.reload())})})):(B.innerHTML=`<a href="#" style="color:#${re};font-weight:bold;">\uCC28\uB2E8</a>`,B.querySelector("a").addEventListener("click",P=>{P.preventDefault(),P.stopPropagation(),L.style.display="none",z(m,d)})),S.appendChild(V),S.appendChild(B)}function e(d){let m=window.getComputedStyle(d);if(!(m.display==="none"||m.visibility==="hidden")){if(!E.memberId){let x=d.querySelector('a[class*="member_"]')||document.querySelector('a[class*="member_"]:focus');if(x){let s=x.className.match(/member_(\d+)/);s&&(E.memberId=s[1],E.nickname=x.textContent.trim())}if(!E.memberId)return}r.get(["blocked_users","userMemos"]).then(x=>{let s=x.blocked_users||[],L=x.userMemos||{},S=s.some(H=>String(H.member_num)===E.memberId);ee(E.memberId,E.nickname,S,L[E.memberId]||"")})}}let c=new MutationObserver(d=>{for(let m of d)m.type==="childList"?m.addedNodes.forEach(x=>{if(x.nodeType!==Node.ELEMENT_NODE)return;let s=x,L=s.querySelector?.("img.dogcon-clickable, img[data-dogcon-srl]"),S=s.querySelector?.('a[class*="member_"]');if((L||S||["IMG","DIV","LI","TR","A"].includes(s.tagName))&&setTimeout(()=>{F(document.body),(document.querySelectorAll("img.dogcon-clickable:not([data-ext-processed]), img[data-dogcon-srl]:not([data-ext-processed])").length||S)&&y(80)},50),s.id==="popup_menu_area")e(s);else{let H=s.querySelector?.("#popup_menu_area");H&&e(H)}}):m.type==="attributes"&&m.attributeName==="style"&&m.target.id==="popup_menu_area"&&e(m.target)}),p=new MutationObserver(d=>{for(let m of d)for(let x of m.addedNodes){if(x.nodeType!==1)continue;let s=x;if(s.matches?.("tr.ed, li.webzine, li.ed, div.ed.board-item")||s.querySelector?.("tr.ed, li.webzine, li.ed, div.ed.board-item")){y(80);return}}});function g(){c.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["style","class"]});let d=document.getElementById("popup_menu_area");d&&new MutationObserver(()=>e(d)).observe(d,{attributes:!0,attributeFilter:["style","class"]})}function b(){p.observe(document.body,{childList:!0,subtree:!0})}function l(){fetch(o+"?_="+Date.now()).then(d=>d.ok?d.text():null).then(d=>{if(!d)return;let m=d.trim();m&&(window._extLatestVersion=m,Ce(m,t)>0&&(D.classList.add("has-update"),I.textContent="v"+m,I.classList.add("show"),D.title=`\uAC1C\uB4DC\uB9BD Plus+ \uC124\uC815 (\uC5C5\uB370\uC774\uD2B8 \uC788\uC74C: v${m})`))}).catch(()=>{})}let u={storage:r,openBlockModal:z,openDogconMenu:be,injectDownloadAllButton:te,injectCopyLinkButton:M},h=null;function y(d=120){h&&clearTimeout(h),h=setTimeout(()=>qe(u),d)}function M(){document.querySelectorAll(".ed.article-head.margin-bottom-large .ed.margin-xxsmall.text-default").forEach(d=>{if(d.querySelector(".ext-copy-link-btn")||!d.querySelector("i.fas.fa-link"))return;let m=d.querySelector("a[href]");if(!m)return;let x=m.href,s=document.createElement("button");s.className="ext-copy-link-btn",s.textContent="\uB9C1\uD06C \uBCF5\uC0AC",s.addEventListener("click",L=>{L.preventDefault(),L.stopPropagation(),navigator.clipboard.writeText(x).then(()=>{s.textContent="\uBCF5\uC0AC\uB428 \u2713",setTimeout(()=>{s.textContent="\uB9C1\uD06C \uBCF5\uC0AC"},1500)}).catch(()=>{let S=document.createElement("textarea");S.value=x,S.style.position="fixed",S.style.opacity="0",document.body.appendChild(S),S.select(),document.execCommand("copy"),document.body.removeChild(S),s.textContent="\uBCF5\uC0AC\uB428 \u2713",setTimeout(()=>{s.textContent="\uB9C1\uD06C \uBCF5\uC0AC"},1500)})}),d.appendChild(s),O(d)})}function O(d){if(d.querySelector(".ext-reader-mode-btn"))return;let m=document.createElement("button");m.className="ext-reader-mode-btn ext-copy-link-btn";let x=()=>document.documentElement.classList.contains("ext-reader-mode"),s=()=>{m.textContent=x()?"\uC77D\uAE30 \uBAA8\uB4DC \uC885\uB8CC":"\uC77D\uAE30 \uBAA8\uB4DC"};s(),m.addEventListener("click",L=>{if(L.preventDefault(),L.stopPropagation(),document.documentElement.classList.toggle("ext-reader-mode"),s(),x()){let S=document.querySelector(".ed.article-head.margin-bottom-large");S&&S.scrollIntoView({behavior:"smooth",block:"start"})}}),d.appendChild(m)}function te(d){if(!d||d.querySelector(".ext-dl-all-btn"))return;let m=Array.from(d.querySelectorAll("li a[href*='procFileDownload']"));if(m.length<2)return;let x=300,s=document.createElement("li");s.style.cssText="border-bottom: 1px solid #e2e8f0; margin-bottom: 4px; padding-bottom: 4px;";let L=document.createElement("a");L.className="ext-dl-all-btn",L.href="#",L.innerHTML=`<i class="fas fa-download"></i> <span>\uC804\uCCB4 \uB2E4\uC6B4\uB85C\uB4DC (${m.length}\uAC1C)</span>`,L.addEventListener("click",S=>{S.preventDefault(),S.stopPropagation();let H=L.querySelector("span");H.textContent=`\uB2E4\uC6B4\uB85C\uB4DC \uC911... (${m.length}\uAC1C)`,L.style.color="#64748b",m.forEach((V,X)=>{setTimeout(()=>{let B=document.createElement("a");B.href=V.href,B.download="",B.style.display="none",document.body.appendChild(B),B.click(),document.body.removeChild(B)},X*x)}),setTimeout(()=>{H.textContent=`\uC804\uCCB4 \uB2E4\uC6B4\uB85C\uB4DC (${m.length}\uAC1C)`,L.style.color="#0284c7"},m.length*x+500)}),s.appendChild(L),d.insertBefore(s,d.firstChild)}function Ae(){if(document.getElementById("ext-loading-overlay"))return;let d=document.createElement("div");d.id="ext-loading-overlay",d.innerHTML='<div class="ext-spinner"></div><div class="ext-loading-text">\uD398\uC774\uC9C0 \uCD5C\uC801\uD654 \uC911...</div>',document.documentElement.appendChild(d)}Ae(),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>y(300)):y(100),document.body?(g(),b()):document.addEventListener("DOMContentLoaded",()=>{g(),b()}),window.addEventListener("load",()=>{ne(),y(500),setTimeout(l,5e3),he()})})();})();
