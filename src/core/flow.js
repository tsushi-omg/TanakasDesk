
/**
 * DB
 */
class DATABASE{

    // タイプ ※生成順序の数字-----
    static types = {
        folder: 1,
        note: 2,
        app: 3,
    }

    // ストレージキー
    storageKey = "TanakasDesk-local-storage";

    // ビルド時に上書きしない初期データプロパティ
    static unUpdateProps = [
        "closed",
        "active",
        "storageData",
    ]

    /**
    // region デフォルトデータ
     * ※idはカンマのみ不可
     */
    static defaultData = {
        /**
         * Read Me
         */
        ReadMeFolder:
        {
            type: this.types.folder,
            id: "xxx",
            name: "Read Me",
            parentId: "",
            createdAt:  Utils.getNow(true),
            closed: false,
            readOnly: true,
        },
        ReadMeManual:
        {
            type: this.types.note,
            id: "zzz",
            name: "マニュアル",
            content: GuideData.manualContentObj,
            parentId: "xxx",
            createdAt:  Utils.getNow(true),
            active: true,
            readOnly: true,
        },
        ReadMeShortCut:
        {
            type: this.types.note,
            id: "yyy",
            name: "ショートカット",
            content: GuideData.shortCutContentObj,
            parentId: "xxx",
            createdAt:  Utils.getNow(true),
            active: false,
            readOnly: true,
        },
        /**
         * Default Apps
         */
        DefaultAppsFolder:
        {
            type: this.types.folder,
            id: "Default-Apps-Folder",
            name: "Apps",
            parentId: "",
            createdAt:  Utils.getNow(true),
            closed: false,
            readOnly: true,
        },
        DefaultAppsReplacer:
        {
            type: this.types.app,
            id: "Default-Apps-Replacer",
            name: "置換",
            appKey: App.appNames.replacer,// FuncはJSON保存できないためキー名を保存
            explain: "・@@@区切りで複数文字列を一括置換<br/>・ハイライトエリア右クリックで拡大表示<br/>・テーブルFrom行右クリックでハイライトカラーリフレッシュ<br/>・Ctrl + Rで全カラーリフレッシュ",
            storageData: {
                key: "Default-Apps-Replacer",
                value: null,
            },
            parentId: "Default-Apps-Folder",
            createdAt:  Utils.getNow(true),
            active: false,
            readOnly: true,
        },

    }

    // データ（並列管理）-----
    static dataObj = {
        data: [
            /**
             * Read Me
             */
            this.defaultData.ReadMeFolder,
            this.defaultData.ReadMeManual,
            this.defaultData.ReadMeShortCut,
            /**
             * Default Apps
             */
            this.defaultData.DefaultAppsFolder,
            this.defaultData.DefaultAppsReplacer,
        ],
        config: {},
        meta: {
            // ノートテンプレート情報
            noteTemplate: []
        }
    };

    //
    // データ操作関数
    //

    //
    // ローカルストレージから読み込む
    static loadStorage = async (confirmFlg = true)=> {

        if(confirmFlg){
            if(!await Utils.confirm("ストレージデータを読み込みますか？")) return;
        }

        try{
            const localData = localStorage.getItem(this.storageKey);

            if(!localData){
                Utils.fadeMassage("保存済みデータはありません");
                build();
                return;
            }

            this.dataObj = JSON.parse(localData);

            // 読み込み後初期化処理
            loadInit();

            build();

            Utils.fadeMassage("データを読み込みました")

        }catch(e){
            alert("データの読み込みに失敗しました。コンソールを確認してください。");
            console.log(e);
        }
    }

    //
    // ローカルストレージに上書き保存
    static saveStorage = async(confirmFlg = true)=>{

        if(confirmFlg){
            if(!await Utils.confirm("現在のデータをローカルストレージに保存しますか？")) return;
        }

        try{
            const json = JSON.stringify(this.dataObj);
            localStorage.setItem(this.storageKey, json);

            Utils.fadeMassage("ローカルストレージを更新しました。")

        }catch(e){
            alert("保存に失敗しました");
            console.log(e);
        }
    }

    // ローカルストレージをクリア
    static clearStorage = async()=> {

        if(!await Utils.confirm("ローカルストレージをクリアしますか？")) return;

        try{
            localStorage.removeItem(this.storageKey);

            Utils.fadeMassage("ローカルストレージを削除しました")

        }catch(e){
            alert("削除に失敗しました");
            console.log(e);
        }
    }

    //
    // JSONファイルダウンロード
    static downloadJSON = ()=>{

        try{
            const json = JSON.stringify(this.dataObj, null, 2);

            const blob = new Blob([json], {type:"application/json"});
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "notes.json";

            document.body.appendChild(a);
            a.click();

            a.remove();
            URL.revokeObjectURL(url);

        }catch(e){
            alert("JSONダウンロードに失敗しました");
            console.log(e);
        }
    }

    //
    // JSONファイル読み込み
    static loadJSONFile = ()=>{

        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.onchange = (e)=>{

            const file = e.target.files[0];
            if(!file) return;

            const reader = new FileReader();

            reader.onload = ()=>{

                try{
                    this.dataObj = JSON.parse(reader.result);

                    // 読み込み後初期化処理
                    loadInit();

                    build();

                    Utils.fadeMassage("JSONを読み込みました");

                }catch(err){
                    alert("JSONの解析に失敗しました");
                    console.log(err);
                }

            }

            reader.readAsText(file);
        }

        input.click();
    }
}

/**
 * 開発用
 */
{
    document.addEventListener("keydown", (e)=> {
        // データコピー
        if(e.ctrlKey && (e.key == "L" || e.key == "l")){
            e.preventDefault();
            navigator.clipboard.writeText(
                JSON.stringify(DATABASE.dataObj, null, 2)
            );
            Utils.fadeMassage("全データをコピーしました。")
        }
    })
}

/**
 * ショートカット
 */
document.addEventListener("keydown", e=> {

    // ローカルストレージに上書き保存
    if(e.ctrlKey && (e.key == "s" || e.key == "S")){
        e.preventDefault();
        DATABASE.saveStorage(false);
    }

    // ローカルストレージから読込
    if(e.ctrlKey && (e.key == "r" || e.key == "R")){
        e.preventDefault();
        // DATABASE.loadStorage(true);
    }
})

/**
 * イベント等初期実行
 */
function initEvents(){

    // マウス位置に同期するイベント
    Binder.initMouseSync();
    // DnDゴーストマウスアップ
    Binder.initMouseUp_ghpost();

}
initEvents();

/**
 * 読み込み
 */
function load(){

    // ページ履歴の上書き（戻るボタンでブラウザバックされるのを回避）
    try{
        history.replaceState(null, "", location.href);
    }catch(e){Utils.fadeMassage("ページ履歴の上書きはブロックされました")};

    // 机（最親）
    const desk = Utils.createDOM("div","desk",document.body);

    // タイトル
    const header = Utils.createDOM("div","desk-header",desk);
    header.textContent = "Tanaka's Desk";

    // ロケーションナビ**
    {
        const color = {disable: "#7c8aa0", useAble: "#e7e7e7"}

        // 生成
        const LMNavi =  Utils.createDOM("div","LMNavi-Container",header);
        const back = Utils.createDOM("svg","icon-svg",LMNavi);
        const forward = Utils.createDOM("svg","icon-svg",LMNavi);
        Utils.setStyleProps(LMNavi, {
            marginLeft: "65%",
            whiteSpace: "pre-wrap",
        })

        // 動作
        back.onclick = ()=> {
            ShareSpace.LM.goBack();
            setLMNaviColor();
        };
        forward.onclick = ()=> {
            ShareSpace.LM.goForward()
            setLMNaviColor();
        };

        // カラー設定
        const setLMNaviColor = ()=>{
            // back
            if(ShareSpace.LM.goBackAble()){
                back.innerHTML = Utils.replaceFillColor(Icon.arrowCircle_L, color.useAble);
            }else{
                back.innerHTML = Utils.replaceFillColor(Icon.arrowCircle_L, color.disable);
            }
            // forward
            if(ShareSpace.LM.goForwardAble()){
                forward.innerHTML = Utils.replaceFillColor(Icon.arrowCircle_R, color.useAble);
            }else{
                forward.innerHTML = Utils.replaceFillColor(Icon.arrowCircle_R, color.disable);
            }
        }
        setLMNaviColor();

        // シェアスペースに関数を渡す
        ShareSpace.setLocationButtonStyle = ()=> setLMNaviColor();
    }
        
    // メイン
    const main = Utils.createDOM("div","desk-main",desk);

    // 左：エクスプローラー
    const explorer = Utils.createDOM("div","explorer",main);

    const shelfTitle = Utils.createDOM("div","explorer-title",explorer);
    shelfTitle.textContent = "本棚";

    // 中央：ノート
    const noteContainer = Utils.createDOM("div","center",main);

    // 右：設定
    const settingContainer = Utils.createDOM("div","setting",main);

    // ビルド引数にDOMを設定
    ShareSpace.explorer = explorer;
    ShareSpace.noteContainer = noteContainer;
    ShareSpace.settingContainer = settingContainer;

    // データをもとに構築
    DATABASE.loadStorage(false);
    // build();

    // region イベント

    // エクスプローラー DnD
    {
        // ドラッグオーバー無効 n スタイル
        explorer.addEventListener("dragover", (e) => {
            // 伝播無視
            if(e.target != explorer) return;
            e.preventDefault();
            explorer.classList.add("dragover-explorer");
        });

        // ドラッグオーバースタイル
        explorer.addEventListener("dragleave", (e) => {
            // 伝播無視
            if(e.target != explorer) return;
            e.preventDefault();
            explorer.classList.remove("dragover-explorer");
        });

        // ドロップイベント
        explorer.addEventListener("drop", async e=> {

            // ドラッグオーバースタイルremove
            explorer.classList.remove("dragover-explorer");

            // 伝播無視
            if(e.target != explorer) return;

            // 受け取り
            const movingID = e.dataTransfer.getData("explorer-moving");
            if(!movingID) return;

            // 対象オブジェクト取得
            const movingObj = DATABASE.dataObj.data.find(a=> a.id == movingID);

            // すでに最上階層ならスキップ
            if(movingObj.parentId == "") {
                Utils.fadeMassage("変更はありません");
                return;
            }
            
            // 移動
            if(!await Utils.confirm("移動しますか？")) {
                return;
            }
            movingObj.parentId = "";

            // 再描画
            build();
        })
    }

    // 作成メニュー
    explorer.addEventListener("contextmenu", (e)=> {
        //
        e.preventDefault();
        if(e.target != explorer) return;
        //
        var orderArr = [
            { printName: "新規フォルダ", icon: Icon.blackFolder, func: ()=> createNew(DATABASE.types.folder) },
            { printName: "新規ノート", icon: Icon.notes, func: ()=> createNew(DATABASE.types.note) },
        ];
        Utils.createMenu(orderArr);
    })

    // データメニュー
    header.addEventListener("contextmenu", (e)=> {
        //
        e.preventDefault();
        if(e.target != header) return;
        //
        var orderArr = [
            { printName: "ローカルストレージから読み込む", icon: Icon.syncArrowDown, func: ()=> DATABASE.loadStorage(true) },
            { printName: "ローカルストレージに上書き保存", icon: Icon.backup, func: ()=> DATABASE.saveStorage() },
            { printName: "ローカルストレージをクリア", icon: Icon.tmpGarbage, func: ()=> DATABASE.clearStorage() },
            { printName: "JSONファイルダウンロード", icon: Icon.download, func: ()=> DATABASE.downloadJSON() },
            { printName: "JSONファイル読み込み", icon: Icon.json, func: ()=> DATABASE.loadJSONFile() },
        ];
        Utils.createMenu(orderArr);
    })
}

// region 新規データ作成
async function createNew(type, parentIdParam = "") {
    switch(type){
        //
        // １　フォルダー
        //
        case DATABASE.types.folder:{
            //
            const newId = Utils.getRandomString20(DATABASE.dataObj.data);
            const newName = await Utils.prompt("フォルダ名を入力してください");
            //
            if(!newName || !newName.trim()) return;
            //
            DATABASE.dataObj.data.push({
                type: DATABASE.types.folder,
                id: newId,
                name: newName,
                parentId: parentIdParam,
                createdAt:  Utils.getNow(true),
                closed: false,
                readOnly: false,
            })
            //
            break;
        }
        //
        // ２　ノート
        //
        case DATABASE.types.note:{
            //
            const newId = Utils.getRandomString20(DATABASE.dataObj.data);
            const newName = await Utils.prompt("ノート名を入力してください");
            //
            if(!newName || !newName.trim()) return;
            //
            DATABASE.dataObj.data.push({
                type: DATABASE.types.note,
                id: newId,
                name: newName,
                content: {},
                parentId: parentIdParam,
                createdAt:  Utils.getNow(true),
                active: false,
                readOnly: false,
            })
            //
            break;
        }
    }
    build();
}

// リネーム
async function rename(obj){
    const newName = await Utils.prompt("新しい名称を入力してください", obj.name);
    //
    if(!newName || !newName.trim() || (newName==obj.name)) return;
    //
    obj.name = newName;
    build();
}

// データ削除
async function deleteData(obj){

    // 削除対象NodeList（従属 + 自身）
    let targetArr = JSON.parse(JSON.stringify(DATABASE.dataObj.data.filter(a=>
        getParentCSV(a).includes(obj.id) ||
        a.id == obj.id
    )));

    // 各データ件数集計
    const counter = {
        ["type" + DATABASE.types.folder]: 0, 
        ["type" + DATABASE.types.note]: 0, 
        ["type" + DATABASE.types.app]: 0, 
    };
    for(let tmpObj of targetArr){
        if(tmpObj.type == DATABASE.types.folder) counter["type" + DATABASE.types.folder]++;
        else if(tmpObj.type == DATABASE.types.note) counter["type" + DATABASE.types.note]++;
        else if(tmpObj.type == DATABASE.types.app) counter["type" + DATABASE.types.app]++;
    }
    let msg = "(";
    if(counter["type" + DATABASE.types.folder]) msg += `フォルダ${counter["type" + DATABASE.types.folder]}件 `;
    if(counter["type" + DATABASE.types.note]) msg += `ノート${counter["type" + DATABASE.types.note]}件 `;
    if(counter["type" + DATABASE.types.app]) msg += `アプリ${counter["type" + DATABASE.types.app]}件 `;
    msg += ")";
    
    // 確認
    if(!await Utils.confirm("削除しますか？" + msg)) return;
    
    // 削除（除いて更新）
    DATABASE.dataObj.data = DATABASE.dataObj.data.filter(a=>
        !(getParentCSV(a).includes(obj.id)) &&
        a.id != obj.id
    )
    
    // リビルド
    build();
    Utils.fadeMassage("削除しました")
}

// parentCSV取得（上から）
function getParentCSV(obj, returnArr = false){
    //
    let parentCSV = "";
    let arr = [];
    //
    if(obj.parentId){
        while(true){
            let parentObj = DATABASE.dataObj.data.find(a=> a.id == obj.parentId);
            if(!parentObj) break;
            //
            // 前に挿入
            arr.unshift(parentObj.id);
            obj = parentObj;
        }
        parentCSV = arr.join(",");
    }
    //
    if(returnArr) return arr;
    return parentCSV;
}

// childCSV取得
function getChildCSV(obj, returnArr = false){
    let arr = [];
 
    function recurse(parentId){
        const children = DATABASE.dataObj.data.filter(a => a.parentId === parentId);
        for(const child of children){
            arr.push(child.id);       // 追加
            recurse(child.id);        // 孫も探す
        }
    }
 
    recurse(obj.id);
 
    if(returnArr) return arr;
    return arr.join(",");
}


/**
 * データをもとに構築
 */
function build (){

    // エリアクリア
    ShareSpace.explorer.innerHTML = "";
    ShareSpace.noteContainer.innerHTML = "";
    ShareSpace.settingContainer.innerHTML = "";

    // 既存データパッチ
    applyPatch();

    // デフォルトデータ最新化
    updateDefaultData();

    // 親から生成されるようソート ※ソートは一回のみ
    DATABASE.dataObj.data.sort((a,b)=>
        getParentCSV(a, true).length -
        getParentCSV(b, true).length
    );

    // region データループ
    for(let obj of DATABASE.dataObj.data){
        
        // 共通
        let parent = ShareSpace.explorer;
        if(obj.parentId) {
            parent = document.querySelector(`[data-id="${obj.parentId}"]`);
            if(!parent) alert("生成エラー：親要素が見つかりません")
        }
        
        // タイプ分岐
        switch(obj.type){
            //
            // １　フォルダ
            //
            case DATABASE.types.folder:{
                
                // 生成
                const container = Utils.createDOM("div","explorer-items-container",parent);
                const folder = Utils.createDOM("div","explorer-folder",container);
                
                // 子要素数取得
                const childCount = DATABASE.dataObj.data.filter(a=>
                    a.parentId == obj.id
                ).length;

                // フォルダ名表示
                folder.textContent = obj.name + `（${childCount}）`;
                
                // フォルダアイコン挿入
                let folderIcon = Utils.createDOM("span", "iconButton");
                folderIcon.innerHTML = Icon.blackFolder;
                folder.prepend(folderIcon)

                // ロックアイコン挿入
                let lockIcon = Utils.createDOM("span", "iconButton", folder);
                if(obj.readOnly){
                    lockIcon.innerHTML = Icon.lock;
                }

                // コンテナにID埋め込み
                container.dataset.id = obj.id;
                
                // 最上階層なら表示
                if(obj.parentId != "") container.hidden = true;
                
                // 親が非表示なら非表示
                if(obj.parentId){
                    const parentObj = DATABASE.dataObj.data.find(a=>
                        a.id == obj.parentId
                    )
                    if(parentObj.closed) container.hidden = true;
                    else container.hidden = false;
                }

                // DnDバインド
                if(!obj.readOnly) bindDnD(folder, obj);
                
                // クリックイベント
                folder.addEventListener("click", ()=> {
                    // 子要素可視切替
                    let closedState = false;
                    for(let ch of container.children){
                        if(ch == folder) continue;
                        ch.hidden = !ch.hidden;
                        if(ch.hidden) closedState = true;
                    }
                    // 開閉プロパティ更新
                    obj.closed = closedState;
                })
                
                // 右クリックイベント
                folder.addEventListener("contextmenu", (e)=> {
                    e.preventDefault();
                    if(e.target != folder) return;
                    // 編集不可
                    if(obj.readOnly){
                        Utils.fadeMassage("読み取り専用");
                        return;
                    }
                    // 作成メニュー
                    var orderArr = [
                        { printName: "新規フォルダ", icon: Icon.blackFolder, func: ()=> createNew(DATABASE.types.folder, obj.id) },
                        { printName: "新規ノート", icon: Icon.notes, func: ()=> createNew(DATABASE.types.note, obj.id) },
                        { printName: "リネーム", icon: Icon.edit, func: ()=> rename(obj) },
                        { printName: "削除", icon: Icon.tmpGarbage, func: ()=> deleteData(obj) },
                    ];
                    Utils.createMenu(orderArr);
                })
                
                // case end.
                break;
            }
            //
            // ２　ノート
            // ３　アプリ
            //
            case DATABASE.types.note:
            case DATABASE.types.app:
            {
                // 生成
                const container = Utils.createDOM("div","explorer-items-container",parent);
                const note = Utils.createDOM("div","explorer-file",container);

                // ファイル名
                if(obj.parentId){
                    note.textContent = "├" + obj.name;
                }else{
                    note.textContent = obj.name;
                }

                // 拡張子
                const extension = Utils.createDOM("span","explorer-extension", note);
                switch(obj.type){
                    case DATABASE.types.note:
                        extension.textContent = ".note";
                        break;
                    case DATABASE.types.app:
                        extension.textContent = ".app";
                        break;
                }

                // ロック
                let lockIcon = Utils.createDOM("span", "iconButton", note);
                if(obj.readOnly){
                    lockIcon.innerHTML = Icon.lock;
                }

                // データセットにキー埋め込み（※datasetに追加したプロパティは自動でキャメルケースになるため注意）
                container.dataset.id = obj.id;
                // ロケーション履歴呼び出し時のクリックディスパッチ用
                note.dataset.expkey = "unique-file-" + obj.id;
                
                // 最上なら表示
                if(obj.parentId != "") container.hidden = true;
                
                // 親がclosedなら非表示
                if(obj.parentId){
                    const parentObj = DATABASE.dataObj.data.find(a=>
                        a.id == obj.parentId
                    )
                    if(parentObj.closed) container.hidden = true;
                    else container.hidden = false;
                }
                
                // ├ があるためマージン不要
                container.style.marginLeft = "0px";
                
                // 保存時アクティブなら起動
                if(obj.active){
                    Utils.setOnlyStyle(note, "active-note");

                    // ロケーション保存
                    ShareSpace.LM.push(obj)

                    // 分岐
                    switch(obj.type){
                        // ノート
                        case DATABASE.types.note:{
                            new Note(obj.content, ShareSpace.noteContainer, ShareSpace.settingContainer, obj);
                            break;
                        }
                        // アプリ
                        case DATABASE.types.app:{
                            new App(obj, ShareSpace.noteContainer, ShareSpace.settingContainer, obj);
                            break;
                        }
                    }
                }

                // DnDバインド
                if(!obj.readOnly) bindDnD(note, obj);
                
                // クリック
                note.addEventListener("click", ()=> {

                    // 他を非アクティブ化
                    const currActiveObj = DATABASE.dataObj.data.find(a=>
                        a.type != DATABASE.types.folder
                        && a.active == true
                    );
                    if (currActiveObj) currActiveObj.active = false;

                    // 自身をアクティブ
                    obj.active = true;

                    // アクティブスタイル
                    Utils.setOnlyStyle(note, "active-note");

                    // ロケーション保存
                    ShareSpace.LM.push(obj)

                    // 分岐
                    switch(obj.type){
                        // ノート
                        case DATABASE.types.note:{
                            // ノート起動
                            new Note(obj.content, ShareSpace.noteContainer, ShareSpace.settingContainer, obj);
                            break;
                        }
                        // アプリ
                        case DATABASE.types.app:{
                            // アプリ起動
                            new App(obj, ShareSpace.noteContainer, ShareSpace.settingContainer, obj);
                            break;
                        }
                    }
                })
                
                // 右クリック
                note.addEventListener("contextmenu", (e)=> {
                    e.preventDefault();
                    // 伝播無視
                    if(e.target != note) return;

                    // ロック中
                    if(obj.readOnly){
                        Utils.fadeMassage("読み取り専用");
                        return;
                    }

                    // メニュー
                    var orderArr = [
                        { printName: "リネーム", icon: Icon.edit, func: ()=> rename(obj) },
                        { printName: "削除", icon: Icon.tmpGarbage, func: ()=> deleteData(obj) },
                    ];
                    Utils.createMenu(orderArr);
                })

                // type case end.
                break;
            }
        }
    }
    // region データループ終了

    // ロケーション移動ボタン使用可否
    ShareSpace.setLocationButtonStyle();
}