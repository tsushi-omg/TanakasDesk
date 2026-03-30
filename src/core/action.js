

/**
 * データ依存共通関数
 */

// region エクスプローラーDnD
function bindDnD (itemEl, obj){

    // ドラッグ許可
    itemEl.draggable = true;

    // ドラッグデータキー（※flow.jsのエクスプローラードロップでも、別変数同じ値を使用）
    const dragDataKey = "explorer-moving";

    /**
     * ドラッグ開始イベント
     */
    itemEl.addEventListener("dragstart", e=> {

        // オブジェクトIDを運ぶ
        e.dataTransfer.setData(dragDataKey, obj.id)
    })

    // ドロップ不可メッセージ返却
    const getDropErrMsg = (movingID, movingObj)=>{

        // 自分スキップ
        if(movingID == obj.id) return "変更はありません";

        // 直親スキップ
        if(movingObj.parentId == obj.id) return "変更はありません";

        // 子要素スキップ
        if(getChildCSV(movingObj, true).includes(obj.id)) return "子要素に移動できません";

        return "";
    }

    /**
     * フォルダーのみのイベント
     */
    if(obj.type == DATABASE.types.folder){

        // ドラッグオーバー無効 n スタイル--
        itemEl.addEventListener("dragover", (e) => {
            e.preventDefault();
            itemEl.classList.add("dragover-explorer");
        });

        // ドラッグオーバースタイル--
        itemEl.addEventListener("dragleave", (e) => {
            e.preventDefault();
            itemEl.classList.remove("dragover-explorer");
        });

        // ドロップイベント--
        itemEl.addEventListener("drop", async e=> {

            // ドラッグオーバースタイルremove
            itemEl.classList.remove("dragover-explorer");

            // 受け取り
            const movingID = e.dataTransfer.getData(dragDataKey);
            if(!movingID) return;

            // 対象オブジェクト取得
            const movingObj = DATABASE.dataObj.data.find(a=> a.id == movingID);

            // ドロップ可否
            const errMsg = getDropErrMsg(movingID, movingObj);
            if(errMsg){
                Utils.fadeMassage(errMsg);
                return;
            }

            // 移動
            if(!await Utils.confirm("移動しますか？")) {
                return;
            }
            movingObj.parentId = obj.id;

            // 再描画
            build();
        })
    }
}

/**
// region デフォルトデータ最新化（パッチ）
 */
function updateDefaultData(){
    
    // ループ
    for(let defaultKey in DATABASE.defaultData){

        // 初期データオブジェクト
        const defaultData = DATABASE.defaultData[defaultKey];

        // ID検索
        let currObj = DATABASE.dataObj.data.find(a=> a.id==defaultData.id);

        if(currObj){

            // 復元用コピー
            const prevCopy = JSON.parse(JSON.stringify(currObj));

            // 既存更新
            Object.assign(currObj, defaultData);
            
            // // 上書きしない項目は復元
            // for(let unUpdateKey of DATABASE.unUpdateProps){
            //     if(defaultData.hasOwnProperty(unUpdateKey)) currObj[unUpdateKey] = prevCopy[unUpdateKey];
            // }
            
        }else{
            // なければ追加
            DATABASE.dataObj.data.push(defaultData);
        }
    }
}

/**
// region データ読み込み後 初期化処理
 */
function loadInit(){

    // ロケーションクリア
    ShareSpace.LM = new LocationManager();

    // ロケーション移動ボタン使用可否
    ShareSpace.setLocationButtonStyle();
}



/**
// region 既存データパッチ
 */
function applyPatch(){
    let attached = false;
    //------------------
    // 2026/03/27
    // ALL：メタデータ領域
    //------------------
    if(!DATABASE.dataObj.hasOwnProperty("meta")){
        DATABASE.dataObj.meta = 
        {
            // ノートテンプレート
            noteTemplate: [],
        };
        attached = true;
    }
    //------------------
    // 2026/03/30
    // ノート：付箋領域
    //------------------
    for(let workObj of DATABASE.dataObj.data.filter(a=> a.type == DATABASE.types.note)){
        let contentObj = workObj.content;
        // ノート未初期化
        if(Object.keys(contentObj).length == 0) continue;
        // ノート初期化済みなら続行
        let metaArea = contentObj.meta;
        if(!metaArea.hasOwnProperty("stickyNotes")) {
            metaArea.stickyNotes = [];
            attached = true;
        }
    }

    // 終了メッセージ
    if(attached){
        Utils.fadeMassage("パッチが適用されました");
    }
}