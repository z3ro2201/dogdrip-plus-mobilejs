// ==UserScript==
// @name         개드립 Plus+ (Userscript)
// @namespace    https://github.com/z3ro2201/dogdrip-plus-mobilejs
// @version      1.1.10
// @description  개드립(dogdrip.net) 사용자차단 / 개드립콘차단 / 키워드차단 / 메모등록 / 설정 백업·복구 (모바일 지원)
// @author       z3ro2201
// @match        *://*.dogdrip.net/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @run-at       document-start
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/dogdrip-plus.user.js
// @downloadURL  https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/dogdrip-plus.user.js
// ==/UserScript==

"use strict";(()=>{var se="ddplus_";function de(e){if(e!=null){if(typeof e=="string")try{return JSON.parse(e)}catch{return e}return e}}function ce(e){return typeof e=="string"?e:JSON.stringify(e)}var me=typeof GM_getValue=="function"?{async get(e){try{return de(GM_getValue(e,null))}catch(t){console.warn("[\uAC1C\uB4DC\uB9BDPlus] GM_getValue \uC624\uB958:",e,t);return}},async set(e,t){try{GM_setValue(e,ce(t))}catch(r){console.warn("[\uAC1C\uB4DC\uB9BDPlus] GM_setValue \uC624\uB958:",e,r)}},async remove(e){try{GM_deleteValue(e)}catch{}}}:typeof GM<"u"&&typeof GM.getValue=="function"?{async get(e){try{return de(await GM.getValue(e,null))}catch(t){console.warn("[\uAC1C\uB4DC\uB9BDPlus] GM.getValue \uC624\uB958:",e,t);return}},async set(e,t){try{await GM.setValue(e,ce(t))}catch(r){console.warn("[\uAC1C\uB4DC\uB9BDPlus] GM.setValue \uC624\uB958:",e,r)}},async remove(e){try{await GM.deleteValue(e)}catch{}}}:(console.warn("[\uAC1C\uB4DC\uB9BDPlus] GM API \uC5C6\uC74C \u2192 localStorage \uD3F4\uBC31"),{async get(e){try{return de(localStorage.getItem(se+e))}catch{return}},async set(e,t){try{localStorage.setItem(se+e,ce(t))}catch{}},async remove(e){try{localStorage.removeItem(se+e)}catch{}}}),oe=class{async get(t){let r=Array.isArray(t)?t:[t],n={};return await Promise.all(r.map(async f=>{let i=await me.get(f);i!==void 0&&(n[f]=i)})),n}async set(t){await Promise.all(Object.entries(t).map(([r,n])=>me.set(r,n)))}async remove(t){await me.remove(t)}};function Oe(){let e=document.querySelector('[class*="rhymix_content"][class*="xe_content"]');return e?Array.from(e.querySelectorAll("img")).filter(t=>{if(t.classList.contains("dogcon-clickable")||t.hasAttribute("data-dogcon-srl")||t.hasAttribute("data-dogcon-file-srl")||t.naturalWidth>0&&t.naturalWidth<=32||t.width>0&&t.width<=32)return!1;let r=t.getAttribute("src")||t.src;return!(!r||r.startsWith("data:"))}).map(t=>{let r=new URL(t.getAttribute("src")||t.src,location.origin).href,n=decodeURIComponent(r.split("/").pop()?.split("?")[0]||r);return{src:r,filename:n}}):[]}var $=0,j=[],T=null,xe=!1;function he(){let e=document.querySelector('[class*="rhymix_content"][class*="xe_content"]');if(!e)return;let t=Array.from(e.querySelectorAll("img")).filter(r=>{if(r.classList.contains("dogcon-clickable")||r.hasAttribute("data-dogcon-srl")||r.hasAttribute("data-dogcon-file-srl")||r.naturalWidth>0&&r.naturalWidth<=32||r.width>0&&r.width<=32)return!1;let n=r.getAttribute("src")||r.src;return!(!n||n.startsWith("data:"))});t.length&&t.forEach((r,n)=>{r.dataset.extGalleryBound||(r.dataset.extGalleryBound="true",r.style.cursor="zoom-in",r.addEventListener("click",f=>{f.preventDefault(),f.stopPropagation();let i=Oe();Ge(i,n)}))})}function Ge(e,t){e.length&&(j=e,$=t,T||(T=ze(),document.body.appendChild(T)),xe||(Re(),xe=!0),Pe(),T.style.display="flex",document.body.style.overflow="hidden",ye())}function ue(){T&&(T.style.display="none"),document.body.style.overflow=""}function Z(e){$=(e+j.length)%j.length,ye()}function ye(){if(!T)return;let e=j[$];T.querySelector("#ext-gallery-main-img").src=e.src,T.querySelector("#ext-gallery-filename").textContent=e.filename,T.querySelector("#ext-gallery-counter").textContent=`${$+1} / ${j.length}`,T.querySelectorAll(".ext-gallery-thumb").forEach((f,i)=>{f.classList.toggle("active",i===$),i===$&&f.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"})});let t=T.querySelector("#ext-gallery-prev"),r=T.querySelector("#ext-gallery-next"),n=j.length<=1;t.style.visibility=n?"hidden":"visible",r.style.visibility=n?"hidden":"visible"}function Pe(){if(!T)return;let e=T.querySelector("#ext-gallery-strip");e.innerHTML="",j.forEach((t,r)=>{let n=document.createElement("img");n.src=t.src,n.className="ext-gallery-thumb",n.alt=t.filename,n.title=t.filename,n.addEventListener("click",()=>Z(r)),e.appendChild(n)})}function ze(){if(!document.getElementById("ext-gallery-style")){let t=document.createElement("style");t.id="ext-gallery-style",t.textContent=`
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
    `,(document.head||document.documentElement).appendChild(t)}let e=document.createElement("div");return e.id="ext-gallery-overlay",e.innerHTML=`
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
  `,e}function Re(){if(!T)return;T.querySelector("#ext-gallery-close").addEventListener("click",ue),T.querySelector("#ext-gallery-prev").addEventListener("click",()=>Z($-1)),T.querySelector("#ext-gallery-next").addEventListener("click",()=>Z($+1));let e=T.querySelector("#ext-gallery-download");T.querySelector("#ext-gallery-main-img").addEventListener("load",()=>{let t=j[$];t&&(e.href=t.src,e.download=t.filename)}),T.addEventListener("click",t=>{t.target===T&&ue()}),document.addEventListener("keydown",t=>{if(!(!T||T.style.display==="none"))switch(t.key){case"ArrowLeft":Z($-1);break;case"ArrowRight":Z($+1);break;case"Escape":case"Esc":ue();break}})}function ve(){if(document.getElementById("ext-mobile-style"))return;let e=document.createElement("style");e.id="ext-mobile-style",e.textContent=`
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
  `,(document.head||document.documentElement).appendChild(e)}function Ee(){return`
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
    </div>`}var pe=0,ke=!1;function Ve(e,t){pe=window.scrollY,document.body.style.cssText+=";overflow:hidden;position:fixed;top:-"+pe+"px;left:0;right:0;",t.classList.add("show"),Me("tab-block-user",e),He(e),je(e,t)}function be(e){e.classList.remove("show"),document.body.style.overflow="",document.body.style.position="",document.body.style.top="",document.body.style.left="",document.body.style.right="",window.scrollTo(0,pe)}function we(e,t,r,n,f){t.addEventListener("click",()=>{if(t.classList.contains("has-update")&&window._extLatestVersion&&confirm(`\u{1F195} \uC0C8 \uBC84\uC804\uC774 \uC788\uC2B5\uB2C8\uB2E4!
\uD604\uC7AC: v${f}  \u2192  \uCD5C\uC2E0: v${window._extLatestVersion}

\uC5C5\uB370\uC774\uD2B8 \uD398\uC774\uC9C0\uB85C \uC774\uB3D9\uD560\uAE4C\uC694?`)){window.open("https://github.com/z3ro2201/dogdrip-plus-mobilejs/raw/main/dogdrip-plus.user.js","_blank");return}Ve(e,n)}),n.querySelector("#ext-settings-close")?.addEventListener("click",()=>be(n)),n.addEventListener("click",i=>{i.target===n&&be(n)}),n.querySelectorAll(".ext-tab").forEach(i=>{i.addEventListener("click",()=>{n.querySelectorAll(".ext-tab").forEach(E=>E.classList.remove("active")),n.querySelectorAll(".ext-tab-panel").forEach(E=>E.classList.remove("active")),i.classList.add("active");let w=i.dataset.tab;n.querySelector(`#${w}`)?.classList.add("active"),Me(w,e)})}),n.querySelector("#s-kw-add")?.addEventListener("click",()=>{let i=n.querySelector("#s-kw-word").value.trim();if(!i){alert("\uD0A4\uC6CC\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694.");return}let w=n.querySelector("#s-kw-target").value,E=n.querySelector("#s-kw-method").value;e.get(["keywords"]).then(a=>{let v=a.keywords||[];if(v.some(y=>(y.word||y.keyword)===i)){alert("\uC774\uBBF8 \uB4F1\uB85D\uB41C \uD0A4\uC6CC\uB4DC\uC785\uB2C8\uB2E4.");return}v.push({date:new Date().toISOString().slice(0,10),word:i,method:E,target:w}),e.set({keywords:v}).then(()=>{n.querySelector("#s-kw-word").value="",fe(e)})})}),n.querySelector("#s-backup")?.addEventListener("click",()=>Ue(e)),n.querySelector("#s-restore-btn")?.addEventListener("click",()=>n.querySelector("#s-restore-file").click()),n.querySelector("#s-restore-file")?.addEventListener("change",i=>We(i,e)),n.querySelector("#s-restore-pp-btn")?.addEventListener("click",()=>n.querySelector("#s-restore-pp-file").click()),n.querySelector("#s-restore-pp-file")?.addEventListener("change",i=>Ye(i,e))}function je(e,t){if(ke)return;ke=!0,[["s-hide-notice","hideNotice"],["s-hide-popular","hidePopular"],["s-compact","compactMode"],["s-disable-vote","disableVote"],["s-no-yt","preventYoutubeAlgorithm"],["s-hide-level-icon","hideLevelIcon"]].forEach(([n,f])=>{t.querySelector(`#${n}`)?.addEventListener("change",i=>{let w=i.target.checked;e.set({[f]:w}).then(()=>{e.get(["hideNotice","hidePopular","hideSidebar","compactMode","disableVote"]).then(Fe)})})}),["s-bm-remove","s-bm-blind","s-bm-badge"].forEach(n=>{t.querySelector(`#${n}`)?.addEventListener("change",f=>{f.target.checked&&e.set({blockMethod:f.target.value}).then(()=>{be(t),location.reload()})})})}function Me(e,t){switch(e){case"tab-block-user":Se(t);break;case"tab-keyword":fe(t);break;case"tab-dogcon":Te(t);break;case"tab-memo":_e(t);break;case"tab-display":He(t);break}}function Se(e){e.get(["blocked_users"]).then(t=>{let r=t.blocked_users||[],n=document.getElementById("s-block-list");if(!n)return;n.innerHTML="";let f=document.getElementById("s-block-count");if(f&&(f.textContent=r.length?`(${r.length}\uBA85)`:""),!r.length){n.innerHTML='<span class="ext-empty-msg">\uCC28\uB2E8\uB41C \uC0AC\uC6A9\uC790\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</span>';return}r.forEach(i=>{let w=document.createElement("span");w.className="ext-badge-item",w.innerHTML=`<span>\u{1F464} ${i.member_num}${i.memo?` <em style="color:#64748b;font-style:normal;font-size:11px;">(${i.memo})</em>`:""}</span>`;let E=document.createElement("button");E.className="ext-badge-del",E.textContent="\xD7",E.addEventListener("click",()=>{confirm(`${i.member_num} \uCC28\uB2E8\uC744 \uD574\uC81C\uD560\uAE4C\uC694?`)&&e.get(["blocked_users"]).then(a=>{let v=(a.blocked_users||[]).filter(y=>y.member_num!==i.member_num);e.set({blocked_users:v}).then(Se.bind(null,e))})}),w.appendChild(E),n.appendChild(w)})})}function fe(e){e.get(["keywords"]).then(t=>{let r=t.keywords||[],n=document.getElementById("s-kw-list");if(!n)return;if(n.innerHTML="",!r.length){n.innerHTML='<span class="ext-empty-msg">\uCC28\uB2E8 \uD0A4\uC6CC\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</span>';return}let f={all:"\uC804\uCCB4",posts:"\uAC8C\uC2DC\uAE00",post:"\uAC8C\uC2DC\uAE00",comments:"\uB313\uAE00",comment:"\uB313\uAE00"},i={includes:"\uD3EC\uD568",starts:"\uC2DC\uC791"};r.forEach(w=>{let E=w.word||w.keyword,a=document.createElement("span");a.className="ext-badge-item",a.innerHTML=`<span>\u2328\uFE0F ${E}<br/><em style="font-size:10px;color:#2563eb;font-style:normal;">[${f[w.target]||"\uC804\uCCB4"}] [${i[w.method]||"\uD3EC\uD568"}]</em></span>`;let v=document.createElement("button");v.className="ext-badge-del",v.textContent="\xD7",v.addEventListener("click",y=>{y.stopPropagation(),e.get(["keywords"]).then(q=>{let N=(q.keywords||[]).filter(I=>(I.word||I.keyword)!==E);e.set({keywords:N}).then(fe.bind(null,e))})}),a.appendChild(v),n.appendChild(a)})})}function Te(e){e.get(["blockedDogcons","blockedDogconGroups"]).then(t=>{Le(t.blockedDogcons||[],"s-dogcon-list","blockedDogcons",r=>r.name,"\uCC28\uB2E8\uB41C \uAC1C\uB4DC\uB9BD\uCF58\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",e),Le(t.blockedDogconGroups||[],"s-dogcon-group-list","blockedDogconGroups",r=>r.name,"\uCC28\uB2E8\uB41C \uADF8\uB8F9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",e)})}function Le(e,t,r,n,f,i){let w=document.getElementById(t);if(w){if(w.innerHTML="",!e.length){w.innerHTML=`<span class="ext-empty-msg">${f}</span>`;return}e.forEach(E=>{let a=document.createElement("span");a.className="ext-badge-item",a.innerHTML=`<span>${n(E)}</span>`;let v=document.createElement("button");v.className="ext-badge-del",v.textContent="\xD7",v.addEventListener("click",()=>{i.get([r]).then(y=>{let q=(y[r]||[]).filter(N=>N.id!==E.id);i.set({[r]:q}).then(()=>Te(i))})}),a.appendChild(v),w.appendChild(a)})}}function _e(e){e.get(["userMemos"]).then(t=>{let r=t.userMemos||{},n=document.getElementById("s-memo-list");if(!n)return;n.innerHTML="";let f=Object.keys(r);if(!f.length){n.innerHTML='<span class="ext-empty-msg">\uB4F1\uB85D\uB41C \uBA54\uBAA8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</span>';return}f.forEach(i=>{let w=r[i],E=w,a="blue";if(w.includes(":")){let y=w.split(":");E=y[0],a=y[1]||"blue"}let v=document.createElement("span");v.className=`ext-badge-item ext-user-memo-badge ext-memo-${a}`,v.style.cssText="cursor:pointer;",v.title=`ID: ${i} / \uD074\uB9AD\uD558\uBA74 \uC0AD\uC81C`,v.innerHTML=`${E} <small>(${i})</small>`,v.addEventListener("click",()=>{confirm(`"${E}" \uBA54\uBAA8\uB97C \uC0AD\uC81C\uD560\uAE4C\uC694?`)&&e.get(["userMemos"]).then(y=>{let q=y.userMemos||{};delete q[i],e.set({userMemos:q}).then(()=>_e(e))})}),n.appendChild(v)})})}function Fe(e){let t=document.documentElement;t.classList.toggle("ext-hide-notice",!!e.hideNotice),t.classList.toggle("ext-hide-popular",!!e.hidePopular),t.classList.toggle("ext-hide-sidebar",!!e.hideSidebar),t.classList.toggle("ext-hide-compact",!!e.compactMode),t.classList.toggle("ext-hide-vote",!!e.disableVote)}function He(e){e.get(["hideNotice","hidePopular","hideSidebar","compactMode","disableVote","preventYoutubeAlgorithm","hideLevelIcon","blockMethod"]).then(t=>{[["s-hide-notice","hideNotice"],["s-hide-popular","hidePopular"],["s-hide-sidebar","hideSidebar"],["s-compact","compactMode"],["s-disable-vote","disableVote"],["s-no-yt","preventYoutubeAlgorithm"],["s-hide-level-icon","hideLevelIcon"]].forEach(([i,w])=>{let E=document.getElementById(i);E&&(E.checked=!!t[w])});let n=t.blockMethod||"remove",f=document.getElementById(`s-bm-${n}`);f&&(f.checked=!0)})}function Ue(e){e.get(["keywords","blocked_users","blockedDogcons","blockedDogconGroups","hideNotice","hidePopular","hideSidebar","compactMode","disableVote","preventYoutubeAlgorithm","contentWidth","blockMethod","userMemos","hideLevelIcon"]).then(t=>{let r=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),n=URL.createObjectURL(r),f=document.createElement("a");f.href=n,f.download=`dogdrip_plus_backup_${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(f),f.click(),document.body.removeChild(f),URL.revokeObjectURL(n)})}function We(e,t){let r=e.target.files?.[0];if(!r)return;let n=new FileReader;n.onload=f=>{try{let i=JSON.parse(f.target.result),w=(i.keywords||[]).map(a=>typeof a=="string"?{date:"",method:"includes",target:"all",word:a}:{date:a.date||"",method:a.method||"includes",target:a.target||"all",word:a.word||a.keyword}),E=(i.blocked_users||i.nicknames||[]).map(a=>{if(typeof a=="string"&&a.includes(":")){let v=a.split(":");return{date:"",member_num:v[0].trim(),memo:v[2]||""}}return{date:a.date||"",member_num:String(a.member_num||"").trim(),memo:a.memo||""}});t.set({keywords:w,blocked_users:E,blockedDogcons:i.blockedDogcons||[],blockedDogconGroups:i.blockedDogconGroups||[],hideNotice:!!i.hideNotice,hidePopular:!!i.hidePopular,hideSidebar:!!i.hideSidebar,compactMode:!!i.compactMode,disableVote:!!i.disableVote,preventYoutubeAlgorithm:!!i.preventYoutubeAlgorithm,contentWidth:i.contentWidth||"",blockMethod:i.blockMethod||"remove",userMemos:i.userMemos||{}}).then(()=>{alert("\u{1F389} \uBCF5\uAD6C \uC644\uB8CC! \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C\uACE0\uCE68\uD569\uB2C8\uB2E4."),location.reload()})}catch{alert("\u274C \uD30C\uC77C \uD615\uC2DD \uC624\uB958: \uC62C\uBC14\uB978 \uBC31\uC5C5 JSON \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.")}e.target.value=""},n.readAsText(r)}function Ye(e,t){let r=e.target.files?.[0];if(!r)return;let n=new FileReader;n.onload=f=>{try{let i=JSON.parse(f.target.result),w=Array.isArray(i.blocked_members)?i.blocked_members:[],E=Array.isArray(i.keywords)?i.keywords:[],a=w.map(y=>({date:y.date||"",member_num:String(y.member_num||"").trim(),memo:y.memo||""})),v=E.map(y=>({date:y.date||"",method:y.method||"includes",target:y.target||"all",word:y.keyword||y.word||""}));t.get(["blockedDogcons","blockedDogconGroups","hideNotice","hidePopular","hideSidebar","compactMode","disableVote","preventYoutubeAlgorithm","contentWidth","blockMethod","userMemos"]).then(y=>{t.set({keywords:v,blocked_users:a,blockedDogcons:y.blockedDogcons||[],blockedDogconGroups:y.blockedDogconGroups||[],hideNotice:!!y.hideNotice,hidePopular:!!y.hidePopular,hideSidebar:!!y.hideSidebar,compactMode:!!y.compactMode,disableVote:!!y.disableVote,preventYoutubeAlgorithm:!!y.preventYoutubeAlgorithm,contentWidth:y.contentWidth||"",blockMethod:y.blockMethod||"remove",userMemos:y.userMemos||{}}).then(()=>{alert(`\u{1F389} Dogdrip++ \uB370\uC774\uD130 \uBCF5\uC6D0 \uC644\uB8CC!
\uCC28\uB2E8 \uC720\uC800 ${a.length}\uBA85, \uD0A4\uC6CC\uB4DC ${v.length}\uAC1C\uB97C \uAC00\uC838\uC654\uC2B5\uB2C8\uB2E4.
\uD398\uC774\uC9C0\uB97C \uC0C8\uB85C\uACE0\uCE68\uD569\uB2C8\uB2E4.`),location.reload()})})}catch{alert("\u274C \uD30C\uC77C \uD615\uC2DD \uC624\uB958: Dogdrip++ \uBC31\uC5C5 JSON \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.")}e.target.value=""},n.readAsText(r)}function K(e,t){return`<div class="ext-blind-wrapper">
    <div class="ext-blind-label">
      <span>\u{1F6AB} \uCC28\uB2E8\uB41C ${e}\uC785\uB2C8\uB2E4.</span>
      <button class="ext-blind-toggle-btn">\uB0B4\uC6A9 \uBCF4\uAE30</button>
    </div>
    <div class="ext-blind-content" style="display:none;">${t}</div>
  </div>`}function F(e){e.querySelectorAll(".ext-blind-wrapper:not([data-bound])").forEach(t=>{t.dataset.bound="true";let r=t.querySelector(".ext-blind-toggle-btn"),n=t.querySelector(".ext-blind-content");!r||!n||(r.addEventListener("click",f=>{f.preventDefault(),f.stopPropagation();let i=n.style.display!=="none";n.style.display=i?"none":"block",r.textContent=i?"\uB0B4\uC6A9 \uBCF4\uAE30":"\uB0B4\uC6A9 \uC228\uAE30\uAE30"}),t.addEventListener("mouseenter",()=>{n.style.display==="none"&&(n.style.display="block",r.textContent="\uB0B4\uC6A9 \uC228\uAE30\uAE30")}),t.addEventListener("mouseleave",()=>{t.dataset.pinned!=="true"&&(n.style.display="none",r.textContent="\uB0B4\uC6A9 \uBCF4\uAE30")}),r.addEventListener("click",f=>{f.stopPropagation(),t.dataset.pinned=t.dataset.pinned==="true"?"false":"true"}))})}function A(e,t,r){if(!t)return null;let n=document.createElement("span");return n.className=`ext-user-memo-badge ext-memo-${r||"blue"} ext-badge-id-${e}`,n.innerText=t,n.title=`\uBA54\uBAA8: ${t}
(\uD68C\uC6D0\uBC88\uD638: ${e})`,n}function Q(e,t,r){if(!e||!t)return!1;let n=typeof t=="string"?t:t.word||t.keyword,f=typeof t=="string"?"includes":t.method||"includes",i=typeof t=="string"?"all":t.target||"all",w=i==="post"?"posts":i==="comment"?"comments":i;if(w!=="all"&&w!==r)return!1;let E=e.replace(/[\s\n\r\t]+/g," ");E=E.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g,"").trim();let a=n.trim();return f==="includes"?E.includes(a):f==="starts"?E.startsWith(a):!1}function ne(){let e=document.getElementById("ext-loading-overlay");e&&(e.style.opacity="0",setTimeout(()=>{e.remove()},200))}var re="f43f5e",le="16a34a";function qe(e){let{storage:t,openBlockModal:r,openDogconMenu:n,injectDownloadAllButton:f,injectCopyLinkButton:i}=e,w=new Promise(a=>setTimeout(a,1e3)),E=t.get(["keywords","blocked_users","blockedDogcons","blockedDogconGroups","hideNotice","hidePopular","hideSidebar","compactMode","disableVote","preventYoutubeAlgorithm","contentWidth","blockMethod","userMemos","readabilityMode","legacyToolbar","hiddenMenus","hiddenSubMenus","hideLevelIcon"]).then(a=>{let v=a.keywords||[],y=a.blocked_users||[],q=a.blockedDogcons||[],N=a.blockedDogconGroups||[],I=a.blockMethod==="blind",D=a.blockMethod==="badge",W=Array.isArray(a.userMemos)?a.userMemos:[],z=new Map(W.map(o=>[String(o.member_num),o])),O=y.map(o=>String(o.member_num).trim()).filter(o=>o!==""),C=new Map(y.map(o=>[String(o.member_num).trim(),o])),ie=q.map(o=>o.id),ae=N.map(o=>o.id),_=document.documentElement;_&&(a.contentWidth&&a.contentWidth.trim()!==""&&_.style.setProperty("--ext-custom-width",a.contentWidth.trim()),a.hideNotice===!0&&_.classList.add("ext-hide-notice"),a.hidePopular===!0&&_.classList.add("ext-hide-popular"),a.hideSidebar===!0&&_.classList.add("ext-hide-sidebar"),a.compactMode===!0&&_.classList.add("ext-hide-compact"),a.disableVote===!0&&_.classList.add("ext-hide-vote"),a.readabilityMode===!0?_.classList.add("ext-readability-mode"):_.classList.remove("ext-readability-mode"),a.legacyToolbar===!0?_.classList.add("ext-legacy-toolbar"):_.classList.remove("ext-legacy-toolbar"),a.hideLevelIcon===!0?_.classList.add("ext-hide-level-icon"):_.classList.remove("ext-hide-level-icon"));function U(o){let u=z.get(String(o));return u?{text:u.memo||"",color:u.color||"blue"}:{text:"",color:"blue"}}document.querySelectorAll("li.webzine").forEach(o=>{let u=o.querySelector(".title-link"),p=o.querySelector('a[class*="member_"]'),L=!1,b=!1;if(u&&v.length>0){let m=u.textContent.trim();v.some(x=>Q(m,x,"posts"))&&(L=!0)}let l="";if(p){let m=p.className.match(/member_(\d+)/);m&&(l=m[1],O.includes(l)&&(b=!0))}if(L){o.remove();return}if(b){if(D){if(l&&p&&!o.querySelector(`.ext-badge-id-${l}`)){let m=C.get(l),x=m&&m.memo&&m.memo.trim()!==""?m.memo.trim():"\uCC28\uB2E8\uB428",h=A(l,x,"red-solid");h&&p.after(h)}o.classList.add("ext-blocked-user-layout");return}if(o.dataset.extFiltered)return;if(o.dataset.extFiltered="true",I){if(p&&!o.querySelector(`.ext-badge-id-${l}`)){let x=C.get(l),h=x&&x.memo&&x.memo.trim()!==""?x.memo.trim():"\uCC28\uB2E8\uB428",M=A(l,h,"red-solid");M&&p.after(M)}let m=o.innerHTML;o.innerHTML=K("\uAC8C\uC2DC\uAE00",m),F(o)}else o.remove()}else if(l&&z.has(l)&&p&&!o.querySelector(`.ext-badge-id-${l}`)){let m=U(l),x=A(l,m.text,m.color);x&&p.after(x)}}),document.querySelectorAll("li span.title a, li div.eq span.text-link").forEach(o=>{let u=o.closest("li");if(!u)return;let p=u.querySelector('a[class*="member_"]'),L="";if(p){let b=p.className.match(/member_(\d+)/);b&&(L=b[1])}if(v.length>0){let b=o.textContent.trim();if(v.some(l=>Q(b,l,"posts"))){u.remove();return}}if(L&&O.includes(L)){if(D){if(p&&!u.querySelector(`.ext-badge-id-${L}`)){let b=C.get(L),l=b&&b.memo&&b.memo.trim()!==""?b.memo.trim():"\uCC28\uB2E8\uB428",m=A(L,l,"red-solid");m&&p.after(m)}u.style.backgroundColor="#fff1f2",u.classList.add("ext-blocked-user-layout");return}if(u.dataset.extFiltered)return;if(u.dataset.extFiltered="true",I){if(p&&!u.querySelector(`.ext-badge-id-${L}`)){let l=C.get(L),m=l&&l.memo&&l.memo.trim()!==""?l.memo.trim():"\uCC28\uB2E8\uB428",x=A(L,m,"red-solid");x&&p.after(x)}let b=u.innerHTML;u.innerHTML=K("\uAC8C\uC2DC\uAE00",b),F(u)}else u.remove()}else if(L&&z.has(L)&&p&&!u.querySelector(`.ext-badge-id-${L}`)){let b=U(L),l=A(L,b.text,b.color);l&&p.after(l)}}),document.querySelectorAll("tr.ed").forEach(o=>{let u=o.querySelector(".title"),p=o.querySelector(".author a[class*='member_']"),L=!1,b=!1;if(u&&v.length>0){let m=u.querySelector(".title-link"),x="";if(m)x=m.textContent.trim();else{let M=u.querySelector('a[href*="dogdrip.net/"], a[href^="/"]');if(M){let G=M.cloneNode(!0),te=G.querySelector(".text-primary");te&&te.remove(),x=G.textContent.replace(/\[.*?\]/g,"").trim()}else x=u.textContent.trim()}let h=x.replace(/[\s\n\r\t]+/g," ").trim();v.some(M=>Q(h,M,"posts"))&&(L=!0)}let l="";if(p){let m=p.className.match(/member_(\d+)/);m&&(l=m[1],O.includes(l)&&(b=!0))}if(L){o.remove();return}if(b){if(D){if(l&&p&&!o.querySelector(`.ext-badge-id-${l}`)){let m=C.get(l),x=m&&m.memo&&m.memo.trim()!==""?m.memo.trim():"\uCC28\uB2E8\uB428",h=A(l,x,"red-solid");h&&p.after(h)}o.style.backgroundColor="#fff1f2",o.classList.add("ext-blocked-user-layout");return}if(o.dataset.extFiltered)return;if(o.dataset.extFiltered="true",I){if(p&&!o.querySelector(`.ext-badge-id-${l}`)){let h=C.get(l),M=h&&h.memo&&h.memo.trim()!==""?h.memo.trim():"\uCC28\uB2E8\uB428",G=A(l,M,"red-solid");G&&p.after(G)}let m=o.querySelectorAll("td, th").length||6,x=o.innerHTML;o.innerHTML=`<td colspan="${m}" style="padding: 0;">${K("\uAC8C\uC2DC\uAE00",`<table style="width:100%"><tbody><tr>${x}</tr></tbody></table>`)}</td>`,F(o)}else o.remove()}else if(l&&z.has(l)&&p&&!o.querySelector(`.ext-badge-id-${l}`)){let m=U(l),x=A(l,m.text,m.color);x&&p.after(x)}}),document.querySelectorAll(".ed.comment-content").forEach(o=>{let u=o.querySelector('a[class*="member_"]'),p=!1,L=o.querySelector(".xe_content, .comment-text");if(L&&v.length>0){let m=(L.innerText||L.textContent||"").replace(/[\s\n\r\t]+/g," ").trim();v.some(x=>Q(m,x,"comments"))&&(p=!0)}if(p){let l=o.closest("li, div.comment-item")||o;if(l.dataset.extFiltered)return;if(l.dataset.extFiltered="true",I){let m=l.innerHTML;l.innerHTML=K("\uD0A4\uC6CC\uB4DC\uAC00 \uD3EC\uD568\uB41C \uB313\uAE00",m),F(l)}else l.remove();return}let b="";if(u){let l=u.className.match(/member_(\d+)/);l&&(b=l[1])}if(b&&O.length>0&&O.includes(b)){let l=o.closest("li, div.comment-item")||o;if(D){if(u&&!o.querySelector(`.ext-badge-id-${b}`)){let m=C.get(b),x=m&&m.memo&&m.memo.trim()!==""?m.memo.trim():"\uCC28\uB2E8\uB428",h=A(b,x,"red-solid");h&&u.after(h)}l.style.backgroundColor="#fff1f2",l.classList.add("ext-blocked-user-layout");return}if(l.dataset.extFiltered)return;if(l.dataset.extFiltered="true",I){if(u&&!l.querySelector(`.ext-badge-id-${b}`)){let x=C.get(b),h=x&&x.memo&&x.memo.trim()!==""?x.memo.trim():"\uCC28\uB2E8\uB428",M=A(b,h,"red-solid");M&&u.after(M)}let m=l.innerHTML;l.innerHTML=K("\uB313\uAE00",m),F(l)}else l.remove();return}if(u&&b&&z.has(b)&&!o.querySelector(`.ext-badge-id-${b}`)){let l=U(b),m=A(b,l.text,l.color);m&&u.after(m)}if(u&&b){let l=u.textContent.trim(),m=o.querySelector("ul.dropdown-menu");if(m){let x=Array.from(m.querySelectorAll("li")).filter(h=>h.innerHTML.trim()==="");if(x.length>0){let h=x[0];h.querySelector(".ext-block-menu-item")||(h.innerHTML='<a class="ext-block-menu-item"><span class="ed icon"><i class="fas fa-user-slash"></i></span>\uCC28\uB2E8</a>',h.querySelector("a").addEventListener("click",M=>{M.preventDefault(),r(l,b)}))}}}});let J=document.querySelector(".title-toolbar");if(J){let o=J.querySelector('a[class*="member_"]'),u=J.querySelector("ul.dropdown-menu");if(o&&u){let p=o.className.match(/member_(\d+)/)?.[1];if(p){if(O.includes(p)){if(!o.querySelector(`.ext-badge-id-${p}`)&&!o.nextElementSibling?.classList.contains("ext-user-memo-badge")){let l=C.get(p),m=l&&l.memo&&l.memo.trim()!==""?l.memo.trim():"\uCC28\uB2E8\uB428",x=A(p,m,"red-solid");x&&o.after(x)}}else if(z.has(p)&&!o.nextElementSibling?.classList.contains("ext-user-memo-badge")){let l=U(p),m=A(p,l.text,l.color);m&&o.after(m)}let L=u.querySelector(".ext-toolbar-member-block");L&&L.remove();let b=document.createElement("li");b.className="ext-toolbar-member-block",O.includes(p)?(b.innerHTML=`<a class="ext-block-menu-item" href="#popup_menu_area" onclick="return false;" style="color: #${le}; font-weight: bold;"><span class="ed icon"><i class="fas fa-user-check"></i></span> \uCC28\uB2E8 \uD574\uC81C</a>`,b.querySelector("a").addEventListener("click",l=>{l.preventDefault(),t.get(["blocked_users"]).then(m=>{let x=m.blocked_users||[];x=x.filter(h=>String(h.member_num)!==String(p)),t.set({blocked_users:x}).then(()=>{window.location.reload()})})})):(b.innerHTML=`<a class="ext-block-menu-item" href="#popup_menu_area" onclick="return false;" style="color: #${re}; font-weight: bold;"><span class="ed icon"><i class="fas fa-user-slash"></i></span> \uCC28\uB2E8</a>`,b.querySelector("a").addEventListener("click",l=>{l.preventDefault(),r(o.textContent.trim(),p)})),u.insertBefore(b,u.firstChild)}}}document.querySelectorAll(".ed.dropdown .ed.dropdown-menu").forEach(o=>{f(o)}),document.querySelectorAll("img.dogcon-clickable, img[data-dogcon-srl]").forEach(o=>{let u=o.getAttribute("data-dogcon-srl"),p=o.getAttribute("data-dogcon-file-srl"),L=o.getAttribute("data-title")||o.getAttribute("title")||"\uAC1C\uB4DC\uB9BD\uCF58",b=o.getAttribute("alt")||"\uCF58";if(o.dataset.extProcessed)return;o.dataset.extProcessed="true";let l=ae.includes(u),m=ie.includes(p),x=`https://www.dogdrip.net/?mid=dogcon&dogcon_srl=${u}`;if(l||m){let h=document.createElement("div");h.className="ext-dogcon-blocked",h.innerHTML=`\u{1F6AB} <span>${L} (${b}) \uCC28\uB2E8\uB428</span><a href="${x}" target="_blank" class="dogcon-info-link" style="margin-left:6px; color:#0284c7; text-decoration:underline; font-weight:bold;">[\u2139\uFE0F \uC815\uBCF4]</a>`,h.querySelector(".dogcon-info-link").addEventListener("click",M=>{M.stopPropagation()}),h.dataset.srl=u,h.dataset.fileSrl=p,h.dataset.title=L,h.dataset.alt=b,h.dataset.isSingleBlocked=String(m),h.dataset.isGroupBlocked=String(l),h.addEventListener("click",M=>{M.stopPropagation(),M.preventDefault(),n(M,h,!0)}),o.parentNode.insertBefore(h,o),o.remove()}else o.addEventListener("click",h=>{h.stopPropagation(),h.preventDefault();let M=document.createElement("div");M.dataset.srl=u,M.dataset.fileSrl=p,M.dataset.title=L,M.dataset.alt=b,M.dataset.isSingleBlocked="false",M.dataset.isGroupBlocked="false",n(h,M,!1)})}),a.disableVote===!0&&(document.querySelectorAll("td.ed.voteNum.text-primary").forEach(o=>{o.dataset.extVoteProcessed||(o.dataset.extVoteProcessed="true",o.innerHTML='<i class="fas fa-baby"></i>')}),document.querySelectorAll("i.far.fa-thumbs-up").forEach(o=>{if(!o.dataset.extVoteProcessed){o.dataset.extVoteProcessed="true",o.className="fas fa-baby";let u=o.closest("span.text-primary");u?.nextElementSibling?.classList.contains("text-primary")&&u.nextElementSibling.remove()}}),document.querySelectorAll("a.votebtn").forEach(o=>{if(!o.dataset.extVoteProcessed){if(o.dataset.extVoteProcessed="true",o.getAttribute("title")==="\uCD94\uCC9C"){let u=o.querySelector("i");u&&(u.className="fas fa-baby");let p=o.querySelector("span.count");p&&p.remove();let L=o.parentElement;L?.tagName.toLowerCase()==="span"&&(L.parentNode.insertBefore(o,L),L.remove())}o.getAttribute("title")==="\uBE44\uCD94\uCC9C"&&o.remove()}}),document.querySelectorAll("a.comment-item-tool").forEach(o=>{o.classList.remove("border-left-dotted")})),a.preventYoutubeAlgorithm===!0&&document.querySelectorAll('iframe[src*="youtube.com/embed/"]').forEach(o=>{if(!o.dataset.extYoutubeProcessed){o.dataset.extYoutubeProcessed="true";let u=o.getAttribute("src");u&&o.setAttribute("src",u.replace("youtube.com/embed/","youtube-nocookie.com/embed/"))}}),(!a.contentWidth||a.contentWidth.trim()==="")&&document.querySelectorAll(".container").forEach(o=>{o.style.maxWidth="960px"});let Y=a.hiddenMenus||[],R=a.hiddenSubMenus||[];(Y.length>0||R.length>0)&&document.querySelectorAll(".eq.navbar-nav, .eq.nav-menu").forEach(u=>{u.querySelectorAll(":scope > li").forEach(p=>{let L=p.querySelector("a[href]");if(L)try{let l=new URL(L.href,location.origin).pathname.split("/").filter(Boolean)[0]||"";if(Y.includes(l)){p.style.display="none";return}R.length>0&&p.querySelectorAll("ul a[href], .child a[href]").forEach(x=>{let h=new URL(x.href,location.origin),M=ee(h);if(R.includes(M)){let G=x.closest("li");G&&(G.style.display="none")}})}catch{}})}),(Y.length>0||R.length>0)&&document.querySelectorAll(".xe-widget-wrapper").forEach(o=>{let u=o.querySelector(".widget-title-text, .eq.widget-title h4, .eq.widget-title .col-6:first-child");if(!u)return;let p=u.querySelector("a[href]");if(p)try{let L=p.getAttribute("href")||"",b=new URL(L,location.origin),l=b.pathname.split("/").filter(Boolean)[0]||"";if(l&&Y.includes(l)){o.style.display="none";return}if(R.length>0){let m=ee(b);m&&R.includes(m)&&(o.style.display="none")}}catch{}});function ee(o){let p=o.pathname.split("/").filter(Boolean)[0]||"",L=o.searchParams.get("sort_index"),b=o.searchParams.get("category"),l=o.searchParams.get("mid")||p;return L?`${l}__${L}`:b?`${l}__cat_${b}`:p}i()});Promise.all([w,E]).then(()=>{ne()})}function Ie(e){if(!e)return 0;let t=e.replace(/[vV\s]/g,"").split(".").map(Number),r=t[0]||0,n=t[1]||0,f=t[2]||0;return r*1e6+n*1e3+f}function Ce(e,t){return Ie(e)-Ie(t)}var Be=[{key:"blue",hex:"#3b82f6",name:"\uBE14\uB8E8"},{key:"green",hex:"#10b981",name:"\uADF8\uB9B0"},{key:"red",hex:"#ef4444",name:"\uB808\uB4DC"},{key:"yellow",hex:"#f59e0b",name:"\uC610\uB85C\uC6B0"},{key:"purple",hex:"#8b5cf6",name:"\uD37C\uD50C"},{key:"pink",hex:"#ec4899",name:"\uD551\uD06C"},{key:"cyan",hex:"#06b6d4",name:"\uC2DC\uC548"},{key:"orange",hex:"#f97316",name:"\uC624\uB80C\uC9C0"},{key:"teal",hex:"#14b8a6",name:"\uD2F0\uC77C"},{key:"gray",hex:"#64748b",name:"\uADF8\uB808\uC774"}];(function(){"use strict";let e="1.1.10",t="https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/version.txt",r=new oe;ve();let n="",f="",i="",w="blue",E={memberId:"",nickname:""},a=null,v=document.createElement("div");v.id="ext-block-modal",v.className="ext-modal-overlay",v.innerHTML=`
    <div class="ext-modal-box">
      <p class="ext-modal-title" id="ext-block-msg"></p>
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;">\uCC28\uB2E8 \uC0AC\uC720 (\uC120\uD0DD)</p>
      <input class="ext-modal-input" id="ext-block-reason" placeholder="\uD55C\uAE00, \uC22B\uC790, \uC601\uC5B4, ,. \uB9CC \uC785\uB825 \uAC00\uB2A5" />
      <div class="ext-modal-btns">
        <button class="ext-btn ext-btn-ghost" id="ext-block-cancel">\uCDE8\uC18C</button>
        <button class="ext-btn ext-btn-danger" id="ext-block-confirm">\uCC28\uB2E8</button>
      </div>
    </div>`;let y=document.createElement("div");y.id="ext-memo-modal",y.className="ext-modal-overlay",y.innerHTML=`
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
    </div>`;let q=document.createElement("div");q.id="ext-dogcon-menu";let N=document.createElement("div");N.id="ext-gear-wrap";let I=document.createElement("div");I.id="ext-update-badge",I.textContent="NEW";let D=document.createElement("button");D.id="ext-gear-btn",D.title="\uAC1C\uB4DC\uB9BD Plus+ \uC124\uC815",D.textContent="\u2699\uFE0F",N.appendChild(I),N.appendChild(D);let W=document.createElement("div");W.id="ext-settings-panel",W.innerHTML=Ee();function z(){return document.documentElement?(document.getElementById("ext-block-modal")||(document.documentElement.appendChild(v),document.documentElement.appendChild(y),document.documentElement.appendChild(q),document.documentElement.appendChild(N),document.documentElement.appendChild(W),ie(),J(),we(r,D,I,W,e)),!0):!1}if(!z()){let d=new MutationObserver(()=>{z()&&d.disconnect()});d.observe(document,{childList:!0,subtree:!0})}function O(d,c){n=d,f=c,document.getElementById("ext-block-reason").value="",document.getElementById("ext-block-msg").innerHTML=`<strong>${d}${c?`(${c})`:""}</strong>\uB2D8\uC744 \uCC28\uB2E8\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?<br/><small style="color:#64748b;">\uCC28\uB2E8 \uC2DC \uD574\uB2F9 \uC0AC\uC6A9\uC790\uC758 \uAE00\xB7\uB313\uAE00\uC774 \uC228\uACA8\uC9D1\uB2C8\uB2E4.</small>`,v.classList.add("show"),setTimeout(()=>document.getElementById("ext-block-reason").focus(),50)}function C(){v.classList.remove("show"),n="",f=""}function ie(){v.querySelector("#ext-block-reason")?.addEventListener("input",c=>{c.target.value=c.target.value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9.,\s]/g,"")}),v.querySelector("#ext-block-cancel")?.addEventListener("click",C),v.addEventListener("click",c=>{c.target===v&&C()}),v.querySelector("#ext-block-confirm")?.addEventListener("click",()=>{if(!n||!f){C();return}let c=v.querySelector("#ext-block-reason").value.trim(),s={date:new Date().toISOString().slice(0,10),member_num:String(f).trim(),memo:c};r.get(["blocked_users"]).then(k=>{let S=k.blocked_users||[];S.some(H=>String(H.member_num)===String(f))?(alert("\uC774\uBBF8 \uCC28\uB2E8\uB41C \uC0AC\uC6A9\uC790\uC785\uB2C8\uB2E4."),C()):(S.push(s),r.set({blocked_users:S}).then(()=>{C(),location.reload()}))})})}function ae(d,c,g){i=c;let s="",k="blue";if(g)if(g.includes(":")){let H=g.split(":");s=H[0],k=H[1]||"blue"}else s=g;w=k,document.getElementById("ext-memo-modal-title").innerHTML=`\u{1F4DD} <strong>${d}</strong> \uBA54\uBAA8`;let S=document.getElementById("ext-memo-input");S.value=s,document.getElementById("ext-memo-delete").style.display=s?"block":"none",U(),y.classList.add("show"),setTimeout(()=>S.focus(),50)}function _(){y.classList.remove("show"),i=""}function U(){let d=document.getElementById("ext-memo-color-picker");d&&(d.innerHTML="",Be.forEach(c=>{let g=document.createElement("div");g.className=`ext-color-chip${w===c.key?" selected":""}`,g.style.background=c.hex,g.title=c.key,g.addEventListener("click",()=>{w=c.key,d.querySelectorAll(".ext-color-chip").forEach(s=>s.classList.remove("selected")),g.classList.add("selected")}),d.appendChild(g)}))}function J(){y.querySelector("#ext-memo-cancel")?.addEventListener("click",_),y.addEventListener("click",g=>{g.target===y&&_()});let d=y.querySelector("#ext-memo-input"),c=y.querySelector("#ext-memo-confirm");d?.addEventListener("keydown",g=>{g.key==="Enter"&&(g.preventDefault(),c.click())}),c?.addEventListener("click",()=>{if(!i){_();return}let g=d.value.trim();r.get(["userMemos"]).then(s=>{let k=s.userMemos||{};g?k[i]=`${g}:${w}`:delete k[i],r.set({userMemos:k}).then(()=>{_(),location.reload()})})}),y.querySelector("#ext-memo-delete")?.addEventListener("click",()=>{if(!i){_();return}r.get(["userMemos"]).then(g=>{let s=g.userMemos||{};delete s[i],r.set({userMemos:s}).then(()=>{_(),location.reload()})})})}function ge(d,c,g){a={srl:c.dataset.srl,fileSrl:c.dataset.fileSrl,title:c.dataset.title,alt:c.dataset.alt,isSingleBlocked:c.dataset.isSingleBlocked==="true",isGroupBlocked:c.dataset.isGroupBlocked==="true"};let s=a,k=`https://www.dogdrip.net/?mid=dogcon&dogcon_srl=${s.srl}`,S=s.isSingleBlocked?"\u{1F7E2} \uC774 \uAC1C\uB4DC\uB9BD\uCF58 \uCC28\uB2E8 \uD574\uC81C":"\u274C \uC774 \uAC1C\uB4DC\uB9BD\uCF58\uB9CC \uCC28\uB2E8",H=s.isGroupBlocked?"\u{1F7E2} \uC774 \uADF8\uB8F9 \uC804\uCCB4 \uCC28\uB2E8 \uD574\uC81C":"\u274C \uC774 \uAC1C\uB4DC\uB9BD\uCF58 \uADF8\uB8F9 \uC804\uCCB4 \uCC28\uB2E8",V=s.isSingleBlocked?"unblock-action":"block-action",X=s.isGroupBlocked?"unblock-action":"block-action",B=s.isGroupBlocked?"":`<div class="dogcon-menu-item ${V}" id="ext-dc-single">${S}</div>`;q.innerHTML=`${B}<div class="dogcon-menu-item ${X}" id="ext-dc-group">${H}</div>
      <div style="border-top:1px solid #e2e8f0;margin-top:4px;padding-top:4px;">
        <a href="${k}" target="_blank" class="dogcon-menu-item" style="text-decoration:none;color:#475569;">\u{1F517} ${s.title} \uC815\uBCF4</a>
      </div>`,q.style.left=`${d.pageX}px`,q.style.top=`${d.pageY}px`,q.style.display="block",q.querySelector("#ext-dc-single")?.addEventListener("click",Y),q.querySelector("#ext-dc-group")?.addEventListener("click",R)}function Y(){if(!a)return;let d=a.fileSrl,c=`${a.title}(${a.alt})`;r.get(["blockedDogcons"]).then(g=>{let s=g.blockedDogcons||[];a.isSingleBlocked?s=s.filter(k=>k.id!==d):s.some(k=>k.id===d)||s.push({id:d,name:c}),r.set({blockedDogcons:s}).then(()=>location.reload())})}function R(){if(!a)return;let d=a.srl,c=a.title;r.get(["blockedDogconGroups"]).then(g=>{let s=g.blockedDogconGroups||[];a.isGroupBlocked?s=s.filter(k=>k.id!==d):s.some(k=>k.id===d)||s.push({id:d,name:c}),r.set({blockedDogconGroups:s}).then(()=>location.reload())})}document.addEventListener("click",d=>{let c=document.getElementById("ext-dogcon-menu");c&&(c.style.display="none");let g=d.target.closest('a[class*="member_"]');if(g){let s=g.className.match(/member_(\d+)/);s&&(E.memberId=s[1],E.nickname=g.textContent.trim());let k=document.getElementById("popup_menu_area");k&&window.getComputedStyle(k).display!=="none"&&o(k)}});function ee(d,c,g,s){let k=document.getElementById("popup_menu_area");if(!k)return;let S=k.querySelector("ul");if(!S)return;S.querySelectorAll(".ext-ins-block, .ext-ins-memo").forEach(P=>P.remove());let H=s.includes(":")?s.split(":")[0]:s,V=document.createElement("li");V.className="ext-ins-memo";let X=H?` <span style="font-size:11px;color:#64748b;">(${H.length>8?H.slice(0,8)+"...":H})</span>`:"";V.innerHTML=`<a href="#" style="color:#0284c7;font-weight:bold;">\uBA54\uBAA8${X}</a>`,V.querySelector("a").addEventListener("click",P=>{P.preventDefault(),P.stopPropagation(),k.style.display="none",ae(c,d,s)});let B=document.createElement("li");B.className="ext-ins-block",g?(B.innerHTML=`<a href="#" style="color:#${le};font-weight:bold;">\uCC28\uB2E8 \uD574\uC81C</a>`,B.querySelector("a").addEventListener("click",P=>{P.preventDefault(),P.stopPropagation(),k.style.display="none",r.get(["blocked_users"]).then(De=>{let $e=(De.blocked_users||[]).filter(Ne=>String(Ne.member_num)!==d);r.set({blocked_users:$e}).then(()=>location.reload())})})):(B.innerHTML=`<a href="#" style="color:#${re};font-weight:bold;">\uCC28\uB2E8</a>`,B.querySelector("a").addEventListener("click",P=>{P.preventDefault(),P.stopPropagation(),k.style.display="none",O(c,d)})),S.appendChild(V),S.appendChild(B)}function o(d){let c=window.getComputedStyle(d);if(!(c.display==="none"||c.visibility==="hidden")){if(!E.memberId){let g=d.querySelector('a[class*="member_"]')||document.querySelector('a[class*="member_"]:focus');if(g){let s=g.className.match(/member_(\d+)/);s&&(E.memberId=s[1],E.nickname=g.textContent.trim())}if(!E.memberId)return}r.get(["blocked_users","userMemos"]).then(g=>{let s=g.blocked_users||[],k=g.userMemos||{},S=s.some(H=>String(H.member_num)===E.memberId);ee(E.memberId,E.nickname,S,k[E.memberId]||"")})}}let u=new MutationObserver(d=>{for(let c of d)c.type==="childList"?c.addedNodes.forEach(g=>{if(g.nodeType!==Node.ELEMENT_NODE)return;let s=g,k=s.querySelector?.("img.dogcon-clickable, img[data-dogcon-srl]"),S=s.querySelector?.('a[class*="member_"]');if((k||S||["IMG","DIV","LI","TR","A"].includes(s.tagName))&&setTimeout(()=>{F(document.body),(document.querySelectorAll("img.dogcon-clickable:not([data-ext-processed]), img[data-dogcon-srl]:not([data-ext-processed])").length||S)&&h(80)},50),s.id==="popup_menu_area")o(s);else{let H=s.querySelector?.("#popup_menu_area");H&&o(H)}}):c.type==="attributes"&&c.attributeName==="style"&&c.target.id==="popup_menu_area"&&o(c.target)}),p=new MutationObserver(d=>{for(let c of d)for(let g of c.addedNodes){if(g.nodeType!==1)continue;let s=g;if(s.matches?.("tr.ed, li.webzine, li.ed, div.ed.board-item")||s.querySelector?.("tr.ed, li.webzine, li.ed, div.ed.board-item")){h(80);return}}});function L(){u.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["style","class"]});let d=document.getElementById("popup_menu_area");d&&new MutationObserver(()=>o(d)).observe(d,{attributes:!0,attributeFilter:["style","class"]})}function b(){p.observe(document.body,{childList:!0,subtree:!0})}function l(){fetch(t+"?_="+Date.now()).then(d=>d.ok?d.text():null).then(d=>{if(!d)return;let c=d.trim();c&&(window._extLatestVersion=c,Ce(c,e)>0&&(D.classList.add("has-update"),I.textContent="v"+c,I.classList.add("show"),D.title=`\uAC1C\uB4DC\uB9BD Plus+ \uC124\uC815 (\uC5C5\uB370\uC774\uD2B8 \uC788\uC74C: v${c})`))}).catch(()=>{})}let m={storage:r,openBlockModal:O,openDogconMenu:ge,injectDownloadAllButton:te,injectCopyLinkButton:M},x=null;function h(d=120){x&&clearTimeout(x),x=setTimeout(()=>qe(m),d)}function M(){document.querySelectorAll(".ed.article-head.margin-bottom-large .ed.margin-xxsmall.text-default").forEach(d=>{if(d.querySelector(".ext-copy-link-btn")||!d.querySelector("i.fas.fa-link"))return;let c=d.querySelector("a[href]");if(!c)return;let g=c.href,s=document.createElement("button");s.className="ext-copy-link-btn",s.textContent="\uB9C1\uD06C \uBCF5\uC0AC",s.addEventListener("click",k=>{k.preventDefault(),k.stopPropagation(),navigator.clipboard.writeText(g).then(()=>{s.textContent="\uBCF5\uC0AC\uB428 \u2713",setTimeout(()=>{s.textContent="\uB9C1\uD06C \uBCF5\uC0AC"},1500)}).catch(()=>{let S=document.createElement("textarea");S.value=g,S.style.position="fixed",S.style.opacity="0",document.body.appendChild(S),S.select(),document.execCommand("copy"),document.body.removeChild(S),s.textContent="\uBCF5\uC0AC\uB428 \u2713",setTimeout(()=>{s.textContent="\uB9C1\uD06C \uBCF5\uC0AC"},1500)})}),d.appendChild(s),G(d)})}function G(d){if(d.querySelector(".ext-reader-mode-btn"))return;let c=document.createElement("button");c.className="ext-reader-mode-btn ext-copy-link-btn";let g=()=>document.documentElement.classList.contains("ext-reader-mode"),s=()=>{c.textContent=g()?"\uC77D\uAE30 \uBAA8\uB4DC \uC885\uB8CC":"\uC77D\uAE30 \uBAA8\uB4DC"};s(),c.addEventListener("click",k=>{if(k.preventDefault(),k.stopPropagation(),document.documentElement.classList.toggle("ext-reader-mode"),s(),g()){let S=document.querySelector(".ed.article-head.margin-bottom-large");S&&S.scrollIntoView({behavior:"smooth",block:"start"})}}),d.appendChild(c)}function te(d){if(!d||d.querySelector(".ext-dl-all-btn"))return;let c=Array.from(d.querySelectorAll("li a[href*='procFileDownload']"));if(c.length<2)return;let g=300,s=document.createElement("li");s.style.cssText="border-bottom: 1px solid #e2e8f0; margin-bottom: 4px; padding-bottom: 4px;";let k=document.createElement("a");k.className="ext-dl-all-btn",k.href="#",k.innerHTML=`<i class="fas fa-download"></i> <span>\uC804\uCCB4 \uB2E4\uC6B4\uB85C\uB4DC (${c.length}\uAC1C)</span>`,k.addEventListener("click",S=>{S.preventDefault(),S.stopPropagation();let H=k.querySelector("span");H.textContent=`\uB2E4\uC6B4\uB85C\uB4DC \uC911... (${c.length}\uAC1C)`,k.style.color="#64748b",c.forEach((V,X)=>{setTimeout(()=>{let B=document.createElement("a");B.href=V.href,B.download="",B.style.display="none",document.body.appendChild(B),B.click(),document.body.removeChild(B)},X*g)}),setTimeout(()=>{H.textContent=`\uC804\uCCB4 \uB2E4\uC6B4\uB85C\uB4DC (${c.length}\uAC1C)`,k.style.color="#0284c7"},c.length*g+500)}),s.appendChild(k),d.insertBefore(s,d.firstChild)}function Ae(){if(document.getElementById("ext-loading-overlay"))return;let d=document.createElement("div");d.id="ext-loading-overlay",d.innerHTML='<div class="ext-spinner"></div><div class="ext-loading-text">\uD398\uC774\uC9C0 \uCD5C\uC801\uD654 \uC911...</div>',document.documentElement.appendChild(d)}Ae(),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>h(300)):h(100),document.body?(L(),b()):document.addEventListener("DOMContentLoaded",()=>{L(),b()}),window.addEventListener("load",()=>{ne(),h(500),setTimeout(l,5e3),he()})})();})();
