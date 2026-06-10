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
// @run-at       document-start
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/dogdrip-plus.1.1.8.user.js
// @downloadURL  https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/dogdrip-plus.1.1.8.user.js
// ==/UserScript==

"use strict";
(() => {
  // src/mobile/storage.ts
  var LS_PREFIX = "ddplus_";
  function _safeParse(r) {
    if (r === null || r === void 0) return void 0;
    if (typeof r === "string") {
      try {
        return JSON.parse(r);
      } catch {
        return r;
      }
    }
    return r;
  }
  function _safeStringify(v) {
    if (typeof v === "string") return v;
    return JSON.stringify(v);
  }
  var _backend = (() => {
    if (typeof GM !== "undefined" && typeof GM.getValue === "function") {
      return {
        async get(key) {
          try {
            return _safeParse(await GM.getValue(key, null));
          } catch (e) {
            console.warn("[\uAC1C\uB4DC\uB9BDPlus] GM.getValue \uC624\uB958:", key, e);
            return void 0;
          }
        },
        async set(key, val) {
          try {
            await GM.setValue(key, _safeStringify(val));
          } catch (e) {
            console.warn("[\uAC1C\uB4DC\uB9BDPlus] GM.setValue \uC624\uB958:", key, e);
          }
        },
        async remove(key) {
          try {
            await GM.deleteValue(key);
          } catch {
          }
        }
      };
    }
    console.warn("[\uAC1C\uB4DC\uB9BDPlus] GM API \uC5C6\uC74C \u2192 localStorage \uD3F4\uBC31");
    return {
      async get(key) {
        try {
          return _safeParse(localStorage.getItem(LS_PREFIX + key));
        } catch {
          return void 0;
        }
      },
      async set(key, val) {
        try {
          localStorage.setItem(LS_PREFIX + key, _safeStringify(val));
        } catch {
        }
      },
      async remove(key) {
        try {
          localStorage.removeItem(LS_PREFIX + key);
        } catch {
        }
      }
    };
  })();
  var MobileStorage = class {
    async get(keys) {
      const list = Array.isArray(keys) ? keys : [keys];
      const result = {};
      await Promise.all(
        list.map(async (k) => {
          const v = await _backend.get(k);
          if (v !== void 0) result[k] = v;
        })
      );
      return result;
    }
    async set(obj) {
      await Promise.all(
        Object.entries(obj).map(([k, v]) => _backend.set(k, v))
      );
    }
    async remove(key) {
      await _backend.remove(key);
    }
  };

  // src/extension/imageGallery.ts
  function collectContentImages() {
    const contentEl = document.querySelector(
      '[class*="rhymix_content"][class*="xe_content"]'
    );
    if (!contentEl) return [];
    return Array.from(contentEl.querySelectorAll("img")).filter((img) => {
      if (img.classList.contains("dogcon-clickable")) return false;
      if (img.hasAttribute("data-dogcon-srl")) return false;
      if (img.hasAttribute("data-dogcon-file-srl")) return false;
      if (img.naturalWidth > 0 && img.naturalWidth <= 32) return false;
      if (img.width > 0 && img.width <= 32) return false;
      const src = img.getAttribute("src") || img.src;
      if (!src || src.startsWith("data:")) return false;
      return true;
    }).map((img) => {
      const src = new URL(img.getAttribute("src") || img.src, location.origin).href;
      const filename = decodeURIComponent(src.split("/").pop()?.split("?")[0] || src);
      return { src, filename };
    });
  }
  var _currentIdx = 0;
  var _images = [];
  var _overlayEl = null;
  var _bound = false;
  function bindContentImageGallery() {
    const contentEl = document.querySelector(
      '[class*="rhymix_content"][class*="xe_content"]'
    );
    if (!contentEl) return;
    const imgs = Array.from(contentEl.querySelectorAll("img")).filter(
      (img) => {
        if (img.classList.contains("dogcon-clickable")) return false;
        if (img.hasAttribute("data-dogcon-srl")) return false;
        if (img.hasAttribute("data-dogcon-file-srl")) return false;
        if (img.naturalWidth > 0 && img.naturalWidth <= 32) return false;
        if (img.width > 0 && img.width <= 32) return false;
        const src = img.getAttribute("src") || img.src;
        if (!src || src.startsWith("data:")) return false;
        return true;
      }
    );
    if (!imgs.length) return;
    imgs.forEach((img, idx) => {
      if (img.dataset.extGalleryBound) return;
      img.dataset.extGalleryBound = "true";
      img.style.cursor = "zoom-in";
      img.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const images = collectContentImages();
        openGallery(images, idx);
      });
    });
  }
  function openGallery(images, startIdx) {
    if (!images.length) return;
    _images = images;
    _currentIdx = startIdx;
    if (!_overlayEl) {
      _overlayEl = buildOverlay();
      document.body.appendChild(_overlayEl);
    }
    if (!_bound) {
      bindOverlayEvents();
      _bound = true;
    }
    buildThumbnailStrip();
    _overlayEl.style.display = "flex";
    document.body.style.overflow = "hidden";
    renderFrame();
  }
  function closeGallery() {
    if (_overlayEl) _overlayEl.style.display = "none";
    document.body.style.overflow = "";
  }
  function goTo(idx) {
    _currentIdx = (idx + _images.length) % _images.length;
    renderFrame();
  }
  function renderFrame() {
    if (!_overlayEl) return;
    const img = _images[_currentIdx];
    _overlayEl.querySelector("#ext-gallery-main-img").src = img.src;
    _overlayEl.querySelector("#ext-gallery-filename").textContent = img.filename;
    _overlayEl.querySelector("#ext-gallery-counter").textContent = `${_currentIdx + 1} / ${_images.length}`;
    _overlayEl.querySelectorAll(".ext-gallery-thumb").forEach((thumb, i) => {
      thumb.classList.toggle("active", i === _currentIdx);
      if (i === _currentIdx) {
        thumb.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
    });
    const prevBtn = _overlayEl.querySelector("#ext-gallery-prev");
    const nextBtn = _overlayEl.querySelector("#ext-gallery-next");
    const single = _images.length <= 1;
    prevBtn.style.visibility = single ? "hidden" : "visible";
    nextBtn.style.visibility = single ? "hidden" : "visible";
  }
  function buildThumbnailStrip() {
    if (!_overlayEl) return;
    const strip = _overlayEl.querySelector("#ext-gallery-strip");
    strip.innerHTML = "";
    _images.forEach((img, i) => {
      const thumb = document.createElement("img");
      thumb.src = img.src;
      thumb.className = "ext-gallery-thumb";
      thumb.alt = img.filename;
      thumb.title = img.filename;
      thumb.addEventListener("click", () => goTo(i));
      strip.appendChild(thumb);
    });
  }
  function buildOverlay() {
    if (!document.getElementById("ext-gallery-style")) {
      const style = document.createElement("style");
      style.id = "ext-gallery-style";
      style.textContent = `
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
    `;
      (document.head || document.documentElement).appendChild(style);
    }
    const overlay = document.createElement("div");
    overlay.id = "ext-gallery-overlay";
    overlay.innerHTML = `
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
  `;
    return overlay;
  }
  function bindOverlayEvents() {
    if (!_overlayEl) return;
    _overlayEl.querySelector("#ext-gallery-close").addEventListener("click", closeGallery);
    _overlayEl.querySelector("#ext-gallery-prev").addEventListener("click", () => goTo(_currentIdx - 1));
    _overlayEl.querySelector("#ext-gallery-next").addEventListener("click", () => goTo(_currentIdx + 1));
    const downloadLink = _overlayEl.querySelector("#ext-gallery-download");
    _overlayEl.querySelector("#ext-gallery-main-img").addEventListener("load", () => {
      const img = _images[_currentIdx];
      if (!img) return;
      downloadLink.href = img.src;
      downloadLink.download = img.filename;
    });
    _overlayEl.addEventListener("click", (e) => {
      if (e.target === _overlayEl) closeGallery();
    });
    document.addEventListener("keydown", (e) => {
      if (!_overlayEl || _overlayEl.style.display === "none") return;
      switch (e.key) {
        case "ArrowLeft":
          goTo(_currentIdx - 1);
          break;
        case "ArrowRight":
          goTo(_currentIdx + 1);
          break;
        case "Escape":
        case "Esc":
          closeGallery();
          break;
      }
    });
  }

  // src/mobile/cssInjector.ts
  function injectMobileCSS() {
    if (document.getElementById("ext-mobile-style")) return;
    const style = document.createElement("style");
    style.id = "ext-mobile-style";
    style.textContent = `
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
  `;
    const targetNode = document.head || document.documentElement;
    targetNode.appendChild(style);
  }

  // src/mobile/settingsPanel.ts
  function buildSettingsPanelHTML() {
    return `
    <div id="ext-settings-inner">
      <div id="ext-settings-header">
        <h2>\u2699\uFE0F \uAC1C\uB4DC\uB9BD Plus+ <small style="font-size:11px;color:#94a3b8;font-weight:normal;">(Mobile)</small></h2>
        <button id="ext-settings-close">\u2715</button>
      </div>
      <div class="ext-tab-bar">
        <button class="ext-tab active" data-tab="tab-block-user">\u{1F464} \uC0AC\uC6A9\uC790\uCC28\uB2E8</button>
        <button class="ext-tab" data-tab="tab-keyword">\u{1F511} \uD0A4\uC6CC\uB4DC\uCC28\uB2E8</button>
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
        <p class="ext-section-label" style="margin-top:18px;">Dogdrip++ \uBC31\uC5C5 \uC774\uC2DD</p>
        <div class="ext-backup-row">
          <button class="ext-backup-btn" id="s-restore-pp-btn" style="border-color:#f59e0b;color:#b45309;">\u{1F4E5} Dogdrip++ \uBC31\uC5C5 \uAC00\uC838\uC624\uAE30</button>
        </div>
        <input type="file" id="s-restore-pp-file" accept=".json" style="display:none;" />
        <p style="margin-top:16px;font-size:12px;color:#94a3b8; line-height:1.7;">
          \uBC31\uC5C5 \uD30C\uC77C\uC740 JSON \uD615\uC2DD\uC73C\uB85C \uC800\uC7A5\uB418\uBA70, \uB3D9\uC77C \uC720\uC800\uC2A4\uD06C\uB9BD\uD2B8 \uD658\uACBD\uC5D0\uC11C \uBCF5\uAD6C \uAC00\uB2A5\uD569\uB2C8\uB2E4.<br>
          Dogdrip++ \uC774\uC2DD \uC2DC \uCC28\uB2E8 \uC720\uC800\xB7\uD0A4\uC6CC\uB4DC\uB9CC \uAC00\uC838\uC624\uBA70, \uB098\uBA38\uC9C0 \uD604\uC7AC \uC124\uC815\uC740 \uC720\uC9C0\uB429\uB2C8\uB2E4.<br>
          \u203B \uC124\uC815 \uBCC0\uACBD \uD6C4 \uD398\uC774\uC9C0 \uC0C8\uB85C\uACE0\uCE68 \uC2DC \uBC18\uC601\uB429\uB2C8\uB2E4.
        </p>
      </div>
    </div>`;
  }
  var _savedScrollY = 0;
  var _displayTogglesBound = false;
  function openSettingsPanel(storage, settingsPanel) {
    _savedScrollY = window.scrollY;
    document.body.style.cssText += ";overflow:hidden;position:fixed;top:-" + _savedScrollY + "px;left:0;right:0;";
    settingsPanel.classList.add("show");
    loadPanelData("tab-block-user", storage);
    loadDisplaySettings(storage);
    bindDisplayToggles(storage, settingsPanel);
  }
  function closeSettingsPanel(settingsPanel) {
    settingsPanel.classList.remove("show");
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    window.scrollTo(0, _savedScrollY);
  }
  function bindGearAndPanel(storage, gearBtn, gearUpdateBadge, settingsPanel, currentVersion) {
    gearBtn.addEventListener("click", () => {
      if (gearBtn.classList.contains("has-update") && window._extLatestVersion) {
        if (confirm(`\u{1F195} \uC0C8 \uBC84\uC804\uC774 \uC788\uC2B5\uB2C8\uB2E4!
\uD604\uC7AC: v${currentVersion}  \u2192  \uCD5C\uC2E0: v${window._extLatestVersion}

\uC5C5\uB370\uC774\uD2B8 \uD398\uC774\uC9C0\uB85C \uC774\uB3D9\uD560\uAE4C\uC694?`)) {
          window.open("https://github.com/z3ro2201/dogdrip-plus-mobilejs/raw/main/dogdrip-plus.user.js", "_blank");
          return;
        }
      }
      openSettingsPanel(storage, settingsPanel);
    });
    settingsPanel.querySelector("#ext-settings-close")?.addEventListener("click", () => closeSettingsPanel(settingsPanel));
    settingsPanel.addEventListener("click", (e) => {
      if (e.target === settingsPanel) closeSettingsPanel(settingsPanel);
    });
    settingsPanel.querySelectorAll(".ext-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        settingsPanel.querySelectorAll(".ext-tab").forEach((t) => t.classList.remove("active"));
        settingsPanel.querySelectorAll(".ext-tab-panel").forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        const tabId = tab.dataset.tab;
        settingsPanel.querySelector(`#${tabId}`)?.classList.add("active");
        loadPanelData(tabId, storage);
      });
    });
    settingsPanel.querySelector("#s-kw-add")?.addEventListener("click", () => {
      const word = settingsPanel.querySelector("#s-kw-word").value.trim();
      if (!word) {
        alert("\uD0A4\uC6CC\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694.");
        return;
      }
      const target = settingsPanel.querySelector("#s-kw-target").value;
      const method = settingsPanel.querySelector("#s-kw-method").value;
      storage.get(["keywords"]).then((r) => {
        const list = r.keywords || [];
        if (list.some((x) => (x.word || x.keyword) === word)) {
          alert("\uC774\uBBF8 \uB4F1\uB85D\uB41C \uD0A4\uC6CC\uB4DC\uC785\uB2C8\uB2E4.");
          return;
        }
        list.push({ date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), word, method, target });
        storage.set({ keywords: list }).then(() => {
          settingsPanel.querySelector("#s-kw-word").value = "";
          renderKeywordList(storage);
        });
      });
    });
    settingsPanel.querySelector("#s-backup")?.addEventListener("click", () => doBackup(storage));
    settingsPanel.querySelector("#s-restore-btn")?.addEventListener("click", () => settingsPanel.querySelector("#s-restore-file").click());
    settingsPanel.querySelector("#s-restore-file")?.addEventListener("change", (e) => doRestore(e, storage));
    settingsPanel.querySelector("#s-restore-pp-btn")?.addEventListener("click", () => settingsPanel.querySelector("#s-restore-pp-file").click());
    settingsPanel.querySelector("#s-restore-pp-file")?.addEventListener("change", (e) => doRestorePP(e, storage));
  }
  function bindDisplayToggles(storage, settingsPanel) {
    if (_displayTogglesBound) return;
    _displayTogglesBound = true;
    const toggleMap = [
      ["s-hide-notice", "hideNotice"],
      ["s-hide-popular", "hidePopular"],
      ["s-compact", "compactMode"],
      ["s-disable-vote", "disableVote"],
      ["s-no-yt", "preventYoutubeAlgorithm"],
      ["s-hide-level-icon", "hideLevelIcon"]
    ];
    toggleMap.forEach(([elId, key]) => {
      settingsPanel.querySelector(`#${elId}`)?.addEventListener("change", (e) => {
        const val = e.target.checked;
        storage.set({ [key]: val }).then(() => {
          storage.get(["hideNotice", "hidePopular", "hideSidebar", "compactMode", "disableVote"]).then(applyDisplayClasses);
        });
      });
    });
    ["s-bm-remove", "s-bm-blind", "s-bm-badge"].forEach((id) => {
      settingsPanel.querySelector(`#${id}`)?.addEventListener("change", (e) => {
        if (!e.target.checked) return;
        storage.set({ blockMethod: e.target.value }).then(() => {
          closeSettingsPanel(settingsPanel);
          location.reload();
        });
      });
    });
  }
  function loadPanelData(tabId, storage) {
    switch (tabId) {
      case "tab-block-user":
        renderBlockList(storage);
        break;
      case "tab-keyword":
        renderKeywordList(storage);
        break;
      case "tab-dogcon":
        renderDogconLists(storage);
        break;
      case "tab-memo":
        renderMemoList(storage);
        break;
      case "tab-display":
        loadDisplaySettings(storage);
        break;
    }
  }
  function renderBlockList(storage) {
    storage.get(["blocked_users"]).then((r) => {
      const list = r.blocked_users || [];
      const container = document.getElementById("s-block-list");
      if (!container) return;
      container.innerHTML = "";
      const countEl = document.getElementById("s-block-count");
      if (countEl) countEl.textContent = list.length ? `(${list.length}\uBA85)` : "";
      if (!list.length) {
        container.innerHTML = '<span class="ext-empty-msg">\uCC28\uB2E8\uB41C \uC0AC\uC6A9\uC790\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</span>';
        return;
      }
      list.forEach((u) => {
        const item = document.createElement("span");
        item.className = "ext-badge-item";
        item.innerHTML = `<span>\u{1F464} ${u.member_num}${u.memo ? ` <em style="color:#64748b;font-style:normal;font-size:11px;">(${u.memo})</em>` : ""}</span>`;
        const del = document.createElement("button");
        del.className = "ext-badge-del";
        del.textContent = "\xD7";
        del.addEventListener("click", () => {
          if (!confirm(`${u.member_num} \uCC28\uB2E8\uC744 \uD574\uC81C\uD560\uAE4C\uC694?`)) return;
          storage.get(["blocked_users"]).then((r2) => {
            const l2 = (r2.blocked_users || []).filter((x) => x.member_num !== u.member_num);
            storage.set({ blocked_users: l2 }).then(renderBlockList.bind(null, storage));
          });
        });
        item.appendChild(del);
        container.appendChild(item);
      });
    });
  }
  function renderKeywordList(storage) {
    storage.get(["keywords"]).then((r) => {
      const list = r.keywords || [];
      const container = document.getElementById("s-kw-list");
      if (!container) return;
      container.innerHTML = "";
      if (!list.length) {
        container.innerHTML = '<span class="ext-empty-msg">\uCC28\uB2E8 \uD0A4\uC6CC\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</span>';
        return;
      }
      const targetLabel = { all: "\uC804\uCCB4", posts: "\uAC8C\uC2DC\uAE00", post: "\uAC8C\uC2DC\uAE00", comments: "\uB313\uAE00", comment: "\uB313\uAE00" };
      const methodLabel = { includes: "\uD3EC\uD568", starts: "\uC2DC\uC791" };
      list.forEach((kw) => {
        const word = kw.word || kw.keyword;
        const item = document.createElement("span");
        item.className = "ext-badge-item";
        item.innerHTML = `<span>\u2328\uFE0F ${word}<br/><em style="font-size:10px;color:#2563eb;font-style:normal;">[${targetLabel[kw.target] || "\uC804\uCCB4"}] [${methodLabel[kw.method] || "\uD3EC\uD568"}]</em></span>`;
        const del = document.createElement("button");
        del.className = "ext-badge-del";
        del.textContent = "\xD7";
        del.addEventListener("click", (e) => {
          e.stopPropagation();
          storage.get(["keywords"]).then((r2) => {
            const l2 = (r2.keywords || []).filter((x) => (x.word || x.keyword) !== word);
            storage.set({ keywords: l2 }).then(renderKeywordList.bind(null, storage));
          });
        });
        item.appendChild(del);
        container.appendChild(item);
      });
    });
  }
  function renderDogconLists(storage) {
    storage.get(["blockedDogcons", "blockedDogconGroups"]).then((r) => {
      renderSimpleList(r.blockedDogcons || [], "s-dogcon-list", "blockedDogcons", (i) => i.name, "\uCC28\uB2E8\uB41C \uAC1C\uB4DC\uB9BD\uCF58\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.", storage);
      renderSimpleList(r.blockedDogconGroups || [], "s-dogcon-group-list", "blockedDogconGroups", (i) => i.name, "\uCC28\uB2E8\uB41C \uADF8\uB8F9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.", storage);
    });
  }
  function renderSimpleList(list, containerId, key, labelFn, emptyMsg, storage) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = "";
    if (!list.length) {
      c.innerHTML = `<span class="ext-empty-msg">${emptyMsg}</span>`;
      return;
    }
    list.forEach((item) => {
      const el = document.createElement("span");
      el.className = "ext-badge-item";
      el.innerHTML = `<span>${labelFn(item)}</span>`;
      const del = document.createElement("button");
      del.className = "ext-badge-del";
      del.textContent = "\xD7";
      del.addEventListener("click", () => {
        storage.get([key]).then((r) => {
          const l = (r[key] || []).filter((x) => x.id !== item.id);
          storage.set({ [key]: l }).then(() => renderDogconLists(storage));
        });
      });
      el.appendChild(del);
      c.appendChild(el);
    });
  }
  function renderMemoList(storage) {
    storage.get(["userMemos"]).then((r) => {
      const memos = r.userMemos || {};
      const c = document.getElementById("s-memo-list");
      if (!c) return;
      c.innerHTML = "";
      const ids = Object.keys(memos);
      if (!ids.length) {
        c.innerHTML = '<span class="ext-empty-msg">\uB4F1\uB85D\uB41C \uBA54\uBAA8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</span>';
        return;
      }
      ids.forEach((mid) => {
        const raw = memos[mid];
        let text = raw, color = "blue";
        if (raw.includes(":")) {
          const p = raw.split(":");
          text = p[0];
          color = p[1] || "blue";
        }
        const badge = document.createElement("span");
        badge.className = `ext-badge-item ext-user-memo-badge ext-memo-${color}`;
        badge.style.cssText = "cursor:pointer;";
        badge.title = `ID: ${mid} / \uD074\uB9AD\uD558\uBA74 \uC0AD\uC81C`;
        badge.innerHTML = `${text} <small>(${mid})</small>`;
        badge.addEventListener("click", () => {
          if (!confirm(`"${text}" \uBA54\uBAA8\uB97C \uC0AD\uC81C\uD560\uAE4C\uC694?`)) return;
          storage.get(["userMemos"]).then((r2) => {
            const m2 = r2.userMemos || {};
            delete m2[mid];
            storage.set({ userMemos: m2 }).then(() => renderMemoList(storage));
          });
        });
        c.appendChild(badge);
      });
    });
  }
  function applyDisplayClasses(r) {
    const html = document.documentElement;
    html.classList.toggle("ext-hide-notice", !!r.hideNotice);
    html.classList.toggle("ext-hide-popular", !!r.hidePopular);
    html.classList.toggle("ext-hide-sidebar", !!r.hideSidebar);
    html.classList.toggle("ext-hide-compact", !!r.compactMode);
    html.classList.toggle("ext-hide-vote", !!r.disableVote);
  }
  function loadDisplaySettings(storage) {
    storage.get(["hideNotice", "hidePopular", "hideSidebar", "compactMode", "disableVote", "preventYoutubeAlgorithm", "hideLevelIcon", "blockMethod"]).then((r) => {
      const map = [
        ["s-hide-notice", "hideNotice"],
        ["s-hide-popular", "hidePopular"],
        ["s-hide-sidebar", "hideSidebar"],
        ["s-compact", "compactMode"],
        ["s-disable-vote", "disableVote"],
        ["s-no-yt", "preventYoutubeAlgorithm"],
        ["s-hide-level-icon", "hideLevelIcon"]
      ];
      map.forEach(([elId, key]) => {
        const el = document.getElementById(elId);
        if (el) el.checked = !!r[key];
      });
      const method = r.blockMethod || "remove";
      const rm = document.getElementById(`s-bm-${method}`);
      if (rm) rm.checked = true;
    });
  }
  function doBackup(storage) {
    storage.get([
      "keywords",
      "blocked_users",
      "blockedDogcons",
      "blockedDogconGroups",
      "hideNotice",
      "hidePopular",
      "hideSidebar",
      "compactMode",
      "disableVote",
      "preventYoutubeAlgorithm",
      "contentWidth",
      "blockMethod",
      "userMemos",
      "hideLevelIcon"
    ]).then((data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dogdrip_plus_backup_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
  function doRestore(event, storage) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const keywords = (data.keywords || []).map((k) => {
          if (typeof k === "string") return { date: "", method: "includes", target: "all", word: k };
          return { date: k.date || "", method: k.method || "includes", target: k.target || "all", word: k.word || k.keyword };
        });
        const blocked_users = (data.blocked_users || data.nicknames || []).map((u) => {
          if (typeof u === "string" && u.includes(":")) {
            const p = u.split(":");
            return { date: "", member_num: p[0].trim(), memo: p[2] || "" };
          }
          return { date: u.date || "", member_num: String(u.member_num || "").trim(), memo: u.memo || "" };
        });
        storage.set({
          keywords,
          blocked_users,
          blockedDogcons: data.blockedDogcons || [],
          blockedDogconGroups: data.blockedDogconGroups || [],
          hideNotice: !!data.hideNotice,
          hidePopular: !!data.hidePopular,
          hideSidebar: !!data.hideSidebar,
          compactMode: !!data.compactMode,
          disableVote: !!data.disableVote,
          preventYoutubeAlgorithm: !!data.preventYoutubeAlgorithm,
          contentWidth: data.contentWidth || "",
          blockMethod: data.blockMethod || "remove",
          userMemos: data.userMemos || {}
        }).then(() => {
          alert("\u{1F389} \uBCF5\uAD6C \uC644\uB8CC! \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C\uACE0\uCE68\uD569\uB2C8\uB2E4.");
          location.reload();
        });
      } catch {
        alert("\u274C \uD30C\uC77C \uD615\uC2DD \uC624\uB958: \uC62C\uBC14\uB978 \uBC31\uC5C5 JSON \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }
  function doRestorePP(event, storage) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const rawMembers = Array.isArray(data.blocked_members) ? data.blocked_members : [];
        const rawKeywords = Array.isArray(data.keywords) ? data.keywords : [];
        const blocked_users = rawMembers.map((u) => ({ date: u.date || "", member_num: String(u.member_num || "").trim(), memo: u.memo || "" }));
        const keywords = rawKeywords.map((k) => ({ date: k.date || "", method: k.method || "includes", target: k.target || "all", word: k.keyword || k.word || "" }));
        storage.get(["blockedDogcons", "blockedDogconGroups", "hideNotice", "hidePopular", "hideSidebar", "compactMode", "disableVote", "preventYoutubeAlgorithm", "contentWidth", "blockMethod", "userMemos"]).then((cur) => {
          storage.set({
            keywords,
            blocked_users,
            blockedDogcons: cur.blockedDogcons || [],
            blockedDogconGroups: cur.blockedDogconGroups || [],
            hideNotice: !!cur.hideNotice,
            hidePopular: !!cur.hidePopular,
            hideSidebar: !!cur.hideSidebar,
            compactMode: !!cur.compactMode,
            disableVote: !!cur.disableVote,
            preventYoutubeAlgorithm: !!cur.preventYoutubeAlgorithm,
            contentWidth: cur.contentWidth || "",
            blockMethod: cur.blockMethod || "remove",
            userMemos: cur.userMemos || {}
          }).then(() => {
            alert(`\u{1F389} Dogdrip++ \uC774\uC2DD \uC644\uB8CC!
\uCC28\uB2E8 \uC720\uC800 ${blocked_users.length}\uBA85, \uD0A4\uC6CC\uB4DC ${keywords.length}\uAC1C\uB97C \uAC00\uC838\uC654\uC2B5\uB2C8\uB2E4.
\uD398\uC774\uC9C0\uB97C \uC0C8\uB85C\uACE0\uCE68\uD569\uB2C8\uB2E4.`);
            location.reload();
          });
        });
      } catch {
        alert("\u274C \uD30C\uC77C \uD615\uC2DD \uC624\uB958: Dogdrip++ \uBC31\uC5C5 JSON \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  // src/common/blind.ts
  function buildBlindWrapperHTML(typeLabel, originalHTML) {
    return `<div class="ext-blind-wrapper">
    <div class="ext-blind-label">
      <span>\u{1F6AB} \uCC28\uB2E8\uB41C ${typeLabel}\uC785\uB2C8\uB2E4.</span>
      <button class="ext-blind-toggle-btn">\uB0B4\uC6A9 \uBCF4\uAE30</button>
    </div>
    <div class="ext-blind-content" style="display:none;">${originalHTML}</div>
  </div>`;
  }
  function attachBlindToggleEvents(container) {
    container.querySelectorAll(".ext-blind-wrapper:not([data-bound])").forEach((wrapper) => {
      wrapper.dataset.bound = "true";
      const btn = wrapper.querySelector(".ext-blind-toggle-btn");
      const content = wrapper.querySelector(".ext-blind-content");
      if (!btn || !content) return;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isVisible = content.style.display !== "none";
        content.style.display = isVisible ? "none" : "block";
        btn.textContent = isVisible ? "\uB0B4\uC6A9 \uBCF4\uAE30" : "\uB0B4\uC6A9 \uC228\uAE30\uAE30";
      });
      wrapper.addEventListener("mouseenter", () => {
        if (content.style.display !== "none") return;
        content.style.display = "block";
        btn.textContent = "\uB0B4\uC6A9 \uC228\uAE30\uAE30";
      });
      wrapper.addEventListener("mouseleave", () => {
        if (wrapper.dataset.pinned === "true") return;
        content.style.display = "none";
        btn.textContent = "\uB0B4\uC6A9 \uBCF4\uAE30";
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        wrapper.dataset.pinned = wrapper.dataset.pinned === "true" ? "false" : "true";
      });
    });
  }

  // src/common/memo.ts
  function createMemoBadgeElement(memberId, memoText, colorStyle) {
    if (!memoText) return null;
    const badge = document.createElement("span");
    badge.className = `ext-user-memo-badge ext-memo-${colorStyle || "blue"} ext-badge-id-${memberId}`;
    badge.innerText = memoText;
    badge.title = `\uBA54\uBAA8: ${memoText}
(\uD68C\uC6D0\uBC88\uD638: ${memberId})`;
    return badge;
  }

  // src/common/keywordMatcher.ts
  function checkKeywordMatchCondition(titleText, keywordObj, targetArea) {
    if (!titleText || !keywordObj) return false;
    const word = typeof keywordObj === "string" ? keywordObj : keywordObj.word || keywordObj.keyword;
    const method = typeof keywordObj === "string" ? "includes" : keywordObj.method || "includes";
    const target = typeof keywordObj === "string" ? "all" : keywordObj.target || "all";
    const normalizedTarget = target === "post" ? "posts" : target === "comment" ? "comments" : target;
    if (normalizedTarget !== "all" && normalizedTarget !== targetArea) return false;
    let cleanText = titleText.replace(/[\s\n\r\t]+/g, " ");
    cleanText = cleanText.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, "").trim();
    const cleanWord = word.trim();
    if (method === "includes") {
      return cleanText.includes(cleanWord);
    }
    if (method === "starts") {
      return cleanText.startsWith(cleanWord);
    }
    return false;
  }

  // src/common/overlay.ts
  function removeLoadingOverlay() {
    const overlay = document.getElementById("ext-loading-overlay");
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
      }, 200);
    }
  }

  // src/common/constants.ts
  var BLOCK_COLOR = "f43f5e";
  var GRANT_COLOR = "16a34a";

  // src/common/filter.ts
  function executeFilterWithMinTime(deps) {
    const { storage, openBlockModal, openDogconMenu, injectDownloadAllButton, injectCopyLinkButton } = deps;
    const minTimePromise = new Promise((resolve) => setTimeout(resolve, 1e3));
    const filterPromise = storage.get([
      "keywords",
      "blocked_users",
      "blockedDogcons",
      "blockedDogconGroups",
      "hideNotice",
      "hidePopular",
      "hideSidebar",
      "compactMode",
      "disableVote",
      "preventYoutubeAlgorithm",
      "contentWidth",
      "blockMethod",
      "userMemos",
      "readabilityMode",
      "legacyToolbar",
      "hiddenMenus",
      "hiddenSubMenus",
      "hideLevelIcon"
    ]).then((result) => {
      const filterKeywords = result.keywords || [];
      const blockedUsers = result.blocked_users || [];
      const blockedDogcons = result.blockedDogcons || [];
      const blockedDogconGroups = result.blockedDogconGroups || [];
      const isBlindMode = result.blockMethod === "blind";
      const isBadgeMode = result.blockMethod === "badge";
      const rawMemos = Array.isArray(result.userMemos) ? result.userMemos : [];
      const memoMap = new Map(rawMemos.map((m) => [String(m.member_num), m]));
      const blockedMemberIds = blockedUsers.map((u) => String(u.member_num).trim()).filter((id) => id !== "");
      const blockedUserMap = new Map(
        blockedUsers.map((u) => [String(u.member_num).trim(), u])
      );
      const blockedDogconIds = blockedDogcons.map((item) => item.id);
      const blockedDogconGroupIds = blockedDogconGroups.map((item) => item.id);
      const htmlEl = document.documentElement;
      if (htmlEl) {
        if (result.contentWidth && result.contentWidth.trim() !== "") {
          htmlEl.style.setProperty("--ext-custom-width", result.contentWidth.trim());
        }
        if (result.hideNotice === true) htmlEl.classList.add("ext-hide-notice");
        if (result.hidePopular === true) htmlEl.classList.add("ext-hide-popular");
        if (result.hideSidebar === true) htmlEl.classList.add("ext-hide-sidebar");
        if (result.compactMode === true) htmlEl.classList.add("ext-hide-compact");
        if (result.disableVote === true) htmlEl.classList.add("ext-hide-vote");
        if (result.readabilityMode === true) htmlEl.classList.add("ext-readability-mode");
        else htmlEl.classList.remove("ext-readability-mode");
        if (result.legacyToolbar === true) htmlEl.classList.add("ext-legacy-toolbar");
        else htmlEl.classList.remove("ext-legacy-toolbar");
        if (result.hideLevelIcon === true) htmlEl.classList.add("ext-hide-level-icon");
        else htmlEl.classList.remove("ext-hide-level-icon");
      }
      function getMemoData(mid) {
        const entry = memoMap.get(String(mid));
        if (!entry) return { text: "", color: "blue" };
        return { text: entry.memo || "", color: entry.color || "blue" };
      }
      document.querySelectorAll("li.webzine").forEach((article) => {
        const titleElement = article.querySelector(".title-link");
        const nicknameElement = article.querySelector('a[class*="member_"]');
        let shouldRemove = false;
        let shouldBlind = false;
        if (titleElement && filterKeywords.length > 0) {
          const titleText = titleElement.textContent.trim();
          if (filterKeywords.some((kw) => checkKeywordMatchCondition(titleText, kw, "posts"))) {
            shouldRemove = true;
          }
        }
        let currentMemberId = "";
        if (nicknameElement) {
          const match = nicknameElement.className.match(/member_(\d+)/);
          if (match) {
            currentMemberId = match[1];
            if (blockedMemberIds.includes(currentMemberId)) shouldBlind = true;
          }
        }
        if (shouldRemove) {
          article.remove();
          return;
        }
        if (shouldBlind) {
          if (isBadgeMode) {
            if (currentMemberId && nicknameElement && !article.querySelector(`.ext-badge-id-${currentMemberId}`)) {
              const userObj = blockedUserMap.get(currentMemberId);
              const badgeLabel = userObj && userObj.memo && userObj.memo.trim() !== "" ? userObj.memo.trim() : "\uCC28\uB2E8\uB428";
              const blockBadge = createMemoBadgeElement(currentMemberId, badgeLabel, "red-solid");
              if (blockBadge) nicknameElement.after(blockBadge);
            }
            article.classList.add("ext-blocked-user-layout");
            return;
          }
          if (article.dataset.extFiltered) return;
          article.dataset.extFiltered = "true";
          if (isBlindMode) {
            if (nicknameElement && !article.querySelector(`.ext-badge-id-${currentMemberId}`)) {
              const userObj = blockedUserMap.get(currentMemberId);
              const badgeLabel = userObj && userObj.memo && userObj.memo.trim() !== "" ? userObj.memo.trim() : "\uCC28\uB2E8\uB428";
              const blockBadge = createMemoBadgeElement(currentMemberId, badgeLabel, "red-solid");
              if (blockBadge) nicknameElement.after(blockBadge);
            }
            const cacheHTML = article.innerHTML;
            article.innerHTML = buildBlindWrapperHTML("\uAC8C\uC2DC\uAE00", cacheHTML);
            attachBlindToggleEvents(article);
          } else {
            article.remove();
          }
        } else if (currentMemberId && memoMap.has(currentMemberId)) {
          if (nicknameElement && !article.querySelector(`.ext-badge-id-${currentMemberId}`)) {
            const memoData = getMemoData(currentMemberId);
            const badge = createMemoBadgeElement(currentMemberId, memoData.text, memoData.color);
            if (badge) nicknameElement.after(badge);
          }
        }
      });
      document.querySelectorAll("li span.title a, li div.eq span.text-link").forEach((titleEl) => {
        const parentLi = titleEl.closest("li");
        if (!parentLi) return;
        const nicknameElement = parentLi.querySelector('a[class*="member_"]');
        let currentMemberId = "";
        if (nicknameElement) {
          const match = nicknameElement.className.match(/member_(\d+)/);
          if (match) currentMemberId = match[1];
        }
        if (filterKeywords.length > 0) {
          const titleText = titleEl.textContent.trim();
          if (filterKeywords.some((kw) => checkKeywordMatchCondition(titleText, kw, "posts"))) {
            parentLi.remove();
            return;
          }
        }
        if (currentMemberId && blockedMemberIds.includes(currentMemberId)) {
          if (isBadgeMode) {
            if (nicknameElement && !parentLi.querySelector(`.ext-badge-id-${currentMemberId}`)) {
              const userObj = blockedUserMap.get(currentMemberId);
              const badgeLabel = userObj && userObj.memo && userObj.memo.trim() !== "" ? userObj.memo.trim() : "\uCC28\uB2E8\uB428";
              const blockBadge = createMemoBadgeElement(currentMemberId, badgeLabel, "red-solid");
              if (blockBadge) nicknameElement.after(blockBadge);
            }
            parentLi.style.backgroundColor = "#fff1f2";
            parentLi.classList.add("ext-blocked-user-layout");
            return;
          }
          if (parentLi.dataset.extFiltered) return;
          parentLi.dataset.extFiltered = "true";
          if (isBlindMode) {
            if (nicknameElement && !parentLi.querySelector(`.ext-badge-id-${currentMemberId}`)) {
              const userObj = blockedUserMap.get(currentMemberId);
              const badgeLabel = userObj && userObj.memo && userObj.memo.trim() !== "" ? userObj.memo.trim() : "\uCC28\uB2E8\uB428";
              const blockBadge = createMemoBadgeElement(currentMemberId, badgeLabel, "red-solid");
              if (blockBadge) nicknameElement.after(blockBadge);
            }
            const cacheHTML = parentLi.innerHTML;
            parentLi.innerHTML = buildBlindWrapperHTML("\uAC8C\uC2DC\uAE00", cacheHTML);
            attachBlindToggleEvents(parentLi);
          } else {
            parentLi.remove();
          }
        } else if (currentMemberId && memoMap.has(currentMemberId)) {
          if (nicknameElement && !parentLi.querySelector(`.ext-badge-id-${currentMemberId}`)) {
            const memoData = getMemoData(currentMemberId);
            const badge = createMemoBadgeElement(currentMemberId, memoData.text, memoData.color);
            if (badge) nicknameElement.after(badge);
          }
        }
      });
      document.querySelectorAll("tr.ed").forEach((row) => {
        const titleElement = row.querySelector(".title");
        const authorElement = row.querySelector(".author a[class*='member_']");
        let shouldRemove = false;
        let shouldBlind = false;
        if (titleElement && filterKeywords.length > 0) {
          const realTitleLink = titleElement.querySelector(".title-link");
          let titleText = "";
          if (realTitleLink) {
            titleText = realTitleLink.textContent.trim();
          } else {
            const mainLink = titleElement.querySelector('a[href*="dogdrip.net/"], a[href^="/"]');
            if (mainLink) {
              const cloneLink = mainLink.cloneNode(true);
              const replyBadge = cloneLink.querySelector(".text-primary");
              if (replyBadge) replyBadge.remove();
              titleText = cloneLink.textContent.replace(/\[.*?\]/g, "").trim();
            } else {
              titleText = titleElement.textContent.trim();
            }
          }
          const cleanTitleText = titleText.replace(/[\s\n\r\t]+/g, " ").trim();
          if (filterKeywords.some((kw) => checkKeywordMatchCondition(cleanTitleText, kw, "posts"))) {
            shouldRemove = true;
          }
        }
        let currentMemberId = "";
        if (authorElement) {
          const match = authorElement.className.match(/member_(\d+)/);
          if (match) {
            currentMemberId = match[1];
            if (blockedMemberIds.includes(currentMemberId)) shouldBlind = true;
          }
        }
        if (shouldRemove) {
          row.remove();
          return;
        }
        if (shouldBlind) {
          if (isBadgeMode) {
            if (currentMemberId && authorElement && !row.querySelector(`.ext-badge-id-${currentMemberId}`)) {
              const userObj = blockedUserMap.get(currentMemberId);
              const badgeLabel = userObj && userObj.memo && userObj.memo.trim() !== "" ? userObj.memo.trim() : "\uCC28\uB2E8\uB428";
              const blockBadge = createMemoBadgeElement(currentMemberId, badgeLabel, "red-solid");
              if (blockBadge) authorElement.after(blockBadge);
            }
            row.style.backgroundColor = "#fff1f2";
            row.classList.add("ext-blocked-user-layout");
            return;
          }
          if (row.dataset.extFiltered) return;
          row.dataset.extFiltered = "true";
          if (isBlindMode) {
            if (authorElement && !row.querySelector(`.ext-badge-id-${currentMemberId}`)) {
              const userObj = blockedUserMap.get(currentMemberId);
              const badgeLabel = userObj && userObj.memo && userObj.memo.trim() !== "" ? userObj.memo.trim() : "\uCC28\uB2E8\uB428";
              const blockBadge = createMemoBadgeElement(currentMemberId, badgeLabel, "red-solid");
              if (blockBadge) authorElement.after(blockBadge);
            }
            const colCount = row.querySelectorAll("td, th").length || 6;
            const cacheHTML = row.innerHTML;
            row.innerHTML = `<td colspan="${colCount}" style="padding: 0;">${buildBlindWrapperHTML("\uAC8C\uC2DC\uAE00", `<table style="width:100%"><tbody><tr>${cacheHTML}</tr></tbody></table>`)}</td>`;
            attachBlindToggleEvents(row);
          } else {
            row.remove();
          }
        } else if (currentMemberId && memoMap.has(currentMemberId)) {
          if (authorElement && !row.querySelector(`.ext-badge-id-${currentMemberId}`)) {
            const memoData = getMemoData(currentMemberId);
            const badge = createMemoBadgeElement(currentMemberId, memoData.text, memoData.color);
            if (badge) authorElement.after(badge);
          }
        }
      });
      document.querySelectorAll(".ed.comment-content").forEach((comment) => {
        const nicknameElement = comment.querySelector('a[class*="member_"]');
        let shouldKeywordRemove = false;
        const commentBodyTextEl = comment.querySelector(".xe_content, .comment-text");
        if (commentBodyTextEl && filterKeywords.length > 0) {
          const rawContent = (commentBodyTextEl.innerText || commentBodyTextEl.textContent || "").replace(/[\s\n\r\t]+/g, " ");
          const commentText = rawContent.trim();
          if (filterKeywords.some((kw) => checkKeywordMatchCondition(commentText, kw, "comments"))) {
            shouldKeywordRemove = true;
          }
        }
        if (shouldKeywordRemove) {
          const totalCommentTarget = comment.closest("li, div.comment-item") || comment;
          if (totalCommentTarget.dataset.extFiltered) return;
          totalCommentTarget.dataset.extFiltered = "true";
          if (isBlindMode) {
            const cacheHTML = totalCommentTarget.innerHTML;
            totalCommentTarget.innerHTML = buildBlindWrapperHTML("\uD0A4\uC6CC\uB4DC\uAC00 \uD3EC\uD568\uB41C \uB313\uAE00", cacheHTML);
            attachBlindToggleEvents(totalCommentTarget);
          } else {
            totalCommentTarget.remove();
          }
          return;
        }
        let currentMemberId = "";
        if (nicknameElement) {
          const match = nicknameElement.className.match(/member_(\d+)/);
          if (match) currentMemberId = match[1];
        }
        if (currentMemberId && blockedMemberIds.length > 0 && blockedMemberIds.includes(currentMemberId)) {
          const totalCommentTarget = comment.closest("li, div.comment-item") || comment;
          if (isBadgeMode) {
            if (nicknameElement && !comment.querySelector(`.ext-badge-id-${currentMemberId}`)) {
              const userObj = blockedUserMap.get(currentMemberId);
              const badgeLabel = userObj && userObj.memo && userObj.memo.trim() !== "" ? userObj.memo.trim() : "\uCC28\uB2E8\uB428";
              const blockBadge = createMemoBadgeElement(currentMemberId, badgeLabel, "red-solid");
              if (blockBadge) nicknameElement.after(blockBadge);
            }
            totalCommentTarget.style.backgroundColor = "#fff1f2";
            totalCommentTarget.classList.add("ext-blocked-user-layout");
            return;
          }
          if (totalCommentTarget.dataset.extFiltered) return;
          totalCommentTarget.dataset.extFiltered = "true";
          if (isBlindMode) {
            if (nicknameElement && !totalCommentTarget.querySelector(`.ext-badge-id-${currentMemberId}`)) {
              const userObj = blockedUserMap.get(currentMemberId);
              const badgeLabel = userObj && userObj.memo && userObj.memo.trim() !== "" ? userObj.memo.trim() : "\uCC28\uB2E8\uB428";
              const blockBadge = createMemoBadgeElement(currentMemberId, badgeLabel, "red-solid");
              if (blockBadge) nicknameElement.after(blockBadge);
            }
            const cacheHTML = totalCommentTarget.innerHTML;
            totalCommentTarget.innerHTML = buildBlindWrapperHTML("\uB313\uAE00", cacheHTML);
            attachBlindToggleEvents(totalCommentTarget);
          } else {
            totalCommentTarget.remove();
          }
          return;
        }
        if (nicknameElement && currentMemberId && memoMap.has(currentMemberId)) {
          if (!comment.querySelector(`.ext-badge-id-${currentMemberId}`)) {
            const memoData = getMemoData(currentMemberId);
            const badge = createMemoBadgeElement(currentMemberId, memoData.text, memoData.color);
            if (badge) nicknameElement.after(badge);
          }
        }
        if (nicknameElement && currentMemberId) {
          const nicknameText = nicknameElement.textContent.trim();
          const dropdownMenu = comment.querySelector("ul.dropdown-menu");
          if (dropdownMenu) {
            const emptyLis = Array.from(dropdownMenu.querySelectorAll("li")).filter((li) => li.innerHTML.trim() === "");
            if (emptyLis.length > 0) {
              const targetLi = emptyLis[0];
              if (!targetLi.querySelector(".ext-block-menu-item")) {
                targetLi.innerHTML = `<a class="ext-block-menu-item"><span class="ed icon"><i class="fas fa-user-slash"></i></span>\uCC28\uB2E8</a>`;
                targetLi.querySelector("a").addEventListener("click", (e) => {
                  e.preventDefault();
                  openBlockModal(nicknameText, currentMemberId);
                });
              }
            }
          }
        }
      });
      const titleToolbar = document.querySelector(".title-toolbar");
      if (titleToolbar) {
        const authorElement = titleToolbar.querySelector('a[class*="member_"]');
        const dropdownMenu = titleToolbar.querySelector("ul.dropdown-menu");
        if (authorElement && dropdownMenu) {
          const authorMemberId = authorElement.className.match(/member_(\d+)/)?.[1];
          if (authorMemberId) {
            if (blockedMemberIds.includes(authorMemberId)) {
              if (!authorElement.querySelector(`.ext-badge-id-${authorMemberId}`) && !authorElement.nextElementSibling?.classList.contains("ext-user-memo-badge")) {
                const userObj = blockedUserMap.get(authorMemberId);
                const badgeLabel = userObj && userObj.memo && userObj.memo.trim() !== "" ? userObj.memo.trim() : "\uCC28\uB2E8\uB428";
                const blockBadge = createMemoBadgeElement(authorMemberId, badgeLabel, "red-solid");
                if (blockBadge) authorElement.after(blockBadge);
              }
            } else if (memoMap.has(authorMemberId) && !authorElement.nextElementSibling?.classList.contains("ext-user-memo-badge")) {
              const memoData = getMemoData(authorMemberId);
              const badge = createMemoBadgeElement(authorMemberId, memoData.text, memoData.color);
              if (badge) authorElement.after(badge);
            }
            const existingToolbarBtn = dropdownMenu.querySelector(".ext-toolbar-member-block");
            if (existingToolbarBtn) existingToolbarBtn.remove();
            const blockLi = document.createElement("li");
            blockLi.className = "ext-toolbar-member-block";
            if (blockedMemberIds.includes(authorMemberId)) {
              blockLi.innerHTML = `<a class="ext-block-menu-item" href="#popup_menu_area" onclick="return false;" style="color: #${GRANT_COLOR}; font-weight: bold;"><span class="ed icon"><i class="fas fa-user-check"></i></span> \uCC28\uB2E8 \uD574\uC81C</a>`;
              blockLi.querySelector("a").addEventListener("click", (e) => {
                e.preventDefault();
                storage.get(["blocked_users"]).then((res) => {
                  let currentList = res.blocked_users || [];
                  currentList = currentList.filter(
                    (item) => String(item.member_num) !== String(authorMemberId)
                  );
                  storage.set({ blocked_users: currentList }).then(() => {
                    window.location.reload();
                  });
                });
              });
            } else {
              blockLi.innerHTML = `<a class="ext-block-menu-item" href="#popup_menu_area" onclick="return false;" style="color: #${BLOCK_COLOR}; font-weight: bold;"><span class="ed icon"><i class="fas fa-user-slash"></i></span> \uCC28\uB2E8</a>`;
              blockLi.querySelector("a").addEventListener("click", (e) => {
                e.preventDefault();
                openBlockModal(authorElement.textContent.trim(), authorMemberId);
              });
            }
            dropdownMenu.insertBefore(blockLi, dropdownMenu.firstChild);
          }
        }
      }
      document.querySelectorAll(".ed.dropdown .ed.dropdown-menu").forEach((menu) => {
        injectDownloadAllButton(menu);
      });
      const dogconImgs = document.querySelectorAll("img.dogcon-clickable, img[data-dogcon-srl]");
      dogconImgs.forEach((img) => {
        const srl = img.getAttribute("data-dogcon-srl");
        const fileSrl = img.getAttribute("data-dogcon-file-srl");
        const title = img.getAttribute("data-title") || img.getAttribute("title") || "\uAC1C\uB4DC\uB9BD\uCF58";
        const alt = img.getAttribute("alt") || "\uCF58";
        if (img.dataset.extProcessed) return;
        img.dataset.extProcessed = "true";
        const isGroupBlocked = blockedDogconGroupIds.includes(srl);
        const isSingleBlocked = blockedDogconIds.includes(fileSrl);
        const infoUrl = `https://www.dogdrip.net/?mid=dogcon&dogcon_srl=${srl}`;
        if (isGroupBlocked || isSingleBlocked) {
          const blockDiv = document.createElement("div");
          blockDiv.className = "ext-dogcon-blocked";
          blockDiv.innerHTML = `\u{1F6AB} <span>${title} (${alt}) \uCC28\uB2E8\uB428</span><a href="${infoUrl}" target="_blank" class="dogcon-info-link" style="margin-left:6px; color:#0284c7; text-decoration:underline; font-weight:bold;">[\u2139\uFE0F \uC815\uBCF4]</a>`;
          blockDiv.querySelector(".dogcon-info-link").addEventListener("click", (e) => {
            e.stopPropagation();
          });
          blockDiv.dataset.srl = srl;
          blockDiv.dataset.fileSrl = fileSrl;
          blockDiv.dataset.title = title;
          blockDiv.dataset.alt = alt;
          blockDiv.dataset.isSingleBlocked = String(isSingleBlocked);
          blockDiv.dataset.isGroupBlocked = String(isGroupBlocked);
          blockDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            openDogconMenu(e, blockDiv, true);
          });
          img.parentNode.insertBefore(blockDiv, img);
          img.remove();
        } else {
          img.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const mockDataElement = document.createElement("div");
            mockDataElement.dataset.srl = srl;
            mockDataElement.dataset.fileSrl = fileSrl;
            mockDataElement.dataset.title = title;
            mockDataElement.dataset.alt = alt;
            mockDataElement.dataset.isSingleBlocked = "false";
            mockDataElement.dataset.isGroupBlocked = "false";
            openDogconMenu(e, mockDataElement, false);
          });
        }
      });
      if (result.disableVote === true) {
        document.querySelectorAll("td.ed.voteNum.text-primary").forEach((td) => {
          if (!td.dataset.extVoteProcessed) {
            td.dataset.extVoteProcessed = "true";
            td.innerHTML = '<i class="fas fa-baby"></i>';
          }
        });
        document.querySelectorAll("i.far.fa-thumbs-up").forEach((icon) => {
          if (!icon.dataset.extVoteProcessed) {
            icon.dataset.extVoteProcessed = "true";
            icon.className = "fas fa-baby";
            const parent = icon.closest("span.text-primary");
            if (parent?.nextElementSibling?.classList.contains("text-primary"))
              parent.nextElementSibling.remove();
          }
        });
        document.querySelectorAll("a.votebtn").forEach((btn) => {
          if (btn.dataset.extVoteProcessed) return;
          btn.dataset.extVoteProcessed = "true";
          if (btn.getAttribute("title") === "\uCD94\uCC9C") {
            const icon = btn.querySelector("i");
            if (icon) icon.className = "fas fa-baby";
            const count = btn.querySelector("span.count");
            if (count) count.remove();
            const parent = btn.parentElement;
            if (parent?.tagName.toLowerCase() === "span") {
              parent.parentNode.insertBefore(btn, parent);
              parent.remove();
            }
          }
          if (btn.getAttribute("title") === "\uBE44\uCD94\uCC9C") btn.remove();
        });
        document.querySelectorAll("a.comment-item-tool").forEach((link) => {
          link.classList.remove("border-left-dotted");
        });
      }
      if (result.preventYoutubeAlgorithm === true) {
        document.querySelectorAll('iframe[src*="youtube.com/embed/"]').forEach((iframe) => {
          if (!iframe.dataset.extYoutubeProcessed) {
            iframe.dataset.extYoutubeProcessed = "true";
            const src = iframe.getAttribute("src");
            if (src) iframe.setAttribute("src", src.replace("youtube.com/embed/", "youtube-nocookie.com/embed/"));
          }
        });
      }
      if (!result.contentWidth || result.contentWidth.trim() === "") {
        document.querySelectorAll(".container").forEach((el) => {
          el.style.maxWidth = "960px";
        });
      }
      const hiddenMenus = result.hiddenMenus || [];
      const hiddenSubMenus = result.hiddenSubMenus || [];
      if (hiddenMenus.length > 0 || hiddenSubMenus.length > 0) {
        const navLists = document.querySelectorAll(
          ".eq.navbar-nav, .eq.nav-menu"
        );
        navLists.forEach((navList) => {
          navList.querySelectorAll(":scope > li").forEach((topLi) => {
            const firstLink = topLi.querySelector("a[href]");
            if (!firstLink) return;
            try {
              const url = new URL(firstLink.href, location.origin);
              const topMid = url.pathname.split("/").filter(Boolean)[0] || "";
              if (hiddenMenus.includes(topMid)) {
                topLi.style.display = "none";
                return;
              }
              if (hiddenSubMenus.length > 0) {
                const subLinks = topLi.querySelectorAll(
                  "ul a[href], .child a[href]"
                );
                subLinks.forEach((subLink) => {
                  const subUrl = new URL(subLink.href, location.origin);
                  const subMid = resolveSubMid(subUrl);
                  if (hiddenSubMenus.includes(subMid)) {
                    const subLi = subLink.closest("li");
                    if (subLi) subLi.style.display = "none";
                  }
                });
              }
            } catch {
            }
          });
        });
      }
      if (hiddenMenus.length > 0 || hiddenSubMenus.length > 0) {
        document.querySelectorAll(".xe-widget-wrapper").forEach((widget) => {
          const titleEl = widget.querySelector(".widget-title-text, .eq.widget-title h4, .eq.widget-title .col-6:first-child");
          if (!titleEl) return;
          const titleLink = titleEl.querySelector("a[href]");
          if (!titleLink) return;
          try {
            const href = titleLink.getAttribute("href") || "";
            const url = new URL(href, location.origin);
            const topMid = url.pathname.split("/").filter(Boolean)[0] || "";
            if (topMid && hiddenMenus.includes(topMid)) {
              widget.style.display = "none";
              return;
            }
            if (hiddenSubMenus.length > 0) {
              const subMid = resolveSubMid(url);
              if (subMid && hiddenSubMenus.includes(subMid)) {
                widget.style.display = "none";
              }
            }
          } catch {
          }
        });
      }
      function resolveSubMid(url) {
        const pathname = url.pathname;
        const seg = pathname.split("/").filter(Boolean)[0] || "";
        const sortIndex = url.searchParams.get("sort_index");
        const category = url.searchParams.get("category");
        const mid = url.searchParams.get("mid") || seg;
        if (sortIndex) return `${mid}__${sortIndex}`;
        if (category) return `${mid}__cat_${category}`;
        return seg;
      }
      document.querySelectorAll("li.webzine").forEach((li) => {
        if (li.dataset.extHotdealProcessed) return;
        const titleLink = li.querySelector("a.title-link");
        if (!titleLink) return;
        const style = titleLink.getAttribute("style") || "";
        if (!style.includes("line-through")) return;
        li.dataset.extHotdealProcessed = "true";
        li.style.position = "relative";
        if (!li.querySelector(".ext-hotdeal-ended-overlay")) {
          const overlay = document.createElement("div");
          overlay.className = "ext-hotdeal-ended-overlay";
          li.appendChild(overlay);
        }
      });
      document.querySelectorAll("tr.ed").forEach((row) => {
        if (row.dataset.extHotdealProcessed) return;
        const titleLink = row.querySelector(".title a[data-document-srl], .title .title-link");
        if (!titleLink) return;
        const style = titleLink.getAttribute("style") || "";
        if (!style.includes("line-through")) return;
        row.dataset.extHotdealProcessed = "true";
        row.classList.add("ext-hotdeal-ended-row");
        const titleAnchor = row.querySelector("td.title a[data-document-srl]");
        if (titleAnchor && !row.querySelector(".ext-hotdeal-badge")) {
          const badge = document.createElement("span");
          badge.className = "ext-hotdeal-badge";
          badge.textContent = "\uC885\uB8CC";
          titleAnchor.parentNode.insertBefore(badge, titleAnchor);
        }
      });
      injectCopyLinkButton();
    });
    Promise.all([minTimePromise, filterPromise]).then(() => {
      removeLoadingOverlay();
    });
  }

  // src/common/versionCheck.ts
  function getVersionWeightNumber(versionStr) {
    if (!versionStr) return 0;
    const parts = versionStr.replace(/[vV\s]/g, "").split(".").map(Number);
    const major = parts[0] || 0;
    const minor = parts[1] || 0;
    const patch = parts[2] || 0;
    return major * 1e6 + minor * 1e3 + patch;
  }
  function compareVer(a, b) {
    return getVersionWeightNumber(a) - getVersionWeightNumber(b);
  }

  // src/common/colorPalette.ts
  var colorPalette = [
    { key: "blue", hex: "#3b82f6", name: "\uBE14\uB8E8" },
    { key: "green", hex: "#10b981", name: "\uADF8\uB9B0" },
    { key: "red", hex: "#ef4444", name: "\uB808\uB4DC" },
    { key: "yellow", hex: "#f59e0b", name: "\uC610\uB85C\uC6B0" },
    { key: "purple", hex: "#8b5cf6", name: "\uD37C\uD50C" },
    { key: "pink", hex: "#ec4899", name: "\uD551\uD06C" },
    { key: "cyan", hex: "#06b6d4", name: "\uC2DC\uC548" },
    { key: "orange", hex: "#f97316", name: "\uC624\uB80C\uC9C0" },
    { key: "teal", hex: "#14b8a6", name: "\uD2F0\uC77C" },
    { key: "gray", hex: "#64748b", name: "\uADF8\uB808\uC774" }
  ];

  // src/mobile/main.ts
  (function() {
    "use strict";
    const CURRENT_VERSION = "1.1.13";
    const VERSION_URL = "https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/version.txt";
    const storage = new MobileStorage();
    injectMobileCSS();
    let targetNicknameToBlock = "";
    let targetMemberIdToBlock = "";
    let targetMemoMemberId = "";
    let selectedMemoColorStyle = "blue";
    let lastClickedUserData = { memberId: "", nickname: "" };
    let currentActiveDogconData = null;
    const blockModalEl = document.createElement("div");
    blockModalEl.id = "ext-block-modal";
    blockModalEl.className = "ext-modal-overlay";
    blockModalEl.innerHTML = `
    <div class="ext-modal-box">
      <p class="ext-modal-title" id="ext-block-msg"></p>
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;">\uCC28\uB2E8 \uC0AC\uC720 (\uC120\uD0DD)</p>
      <input class="ext-modal-input" id="ext-block-reason" placeholder="\uD55C\uAE00, \uC22B\uC790, \uC601\uC5B4, ,. \uB9CC \uC785\uB825 \uAC00\uB2A5" />
      <div class="ext-modal-btns">
        <button class="ext-btn ext-btn-ghost" id="ext-block-cancel">\uCDE8\uC18C</button>
        <button class="ext-btn ext-btn-danger" id="ext-block-confirm">\uCC28\uB2E8</button>
      </div>
    </div>`;
    const memoModalEl = document.createElement("div");
    memoModalEl.id = "ext-memo-modal";
    memoModalEl.className = "ext-modal-overlay";
    memoModalEl.innerHTML = `
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
    </div>`;
    const dogconMenuEl = document.createElement("div");
    dogconMenuEl.id = "ext-dogcon-menu";
    const gearWrap = document.createElement("div");
    gearWrap.id = "ext-gear-wrap";
    const gearUpdateBadge = document.createElement("div");
    gearUpdateBadge.id = "ext-update-badge";
    gearUpdateBadge.textContent = "NEW";
    const gearBtn = document.createElement("button");
    gearBtn.id = "ext-gear-btn";
    gearBtn.title = "\uAC1C\uB4DC\uB9BD Plus+ \uC124\uC815";
    gearBtn.textContent = "\u2699\uFE0F";
    gearWrap.appendChild(gearUpdateBadge);
    gearWrap.appendChild(gearBtn);
    const settingsPanel = document.createElement("div");
    settingsPanel.id = "ext-settings-panel";
    settingsPanel.innerHTML = buildSettingsPanelHTML();
    function appendUI() {
      if (!document.documentElement) return false;
      if (document.getElementById("ext-block-modal")) return true;
      document.documentElement.appendChild(blockModalEl);
      document.documentElement.appendChild(memoModalEl);
      document.documentElement.appendChild(dogconMenuEl);
      document.documentElement.appendChild(gearWrap);
      document.documentElement.appendChild(settingsPanel);
      bindBlockModal();
      bindMemoModal();
      bindGearAndPanel(storage, gearBtn, gearUpdateBadge, settingsPanel, CURRENT_VERSION);
      return true;
    }
    if (!appendUI()) {
      const obs = new MutationObserver(() => {
        if (appendUI()) obs.disconnect();
      });
      obs.observe(document, { childList: true, subtree: true });
    }
    function openBlockModal(nickname, memberId) {
      targetNicknameToBlock = nickname;
      targetMemberIdToBlock = memberId;
      document.getElementById("ext-block-reason").value = "";
      document.getElementById("ext-block-msg").innerHTML = `<strong>${nickname}${memberId ? `(${memberId})` : ""}</strong>\uB2D8\uC744 \uCC28\uB2E8\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?<br/><small style="color:#64748b;">\uCC28\uB2E8 \uC2DC \uD574\uB2F9 \uC0AC\uC6A9\uC790\uC758 \uAE00\xB7\uB313\uAE00\uC774 \uC228\uACA8\uC9D1\uB2C8\uB2E4.</small>`;
      blockModalEl.classList.add("show");
      setTimeout(() => document.getElementById("ext-block-reason").focus(), 50);
    }
    function closeBlockModal() {
      blockModalEl.classList.remove("show");
      targetNicknameToBlock = "";
      targetMemberIdToBlock = "";
    }
    function bindBlockModal() {
      const reasonInput = blockModalEl.querySelector("#ext-block-reason");
      reasonInput?.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9.,\s]/g, "");
      });
      blockModalEl.querySelector("#ext-block-cancel")?.addEventListener("click", closeBlockModal);
      blockModalEl.addEventListener("click", (e) => {
        if (e.target === blockModalEl) closeBlockModal();
      });
      blockModalEl.querySelector("#ext-block-confirm")?.addEventListener("click", () => {
        if (!targetNicknameToBlock || !targetMemberIdToBlock) {
          closeBlockModal();
          return;
        }
        const reason = blockModalEl.querySelector("#ext-block-reason").value.trim();
        const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        const newUser = { date: today, member_num: String(targetMemberIdToBlock).trim(), memo: reason };
        storage.get(["blocked_users"]).then((r) => {
          const list = r.blocked_users || [];
          if (!list.some((x) => String(x.member_num) === String(targetMemberIdToBlock))) {
            list.push(newUser);
            storage.set({ blocked_users: list }).then(() => {
              closeBlockModal();
              location.reload();
            });
          } else {
            alert("\uC774\uBBF8 \uCC28\uB2E8\uB41C \uC0AC\uC6A9\uC790\uC785\uB2C8\uB2E4.");
            closeBlockModal();
          }
        });
      });
    }
    function openMemoModal(nickname, memberId, rawData) {
      targetMemoMemberId = memberId;
      let text = "", selectedColor = "blue";
      if (rawData) {
        if (rawData.includes(":")) {
          const p = rawData.split(":");
          text = p[0];
          selectedColor = p[1] || "blue";
        } else text = rawData;
      }
      selectedMemoColorStyle = selectedColor;
      document.getElementById("ext-memo-modal-title").innerHTML = `\u{1F4DD} <strong>${nickname}</strong> \uBA54\uBAA8`;
      const inp = document.getElementById("ext-memo-input");
      inp.value = text;
      document.getElementById("ext-memo-delete").style.display = text ? "block" : "none";
      renderColorPicker();
      memoModalEl.classList.add("show");
      setTimeout(() => inp.focus(), 50);
    }
    function closeMemoModal() {
      memoModalEl.classList.remove("show");
      targetMemoMemberId = "";
    }
    function renderColorPicker() {
      const picker = document.getElementById("ext-memo-color-picker");
      if (!picker) return;
      picker.innerHTML = "";
      colorPalette.forEach((c) => {
        const chip = document.createElement("div");
        chip.className = `ext-color-chip${selectedMemoColorStyle === c.key ? " selected" : ""}`;
        chip.style.background = c.hex;
        chip.title = c.key;
        chip.addEventListener("click", () => {
          selectedMemoColorStyle = c.key;
          picker.querySelectorAll(".ext-color-chip").forEach((x) => x.classList.remove("selected"));
          chip.classList.add("selected");
        });
        picker.appendChild(chip);
      });
    }
    function bindMemoModal() {
      memoModalEl.querySelector("#ext-memo-cancel")?.addEventListener("click", closeMemoModal);
      memoModalEl.addEventListener("click", (e) => {
        if (e.target === memoModalEl) closeMemoModal();
      });
      const inp = memoModalEl.querySelector("#ext-memo-input");
      const confirmBtn = memoModalEl.querySelector("#ext-memo-confirm");
      inp?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          confirmBtn.click();
        }
      });
      confirmBtn?.addEventListener("click", () => {
        if (!targetMemoMemberId) {
          closeMemoModal();
          return;
        }
        const text = inp.value.trim();
        storage.get(["userMemos"]).then((r) => {
          const memos = r.userMemos || {};
          if (text) memos[targetMemoMemberId] = `${text}:${selectedMemoColorStyle}`;
          else delete memos[targetMemoMemberId];
          storage.set({ userMemos: memos }).then(() => {
            closeMemoModal();
            location.reload();
          });
        });
      });
      memoModalEl.querySelector("#ext-memo-delete")?.addEventListener("click", () => {
        if (!targetMemoMemberId) {
          closeMemoModal();
          return;
        }
        storage.get(["userMemos"]).then((r) => {
          const memos = r.userMemos || {};
          delete memos[targetMemoMemberId];
          storage.set({ userMemos: memos }).then(() => {
            closeMemoModal();
            location.reload();
          });
        });
      });
    }
    function openDogconMenu(e, dataEl, _isBlocked) {
      currentActiveDogconData = {
        srl: dataEl.dataset.srl,
        fileSrl: dataEl.dataset.fileSrl,
        title: dataEl.dataset.title,
        alt: dataEl.dataset.alt,
        isSingleBlocked: dataEl.dataset.isSingleBlocked === "true",
        isGroupBlocked: dataEl.dataset.isGroupBlocked === "true"
      };
      const d = currentActiveDogconData;
      const infoUrl = `https://www.dogdrip.net/?mid=dogcon&dogcon_srl=${d.srl}`;
      const singleText = d.isSingleBlocked ? "\u{1F7E2} \uC774 \uAC1C\uB4DC\uB9BD\uCF58 \uCC28\uB2E8 \uD574\uC81C" : "\u274C \uC774 \uAC1C\uB4DC\uB9BD\uCF58\uB9CC \uCC28\uB2E8";
      const groupText = d.isGroupBlocked ? "\u{1F7E2} \uC774 \uADF8\uB8F9 \uC804\uCCB4 \uCC28\uB2E8 \uD574\uC81C" : "\u274C \uC774 \uAC1C\uB4DC\uB9BD\uCF58 \uADF8\uB8F9 \uC804\uCCB4 \uCC28\uB2E8";
      const singleCls = d.isSingleBlocked ? "unblock-action" : "block-action";
      const groupCls = d.isGroupBlocked ? "unblock-action" : "block-action";
      const singlePart = d.isGroupBlocked ? "" : `<div class="dogcon-menu-item ${singleCls}" id="ext-dc-single">${singleText}</div>`;
      dogconMenuEl.innerHTML = `${singlePart}<div class="dogcon-menu-item ${groupCls}" id="ext-dc-group">${groupText}</div>
      <div style="border-top:1px solid #e2e8f0;margin-top:4px;padding-top:4px;">
        <a href="${infoUrl}" target="_blank" class="dogcon-menu-item" style="text-decoration:none;color:#475569;">\u{1F517} ${d.title} \uC815\uBCF4</a>
      </div>`;
      dogconMenuEl.style.left = `${e.pageX}px`;
      dogconMenuEl.style.top = `${e.pageY}px`;
      dogconMenuEl.style.display = "block";
      dogconMenuEl.querySelector("#ext-dc-single")?.addEventListener("click", handleDogconSingle);
      dogconMenuEl.querySelector("#ext-dc-group")?.addEventListener("click", handleDogconGroup);
    }
    function handleDogconSingle() {
      if (!currentActiveDogconData) return;
      const id = currentActiveDogconData.fileSrl;
      const name = `${currentActiveDogconData.title}(${currentActiveDogconData.alt})`;
      storage.get(["blockedDogcons"]).then((r) => {
        let list = r.blockedDogcons || [];
        if (currentActiveDogconData.isSingleBlocked) list = list.filter((x) => x.id !== id);
        else if (!list.some((x) => x.id === id)) list.push({ id, name });
        storage.set({ blockedDogcons: list }).then(() => location.reload());
      });
    }
    function handleDogconGroup() {
      if (!currentActiveDogconData) return;
      const id = currentActiveDogconData.srl;
      const name = currentActiveDogconData.title;
      storage.get(["blockedDogconGroups"]).then((r) => {
        let list = r.blockedDogconGroups || [];
        if (currentActiveDogconData.isGroupBlocked) list = list.filter((x) => x.id !== id);
        else if (!list.some((x) => x.id === id)) list.push({ id, name });
        storage.set({ blockedDogconGroups: list }).then(() => location.reload());
      });
    }
    document.addEventListener("click", (e) => {
      const menu = document.getElementById("ext-dogcon-menu");
      if (menu) menu.style.display = "none";
      const uLink = e.target.closest('a[class*="member_"]');
      if (uLink) {
        const m = uLink.className.match(/member_(\d+)/);
        if (m) {
          lastClickedUserData.memberId = m[1];
          lastClickedUserData.nickname = uLink.textContent.trim();
        }
        const area = document.getElementById("popup_menu_area");
        if (area && window.getComputedStyle(area).display !== "none") handlePopupMenu(area);
      }
    });
    function insertMemberMenu(memberId, nickname, isBlocked, memoData) {
      const area = document.getElementById("popup_menu_area");
      if (!area) return;
      const ul = area.querySelector("ul");
      if (!ul) return;
      ul.querySelectorAll(".ext-ins-block, .ext-ins-memo").forEach((x) => x.remove());
      const pureMemo = memoData.includes(":") ? memoData.split(":")[0] : memoData;
      const memoLi = document.createElement("li");
      memoLi.className = "ext-ins-memo";
      const suffix = pureMemo ? ` <span style="font-size:11px;color:#64748b;">(${pureMemo.length > 8 ? pureMemo.slice(0, 8) + "..." : pureMemo})</span>` : "";
      memoLi.innerHTML = `<a href="#" style="color:#0284c7;font-weight:bold;">\uBA54\uBAA8${suffix}</a>`;
      memoLi.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        area.style.display = "none";
        openMemoModal(nickname, memberId, memoData);
      });
      const blockLi = document.createElement("li");
      blockLi.className = "ext-ins-block";
      if (isBlocked) {
        blockLi.innerHTML = `<a href="#" style="color:#${GRANT_COLOR};font-weight:bold;">\uCC28\uB2E8 \uD574\uC81C</a>`;
        blockLi.querySelector("a").addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          area.style.display = "none";
          storage.get(["blocked_users"]).then((r) => {
            const list = (r.blocked_users || []).filter((x) => String(x.member_num) !== memberId);
            storage.set({ blocked_users: list }).then(() => location.reload());
          });
        });
      } else {
        blockLi.innerHTML = `<a href="#" style="color:#${BLOCK_COLOR};font-weight:bold;">\uCC28\uB2E8</a>`;
        blockLi.querySelector("a").addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          area.style.display = "none";
          openBlockModal(nickname, memberId);
        });
      }
      ul.appendChild(memoLi);
      ul.appendChild(blockLi);
    }
    function handlePopupMenu(el) {
      const cs = window.getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return;
      if (!lastClickedUserData.memberId) {
        const lastLink = el.querySelector('a[class*="member_"]') || document.querySelector('a[class*="member_"]:focus');
        if (lastLink) {
          const m = lastLink.className.match(/member_(\d+)/);
          if (m) {
            lastClickedUserData.memberId = m[1];
            lastClickedUserData.nickname = lastLink.textContent.trim();
          }
        }
        if (!lastClickedUserData.memberId) return;
      }
      storage.get(["blocked_users", "userMemos"]).then((r) => {
        const list = r.blocked_users || [];
        const memos = r.userMemos || {};
        const isBlocked = list.some((x) => String(x.member_num) === lastClickedUserData.memberId);
        insertMemberMenu(lastClickedUserData.memberId, lastClickedUserData.nickname, isBlocked, memos[lastClickedUserData.memberId] || "");
      });
    }
    const popupObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const el = node;
            const hasDogcon = el.querySelector?.("img.dogcon-clickable, img[data-dogcon-srl]");
            const hasMember = el.querySelector?.('a[class*="member_"]');
            if (hasDogcon || hasMember || ["IMG", "DIV", "LI", "TR", "A"].includes(el.tagName)) {
              setTimeout(() => {
                attachBlindToggleEvents(document.body);
                const unprocessed = document.querySelectorAll("img.dogcon-clickable:not([data-ext-processed]), img[data-dogcon-srl]:not([data-ext-processed])");
                if (unprocessed.length || hasMember) scheduleFilter(80);
              }, 50);
            }
            if (el.id === "popup_menu_area") handlePopupMenu(el);
            else {
              const nested = el.querySelector?.("#popup_menu_area");
              if (nested) handlePopupMenu(nested);
            }
          });
        } else if (m.type === "attributes" && m.attributeName === "style") {
          if (m.target.id === "popup_menu_area") handlePopupMenu(m.target);
        }
      }
    });
    const _contentObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          const el = node;
          const hasRows = el.matches?.("tr.ed, li.webzine, li.ed, div.ed.board-item") || el.querySelector?.("tr.ed, li.webzine, li.ed, div.ed.board-item");
          if (hasRows) {
            scheduleFilter(80);
            return;
          }
        }
      }
    });
    function startObserver() {
      popupObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });
      const existingPopup = document.getElementById("popup_menu_area");
      if (existingPopup) {
        new MutationObserver(() => handlePopupMenu(existingPopup)).observe(existingPopup, { attributes: true, attributeFilter: ["style", "class"] });
      }
    }
    function startContentObserver() {
      _contentObserver.observe(document.body, { childList: true, subtree: true });
    }
    function checkVersion() {
      fetch(VERSION_URL + "?_=" + Date.now()).then((r) => r.ok ? r.text() : null).then((text) => {
        if (!text) return;
        const latest = text.trim();
        if (!latest) return;
        window._extLatestVersion = latest;
        if (compareVer(latest, CURRENT_VERSION) > 0) {
          gearBtn.classList.add("has-update");
          gearUpdateBadge.textContent = "v" + latest;
          gearUpdateBadge.classList.add("show");
          gearBtn.title = `\uAC1C\uB4DC\uB9BD Plus+ \uC124\uC815 (\uC5C5\uB370\uC774\uD2B8 \uC788\uC74C: v${latest})`;
        }
      }).catch(() => {
      });
    }
    const filterDeps = {
      storage,
      openBlockModal,
      openDogconMenu,
      injectDownloadAllButton,
      injectCopyLinkButton
    };
    let _filterTimer = null;
    function scheduleFilter(delay = 120) {
      if (_filterTimer) clearTimeout(_filterTimer);
      _filterTimer = setTimeout(() => executeFilterWithMinTime(filterDeps), delay);
    }
    function injectCopyLinkButton() {
      document.querySelectorAll(".ed.article-head.margin-bottom-large .ed.margin-xxsmall.text-default").forEach((container) => {
        if (container.querySelector(".ext-copy-link-btn")) return;
        if (!container.querySelector("i.fas.fa-link")) return;
        const linkEl = container.querySelector("a[href]");
        if (!linkEl) return;
        const url = linkEl.href;
        const btn = document.createElement("button");
        btn.className = "ext-copy-link-btn";
        btn.textContent = "\uB9C1\uD06C \uBCF5\uC0AC";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          navigator.clipboard.writeText(url).then(() => {
            btn.textContent = "\uBCF5\uC0AC\uB428 \u2713";
            setTimeout(() => {
              btn.textContent = "\uB9C1\uD06C \uBCF5\uC0AC";
            }, 1500);
          }).catch(() => {
            const ta = document.createElement("textarea");
            ta.value = url;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            btn.textContent = "\uBCF5\uC0AC\uB428 \u2713";
            setTimeout(() => {
              btn.textContent = "\uB9C1\uD06C \uBCF5\uC0AC";
            }, 1500);
          });
        });
        container.appendChild(btn);
        injectReaderModeButton(container);
      });
    }
    function injectReaderModeButton(container) {
      if (container.querySelector(".ext-reader-mode-btn")) return;
      const btn = document.createElement("button");
      btn.className = "ext-reader-mode-btn ext-copy-link-btn";
      const isOn = () => document.documentElement.classList.contains("ext-reader-mode");
      const update = () => {
        btn.textContent = isOn() ? "\uC77D\uAE30 \uBAA8\uB4DC \uC885\uB8CC" : "\uC77D\uAE30 \uBAA8\uB4DC";
      };
      update();
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.documentElement.classList.toggle("ext-reader-mode");
        update();
        if (isOn()) {
          const articleHead = document.querySelector(".ed.article-head.margin-bottom-large");
          if (articleHead) articleHead.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      container.appendChild(btn);
    }
    function injectDownloadAllButton(menu) {
      if (!menu || menu.querySelector(".ext-dl-all-btn")) return;
      const links = Array.from(menu.querySelectorAll("li a[href*='procFileDownload']"));
      if (links.length < 2) return;
      const INTERVAL_MS = 300;
      const btnLi = document.createElement("li");
      btnLi.style.cssText = "border-bottom: 1px solid #e2e8f0; margin-bottom: 4px; padding-bottom: 4px;";
      const btn = document.createElement("a");
      btn.className = "ext-dl-all-btn";
      btn.href = "#";
      btn.innerHTML = `<i class="fas fa-download"></i> <span>\uC804\uCCB4 \uB2E4\uC6B4\uB85C\uB4DC (${links.length}\uAC1C)</span>`;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const span = btn.querySelector("span");
        span.textContent = `\uB2E4\uC6B4\uB85C\uB4DC \uC911... (${links.length}\uAC1C)`;
        btn.style.color = "#64748b";
        links.forEach((link, i) => {
          setTimeout(() => {
            const a = document.createElement("a");
            a.href = link.href;
            a.download = "";
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }, i * INTERVAL_MS);
        });
        setTimeout(() => {
          span.textContent = `\uC804\uCCB4 \uB2E4\uC6B4\uB85C\uB4DC (${links.length}\uAC1C)`;
          btn.style.color = "#0284c7";
        }, links.length * INTERVAL_MS + 500);
      });
      btnLi.appendChild(btn);
      menu.insertBefore(btnLi, menu.firstChild);
    }
    function showLoadingOverlay() {
      if (document.getElementById("ext-loading-overlay")) return;
      const ov = document.createElement("div");
      ov.id = "ext-loading-overlay";
      ov.innerHTML = `<div class="ext-spinner"></div><div class="ext-loading-text">\uD398\uC774\uC9C0 \uCD5C\uC801\uD654 \uC911...</div>`;
      document.documentElement.appendChild(ov);
    }
    showLoadingOverlay();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => scheduleFilter(300));
    } else {
      scheduleFilter(100);
    }
    if (document.body) {
      startObserver();
      startContentObserver();
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        startObserver();
        startContentObserver();
      });
    }
    window.addEventListener("load", () => {
      removeLoadingOverlay();
      scheduleFilter(500);
      setTimeout(checkVersion, 5e3);
      bindContentImageGallery();
    });
  })();
})();