
/**
 * App：置換（正規表現対応）
 */
async function replacerApp() {
    
    // 共通コンテナ生成
    const container = App.getCommonContainer("置換");

    /**
     * 設定
     */
    const config = {
        // 区切り文字
        sep: "\n",
    }

    // ショートカット
    container.tabIndex = 0;
    container.addEventListener("keydown", e=>{
        // 実行
        if(e.ctrlKey && e.key == "Enter"){
            exeButton.dispatchEvent(new Event("click"));
        }
        // ハイライトカラー リフレッシュ
        if(e.ctrlKey && (e.key == "r" || e.key == "R")){
            e.preventDefault();
            // 配列を空にする
            highlightArr.length = 0;
            fromBox.dispatchEvent(new Event("input"));
        }
    })

    // ----------------
    // region 生成
    // ----------------

    // 左右パネル
    container.style.display = "flex";
    const panelLeft = Utils.createDOM("div", "", container);
    const panelRight = Utils.createDOM("div", "", container);

    // パネルスタイル（左）
    Utils.setStyleProps(panelLeft,{
        width: "30vw",
        borderRight: "0.5px solid #ffffff",
        borderLeft: "none",
        borderTop: "none",
        borderBottom: "none",
    })

    // パネルスタイル（右）
    Utils.setStyleProps(panelRight,{
        width: "65vw",
        border: "none",
        marginLeft: "20px",
    })

    // ===========
    // ターゲット
    // ===========

    // label n box n infoコンテナ
    const targetContainer = Utils.createDOM("div", "", panelLeft);
    Utils.setStyleProps(targetContainer, {
        width: "90%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
    })

    // label
    Utils.createDOM("div", "simple-label", targetContainer, "■ Target");

    // box
    const targetBox = Utils.createDOM("textarea", "simple-textarea", targetContainer);
    Utils.setStyleProps(targetBox,{
        width: "100%",
        height: "40%",
    })
    targetBox.placeholder = "今日の天気は晴れです";
    targetBox.spellcheck = false;
    targetBox.autoComplete = false;

    // ヒット数
    const hitLabelContainer = Utils.createDOM("div", "simple-label", targetContainer, "ヒット数：");
    Utils.setStyleProps(hitLabelContainer, {
        marginTop: "10px",
        marginLeft: "auto",// 右寄せ
        fontSize: "12px",
    })
    const hitLabel = Utils.createDOM("label", "simple-label", hitLabelContainer, "");

    // label
    const sepLabel = Utils.createDOM("div", "simple-label", targetContainer, "■ 区切り文字");
    Utils.setStyleProps(sepLabel, {
        marginTop: "10px",
    })

    // box
    const sepSetter = Utils.createDOM("select", "simple-select", targetContainer);
    Utils.setStyleProps(sepSetter, {
        marginTop: "10px",
    })
    const sepEnter = Utils.createDOM("option", "simple-option", sepSetter, "改行");
    sepEnter.value = "\n";
    const sepAt = Utils.createDOM("option", "simple-option", sepSetter, "@@@");
    sepAt.value = "@@@";
    sepSetter.value = config.sep;

    // 前回value
    let prevSepValue = sepSetter.value;

    // 区切り文字変更
    sepSetter.onchange = ()=> {
        // 設定
        config.sep = sepSetter.value;
        // 入力置換
        fromBox.value = fromBox.value.replaceAll(prevSepValue, sepSetter.value);
        fromBox.placeholder = fromBox.placeholder.replaceAll(prevSepValue, sepSetter.value);
        toBox.value = toBox.value.replaceAll(prevSepValue, sepSetter.value);
        toBox.placeholder = toBox.placeholder.replaceAll(prevSepValue, sepSetter.value);
        fromBox.dispatchEvent(new Event("input"));
        toBox.dispatchEvent(new Event("input"));
        // 保存
        prevSepValue = sepSetter.value;
    }

    // ハイライトパネル
    const highlightPanel = Utils.createDOM("div", "", targetContainer);
    Utils.setStyleProps(highlightPanel, {
        width: "100%",
        height: "45%",
        maxHeight: "45%",
        overflowY: "auto",
        marginTop: "15px",
        background: "#0a0a0a",
        border: "1px solid #333",
    })

    // ハイライトパネル-ダブルクリックで拡大モーダル表示
    highlightPanel.oncontextmenu = (e)=> {
        e.preventDefault();
        // 共通コンテナ生成
        const clonePanel = App.getCommonContainer("ハイライトパネル", true);
        clonePanel.insertAdjacentHTML("beforeend", highlightPanel.innerHTML)
        Utils.setStyleProps(clonePanel, {
            overflowY: "auto"
        });
    }

    // 実行
    const exeButton = Utils.createDOM("button", "simple-button", targetContainer, "実行（Ctrl + Enter）");
    Utils.setStyleProps(exeButton, {
        marginTop: "70px",
    })

    // 実行アクション
    exeButton.addEventListener("click", ()=> {

        // From n To入力配列
        const fromArr = fromBox.value.split(config.sep);
        const toArr = toBox.value.split(config.sep);

        // 相関
        if(fromArr.length != toArr.length){
            Utils.fadeMassage("入力数が合っていません");
            return;
        }

        // 0件
        if(getHitCount() == 0){
            Utils.fadeMassage("置換対象がありません");
            return;
        }

        // From配列ループ
        let workIdx = 0;
        fromArr.forEach(fromParts=> {
            if(fromParts != ""){
                let val = targetBox.value;
                targetBox.value = val.replaceAll(fromParts, toArr[workIdx]);
            }
            workIdx++;
        }) 

        navigator.clipboard.writeText(targetBox.value);
        Utils.fadeMassage("コピーしました");
        fromBox.dispatchEvent(new Event("input"));
    })
    

    // ******************************
    // （From n To）横並びコンテナ
    // ******************************
    const flexContainerRight = Utils.createDOM("div", "", panelRight);
    Utils.setStyleProps(flexContainerRight, {
        width: "100%",
        height: "50%",
        display: "flex",
    })

    // ===========
    // From
    // ===========

    // label n box n tableコンテナ
    const fromContainer = Utils.createDOM("div", "", flexContainerRight);
    Utils.setStyleProps(fromContainer, {
        width: "40%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
    })

    // label
    Utils.createDOM("div", "simple-label", fromContainer, "■ From");

    // box
    const fromBox = Utils.createDOM("textarea", "simple-textarea", fromContainer);
    Utils.setStyleProps(fromBox,{
        width: "100%",
        height: "100%",
    })
    fromBox.placeholder = `今日${config.sep}晴れ`;
    fromBox.spellcheck = false;
    fromBox.autoComplete = false;

    // ===========
    // arrow
    // ===========
    const arrow = Utils.createDOM("div", "", flexContainerRight, "→");
    Utils.setStyleProps(arrow, {
        fontSize: "24px",
        marginTop: "25%",
        marginLeft: "40px",
    })

    // ===========
    // To
    // ===========

    // label n box n tableコンテナ
    const toContainer = Utils.createDOM("div", "", flexContainerRight);
    Utils.setStyleProps(toContainer, {
        width: "40%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        marginLeft: "20px",
    })

    // label
    Utils.createDOM("div", "simple-label", toContainer, "■ To");

    // box
    const toBox = Utils.createDOM("textarea", "simple-textarea", toContainer);
    Utils.setStyleProps(toBox,{
        width: "100%",
        height: "100%",
    })
    toBox.placeholder = `明日${config.sep}雨`;
    toBox.spellcheck = false;
    toBox.autoComplete = false;

    //**********************
    // From n To テーブル
    //**********************
    const fromToFotter = Utils.createDOM("div", "", panelRight);
    Utils.setStyleProps(fromToFotter,{
        width: "90%",
        height: "45%",
        marginTop: "15px",
        overflowY: "auto",
        overflowX: "hidden",
        // border: "solid 1px white",
    })


    // 初期フォーカス
    targetBox.focus();
    
    // ---------------------
    // region イベント設置
    // ---------------------
    
    /**
     * ボックス入力イベント
     */
    [targetBox, fromBox, toBox].forEach(box=> {
        // 表 + 情報を作成
        box.addEventListener("input", (e)=> updateFotter())
    })


    // ----------------
    // region 関数
    // ----------------

    // 入力状況から表・情報を作成（件数 + ハイライト）
    function updateFotter(){

        // ハイライト作成
        highlightView();

        // From n Toテーブル作成
        createFromToTable();

        // ヒット数更新
        showHitCount(); 

    }

    /**
     * Fromテーブル更新
     */
    let focusKey = "";
    function createFromToTable(scrollMax = true){
        // クリア
        fromToFotter.innerHTML = "";

        // 入力配列
        const fromArr = fromBox.value.split(config.sep);
        const toArr = toBox.value.split(config.sep);

        // 余分行
        let add = 1;
        if(fromBox.value == "") add = 0; // ブランクでも１カウントされるため回避

        // 出力行数（+ 余分行）
        const maxLen = fromArr.length;
        const maxRow = maxLen + add;

        // テーブル
        const table = Utils.createDOM("table", "simple-table", fromToFotter);

        // テーブルヘッダ
        const thead = Utils.createDOM("thead", "simple-thead", table);
        const headerTr = Utils.createDOM("tr", "simple-tr", thead);
        ["From", "To", "Hit"].forEach(colName=>{
            const th = Utils.createDOM("th", "simple-th", headerTr, colName);
        })

        // テーブルボディ
        const tbody = Utils.createDOM("tbody", "simple-tbody", table);
        for(let loopCnt = 1; loopCnt <= maxRow; loopCnt++){

            // 配列インデックス参照
            let index = loopCnt -1;

            // 行作成
            const tr = Utils.createDOM("tr", "simple-tr", tbody);

            // カウンタ用に保持
            let fromVal = "";

            // From n Toループ
            const types = {From: "From", To: "To", Hit: "Hit"};
            Object.entries(types).forEach(([k, v]) =>{
                // 初期値
                let value;

                // td作成
                const td = Utils.createDOM("td", "simple-td", tr);
                const textarea = Utils.createDOM("textarea", "simple-textarea", td);
                
                if(v==types.From){
                    // From
                    value = (fromArr.length-1 >= index) ? fromArr[index] : "";
                    fromVal = value;
                }else if(v==types.To){
                    // To
                    value = (toArr.length-1 >= index) ? toArr[index] : "";
                }else if(v==types.Hit){
                    // Counter
                    value = "";
                }

                // props
                textarea.value = value;
                textarea.dataset.type = v; // type（From or To）
                const boxKey = v + loopCnt; // key（type + rowNo）
                textarea.dataset.key = boxKey;
                textarea.spellcheck = false; 
                textarea.autoComplete = false; 
                // ヒット列
                if(v == types.Hit){
                    // 非活性
                    textarea.disabled = true;
                    Utils.setStyleProps(textarea, {
                        backgroundColor: "#222222",
                    })
                    // カラー参照
                    let counter = {count: 0};
                    if(fromVal != "") textarea.value = `${getHitCount(counter, fromVal)}件`;
                    // カラー分岐
                    let color = counter.count == 0 ? "#f86b6b" : "#6ba6f8"
                    Utils.setStyleProps(textarea, {
                        color: color,
                    })
                }
                // From行ハイライト
                if(v==types.From){
                    // From
                    value = (fromArr.length-1 >= index) ? fromArr[index] : "";
                    fromVal = value;
                    // ハイライト情報を取得
                    if(value){
                        let workObj = highlightArr.find(a=> a.text == value);
                        if(workObj){
                            textarea.style.backgroundColor = workObj.randomColor;
                            textarea.style.color = workObj.fontColor;
                            // 右クリックでリフレッシュ
                            td.addEventListener("contextmenu", (e)=>{
                                e.preventDefault();
                                workObj.randomColor = Utils.getHighlightColor();
                                fromBox.dispatchEvent(new Event("input"));
                            })
                        }
                    }
                }
                // 変更イベント
                if(v!=types.Hit){
                    textarea.addEventListener("change", ()=> {
                        // 各ボックスに変更を反映させる
                        let tableFromArr = Array.from(tbody.querySelectorAll(`[data-type="${types.From}"]`));
                        let tableToArr = Array.from(tbody.querySelectorAll(`[data-type="${types.To}"]`));
                        // From n Toどちらも空のペアを除外（対象インデックスを保存）
                        let brankIdxArr = [];
                        let workIdx = 0;
                        for(let i = 0; i < tableFromArr.length; i++){
                            if(!tableFromArr[i].value && !tableToArr[i].value) brankIdxArr.push(i);
                        }
                        // From
                        let workArr = [];
                        workIdx = 0;
                        tableFromArr.forEach(el=>{
                            if(!brankIdxArr.includes(workIdx)) workArr.push(el.value);
                            workIdx++;
                        })
                        let newFromText = workArr.join(config.sep);
                        // To
                        workArr = [];
                        workIdx = 0;
                        tableToArr.forEach(el=>{
                            if(!brankIdxArr.includes(workIdx)) workArr.push(el.value);
                            workIdx++;
                        })
                        let newToText = workArr.join(config.sep);
                        // From入力なら次Toにフォーカス
                        if(v == types.From && textarea.value){
                            focusKey = types.To + loopCnt;
                        }else if(v == types.To){
                            // To入力なら次の行
                            focusKey = types.From + (loopCnt+1);
                        }
                        // 代入
                        fromBox.value = newFromText;
                        toBox.value = newToText;
                        showHitCount();
                        createFromToTable(false);
                    })
                }
            })
        }

        // フォーカス
        if(focusKey){
            let nextFocus = tbody.querySelector(`[data-key="${focusKey}"]`);
            if(nextFocus) nextFocus.focus();
            focusKey = "";
        }

        // スクロール
        if(scrollMax) fromToFotter.scrollTop = fromToFotter.scrollHeight;
    }

    /**
     * ヒット数更新
     */
    function showHitCount(){
        // カラー参照
        let counter = {count: 0};
        hitLabel.innerHTML = `${getHitCount(counter)}件`;
        // カラー分岐
        let color = counter.count == 0 ? "#f86b6b" : "#6ba6f8"
        Utils.setStyleProps(hitLabel, {
            color: color,
        })
    }

    /**
     * ヒット数取得
     */
    function getHitCount(counter = null, pFromVal = fromBox.value){

        // ターゲットvalue
        const val = targetBox.value;
        
        let hitCount = 0;

        // 未入力
        if(!val || !pFromVal) {
            if(counter) counter.count = 0;
            // return "ー" ;
            return 0;
        }

        // From入力配列
        const fromArr = pFromVal.split(config.sep);

        // From配列ループ
        fromArr.forEach(fromParts=> {
            let nextStart = 0;
            if(fromParts != ""){
                while(true){
                    nextStart = val.indexOf(fromParts, nextStart);
                    if(nextStart == -1) break;
                    hitCount++;
                    nextStart += fromParts.length;
                }
            }
        })
        if(counter) counter.count = hitCount;
        return hitCount;
    }

    /**
     * ハイライト作成
     */
    // ハイライト情報配列（テーブル内でも参照するため外部で宣言）
    let highlightArr = [];
    function highlightView(){
        // クリア
        highlightPanel.innerHTML = "";
        // ハイライト情報配列
        highlightArr = Utils.getHighlightSet(targetBox.value, fromBox.value, config.sep, highlightArr);
        // 生成
        for(let workObj of highlightArr){
            let span = Utils.createDOM("span", "", highlightPanel, workObj.text);
            Utils.setStyleProps(span, {
                backgroundColor: workObj.randomColor,
                color: workObj.fontColor,
                whiteSpace: "pre-wrap", // 改行やスペースを反映
            })
        }
    }

    // 初期フッター
    updateFotter();

    // ヒット数表示
    showHitCount();
    
}