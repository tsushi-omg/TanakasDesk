/**
 * App：正規表現メーカー & シミュレーター (Regex Builder & Simulator)
 */
async function regexMakerApp() {
    
    // 共通コンテナ生成
    const container = App.getCommonContainer("正規表現メーカー");

    /**
     * 設定
     */
    const config = {
        defaultRegex: "//g"
    }

    // ショートカット設定
    container.tabIndex = 0;
    container.addEventListener("keydown", e => {
        // Ctrl + Enter でテスト実行
        if (e.ctrlKey && e.key == "Enter") {
            testButton.dispatchEvent(new Event("click"));
        }
    });

    // ----------------
    // region 画面生成
    // ----------------

    // 左右パネルの作成
    container.style.display = "flex";
    const panelLeft = Utils.createDOM("div", "", container);
    const panelRight = Utils.createDOM("div", "", container);

    // パネルスタイル（左：シミュレーターエリア）
    Utils.setStyleProps(panelLeft, {
        width: "40vw",
        borderRight: "0.5px solid #ffffff",
        borderLeft: "none",
        borderTop: "none",
        borderBottom: "none",
        paddingRight: "15px"
    });

    // パネルスタイル（右：メーカーエリア）
    Utils.setStyleProps(panelRight, {
        width: "55vw",
        border: "none",
        marginLeft: "20px",
        display: "flex",
        flexDirection: "column"
    });

    // ==========================================
    // 左パネル：シミュレーター (Target & Results)
    // ==========================================

    const leftContainer = Utils.createDOM("div", "", panelLeft);
    Utils.setStyleProps(leftContainer, {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
    });

    // 対象テキストラベル＆入力欄
    Utils.createDOM("div", "simple-label", leftContainer, "■ テストしたい文字列（対象テキスト）");
    const testInputBox = Utils.createDOM("textarea", "simple-textarea", leftContainer);
    Utils.setStyleProps(testInputBox, {
        width: "100%",
        height: "25%",
        marginBottom: "10px"
    });
    testInputBox.value = "  MOVE      IN1-KYKCD       TO  OT1-KYKCD   MOVE      IN1-KYKCD       TO  OT1-KYKCD ";
    testInputBox.spellcheck = false;
    testInputBox.autoComplete = false;

    // テスト実行ボタン
    const testButton = Utils.createDOM("button", "simple-button", leftContainer, "テスト実行 (Ctrl + Enter)");
    Utils.setStyleProps(testButton, {
        width: "100%",
        marginBottom: "15px",
        backgroundColor: "#2563eb",
        color: "#ffffff"
    });

    // マッチ結果ラベル
    Utils.createDOM("div", "simple-label", leftContainer, "■ マッチ結果");

    // マッチ結果出力パネル（旧ハイライトパネルの枠を活用）
    const resultPanel = Utils.createDOM("div", "", leftContainer);
    Utils.setStyleProps(resultPanel, {
        width: "100%",
        height: "55%",
        maxHeight: "55%",
        overflowY: "auto",
        background: "#0a0a0a",
        border: "1px solid #333",
        padding: "10px",
        fontFamily: "monospace",
        fontSize: "13px",
        whiteSpace: "pre-wrap"
    });
    resultPanel.innerHTML = "ここに結果が表示されます。";

    // 右クリックで別ウインドウ拡大表示する機能も継承
    resultPanel.oncontextmenu = (e) => {
        e.preventDefault();
        const clonePanel = App.getCommonContainer("マッチ結果（拡大）", true);
        clonePanel.insertAdjacentHTML("beforeend", resultPanel.innerHTML);
        Utils.setStyleProps(clonePanel, { overflowY: "auto", background: "#0a0a0a", padding: "15px" });
    };


    // ==========================================
    // 右パネル：正規表現メーカー (Maker & Parts)
    // ==========================================

    // すべてのマッチを取得 (gフラグ) チェックボックスのコンテナ
    const gCheckContainer = Utils.createDOM("div", "", panelRight);
    Utils.setStyleProps(gCheckContainer, {
        display: "flex",
        alignItems: "center",
        marginBottom: "10px"
    });

    const gCheckbox = Utils.createDOM("input", "", gCheckContainer);
    gCheckbox.type = "checkbox";
    gCheckbox.id = "globalMatchCheck";
    gCheckbox.checked = true;
    Utils.setStyleProps(gCheckbox, { width: "16px", height: "16px", cursor: "pointer" });

    const gLabel = Utils.createDOM("label", "", gCheckContainer, " すべてのマッチを取得 (gフラグ)");
    gLabel.htmlFor = "globalMatchCheck";
    Utils.setStyleProps(gLabel, { fontSize: "13px", marginLeft: "5px", cursor: "pointer", userSelect: "none" });

    // 操作用横並びコンテナ (入力欄 + クリア + コピー)
    const actionContainer = Utils.createDOM("div", "", panelRight);
    Utils.setStyleProps(actionContainer, {
        width: "100%",
        display: "flex",
        gap: "5px",
        marginBottom: "15px"
    });

    // メインの正規表現入力ボックス
    const regexInput = Utils.createDOM("input", "simple-input", actionContainer);
    regexInput.type = "text";
    regexInput.value = config.defaultRegex;
    Utils.setStyleProps(regexInput, {
        flex: "1",
        fontFamily: "monospace",
        padding: "8px"
    });

    // クリアボタン
    const clearButton = Utils.createDOM("button", "simple-button", actionContainer, "クリア");
    Utils.setStyleProps(clearButton, { backgroundColor: "#444444", color: "#ffffff" });

    // コピーボタン
    const copyButton = Utils.createDOM("button", "simple-button", actionContainer, "コピー");
    Utils.setStyleProps(copyButton, { backgroundColor: "#1e293b", color: "#ffffff" });


    // ------------------------------------------
    // 正規表現パーツテーブルの生成
    // ------------------------------------------
    const tableContainer = Utils.createDOM("div", "", panelRight);
    Utils.setStyleProps(tableContainer, { width: "100%", overflowY: "auto" });

    const table = Utils.createDOM("table", "simple-table", tableContainer);
    const thead = Utils.createDOM("thead", "simple-thead", table);
    const headerTr = Utils.createDOM("tr", "simple-tr", thead);
    
    ["説明", "非マッチグループ", "マッチグループ"].forEach(colName => {
        Utils.createDOM("th", "simple-th", headerTr, colName);
    });

    const tbody = Utils.createDOM("tbody", "simple-tbody", table);

    // テーブルに載せるパーツデータ定義
    const partsData = [
        { desc: "1つ以上の空白", noMatch: "\\s+", match: "(\\s+)" },
        // { desc: "0個以上の空白", noMatch: "\\s*", match: "(\\s*)" },
        { desc: "任意の文字列（最短）", noMatch: ".+?", match: "(.+?)" }
    ];

    // テーブルの行生成とイベント付与
    partsData.forEach(data => {
        const tr = Utils.createDOM("tr", "simple-tr", tbody);
        tr.style.cursor = "pointer";

        // 説明列
        Utils.createDOM("td", "simple-td", tr, data.desc);

        // 非マッチグループ列
        const tdNoMatch = Utils.createDOM("td", "simple-td", tr, data.noMatch);
        Utils.setStyleProps(tdNoMatch, { color: "#6ba6f8", fontWeight: "bold", fontFamily: "monospace" });
        tdNoMatch.dataset.val = data.noMatch;

        // マッチグループ列
        const tdMatch = Utils.createDOM("td", "simple-td", tr, data.match);
        Utils.setStyleProps(tdMatch, { color: "#4ade80", fontWeight: "bold", fontFamily: "monospace" });
        tdMatch.dataset.val = data.match;

        // セルクリック時の個別挿入イベント
        [tdNoMatch, tdMatch].forEach(td => {
            td.addEventListener("click", (e) => {
                e.stopPropagation(); // 行全体のイベント発火を防止
                insertRegexPart(td.dataset.val);
            });
        });

        // 行全体をクリックした場合は、デフォルトで「非マッチグループ」を挿入する親切設計
        tr.addEventListener("click", () => {
            insertRegexPart(data.noMatch);
        });
    });


    // 初期フォーカス設定（/と/gの間にカーソルを持っていく）
    setTimeout(() => {
        regexInput.setSelectionRange(1, 1);
        regexInput.focus();
    }, 100);


    // ---------------------
    // region イベントロジック
    // ---------------------

    // ① gフラグチェックボックス切り替え
    gCheckbox.addEventListener("change", () => {
        let currentVal = regexInput.value;
        if (gCheckbox.checked) {
            if (currentVal.endsWith("/")) regexInput.value = currentVal + "g";
        } else {
            if (currentVal.endsWith("/g")) regexInput.value = currentVal.slice(0, -1);
        }
        regexInput.focus();
    });

    // ② クリアボタン
    clearButton.addEventListener("click", () => {
        regexInput.value = gCheckbox.checked ? "//g" : "//";
        regexInput.setSelectionRange(1, 1);
        regexInput.focus();
    });

    // ③ コピーボタン（フェードメッセージ連携）
    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(regexInput.value).then(() => {
            Utils.fadeMassage("コピーしました");
        }).catch(err => {
            console.error("コピー失敗:", err);
        });
    });

    // ④ パーツ挿入共通関数（エスケープ内に安全に差し込む）
    function insertRegexPart(insertText) {
        const currentText = regexInput.value;
        const startPos = regexInput.selectionStart;
        const endPos = regexInput.selectionEnd;

        let firstSlash = currentText.indexOf('/');
        let lastSlash = currentText.lastIndexOf('/');

        // スラッシュ破損時のセーフガード
        if (firstSlash === -1 || lastSlash === -1 || firstSlash === lastSlash) {
            regexInput.value = '/' + insertText + '/' + (gCheckbox.checked ? 'g' : '');
            regexInput.focus();
            return;
        }

        // 挿入位置をスラッシュの内側に強制補正
        let targetStart = startPos;
        let targetEnd = endPos;
        if (startPos <= firstSlash || startPos > lastSlash) targetStart = lastSlash;
        if (endPos <= firstSlash || endPos > lastSlash) targetEnd = lastSlash;

        regexInput.value = 
            currentText.substring(0, targetStart) + 
            insertText + 
            currentText.substring(targetEnd);

        // カーソル位置を挿入文字の直後に移動させて再フォーカス
        const newCursorPos = targetStart + insertText.length;
        regexInput.setSelectionRange(newCursorPos, newCursorPos);
        regexInput.focus();
    }

    // ⑤ 🚀 シミュレーター：テスト実行ロジック
    testButton.addEventListener("click", () => {
        testButton.focus();

        const patternStr = regexInput.value;
        const targetText = testInputBox.value;

        // スラッシュとフラグの分離分離
        const firstSlash = patternStr.indexOf('/');
        const lastSlash = patternStr.lastIndexOf('/');

        if (firstSlash === -1 || lastSlash === -1 || firstSlash === lastSlash) {
            resultPanel.innerHTML = `<span style="color: #f86b6b;">エラー: 正規表現の形式（/パターン/フラグ）が正しくありません。</span>`;
            Utils.fadeMassage("正規表現の形式不正");
            return;
        }

        const corePattern = patternStr.substring(firstSlash + 1, lastSlash);
        const flags = patternStr.substring(lastSlash + 1);

        try {
            // 動的正規表現の構築 (matchAllを使用するため一時的にgフラグを保証)
            const finalFlags = flags.includes('g') ? flags : flags + 'g';
            const regObj = new RegExp(corePattern, finalFlags);
            const matches = [...targetText.matchAll(regObj)];

            if (matches.length === 0) {
                resultPanel.innerHTML = `<span style="color: #fbbf24;">一致するパターンが見つかりませんでした (0件)</span>`;
                Utils.fadeMassage("マッチなし");
                return;
            }

            // マッチ結果を綺麗に整形して出力パネルへ表示
            let htmlResult = `<span style="color: #4ade80; font-weight: bold;">🎉 ${matches.length} 件のマッチが見つかりました！</span>\n\n`;
            
            matches.forEach((match, index) => {
                htmlResult += `<span style="color: #93c5fd; font-weight: bold;">--- [マッチ #${index + 1}] ---</span>\n`;
                htmlResult += `<b>全体:</b> "${match[0]}"\n`;
                
                // キャプチャグループ ( ) が存在すればインデントして展開
                for (let i = 1; i < match.length; i++) {
                    if (match[i] !== undefined) {
                        htmlResult += `  <span style="color: #a7f3d0;">└ グループ(${i}):</span> "${match[i]}"\n`;
                    }
                }
                htmlResult += `\n`;
            });

            resultPanel.innerHTML = htmlResult;
            Utils.fadeMassage(`${matches.length}件マッチしました`);

        } catch (error) {
            // 入力途中など、構文が不完全な場合のクラッシュ防止
            resultPanel.innerHTML = `<span style="color: #f86b6b;">正規表現構文エラー: ${error.message}</span>`;
            Utils.fadeMassage("構文エラー");
        }
    });
}