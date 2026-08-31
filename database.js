/* ==========================================================
   Media Record - 全域下拉選單選項與對照表 (database.js)
   ========================================================== */

const mediaOptionsConfig = {
  novel: {
    types: ["原創", "綜英美", "衍生", "其他"],
    gender: ["言情", "純愛", "無CP", "無CP女主", "無CP男主"],
    progress: ["更新中", "已入V", "已完結", "暫時停更", "更番外中"],
    status: ["待閱讀", "閱讀中", "已讀完", "暫棄"]
  },
  comic: {
    types: ["韓漫", "日漫", "美漫", "其他"],
    gender: ["言情", "純愛", "無CP", "無CP女主", "無CP男主"],
    progress: ["更新中", "季完結", "已完結", "休刊中", "更番外中"],
    status: ["待閱讀", "閱讀中", "已讀完", "暫棄"]
  },
  video: {
    types: ["動畫", "電影", "影集", "其他"],
    region: ["美國", "日本", "韓國", "台灣", "中國", "其他"],
    progress: ["更新中", "季完結", "已完結"],
    status: ["待觀看", "觀看中", "已看完", "暫棄"]
  },
  game: {
    types: ["實況", "遊玩", "解謎", "其他"],
    subCategories: {
      "實況": ["手遊", "單機遊戲", "其他"],
      "其他": ["手遊", "單機遊戲", "其他"],
      "解謎": ["時間軸", "家族樹", "網站式", "填詞", "探索冒險", "邏輯", "其他"],
      "遊玩": ["MC", "單機遊戲", "網頁遊戲", "其他"]
    }
  }
};

// 性向中英文轉換對照表
const genderMapToText = { bg: "言情", bl: "純愛", no_cp: "無CP", no_cp_female: "無CP女主", no_cp_male: "無CP男主" };
const genderMapToKey = { "言情": "bg", "純愛": "bl", "無CP": "no_cp", "無CP女主": "no_cp_female", "無CP男主": "no_cp_male" };

function getGenderText(genderKey) {
  return genderMapToText[genderKey] || genderKey;
}

function getProgressText(progKey) {
  const map = { updating: '更新中', finished: '已完結', reading: '閱讀中' };
  return map[progKey] || progKey;
}

// 初始資料庫
let bookDatabase = [
  {
    id: "novel_001",
    category: "novel",
    subCategory: "原創",
    title: "ABC",
    author: "AAA",
    cover: "111",
    gender: "bg",
    startDate: "",
    completeDate: "2025/10/10",
    rating: 4,
    tags: ["標籤01", "標籤02", "標籤03"],
    progress: "已完結",
    status: "已讀完",
    remark: "123",
    thoughts: "123"
  }
];

// 優先讀取 localStorage 存檔[cite: 20, 23]
const savedDB = localStorage.getItem('bookDatabase');
if (savedDB) {
  try {
    bookDatabase = JSON.parse(savedDB);
  } catch (e) {
    console.error("解析 localStorage 資料失敗", e);
  }
}

function saveDatabase() {
  localStorage.setItem('bookDatabase', JSON.stringify(bookDatabase));
}

// === 新增：最新一筆編輯紀錄存取 logic ===
function updateLastEditedBook(bookId) {
  if (!bookId) return;
  localStorage.setItem('lastEditedBookId', bookId);
}

function getLastEditedBookId() {
  return localStorage.getItem('lastEditedBookId');
}

// 5 種預設顏色定義 (可依需求調整色碼)
const TAG_COLORS = {
  c1: { id: "c1", bg: "#cccccc", text: "#353232", priority: 1 }, // 預設灰
  c2: { id: "c2", bg: "#c5d5c7", text: "#2f342b", priority: 2 }, // 綠
  c3: { id: "c3", bg: "#debcb7", text: "#322c2c", priority: 3 }, // 紅/粉
  c4: { id: "c4", bg: "#c1ccd7", text: "#242b2f", priority: 4 }, // 藍
  c5: { id: "c5", bg: "#e1d3ac", text: "#35332b", priority: 5 }  // 黃/棕
};

// 標籤排序邏輯：1. 顏色 (c1 -> c5)  2. 字數長短 (短 -> 長)
function sortTags(tagList) {
  return tagList.sort((a, b) => {
    // 取得顏色 priority，若未設定則排在最後
    const priorityA = TAG_COLORS[a.color] ? TAG_COLORS[a.color].priority : 99;
    const priorityB = TAG_COLORS[b.color] ? TAG_COLORS[b.color].priority : 99;
    
    // 先比顏色順序
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // 顏色相同時，再比字數長短 (短到長)
    return a.name.length - b.name.length;
  });
}

// 分類細類標籤資料庫 (預設標籤集)
let tagDatabase = {
  // 小說類
  "小說_原創": [],
  "小說_綜英美": [],
  "小說_衍生": [],
  "小說_其他": [],

  // 漫畫類 (統一標籤庫)
  "漫畫_漫畫": [],

  // 影視類
  "影視_動畫": [], 
  "影視_電影": [], 
  "影視_影集": [], 
  "影視_其他": [],

  // 遊戲類
  "遊戲_實況": [], 
  "遊戲_遊玩": [], 
  "遊戲_解謎": [], 
  "遊戲_其他": []
};

// 優先讀取 localStorage 中的標籤庫存檔
const savedTagDB = localStorage.getItem('tagDatabase');
if (savedTagDB) {
  try {
    tagDatabase = JSON.parse(savedTagDB);
  } catch (e) {
    console.error("解析 tagDatabase 失敗", e);
  }
}

