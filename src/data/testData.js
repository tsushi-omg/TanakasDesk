class TestData {
    static allData = 
{
  "DATA": [
    {
      "type": 1,
      "id": "l6CjmpqHLhyn5yCaRcHG",
      "name": "旅費",
      "parentCSV": "",
      "parentId": "",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "config": {
        "top": "33px",
        "left": "581px"
      }
    },
    {
      "type": 1,
      "id": "25gIHoSViDLd3ddZbuHk",
      "name": "document",
      "parentCSV": "",
      "parentId": "",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "config": {
        "top": "42px",
        "left": "1114px"
      }
    },
    {
      "type": 1,
      "id": "WBfpM8fyNdVVJsDTRtm1",
      "name": "旅費",
      "parentCSV": "25gIHoSViDLd3ddZbuHk",
      "parentId": "25gIHoSViDLd3ddZbuHk",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      }
    },
    {
      "type": 1,
      "id": "sOaYEVsBXBjqv8hT9eRP",
      "name": "経費",
      "parentCSV": "25gIHoSViDLd3ddZbuHk",
      "parentId": "25gIHoSViDLd3ddZbuHk",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      }
    },
    {
      "type": 1,
      "id": "Bhm1yZ3SLdYgBz4zO2yu",
      "name": "物品",
      "parentCSV": "25gIHoSViDLd3ddZbuHk",
      "parentId": "25gIHoSViDLd3ddZbuHk",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      }
    },
    {
      "type": 1,
      "id": "heJ6EMSaHDJbLGHjeXLG",
      "name": "謝金",
      "parentCSV": "25gIHoSViDLd3ddZbuHk",
      "parentId": "25gIHoSViDLd3ddZbuHk",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      }
    },
    {
      "type": 2,
      "id": "u03RMtAmduuZJgeRZPz5",
      "name": "海外旅費",
      "parentCSV": "25gIHoSViDLd3ddZbuHk,WBfpM8fyNdVVJsDTRtm1",
      "parentId": "WBfpM8fyNdVVJsDTRtm1",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"11\",\"mi\":\"26\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      },
      "value": "SELECT\nDdipCreDate\n,DdipCreTime\n,DdipKinoCd\n,*\nFROM DDIP D\nORDER BY D.DdipCreDate DESC, D.DdipCreTime DESC"
    },
    {
      "type": 2,
      "id": "u0DNtCQI6CUljzVDFYEE",
      "name": "法人カード",
      "parentCSV": "25gIHoSViDLd3ddZbuHk,WBfpM8fyNdVVJsDTRtm1",
      "parentId": "WBfpM8fyNdVVJsDTRtm1",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"14\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"11\",\"mi\":\"26\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      },
      "value": "①決議伺にて抽出\n　条件：未報告データ\n②決議伺提出：ステータス通常化、提出フラグON\n③決議伺依頼提出：依頼提出フラグON\n\n④報告にて抽出\n　条件：依頼提出済み\n　※リンククリックで報告データ作成（申請区分=2）\n\n\n"
    },
    {
      "type": 1,
      "id": "aRFBU1swCE0uaIZE8jsk",
      "name": "依頼書",
      "parentCSV": "l6CjmpqHLhyn5yCaRcHG",
      "parentId": "l6CjmpqHLhyn5yCaRcHG",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"15\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"15\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      }
    },
    {
      "type": 1,
      "id": "wTwZiLWHNFDQpJgyG7La",
      "name": "報告書",
      "parentCSV": "l6CjmpqHLhyn5yCaRcHG",
      "parentId": "l6CjmpqHLhyn5yCaRcHG",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"15\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"15\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      }
    },
    {
      "type": 1,
      "id": "9SzR1UBe8WnIk6XOc6L3",
      "name": "受付",
      "parentCSV": "l6CjmpqHLhyn5yCaRcHG",
      "parentId": "l6CjmpqHLhyn5yCaRcHG",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"15\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"15\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      }
    },
    {
      "type": 2,
      "id": "bY070UJl4Wwpdk3vJ2oV",
      "name": "2026/02/01 改修",
      "parentCSV": "l6CjmpqHLhyn5yCaRcHG,aRFBU1swCE0uaIZE8jsk",
      "parentId": "aRFBU1swCE0uaIZE8jsk",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"00\",\"mi\":\"15\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"11\",\"mi\":\"26\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      },
      "value": "// フロー）--------------------------------------\n①支出伺：決議書作成\n↓\n（概算：出金伝票確定）\n↓\n②支出伺：報告書作成\n↓\n③支出業務：伺書受付\n↓\n④支出業務：決議書作成\n\n// 更新）--------------------------------------\n# ①決議伺→報告書\n・更新：提出フラグON、ステータス通常\n\n# ②報告書→出金伝票確定（概算時）\n・\n\n# ③報告書→受付（概算なら出金伝票確定が行われているもの）\n・更新：依頼提出フラグON、ステータス通常\n\n# ④受付→決議書\n・更新：受付フラグON\n\n// モード）--------------------------------------\n#1 決議伺訂正削除\n・PGID ：A031015_00\n・PMODE：A031017_00（MstViw.C_PMODE_TEISEI_KETUGI）\n・IMODE：A031012_00\n\n#1 報告書訂正削除\n・PGID ：A031015_00\n・PMODE：A031016_00（MstViw.C_PMODE_TEISEI_HOKOKU）\n・IMODE：A031011_00\n\n#2 決議伺作成\n・PGID ：A031010_00\n・PMODE：A031017_00\n・IMODE：A031012_00\n\n#2 報告書作成\n・PGID ：A031010_00\n・PMODE：A031016_00\n・IMODE：A031011_00\n\n// ）--------------------------------------\n\n\n\n\n\n\n\n\n\n"
    },
    {
      "type": 3,
      "id": "HkAeI1TA4BZf7TwQ3Ty5",
      "name": "Replacer",
      "parentCSV": "25gIHoSViDLd3ddZbuHk,WBfpM8fyNdVVJsDTRtm1",
      "parentId": "WBfpM8fyNdVVJsDTRtm1",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"11\",\"mi\":\"45\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"11\",\"mi\":\"45\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      }
    },
    {
      "type": 3,
      "id": "NE887ILMVeMvzBcbwRLc",
      "name": "Formatter",
      "parentCSV": "25gIHoSViDLd3ddZbuHk,WBfpM8fyNdVVJsDTRtm1",
      "parentId": "WBfpM8fyNdVVJsDTRtm1",
      "deleted": false,
      "createdAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"11\",\"mi\":\"45\"}",
      "updatedAt": "{\"yyyy\":2026,\"mm\":\"03\",\"dd\":\"03\",\"hh\":\"11\",\"mi\":\"45\"}",
      "config": {
        "top": "auto",
        "left": "auto"
      }
    }
  ],
  "CONFIG": {
    "desktopScale": 0.7000000000000001
  }
}
}