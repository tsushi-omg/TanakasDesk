
class Note {

    /**
     * クラス変数
     */
    dataObj;
    parentElement;
    settingParentElement;
    maxRow = 35;


    /**
     * コンストラクタ
     */
    constructor(pObj, pParent, pSettingParent, noteObj){
        //
        this.dataObj = pObj;
        //
        this.parentElement = pParent;
        this.settingParentElement = pSettingParent;
        //
        let config = {massage: noteObj.name};
        // 読み取り専用ノートの場合
        if(noteObj.readOnly){
            // 参照を切る
            this.dataObj = JSON.parse(JSON.stringify(pObj));
            // メッセージ加工
            config.massage += "（読み取り専用）";
        }
        //
        this.create(config);
    }


    /**
     * イベント設置
     */


    /**
     * 関数
     */

    // -----------------
    // 初期データ返却
    // -----------------
    getInitialData = ()=> {
        //
        let initialObj = {
            data: [],
            meta: {},
        }
        this.addPage(initialObj, 10);
        //
        return initialObj;
    }

    // -----------------
    // ページ追加
    // -----------------
    addPage = (pObj, addCount)=> {
        //
        const pageLength = pObj.data.length;
        const startPageNo = pageLength + 1;
        const today = Utils.getNow(true);
        //
        for(let pageIdx = startPageNo; pageIdx <= pageLength + addCount; pageIdx++){
            //
            const newPageId = Utils.getRandomString20(pObj.data, "pageId");
            pObj.data.push(
                {
                    pageId: newPageId,
                    pageNo: pageIdx,
                    createdAt: JSON.stringify(today),
                    updatedAt: JSON.stringify(today),
                    rows: []
                }
            )
            //
            for(let rowIdx = 1; rowIdx <= this.maxRow; rowIdx++){
                const currPageObj = pObj.data.find(a=> a.pageId == newPageId);
                const newRowId = Utils.getRandomString20(currPageObj.rows, "rowId");
                currPageObj.rows.push(
                    {
                        rowId: newRowId,
                        rowNo: rowIdx,
                        value: "",
                        style:{} // color: "red"
                    }
                )
            }
            //
        }
        //
    }

    /**
     * テンプレート作成元選択
     * @param {String[]} pageIdArr ページID配列
     * @param {HTMLElement[]} pageDOMArr ページDOM配列（ハイライト用, インデックス = ページ番号想定）
     * @param {String} pMsg
     * @returns 
     */
    selTemplate = (pageIdArr, pageDOMArr, pMsg)=> {
        // 選択を待つ
        return new Promise(resolve =>{

            // 選択メニュー作成
            const container = Utils.createDOM("div", "selectTemplate-container", document.body);
            Utils.setStyleProps(Utils.createDOM("div", "cc-message", container, pMsg), {
                marginTop: "10px"
            });
            const flexContainer = Utils.createDOM("div", "selectTemplate-list", container);

            // レイヤー
            const layer = Utils.createDOM("div", "custom-confirm-layer", document.body);
            layer.onclick = ()=> {
                end("");
            }

            // マウス位置へ
            container.style.left = Utils.mouseX - 350 + "px";
            container.style.top = Utils.mouseY + "px";

            // 閉じる**
            const end = (value)=> {
                // モーダル削除 & resolve
                layer.remove();
                container.remove();
                resolve(value);
                // ハイライト削除
                Utils.removeCSS("selectTemplate-pageHilight");
            }
            
            // ページループ
            let count = -1;
            for(let pageId of pageIdArr){
                count++;
                // インデックス穴埋め分
                if(pageId == "") continue;
                // ページクローン
                const pageClone = Utils.createDOM("div", "selectTemplate-pageClone", flexContainer, count);
                Utils.setStyleProps(pageClone, {
                    margin: "10px"
                })
                pageClone.onclick = ()=> {
                    end(pageId);
                }
                // 参照ページDOM
                const refPage = pageDOMArr[count];
                // 参照ページハイライト
                pageClone.onmouseenter = ()=> {
                    refPage.classList.add("selectTemplate-pageHilight");
                }
                pageClone.onmouseleave = ()=> {
                    refPage.classList.remove("selectTemplate-pageHilight");
                }
            }
        })
    }

    // ---------------------------------------------------------
    // テンプレートを保存（contentをそのままディープコピー）
    // ---------------------------------------------------------
    creTemplate = async (basePageId)=> {
        // テンプレート名
        const newName = await Utils.prompt("テンプレート名を入力してください");
        if(!newName || !newName.trim()){
            Utils.fadeMassage("中止しました");
            return;
        }
        // 対象ページ取得
        const basePageObj = this.dataObj.data.find(a=> a.pageId == basePageId);
        
        // メタデータ作成
        DATABASE.dataObj.meta.noteTemplate.push({
            name: newName,
            rows: JSON.parse(JSON.stringify(basePageObj.rows)),
            createdAt: Utils.getNow()
        })
        Utils.fadeMassage("テンプレートを作成しました")
    }

    // ---------------------------------------------------------
    // テンプレート適用
    // ---------------------------------------------------------
    attachTemplate = async (targetPageId, config = null)=> {
        
        // テンプレートなし
        if(DATABASE.dataObj.meta.noteTemplate.length == 0){
            Utils.fadeMassage("テンプレートがありません");
            return;
        }

        // テンプレート一覧からソースを取得
        let order = [];
        for(let metaObj of DATABASE.dataObj.meta.noteTemplate){
            order.push({ printName: metaObj.name + `（${metaObj.createdAt}）`, icon: Icon.copy, func: ()=> attach(metaObj) });
        }
        Utils.createMenu(order, true);

        // 適用関数
        const attach = async (baseObj)=> {
            if(! await Utils.confirm("現在の編集は失われます。続行しますか？")) {
                Utils.fadeMassage("中止しました")
                return;
            }
            // 実行
            const targetObj = this.dataObj.data.find(a=> a.pageId == targetPageId);
            targetObj.rows = baseObj.rows;
            this.create(config);
            Utils.fadeMassage("テンプレートを適用しました")
        }
    }

    // -----------------
    // プロパティ初期化
    // -----------------
    initProp = (pObj, propName, initialVal)=> {
        if(!pObj.hasOwnProperty(propName)){
            pObj[propName] = initialVal;
        }
    }
    
    // -----------------
    // UI構築
    // -----------------
    create = async (configOption = null)=> {

        // クリア
        this.parentElement.innerHTML = "";
        this.settingParentElement.innerHTML = "";

        // 一意のID
        const noteID = "unique-file";
        const settingID = "unique-setting";

        // クリア
        if(Utils.getDOM(noteID)) Utils.getDOM(noteID).remove();
        if(Utils.getDOM(settingID)) Utils.getDOM(settingID).remove();
        
        // region 設定
        const config = {
            // 開始ページ番号
            pageStartAt: 1,
            // 表示ページ数
            visiblePages: 2,
            // メッセージ
            massage: "",
        }

        // 設定オプション
        if(configOption){
            for(let keyName in configOption){
                config[keyName] = configOption[keyName];
            }
        }

        // 空なら初期データ挿入
        if(Object.keys(this.dataObj).length == 0){
            Object.assign(this.dataObj, this.getInitialData())
        }
        
        // 
        // region note
        //
        const note = Utils.createDOM("div", "note", this.parentElement);
        note.id = noteID;

        // 左上の行（フォーカス用）
        let firstBox = null;

        // ノートにメッセージ表示
        const showMassage = (text)=> {
            //
            const msg = Utils.createDOM("div", "noteMessage", this.parentElement);
            msg.textContent = text;
            //
            msg.style.left = "50%";
            msg.style.top = "40%";
            //
            setTimeout(()=>{
                msg.classList.add("noteMessage_hide");
                setTimeout(()=> msg.remove(), 400);
            }, 700);
        }

        // メッセージ引数あり
        if(config.massage){
            showMassage(config.massage);
            config.massage = "";
        }

        // 改ページ時の共通メッセージ
        const setRepageMassage = ()=> {
            config.massage = "ページ " + config.pageStartAt + " / " + this.dataObj.data.length;
        }
        
        // ページめくりバインド
        const bindRePage = ()=> {
            //
            let prevMouseX;
            const smallPx = 20;
            const bigPx = 120;
            const biggestPx = 220;
            let handler;
            //
            note.addEventListener("contextmenu", e=> {
                e.preventDefault();
            })

            note.addEventListener("mousedown", e=> {
                // 右クリック長押し → 左右スワイプでページめくり
                if(e.button !== 2) return;
                prevMouseX = Utils.mouseX;
                //
                if(Utils.getDOM("repagePointer")) Utils.getDOM("repagePointer").remove();
                if(Utils.getDOM("repagePointer_start")) Utils.getDOM("repagePointer_start").remove();
                if(handler) document.removeEventListener("mousemove", handler)
                // 開始位置マーカー
                const startPoint = Utils.createDOM("div", "", document.body);
                startPoint.style.position = "absolute";
                startPoint.id = "repagePointer_start";
                startPoint.style.left = Utils.mouseX + "px";
                startPoint.style.top = Utils.mouseY + "px";
                startPoint.innerHTML = Icon.repagePointer_origin;
                // ポインター
                const repagePointer = Utils.createDOM("div", "", document.body);
                repagePointer.style.position = "absolute";
                repagePointer.id = "repagePointer";
                repagePointer.addEventListener("contextmenu", e=> ( e.preventDefault() ));
                handler = ()=> moveWithMouse(repagePointer);
                document.addEventListener("mousemove", handler)
            })

            const moveWithMouse = (el)=> {
                //
                el.style.left = Utils.mouseX + "px";
                el.style.top = Utils.mouseY + "px";
                //
                const diff = parseInt(prevMouseX) - parseInt(Utils.mouseX);
                const bigSwipe = Math.abs(diff) > bigPx;
                const biggestSwipe = Math.abs(diff) > biggestPx;
                // const goNext = diff < 0;
                const goNext = diff >= 0;

                // アイコン変化
                // if(Math.abs(diff) < smallPx) el.innerHTML = ""
                // else if(goNext){
                //     if(biggestSwipe) el.innerHTML = Icon.repagePointer_biggest;
                //     // else if(bigSwipe) el.innerHTML = Icon.repagePointer_big;
                //     else el.innerHTML = Icon.repagePointer;
                // }else{
                //     if(biggestSwipe) el.innerHTML = Icon.repagePointer_left_biggest;
                //     // else if(bigSwipe) el.innerHTML = Icon.repagePointer_left_big;
                //     else el.innerHTML = Icon.repagePointer_left;
                // }

                // ハンド
                if(Math.abs(diff) < smallPx) el.innerHTML = ""
                if(biggestSwipe) el.innerHTML = Utils.replaceFillColor(Icon.hand, "#4ebef1")
                else el.innerHTML = Icon.hand;

                // ページめくり風
                if(Math.abs(diff) < smallPx) Utils.removeCSS("repaging");
                else if(goNext){
                    Utils.setOnlyStyle(createdPageArr[config.visiblePages], "repaging")
                }else{
                    Utils.setOnlyStyle(createdPageArr[1], "repaging")
                }
            }
            
            note.addEventListener("mouseup", e=> {
                // 右クリック長押し → 左右スワイプでページめくり
                if(e.button !== 2) return;
                //
                Utils.getDOM("repagePointer").remove();
                Utils.getDOM("repagePointer_start").remove();
                document.removeEventListener("mousemove", handler)
                // ページめくり風remove
                Utils.removeCSS("repaging");
                // 移動幅
                let diff = parseInt(prevMouseX) - parseInt(Utils.mouseX);
                if(Math.abs(diff) > smallPx){
                    // 
                    const bigSwipe = Math.abs(diff) > bigPx;
                    const biggestSwipe = Math.abs(diff) > biggestPx;
                    // const goNext = diff < 0;
                    const goNext = diff >= 0;
                    // range
                    // 通常スワイプ
                    const range = {prev:config.visiblePages, next:config.visiblePages};
                    // if(bigSwipe){
                    //     // 中スワイプ
                    //     range.prev = config.visiblePages * 2;
                    //     range.next = config.visiblePages * 2;
                    // }
                    if(biggestSwipe){
                        // 大スワイプ
                        range.prev = config.visiblePages * 3;
                        range.next = config.visiblePages * 3;
                    }
                    // next
                    const lastBisibleNo = config.pageStartAt + config.visiblePages -1;
                    while(true){
                        if(lastBisibleNo + range.next > this.dataObj.data.length){
                            range.next--;
                        }else break;
                    }
                    // prev
                    while(true){
                        if(config.pageStartAt - range.prev <= 0){
                            range.prev--;
                        }else break;
                    }
                    // ページめくり不可
                    if(goNext){
                        if(range.next == 0) {
                            showMassage("最終ページ");
                            return;
                        };
                    }else if(range.prev == 0) {
                        showMassage("先頭ページ");
                        return;
                    };
                    //
                    config.pageStartAt = goNext ? 
                        (config.pageStartAt + range.next)
                        :
                        (config.pageStartAt - range.prev);
                    //
                    setRepageMassage();
                    // 
                    this.create(config);
                }
            })
        }
        bindRePage();
        //
        // 生成済みページ数
        let createdPageCnt = 0;
        // ページDOM挿入（ページ数同期）
        let createdPageArr = [null];
        let createdPageIDArr = [""];
        //
        // region page
        //
        const pageObjArr = this.dataObj.data.filter(a=> a.pageNo >= config.pageStartAt)
        //
        for(let pageObj of pageObjArr){
            //
            const page = Utils.createDOM("div", "page", note);
            createdPageArr.push(page);
            createdPageIDArr.push(pageObj.pageId);
            //
            // region row
            //
            for(let rowObj of pageObj.rows){
                //
                const rowContainer = Utils.createDOM("div", "rowContainer", page);
                const box = Utils.createDOM("input", "rowInput", rowContainer);
                //
                const rowKey = "note-page-row-box-" + pageObj.pageId + "-";
                box.type = "text";
                box.dataset.key = rowKey + rowObj.rowNo;
                // カラードロップ用にキーを埋め込み
                box.dataset.pageId = pageObj.pageId;
                box.dataset.rowId = rowObj.rowId;

                box.value = rowObj.value;
                //
                // 配列に変換
                Object.entries(rowObj.style).forEach(([key, value])=> {
                    box.style[key] = value;
                })
                //
                if(!firstBox) firstBox = box;
                /**
                 * ドロップで文字色変更（見た目）
                 */
                box.addEventListener("dragover",(e)=>{
                    e.preventDefault();
                    box.classList.add("dragover-explorer");
                });
                box.addEventListener("dragleave",(e)=>{
                    e.preventDefault();
                    box.classList.remove("dragover-explorer");
                });

                box.addEventListener("drop",(e)=>{
                    box.classList.remove("dragover-explorer");
                    // 同一キーで取り出し
                    const color = e.dataTransfer.getData("textColor");
                    if(!color) return;
                    const selectedArr = Utils.getSelectedElements("rowInput");
                    // 範囲選択アリ
                    if(selectedArr.length >= 2){
                        selectedArr.forEach(el=>{
                            el.style.color = color;
                            // 更新
                            let workObj = this.dataObj.data.find(a=> a.pageId == el.dataset.pageId).rows
                                                .find(b=> b.rowId == el.dataset.rowId);
                            workObj.style.color = color;
                        })
                    }else{
                        // 範囲選択なし
                        box.style.color = color;
                        // 更新
                        rowObj.style.color = color;
                    }
                });
                /**
                 * ペースト
                 */
                box.addEventListener("paste", e=> {
                    // ペースト：改行処理
                    const text = e.clipboardData.getData("text");
                    if(text){
                        e.preventDefault();
                        //
                        const arr = text.split("\n");
                        let nextRowNo = rowObj.rowNo;
                        //
                        for(let val of arr){
                            const targetBox = document.querySelector(`[data-key="${rowKey + nextRowNo}"]`);
                            // アクティブならカーソル位置に挿入
                            if(targetBox == box){
                                let startSel = box.selectionStart;
                                let endSel = box.selectionEnd;
                                box.value = box.value.slice(0, startSel) + val + box.value.slice(endSel);
                            }else{
                                targetBox.value = val;
                            }
                            targetBox.dispatchEvent(new Event("change"));
                            //
                            nextRowNo++;
                            if(nextRowNo > this.maxRow) break;
                        }
                    }
                })
                //
                // region ショートカットキー
                //
                box.addEventListener("keydown", (e)=> {
                    // フォーカスアップ（arrow or enter）
                    if((e.key == "ArrowUp" && !e.shiftKey && !e.altKey) || (e.key == "Enter" && e.shiftKey)){
                        if(rowObj.rowNo == 1) return;
                        const prevRowBox = document.querySelector(`[data-key="${rowKey + (rowObj.rowNo - 1)}"]`);
                        prevRowBox.focus();
                    }
                    // フォーカスダウン（arrow or enter）
                    if((e.key == "ArrowDown" && !e.shiftKey && !e.altKey) || (e.key == "Enter" && !e.shiftKey)){
                        if(rowObj.rowNo == this.maxRow) return;
                        const nextRowBox = document.querySelector(`[data-key="${rowKey + (rowObj.rowNo + 1)}"]`);
                        nextRowBox.focus();
                    }
                    // 次ページ（alt >）
                    if(e.key == "ArrowRight" && e.altKey){
                        e.preventDefault();
                        goNextPage();
                    }
                    // 前ページ（alt <）
                    if(e.key == "ArrowLeft" && e.altKey){
                        e.preventDefault();
                        goPrevPage();
                    } 
                    // 表示数＋＋（alt ↑）
                    if(e.key == "ArrowUp" && e.altKey){
                        if(config.visiblePages == 4){
                            showMassage("最大表示数に到達");
                            return;
                        }
                        config.visiblePages++;
                        config.massage = "表示数を" + config.visiblePages + "枚に変更";
                        this.create(config);
                    }
                    // 表示数ーー（alt ↓）
                    if(e.key == "ArrowDown" && e.altKey){
                        if(config.visiblePages == 1){
                            showMassage("最小表示数に到達");
                            return;
                        }
                        config.visiblePages--;
                        config.massage = "表示数を" + config.visiblePages + "枚に変更";
                        this.create(config);
                    } 
                    // Tab挿入
                    if (e.key === "Tab") {
                        e.preventDefault();
                        const start = box.selectionStart;
                        const end = box.selectionEnd;
                        const value = box.value;
                        box.value =
                        value.substring(0, start) +
                        "\t" +
                        value.substring(end);
                        // カーソルを1文字後ろへ（st-edだが同じにすると選択でなくなる）
                        box.setSelectionRange(start + 1, start + 1);
                        // 更新
                        box.dispatchEvent(new Event("change"));
                    }
                })
                //
                box.onchange = ()=> rowObj.value = box.value;
            }
            //
            const pageLabel = Utils.createDOM("div", "pageLabel", page);
            pageLabel.innerHTML = "ページ " + pageObj.pageNo + " / " + this.dataObj.data.length;
            //
            /**
             * ページイベント
             */
            //
            createdPageCnt++;
            if(createdPageCnt == config.visiblePages) break;
        }
        // region Page End

        /**
        // region 範囲選択
         */
        {
            // boxを範囲選択可能にする
            let selectionCallback;
            {
                let order = [
                    { printName: "テキストをコピー", icon: Icon.copy, func: ()=> selectionCopy() },
                    { printName: "消しゴムで消す", icon: Icon.eraser, func: ()=> selectionDelete() },
                ];
                selectionCallback = ()=> Utils.createMenu(order, true);
            }
            Binder.bindRangeSelection("rowInput", {callback: selectionCallback, eventName: "mouseup"});

            /**
             * 範囲選択関数：コピー
             */
            const selectionCopy = ()=> {
                // 取得
                const selectedArr = Utils.getSelectedElements("rowInput");
                // テキスト連結
                let copiedText = "";
                selectedArr.forEach(el=>{
                    copiedText += el.value + "\n";
                })
                copiedText.trimEnd("\n");
                // コピー
                navigator.clipboard.writeText(copiedText);
            }

            /**
             * 範囲選択関数：消しゴム（テキストクリア）
             */
            const selectionDelete = ()=> {
                // 取得
                const selectedArr = Utils.getSelectedElements("rowInput");
                // テキストクリア
                selectedArr.forEach(el=>{
                    el.value = "";
                    el.dispatchEvent(new Event("change"));
                })
            }
        }

        /**
         * 次ページ関数
         */
        const goNextPage = ()=> {
            // 
            const lastPage = config.pageStartAt + config.visiblePages -1;
            if(lastPage == this.dataObj.data.length){
                showMassage("最終ページ");
                return;
            }
            // 可視ページめくり
            config.pageStartAt += config.visiblePages;
            while(true){
                if(config.pageStartAt > this.dataObj.data.length){
                    config.pageStartAt--;
                }else break;
            }
            setRepageMassage();
            //
            this.create(config);
        }
        /**
         * 前ページ関数
         */
        const goPrevPage = ()=> {
            //
            if(config.pageStartAt == 1){
                showMassage("先頭ページ");
                return;
            }
            // 可視ページめくり
            config.pageStartAt -= config.visiblePages;
            while(true){
                if(config.pageStartAt <= 0){
                    config.pageStartAt++;
                }else break;
            }
            setRepageMassage();
            //
            this.create(config);
        }

        /**
        // region 操作パネル 
         */
        const createSettingPanel = ()=> {

            // 右側設定パネル
            const settingPanel = Utils.createDOM("div", "settingPanel", this.settingParentElement);
            settingPanel.id = settingID;

            // タイトル
            const panelTitle = Utils.createDOM("div", "settingPanelTitle", settingPanel);
            panelTitle.textContent = "設定";

            // 表示ページ数エリア
            const pageCountArea = Utils.createDOM("div", "settingItem", settingPanel);

            const pageCountLabel = Utils.createDOM("div", "settingLabel", pageCountArea);
            pageCountLabel.textContent = "表示ページ数";

            // コントロール
            const pageCountControl = Utils.createDOM("div", "pageCountControl", pageCountArea);

            const pageCountPrev = Utils.createDOM("div", "pageArrow", pageCountControl);
            pageCountPrev.textContent = "◀";

            const pageCountValue = Utils.createDOM("div", "pageCountValue", pageCountControl);
            pageCountValue.textContent = config.visiblePages;

            const pageCountNext = Utils.createDOM("div", "pageArrow", pageCountControl);
            pageCountNext.textContent = "▶";

            const updatePageCount = (delta)=>{
                let val = Number(config.visiblePages);
                val += delta;
                //
                if(val < 1) val = 4;
                if(val > 4) val = 1;
                //
                config.visiblePages = val;
                config.pageStartAt = 1;
                this.create(config);
            }

            pageCountPrev.addEventListener("click", () => updatePageCount(-1));
            pageCountNext.addEventListener("click", () => updatePageCount(1));

        
            // ページ移動
            const pageMoveArea = Utils.createDOM("div", "settingItem", settingPanel);

            const pageMoveLabel = Utils.createDOM("div", "settingLabel", pageMoveArea);
            pageMoveLabel.textContent = "ページ移動";

            // コントロール
            const pageMoveControl = Utils.createDOM("div", "pageCountControl", pageMoveArea);

            const pageMovePrev = Utils.createDOM("div", "pageArrow", pageMoveControl);
            pageMovePrev.textContent = "◀";

            const pageMoveValue = Utils.createDOM("div", "pageCountValue", pageMoveControl);
            pageMoveValue.textContent = config.pageStartAt + " / " + this.dataObj.data.length;

            const pageMoveNext = Utils.createDOM("div", "pageArrow", pageMoveControl);
            pageMoveNext.textContent = "▶";

            pageMoveNext.addEventListener("click", () => goNextPage());
            pageMovePrev.addEventListener("click", () => goPrevPage());

            // ショートカット説明
            const shortcutArea = Utils.createDOM("div", "shortcutArea", settingPanel);

            const shortcutToggle = Utils.createDOM("div", "shortcutToggle", shortcutArea);
            shortcutToggle.textContent = "ショートカット";

            const shortcutContent = Utils.createDOM("div", "shortcutContent", shortcutArea);

            shortcutContent.innerHTML = `
            Alt + ←→ : ページ送り<br>
            右クリックドラッグ : ページ送り<br>
            Alt + ↑↓ : 表示数変更
            `;

            // 開閉
            shortcutToggle.addEventListener("click", () => {
                shortcutContent.classList.toggle("open");
            });

            // region ペンケース
            const pencilCaseArea = Utils.createDOM("div", "pencilCaseArea", settingPanel);

            const pencilCaseTitle = Utils.createDOM("div", "settingLabel", pencilCaseArea);
            pencilCaseTitle.textContent = "ペンケース";

            const pencilList = Utils.createDOM("div", "pencilList", pencilCaseArea);

            const colors = [
                "#222",
                "#e74c3c",
                "#3498db",
                "#2ecc71",
                "#f1c40f",
                "#9b59b6"
            ];

            colors.forEach(color => {

                const pencil = Utils.createDOM("div","pencilItem",pencilList);
                pencil.draggable = true;

                pencil.innerHTML = Icon.pencil;

                const svg = pencil.querySelector("svg");
                svg.style.color = color;

                pencil.dataset.color = color;

                pencil.addEventListener("dragstart",(e)=>{
                    e.dataTransfer.setData("textColor", color);
                });

            });

            // ページ追加ボタン
            const addPageBtn = Utils.createDOM("button", "addPageBtn", settingPanel, "ページ追加");
            Utils.setStyleProps(addPageBtn, {marginTop: "20px"},)
            addPageBtn.onclick = ()=> {
                this.addPage(this.dataObj, 1);
                config.pageStartAt++;
                this.create(config);
            }

            // テンプレート作成ボタン
            const createTemplateBtn = Utils.createDOM("button", "addPageBtn", settingPanel, "テンプレートを作成");
            createTemplateBtn.onclick = async ()=> {
                // ソースページを選択
                const selectedPageId = await this.selTemplate(createdPageIDArr, createdPageArr, "ソースを選択してください");
                // 選択なし
                if(!selectedPageId) {
                    Utils.fadeMassage("中止しました")
                    return;
                }
                // テンプレート作成
                this.creTemplate(selectedPageId);
            }

            // テンプレート適用ボタン
            const loadTemplateBtn = Utils.createDOM("button", "addPageBtn", settingPanel, "テンプレートを適用");
            loadTemplateBtn.onclick = async ()=> {
                // 適用対象を選択
                const targetPageId = await this.selTemplate(createdPageIDArr, createdPageArr, "適用先のページを選択してください");
                // 選択なし
                if(!targetPageId) {
                    Utils.fadeMassage("中止しました")
                    return;
                }
                // テンプレート適用
                this.attachTemplate(targetPageId, config);
            }
        }
        // 設定パネル作成
        createSettingPanel();

        // フォーカス
        if(firstBox) firstBox.focus();
    }
}