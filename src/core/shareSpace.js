
/**
 * グローバル領域（汚染防止）
 */
class ShareSpace{
    
    //=======================
    // DOM
    //=======================
    // エクスプローラー
    static explorer;
    // ファイルアクションコンテナ
    static noteContainer;
    // 設定コンテナ
    static settingContainer;

    //=======================
    // クラス
    //=======================
    // ロケーションマネージャー
    static LM;   

    //=======================
    // 関数
    //=======================
    // ロケーション移動ボタン使用可否
    static setLocationButtonStyle;

    //=======================
    // キー
    //=======================
    // 現在運んでいるdataTransferキー
    static draggingDataKey;
    // 受け渡しオブジェクト
    static transfer = {};
}