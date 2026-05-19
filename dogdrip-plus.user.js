// ==UserScript==
// @name         개드립 Plus+ 크롬 & 사파리 전천후 마스터 통합본
// @namespace    https://dogdrip.net/
// @version      1.9.9
// @match        *://*.dogdrip.net/*
// @downloadURL  https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/dogdrip-plus.user.js
// @updateURL    https://raw.githubusercontent.com/z3ro2201/dogdrip-plus-mobilejs/main/dogdrip-plus.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  // 🛡️ [1단계: 하이브리드 환경 감지 및 데이터 가교]
  const isExtensionEnv =
    typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;

  if (!isExtensionEnv) {
    window.chrome = {
      storage: {
        local: {
          get: function (keys, callback) {
            let result = {};
            keys.forEach((key) => {
              let defaultVal = [];
              if (key === "blockMethod") defaultVal = "badge";
              if (key === "userMemos" || key === "keywords") defaultVal = {};

              if (Array.isArray(defaultVal)) {
                result[key] =
                  typeof GM_getValue !== "undefined"
                    ? GM_getValue(key, defaultVal)
                    : defaultVal;
              } else {
                let raw =
                  typeof GM_getValue !== "undefined"
                    ? GM_getValue(key, "{}")
                    : "{}";
                try {
                  result[key] = typeof raw === "string" ? JSON.parse(raw) : raw;
                } catch (e) {
                  result[key] = defaultVal;
                }
              }
            });
            callback(result);
          },
          set: function (obj, callback) {
            if (typeof GM_setValue !== "undefined") {
              for (let key in obj) {
                if (typeof obj[key] === "object") {
                  GM_setValue(key, JSON.stringify(obj[key]));
                } else {
                  GM_setValue(key, obj[key]);
                }
              }
            }
            if (callback) callback();
          },
        },
      },
      runtime: { id: "safari-userscripts-hybrid-id" },
    };
  }

  // 🎨 [2단계: 모바일 사파리 전용 UI 인젝터 (사파리 터치 이벤트 완벽 주입)]
  function injectMobileUIAndStyles() {
    if (isExtensionEnv) return;
    if (document.getElementById("ext-mobile-dashboard-style")) return;

    const style = document.createElement("style");
    style.id = "ext-mobile-dashboard-style";
    style.innerHTML = `
            /* 💡 사파리 클릭 바인딩 누수 방지용 CSS 포인터 선언 */
            #ext-mobile-setup-trigger, .ext-mob-btn, .ext-mob-kv-del, #ext-mobile-dashboard-close {
                cursor: pointer !important;
                touch-action: manipulation !important;
                -webkit-tap-highlight-color: rgba(0,0,0,0) !important;
            }
            #ext-mobile-setup-trigger {
                position: fixed !important; bottom: 30px !important; right: 30px !important; z-index: 2147483647 !important;
                width: 54px !important; height: 54px !important; background: #3b82f6 !important; color: #fff !important;
                border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important;
                font-size: 24px !important; box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important; user-select: none !important; -webkit-user-select: none !important;
            }
            .ext-mob-modal-overlay {
                position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important;
                background: rgba(0,0,0,0.5) !important; z-index: 2147483646 !important; display: none !important; align-items: center !important; justify-content: center !important;
            }
            .ext-mob-modal-card {
                background: #fff !important; width: 90% !important; max-width: 360px !important; padding: 22px !important;
                border-radius: 16px !important; box-shadow: 0 12px 30px rgba(0,0,0,0.2) !important; color: #111827 !important; font-family: -apple-system, sans-serif !important;
            }
            .ext-mob-title { font-size: 15px !important; font-weight: 700 !important; margin-bottom: 12px !important; color: #1f2937 !important; display: flex; align-items: center; gap: 6px; }
            .ext-mob-input { width: 100% !important; padding: 10px 12px !important; border: 1px solid #cbd5e1 !important; border-radius: 8px !important; font-size: 13px !important; box-sizing: border-box !important; margin-bottom: 12px !important; color: #000 !important; background: #fff !important; }
            .ext-mob-btn-group { display: flex !important; gap: 8px !important; justify-content: flex-end !important; margin-top: 14px !important; }
            .ext-mob-btn { padding: 9px 15px !important; font-size: 13px !important; font-weight: 600 !important; border-radius: 8px !important; border: none !important; }
            .ext-mob-btn-primary { background: #3b82f6 !important; color: #fff !important; }
            .ext-mob-btn-secondary { background: #f3f4f6 !important; color: #4b5563 !important; }
            .ext-mob-btn-danger { background: #fee2e2 !important; color: #b91c1c !important; border: 1px solid #fca5a5 !important; }
            .ext-mob-kv-list { margin: 8px 0 !important; padding: 0 !important; list-style: none !important; max-height: 140px !important; overflow-y: auto !important; border: 1px solid #e5e7eb !important; border-radius: 8px !important; }
            .ext-mob-kv-list li { padding: 8px 12px !important; border-bottom: 1px solid #f3f4f6 !important; display: flex !important; justify-content: space-between !important; font-size: 13px !important; background: #fff !important; color: #000 !important; }
            .ext-mob-kv-del { color: #ef4444 !important; font-weight: 700 !important; }
        `;
    document.head.appendChild(style);

    const triggerBtn = document.createElement("div");
    triggerBtn.id = "ext-mobile-setup-trigger";
    triggerBtn.innerText = "⚙️";
    document.body.appendChild(triggerBtn);

    const dashboardOverlay = document.createElement("div");
    dashboardOverlay.id = "ext-mobile-dashboard";
    dashboardOverlay.className = "ext-mob-modal-overlay";
    dashboardOverlay.innerHTML = `
            <div class="ext-mob-modal-card">
                <div class="ext-mob-title">🚫 모바일 차단 키워드 관리</div>
                <ul class="ext-mob-kv-list" id="ext-mob-kw-container"></ul>
                <div style="display:flex; gap:6px; margin-bottom:14px;">
                    <input type="text" id="ext-mob-new-kw-input" class="ext-mob-input" placeholder="차단할 단어 입력..." style="margin-bottom:0 !important; flex:1;">
                    <button class="ext-mob-btn ext-mob-btn-primary" id="ext-mob-kw-add-btn" style="padding:0 14px !important;">추가</button>
                </div>
                <div class="ext-mob-title" style="margin-top:16px;">🎨 차단 방식 설정</div>
                <label style="display:block; font-size:13px; margin-bottom:6px; color:#374151;"><input type="radio" name="mobBlockRadio" value="blind"> 가림막으로 접기</label>
                <label style="display:block; font-size:13px; color:#374151; margin-bottom:16px;"><input type="radio" name="mobBlockRadio" value="badge"> 글 유지하고 배경/배지만 보기</label>
                <button class="ext-mob-btn ext-mob-btn-secondary" id="ext-mobile-dashboard-close" style="width:100% !important; font-weight:700 !important; padding:11px !important;">설정 완료 및 창 닫기</button>
            </div>
        `;
    document.body.appendChild(dashboardOverlay);

    function refreshKeywordUI() {
      chrome.storage.local.get(["keywords", "blockMethod"], (res) => {
        let kws = Array.isArray(res.keywords) ? res.keywords : [];
        let method = res.blockMethod || "badge";
        const targetRadio = dashboardOverlay.querySelector(
          `input[name="mobBlockRadio"][value="${method}"]`,
        );
        if (targetRadio) targetRadio.checked = true;

        const container = document.getElementById("ext-mob-kw-container");
        if (container) {
          container.innerHTML = "";
          kws.forEach((kw, idx) => {
            const li = document.createElement("li");
            li.innerHTML = `<span>${kw}</span><span class="ext-mob-kv-del" data-idx="${idx}">삭제</span>`;
            container.appendChild(li);
          });
        }
      });
    }

    // 🎯 [사파리 통합 인터랙션 매니저]: 터치 및 클릭을 동시에 방어하여 씹힘 현상을 완벽히 방지합니다.
    const handleMobileInteraction = (e) => {
      const target = e.target;
      if (!target) return;

      // 1. ⚙️ 톱니바퀴 트리거
      if (target.id === "ext-mobile-setup-trigger") {
        e.preventDefault();
        e.stopPropagation();
        refreshKeywordUI();
        dashboardOverlay.style.display = "flex";
      }

      // 2. 키워드 추가 버튼
      if (target.id === "ext-mob-kw-add-btn") {
        e.preventDefault();
        e.stopPropagation();
        const input = document.getElementById("ext-mob-new-kw-input");
        const val = input ? input.value.trim() : "";
        if (!val) return;
        chrome.storage.local.get(["keywords"], (res) => {
          let kws = Array.isArray(res.keywords) ? res.keywords : [];
          if (!kws.includes(val)) {
            kws.push(val);
            chrome.storage.local.set({ keywords: kws }, () => {
              if (input) input.value = "";
              refreshKeywordUI();
            });
          }
        });
      }

      // 3. 키워드 삭제 버튼
      if (target.classList.contains("ext-mob-kv-del")) {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(target.dataset.idx);
        chrome.storage.local.get(["keywords"], (res) => {
          let kws = Array.isArray(res.keywords) ? res.keywords : [];
          kws.splice(idx, 1);
          chrome.storage.local.set({ keywords: kws }, () => {
            refreshKeywordUI();
          });
        });
      }

      // 4. 대시보드 완료 버튼
      if (target.id === "ext-mobile-dashboard-close") {
        e.preventDefault();
        e.stopPropagation();
        const checkedRadio = dashboardOverlay.querySelector(
          'input[name="mobBlockRadio"]:checked',
        );
        const method = checkedRadio ? checkedRadio.value : "badge";
        chrome.storage.local.set({ blockMethod: method }, () => {
          dashboardOverlay.style.display = "none";
          window.location.reload();
        });
      }
    };

    // 사파리 모바일 터치 하이브리드 바인딩 안정화
    document.body.addEventListener("click", handleMobileInteraction);
  }

  if (document.body) {
    injectMobileUIAndStyles();
  } else {
    document.addEventListener("DOMContentLoaded", injectMobileUIAndStyles);
    const bodyObserver = new MutationObserver(() => {
      if (document.body) {
        if (injectMobileUIAndStyles()) bodyObserver.disconnect();
      }
    });
    bodyObserver.observe(document, { childList: true, subtree: true });
  }

  // =========================================================
  // 📦 [3단계: 순정 개드립 코어 필터 엔진 구역]
  // =========================================================
  const blockColor = "f43f5e";
  const grantColor = "16a34a";
  const targetPopupMenuId = "popup_menu_area";

  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "ext-loading-overlay";
  loadingOverlay.innerHTML = `<div class="spinner"></div><div class="loading-text">페이지 최적화 중...</div>`;

  const hybridModalOverlay = document.createElement("div");
  hybridModalOverlay.id = "ext-hybrid-modal-overlay";
  hybridModalOverlay.className = "ext-mob-modal-overlay";
  hybridModalOverlay.style.cssText =
    "position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background: rgba(0,0,0,0.5) !important; z-index: 2147483645 !important; display: none !important; align-items: center !important; justify-content: center !important;";
  hybridModalOverlay.innerHTML = `<div class="ext-mob-modal-card" id="ext-hybrid-card-content"></div>`;

  function removeLoadingOverlay() {
    const overlay = document.getElementById("ext-loading-overlay");
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
      }, 200);
    }
  }

  function injectInitialUI() {
    if (
      document.documentElement &&
      !document.getElementById("ext-loading-overlay")
    ) {
      document.documentElement.appendChild(loadingOverlay);
      document.documentElement.appendChild(hybridModalOverlay);
      return true;
    }
    return false;
  }

  if (!injectInitialUI()) {
    const injectObserver = new MutationObserver(() => {
      if (injectInitialUI()) injectObserver.disconnect();
    });
    injectObserver.observe(document, { childList: true, subtree: true });
  }

  let targetNicknameToBlock = "";
  let targetMemberIdToBlock = "";
  let targetMemoMemberId = "";
  let selectedMemoColorStyle = "blue";
  let lastClickedUserData = { memberId: "", nickname: "" };
  let currentActiveDogconData = null;

  function openBlockModal(nickname, memberId) {
    targetNicknameToBlock = nickname;
    targetMemberIdToBlock = memberId;
    const card = document.getElementById("ext-hybrid-card-content");
    if (!card) return;
    card.innerHTML = `
          <div class="ext-mob-title">🚫 사용자 차단하기</div>
          <p style="font-size:13px; line-height:1.4; color:#4b5563; margin-bottom:14px;"><strong>${nickname}(${memberId})</strong> 유저를 차단 진형에 추가합니다. 차단 사유를 기입해 주세요.</p>
          <input type="text" id="ext-block-reason-input" class="ext-mob-input" placeholder="차단 사유를 간략히 입력하세요..." autocomplete="off">
          <div class="ext-mob-btn-group">
              <button class="ext-mob-btn ext-mob-btn-secondary" id="ext-mob-block-cancel">취소</button>
              <button class="ext-mob-btn ext-mob-btn-primary" id="ext-mob-block-confirm" style="background:#ef4444 !important;">차단하기</button>
          </div>
      `;
    hybridModalOverlay.style.display = "flex";

    document
      .getElementById("ext-mob-block-cancel")
      .addEventListener("click", (e) => {
        e.preventDefault();
        hybridModalOverlay.style.display = "none";
      });
    document
      .getElementById("ext-mob-block-confirm")
      .addEventListener("click", (e) => {
        e.preventDefault();
        const blockReason = document
          .getElementById("ext-block-reason-input")
          .value.trim();
        const newBlockUserObj = {
          date: "2026/05/19",
          member_num: String(targetMemberIdToBlock).trim(),
          memo: blockReason,
        };

        chrome.storage.local.get(["blocked_users"], (result) => {
          const list = Array.isArray(result.blocked_users)
            ? result.blocked_users
            : [];
          if (
            !list.some(
              (item) =>
                String(item.member_num) === String(targetMemberIdToBlock),
            )
          ) {
            list.push(newBlockUserObj);
            chrome.storage.local.set({ blocked_users: list }, () => {
              hybridModalOverlay.style.display = "none";
              window.location.reload();
            });
          } else {
            hybridModalOverlay.style.display = "none";
          }
        });
      });
  }

  function openUserMemoModal(nickname, memberId, rawMemoData) {
    targetMemoMemberId = memberId;
    let currentMemoText = "";
    selectedMemoColorStyle = "blue";
    if (rawMemoData) {
      if (rawMemoData.includes(":")) {
        const parts = rawMemoData.split(":");
        currentMemoText = parts[0];
        selectedMemoColorStyle = parts[1] || "blue";
      } else {
        currentMemoText = rawMemoData;
      }
    }

    const card = document.getElementById("ext-hybrid-card-content");
    if (!card) return;
    card.innerHTML = `
          <div class="ext-mob-title">📝 유저 메모 관리</div>
          <p style="font-size:13px; color:#4b5563; margin-bottom:10px;"><strong>${nickname}</strong> 유저에 대한 고유 메모를 적어주세요.</p>
          <input type="text" id="ext-user-memo-modal-input" class="ext-mob-input" placeholder="메모 내용 입력..." value="${currentMemoText}" autocomplete="off">
          <p style="font-size: 11px; font-weight: bold; color: #64748b; margin: 4px 0 6px 0;">🎨 배지 레이블 색상 선택</p>
          <div id="ext-mob-color-box" style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px;"></div>
          <div class="ext-mob-btn-group">
              <button class="ext-mob-btn ext-mob-btn-danger" id="ext-mob-memo-delete" style="margin-right:auto; display:${currentMemoText ? "block" : "none"};">삭제</button>
              <button class="ext-mob-btn ext-mob-btn-secondary" id="ext-mob-memo-cancel">취소</button>
              <button class="ext-mob-btn ext-mob-btn-primary" id="ext-mob-memo-save">저장</button>
          </div>
      `;

    const colors = [
      { k: "blue", c: "#3b82f6" },
      { k: "green", c: "#10b981" },
      { k: "red", c: "#ef4444" },
      { k: "yellow", c: "#f59e0b" },
      { k: "purple", c: "#8b5cf6" },
      { k: "gray", c: "#64748b" },
    ];
    const colorBox = document.getElementById("ext-mob-color-box");
    colors.forEach((col) => {
      const chip = document.createElement("div");
      chip.style.cssText = `width:20px; height:20px; border-radius:50%; background:${col.c}; cursor:pointer; border:2px solid ${selectedMemoColorStyle === col.k ? "#111827" : "transparent"}`;
      chip.addEventListener("click", () => {
        selectedMemoColorStyle = col.k;
        colorBox
          .querySelectorAll("div")
          .forEach((d) => (d.style.borderColor = "transparent"));
        chip.style.borderColor = "#111827";
      });
      if (colorBox) colorBox.appendChild(chip);
    });

    hybridModalOverlay.style.display = "flex";
    const uInput = document.getElementById("ext-user-memo-modal-input");
    if (uInput) setTimeout(() => uInput.focus(), 80);

    document
      .getElementById("ext-mob-memo-cancel")
      .addEventListener("click", (e) => {
        e.preventDefault();
        hybridModalOverlay.style.display = "none";
      });
    document
      .getElementById("ext-mob-memo-delete")
      .addEventListener("click", (e) => {
        e.preventDefault();
        chrome.storage.local.get(["userMemos"], (res) => {
          const currentMemos = res.userMemos || {};
          delete currentMemos[targetMemoMemberId];
          chrome.storage.local.set({ userMemos: currentMemos }, () => {
            hybridModalOverlay.style.display = "none";
            window.location.reload();
          });
        });
      });
    document
      .getElementById("ext-mob-memo-save")
      .addEventListener("click", (e) => {
        e.preventDefault();
        const memoText = document
          .getElementById("ext-user-memo-modal-input")
          .value.trim();
        chrome.storage.local.get(["userMemos"], (res) => {
          const currentMemos = res.userMemos || {};
          if (memoText === "") {
            delete currentMemos[targetMemoMemberId];
          } else {
            currentMemos[targetMemoMemberId] =
              `${memoText}:${selectedMemoColorStyle}`;
          }
          chrome.storage.local.set({ userMemos: currentMemos }, () => {
            hybridModalOverlay.style.display = "none";
            window.location.reload();
          });
        });
      });
  }

  function buildBlindWrapperHTML(typeLabel, originalHTML) {
    return `
        <div class="ext-blind-container">
          <div class="ext-blind-header">
            <span>🛡️ 차단된 사용자의 ${typeLabel}입니다.</span>
            <a href="#" class="ext-blind-toggle-btn" onclick="return false;">📄 내용 보기</a>
          </div>
          <div class="ext-blind-body">${originalHTML}</div>
        </div>
      `;
  }

  function attachBlindToggleEvents(container) {
    container.querySelectorAll(".ext-blind-container").forEach((wrapper) => {
      if (wrapper.dataset.bound) return;
      wrapper.dataset.bound = "true";
      const btn = wrapper.querySelector(".ext-blind-toggle-btn");
      const body = wrapper.querySelector(".ext-blind-body");
      if (!body || !btn) return;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isFixed = wrapper.classList.toggle("ext-blind-fixed");
        if (isFixed) {
          body.style.display = "flex";
          btn.innerText = "❌ 내용 숨기기";
        } else {
          body.style.display = "none";
          btn.innerText = "📄 내용 보기";
        }
      });

      wrapper.addEventListener("mouseenter", () => {
        if (wrapper.classList.contains("ext-blind-fixed")) return;
        body.style.display = "flex";
        btn.innerText = "👀 슬쩍 보기 중...";
      });
      wrapper.addEventListener("mouseleave", () => {
        if (wrapper.classList.contains("ext-blind-fixed")) return;
        body.style.display = "none";
        btn.innerText = "📄 내용 보기";
      });
    });
  }

  function createMemoBadgeElement(memberId, memoText, colorStyle) {
    if (!memoText) return null;
    const badge = document.createElement("span");
    badge.className = `ext-user-memo-badge ext-memo-${colorStyle || "blue"} ext-badge-id-${memberId}`;
    badge.innerText = memoText;
    badge.title = `메모: ${memoText}\n(회원번호: ${memberId})`;
    return badge;
  }

  function checkKeywordMatchCondition(titleText, keywordObj, targetArea) {
    if (!titleText || !keywordObj) return false;
    const word =
      typeof keywordObj === "string"
        ? keywordObj
        : keywordObj.word || keywordObj.keyword;
    const method = keywordObj.method || "includes";
    const target = keywordObj.target || "all";
    const normalizedTarget =
      target === "post" ? "posts" : target === "comment" ? "comments" : target;
    if (normalizedTarget !== "all" && normalizedTarget !== targetArea)
      return false;

    let cleanText = titleText.replace(/[\s\n\r\t]+/g, " ");
    cleanText = cleanText
      .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, "")
      .trim();
    const cleanWord = word.trim();

    if (method === "includes") return cleanText.includes(cleanWord);
    if (method === "starts") return cleanText.startsWith(cleanWord);
    return false;
  }

  function executeFilterWithMinTime() {
    const minTimePromise = new Promise((resolve) => setTimeout(resolve, 1000));
    const filterPromise = new Promise((resolve) => {
      chrome.storage.local.get(
        [
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
        ],
        (result) => {
          if (chrome.runtime?.lastError) return;
          const filterKeywords = Array.isArray(result.keywords)
            ? result.keywords
            : [];
          const blockedUsers = Array.isArray(result.blocked_users)
            ? result.blocked_users
            : [];
          const blockedDogcons = Array.isArray(result.blockedDogcons)
            ? result.blockedDogcons
            : [];
          const blockedDogconGroups = Array.isArray(result.blockedDogconGroups)
            ? result.blockedDogconGroups
            : [];
          const isBlindMode = result.blockMethod === "blind";
          const isBadgeMode = result.blockMethod === "badge";
          const memos = result.userMemos || {};

          const blockedMemberIds = blockedUsers
            .map((u) => String(u.member_num).trim())
            .filter((id) => id !== "");
          const blockedDogconIds = blockedDogcons.map((item) => item.id);
          const blockedDogconGroupIds = blockedDogconGroups.map(
            (item) => item.id,
          );

          const htmlEl = document.documentElement;
          if (htmlEl) {
            if (result.contentWidth && result.contentWidth.trim() !== "") {
              htmlEl.style.setProperty(
                "--ext-custom-width",
                result.contentWidth.trim(),
              );
            }
            if (result.hideNotice === true)
              htmlEl.classList.add("ext-hide-notice");
            if (result.hidePopular === true)
              htmlEl.classList.add("ext-hide-popular");
            if (result.hideSidebar === true)
              htmlEl.classList.add("ext-hide-sidebar");
            if (result.compactMode === true)
              htmlEl.classList.add("ext-hide-compact");
            if (result.disableVote === true)
              htmlEl.classList.add("ext-hide-vote");
          }

          function getMemoData(mid) {
            const rawData = memos[mid];
            if (!rawData) return { text: "", style: "blue" };
            if (rawData.includes(":")) {
              const parts = rawData.split(":");
              return { text: parts[0], style: parts[1] };
            }
            return { text: rawData, style: "blue" };
          }

          // ① 웹진형 레이아웃 필터
          document.querySelectorAll("li.webzine").forEach((article) => {
            const titleElement = article.querySelector(".title-link");
            const nicknameElement = article.querySelector(
              'a[class*="member_"]',
            );
            let shouldRemove = false;
            let shouldBlind = false;

            if (titleElement && filterKeywords.length > 0) {
              const titleText = titleElement.textContent.trim();
              if (
                filterKeywords.some((kw) =>
                  checkKeywordMatchCondition(titleText, kw, "posts"),
                )
              ) {
                shouldRemove = true;
              }
            }

            let currentMemberId = "";
            if (nicknameElement) {
              const match = nicknameElement.className.match(/member_(\d+)/);
              if (match) {
                currentMemberId = match[1];
                if (blockedMemberIds.includes(currentMemberId))
                  shouldBlind = true;
              }
            }

            if (shouldRemove) {
              article.remove();
              return;
            }
            if (shouldBlind) {
              if (
                currentMemberId &&
                nicknameElement &&
                !article.querySelector(`.ext-badge-id-${currentMemberId}`)
              ) {
                const userObj = blockedUsers.find(
                  (u) => String(u.member_num) === String(currentMemberId),
                );
                if (userObj && userObj.memo && userObj.memo.trim() !== "") {
                  const blockBadge = createMemoBadgeElement(
                    currentMemberId,
                    userObj.memo.trim(),
                    "red-solid",
                  );
                  if (blockBadge) nicknameElement.after(blockBadge);
                }
              }
              if (isBadgeMode) {
                article.style.backgroundColor = "#fff1f2";
                article.classList.add("ext-blocked-user-layout");
                return;
              }
              if (article.dataset.extFiltered) return;
              article.dataset.extFiltered = "true";
              if (isBlindMode) {
                const cacheHTML = article.innerHTML;
                article.innerHTML = buildBlindWrapperHTML("게시글", cacheHTML);
                attachBlindToggleEvents(article);
              } else {
                article.remove();
              }
            } else if (currentMemberId && memos[currentMemberId]) {
              if (
                nicknameElement &&
                !article.querySelector(`.ext-badge-id-${currentMemberId}`)
              ) {
                const memoData = getMemoData(currentMemberId);
                const badge = createMemoBadgeElement(
                  currentMemberId,
                  memoData.text,
                  memoData.style,
                );
                if (badge) nicknameElement.after(badge);
              }
            }
          });

          // ② 인기글 및 ③ 최근글 구역 복합 필터
          document
            .querySelectorAll("li span.title a, li div.eq span.text-link")
            .forEach((titleEl) => {
              const parentLi = titleEl.closest("li");
              if (!parentLi) return;
              const nicknameElement = parentLi.querySelector(
                'a[class*="member_"]',
              );
              let currentMemberId = "";
              if (nicknameElement) {
                const match = nicknameElement.className.match(/member_(\d+)/);
                if (match) currentMemberId = match[1];
              }

              if (filterKeywords.length > 0) {
                const titleText = titleEl.textContent.trim();
                if (
                  filterKeywords.some((kw) =>
                    checkKeywordMatchCondition(titleText, kw, "posts"),
                  )
                ) {
                  parentLi.remove();
                  return;
                }
              }

              if (
                currentMemberId &&
                blockedMemberIds.includes(currentMemberId)
              ) {
                if (
                  nicknameElement &&
                  !parentLi.querySelector(`.ext-badge-id-${currentMemberId}`)
                ) {
                  const userObj = blockedUsers.find(
                    (u) => String(u.member_num) === String(currentMemberId),
                  );
                  if (userObj && userObj.memo && userObj.memo.trim() !== "") {
                    const blockBadge = createMemoBadgeElement(
                      currentMemberId,
                      userObj.memo.trim(),
                      "red-solid",
                    );
                    if (blockBadge) nicknameElement.after(blockBadge);
                  }
                }
                if (isBadgeMode) {
                  parentLi.style.backgroundColor = "#fff1f2";
                  parentLi.classList.add("ext-blocked-user-layout");
                  return;
                }
                if (parentLi.dataset.extFiltered) return;
                parentLi.dataset.extFiltered = "true";
                if (isBlindMode) {
                  const cacheHTML = parentLi.innerHTML;
                  parentLi.innerHTML = buildBlindWrapperHTML(
                    "게시글",
                    cacheHTML,
                  );
                  attachBlindToggleEvents(parentLi);
                } else {
                  parentLi.remove();
                }
              } else if (currentMemberId && memos[currentMemberId]) {
                if (
                  nicknameElement &&
                  !parentLi.querySelector(`.ext-badge-id-${currentMemberId}`)
                ) {
                  const memoData = getMemoData(currentMemberId);
                  const badge = createMemoBadgeElement(
                    currentMemberId,
                    memoData.text,
                    memoData.style,
                  );
                  if (badge) nicknameElement.after(badge);
                }
              }
            });

          // ④ 테이블형 레이아웃 필터 (tr.ed)
          document.querySelectorAll("tr.ed").forEach((row) => {
            const titleElement = row.querySelector(".title");
            const authorElement = row.querySelector(
              ".author a[class*='member_']",
            );
            let shouldRemove = false;
            let shouldBlind = false;

            if (titleElement && filterKeywords.length > 0) {
              const realTitleLink = titleElement.querySelector(".title-link");
              let titleText = "";
              if (realTitleLink) {
                titleText = realTitleLink.textContent.trim();
              } else {
                const mainLink = titleElement.querySelector(
                  'a[href*="dogdrip.net/"], a[href^="/"]',
                );
                if (mainLink) {
                  let cloneLink = mainLink.cloneNode(true);
                  const replyBadge = cloneLink.querySelector(".text-primary");
                  if (replyBadge) replyBadge.remove();
                  titleText = cloneLink.textContent
                    .replace(/\[.*?\]/g, "")
                    .trim();
                } else {
                  titleText = titleElement.textContent.trim();
                }
              }
              const cleanTitleText = titleText
                .replace(/[\s\n\r\t]+/g, " ")
                .trim();
              if (
                filterKeywords.some((kw) =>
                  checkKeywordMatchCondition(cleanTitleText, kw, "posts"),
                )
              ) {
                shouldRemove = true;
              }
            }

            let currentMemberId = "";
            if (authorElement) {
              const match = authorElement.className.match(/member_(\d+)/);
              if (match) {
                currentMemberId = match[1];
                if (blockedMemberIds.includes(currentMemberId))
                  shouldBlind = true;
              }
            }

            if (shouldRemove) {
              row.remove();
              return;
            }
            if (shouldBlind) {
              if (
                currentMemberId &&
                authorElement &&
                !row.querySelector(`.ext-badge-id-${currentMemberId}`)
              ) {
                const userObj = blockedUsers.find(
                  (u) => String(u.member_num) === String(currentMemberId),
                );
                if (userObj && userObj.memo && userObj.memo.trim() !== "") {
                  const blockBadge = createMemoBadgeElement(
                    currentMemberId,
                    userObj.memo.trim(),
                    "red-solid",
                  );
                  if (blockBadge) authorElement.after(blockBadge);
                }
              }
              if (isBadgeMode) {
                row.style.backgroundColor = "#fff1f2";
                row.classList.add("ext-blocked-user-layout");
                return;
              }
              if (row.dataset.extFiltered) return;
              row.dataset.extFiltered = "true";
              if (isBlindMode) {
                const cacheHTML = row.innerHTML;
                row.innerHTML = `<td colspan="6" style="padding: 0;">${buildBlindWrapperHTML("게시글", `<table><tr>${cacheHTML}</tr></table>`)}</td>`;
                attachBlindToggleEvents(row);
              } else {
                row.remove();
              }
            } else if (currentMemberId && memos[currentMemberId]) {
              if (
                authorElement &&
                !row.querySelector(`.ext-badge-id-${currentMemberId}`)
              ) {
                const memoData = getMemoData(currentMemberId);
                const badge = createMemoBadgeElement(
                  currentMemberId,
                  memoData.text,
                  memoData.style,
                );
                if (badge) authorElement.after(badge);
              }
            }
          });

          // ⑤ 댓글 영역 필터
          document
            .querySelectorAll(".ed.comment-content")
            .forEach((comment) => {
              const nicknameElement = comment.querySelector(
                'a[class*="member_"]',
              );
              let shouldKeywordRemove = false;
              const commentBodyTextEl = comment.querySelector(
                ".xe_content, .comment-text",
              );

              if (commentBodyTextEl && filterKeywords.length > 0) {
                const rawContent = (
                  commentBodyTextEl.innerText ||
                  commentBodyTextEl.textContent ||
                  ""
                ).replace(/[\s\n\r\t]+/g, " ");
                const commentText = rawContent.trim();
                if (
                  filterKeywords.some((kw) =>
                    checkKeywordMatchCondition(commentText, kw, "comments"),
                  )
                ) {
                  shouldKeywordRemove = true;
                }
              }

              if (shouldKeywordRemove) {
                const totalCommentTarget =
                  comment.closest("li, div.comment-item") || comment;
                if (totalCommentTarget.dataset.extFiltered) return;
                totalCommentTarget.dataset.extFiltered = "true";
                if (isBlindMode) {
                  const cacheHTML = totalCommentTarget.innerHTML;
                  totalCommentTarget.innerHTML = buildBlindWrapperHTML(
                    "키워드가 포함된 댓글",
                    cacheHTML,
                  );
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

              if (
                currentMemberId &&
                blockedMemberIds.length > 0 &&
                blockedMemberIds.includes(currentMemberId)
              ) {
                if (
                  nicknameElement &&
                  !comment.querySelector(`.ext-badge-id-${currentMemberId}`)
                ) {
                  const userObj = blockedUsers.find(
                    (u) => String(u.member_num) === String(currentMemberId),
                  );
                  if (userObj && userObj.memo && userObj.memo.trim() !== "") {
                    const blockBadge = createMemoBadgeElement(
                      currentMemberId,
                      userObj.memo.trim(),
                      "red-solid",
                    );
                    if (blockBadge) nicknameElement.after(blockBadge);
                  }
                }
                const totalCommentTarget =
                  comment.closest("li, div.comment-item") || comment;
                if (totalCommentTarget.dataset.extFiltered) return;
                totalCommentTarget.dataset.extFiltered = "true";

                if (isBlindMode) {
                  const cacheHTML = totalCommentTarget.innerHTML;
                  totalCommentTarget.innerHTML = buildBlindWrapperHTML(
                    "댓글",
                    cacheHTML,
                  );
                  attachBlindToggleEvents(totalCommentTarget);
                } else if (isBadgeMode) {
                  totalCommentTarget.style.backgroundColor = "#fff1f2";
                  totalCommentTarget.classList.add("ext-blocked-user-layout");
                } else {
                  totalCommentTarget.remove();
                }
                return;
              }

              if (
                nicknameElement &&
                currentMemberId &&
                memos[currentMemberId]
              ) {
                if (
                  nicknameElement &&
                  !comment.querySelector(`.ext-badge-id-${currentMemberId}`)
                ) {
                  const memoData = getMemoData(currentMemberId);
                  const badge = createMemoBadgeElement(
                    currentMemberId,
                    memoData.text,
                    memoData.style,
                  );
                  if (badge) nicknameElement.after(badge);
                }
              }

              // 🛡️ [마비 차단 가드]: 구형 innerHTML 덮어쓰기 분기를 제거하고 전역 단일 위임 리스너에 통제권을 양도합니다.
              if (nicknameElement && currentMemberId) {
                const dropdownMenu = comment.querySelector("ul.dropdown-menu");
                if (
                  dropdownMenu &&
                  !dropdownMenu.querySelector(".ext-block-menu-item")
                ) {
                  const emptyLis = Array.from(
                    dropdownMenu.querySelectorAll("li"),
                  ).filter((li) => li.innerHTML.trim() === "");
                  if (emptyLis.length > 0) {
                    const targetLi = emptyLis[0];
                    targetLi.innerHTML = `<a class="ext-block-menu-item"><span class="ed icon"><i class="fas fa-user-slash"></i></span>차단</a>`;
                  }
                }
              }
            });

          // ⑥ 본문 상단 툴바 필터 제어 구역
          const titleToolbar = document.querySelector(".title-toolbar");
          if (titleToolbar) {
            const authorElement = titleToolbar.querySelector(
              'a[class*="member_"]',
            );
            const dropdownMenu = titleToolbar.querySelector("ul.dropdown-menu");
            if (authorElement && dropdownMenu) {
              const authorMemberId =
                authorElement.className.match(/member_(\d+)/)?.[1];
              if (authorMemberId) {
                if (
                  memos[authorMemberId] &&
                  !authorElement.nextElementSibling?.classList.contains(
                    "ext-user-memo-badge",
                  )
                ) {
                  const memoData = getMemoData(authorMemberId);
                  const badge = createMemoBadgeElement(
                    authorMemberId,
                    memoData.text,
                    memoData.style,
                  );
                  if (badge) authorElement.after(badge);
                }
                const existingToolbarBtn = dropdownMenu.querySelector(
                  ".ext-toolbar-member-block",
                );
                if (existingToolbarBtn) existingToolbarBtn.remove();
                const blockLi = document.createElement("li");
                blockLi.className = "ext-toolbar-member-block";

                if (blockedMemberIds.includes(authorMemberId)) {
                  blockLi.innerHTML = `<a class="ext-block-menu-item" href="#popup_menu_area" onclick="return false;" style="color: #${grantColor}; font-weight: bold;"><span class="ed icon"><i class="fas fa-user-check"></i></span> 차단 해제</a>`;
                } else {
                  blockLi.innerHTML = `<a class="ext-block-menu-item" href="#popup_menu_area" onclick="return false;" style="color: #${blockColor}; font-weight: bold;"><span class="ed icon"><i class="fas fa-user-slash"></i></span> 차단</a>`;
                }
                dropdownMenu.insertBefore(blockLi, dropdownMenu.firstChild);
              }
            }
          }

          // ⑦ 개드립콘 처리 구역
          const dogconImgs = document.querySelectorAll(
            "img.dogcon-clickable, img[data-dogcon-srl]",
          );
          dogconImgs.forEach((img) => {
            const srl = img.getAttribute("data-dogcon-srl");
            const fileSrl = img.getAttribute("data-dogcon-file-srl");
            const title =
              img.getAttribute("data-title") ||
              img.getAttribute("title") ||
              "개드립콘";
            const alt = img.getAttribute("alt") || "콘";
            if (img.dataset.extProcessed) return;
            img.dataset.extProcessed = "true";
            const isGroupBlocked = blockedDogconGroupIds.includes(srl);
            const isSingleBlocked = blockedDogconIds.includes(fileSrl);
            const infoUrl = `https://www.dogdrip.net/?mid=dogcon&dogcon_srl=${srl}`;
            if (isGroupBlocked || isSingleBlocked) {
              const blockDiv = document.createElement("div");
              blockDiv.className = "ext-dogcon-blocked";
              blockDiv.innerHTML = `🚫 <span>${title} (${alt}) 차단됨</span><a href="${infoUrl}" target="_blank" class="dogcon-info-link" style="margin-left:6px; color:#0284c7; text-decoration:underline; font-weight:bold;">[ℹ️ 정보]</a>`;
              blockDiv
                .querySelector(".dogcon-info-link")
                .addEventListener("click", (e) => {
                  e.stopPropagation();
                });
              blockDiv.dataset.srl = srl;
              blockDiv.dataset.fileSrl = fileSrl;
              blockDiv.dataset.title = title;
              blockDiv.dataset.alt = alt;
              blockDiv.dataset.isSingleBlocked = isSingleBlocked;
              blockDiv.dataset.isGroupBlocked = isGroupBlocked;
              img.parentNode.insertBefore(blockDiv, img);
              img.remove();
            }
          });

          if (result.disableVote === true) {
            document
              .querySelectorAll("td.ed.voteNum.text-primary")
              .forEach((td) => {
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
                if (
                  parent?.nextElementSibling?.classList.contains("text-primary")
                )
                  parent.nextElementSibling.remove();
              }
            });
            document.querySelectorAll("a.votebtn").forEach((btn) => {
              if (btn.dataset.extVoteProcessed) return;
              btn.dataset.extVoteProcessed = "true";
              if (btn.getAttribute("title") === "추천") {
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
              if (btn.getAttribute("title") === "비추천") btn.remove();
            });
            document.querySelectorAll("a.comment-item-tool").forEach((link) => {
              link.classList.remove("border-left-dotted");
            });
          }
          if (result.preventYoutubeAlgorithm === true) {
            document
              .querySelectorAll('iframe[src*="youtube.com/embed/"]')
              .forEach((iframe) => {
                if (!iframe.dataset.extYoutubeProcessed) {
                  iframe.dataset.extYoutubeProcessed = "true";
                  const src = iframe.getAttribute("src");
                  if (src)
                    iframe.setAttribute(
                      "src",
                      src.replace(
                        "youtube.com/embed/",
                        "youtube-nocookie.com/embed/",
                      ),
                    );
                }
              });
          }
          if (!result.contentWidth || result.contentWidth.trim() === "") {
            document.querySelectorAll(".container").forEach((el) => {
              el.style.maxWidth = "960px";
            });
          }
          resolve();
        },
      );
    });
    Promise.all([minTimePromise, filterPromise]).then(() => {
      removeLoadingOverlay();
    });
  }

  // 🛡️ [사파리 통합 마비 극복 위임 파이프라인]: 순정 메뉴 드롭다운 항목을 터치했을 때 수동 모달을 열어주는 종합 연동 장치
  document.body.addEventListener("click", (e) => {
    const item = e.target.closest("a");
    if (!item) return;

    // ① 닉네임 박스 메뉴 중 [차단] 누를 때 모바일 모달 강제 매핑
    if (
      (item.textContent.trim() === "차단" ||
        item.classList.contains("ext-block-menu-item")) &&
      item.closest("#popup_menu_area")
    ) {
      e.preventDefault();
      e.stopPropagation();
      const popupMenuArea = document.getElementById("popup_menu_area");
      if (popupMenuArea) popupMenuArea.style.display = "none";
      openBlockModal(
        lastClickedUserData.nickname,
        lastClickedUserData.memberId,
      );
    }

    // ② 닉네임 박스 메뉴 중 [메모] 누를 때 모바일 모달 강제 매핑
    if (
      item.textContent.startsWith("메모") &&
      item.closest("#popup_menu_area")
    ) {
      e.preventDefault();
      e.stopPropagation();
      const popupMenuArea = document.getElementById("popup_menu_area");
      if (popupMenuArea) popupMenuArea.style.display = "none";

      chrome.storage.local.get(["userMemos"], (res) => {
        const memos = res.userMemos || {};
        const currentMemoData = memos[lastClickedUserData.memberId] || "";
        openUserMemoModal(
          lastClickedUserData.nickname,
          lastClickedUserData.memberId,
          currentMemoData,
        );
      });
    }
  });

  const popupObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const hasNewDogcon = node.querySelector?.(
              "img.dogcon-clickable, img[data-dogcon-srl]",
            );
            const hasNewMemberLink = node.querySelector?.(
              'a[class*="member_"]',
            );
            if (
              hasNewDogcon ||
              hasNewMemberLink ||
              (node.className &&
                node.className.includes("ext-blind-container")) ||
              (node.tagName &&
                ["IMG", "DIV", "LI", "TR", "A"].includes(node.tagName))
            ) {
              setTimeout(() => {
                attachBlindToggleEvents(document.body);
                const targetImgs = document.querySelectorAll(
                  "img.dogcon-clickable:not([data-ext-processed]), img[data-dogcon-srl]:not([data-ext-processed])",
                );
                if (targetImgs.length > 0 || hasNewMemberLink) {
                  executeFilterWithMinTime();
                }
              }, 50);
            }
            if (node.id === targetPopupMenuId) {
              handlePopupMenuDetected(node);
            } else {
              const nestedPopup = node.querySelector?.(`#${targetPopupMenuId}`);
              if (nestedPopup) handlePopupMenuDetected(nestedPopup);
            }
          }
        });
      } else if (
        mutation.type === "attributes" &&
        mutation.attributeName === "style"
      ) {
        const targetNode = mutation.target;
        if (targetNode.id === targetPopupMenuId) {
          handlePopupMenuDetected(targetNode);
        }
      }
    }
  });

  if (document.body) {
    startPopupObservation();
  } else {
    document.addEventListener("DOMContentLoaded", startPopupObservation);
  }
  function startPopupObservation() {
    popupObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });
  }
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    executeFilterWithMinTime();
  } else {
    document.addEventListener("DOMContentLoaded", executeFilterWithMinTime);
  }

  window.addEventListener("load", () => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
      removeLoadingOverlay();
    } else {
      const overlay = document.getElementById("ext-loading-overlay");
      if (overlay) {
        overlay.style.opacity = "0";
        setTimeout(() => {
          overlay.remove();
        }, 200);
      }
    }
  });
})();
