/**
 * Appクラス
 */
class App{
    /**
     * クラス変数
     */
    dataObj;
    parentElement;
    settingParentElement;

    /**
     * Default Apps
     */
    static appNames = {
        replacer: "replacer",
    }
    static defaultApps = {
        // [this.appNames.replacer]: ()=> replacerApp(),
    }

    /**
     * コンストラクタ
     */
    constructor(pObj, pParent, pSettingParent, appObj){

        // デフォルトアプリセットアップ（名称と関数の同期）
        setupDefaultApps();
        
        // オブジェクト参照受け取り
        this.dataObj = pObj;

        // DOM挿入先
        this.parentElement = pParent;
        this.settingParentElement = pSettingParent;

        // メッセージ（ファイル名）
        let config = {massage: appObj.name};

        // 読み取り専用ノートの場合
        if(appObj.readOnly){
            // 参照を切る
            this.dataObj = JSON.parse(JSON.stringify(pObj));
            // メッセージ加工
            config.massage += "（読み取り専用）";
        }

        // データをもとに生成
        this.create(config);
    }

    /**
     * アプリケーション共通コンテナ作成
     * @param {String} pAppName タイトルバー表示名
     * @param {Boolean} miniMode ミニモードフラグ
     */
    static getCommonContainer = (pAppName, miniMode = false)=> {

        // 親コンテナ（90% x 90%）
        const root = Utils.createDOM("div", "cmd-root", ShareSpace.noteContainer);
        if(miniMode){
            root.style.position = "fixed";
            root.style.width = "70%";
            root.style.height = "90%";
            root.style.zIndex = 10;
        }

        // 透明モーダル削除関数
        let delModal; 

        // ミニモードなら外部クリックで削除
        if(miniMode){
            const modal = Utils.createDOM("div", "", document.body);
            Utils.setStyleProps(modal, {
                position: "absolute",
                top: "0",
                left: "0",
                width: "100vw",
                height: "100vh",
                zIndex: 5,
                cursor: "pointer",
            })
            modal.onclick = ()=> {
                modal.remove();
                root.remove();
            }
            delModal = ()=> { if(miniMode) modal.remove(); };
        }

        // ウィンドウ本体
        const windowEl = Utils.createDOM("div", "cmd-window", root);

        // タイトルバー
        const titleBar = Utils.createDOM("div", "cmd-titlebar", windowEl);
        Utils.createDOM("div", "cmd-title", titleBar, "アプリケーション- " + pAppName);

        // ボタン（最小化・最大化・閉じる）
        const controls = Utils.createDOM("div", "cmd-controls", titleBar);
        const closeBtn =  Utils.createDOM("div", "cmd-btn,close", controls, "×");
        closeBtn.innerHTML = Utils.replaceFillColor(Icon.close, "#ffffff");
        closeBtn.onclick = ()=> {
            root.remove();
            if(delModal) delModal();
        };

        // コンテンツ（黒画面）
        const content = Utils.createDOM("div", "cmd-content", windowEl);

        return content;
    }

    /**
     * UI構築
     * @param {Object} configOption 
     */
    create = (configOption = null)=> {

        // クリア
        this.parentElement.innerHTML = "";
        this.settingParentElement.innerHTML = "";

        // 一意のID
        const appId = "unique-file";
        const settingID = "unique-setting";

        // クリア
        if(Utils.getDOM(appId)) Utils.getDOM(appId).remove();
        if(Utils.getDOM(settingID)) Utils.getDOM(settingID).remove();
        
        // 設定
        const config = {
            // メッセージ
            massage: "",
        }

        // 設定オプション
        if(configOption){
            for(let keyName in configOption){
                config[keyName] = configOption[keyName];
            }
        }
        
        // メッセージ表示関数
        const showMassage = (text)=> {
            
            const msg = Utils.createDOM("div", "noteMessage", this.parentElement);
            msg.textContent = text;
            msg.style.left = "50%";
            msg.style.top = "40%";

            // フェード
            setTimeout(()=>{
                msg.classList.add("noteMessage_hide");
                setTimeout(()=> msg.remove(), 400);
            }, 700);
        }

        // メッセージ引数があれば表示
        if(config.massage){
            showMassage(config.massage);
            config.massage = "";
        }

        // アプリ実行
        const exe = ()=> App.defaultApps[this.dataObj.appKey]();
        if(exe) exe();

        /**
        // region 操作パネル 
         */
        const createSettingPanel = ()=> {

            // 右側設定パネル
            const settingPanel = Utils.createDOM("div", "settingPanel", this.settingParentElement);
            settingPanel.id = settingID;

            // 説明ラベル
            const panelTitle = Utils.createDOM("div", "settingPanelTitle", settingPanel);
            panelTitle.textContent = "説明";

            // 説明
            const shortcutContent = Utils.createDOM("div", "shortcutContent,open", settingPanel);
            shortcutContent.innerHTML = this.dataObj.explain;

        }
        // 設定パネル作成
        createSettingPanel();

    }
}

/**
 * デフォルトアプリセットアップ（名称と関数の同期）
 */
function setupDefaultApps(){
    // 置換
    App.defaultApps[App.appNames.replacer] = ()=> replacerApp();
}