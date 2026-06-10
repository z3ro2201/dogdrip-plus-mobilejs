// ==UserScript==
// @name         개드립 Plus+ 진단
// @namespace    https://github.com/z3ro2201
// @version      1.0.0
// @match        *://*.dogdrip.net/*
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  function injectDiag() {
    const box = document.createElement("div");
    box.style.cssText =
      "position:fixed;bottom:80px;right:16px;z-index:999999;background:#1e293b;color:#e2e8f0;padding:12px 16px;border-radius:10px;font-size:12px;font-family:monospace;max-width:260px;line-height:1.8;";

    const gmType = typeof GM;
    const gmGetType = typeof GM !== "undefined" ? typeof GM.getValue : "N/A";
    const gmSyncType = typeof GM_getValue;

    box.innerHTML = `
      <div style="font-weight:bold;margin-bottom:6px;">⚙️ GM 진단</div>
      <div>GM: <b>${gmType}</b></div>
      <div>GM.getValue: <b>${gmGetType}</b></div>
      <div>GM_getValue: <b>${gmSyncType}</b></div>
    `;

    // GM.getValue 테스트
    if (typeof GM !== "undefined" && typeof GM.getValue === "function") {
      GM.getValue("__test__", "ok")
        .then((v) => {
          const el = document.createElement("div");
          el.innerHTML = `GM.getValue: <b style="color:#4ade80">✓ ${v}</b>`;
          box.appendChild(el);
        })
        .catch((e) => {
          const el = document.createElement("div");
          el.innerHTML = `GM.getValue: <b style="color:#f87171">✗ ${e}</b>`;
          box.appendChild(el);
        });
    } else if (typeof GM_getValue === "function") {
      try {
        const v = GM_getValue("__test__", "ok");
        const el = document.createElement("div");
        el.innerHTML = `GM_getValue: <b style="color:#4ade80">✓ ${v}</b>`;
        box.appendChild(el);
      } catch (e) {
        const el = document.createElement("div");
        el.innerHTML = `GM_getValue: <b style="color:#f87171">✗ ${e}</b>`;
        box.appendChild(el);
      }
    } else {
      const el = document.createElement("div");
      el.innerHTML = `<b style="color:#f87171">GM API 없음 → localStorage</b>`;
      box.appendChild(el);
    }

    document.body.appendChild(box);
  }

  if (document.body) injectDiag();
  else document.addEventListener("DOMContentLoaded", injectDiag);
})();
