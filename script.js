(function () {
  const state = {
    device: "",
    issue: ""
  };

  const deviceDescriptions = {
    iphone: "iPhoneを使っています。",
    other: "iPhone以外のスマートフォン（Android）を使っています。"
  };

  const issueDescriptions = {
    howto: "操作のやり方がわからなくて困っています。",
    popup: "スマホに変な画面や通知が出て困っています。",
    meaning: "スマホに出てくる言葉の意味がわからなくて困っています。",
    broken: "スマホが急に動かなくなったり、調子が悪くなったりして困っています。"
  };

  const optionButtons = document.querySelectorAll(".option-btn");
  const detailInput = document.getElementById("detail-input");
  const submitBtn = document.getElementById("submit-btn");
  const inlineNotice = document.getElementById("inline-notice");
  const previewPrompt = document.getElementById("preview-prompt");
  const copyPromptBtn = document.getElementById("copy-prompt-btn");
  const fallbackBox = document.getElementById("fallback-box");
  const fallbackLink = document.getElementById("fallback-link");

  function buildPrompt() {
    const deviceText = state.device
      ? deviceDescriptions[state.device]
      : "スマホの種類はまだ選択されていません。";

    const issueText = state.issue
      ? issueDescriptions[state.issue]
      : "困っている内容はまだ選択されていません。";

    const rawDetail = detailInput.value.trim();
    const detailText = rawDetail
      ? `具体的な状況：「${rawDetail}」`
      : "具体的な状況：まだ入力されていません（何に困っているか優しく聞いてください）。";

    const extraRules = [];
    if (state.issue === "popup") {
      extraRules.push("・変な画面や警告が出て不安になっている可能性が高いため、最初に「大丈夫ですよ、落ち着いて一緒に確認しましょう」と安心させてください。");
    }

    const lines = [
      "スマホの操作で困っています。以下のルールを必ず守って案内してください。",
      "",
      "【相談者の状況】",
      "・" + deviceText,
      "・" + issueText,
      "・" + detailText,
      "",
      "【絶対に守るルール】",
      "・相手はスマホの操作に慣れていない方です。画面に表示される項目名や設定名（例：「Wi-Fi」「設定」「アップデート」など）は実際の画面表記のまま書き、難しい言葉やカタカナ語が出てくるときは「Wi-Fi（ワイファイ：無線でネットにつなぐ機能）」のようにカッコ書きで簡単な意味の注釈を入れてください。",
      "・手順を一度に全部書かず、必ず「最初の1つだけ」を短く教えてください。画面のどの位置にある何色のボタンを押すか具体的に書いてください。",
      ...extraRules,
      "・回答の最後に、次に聞きそうなことを「1. できたので次へ」「2. 画面が違う・うまくいかない」「3. 言葉の意味を教えて」のように1〜3の番号付き選択肢で出し、「数字だけ返信してください」と案内してください。"
    ];

    return lines.join("\n");
  }

  function buildChatGptUrl() {
    const prompt = buildPrompt();
    return "https://chatgpt.com/?q=" + encodeURIComponent(prompt);
  }

  function updatePreview() {
    previewPrompt.textContent = buildPrompt();
    fallbackLink.href = buildChatGptUrl();
  }

  function clearNotice() {
    inlineNotice.classList.remove("visible");
    inlineNotice.textContent = "";
  }

  function showNotice(message, targetElement) {
    inlineNotice.textContent = message;
    inlineNotice.classList.add("visible");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  optionButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const group = btn.getAttribute("data-group");
      const value = btn.getAttribute("data-value");

      document.querySelectorAll('.option-btn[data-group="' + group + '"]').forEach(function (item) {
        item.setAttribute("aria-pressed", "false");
      });

      btn.setAttribute("aria-pressed", "true");
      state[group] = value;

      clearNotice();
      updatePreview();
    });
  });

  detailInput.addEventListener("input", function () {
    updatePreview();
  });

  submitBtn.addEventListener("click", function () {
    if (!state.device) {
      showNotice(
        "上の「1. どんなスマホですか？」から、どれか1つを押してください。",
        document.getElementById("step1-section")
      );
      return;
    }

    if (!state.issue) {
      showNotice(
        "上の「2. どう困っていますか？」から、どれか1つを押してください。",
        document.getElementById("step2-section")
      );
      return;
    }

    clearNotice();
    const targetUrl = buildChatGptUrl();
    fallbackLink.href = targetUrl;

    const opened = window.open(targetUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      fallbackBox.classList.add("visible");
    }
  });

  copyPromptBtn.addEventListener("click", function () {
    const text = buildPrompt();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        copyPromptBtn.textContent = "コピーしました";
        setTimeout(function () {
          copyPromptBtn.textContent = "質問文をコピー";
        }, 2000);
      });
    }
  });

  updatePreview();
})();
