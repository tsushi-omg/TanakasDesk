/**-------------------------
 * イベントのバインド
 -------------------------*/
class Binder{

    // ドラッグ機能
    static bindDrag(pEl, obj = null){
        let offsetX, offsetY, isDown=false;
        let scale = obj ? obj.scale : 1;

        pEl.addEventListener('mousedown', e => {
            isDown = true;

            // 親要素（desktop）の矩形を取得
            const rect = pEl.parentElement.getBoundingClientRect();

            offsetX = (e.clientX - rect.left - pEl.offsetLeft) / scale;
            offsetY = (e.clientY - rect.top  - pEl.offsetTop ) / scale;
        });

        document.addEventListener('mousemove', e => {
            if(!isDown) return;

            const rect = pEl.parentElement.getBoundingClientRect();
            pEl.style.left = (e.clientX - rect.left)/scale - offsetX + "px";
            pEl.style.top  = (e.clientY - rect.top)/scale  - offsetY + "px";
        });

        document.addEventListener('mouseup', () => {
            isDown = false;
        });
    }

    // マウスと位置同期
    static mouseSyncEl = null;
    static initMouseSync(){
        document.addEventListener("mousemove", ()=>{
            if(!Binder.mouseSyncEl) return;
            Binder.mouseSyncEl.style.left = Utils.mouseX + "px";
            Binder.mouseSyncEl.style.top = Utils.mouseY + "px";
        });

    }

    // アップ
    static ghostsTypeKey = "DnD-Ghost";
    static ghostsDowning = false;
    static initMouseUp_ghpost(){
        document.addEventListener("mouseup",e=> {
            this.ghostsDowning = false;
            const currGhost = document.querySelector(`[data-type="${this.ghostsTypeKey}"]`);
            if(currGhost) currGhost.remove();
        })
    }

    /**
     * 範囲選択可能にする（※選択数によって見た目を操作しているのでdatasetで判断する。）
     * @param {string} cssClassName 
     * @param {Object} callbackObj callback: Func, eventName: String ※contextmenuバグってる mouseupはいける
     */
    static bindRangeSelection = (cssClassName, callbackObj={callback: null, eventName: ""})=>{
        const arr = document.querySelectorAll("." + cssClassName);
        // 一つしか選択されていない状態
        let singleSelection = true;
        for(let el of arr){
            // 選択
            el.addEventListener("mouseenter", e=>{
                if(!Utils.mouseDowning) return;
                el.dataset.selected = true;
                // ２つ以上のみ複数選択のスタイルとする
                // NodeListを配列に変換
                // データセットは文字列しか格納できないためbool変換
                if(singleSelection){
                    const currSelections = Array.from(arr).filter(a=> a.dataset.selected=="true");
                    if(currSelections.length < 2){
                        currSelections.forEach(a=> {
                            a.classList.remove("selected");
                        })
                    }else{
                        currSelections.forEach(a=> {
                            a.classList.add("selected");
                            singleSelection = false;
                        })
                    }
                }else{
                    el.classList.add("selected");
                }
            })
            // 解除
            el.addEventListener("mousedown", e=>{
                // 左クリックでのみ範囲選択
                if(e.button != "0") return;
                Utils.mouseDowning = true;
                unSelect();
                // 自分を選択
                el.dataset.selected = true;
            })
            // フラグ
            el.addEventListener("mouseup", e=>{
                Utils.mouseDowning = false;
                singleSelection = true;
            })
            // コールバック
            if(callbackObj.eventName){
                // el.addEventListener(callbackObj.eventName, e=>{
                el.addEventListener("mouseup", e=>{
                    // 隙間の補完
                    // const selectedArr = Utils.getSelectedElements(cssClassName);
                    // selectedArr.forEach(tmp=> tmp.classList.add("selected"));
                    // 複数選択後、コールバック
                    if(callbackObj.callback){
                        const currSelections = Array.from(arr).filter(a=> a.dataset.selected=="true");
                        if(currSelections.length >= 2){
                            callbackObj.callback();
                        }
                    }
                })
            }
        }
        const unSelect = ()=>{
            arr.forEach(ch=> {
                ch.classList.remove("selected");
                ch.dataset.selected = false;
            })
        };
    }

    /**
     * オブザーバーにコールバック処理をバインド（left, top監視）
     * controllObj.observe = falseなら停止（参照のためobj）
     */
    static observePosition(el, callback, controllObj){

        let lastLeft = el.style.left;
        let lastTop  = el.style.top;

        const observer = new MutationObserver(() => {

            // 座標を監視
            const newLeft = el.style.left;
            const newTop  = el.style.top;

            if (newLeft !== lastLeft || newTop !== lastTop) {
                lastLeft = newLeft;
                lastTop  = newTop;
                if(!controllObj.observe){
                    // 停止 
                    observer.disconnect();
                }
                else callback();
            }
        });

        observer.observe(el, {
            attributes: true,
            attributeFilter: ["style"]
        });

        return observer;
    }
}