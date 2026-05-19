// ==UserScript==
// @name         개드립 Plus+
// @namespace    https://dogdrip.net/
// @version      2.4.1
// @match        *://*.dogdrip.net/*
// @downloadURL  https://cdn.jsdelivr.net/gh/z3ro2201/dogdrip-plus-mobilejs@main/dogdrip-plus.user.js
// @updateURL    https://cdn.jsdelivr.net/gh/z3ro2201/dogdrip-plus-mobilejs@main/dogdrip-plus.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  // 🛡️ [1단계: 모바일 격리 스토리지 가교 레이어]
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

  // 🎨 [2단계: 모바일 5대 기능 통합 제어 대시보드 뷰어]
  function injectMobileUIAndStyles() {
    if (isExtensionEnv) return false;
    if (document.getElementById("ext-mobile-dashboard-style")) return false;

    // 도화지 가드: body가 없으면 이탈하여 터짐을 사전에 방지
    if (!document.body) return false;

    const style = document.createElement("style");
    style.id = "ext-mobile-dashboard-style";
    style.innerHTML = `
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
                background: #fff !important; width: 92% !important; max-width: 380px !important; padding: 20px !important;
                border-radius: 16px !important; box-shadow: 0 12px 30px rgba(0,0,0,0.2) !important; color: #111827 !important; font-family: -apple-system, sans-serif !important;
                max-height: 85vh !important; overflow-y: auto !important;
            }
            .ext-mob-section-title { font-size: 14px !important; font-weight: 700 !important; margin: 16px 0 8px 0 !important; color: #1f2937 !important; display: flex; align-items: center; gap: 4px; }
            .ext-mob-section-title:first-child { margin-top: 0 !important; }
            .ext-mob-kv-list { margin: 6px 0 !important; padding: 0 !important; list-style: none !important; max-height: 100px !important; overflow-y: auto !important; border: 1px solid #e5e7eb !important; border-radius: 8px !important; background: #f9fafb !important; }
            .ext-mob-kv-list li { padding: 6px 10px !important; border-bottom: 1px solid #edf2f7 !important; display: flex !important; justify-content: space-between !important; align-items: center !important; font-size: 12px !important; color: #374151 !important; }
            .ext-mob-kv-list li:last-child { border-bottom: none !important; }
            .ext-mob-kv-del { color: #ef4444 !important; font-weight: 700 !important; padding: 2px 6px !important; font-size: 11px !important; user-select: none; }
            .ext-mob-radio-group { display: flex !important; gap: 12px !important; margin-bottom: 4px !important; }
            .ext-mob-radio-label { font-size: 12px !important; color: #4b5563 !important; display: flex !important; align-items: center !important; gap: 4px !important; cursor: pointer; }
            .ext-mob-form-group { display: flex !important; gap: 6px !important; margin-top: 6px !important; }
            .ext-mob-input-box { flex: 1 !important; padding: 7px 10px !important; border: 1px solid #cbd5e1 !important; border-radius: 6px !important; font-size: 12px !important; color: #000 !important; background: #fff !important; box-sizing: border-box !important; }
            .ext-mob-inline-btn { padding: 0 12px !important; background: #3b82f6 !important; color: #fff !important; border: none !important; border-radius: 6px !important; font-size: 12px !important; font-weight: 600 !important; }
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
                <div class="ext-mob-section-title">🎨 차단 방법 설정</div>
                <div class="ext-mob-radio-group">
                    <label class="ext-mob-radio-label"><input type="radio" name="mobBlockRadio" value="blind"> 가림막 접기</label>
                    <label class="ext-mob-radio-label"><input type="radio" name="mobBlockRadio" value="badge"> 배경/배지만 표시</label>
                </div>
                <hr style="border:0; border-top:1px solid #f3f4f6; margin:12px 0;">
                <div class="ext-mob-section-title">📝 키워드 차단 목록</div>
                <ul class="ext-mob-kv-list" id="ext-mob-kw-container"></ul>
                <div class="ext-mob-form-group">
                    <input type="text" id="ext-mob-kw" class="ext-mob-input-box" placeholder="차단할 단어 입력...">
                    <button class="ext-mob-inline-btn" data-action="add-kw">추가</button>
                </div>
                <div class="ext-mob-section-title">🚫 차단 사용자 목록</div>
                <ul class="ext-mob-kv-list" id="ext-mob-users-container"></ul>
                <div class="ext-mob-form-group">
                    <input type="number" id="ext-input-user-id" class="ext-mob-input-box" placeholder="회원번호..." style="max-width:110px;">
                    <input type="text" id="ext-input-user-reason" class="ext-mob-input-box" placeholder="차단 사유(선택)...">
                    <button class="ext-mob-inline-btn" data-action="add-user">차단</button>
                </div>
                <div class="ext-mob-section-title">✏️ 등록된 유저 메모 목록</div>
                <ul class="ext-mob-kv-list" id="ext-mob-memos-container"></ul>
                <div class="ext-mob-form-group">
                    <input type="number" id="ext-input-memo-id" class="ext-mob-input-box" placeholder="회원번호..." style="max-width:110px;">
                    <input type="text" id="ext-input-memo-text" class="ext-mob-input-box" placeholder="메모 내용 입력...">
                    <button class="ext-mob-inline-btn" data-action="add-memo">저장</button>
                </div>
                <div class="ext-mob-section-title">🖼️ 차단 개드립콘 목록</div>
                <ul class="ext-mob-kv-list" id="ext-mob-dogcons-container"></ul>
                <div class="ext-mob-form-group">
                    <input type="number" id="ext-input-dc-id" class="ext-mob-input-box" placeholder="개드립콘 고유 ID 번호 입력...">
                    <button class="ext-mob-inline-btn" data-action="add-dc">차단</button>
                </div>
                <button style="width:100% !important; font-weight:700 !important; padding:11px !important; margin-top:20px; background:#3b82f6; color:#fff; border:none; border-radius:10px; font-size:13px;" id="ext-mobile-dashboard-close">설정 저장 및 창 닫기</button>
            </div>
        `;
    document.body.appendChild(dashboardOverlay);

    function refreshMobileDashboardUI() {
      chrome.storage.local.get(
        [
          "keywords",
          "blocked_users",
          "userMemos",
          "blockedDogcons",
          "blockMethod",
        ],
        (res) => {
          let kws = Array.isArray(res.keywords) ? res.keywords : [];
          let users = Array.isArray(res.blocked_users) ? res.blocked_users : [];
          let memos = res.userMemos || {};
          let dogcons = Array.isArray(res.blockedDogcons)
            ? res.blockedDogcons
            : [];
          let method = res.blockMethod || "badge";

          const targetRadio = dashboardOverlay.querySelector(
            `input[name="mobBlockRadio"][value="${method}"]`,
          );
          if (targetRadio) targetRadio.checked = true;

          const kwBox = document.getElementById("ext-mob-kw-container");
          if (kwBox) {
            kwBox.innerHTML = kws.length
              ? ""
              : "<li>등록된 키워드가 없습니다.</li>";
            kws.forEach((kw, idx) => {
              const li = document.createElement("li");
              li.innerHTML = `<span>${kw}</span><span class="ext-mob-kv-del" data-type="kw" data-id="${idx}">제거</span>`;
              kwBox.appendChild(li);
            });
          }

          const userBox = document.getElementById("ext-mob-users-container");
          if (userBox) {
            userBox.innerHTML = users.length
              ? ""
              : "<li>차단된 사용자가 없습니다.</li>";
            users.forEach((u) => {
              const li = document.createElement("li");
              li.innerHTML = `<span>회원: ${u.member_num} ${u.memo ? `(${u.memo})` : ""}</span><span class="ext-mob-kv-del" data-type="user" data-id="${u.member_num}">해제</span>`;
              userBox.appendChild(li);
            });
          }

          const memoBox = document.getElementById("ext-mob-memos-container");
          if (memoBox) {
            const memoKeys = Object.keys(memos);
            memoBox.innerHTML = memoKeys.length
              ? ""
              : "<li>등록된 메모가 없습니다.</li>";
            memoKeys.forEach((mid) => {
              let text = memos[mid];
              if (text.includes(":")) text = text.split(":")[0];
              const li = document.createElement("li");
              li.innerHTML = `<span>회원 ${mid}: ${text}</span><span class="ext-mob-kv-del" data-type="memo" data-id="${mid}">삭제</span>`;
              memoBox.appendChild(li);
            });
          }

          const dcBox = document.getElementById("ext-mob-dogcons-container");
          if (dcBox) {
            dcBox.innerHTML = dogcons.length
              ? ""
              : "<li>차단된 개드립콘이 없습니다.</li>";
            dogcons.forEach((dc) => {
              const li = document.createElement("li");
              li.innerHTML = `<span>콘 ID: ${dc.id}</span><span class="ext-mob-kv-del" data-type="dc" data-id="${dc.id}">해제</span>`;
              dcBox.appendChild(li);
            });
          }
        },
      );
    }

    document.body.addEventListener("click", (e) => {
      const target = e.target;
      if (!target) return;

      if (target.id === "ext-mobile-setup-trigger") {
        e.preventDefault();
        e.stopPropagation();
        refreshMobileDashboardUI();
        dashboardOverlay.style.display = "flex";
      }

      if (target.classList.contains("ext-mob-kv-del")) {
        e.preventDefault();
        e.stopPropagation();
        const type = target.dataset.type;
        const id = target.dataset.id;

        chrome.storage.local.get(
          ["keywords", "blocked_users", "userMemos", "blockedDogcons"],
          (res) => {
            if (type === "kw") {
              let kws = Array.isArray(res.keywords) ? res.keywords : [];
              kws.splice(parseInt(id), 1);
              chrome.storage.local.set(
                { keywords: kws },
                refreshMobileDashboardUI,
              );
            }
            if (type === "user") {
              let users = Array.isArray(res.blocked_users)
                ? res.blocked_users
                : [];
              users = users.filter((u) => String(u.member_num) !== String(id));
              chrome.storage.local.set(
                { blocked_users: users },
                refreshMobileDashboardUI,
              );
            }
            if (type === "memo") {
              let memos = res.userMemos || {};
              delete memos[id];
              chrome.storage.local.set(
                { userMemos: memos },
                refreshMobileDashboardUI,
              );
            }
            if (type === "dc") {
              let dcs = Array.isArray(res.blockedDogcons)
                ? res.blockedDogcons
                : [];
              dcs = dcs.filter((d) => String(d.id) !== String(id));
              chrome.storage.local.set(
                { blockedDogcons: dcs },
                refreshMobileDashboardUI,
              );
            }
          },
        );
      }

      if (target.classList.contains("ext-mob-inline-btn")) {
        e.preventDefault();
        e.stopPropagation();
        const action = target.dataset.action;

        chrome.storage.local.get(
          ["keywords", "blocked_users", "userMemos", "blockedDogcons"],
          (res) => {
            if (action === "add-kw") {
              const input = document.getElementById("ext-mob-kw");
              const val = input ? input.value.trim() : "";
              if (val) {
                let list = Array.isArray(res.keywords) ? res.keywords : [];
                if (!list.includes(val)) list.push(val);
                chrome.storage.local.set({ keywords: list }, () => {
                  input.value = "";
                  refreshMobileDashboardUI();
                });
              }
            }
            if (action === "add-user") {
              const inputId = document.getElementById("ext-input-user-id");
              const inputReason = document.getElementById(
                "ext-input-user-reason",
              );
              const uid = inputId ? inputId.value.trim() : "";
              const reason = inputReason
                ? inputReason.value.trim()
                : "수동 차단";
              if (uid) {
                let list = Array.isArray(res.blocked_users)
                  ? res.blocked_users
                  : [];
                if (!list.some((u) => String(u.member_num) === String(uid))) {
                  list.push({
                    date: "2026/05/20",
                    member_num: String(uid),
                    memo: reason,
                  });
                }
                chrome.storage.local.set({ blocked_users: list }, () => {
                  if (inputId) inputId.value = "";
                  if (inputReason) inputReason.value = "";
                  refreshMobileDashboardUI();
                });
              }
            }
            if (action === "add-memo") {
              const inputId = document.getElementById("ext-input-memo-id");
              const inputText = document.getElementById("ext-input-memo-text");
              const mid = inputId ? inputId.value.trim() : "";
              const text = inputText ? inputText.value.trim() : "";
              if (mid && text) {
                let memos = res.userMemos || {};
                memos[mid] = `${text}:blue`;
                chrome.storage.local.set({ userMemos: memos }, () => {
                  if (inputId) inputId.value = "";
                  if (inputText) inputText.value = "";
                  refreshMobileDashboardUI();
                });
              }
            }
            if (action === "add-dc") {
              const input = document.getElementById("ext-input-dc-id");
              const dcId = input ? input.value.trim() : "";
              if (dcId) {
                let list = Array.isArray(res.blockedDogcons)
                  ? res.blockedDogcons
                  : [];
                if (!list.some((d) => String(d.id) === String(dcId))) {
                  list.push({ id: dcId, name: `콘 ${dcId}` });
                }
                chrome.storage.local.set({ blockedDogcons: list }, () => {
                  input.value = "";
                  refreshMobileDashboardUI();
                });
              }
            }
          },
        );
      }

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
    });

    return true;
  }

  // ⚡ [사파리 핵심 가드 교정]: 다중 수명 주기 훅 결합
  if (document.body) {
    injectMobileUIAndStyles();
  } else {
    document.addEventListener("DOMContentLoaded", injectMobileUIAndStyles);
  }
  // 사파리 특유의 락을 부수기 위한 이중 보험 지연 가동장치
  setTimeout(() => {
    injectMobileUIAndStyles();
  }, 300);

  // =========================================================
  // 📦 [3단계: 순정 개드립 코어 필터 백엔드 엔진 구역]
  // =========================================================
  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "ext-loading-overlay";
  loadingOverlay.innerHTML = `<div class="spinner"></div><div class="loading-text">페이지 최적화 중...</div>`;

  function removeLoadingOverlay() {
    const overlay = document.getElementById("ext-loading-overlay");
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
      }, 200);
    }
  }

  if (
    document.documentElement &&
    !document.getElementById("ext-loading-overlay")
  ) {
    document.documentElement.appendChild(loadingOverlay);
  } else {
    const injectObserver = new MutationObserver(() => {
      if (
        document.documentElement &&
        !document.getElementById("ext-loading-overlay")
      ) {
        document.documentElement.appendChild(loadingOverlay);
        injectObserver.disconnect();
      }
    });
    injectObserver.observe(document, { childList: true, subtree: true });
  }

  function buildBlindWrapperHTML(typeLabel, originalHTML) {
    return `
        <div class="ext-blind-container">
          <div class="ext-blind-header">
            <span>🛡️ 차단된 사용자의 ${typeLabel}입니다.</span>
            <a href="#" class="ext-blind-toggle-btn" onclick="return false;">📄 내용 보기</a>
          </div>
          <div class="ext-blind-header-body" style="display:none;">${originalHTML}</div>
        </div>
      `;
  }

  function attachBlindToggleEvents(container) {
    container.querySelectorAll(".ext-blind-container").forEach((wrapper) => {
      if (wrapper.dataset.bound) return;
      wrapper.dataset.bound = "true";
      const btn = wrapper.querySelector(".ext-blind-toggle-btn");
      const body =
        wrapper.querySelector(".ext-blind-header-body") ||
        wrapper.querySelector(".ext-blind-body");
      if (!body || !btn) return;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isFixed = wrapper.classList.toggle("ext-blind-fixed");
        if (isFixed) {
          body.style.display = "block";
          btn.innerText = "❌ 내용 숨기기";
        } else {
          body.style.display = "none";
          btn.innerText = "📄 내용 보기";
        }
      });
    });
  }

  function createMemoBadgeElement(memberId, memoText, colorStyle) {
    if (!memoText) return null;
    const badge = document.createElement("span");
    badge.className = `ext-user-memo-badge ext-memo-${colorStyle || "blue"} ext-badge-id-${memberId}`;
    badge.innerText = memoText;
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

  function detectBlockedListContext() {
    chrome.storage.local.get(
      [
        "keywords",
        "blocked_users",
        "blockedDogcons",
        "blockMethod",
        "userMemos",
        "contentWidth",
        "hideNotice",
        "hidePopular",
        "hideSidebar",
        "compactMode",
        "disableVote",
        "preventYoutubeAlgorithm",
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
        const isBlindMode = result.blockMethod === "blind";
        const isBadgeMode = result.blockMethod === "badge";
        const memos = result.userMemos || {};

        const blockedMemberIds = blockedUsers
          .map((u) => String(u.member_num).trim())
          .filter((id) => id !== "");
        const blockedDogconIds = blockedDogcons.map((item) => String(item.id));

        const htmlEl = document.documentElement;
        if (htmlEl) {
          if (
            result.contentWidth &&
            typeof result.contentWidth === "string" &&
            result.contentWidth.trim() !== ""
          ) {
            htmlEl.style.setProperty(
              "--ext-custom-width",
              result.contentWidth.trim(),
            );
          }
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
          const nicknameElement = article.querySelector('a[class*="member_"]');
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

            if (currentMemberId && blockedMemberIds.includes(currentMemberId)) {
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
                parentLi.innerHTML = buildBlindWrapperHTML("게시글", cacheHTML);
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
        document.querySelectorAll(".ed.comment-content").forEach((comment) => {
          const nicknameElement = comment.querySelector('a[class*="member_"]');
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

          if (nicknameElement && currentMemberId && memos[currentMemberId]) {
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
        });

        // ⑥ 본문 상단 툴바 필터 제어 구역
        const titleToolbar = document.querySelector(".title-toolbar");
        if (titleToolbar) {
          const authorElement = titleToolbar.querySelector(
            'a[class*="member_"]',
          );
          if (
            authorElement &&
            memos[authorElement.className.match(/member_(\d+)/)?.[1]]
          ) {
            const authorMemberId =
              authorElement.className.match(/member_(\d+)/)?.[1];
            if (
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
          }
        }

        // ⑦ 개드립콘 처리 구역
        document
          .querySelectorAll("img.dogcon-clickable, img[data-dogcon-srl]")
          .forEach((img) => {
            const fileSrl = img.getAttribute("data-dogcon-file-srl");
            if (img.dataset.extProcessed) return;
            img.dataset.extProcessed = "true";
            if (fileSrl && blockedDogconIds.includes(String(fileSrl))) {
              const blockDiv = document.createElement("div");
              blockDiv.className = "ext-dogcon-blocked";
              blockDiv.innerHTML = `🚫 <span>차단된 개드립콘</span>`;
              img.parentNode.insertBefore(blockDiv, img);
              img.remove();
            }
          });
      },
    );
  }

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
            if (hasNewDogcon || hasNewMemberLink) {
              setTimeout(() => {
                attachBlindToggleEvents(document.body);
                detectBlockedListContext();
              }, 50);
            }
          }
        });
      }
    }
  });

  if (document.body) {
    popupObserver.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      popupObserver.observe(document.body, { childList: true, subtree: true });
    });
  }

  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    detectBlockedListContext();
  } else {
    document.addEventListener("DOMContentLoaded", detectBlockedListContext);
  }

  window.addEventListener("load", removeLoadingOverlay);
})();
