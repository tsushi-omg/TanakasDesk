/**-------------------------
 * ユーティリティ
 -------------------------*/
class Utils{

    // DOM取得
    static getDOM(pId){
        return document.getElementById(pId);
    }

    // DOM生成（ + CSSクラス、親DOMへAppend）
    static createDOM(pTagName, pClassName = "", pParent = null, pTextContent = ""){
        const el = document.createElement(pTagName);
        for(let className of pClassName.split(",")) {
            if(className) el.classList.add(className);
        }
        if(pTextContent) el.textContent = pTextContent;
        if(pParent) pParent.appendChild(el);
        return el; 
    }

    static setOnlyStyle(el, cssClassName){
        let arr = document.getElementsByClassName(cssClassName);
        for(let tmp of arr){
            tmp.classList.remove(cssClassName);
        }
        el.classList.add(cssClassName);
    }

    /**
     * スタイルプロパティ一括設定
     * @param {HTMLElement} element 
     * @param {Object} propsObj {color: "red", border: "none"}
     */
    static setStyleProps = (element, propsObj)=> {
        // key n valueループ
        for(let [k, v] of Object.entries(propsObj)){
            element.style[k] = v;
        }
    }

    // マウス座標継続取得
    static mouseX = "";
    static mouseY = "";

    // 前回のマウス長押し時間（ms）
    static prevMouseDownLength = 0;

    // マウス長押しフラグ
    static mouseDowning = false;

    /**
     * 
     * @param {Array} orderArr 
     * @param {boolean} onclickFlg クリックで削除する仕様のため、クリックイベントで呼び出した場合は"１度スルーする"ためのフラグ
     */
    static createMenu(orderArr, onclickFlg = false){
        if(Utils.getDOM("uniqueId_customMenu")){
            Utils.getDOM("uniqueId_customMenu").remove();
        }
        const container = Utils.createDOM("div");
        {
            container.id = "uniqueId_customMenu";
            container.style.position = "absolute";
            container.style.top = Utils.mouseY + "px";
            container.style.left = Utils.mouseX + "px";
            container.style.zIndex = 100;
        }
        for(let obj of orderArr){
            const button = Utils.createDOM("button")
            const icon = Utils.createDOM("span");
            {
                button.textContent = obj["printName"];
                button.classList.add("contextitem");
                button.style.display = "flex";
                button.style.margin = "0.1";
                icon.classList.add("iconButton");
                icon.style.marginRight = "5px";
                if(obj["icon"]) icon.innerHTML = obj["icon"];
                if(obj["func"]){
                    button.addEventListener("click", function(e){
                        e.stopPropagation();
                        container.remove();
                        obj["func"]();
                    })
                }
            }
            button.prepend(icon);
            container.appendChild(button);
        }
        document.body.appendChild(container);
        // クリックで閉じる（ドキュメントへのイベント重複登録を防ぐ）
        const clickHandler = (ev) => {
            if(onclickFlg){
                onclickFlg = false; // 1回スルー
                return;
            }
            container.remove();
            document.removeEventListener("click", clickHandler);
        };
        document.addEventListener("click", clickHandler);
    }

    /**
     * 20桁ランダム英数字取得（ランダム英数） 指定した配列内オブジェクトのプロパティ"id"を見て一意生成
     */
    static getRandomString20(repo=null, keyPropName = "id"){
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 20; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            result += chars.charAt(randomIndex);
        }
        if(repo==null) return result;
        var useAble = true;
        for(let obj of repo){
            try{
                if(obj[keyPropName]==result) {
                    useAble = false;
                    break;
                }
            }catch(e){}
        }
        if(useAble) return result;
        else return getRandomString20(repo);
    }

    /**
     * 現在のyyyy-mm-dd hh:mm
     */
    static getNow (returnObj = false){
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        let obj = {
            yyyy:yyyy,
            mm:mm,
            dd:dd,
            hh:hh,
            mi:mi
        }
        if(returnObj) return obj;
        else return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    };

    // SVGフィルカラー変更
    static replaceFillColor(svgString, newColor) {
        return svgString.replace(/fill=".*?"/g, `fill="${newColor}"`);
    }

    static fadeMassage = (text)=> {
        //
        const msg = Utils.createDOM("div", "noteMessage", document.body);
        msg.textContent = text;
        //
        msg.style.left = "50%";
        msg.style.top = "40%";
        //
        setTimeout(()=>{
            msg.classList.add("noteMessage_hide");
            setTimeout(()=> msg.remove(), 400);
        }, 500);
    }

    /**
     * 選択中のDOM配列を返却
     * @param {*} cssClassName 
     * @returns {Array} 配列変換したNodeList
     */
    static getSelectedElements = (cssClassName)=> {
        const arr = document.querySelectorAll("." + cssClassName);
        return Array.from(arr).filter(a=> a.dataset.selected=="true");
    }

    /**
     * カスタムコンファーム
     * await Util.confirm(msg);
     */
    static confirm(msg, okText = "OK", cancelText = "キャンセル"){
        return new Promise(resolve => {
            const layer = Utils.createDOM("div", "custom-confirm-layer", document.body);
            const box = Utils.createDOM("div", "custom-confirm", layer);
            //
            box.style.left = Utils.mouseX + "px";
            box.style.top = Utils.mouseY + "px";
            //
            box.insertAdjacentHTML("beforeend", `
            <div class="cc-body">
                <div class="cc-message">${msg}</div>
                <div class="cc-buttons">
                    <button class="cc-ok">${okText}</button>
                    <button class="cc-cancel">${cancelText}</button>
                </div>
            </div>
            `)
            //
            const ok = box.querySelector(".cc-ok");
            const cancel = box.querySelector(".cc-cancel");
            //
            ok.onclick = ()=> {
                layer.remove();
                resolve(true);
            }
            cancel.onclick = ()=> {
                layer.remove();
                resolve(false);
            }
            layer.onclick = ()=> {
                layer.remove();
                resolve(false);
            }
        })
    }

    /**
     * カスタムプロンプト
     * await Util.prompt(msg);
     */
    static prompt(msg, defaultValue = ""){
        return new Promise(resolve => {
            const layer = Utils.createDOM("div", "custom-confirm-layer", document.body);
            const box = Utils.createDOM("div", "custom-confirm", layer);
            //
            box.style.left = Utils.mouseX + "px";
            box.style.top = Utils.mouseY + "px";
            //
            box.insertAdjacentHTML("beforeend", `
            <div class="cc-body">
                <div class="cc-message">${msg}</div>
                <div class="cc-message"><input type="text" value="${defaultValue}" class="cc-input"/></div>
                <div class="cc-buttons">
                    <button class="cc-ok">OK</button>
                    <button class="cc-cancel">キャンセル</button>
                </div>
            </div>
            `)
            //
            const ok = box.querySelector(".cc-ok");
            const cancel = box.querySelector(".cc-cancel");
            const input = box.querySelector(".cc-input");
            //
            input.focus();
            input.select();
            input.addEventListener("click", (e)=> {
                e.stopPropagation();
            })
            input.addEventListener("keydown", (e)=> {
                if(e.key == "Enter"){
                    layer.remove();
                    resolve(input.value);
                }
                if(e.key == "Escape"){
                    layer.remove();
                    resolve("");
                }
            })
            //
            ok.onclick = ()=> {
                layer.remove();
                resolve(input.value);
            }
            cancel.onclick = ()=> {
                layer.remove();
                resolve("");
            }
            layer.onclick = ()=> {
                layer.remove();
                resolve("");
            }
        })
    }

    /**
     * ヒット情報配列を返却（ {text: "abc", hit: true},... ）
     * @param {String} baseText 
     * @param {String} sep 区切り文字
     * @param {String} searchText 
     * @param {Object[]} pArr 既存のカラーを設定
     * @returns {Object[]}  オブジェクト配列
     */
    static getHighlightSet = (baseText, searchText, sep, pArr = null) => {
        let resultArr = [];
        let searchArr = searchText.split(sep).filter(s => s);
        let colorArr = {/* text: color, */};

        // カラー復元（ヒット情報配列を受け取った場合）
        if(pArr && pArr.length){
            pArr = pArr.filter(a=> a.hit==true);
            pArr.forEach(workObj=> {
                colorArr[workObj.text] = workObj.randomColor;
            })
        }

        let nextStart = 0;

        if (!baseText || !searchText) {
            return [{ text: baseText, hit: false }];
        }

        while (nextStart < baseText.length) {
            let base = baseText.slice(nextStart);

            let minIndex = -1;
            let hitWord = "";

            for (let search of searchArr) {
                let idx = base.indexOf(search);
                if (idx !== -1 && (minIndex === -1 || idx < minIndex)) {
                    minIndex = idx;
                    hitWord = search;
                }
            }

            // ヒットなし
            if (minIndex === -1) {
                resultArr.push({
                    text: base,
                    hit: false,
                    randomColor: "transparent",
                    fontColor: "white",
                });
                break;
            }

            // ヒット前
            if (minIndex > 0) {
                resultArr.push({
                    text: base.slice(0, minIndex),
                    hit: false,
                    randomColor: "transparent",
                    fontColor: "white",
                });
            }

            // ヒット部分---

            // ランダムカラー
            let color = Utils.getHighlightColor();
            // 同じ文字がすでにヒットしていたら同じカラー
            if(colorArr.hasOwnProperty(hitWord)){
                // 取り出し
                color = colorArr[hitWord];
            }else{
                // 記憶配列に追加
                colorArr[hitWord] = color;
            }
            // 追加
            resultArr.push({
                text: hitWord,
                hit: true,
                randomColor: color,
                fontColor: "black",
            });
            //---

            nextStart += minIndex + hitWord.length;
        }

        return resultArr;
    };

    /**
     * ランダムハイライトカラー返却
     * @returns {String}
     */
    static getHighlightColor() {
        const h = Math.floor(Math.random() * 360);   // 色相（自由）
        const s = 70 + Math.random() * 20;           // 彩度 70〜90%
        const l = 75 + Math.random() * 10;           // 明度 75〜85%（明るめ）

        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    /**
     * HTMLインジェクション防止　特殊文字をエスケープ
     */
    static escapeHtml(str){
        return str
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    /**
     * 線でつなぐ（単発）
     * 監視なし（①削除時は再描画する　②親ごと消された場合の検知が不可能...であるため）
     */
    static writeLine(domArr, container, scale = 1) {

        let nextIdx = 1;
        const containerRect = container.getBoundingClientRect();

        for (let currEl of domArr) {

            if (domArr.length === nextIdx) break;
            const nextEl = domArr[nextIdx];

            // 既存の線を削除
            if (currEl.dataset.lineID) {
                const oldLine = Utils.getDOM(currEl.dataset.lineID);
                if (oldLine) oldLine.remove();
                currEl.dataset.lineID = "";
                nextEl.dataset.lineID = "";
            }

            if(!currEl || !nextEl){
                nextIdx++;
                continue;
            }

            const rect1 = currEl.getBoundingClientRect();
            const rect2 = nextEl.getBoundingClientRect();

            // 端同士の座標を計算（scale対応）
            const [p1, p2] = Utils.getEdgePoints(rect1, rect2, containerRect);

            const x1 = p1.x / scale;
            const y1 = p1.y / scale;
            const x2 = p2.x / scale;
            const y2 = p2.y / scale;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            const line = Utils.createDOM("div", "line", container);
            line.id = crypto.randomUUID();
            line.style.position = "absolute";
            line.style.left = x1 + "px";
            line.style.top  = y1 + "px";
            line.style.width = length + "px";
            line.style.height = "2px";
            line.style.transformOrigin = "0 0";
            line.style.transform = `rotate(${angle}deg)`;
            line.style.zIndex = 0;

            // line idを保存
            currEl.dataset.lineID = line.id;
            nextEl.dataset.lineID = line.id;

            nextIdx++;
        }
    }

    /**
     * 端同士座標を計算
     * rect1, rect2: getBoundingClientRect()
     * containerRect: 親コンテナの矩形
     * 戻り値: [p1, p2] {x, y}
     */
    static getEdgePoints(rect1, rect2, containerRect) {
        const edges1 = {
            left: { x: rect1.left - containerRect.left, y: rect1.top + rect1.height/2 - containerRect.top },
            right:{ x: rect1.right - containerRect.left, y: rect1.top + rect1.height/2 - containerRect.top },
            top:  { x: rect1.left + rect1.width/2 - containerRect.left, y: rect1.top - containerRect.top },
            bottom:{ x: rect1.left + rect1.width/2 - containerRect.left, y: rect1.bottom - containerRect.top }
        };
        const edges2 = {
            left: { x: rect2.left - containerRect.left, y: rect2.top + rect2.height/2 - containerRect.top },
            right:{ x: rect2.right - containerRect.left, y: rect2.top + rect2.height/2 - containerRect.top },
            top:  { x: rect2.left + rect2.width/2 - containerRect.left, y: rect2.top - containerRect.top },
            bottom:{ x: rect2.left + rect2.width/2 - containerRect.left, y: rect2.bottom - containerRect.top }
        };

        // 横方向
        if (rect2.left > rect1.right) return [edges1.right, edges2.left];
        if (rect2.right < rect1.left) return [edges1.left, edges2.right];

        // 縦方向
        if (rect2.top > rect1.bottom) return [edges1.bottom, edges2.top];
        if (rect2.bottom < rect1.top) return [edges1.top, edges2.bottom];

        // 重なっている場合は中心同士
        const cx1 = rect1.left + rect1.width/2 - containerRect.left;
        const cy1 = rect1.top  + rect1.height/2 - containerRect.top;
        const cx2 = rect2.left + rect2.width/2 - containerRect.left;
        const cy2 = rect2.top  + rect2.height/2 - containerRect.top;

        return [{ x: cx1, y: cy1 }, { x: cx2, y: cy2 }];
    }

    /**
     * 一番空いているエリアの左上座標を返却
     * @param {string[]} classNames 占有判定対象CSSクラス配列
     * @param {HTMLElement} container 探索対象コンテナ
     * @param {number} scale 座標スケール（default: 1）
     * @returns {{x:number, y:number}}
     * by ChatGPT
     */
    static getMostEmptyAreaTopLeft(classNames, container, scale = 1) {

        container = container || document.body;

        const containerRect = container.getBoundingClientRect();

        const viewportWidth = containerRect.width;
        const viewportHeight = containerRect.height;

        const occupiedRects = [];

        classNames.forEach(className => {
            container.querySelectorAll(`.${className}`).forEach(el => {
                const rect = el.getBoundingClientRect();

                occupiedRects.push({
                    left: rect.left - containerRect.left,
                    right: rect.right - containerRect.left,
                    top: rect.top - containerRect.top,
                    bottom: rect.bottom - containerRect.top
                });
            });
        });

        const GRID_SIZE = 20;
        let bestPoint = { x: 0, y: 0 };
        let maxMinDistance = -1;

        for (let y = 0; y < viewportHeight; y += GRID_SIZE) {
            for (let x = 0; x < viewportWidth; x += GRID_SIZE) {

                let minDistance = Infinity;

                occupiedRects.forEach(rect => {
                    const dx = Math.max(rect.left - x, 0, x - rect.right);
                    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    minDistance = Math.min(minDistance, distance);
                });

                if (minDistance > maxMinDistance) {
                    maxMinDistance = minDistance;
                    bestPoint = { x, y };
                }
            }
        }

        // scale補正
        return {
            x: bestPoint.x / scale,
            y: bestPoint.y / scale
        };
    }

}
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
        for(let el of arr){
            // 選択
            el.addEventListener("mouseenter", e=>{
                if(!Utils.mouseDowning) return;
                el.dataset.selected = true;
                // ２つ以上のみ複数選択のスタイルとする
                // NodeListを配列に変換
                // データセットは文字列しか格納できないためbool変換
                const currSelections = Array.from(arr).filter(a=> a.dataset.selected=="true");
                if(currSelections.length < 2){
                    currSelections.forEach(a=> {
                        a.classList.remove("selected");
                    })
                }else{
                    currSelections.forEach(a=> {
                        a.classList.add("selected");
                    })
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
            // マウスダウンフラグ
            el.addEventListener("mouseup", e=>{
                Utils.mouseDowning = false;
            })
            // コールバック
            if(callbackObj.eventName){
                el.addEventListener(callbackObj.eventName, e=>{
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
/**-------------------------
 * 共通使用変数の継続更新
 -------------------------*/
// マウス座標継続取得 
document.addEventListener("mousemove", function(e){
    Utils.mouseX = e.clientX; // ビューポート左上からのX座標
    Utils.mouseY = e.clientY; // ビューポート左上からのY座標
})
// 前回のマウス長押し時間（ms）
let prevMouseDownTime = 0;
document.addEventListener("mousedown", function(e){
    prevMouseDownTime = performance.now();
    mouseDowning = true;
})
document.addEventListener("mouseup", function(e){
    Utils.prevMouseDownLength = performance.now() - prevMouseDownTime;
    mouseDowning = false;
})
