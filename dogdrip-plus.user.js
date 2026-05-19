// ==UserScript==
// @name         개드립 Plus+ (Userscript)
// @namespace    https://github.com/z3ro2201/dogdrip-plus-mobilejs
// @version      1.1.0
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
// @updateURL    https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/dogdrip-plus.user.js
// @downloadURL  https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/dogdrip-plus.user.js
// ==/UserScript==

(function () {
  "use strict";

  /* =========================================================================
   * 1. 스토리지 래퍼
   *    우선순위: GM_getValue (동기, Tampermonkey)
   *             → GM.getValue  (Promise, Userscripts iOS)
   *             → localStorage (최후 폴백)
   * ========================================================================= */
  const LS_PREFIX = "ddplus_";

  const _backend = (() => {
    // ── Tampermonkey / Violentmonkey 계열 (동기 GM_*)
    if (typeof GM_getValue === "function") {
      return {
        async get(key) {
          const r = GM_getValue(key, null);
          return r !== null ? JSON.parse(r) : undefined;
        },
        async set(key, val) {
          GM_setValue(key, JSON.stringify(val));
        },
        async remove(key) {
          GM_deleteValue(key);
        },
      };
    }
    // ── Userscripts iOS / 일부 확장 (Promise GM.*)
    if (typeof GM !== "undefined" && typeof GM.getValue === "function") {
      return {
        async get(key) {
          const r = await GM.getValue(key, null);
          return r !== null ? JSON.parse(r) : undefined;
        },
        async set(key, val) {
          await GM.setValue(key, JSON.stringify(val));
        },
        async remove(key) {
          await GM.deleteValue(key);
        },
      };
    }
    // ── 최후 폴백: localStorage (기기/앱 재설치 시 유실 주의)
    console.warn("[개드립Plus] GM API 없음 → localStorage 폴백 사용");
    return {
      async get(key) {
        const r = localStorage.getItem(LS_PREFIX + key);
        return r !== null ? JSON.parse(r) : undefined;
      },
      async set(key, val) {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(val));
      },
      async remove(key) {
        localStorage.removeItem(LS_PREFIX + key);
      },
    };
  })();

  const Store = {
    async get(keys) {
      const list = Array.isArray(keys) ? keys : [keys];
      const result = {};
      await Promise.all(
        list.map(async (k) => {
          result[k] = await _backend.get(k);
        }),
      );
      return result;
    },
    async set(obj) {
      await Promise.all(
        Object.entries(obj).map(([k, v]) => _backend.set(k, v)),
      );
    },
    async remove(key) {
      await _backend.remove(key);
    },
  };

  /* =========================================================================
   * 2. 상수 / 전역 변수
   * ========================================================================= */
  const blockColor = "f43f5e";
  const grantColor = "16a34a";

  let targetNicknameToBlock = "";
  let targetMemberIdToBlock = "";
  let targetMemoMemberId = "";
  let selectedMemoColorStyle = "blue";
  let lastClickedUserData = { memberId: "", nickname: "" };
  let currentActiveDogconData = null;

  /* =========================================================================
   * 3. CSS 주입
   * ========================================================================= */
  const style = document.createElement("style");
  style.textContent = `
    /* ── 로딩 오버레이 ── */
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

    /* ── 공통 모달 ── */
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

    /* ── 블라인드 ── */
    .ext-blind-container { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 4px 0; }
    .ext-blind-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 10px; background: #f8fafc; font-size: 12px; color: #64748b;
    }
    .ext-blind-toggle-btn { font-size: 12px; color: #3b82f6; text-decoration: none; white-space: nowrap; }
    .ext-blind-body { display: none; }

    /* ── 유저 메모 배지 ── */
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

    /* ── 개드립콘 컨텍스트 메뉴 ── */
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

    /* ── 차단 유저 강조 ── */
    .ext-blocked-user-layout { background-color: #fff1f2 !important; }

    /* ── 메모 색상 피커 ── */
    #ext-memo-color-picker { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 16px; }
    .ext-color-chip {
      width: 22px; height: 22px; border-radius: 50%; cursor: pointer;
      box-sizing: border-box; transition: all 0.15s; border: 2px solid transparent;
    }
    .ext-color-chip.selected { border-color: #111827; transform: scale(1.2); box-shadow: 0 2px 6px rgba(0,0,0,0.18); }

    /* ── 차단 메뉴 항목 ── */
    .ext-block-menu-item { cursor: pointer; }

    /* ── ⚙️ 플로팅 설정 버튼 ── */
    #ext-gear-btn {
      position: fixed; bottom: 22px; right: 18px; z-index: 999998;
      width: 48px; height: 48px; border-radius: 50%;
      background: #3b82f6; color: #fff; border: none;
      font-size: 20px; cursor: pointer;
      box-shadow: 0 4px 14px rgba(59,130,246,0.45);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, background 0.2s;
    }
    #ext-gear-btn:active { transform: scale(0.92); background: #2563eb; }

    /* ── 설정 패널 ── */
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
      padding: 16px 18px 10px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: #fff; z-index: 1;
    }
    #ext-settings-header h2 { margin: 0; font-size: 16px; color: #111827; }
    #ext-settings-close {
      background: #f1f5f9; border: none; border-radius: 50%;
      width: 30px; height: 30px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .ext-tab-bar {
      display: flex; overflow-x: auto; border-bottom: 2px solid #f1f5f9;
      padding: 0 8px; gap: 4px; white-space: nowrap; scrollbar-width: none;
    }
    .ext-tab-bar::-webkit-scrollbar { display: none; }
    .ext-tab {
      padding: 10px 14px; border: none; background: none; cursor: pointer;
      font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 2px solid transparent; margin-bottom: -2px;
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
    .ext-keyword-badge { cursor: pointer; }
    .ext-keyword-badge:active { background: #dbeafe; }
  `;
  document.documentElement.appendChild(style);

  /* =========================================================================
   * 4. DOM 요소 생성 (모달, 패널, 버튼)
   * ========================================================================= */

  // ── 차단 모달
  const blockModalEl = document.createElement("div");
  blockModalEl.id = "ext-block-modal";
  blockModalEl.className = "ext-modal-overlay";
  blockModalEl.innerHTML = `
    <div class="ext-modal-box">
      <p class="ext-modal-title" id="ext-block-msg"></p>
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;">차단 사유 (선택)</p>
      <input class="ext-modal-input" id="ext-block-reason" placeholder="한글, 숫자, 영어, ,. 만 입력 가능" />
      <div class="ext-modal-btns">
        <button class="ext-btn ext-btn-ghost" id="ext-block-cancel">취소</button>
        <button class="ext-btn ext-btn-danger" id="ext-block-confirm">차단</button>
      </div>
    </div>`;

  // ── 메모 모달
  const memoModalEl = document.createElement("div");
  memoModalEl.id = "ext-memo-modal";
  memoModalEl.className = "ext-modal-overlay";
  memoModalEl.innerHTML = `
    <div class="ext-modal-box">
      <p class="ext-modal-title" id="ext-memo-modal-title"></p>
      <input class="ext-modal-input" id="ext-memo-input" placeholder="이 사용자에 대한 메모..." />
      <p style="margin:0 0 6px;font-size:12px;font-weight:bold;color:#64748b;">🎨 배지 색상</p>
      <div id="ext-memo-color-picker"></div>
      <div class="ext-modal-btns">
        <button class="ext-btn ext-btn-warn" id="ext-memo-delete" style="display:none;">삭제</button>
        <button class="ext-btn ext-btn-ghost" id="ext-memo-cancel">취소</button>
        <button class="ext-btn ext-btn-primary" id="ext-memo-confirm">저장</button>
      </div>
    </div>`;

  // ── 개드립콘 메뉴
  const dogconMenuEl = document.createElement("div");
  dogconMenuEl.id = "ext-dogcon-menu";

  // ── ⚙️ 플로팅 버튼
  const gearBtn = document.createElement("button");
  gearBtn.id = "ext-gear-btn";
  gearBtn.title = "개드립 Plus+ 설정";
  gearBtn.textContent = "⚙️";

  // ── 설정 패널
  const settingsPanel = document.createElement("div");
  settingsPanel.id = "ext-settings-panel";
  settingsPanel.innerHTML = `
    <div id="ext-settings-inner">
      <div id="ext-settings-header">
        <h2>⚙️ 개드립 Plus+</h2>
        <button id="ext-settings-close">✕</button>
      </div>
      <div class="ext-tab-bar">
        <button class="ext-tab active" data-tab="tab-block-user">👤 사용자차단</button>
        <button class="ext-tab" data-tab="tab-keyword">🔑 키워드차단</button>
        <button class="ext-tab" data-tab="tab-dogcon">🐶 개드립콘</button>
        <button class="ext-tab" data-tab="tab-memo">📝 메모</button>
        <button class="ext-tab" data-tab="tab-display">🖥 표시</button>
        <button class="ext-tab" data-tab="tab-backup">💾 백업</button>
      </div>

      <!-- 사용자 차단 -->
      <div class="ext-tab-panel active" id="tab-block-user">
        <p class="ext-section-label">차단 목록 <span id="s-block-count" style="font-weight:normal;color:#94a3b8;"></span></p>
        <div class="ext-badge-list" id="s-block-list"></div>
        <p style="margin-top:12px;font-size:12px;color:#94a3b8;">닉네임 팝업 메뉴 → '차단'으로 추가할 수 있습니다.</p>
      </div>

      <!-- 키워드 차단 -->
      <div class="ext-tab-panel" id="tab-keyword">
        <p class="ext-section-label">키워드 추가</p>
        <div class="ext-input-row">
          <input id="s-kw-word" type="text" placeholder="키워드" style="flex:2;" />
          <select id="s-kw-target">
            <option value="all">전체</option>
            <option value="posts">게시글</option>
            <option value="comments">댓글</option>
          </select>
        </div>
        <div class="ext-input-row" style="margin-top:-4px;">
          <select id="s-kw-method">
            <option value="includes">포함</option>
            <option value="starts">시작</option>
          </select>
          <button id="s-kw-add">추가</button>
        </div>
        <p class="ext-section-label">키워드 목록</p>
        <div class="ext-badge-list" id="s-kw-list"></div>
      </div>

      <!-- 개드립콘 차단 -->
      <div class="ext-tab-panel" id="tab-dogcon">
        <p class="ext-section-label">차단된 개드립콘</p>
        <div class="ext-badge-list" id="s-dogcon-list"></div>
        <p class="ext-section-label" style="margin-top:14px;">차단된 개드립콘 그룹</p>
        <div class="ext-badge-list" id="s-dogcon-group-list"></div>
        <p style="margin-top:12px;font-size:12px;color:#94a3b8;">개드립콘 이미지를 클릭하면 차단/해제 메뉴가 나타납니다.</p>
      </div>

      <!-- 메모 -->
      <div class="ext-tab-panel" id="tab-memo">
        <p class="ext-section-label">등록된 유저 메모</p>
        <div class="ext-badge-list" id="s-memo-list"></div>
        <p style="margin-top:12px;font-size:12px;color:#94a3b8;">닉네임 팝업 메뉴 → '메모'로 등록할 수 있습니다.</p>
      </div>

      <!-- 표시 설정 -->
      <div class="ext-tab-panel" id="tab-display">
        <p class="ext-section-label">레이아웃</p>
        <div class="ext-switch-row"><label>공지 숨기기</label><label class="ext-toggle"><input type="checkbox" id="s-hide-notice"><span class="ext-toggle-slider"></span></label></div>
        <div class="ext-switch-row"><label>인기글 숨기기</label><label class="ext-toggle"><input type="checkbox" id="s-hide-popular"><span class="ext-toggle-slider"></span></label></div>
        <div class="ext-switch-row"><label>사이드바 숨기기</label><label class="ext-toggle"><input type="checkbox" id="s-hide-sidebar"><span class="ext-toggle-slider"></span></label></div>
        <div class="ext-switch-row"><label>컴팩트 모드</label><label class="ext-toggle"><input type="checkbox" id="s-compact"><span class="ext-toggle-slider"></span></label></div>
        <div class="ext-switch-row"><label>추천수 비공개</label><label class="ext-toggle"><input type="checkbox" id="s-disable-vote"><span class="ext-toggle-slider"></span></label></div>
        <div class="ext-switch-row"><label>유튜브 알고리즘 방지</label><label class="ext-toggle"><input type="checkbox" id="s-no-yt"><span class="ext-toggle-slider"></span></label></div>
        <p class="ext-section-label" style="margin-top:14px;">차단 방식</p>
        <div class="ext-radio-group">
          <label class="ext-radio-item"><input type="radio" name="s-block-method" value="remove" id="s-bm-remove"> 제거</label>
          <label class="ext-radio-item"><input type="radio" name="s-block-method" value="blind" id="s-bm-blind"> 블라인드</label>
          <label class="ext-radio-item"><input type="radio" name="s-block-method" value="badge" id="s-bm-badge"> 배지만</label>
        </div>
      </div>

      <!-- 백업/복구 -->
      <div class="ext-tab-panel" id="tab-backup">
        <p class="ext-section-label">설정 백업 / 복구</p>
        <div class="ext-backup-row">
          <button class="ext-backup-btn" id="s-backup">⬇️ 백업 다운로드</button>
          <button class="ext-backup-btn" id="s-restore-btn">⬆️ 백업 복구</button>
        </div>
        <input type="file" id="s-restore-file" accept=".json" style="display:none;" />
        <p class="ext-section-label" style="margin-top:18px;">Dogdrip++ 백업 이식</p>
        <div class="ext-backup-row">
          <button class="ext-backup-btn" id="s-restore-pp-btn" style="border-color:#f59e0b;color:#b45309;">📥 Dogdrip++ 백업 가져오기</button>
        </div>
        <input type="file" id="s-restore-pp-file" accept=".json" style="display:none;" />
        <p style="margin-top:16px;font-size:12px;color:#94a3b8; line-height:1.7;">
          백업 파일은 JSON 형식으로 저장되며, 동일 유저스크립트 환경에서 복구 가능합니다.<br>
          Dogdrip++ 이식 시 차단 유저·키워드만 가져오며, 나머지 현재 설정은 유지됩니다.<br>
          ※ 설정 변경 후 페이지 새로고침 시 반영됩니다.
        </p>
      </div>
    </div>`;

  function appendUI() {
    if (!document.documentElement) return false;
    if (document.getElementById("ext-block-modal")) return true;
    document.documentElement.appendChild(blockModalEl);
    document.documentElement.appendChild(memoModalEl);
    document.documentElement.appendChild(dogconMenuEl);
    document.documentElement.appendChild(gearBtn);
    document.documentElement.appendChild(settingsPanel);
    bindBlockModal();
    bindMemoModal();
    bindGearAndPanel();
    return true;
  }

  if (!appendUI()) {
    const obs = new MutationObserver(() => {
      if (appendUI()) obs.disconnect();
    });
    obs.observe(document, { childList: true, subtree: true });
  }

  /* =========================================================================
   * 5. 블라인드 토글
   * ========================================================================= */
  function buildBlindHTML(typeLabel, inner) {
    return `<div class="ext-blind-container">
      <div class="ext-blind-header">
        <span>🛡️ 차단된 ${typeLabel}입니다.</span>
        <a href="#" class="ext-blind-toggle-btn" onclick="return false;">📄 내용 보기</a>
      </div>
      <div class="ext-blind-body">${inner}</div>
    </div>`;
  }

  function bindBlindToggles(root) {
    root
      .querySelectorAll(".ext-blind-container:not([data-bound])")
      .forEach((w) => {
        w.dataset.bound = "true";
        const btn = w.querySelector(".ext-blind-toggle-btn");
        const body = w.querySelector(".ext-blind-body");
        if (!btn || !body) return;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const fixed = w.classList.toggle("ext-blind-fixed");
          body.style.display = fixed ? "flex" : "none";
          btn.innerText = fixed ? "❌ 내용 숨기기" : "📄 내용 보기";
        });
        w.addEventListener("mouseenter", () => {
          if (w.classList.contains("ext-blind-fixed")) return;
          body.style.display = "flex";
          btn.innerText = "👀 슬쩍 보기 중...";
        });
        w.addEventListener("mouseleave", () => {
          if (w.classList.contains("ext-blind-fixed")) return;
          body.style.display = "none";
          btn.innerText = "📄 내용 보기";
        });
      });
  }

  /* =========================================================================
   * 6. 메모 배지 생성
   * ========================================================================= */
  function createMemoBadge(memberId, text, colorStyle) {
    if (!text) return null;
    const el = document.createElement("span");
    el.className = `ext-user-memo-badge ext-memo-${colorStyle || "blue"} ext-badge-id-${memberId}`;
    el.innerText = text;
    el.title = `메모: ${text} (ID: ${memberId})`;
    return el;
  }

  function getMemoData(memos, mid) {
    const raw = memos[mid];
    if (!raw) return { text: "", style: "blue" };
    if (raw.includes(":")) {
      const p = raw.split(":");
      return { text: p[0], style: p[1] || "blue" };
    }
    return { text: raw, style: "blue" };
  }

  /* =========================================================================
   * 7. 키워드 매칭
   * ========================================================================= */
  function matchKeyword(text, kwObj, area) {
    if (!text || !kwObj) return false;
    const word =
      typeof kwObj === "string" ? kwObj : kwObj.word || kwObj.keyword;
    const method = kwObj.method || "includes";
    const target = kwObj.target || "all";
    const norm =
      target === "post" ? "posts" : target === "comment" ? "comments" : target;
    if (norm !== "all" && norm !== area) return false;
    const clean = text
      .replace(/[\s\n\r\t]+/g, " ")
      .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, "")
      .trim();
    if (method === "starts") return clean.startsWith(word.trim());
    return clean.includes(word.trim());
  }

  /* =========================================================================
   * 8. 메인 필터 실행
   * ========================================================================= */
  function executeFilter() {
    const minDelay = new Promise((r) => setTimeout(r, 800));
    const work = Store.get([
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
    ]).then((result) => {
      const filterKW = result.keywords || [];
      const blockedUsers = result.blocked_users || [];
      const blockedDogcons = result.blockedDogcons || [];
      const blockedDogconGroups = result.blockedDogconGroups || [];
      const isBlind = result.blockMethod === "blind";
      const isBadge = result.blockMethod === "badge";
      const memos = result.userMemos || {};

      const blockedIds = blockedUsers
        .map((u) => String(u.member_num).trim())
        .filter(Boolean);
      const blockedDogconIds = blockedDogcons.map((i) => i.id);
      const blockedDogconGroupIds = blockedDogconGroups.map((i) => i.id);

      const html = document.documentElement;
      if (html) {
        if (result.contentWidth?.trim())
          html.style.setProperty(
            "--ext-custom-width",
            result.contentWidth.trim(),
          );
        if (result.hideNotice) html.classList.add("ext-hide-notice");
        if (result.hidePopular) html.classList.add("ext-hide-popular");
        if (result.hideSidebar) html.classList.add("ext-hide-sidebar");
        if (result.compactMode) html.classList.add("ext-hide-compact");
        if (result.disableVote) html.classList.add("ext-hide-vote");
      }

      function handleUserEl(el, nicknameEl, memberId, shouldBlind, isPost) {
        const type = isPost ? "게시글" : "댓글";
        if (shouldBlind) {
          if (
            memberId &&
            nicknameEl &&
            !el.querySelector(`.ext-badge-id-${memberId}`)
          ) {
            const u = blockedUsers.find(
              (x) => String(x.member_num) === memberId,
            );
            if (u?.memo?.trim())
              nicknameEl.after(
                createMemoBadge(memberId, u.memo.trim(), "red-solid"),
              );
          }
          if (isBadge) {
            el.style.backgroundColor = "#fff1f2";
            el.classList.add("ext-blocked-user-layout");
            return;
          }
          if (el.dataset.extFiltered) return;
          el.dataset.extFiltered = "true";
          if (isBlind) {
            const h = el.innerHTML;
            el.innerHTML = buildBlindHTML(type, h);
            bindBlindToggles(el);
          } else el.remove();
        } else if (
          memberId &&
          memos[memberId] &&
          nicknameEl &&
          !el.querySelector(`.ext-badge-id-${memberId}`)
        ) {
          const md = getMemoData(memos, memberId);
          const b = createMemoBadge(memberId, md.text, md.style);
          if (b) nicknameEl.after(b);
        }
      }

      // ① 웹진형
      document.querySelectorAll("li.webzine").forEach((art) => {
        const titleEl = art.querySelector(".title-link");
        const nickEl = art.querySelector('a[class*="member_"]');
        if (
          titleEl &&
          filterKW.some((kw) =>
            matchKeyword(titleEl.textContent.trim(), kw, "posts"),
          )
        ) {
          art.remove();
          return;
        }
        let mid = "";
        if (nickEl) {
          const m = nickEl.className.match(/member_(\d+)/);
          if (m) mid = m[1];
        }
        handleUserEl(art, nickEl, mid, mid && blockedIds.includes(mid), true);
      });

      // ② 일반 목록
      document
        .querySelectorAll("li span.title a, li div.eq span.text-link")
        .forEach((tEl) => {
          const li = tEl.closest("li");
          if (!li) return;
          const nickEl = li.querySelector('a[class*="member_"]');
          let mid = "";
          if (nickEl) {
            const m = nickEl.className.match(/member_(\d+)/);
            if (m) mid = m[1];
          }
          if (
            filterKW.some((kw) =>
              matchKeyword(tEl.textContent.trim(), kw, "posts"),
            )
          ) {
            li.remove();
            return;
          }
          handleUserEl(li, nickEl, mid, mid && blockedIds.includes(mid), true);
        });

      // ③ 테이블형
      document.querySelectorAll("tr.ed").forEach((row) => {
        const titleEl = row.querySelector(".title");
        const authEl = row.querySelector(".author a[class*='member_']");
        let titleText = "";
        if (titleEl) {
          const link =
            titleEl.querySelector(".title-link") ||
            titleEl.querySelector('a[href*="dogdrip.net/"], a[href^="/"]');
          if (link) {
            const c = link.cloneNode(true);
            c.querySelector(".text-primary")?.remove();
            titleText = c.textContent.replace(/\[.*?\]/g, "").trim();
          } else titleText = titleEl.textContent.trim();
        }
        if (
          titleText &&
          filterKW.some((kw) => matchKeyword(titleText, kw, "posts"))
        ) {
          row.remove();
          return;
        }
        let mid = "";
        if (authEl) {
          const m = authEl.className.match(/member_(\d+)/);
          if (m) mid = m[1];
        }
        if (mid && blockedIds.includes(mid)) {
          if (authEl && !row.querySelector(`.ext-badge-id-${mid}`)) {
            const u = blockedUsers.find((x) => String(x.member_num) === mid);
            if (u?.memo?.trim())
              authEl.after(createMemoBadge(mid, u.memo.trim(), "red-solid"));
          }
          if (isBadge) {
            row.style.backgroundColor = "#fff1f2";
            row.classList.add("ext-blocked-user-layout");
            return;
          }
          if (row.dataset.extFiltered) return;
          row.dataset.extFiltered = "true";
          if (isBlind) {
            const h = row.innerHTML;
            row.innerHTML = `<td colspan="6" style="padding:0;">${buildBlindHTML("게시글", `<table><tr>${h}</tr></table>`)}</td>`;
            bindBlindToggles(row);
          } else row.remove();
        } else if (
          mid &&
          memos[mid] &&
          authEl &&
          !row.querySelector(`.ext-badge-id-${mid}`)
        ) {
          const md = getMemoData(memos, mid);
          const b = createMemoBadge(mid, md.text, md.style);
          if (b) authEl.after(b);
        }
      });

      // ④ 댓글
      document.querySelectorAll(".ed.comment-content").forEach((comment) => {
        const nickEl = comment.querySelector('a[class*="member_"]');
        const bodyEl = comment.querySelector(".xe_content, .comment-text");
        let kwRemove = false;
        if (bodyEl && filterKW.length) {
          const txt = (bodyEl.innerText || bodyEl.textContent || "")
            .replace(/[\s\n\r\t]+/g, " ")
            .trim();
          if (filterKW.some((kw) => matchKeyword(txt, kw, "comments")))
            kwRemove = true;
        }
        if (kwRemove) {
          const target = comment.closest("li, div.comment-item") || comment;
          if (target.dataset.extFiltered) return;
          target.dataset.extFiltered = "true";
          if (isBlind) {
            const h = target.innerHTML;
            target.innerHTML = buildBlindHTML("키워드가 포함된 댓글", h);
            bindBlindToggles(target);
          } else target.remove();
          return;
        }
        let mid = "";
        if (nickEl) {
          const m = nickEl.className.match(/member_(\d+)/);
          if (m) mid = m[1];
        }
        const target = comment.closest("li, div.comment-item") || comment;
        handleUserEl(
          target,
          nickEl,
          mid,
          mid && blockedIds.includes(mid),
          false,
        );

        // 댓글 차단 버튼 삽입
        if (mid && nickEl) {
          const nickname = nickEl.textContent.trim();
          const dropdown = comment.querySelector("ul.dropdown-menu");
          if (dropdown) {
            const empties = Array.from(dropdown.querySelectorAll("li")).filter(
              (li) => li.innerHTML.trim() === "",
            );
            if (
              empties.length > 0 &&
              !empties[0].querySelector(".ext-block-menu-item")
            ) {
              empties[0].innerHTML = `<a class="ext-block-menu-item"><span class="ed icon"><i class="fas fa-user-slash"></i></span>차단</a>`;
              empties[0].querySelector("a").addEventListener("click", (e) => {
                e.preventDefault();
                openBlockModal(nickname, mid);
              });
            }
          }
        }
      });

      // ⑤ 본문 툴바
      const toolbar = document.querySelector(".title-toolbar");
      if (toolbar) {
        const authEl = toolbar.querySelector('a[class*="member_"]');
        const dropdown = toolbar.querySelector("ul.dropdown-menu");
        if (authEl && dropdown) {
          const mid = authEl.className.match(/member_(\d+)/)?.[1];
          if (mid) {
            if (
              memos[mid] &&
              !authEl.nextElementSibling?.classList.contains(
                "ext-user-memo-badge",
              )
            ) {
              const md = getMemoData(memos, mid);
              const b = createMemoBadge(mid, md.text, md.style);
              if (b) authEl.after(b);
            }
            toolbar.querySelector(".ext-toolbar-block")?.remove();
            const li = document.createElement("li");
            li.className = "ext-toolbar-block";
            if (blockedIds.includes(mid)) {
              li.innerHTML = `<a class="ext-block-menu-item" href="#" onclick="return false;" style="color:#${grantColor};font-weight:bold;"><span class="ed icon"><i class="fas fa-user-check"></i></span> 차단 해제</a>`;
              li.querySelector("a").addEventListener("click", (e) => {
                e.preventDefault();
                Store.get(["blocked_users"]).then((r) => {
                  let list = (r.blocked_users || []).filter(
                    (x) => String(x.member_num) !== mid,
                  );
                  Store.set({ blocked_users: list }).then(() =>
                    location.reload(),
                  );
                });
              });
            } else {
              li.innerHTML = `<a class="ext-block-menu-item" href="#" onclick="return false;" style="color:#${blockColor};font-weight:bold;"><span class="ed icon"><i class="fas fa-user-slash"></i></span> 차단</a>`;
              li.querySelector("a").addEventListener("click", (e) => {
                e.preventDefault();
                openBlockModal(authEl.textContent.trim(), mid);
              });
            }
            dropdown.insertBefore(li, dropdown.firstChild);
          }
        }
      }

      // ⑥ 개드립콘
      document
        .querySelectorAll("img.dogcon-clickable, img[data-dogcon-srl]")
        .forEach((img) => {
          if (img.dataset.extProcessed) return;
          img.dataset.extProcessed = "true";
          const srl = img.getAttribute("data-dogcon-srl");
          const fileSrl = img.getAttribute("data-dogcon-file-srl");
          const title =
            img.getAttribute("data-title") ||
            img.getAttribute("title") ||
            "개드립콘";
          const alt = img.getAttribute("alt") || "콘";
          const groupBlocked = blockedDogconGroupIds.includes(srl);
          const singleBlocked = blockedDogconIds.includes(fileSrl);
          const infoUrl = `https://www.dogdrip.net/?mid=dogcon&dogcon_srl=${srl}`;
          if (groupBlocked || singleBlocked) {
            const div = document.createElement("div");
            div.className = "ext-dogcon-blocked";
            div.innerHTML = `🚫 <span>${title}(${alt}) 차단됨</span><a href="${infoUrl}" target="_blank" style="margin-left:6px;color:#0284c7;text-decoration:underline;" onclick="event.stopPropagation();">[ℹ️]</a>`;
            div.dataset.srl = srl;
            div.dataset.fileSrl = fileSrl;
            div.dataset.title = title;
            div.dataset.alt = alt;
            div.dataset.isSingleBlocked = singleBlocked;
            div.dataset.isGroupBlocked = groupBlocked;
            div.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              openDogconMenu(e, div, true);
            });
            img.parentNode.insertBefore(div, img);
            img.remove();
          } else {
            img.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              const mock = document.createElement("div");
              mock.dataset.srl = srl;
              mock.dataset.fileSrl = fileSrl;
              mock.dataset.title = title;
              mock.dataset.alt = alt;
              mock.dataset.isSingleBlocked = "false";
              mock.dataset.isGroupBlocked = "false";
              openDogconMenu(e, mock, false);
            });
          }
        });

      // ⑦ 추천수 비공개
      if (result.disableVote) {
        document
          .querySelectorAll("td.ed.voteNum.text-primary")
          .forEach((td) => {
            if (!td.dataset.extVp) {
              td.dataset.extVp = "true";
              td.innerHTML = '<i class="fas fa-baby"></i>';
            }
          });
        document.querySelectorAll("i.far.fa-thumbs-up").forEach((i) => {
          if (!i.dataset.extVp) {
            i.dataset.extVp = "true";
            i.className = "fas fa-baby";
            i.closest("span.text-primary")?.nextElementSibling?.remove();
          }
        });
        document.querySelectorAll("a.votebtn").forEach((btn) => {
          if (btn.dataset.extVp) return;
          btn.dataset.extVp = "true";
          if (btn.getAttribute("title") === "추천") {
            const ic = btn.querySelector("i");
            if (ic) ic.className = "fas fa-baby";
            btn.querySelector("span.count")?.remove();
          }
          if (btn.getAttribute("title") === "비추천") btn.remove();
        });
      }

      // ⑧ 유튜브 노쿠키
      if (result.preventYoutubeAlgorithm) {
        document
          .querySelectorAll('iframe[src*="youtube.com/embed/"]')
          .forEach((f) => {
            if (!f.dataset.extYt) {
              f.dataset.extYt = "true";
              const s = f.getAttribute("src");
              if (s)
                f.setAttribute(
                  "src",
                  s.replace(
                    "youtube.com/embed/",
                    "youtube-nocookie.com/embed/",
                  ),
                );
            }
          });
      }

      if (!result.contentWidth?.trim()) {
        document.querySelectorAll(".container").forEach((el) => {
          el.style.maxWidth = "960px";
        });
      }
    });

    Promise.all([minDelay, work]).then(removeLoadingOverlay);
  }

  /* =========================================================================
   * 9. 로딩 오버레이
   * ========================================================================= */
  function showLoadingOverlay() {
    if (document.getElementById("ext-loading-overlay")) return;
    const ov = document.createElement("div");
    ov.id = "ext-loading-overlay";
    ov.innerHTML = `<div class="ext-spinner"></div><div class="ext-loading-text">페이지 최적화 중...</div>`;
    document.documentElement.appendChild(ov);
  }
  function removeLoadingOverlay() {
    const ov = document.getElementById("ext-loading-overlay");
    if (!ov) return;
    ov.style.opacity = "0";
    setTimeout(() => ov.remove(), 200);
  }
  showLoadingOverlay();

  /* =========================================================================
   * 10. 차단 모달
   * ========================================================================= */
  function openBlockModal(nickname, memberId) {
    targetNicknameToBlock = nickname;
    targetMemberIdToBlock = memberId;
    document.getElementById("ext-block-reason").value = "";
    document.getElementById("ext-block-msg").innerHTML =
      `<strong>${nickname}${memberId ? `(${memberId})` : ""}</strong>님을 차단하시겠습니까?<br/><small style="color:#64748b;">차단 시 해당 사용자의 글·댓글이 숨겨집니다.</small>`;
    blockModalEl.classList.add("show");
    setTimeout(() => document.getElementById("ext-block-reason").focus(), 50);
  }
  function closeBlockModal() {
    blockModalEl.classList.remove("show");
    targetNicknameToBlock = "";
    targetMemberIdToBlock = "";
  }
  function bindBlockModal() {
    const reasonInput = document.getElementById("ext-block-reason");
    reasonInput?.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(
        /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9.,\s]/g,
        "",
      );
    });
    document
      .getElementById("ext-block-cancel")
      ?.addEventListener("click", closeBlockModal);
    blockModalEl.addEventListener("click", (e) => {
      if (e.target === blockModalEl) closeBlockModal();
    });
    document
      .getElementById("ext-block-confirm")
      ?.addEventListener("click", () => {
        if (!targetNicknameToBlock || !targetMemberIdToBlock) {
          closeBlockModal();
          return;
        }
        const reason = document.getElementById("ext-block-reason").value.trim();
        const newUser = {
          date: new Date()
            .toLocaleDateString("ko-KR")
            .replace(/\. /g, "/")
            .replace(".", ""),
          member_num: String(targetMemberIdToBlock).trim(),
          memo: reason,
        };
        Store.get(["blocked_users"]).then((r) => {
          const list = r.blocked_users || [];
          if (
            !list.some(
              (x) => String(x.member_num) === String(targetMemberIdToBlock),
            )
          ) {
            list.push(newUser);
            Store.set({ blocked_users: list }).then(() => {
              closeBlockModal();
              location.reload();
            });
          } else closeBlockModal();
        });
      });
  }

  /* =========================================================================
   * 11. 메모 모달
   * ========================================================================= */
  const colorPalette = [
    { key: "blue", hex: "#3b82f6" },
    { key: "green", hex: "#10b981" },
    { key: "red", hex: "#ef4444" },
    { key: "yellow", hex: "#f59e0b" },
    { key: "purple", hex: "#8b5cf6" },
    { key: "pink", hex: "#ec4899" },
    { key: "cyan", hex: "#06b6d4" },
    { key: "orange", hex: "#f97316" },
    { key: "teal", hex: "#14b8a6" },
    { key: "gray", hex: "#64748b" },
  ];

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
        picker
          .querySelectorAll(".ext-color-chip")
          .forEach((x) => x.classList.remove("selected"));
        chip.classList.add("selected");
      });
      picker.appendChild(chip);
    });
  }

  function openMemoModal(nickname, memberId, rawData) {
    targetMemoMemberId = memberId;
    let text = "";
    selectedMemoColorStyle = "blue";
    if (rawData) {
      if (rawData.includes(":")) {
        const p = rawData.split(":");
        text = p[0];
        selectedMemoColorStyle = p[1] || "blue";
      } else text = rawData;
    }
    document.getElementById("ext-memo-modal-title").innerHTML =
      `📝 <strong>${nickname}</strong> 메모`;
    const inp = document.getElementById("ext-memo-input");
    inp.value = text;
    document.getElementById("ext-memo-delete").style.display = text
      ? "block"
      : "none";
    renderColorPicker();
    memoModalEl.classList.add("show");
    setTimeout(() => inp.focus(), 50);
  }
  function closeMemoModal() {
    memoModalEl.classList.remove("show");
    targetMemoMemberId = "";
  }

  function bindMemoModal() {
    document
      .getElementById("ext-memo-cancel")
      ?.addEventListener("click", closeMemoModal);
    memoModalEl.addEventListener("click", (e) => {
      if (e.target === memoModalEl) closeMemoModal();
    });
    const inp = document.getElementById("ext-memo-input");
    inp?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("ext-memo-confirm").click();
      }
    });
    document
      .getElementById("ext-memo-confirm")
      ?.addEventListener("click", () => {
        if (!targetMemoMemberId) {
          closeMemoModal();
          return;
        }
        const text = document.getElementById("ext-memo-input").value.trim();
        Store.get(["userMemos"]).then((r) => {
          const memos = r.userMemos || {};
          if (text)
            memos[targetMemoMemberId] = `${text}:${selectedMemoColorStyle}`;
          else delete memos[targetMemoMemberId];
          Store.set({ userMemos: memos }).then(() => {
            closeMemoModal();
            location.reload();
          });
        });
      });
    document
      .getElementById("ext-memo-delete")
      ?.addEventListener("click", () => {
        if (!targetMemoMemberId) {
          closeMemoModal();
          return;
        }
        Store.get(["userMemos"]).then((r) => {
          const memos = r.userMemos || {};
          delete memos[targetMemoMemberId];
          Store.set({ userMemos: memos }).then(() => {
            closeMemoModal();
            location.reload();
          });
        });
      });
  }

  /* =========================================================================
   * 12. 팝업 메뉴 (닉네임 클릭)
   * ========================================================================= */
  document.addEventListener("click", (e) => {
    const menu = document.getElementById("ext-dogcon-menu");
    if (menu) menu.style.display = "none";
    const uLink = e.target.closest('a[class*="member_"]');
    if (uLink) {
      const m = uLink.className.match(/member_(\d+)/);
      if (m) {
        lastClickedUserData.memberId = m[1];
        lastClickedUserData.nickname = uLink.textContent.trim();
        // 팝업이 이미 열려있을 수 있으므로 즉시 시도
        const area = document.getElementById("popup_menu_area");
        if (area && window.getComputedStyle(area).display !== "none") {
          handlePopupMenu(area);
        }
      }
    }
  });

  function insertMemberMenu(memberId, nickname, isBlocked, memoData) {
    const area = document.getElementById("popup_menu_area");
    if (!area) return;
    const ul = area.querySelector("ul");
    if (!ul) return;
    ul.querySelectorAll(".ext-ins-block, .ext-ins-memo").forEach((x) =>
      x.remove(),
    );

    let pureMemo = memoData.includes(":") ? memoData.split(":")[0] : memoData;
    const memoLi = document.createElement("li");
    memoLi.className = "ext-ins-memo";
    const suffix = pureMemo
      ? ` <span style="font-size:11px;color:#64748b;">(${pureMemo.length > 8 ? pureMemo.slice(0, 8) + "..." : pureMemo})</span>`
      : "";
    memoLi.innerHTML = `<a href="#" style="color:#0284c7;font-weight:bold;">메모${suffix}</a>`;
    memoLi.querySelector("a").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      area.style.display = "none";
      openMemoModal(nickname, memberId, memoData);
    });

    const blockLi = document.createElement("li");
    blockLi.className = "ext-ins-block";
    if (isBlocked) {
      blockLi.innerHTML = `<a href="#" style="color:#${grantColor};font-weight:bold;">차단 해제</a>`;
      blockLi.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        area.style.display = "none";
        Store.get(["blocked_users"]).then((r) => {
          const list = (r.blocked_users || []).filter(
            (x) => String(x.member_num) !== memberId,
          );
          Store.set({ blocked_users: list }).then(() => location.reload());
        });
      });
    } else {
      blockLi.innerHTML = `<a href="#" style="color:#${blockColor};font-weight:bold;">차단</a>`;
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
      // member_ 링크를 직접 탐색해서 fallback
      const lastLink =
        el.querySelector('a[class*="member_"]') ||
        document.querySelector('a[class*="member_"]:focus');
      if (lastLink) {
        const m = lastLink.className.match(/member_(\d+)/);
        if (m) {
          lastClickedUserData.memberId = m[1];
          lastClickedUserData.nickname = lastLink.textContent.trim();
        }
      }
      if (!lastClickedUserData.memberId) return;
    }
    Store.get(["blocked_users", "userMemos"]).then((r) => {
      const list = r.blocked_users || [];
      const memos = r.userMemos || {};
      const isBlocked = list.some(
        (x) => String(x.member_num) === lastClickedUserData.memberId,
      );
      insertMemberMenu(
        lastClickedUserData.memberId,
        lastClickedUserData.nickname,
        isBlocked,
        memos[lastClickedUserData.memberId] || "",
      );
    });
  }

  /* =========================================================================
   * 13. 개드립콘 메뉴
   * ========================================================================= */
  function openDogconMenu(e, dataEl, isBlocked) {
    currentActiveDogconData = {
      srl: dataEl.dataset.srl,
      fileSrl: dataEl.dataset.fileSrl,
      title: dataEl.dataset.title,
      alt: dataEl.dataset.alt,
      isSingleBlocked: dataEl.dataset.isSingleBlocked === "true",
      isGroupBlocked: dataEl.dataset.isGroupBlocked === "true",
    };
    const d = currentActiveDogconData;
    const infoUrl = `https://www.dogdrip.net/?mid=dogcon&dogcon_srl=${d.srl}`;
    const singleText = d.isSingleBlocked
      ? "🟢 이 개드립콘 차단 해제"
      : "❌ 이 개드립콘만 차단";
    const groupText = d.isGroupBlocked
      ? "🟢 이 그룹 전체 차단 해제"
      : "❌ 이 개드립콘 그룹 전체 차단";
    const singleCls = d.isSingleBlocked ? "unblock-action" : "block-action";
    const groupCls = d.isGroupBlocked ? "unblock-action" : "block-action";
    const singlePart = d.isGroupBlocked
      ? ""
      : `<div class="dogcon-menu-item ${singleCls}" id="ext-dc-single">${singleText}</div>`;
    dogconMenuEl.innerHTML = `${singlePart}<div class="dogcon-menu-item ${groupCls}" id="ext-dc-group">${groupText}</div>
      <div style="border-top:1px solid #e2e8f0;margin-top:4px;padding-top:4px;">
        <a href="${infoUrl}" target="_blank" class="dogcon-menu-item" style="text-decoration:none;color:#475569;">🔗 ${d.title} 정보</a>
      </div>`;
    dogconMenuEl.style.left = `${e.pageX}px`;
    dogconMenuEl.style.top = `${e.pageY}px`;
    dogconMenuEl.style.display = "block";
    dogconMenuEl
      .querySelector("#ext-dc-single")
      ?.addEventListener("click", handleDogconSingle);
    dogconMenuEl
      .querySelector("#ext-dc-group")
      ?.addEventListener("click", handleDogconGroup);
  }

  function handleDogconSingle() {
    if (!currentActiveDogconData) return;
    const id = currentActiveDogconData.fileSrl;
    const name = `${currentActiveDogconData.title}(${currentActiveDogconData.alt})`;
    Store.get(["blockedDogcons"]).then((r) => {
      let list = r.blockedDogcons || [];
      if (currentActiveDogconData.isSingleBlocked)
        list = list.filter((x) => x.id !== id);
      else if (!list.some((x) => x.id === id)) list.push({ id, name });
      Store.set({ blockedDogcons: list }).then(() => location.reload());
    });
  }
  function handleDogconGroup() {
    if (!currentActiveDogconData) return;
    const id = currentActiveDogconData.srl;
    const name = currentActiveDogconData.title;
    Store.get(["blockedDogconGroups"]).then((r) => {
      let list = r.blockedDogconGroups || [];
      if (currentActiveDogconData.isGroupBlocked)
        list = list.filter((x) => x.id !== id);
      else if (!list.some((x) => x.id === id)) list.push({ id, name });
      Store.set({ blockedDogconGroups: list }).then(() => location.reload());
    });
  }

  /* =========================================================================
   * 14. ⚙️ 플로팅 버튼 + 설정 패널
   * ========================================================================= */
  function bindGearAndPanel() {
    gearBtn.addEventListener("click", () => openSettingsPanel());
    document
      .getElementById("ext-settings-close")
      ?.addEventListener("click", closeSettingsPanel);
    settingsPanel.addEventListener("click", (e) => {
      if (e.target === settingsPanel) closeSettingsPanel();
    });

    // 탭 전환
    settingsPanel.querySelectorAll(".ext-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        settingsPanel
          .querySelectorAll(".ext-tab")
          .forEach((t) => t.classList.remove("active"));
        settingsPanel
          .querySelectorAll(".ext-tab-panel")
          .forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(tab.dataset.tab)?.classList.add("active");
        loadPanelData(tab.dataset.tab);
      });
    });

    // 키워드 추가
    document.getElementById("s-kw-add")?.addEventListener("click", () => {
      const word = document.getElementById("s-kw-word").value.trim();
      if (!word) {
        alert("키워드를 입력하세요.");
        return;
      }
      const target = document.getElementById("s-kw-target").value;
      const method = document.getElementById("s-kw-method").value;
      Store.get(["keywords"]).then((r) => {
        const list = r.keywords || [];
        if (list.some((x) => (x.word || x.keyword) === word)) {
          alert("이미 등록된 키워드입니다.");
          return;
        }
        list.push({
          date: new Date()
            .toLocaleDateString("ko-KR")
            .replace(/\. /g, "/")
            .replace(".", ""),
          word,
          method,
          target,
        });
        Store.set({ keywords: list }).then(() => {
          document.getElementById("s-kw-word").value = "";
          renderKeywordList();
        });
      });
    });

    // 백업
    document.getElementById("s-backup")?.addEventListener("click", doBackup);
    document
      .getElementById("s-restore-btn")
      ?.addEventListener("click", () =>
        document.getElementById("s-restore-file").click(),
      );
    document
      .getElementById("s-restore-file")
      ?.addEventListener("change", doRestore);
    document
      .getElementById("s-restore-pp-btn")
      ?.addEventListener("click", () =>
        document.getElementById("s-restore-pp-file").click(),
      );
    document
      .getElementById("s-restore-pp-file")
      ?.addEventListener("change", doRestorePP);
  }

  let _savedScrollY = 0;
  function openSettingsPanel() {
    _savedScrollY = window.scrollY;
    document.body.style.cssText +=
      ";overflow:hidden;position:fixed;top:-" +
      _savedScrollY +
      "px;left:0;right:0;";
    settingsPanel.classList.add("show");
    loadPanelData("tab-block-user");
    loadDisplaySettings();
    bindDisplayToggles();
  }

  let _displayTogglesBound = false;
  function bindDisplayToggles() {
    if (_displayTogglesBound) return;
    _displayTogglesBound = true;
    const toggleMap = [
      ["s-hide-notice", "hideNotice"],
      ["s-hide-popular", "hidePopular"],
      ["s-hide-sidebar", "hideSidebar"],
      ["s-compact", "compactMode"],
      ["s-disable-vote", "disableVote"],
      ["s-no-yt", "preventYoutubeAlgorithm"],
    ];
    toggleMap.forEach(([elId, key]) => {
      document.getElementById(elId)?.addEventListener("change", (e) => {
        Store.set({ [key]: e.target.checked }).then(() => {
          console.log("[개드립Plus] 저장:", key, e.target.checked);
        });
      });
    });
    ["s-bm-remove", "s-bm-blind", "s-bm-badge"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", (e) => {
        if (e.target.checked) Store.set({ blockMethod: e.target.value });
      });
    });
  }
  function closeSettingsPanel() {
    settingsPanel.classList.remove("show");
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    window.scrollTo(0, _savedScrollY);
  }

  function loadPanelData(tabId) {
    switch (tabId) {
      case "tab-block-user":
        renderBlockList();
        break;
      case "tab-keyword":
        renderKeywordList();
        break;
      case "tab-dogcon":
        renderDogconLists();
        break;
      case "tab-memo":
        renderMemoList();
        break;
      case "tab-display":
        loadDisplaySettings();
        break;
    }
  }

  function renderBlockList() {
    Store.get(["blocked_users"]).then((r) => {
      const list = r.blocked_users || [];
      const container = document.getElementById("s-block-list");
      if (!container) return;
      container.innerHTML = "";
      const countEl = document.getElementById("s-block-count");
      if (countEl)
        countEl.textContent = list.length ? `(${list.length}명)` : "";
      if (!list.length) {
        container.innerHTML =
          '<span class="ext-empty-msg">차단된 사용자가 없습니다.</span>';
        return;
      }
      list.forEach((u) => {
        const item = document.createElement("span");
        item.className = "ext-badge-item";
        item.innerHTML = `<span>👤 ${u.member_num}${u.memo ? ` <em style="color:#64748b;font-style:normal;font-size:11px;">(${u.memo})</em>` : ""}</span>`;
        const del = document.createElement("button");
        del.className = "ext-badge-del";
        del.textContent = "×";
        del.addEventListener("click", () => {
          if (!confirm(`${u.member_num} 차단을 해제할까요?`)) return;
          Store.get(["blocked_users"]).then((r2) => {
            const l2 = (r2.blocked_users || []).filter(
              (x) => x.member_num !== u.member_num,
            );
            Store.set({ blocked_users: l2 }).then(renderBlockList);
          });
        });
        item.appendChild(del);
        container.appendChild(item);
      });
    });
  }

  function renderKeywordList() {
    Store.get(["keywords"]).then((r) => {
      const list = r.keywords || [];
      const container = document.getElementById("s-kw-list");
      if (!container) return;
      container.innerHTML = "";
      if (!list.length) {
        container.innerHTML =
          '<span class="ext-empty-msg">차단 키워드가 없습니다.</span>';
        return;
      }
      const targetLabel = {
        all: "전체",
        posts: "게시글",
        post: "게시글",
        comments: "댓글",
        comment: "댓글",
      };
      const methodLabel = { includes: "포함", starts: "시작" };
      list.forEach((kw) => {
        const word = kw.word || kw.keyword;
        const item = document.createElement("span");
        item.className = "ext-badge-item ext-keyword-badge";
        item.title = "클릭하면 조건 수정";
        item.innerHTML = `<span>⌨️ ${word}<br/><em style="font-size:10px;color:#2563eb;font-style:normal;">[${targetLabel[kw.target] || "전체"}] [${methodLabel[kw.method] || "포함"}]</em></span>`;
        const del = document.createElement("button");
        del.className = "ext-badge-del";
        del.textContent = "×";
        del.addEventListener("click", (e) => {
          e.stopPropagation();
          Store.get(["keywords"]).then((r2) => {
            const l2 = (r2.keywords || []).filter(
              (x) => (x.word || x.keyword) !== word,
            );
            Store.set({ keywords: l2 }).then(renderKeywordList);
          });
        });
        item.appendChild(del);
        container.appendChild(item);
      });
    });
  }

  function renderDogconLists() {
    Store.get(["blockedDogcons", "blockedDogconGroups"]).then((r) => {
      renderSimpleList(
        r.blockedDogcons || [],
        "s-dogcon-list",
        "blockedDogcons",
        (i) => i.name,
        "차단된 개드립콘이 없습니다.",
      );
      renderSimpleList(
        r.blockedDogconGroups || [],
        "s-dogcon-group-list",
        "blockedDogconGroups",
        (i) => i.name,
        "차단된 그룹이 없습니다.",
      );
    });
  }

  function renderSimpleList(list, containerId, key, labelFn, emptyMsg) {
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
      del.textContent = "×";
      del.addEventListener("click", () => {
        Store.get([key]).then((r) => {
          const l = (r[key] || []).filter((x) => x.id !== item.id);
          Store.set({ [key]: l }).then(renderDogconLists);
        });
      });
      el.appendChild(del);
      c.appendChild(el);
    });
  }

  function renderMemoList() {
    Store.get(["userMemos"]).then((r) => {
      const memos = r.userMemos || {};
      const c = document.getElementById("s-memo-list");
      if (!c) return;
      c.innerHTML = "";
      const ids = Object.keys(memos);
      if (!ids.length) {
        c.innerHTML =
          '<span class="ext-empty-msg">등록된 메모가 없습니다.</span>';
        return;
      }
      ids.forEach((mid) => {
        const raw = memos[mid];
        let text = raw,
          color = "blue";
        if (raw.includes(":")) {
          const p = raw.split(":");
          text = p[0];
          color = p[1] || "blue";
        }
        const badge = document.createElement("span");
        badge.className = `ext-badge-item ext-user-memo-badge ext-memo-${color}`;
        badge.style.cssText = "cursor:pointer;";
        badge.title = `ID: ${mid} / 클릭하면 삭제`;
        badge.innerHTML = `${text} <small>(${mid})</small>`;
        badge.addEventListener("click", () => {
          if (!confirm(`"${text}" 메모를 삭제할까요?`)) return;
          Store.get(["userMemos"]).then((r2) => {
            const m2 = r2.userMemos || {};
            delete m2[mid];
            Store.set({ userMemos: m2 }).then(renderMemoList);
          });
        });
        c.appendChild(badge);
      });
    });
  }

  function loadDisplaySettings() {
    Store.get([
      "hideNotice",
      "hidePopular",
      "hideSidebar",
      "compactMode",
      "disableVote",
      "preventYoutubeAlgorithm",
      "blockMethod",
    ]).then((r) => {
      const map = [
        ["s-hide-notice", "hideNotice"],
        ["s-hide-popular", "hidePopular"],
        ["s-hide-sidebar", "hideSidebar"],
        ["s-compact", "compactMode"],
        ["s-disable-vote", "disableVote"],
        ["s-no-yt", "preventYoutubeAlgorithm"],
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

  /* =========================================================================
   * 15. 백업 / 복구
   * ========================================================================= */
  function doBackup() {
    Store.get([
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
    ]).then((data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dogdrip_plus_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function doRestore(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const keywords = (data.keywords || []).map((k) => {
          if (typeof k === "string")
            return { date: "", method: "includes", target: "all", word: k };
          return {
            date: k.date || "",
            method: k.method || "includes",
            target: k.target || "all",
            word: k.word || k.keyword,
          };
        });
        const blocked_users = (data.blocked_users || data.nicknames || []).map(
          (u) => {
            if (typeof u === "string" && u.includes(":")) {
              const p = u.split(":");
              return { date: "", member_num: p[0].trim(), memo: p[2] || "" };
            }
            return {
              date: u.date || "",
              member_num: String(u.member_num || "").trim(),
              memo: u.memo || "",
            };
          },
        );
        Store.set({
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
          userMemos: data.userMemos || {},
        }).then(() => {
          alert("🎉 복구 완료! 페이지를 새로고침합니다.");
          location.reload();
        });
      } catch {
        alert("❌ 파일 형식 오류: 올바른 백업 JSON 파일을 선택하세요.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function doRestorePP(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // dogdrip++ 포맷: blocked_members 배열, keywords[].keyword 필드
        const rawMembers = Array.isArray(data.blocked_members)
          ? data.blocked_members
          : [];
        const rawKeywords = Array.isArray(data.keywords) ? data.keywords : [];

        const blocked_users = rawMembers.map((u) => ({
          date: u.date || "",
          member_num: String(u.member_num || "").trim(),
          memo: u.memo || "",
        }));
        const keywords = rawKeywords.map((k) => ({
          date: k.date || "",
          method: k.method || "includes",
          target: k.target || "all",
          word: k.keyword || k.word || "", // dogdrip++는 keyword 필드
        }));

        // 나머지 설정(개드립콘 차단, 레이아웃 등)은 현재 값 유지
        Store.get([
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
        ]).then((cur) => {
          Store.set({
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
            userMemos: cur.userMemos || {},
          }).then(() => {
            alert(
              `🎉 Dogdrip++ 이식 완료!\n차단 유저 ${blocked_users.length}명, 키워드 ${keywords.length}개를 가져왔습니다.\n페이지를 새로고침합니다.`,
            );
            location.reload();
          });
        });
      } catch {
        alert("❌ 파일 형식 오류: Dogdrip++ 백업 JSON 파일을 선택하세요.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  /* =========================================================================
   * 16. MutationObserver (동적 콘텐츠)
   * ========================================================================= */
  const popupObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList") {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const hasDogcon = node.querySelector?.(
            "img.dogcon-clickable, img[data-dogcon-srl]",
          );
          const hasMember = node.querySelector?.('a[class*="member_"]');
          if (
            hasDogcon ||
            hasMember ||
            ["IMG", "DIV", "LI", "TR", "A"].includes(node.tagName)
          ) {
            setTimeout(() => {
              bindBlindToggles(document.body);
              const unprocessed = document.querySelectorAll(
                "img.dogcon-clickable:not([data-ext-processed]), img[data-dogcon-srl]:not([data-ext-processed])",
              );
              if (unprocessed.length || hasMember) executeFilter();
            }, 50);
          }
          if (node.id === "popup_menu_area") handlePopupMenu(node);
          else {
            const nested = node.querySelector?.("#popup_menu_area");
            if (nested) handlePopupMenu(nested);
          }
        });
      } else if (m.type === "attributes" && m.attributeName === "style") {
        if (m.target.id === "popup_menu_area") handlePopupMenu(m.target);
      }
    }
  });

  function startObserver() {
    popupObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    // 이미 DOM에 있는 popup_menu_area에 MutationObserver 직접 연결
    const existingPopup = document.getElementById("popup_menu_area");
    if (existingPopup) {
      new MutationObserver(() => handlePopupMenu(existingPopup)).observe(
        existingPopup,
        { attributes: true, attributeFilter: ["style", "class"] },
      );
    }
  }

  if (document.body) startObserver();
  else document.addEventListener("DOMContentLoaded", startObserver);

  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  )
    executeFilter();
  else document.addEventListener("DOMContentLoaded", executeFilter);

  window.addEventListener("load", removeLoadingOverlay);
})();
