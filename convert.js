/**
 * COBOLからVBへの変換（1行返し、Copilotで整形前提）
 * tbl-area : ハイフンか引き算か→ｐｇで宣言された変数であるためあとから置換可能
 * in1-kyk-nenみたいなのは見たことない。copy句でハイフン入りはなかった気がする
 * サブルーチンの宣言情報も補足情報として持っていれば置換可能
 */
function cobolToVB(lines) {
    // 結果（１行）
    let vbLine = "";

    // ------------------------------------------------------
    // ループ変数
    // ------------------------------------------------------
    let nextStart = 0;
    let scopeIn = [];

    // ------------------------------------------------------
    // 変換セット / 閉じタグセット
    // ※長さに依存する前進判定（startsWith）を行うため、
    // 　文字数の長いキーワード（例: 'NOT ='）を配列の前方に配置
    // ------------------------------------------------------
    const conSets = [
        // --- 1. 定数・リテラル ---
        { cobol: `ZEROES`, vb: `"0"`, addScope: false },
        { cobol: `ZEROS`, vb: `"0"`, addScope: false },
        { cobol: `ZERO`, vb: `"0"`, addScope: false },
        { cobol: `SPACES`, vb: `" "`, addScope: false },
        { cobol: `SPACE`, vb: `" "`, addScope: false },
        { cobol: `HIGH-VALUES`, vb: `Int32.MaxValue`, addScope: false }, // 状況に応じて要調整
        { cobol: `LOW-VALUES`, vb: `Int32.MinValue`, addScope: false },

        // --- 2. 比較演算子 (文字列表現を優先) ---
        { cobol: `NOT =`, vb: `<>`, addScope: false },
        { cobol: `NOT EQUAL`, vb: `<>`, addScope: false },
        { cobol: `EQUAL TO`, vb: `=`, addScope: false },
        { cobol: `GREATER THAN OR EQUAL`, vb: `>=`, addScope: false },
        { cobol: `LESS THAN OR EQUAL`, vb: `<=`, addScope: false },
        { cobol: `GREATER THAN`, vb: `>`, addScope: false },
        { cobol: `LESS THAN`, vb: `<`, addScope: false },
        { cobol: `IS NOT`, vb: `<>`, addScope: false },
        { cobol: `IS NUMERIC`, vb: `IsNumeric`, addScope: false }, // VBの関数へ誘導

        // --- 3. 論理演算子 ---
        { cobol: `AND`, vb: `AndAlso`, addScope: false }, // VB.NETの短絡評価
        { cobol: `OR`, vb: `OrElse`, addScope: false },
        { cobol: `NOT`, vb: `Not`, addScope: false },

        // --- 4. 制御構文（スコープ開始） ---
        { cobol: `EVALUATE`, vb: `Select Case`, addScope: true },
        { cobol: `PERFORM UNTIL`, vb: `Do Until`, addScope: true },
        { cobol: `PERFORM VARYING`, vb: `For`, addScope: true },
        { cobol: `PERFORM`, vb: `While`, addScope: true }, // 通常のPERFORM（ループ用）
        { cobol: `IF`, vb: `If`, addScope: true },
        { cobol: `WHEN`, vb: `Case`, addScope: false },
        { cobol: `ELSE`, vb: `Else`, addScope: false },

        // --- 5. 明示的な閉じタグ（COBOL-85規格のEND-XXX） ---
        { cobol: `END-IF`, vb: `End If`, addScope: false },
        { cobol: `END-PERFORM`, vb: `Loop`, addScope: false },
        { cobol: `END-EVALUATE`, vb: `End Select`, addScope: false },

        // --- 6. 主要なデータ操作文（Copilotへのヒント用マッピング） ---
        { cobol: `MOVE`, vb: `Set`, addScope: false }, // 「代入」をAIに強く意識させる
        { cobol: `TO`, vb: `=`, addScope: false },   // MOVE A TO B -> Set A = B (CopilotがB = Aに整形しやすい)
        { cobol: `COMPUTE`, vb: `=`, addScope: false },
        { cobol: `ADD`, vb: `+=`, addScope: false },
        { cobol: `SUBTRACT`, vb: `-=`, addScope: false },
        { cobol: `DISPLAY`, vb: `Console.WriteLine`, addScope: false },
        { cobol: `INITIALIZE`, vb: `Clear`, addScope: false },
        
        // --- 7. ファイル・DB操作系（AIへの文脈提示用） ---
        { cobol: `EXEC SQL`, vb: `'[SQL_START]`, addScope: true }, // コメントアウト形式で退避
        { cobol: `END-EXEC`, vb: `'[SQL_END]`, addScope: false },
        { cobol: `READ`, vb: `FileReader.Read`, addScope: false },
        { cobol: `WRITE`, vb: `FileWriter.Write`, addScope: false },
        { cobol: `REWRITE`, vb: `FileWriter.Update`, addScope: false }
    ];

    // ------------------------------------------------------
    // 【完全対応版】閉じタグセット（ピリオドに遭遇した時の連動用）
    // ------------------------------------------------------
    const closeSets = [
        { cobol: `IF`, vb: `End If` },
        { cobol: `PERFORM`, vb: `Loop` },
        { cobol: `PERFORM UNTIL`, vb: `Loop` },
        { cobol: `PERFORM VARYING`, vb: `Next` },
        { cobol: `EVALUATE`, vb: `End Select` },
        { cobol: `EXEC SQL`, vb: `'[SQL_END]` }
    ];

    // ------------------------------------------------------
    // ヒット確認関数 (Array.findで簡潔に)
    // ------------------------------------------------------
    // 変換セット
    const getConHitSet = (text) => conSets.find(set => text.startsWith(set.cobol)) || null;
    // 閉じタグセット
    const getCloseHitSet = (text) => closeSets.find(set => text.startsWith(set.cobol)) || null;

    /**===============
     * ループ
     ===============*/
    while (nextStart < lines.length) {

        // 残りの解析行
        let currLine = lines.substring(nextStart);

        // ------------------------------------------------------
        // 変換セット
        // ------------------------------------------------------
        let conHitObj = getConHitSet(currLine);
        if (conHitObj) {
            vbLine += conHitObj.vb;
            nextStart += conHitObj.cobol.length;
            // スコープが発生する場合、ネスト配列に追加
            if (conHitObj.addScope) {
                scopeIn.push(conHitObj);
            }
            continue;
        }
        // ------------------------------------------------------
        // 閉じタグセット
        // ------------------------------------------------------
        let closeSetObj = getCloseHitSet(currLine);
        if(closeSetObj){
            vbLine += closeSetObj.vb;
            nextStart += closeSetObj.cobol.length;
            // スコープブレイク
            scopeIn.pop(closeSetObj.cobol);
            continue;
        }
        // ------------------------------------------------------
        // ピリオド（COBOLの文末＝溜まっているスコープをすべて閉じる）
        // ------------------------------------------------------
        if (currLine.startsWith(".")) {
            if(scopeIn.length != 0){
                // すべて強制的に閉じる
                while (scopeIn.length > 0) {
                    let lastScope = scopeIn[scopeIn.length - 1];
                    let closeObj = closeSets.find(a => a.cobol === lastScope.cobol);
                    if (closeObj) {
                        vbLine += closeObj.vb + " ";
                    }
                    scopeIn.pop();
                }
            }else{
                // スコープ外の通常のピリオドだった場合は無視するか、
                vbLine += "."
            } 
            nextStart++;
            continue;
        }
        // ------------------------------------------------------
        // ヒットなし（1文字進める）
        // ------------------------------------------------------
        vbLine += currLine[0];
        nextStart++;
    }

    return vbLine; // 返却値を追加
}
/**
 * グループ項目、再定義、繰り返し用のパッチ
 */
function patch_valiable(){

}