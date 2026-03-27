
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
