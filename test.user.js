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

  // 1. 실행 확인
  console.log("[진단] 스크립트 실행됨");

  // 2. GM API 확인
  console.log("[진단] GM typeof:", typeof GM);
  console.log("[진단] GM_getValue typeof:", typeof GM_getValue);
  console.log(
    "[진단] GM.getValue typeof:",
    typeof GM !== "undefined" ? typeof GM.getValue : "GM없음",
  );

  // 3. 기어버튼 붙이기
  function injectGear() {
    if (document.getElementById("ext-test-gear")) return;
    const btn = document.createElement("button");
    btn.id = "ext-test-gear";
    btn.textContent = "⚙️ 테스트";
    btn.style.cssText =
      "position:fixed;bottom:24px;right:16px;z-index:999999;padding:10px;background:#333;color:#fff;border:none;border-radius:50%;font-size:18px;cursor:pointer;";
    document.body.appendChild(btn);
    btn.addEventListener("click", () => alert("작동!"));
    console.log("[진단] 기어버튼 삽입됨");
  }

  if (document.body) {
    injectGear();
  } else {
    document.addEventListener("DOMContentLoaded", injectGear);
  }
})();
