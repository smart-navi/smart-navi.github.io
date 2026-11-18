(function () {
  const state = {
    device: "",
    issue: ""
  };

  const deviceDescriptions = {
    iphone: "iPhone",
    other: "Android（iPhone以外のスマホ）"
  };

  const issueConfigs = {
    howto: {
      placeholder: "例：LINEで写真を送りたい、文字を大きくしたい",
      detailLabel: "やりたいこと",
      emptyDetail: "未入力（何のやり方を知りたいか3択で聞く）",
      rule: "スマホ初心者向け。最短で一番簡単な解決法を案内。画面の項目名はそのまま書きカタカナ語には短い注釈を添える。手順は最初の1つだけ短く教え、最後に「1.できた 2.違う 3.言葉の意味」の3択を提示。"
    },
    popup: {
      placeholder: "例：赤い文字で警告が出た、元の画面に戻したい",
      detailLabel: "起きていること",
      emptyDetail: "未入力（どんな画面が出たか3択で聞く）",
      rule: "スマホ初心者向け。まず安心させ、最終的に元の安全な画面に戻る一番簡単な解決法を案内。画面の項目名はそのまま書きカタカナ語には短い注釈を添える。手順は最初の1つだけ短く教え、最後に「1.できた 2.違う 3.言葉の意味」の3択を提示。"
    },
    meaning: {
      placeholder: "例：「キャッシュ」「アップデート」の意味を知りたい",
      detailLabel: "知りたい言葉",
      emptyDetail: "未入力（どの言葉の意味を知りたいか聞く）",
      rule: "スマホ初心者向け。専門用語を使わず身近な例えで3行以内でわかりやすく意味だけを解説。"
    },
    broken: {
      placeholder: "例：音が出ない、画面が固まって動かない",
      detailLabel: "起きていること",
      emptyDetail: "未入力（どんな症状か3択で聞く）",
      rule: "スマホ初心者向け。最終的に元の安全な状態に戻る一番簡単な解決法を案内。画面の項目名はそのまま書きカタカナ語には短い注釈を添える。手順は最初の1つだけ短く教え、最後に「1.できた 2.違う 3.言葉の意味」の3択を提示。"
    }
  };

  const defaultConfig = {
    placeholder: "例：LINEで写真を送りたい／画面に赤い文字が出た",
    detailLabel: "内容",
    emptyDetail: "未入力",
    rule: "スマホ初心者向け。最終目的を優先し一番簡単な解決法を案内。画面の項目名はそのまま書きカタカナ語には短い注釈を添える。手順は最初の1つだけ短く教え、最後に「1.できた 2.違う 3.言葉の意味」の3択を提示。"
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
    const config = issueConfigs[state.issue] || defaultConfig;
    const deviceText = state.device ? deviceDescriptions[state.device] : "未選択";
    const rawDetail = detailInput.value.trim();
    const detailText = rawDetail ? rawDetail : config.emptyDetail;

    // URL長制限で指示が切れないよう、条件（ルール）を先頭、自由記述を末尾に配置
    return [
      "【条件】" + config.rule,
      "【機種】" + deviceText,
      "【" + config.detailLabel + "】" + detailText
    ].join(" ");
  }

  function buildAiModeUrl() {
    const prompt = buildPrompt();
    return "https://www.google.com/search?udm=50&q=" + encodeURIComponent(prompt);
  }

  function updatePreview() {
    previewPrompt.textContent = buildPrompt();
    fallbackLink.href = buildAiModeUrl();
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

      if (group === "issue" && issueConfigs[value]) {
        detailInput.placeholder = issueConfigs[value].placeholder;
      }

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
    const targetUrl = buildAiModeUrl();
    fallbackLink.href = targetUrl;
    fallbackBox.classList.add("visible");

    window.location.href = targetUrl;
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
