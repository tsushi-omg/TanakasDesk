
/**
 * ロケーション履歴管理
 */
class LocationManager{
    
    // ロケーションオブジェクト配列
    locationArr = [];
    pushAble = true;

    // ↓---関数---↓

    // アクティブオブジェクト取得
    getAciveObj = ()=>{
        return this.locationArr.find(a=> a.active == true);
    }

    // -------------------
    // ロケーション追加
    // -------------------
    push = (pObj)=> {

        // クリックディスパッチによるpushを回避
        if(!this.pushAble){
            this.pushAble = true;
            return;
        }

        // 現在アクティブなnumber
        let currActiveNumber = null;
        let currActiveObj = this.getAciveObj();
        if(currActiveObj){
            currActiveNumber = currActiveObj.number;
            currActiveObj.active = false;
        }

        // アクティブnumber以降を破棄（新規ロケーションで上書き）
        if(currActiveNumber){
            this.locationArr = this.locationArr.filter(a=> a.number <= currActiveNumber);
        }

        // 追加
        const nextNo = this.locationArr.length +1;
        this.locationArr.push({
            // 追加順
            number: nextNo,
            // データオブジェクトID
            objId: pObj.id,
            // アクティブ
            active: true,
        })

        // // 再採番
        // this.locationArr.sort((a,b)=> a.number - b.number);// 昇順
        // let newNumber = 1;
        // this.locationArr.forEach(tmp=> {
        //     tmp.number = newNumber;
        //     newNumber++;
        // })
    }

    // -------------------
    // 進む
    // -------------------
    goForward = ()=> {
        
        // ロケーション履歴なし
        if(this.locationArr.length == 0) {
            Utils.fadeMassage("ロケーション履歴はありません");
            return;
        }

        // 想定外
        let activeObj = this.getAciveObj();
        if(!activeObj) {
            Utils.fadeMassage("エラー：アクティブなロケーションが見当たりません")
        };
        
        // すでに最新ロケーション
        if(activeObj.number == this.locationArr.length) {
            Utils.fadeMassage("最新のロケーションです");
            return;
        }

        // 実行
        activeObj.active = false;
        let nextObj = this.locationArr.find(a=> a.number == activeObj.number +1);
        nextObj.active = true;
        // エクスプローラーのファイルボタンをクリック
        const expButton = document.querySelector(`[data-expkey="unique-file-${nextObj.objId}"]`);
        if(!expButton){
            Utils.fadeMassage("エラー：指定したロケーションのエクスプローラー要素が見当たりません")
        }else{
            // 代替クリックによるpushを一回スルー
            this.pushAble = false;
            expButton.dispatchEvent(new Event("click"));
        }
    }

    // -------------------
    // 戻る
    // -------------------
    goBack = ()=> {
        
        // ロケーション履歴なし
        if(this.locationArr.length == 0) {
            Utils.fadeMassage("ロケーション履歴はありません");
            return;
        }

        // 想定外
        let activeObj = this.getAciveObj();
        if(!activeObj) {
            Utils.fadeMassage("エラー：アクティブなロケーションが見当たりません")
        };
        
        // すでに最古ロケーション
        if(activeObj.number == 1) {
            Utils.fadeMassage("最古のロケーションです");
            return;
        }

        // 実行
        activeObj.active = false;
        let prevObj = this.locationArr.find(a=> a.number == activeObj.number -1);
        prevObj.active = true;
        // エクスプローラーのファイルボタンをクリック
        const expButton = document.querySelector(`[data-expKey="unique-file-${prevObj.objId}"]`);
        if(!expButton){
            Utils.fadeMassage("エラー：指定したロケーションのエクスプローラー要素が見当たりません")
        }else{
            // 代替クリックによるpushを一回スルー
            this.pushAble = false;
            expButton.dispatchEvent(new Event("click"));
        }

    }
}

// 公開クラス
const LM = new LocationManager();

/**
 * documentイベント付与
 */
document.addEventListener("mousedown", e=> {
    // 戻る
    if(e.button == 3){
        e.preventDefault();
        LM.goBack();
    }
    // 進む
    if(e.button == 4){
        e.preventDefault();
        LM.goForward();
    }
})