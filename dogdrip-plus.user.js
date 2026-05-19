// ==UserScript==
// @name         개드립 Plus+ 모바일 통합본
// @namespace    http://tampermonkey.net/
// @version      1.9.0
// @description  모바일 대시보드 인젝션 및 필터 엔진 통합 예시
// @match        https://*.dogdrip.net/*
// @icon         https://www.google.com/s2/favicons?bb=1&domain=dogdrip.net
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  // 📦 1. 템퍼몽키 전용 내부 격리 스토리지에서 데이터 불러오기
  // (PC 크롬의 chrome.storage.local.get 역할을 수행합니다.)
  let savedKeywords = GM_getValue("keywords", ["어그로단어", "낚시글"]);
  let currentBlockMethod = GM_getValue("blockMethod", "badge");

  // 🎨 2. 설정창 UI용 기본 반응형 CSS 주입
  const style = document.createElement("style");
  style.innerHTML = `
        /* 우하단 플로팅 톱니바퀴 버튼 */
        #ext-mobile-setup-trigger {
            position: fixed; bottom: 20px; right: 20px; z-index: 200000;
            width: 48px; height: 48px; background: #3b82f6; color: #fff;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer;
        }
        /* 화면 전체를 덮는 모바일 모달 대시보드 */
        #ext-mobile-dashboard {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 200001;
            display: none; align-items: center; justify-content: center;
        }
        .ext-mobile-content {
            background: #fff; width: 90%; max-width: 360px; padding: 20px;
            border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            max-height: 80vh; overflow-y: auto;
        }
        .ext-title { font-weight: bold; font-size: 16px; margin-bottom: 12px; color: #111827; }
        .ext-item-list { margin: 10px 0; padding: 0; list-style: none; max-height: 120px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; }
        .ext-item-list li { padding: 6px 10px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; font-size: 13px; }
        .ext-del-btn { color: #ef4444; cursor: pointer; font-weight: bold; }
        .ext-input-group { display: flex; gap: 6px; margin-top: 8px; }
        .ext-input-group input { flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
        .ext-btn { padding: 6px 12px; background: #3b82f6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
        .ext-close-btn { width: 100%; margin-top: 15px; padding: 10px; background: #e5e7eb; color: #4b5563; text-align: center; border-radius: 8px; font-weight: bold; cursor: pointer; border: none;}
    `;
  document.head.appendChild(style);

  // 🛠️ 3. 본섭 문서 내부에 톱니바퀴 버튼과 대시보드 판넬 강제 인젝션
  const triggerBtn = document.createElement("div");
  triggerBtn.id = "ext-mobile-setup-trigger";
  triggerBtn.innerText = "⚙️";
  document.body.appendChild(triggerBtn);

  const dashboardModal = document.createElement("div");
  dashboardModal.id = "ext-mobile-dashboard";
  dashboardModal.innerHTML = `
        <div class="ext-mobile-content">
            <div class="ext-title">🚫 모바일 차단 키워드 관리</div>
            <ul class="ext-item-list" id="ext-kw-list"></ul>
            <div class="ext-input-group">
                <input type="text" id="ext-new-kw" placeholder="차단할 키워드 입력...">
                <button class="ext-btn" id="ext-add-btn">추측</button>
            </div>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;">
            <div class="ext-title">🎨 차단 방식 제어</div>
            <label style="font-size:13px; display:block; margin-bottom:4px;"><input type="radio" name="mobBlockMethod" value="blind" ${currentBlockMethod === "blind" ? "checked" : ""}> 가림막으로 접기</label>
            <label style="font-size:13px; display:block;"><input type="radio" name="mobBlockMethod" value="badge" ${currentBlockMethod === "badge" ? "checked" : ""}> 글 유지하고 배지만 보기</label>
            <button class="ext-close-btn" id="ext-save-close">설정 저장 및 닫기</button>
        </div>
    `;
  document.body.appendChild(dashboardModal);

  // 🔄 4. 대시보드 리스트 동적 렌더링 함수
  function renderKeywordList() {
    const listContainer = document.getElementById("ext-kw-list");
    listContainer.innerHTML = "";
    savedKeywords.forEach((kw, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${kw}</span><span class="ext-del-btn" data-index="${index}">삭제</span>`;
      listContainer.appendChild(li);
    });
  }

  // ⚡ 5. 인터랙션 및 스토리지 동기화 이벤트 바인딩
  triggerBtn.addEventListener("click", () => {
    renderKeywordList();
    dashboardModal.style.display = "flex";
  });

  // 키워드 추가 이벤트
  document.getElementById("ext-add-btn").addEventListener("click", () => {
    const input = document.getElementById("ext-new-kw");
    const val = input.value.trim();
    if (val && !savedKeywords.includes(val)) {
      savedKeywords.push(val);
      input.value = "";
      renderKeywordList();
    }
  });

  // 키워드 삭제 이벤트 (이벤트 위임)
  document.getElementById("ext-kw-list").addEventListener("click", (e) => {
    if (e.target.classList.contains("ext-del-btn")) {
      const index = parseInt(e.target.dataset.index);
      savedKeywords.splice(index, 1);
      renderKeywordList();
    }
  });

  // 저장 및 창 닫기 (GM_setValue 영구 적재)
  document.getElementById("ext-save-close").addEventListener("click", () => {
    const selectedMethod = document.querySelector(
      'input[name="mobBlockMethod"]:checked',
    ).value;

    // 템퍼몽키 영구 저장소에 저장 집행
    GM_setValue("keywords", savedKeywords);
    GM_setValue("blockMethod", selectedMethod);

    dashboardModal.style.display = "none";
    window.location.reload(); // 설정 동기화를 위한 새로고침
  });

  // 🛡️ 6. 하단 생략: 여기에 우리가 짠 app.js 필터 엔진(executeFilter)이 그대로 돌면 끝!
  console.log(
    "개드립 Plus 모바일 필터 엔진 로드 완료 (차단 방식:",
    currentBlockMethod,
    ")",
  );
})();
