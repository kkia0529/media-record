// ==========================================
// 1. 全域變數與通用 Helper 函式
// ==========================================
window.currentCoverBase64 = '';
window.currentReadLink = '';

// 輔助文字轉換函式
function getGenderText(genderKey) {
  if (typeof genderMapToText !== 'undefined' && genderMapToText[genderKey]) {
    return genderMapToText[genderKey];
  }
  const map = { 
    bg: '言情', 
    bl: '純愛', 
    no_cp: '無CP', 
    no_cp_female: '無CP女主', 
    no_cp_male: '無CP男主' 
  };
  return map[genderKey] || genderKey;
}

function getProgressText(progKey) {
  const map = { updating: '更新中', finished: '已完結', reading: '閱讀中' };
  return map[progKey] || progKey;
}

// 畫面縮放
function resizeApp() {
  const container = document.querySelector('.app-container');
  if (!container) return;

  const designWidth = 1920;
  const designHeight = 1080;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const scaleX = windowWidth / designWidth;
  const scaleY = windowHeight / designHeight;
  const scale = Math.min(scaleX, scaleY);
  

  container.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener('resize', resizeApp);

// ==========================================
// 2. 視圖與 UI 選項邏輯
// ==========================================
window.toggleSubMenu = function(groupId) {
  const targetGroup = document.getElementById(groupId);
  const isOpen = targetGroup.classList.contains('active');

  document.querySelectorAll('.nav-group').forEach(group => {
    group.classList.remove('active');
  });

  if (!isOpen) {
    targetGroup.classList.add('active');
  }
};

function updateDetailPanelBackground(categoryKey) {
  const panel = document.querySelector('.detail-panel');
  if (!panel) return;

  panel.classList.remove('bg-novel', 'bg-video', 'bg-comic', 'bg-game');
  const bgMap = {
    novel: 'bg-novel',
    video: 'bg-video',
    comic: 'bg-comic',
    game: 'bg-game'
  };

  const targetClass = bgMap[categoryKey] || 'bg-novel';
  panel.classList.add(targetClass);
}

function updateSubcategories() {
  const categorySelect = document.getElementById('categorySelect');
  const subCategorySelect = document.getElementById('subCategorySelect');
  if (!categorySelect || !subCategorySelect) return;
  
  const selectedCategory = categorySelect.value;
  subCategorySelect.innerHTML = '<option value="" disabled selected hidden>細類</option>';

  if (selectedCategory === 'novel') {
    appendOptions(subCategorySelect, [
      { text: '原創', value: 'original' },
      { text: '綜英美', value: 'crossover' },
      { text: '衍生', value: 'derivative' },
      { text: '其他', value: 'other' }
    ]);
  } else if (selectedCategory === 'video') {
    appendOptions(subCategorySelect, [
      { text: '動畫', value: 'animation' },
      { text: '電影', value: 'movie' },
      { text: '影集', value: 'series' },
      { text: '其他', value: 'other' }
    ]);
  } else if (selectedCategory === 'game') {
    appendOptions(subCategorySelect, [
      { text: '實況', value: 'stream' },
      { text: '遊玩', value: 'play' },
      { text: '解謎', value: 'puzzle' },
      { text: '其他', value: 'other' }
    ]);
  } else {
    let optElement = document.createElement('option');
    optElement.value = 'none';
    optElement.disabled = true;
    subCategorySelect.appendChild(optElement);
  }
}

function appendOptions(selectElement, optionsArray) {
  optionsArray.forEach(opt => {
    let optElement = document.createElement('option');
    optElement.value = opt.value;
    optElement.textContent = opt.text;
    selectElement.appendChild(optElement);
  });
  selectElement.disabled = false;
}

window.toggleViewMode = function() {
  const shelf = document.getElementById('shelf-view');
  const btn = document.getElementById('viewToggleBtn');
  
  if (!shelf) return;

  if (shelf.classList.contains('card-view')) {
    shelf.classList.remove('card-view');
    shelf.classList.add('table-view');
    if (btn) {
      btn.classList.remove('card-mode');
      btn.classList.add('table-mode');
    }
    localStorage.setItem('preferredView', 'table');
  } else {
    shelf.classList.remove('table-view');
    shelf.classList.add('card-view');
    if (btn) {
      btn.classList.remove('table-mode');
      btn.classList.add('card-mode');
    }
    localStorage.setItem('preferredView', 'card');
  }
};

// ==========================================
// 3. 資料渲染邏輯
// ==========================================
function renderOngoingSection() {
  const ongoingContainer = document.getElementById('ongoingContainer');
  if (!ongoingContainer) return;

  const ongoingItems = (typeof bookDatabase !== 'undefined' ? bookDatabase : [])
    .filter(item => item.isOngoing === true)
    .slice(0, 4);

  ongoingContainer.innerHTML = '';

  for (let i = 0; i < 4; i++) {
    const item = ongoingItems[i];
    const itemAnchor = document.createElement('a');
    itemAnchor.className = 'ongoing-item';

    if (item) {
      itemAnchor.textContent = item.title || '無標題';
      itemAnchor.href = `detail.html?mode=view&id=${item.id}`;
    } else {
      itemAnchor.textContent = '';
      itemAnchor.href = 'javascript:void(0)';
      itemAnchor.style.cursor = 'default';
      itemAnchor.style.pointerEvents = 'none'; 
    }

    ongoingContainer.appendChild(itemAnchor);
  }
}

function renderRecentEditSection() {
  const recentCard = document.querySelector('.recent-edit-card');
  if (!recentCard) return;

  if (typeof bookDatabase === 'undefined' || bookDatabase.length === 0) return;

  const lastId = typeof getLastEditedBookId === 'function' ? getLastEditedBookId() : null;
  let targetBook = bookDatabase.find(item => item.id === lastId);
  if (!targetBook) {
    targetBook = bookDatabase[0];
  }

  recentCard.href = `detail.html?mode=view&id=${targetBook.id}`;

  const thumbEl = recentCard.querySelector('.recent-edit-thumb');
  const titleEl = recentCard.querySelector('.recent-edit-title');

  if (thumbEl) {
    if (targetBook.cover && targetBook.cover !== "111") {
      thumbEl.innerHTML = `<img src="${targetBook.cover}" alt="封面" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
      thumbEl.textContent = '';
    }
  }

  if (titleEl) {
    titleEl.textContent = targetBook.title || '無標題';
  }
}

function renderShelf(dataList) {
  const cardGrid = document.querySelector('.card-grid-content');
  const tableBody = document.querySelector('.custom-data-table tbody');
  const countBadge = document.querySelector('.count-badge');
  const shelf = document.getElementById('shelf-view');
  
  if (!cardGrid || !tableBody) return;



// === 新增：依據完成日期 (completeDate) 從舊到新 (升冪) 排序 ===
  dataList.sort((a, b) => {
    const dateA = a.completeDate || '';
    const dateB = b.completeDate || '';
    // 若無日期可排至最後面，否則依字串/日期進行比較
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA.localeCompare(dateB);
  });
  // ========================================================

  if (countBadge) {
    countBadge.textContent = dataList.length;
  }

  cardGrid.innerHTML = '';
  tableBody.innerHTML = '';

  // 取得當前細類名稱 (例如: "原創")
  const currentSub = shelf ? shelf.getAttribute('data-sub') : '';
  // 取得該細類的預設標籤集
  const currentSubTags = (typeof tagDatabase !== 'undefined' && tagDatabase[currentSub]) 
    ? tagDatabase[currentSub] 
    : [];

  dataList.forEach(item => {
    // --- 1. 卡片視圖 ---
    const cardEl = document.createElement('div');
    cardEl.className = 'book-card';
    cardEl.onclick = () => {
      location.href = `detail.html?mode=view&id=${item.id}`;
    };

    cardEl.innerHTML = `
      <div class="book-img-placeholder">${item.cover ? `<img src="${item.cover}" style="width:100%;height:100%;object-fit:cover;">` : '圖片'}</div>
      <div class="book-name">${item.title}</div>
    `;
    cardGrid.appendChild(cardEl);

    // --- 2. 表格視圖 ---
    const rowEl = document.createElement('tr');
    
    // [需求 4] 點擊表格整行跳轉至該項詳細頁面
    rowEl.style.cursor = 'pointer';
    rowEl.onclick = () => {
      location.href = `detail.html?mode=view&id=${item.id}`;
    };

    const stars = '★'.repeat(item.rating || 0) + '☆'.repeat(5 - (item.rating || 0));
    
    // [需求 3] 標籤繼承色彩與排序邏輯
    let tagsHTML = '';
    if (item.tags && Array.isArray(item.tags)) {
      // 1. 取得對應細類的完整標籤庫
      const mainCatMap = { novel: "小說", comic: "漫畫", video: "影視", game: "遊戲" };
      const mainCatName = mainCatMap[item.category] || "小說";
      const subName = item.subCategory || currentSub || "原創";
      const fullKey = `${mainCatName}_${subName}`;
      const targetSubTags = (typeof tagDatabase !== 'undefined' && tagDatabase[fullKey]) ? tagDatabase[fullKey] : [];

      // 2. 將書籍上的字串標籤轉為包含顏色資訊的標籤物件
      let mappedTags = item.tags.map(tagName => {
        const tagObj = targetSubTags.find(t => t.name === tagName);
        return {
          name: tagName,
          color: tagObj ? tagObj.color : 'c1'
        };
      });

      // 3. 呼叫 sortTags 進行「顏色 (c1->c5) -> 字數長短」排序
      if (typeof sortTags === 'function') {
        mappedTags = sortTags(mappedTags);
      }

      // 4. 組合 HTML
      tagsHTML = mappedTags.map(tag => {
        const colorKey = tag.color || 'c1';
        const colorSetting = (typeof TAG_COLORS !== 'undefined' && TAG_COLORS[colorKey]) 
          ? TAG_COLORS[colorKey] 
          : { bg: '#858078', text: '#fff' };

        return `<span class="tag-badge" style="background-color: ${colorSetting.bg}; color: ${colorSetting.text};">${tag.name}</span>`;
      }).join(' ');
    }
    
    // [需求 2] 日期改顯示完成日期 (completeDate)
    rowEl.innerHTML = `
      <td title="${item.title}">${item.title}</td>
      <td title="${item.author || ''}">${item.author || ''}</td>
      <td>${getGenderText(item.gender)}</td>
      <td>${getProgressText(item.progress)}</td>
      <td>${item.completeDate || ''}</td>
      <td>${stars}</td>
      <td>${tagsHTML}</td>
    `;
    tableBody.appendChild(rowEl);
  });

  // 動態渲染卡片後，重新綁定 3D 浮動效果
  rebindBookCoverTilts();
}

function updateOngoingUI(isOngoing) {
  const btn = document.getElementById('ongoingBtn');
  if (!btn) return;
  if (isOngoing) {
    btn.classList.add('active');
    btn.title = "取消進行中";
  } else {
    btn.classList.remove('active');
    btn.title = "設為進行中";
  }
}

function toggleOngoingStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  if (!bookId || typeof bookDatabase === 'undefined') return;

  const currentBook = bookDatabase.find(book => book.id === bookId);
  if (!currentBook) return;

  let ongoingList = bookDatabase.filter(book => book.isOngoing === true);

  if (currentBook.isOngoing) {
    currentBook.isOngoing = false;
    updateOngoingUI(false);
  } else {
    if (ongoingList.length >= 4) {
      alert("進行中項目最多只能同時有 4 項！請先取消其他項目的進行中狀態。");
      return;
    }
    currentBook.isOngoing = true;
    updateOngoingUI(true);
  }

  if (typeof saveDatabase === 'function') {
    saveDatabase();
  } else {
    localStorage.setItem('bookDatabase', JSON.stringify(bookDatabase));
  }
}

function initFilterOptions() {
  const config = typeof mediaOptionsConfig !== 'undefined' ? mediaOptionsConfig.novel : null;
  if (!config) return;

  const genderSelect = document.getElementById('filterGender');
    if (genderSelect && config.gender) {
      genderSelect.innerHTML = '<option value="" disabled selected hidden>性向</option>' +
        config.gender.map(item => {
          // 使用 database.js 提供的 genderMapToKey 轉換為英文 key (如 "言情" -> "bg")
          const gKey = typeof genderMapToKey !== 'undefined' ? (genderMapToKey[item] || item) : item;
          return `<option value="${gKey}">${item}</option>`;
        }).join('');
    }

  const progressSelect = document.getElementById('filterProgress');
  if (progressSelect && config.progress) {
    progressSelect.innerHTML = '<option value="" disabled selected hidden>進度</option>' +
      config.progress.map(item => `<option value="${item}">${item}</option>`).join('');
  }

  const statusSelect = document.getElementById('filterStatus');
  if (statusSelect && config.status) {
    statusSelect.innerHTML = '<option value="" disabled selected hidden>狀態</option>' +
      config.status.map(item => `<option value="${item}">${item}</option>`).join('');
  }

  const ratingSelect = document.getElementById('filterRating');
  if (ratingSelect) {
    const ratingOptions = [
      { text: '☆☆☆☆☆', value: '0' },
      { text: '★☆☆☆☆', value: '1' },
      { text: '★★☆☆☆', value: '2' },
      { text: '★★★☆☆', value: '3' },
      { text: '★★★★☆', value: '4' },
      { text: '★★★★★', value: '5' }
    ];
    ratingSelect.innerHTML = '<option value="" disabled selected hidden>評分</option>' +
      ratingOptions.map(item => `<option value="${item.value}">${item.text}</option>`).join('');
  }
}



function initDetailOptions(categoryKey, book) {
  const config = typeof mediaOptionsConfig !== 'undefined' ? (mediaOptionsConfig[categoryKey] || mediaOptionsConfig['novel']) : null;
  if (!config) return;

  const categorySelect = document.getElementById('editCategorySelect');
  if (categorySelect && config.types) {
    categorySelect.innerHTML = config.types.map(t => `<option value="${t}">${t}</option>`).join('');
    categorySelect.value = book.subCategory || config.types[0];
  }

  const genderSelect = document.getElementById('editGenderSelect');
  if (genderSelect && config.gender) {
    genderSelect.innerHTML = config.gender.map(gText => {
      const gKey = typeof genderMapToKey !== 'undefined' ? (genderMapToKey[gText] || gText) : gText;
      return `<option value="${gKey}">${gText}</option>`;
    }).join('');
    genderSelect.value = book.gender || 'bg';
  }

  const progressSelect = document.getElementById('editProgressSelect');
  if (progressSelect && config.progress) {
    progressSelect.innerHTML = config.progress.map(p => `<option value="${p}">${p}</option>`).join('');
    progressSelect.value = book.progress || config.progress[0];
  }

  const statusSelect = document.getElementById('editStatusSelect');
  if (statusSelect && config.status) {
    statusSelect.innerHTML = config.status.map(s => `<option value="${s}">${s}</option>`).join('');
    statusSelect.value = book.status || config.status[0];
  }
}

// ==========================================
// 4. 3D 視差與浮動效果
// ==========================================
function bindTiltEffect(el, maxAngle = 12, scaleHover = 1.03) {
  if (!el || el.dataset.tiltBound === "true") return;

  el.dataset.tiltBound = "true";
  el.style.transformStyle = "preserve-3d";
  el.style.transition = "transform 0.1s linear, filter 0.1s linear";

  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * maxAngle;
    const rotateY = ((x - centerX) / centerX) * maxAngle;

    const shadowX = -rotateY * 0.8;
    const shadowY = rotateX * 0.8 + 6;

    el.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px) scale(${scaleHover})`;
    el.style.filter = `drop-shadow(${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 10px rgba(0, 0, 0, 0.3))`;
  });

  el.addEventListener("mouseleave", () => {
    el.style.transition = "transform 0.3s ease, filter 0.3s ease";
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
    el.style.filter = "none";

    setTimeout(() => {
      el.style.transition = "transform 0.1s linear, filter 0.1s linear";
    }, 300);
  });
}

function init3DTiltEffects() {
  const coverBox = document.getElementById('coverBox');
  if (coverBox) {
    bindTiltEffect(coverBox, 12, 1.03);
  }
  rebindBookCoverTilts();
}

function rebindBookCoverTilts() {
  const bookCovers = document.querySelectorAll('.book-img-placeholder');
  bookCovers.forEach(cover => bindTiltEffect(cover, 10, 1.04));
}

// 渲染封面圖片 UI
function renderCoverImage(coverData) {
  const coverBox = document.getElementById('coverBox');
  if (!coverBox) return;

  coverBox.textContent = '';
  if (coverData) {
    coverBox.style.backgroundImage = `url('${coverData}')`;
  } else {
    coverBox.style.backgroundImage = '';
  }
}

// ==========================================
// 5. 主初始化區塊 (DOM Ready 統一處理)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // A. 字型監聽
  if (document.fonts) {
    document.fonts.ready.then(() => {
      document.body.classList.add('fonts-loaded');
    });
  }

  // B. 畫面比例與選單初始化
  resizeApp();
  renderOngoingSection();
  renderRecentEditSection();
  initFilterOptions();

  // C. Flatpickr 初始化
  const dateInput = document.getElementById('startDateInput');
  if (dateInput && typeof flatpickr !== 'undefined') {
    flatpickr(dateInput, {
      dateFormat: "Y/m/d",
      allowInput: true,
      disableMobile: "true",
      clickOpens: true
    });
  }

  // D. 書架視圖恢復與渲染
  const shelf = document.getElementById('shelf-view');
  const btn = document.getElementById('viewToggleBtn');
  const savedView = localStorage.getItem('preferredView');

  if (shelf) {
    if (savedView === 'table') {
      shelf.classList.remove('card-view');
      shelf.classList.add('table-view');
      if (btn) {
        btn.classList.remove('card-mode');
        btn.classList.add('table-mode');
      }
    } else {
      shelf.classList.remove('table-view');
      shelf.classList.add('card-view');
      if (btn) {
        btn.classList.remove('table-mode');
        btn.classList.add('card-mode');
      }
    }

    const currentCategory = shelf.getAttribute('data-category');
    const currentSubCategory = shelf.getAttribute('data-sub');

    if (currentCategory && typeof bookDatabase !== 'undefined') {

      let filteredData;

      // ★ 漫畫特殊規則：
      // 漫畫書架不依韓漫 / 日漫 / 美漫 / 其他拆分
      if (currentCategory === 'comic') {

        filteredData = bookDatabase.filter(item => {
          return item.category === 'comic';
        });

      } else if (currentSubCategory) {

        // 其他分類維持原本的「大分類 + 細分類」過濾
        filteredData = bookDatabase.filter(item => {
          return item.category === currentCategory &&
                item.subCategory === currentSubCategory;
        });

      } else {

        // 沒有指定細分類時，只依大分類
        filteredData = bookDatabase.filter(item => {
          return item.category === currentCategory;
        });

      }

      renderShelf(filteredData);

    } else if (typeof bookDatabase !== 'undefined') {

      renderShelf(bookDatabase);

    }
  }

  // E. 靜態卡片 3D 視差初始化
  const tiltCards = document.querySelectorAll(`
    .category-card, 
    .data-transfer-card, 
    .profile-card, 
    .ongoing-card, 
    .recent-edit-card, 
    .quit-card
  `);

  tiltCards.forEach(card => {
    const floatingLayer = card.querySelector('.card-floating-layer');

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -((y - centerY) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
      
      const shadowX = -rotateY * 0.8;
      const shadowY = rotateX * 0.8 + 8;
      card.style.filter = `drop-shadow(${shadowX}px ${shadowY}px 18px rgba(0, 0, 0, 0.45))`;
      card.style.zIndex = "10";

      if (floatingLayer) {
        const moveX = (x - centerX) * 0.05; 
        const moveY = (y - centerY) * 0.05;
        floatingLayer.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
      card.style.filter = "none";
      card.style.zIndex = "1";

      if (floatingLayer) {
        floatingLayer.style.transition = "transform 0.3s ease";
        floatingLayer.style.transform = "translate(0px, 0px)";
        setTimeout(() => {
          floatingLayer.style.transition = "none";
        }, 300);
      }
    });
  });

  init3DTiltEffects();

  // F. 清除篩選按鈕
  const clearBtn = document.getElementById('clearFilterBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.querySelectorAll('.list-filter-container select').forEach(select => {
        select.selectedIndex = 0;
      });
      document.querySelectorAll('.list-filter-container input[type="text"]').forEach(input => {
        input.value = '';
      });

      if (shelf && typeof bookDatabase !== 'undefined') {
        const currentCategory = shelf.getAttribute('data-category');
        const currentSubCategory = shelf.getAttribute('data-sub');

        if (currentCategory && currentSubCategory) {
          const filteredData = bookDatabase.filter(item => {
            return item.category === currentCategory && item.subCategory === currentSubCategory;
          });
          renderShelf(filteredData);
        } else {
          renderShelf(bookDatabase);
        }
      }
    });
  }

  // G. Tauri 退出按鈕
  const quitBtn = document.querySelector(".quit-card");
  if (quitBtn) {
    quitBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const { getCurrentWindow } = window.__TAURI__.window;
        await getCurrentWindow().close();
      } catch (error) {
        console.error("關閉應用程式失敗：", error);
        window.close();
      }
    });
  }

  // H. 封面圖片右鍵與 Modal 事件
  const coverBox = document.getElementById('coverBox');
  const contextMenu = document.getElementById('coverContextMenu');
  const btnMenuUrl = document.getElementById('btnMenuUrl');
  const btnMenuDelete = document.getElementById('btnMenuDelete');
  const urlModalOverlay = document.getElementById('urlModalOverlay');
  const urlModalInput = document.getElementById('urlModalInput');
  const btnUrlCancel = document.getElementById('btnUrlCancel');
  const btnUrlConfirm = document.getElementById('btnUrlConfirm');

  if (coverBox) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.id = 'coverFileInput';
    document.body.appendChild(fileInput);

    coverBox.addEventListener('click', () => {
      if (document.body.classList.contains('edit-state')) {
        fileInput.click();
      }
    });

    coverBox.addEventListener('contextmenu', (e) => {
      if (document.body.classList.contains('edit-state')) {
        e.preventDefault();
        const container = document.querySelector('.app-container');
        let scale = 1;
        
        if (container) {
          const transformVal = window.getComputedStyle(container).transform;
          if (transformVal !== 'none') {
            const matrixValues = transformVal.match(/matrix\((.+)\)/);
            if (matrixValues) {
              scale = parseFloat(matrixValues[1].split(',')[0]);
            }
          }
        }

        const rect = document.body.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;

        if (contextMenu) {
          contextMenu.style.left = `${mouseX}px`;
          contextMenu.style.top = `${mouseY}px`;
          contextMenu.style.display = 'block';
        }
      }
    });

    if (btnMenuUrl) {
      btnMenuUrl.addEventListener('click', () => {
        if (contextMenu) contextMenu.style.display = 'none';
        if (window.currentCoverBase64 && !window.currentCoverBase64.startsWith('data:image')) {
          urlModalInput.value = window.currentCoverBase64;
        } else {
          urlModalInput.value = '';
        }
        if (urlModalOverlay) {
          urlModalOverlay.style.display = 'flex';
          urlModalInput.focus();
        }
      });
    }

    if (btnMenuDelete) {
      btnMenuDelete.addEventListener('click', () => {
        if (contextMenu) contextMenu.style.display = 'none';
        window.currentCoverBase64 = '';
        renderCoverImage('');
      });
    }

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          window.currentCoverBase64 = evt.target.result;
          renderCoverImage(window.currentCoverBase64);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (btnUrlConfirm) {
    btnUrlConfirm.addEventListener('click', () => {
      const val = urlModalInput.value.trim();
      window.currentCoverBase64 = val;
      renderCoverImage(window.currentCoverBase64);
      if (urlModalOverlay) urlModalOverlay.style.display = 'none';
    });
  }

  if (btnUrlCancel) {
    btnUrlCancel.addEventListener('click', () => {
      if (urlModalOverlay) urlModalOverlay.style.display = 'none';
    });
  }

  if (urlModalInput) {
    urlModalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (btnUrlConfirm) btnUrlConfirm.click();
      }
    });
  }

// I. 跳轉網址右鍵與 Modal 事件
  const readBtnGroup = document.querySelector('.read-btn-group');
  const linkContextMenu = document.getElementById('linkContextMenu');
  const btnMenuLinkUrl = document.getElementById('btnMenuLinkUrl');
  const btnMenuLinkDelete = document.getElementById('btnMenuLinkDelete');
  const linkUrlModalOverlay = document.getElementById('linkUrlModalOverlay');
  const linkUrlModalInput = document.getElementById('linkUrlModalInput');
  const btnLinkUrlCancel = document.getElementById('btnLinkUrlCancel');
  const btnLinkUrlConfirm = document.getElementById('btnLinkUrlConfirm');

  if (readBtnGroup) {
    readBtnGroup.addEventListener('contextmenu', (e) => {
      if (document.body.classList.contains('edit-state')) {
        e.preventDefault();
        e.stopPropagation(); // ★ 新增這行：防止事件冒泡到 document 導致選單立刻被關閉

        const container = document.querySelector('.app-container');
        let scale = 1;
        if (container) {
          const transformVal = window.getComputedStyle(container).transform;
          if (transformVal !== 'none') {
            const matrixValues = transformVal.match(/matrix\((.+)\)/);
            if (matrixValues) scale = parseFloat(matrixValues[1].split(',')[0]);
          }
        }

        const rect = document.body.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;

        if (linkContextMenu) {
          linkContextMenu.style.left = `${mouseX}px`;
          linkContextMenu.style.top = `${mouseY}px`;
          linkContextMenu.style.display = 'block';
        }
      }
    });

    // 處理點擊跳轉事件（支援 Tauri v2 Opener API）
    readBtnGroup.addEventListener('click', async (e) => {
      if (document.body.classList.contains('edit-state')) return;

      const url = window.currentReadLink;
      if (!url || url === '#') return;

      e.preventDefault();

      if (window.__TAURI__ && window.__TAURI__.opener) {
        try {
          await window.__TAURI__.opener.openUrl(url);
        } catch (err) {
          console.error("開啟外部網址失敗：", err);
          window.open(url, '_blank');
        }
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  }

if (btnMenuLinkUrl) {
    btnMenuLinkUrl.addEventListener('click', () => {
      if (linkContextMenu) linkContextMenu.style.display = 'none';
      if (linkUrlModalInput) linkUrlModalInput.value = window.currentReadLink || '';
      if (linkUrlModalOverlay) linkUrlModalOverlay.style.display = 'flex';
    });
  }

  if (btnMenuLinkDelete) {
    btnMenuLinkDelete.addEventListener('click', () => {
      if (linkContextMenu) linkContextMenu.style.display = 'none';
      window.currentReadLink = '';
      const readBtnGroup = document.querySelector('.read-btn-group');
      if (readBtnGroup) readBtnGroup.href = '#';
    });
  }

  if (btnLinkUrlConfirm) {
    btnLinkUrlConfirm.addEventListener('click', () => {
      const val = linkUrlModalInput ? linkUrlModalInput.value.trim() : '';
      window.currentReadLink = val;
      const readBtnGroup = document.querySelector('.read-btn-group');
      if (readBtnGroup) {
        readBtnGroup.href = val || '#';
        if (val) {
          readBtnGroup.setAttribute('target', '_blank');
          readBtnGroup.setAttribute('rel', 'noopener noreferrer');
        } else {
          readBtnGroup.removeAttribute('target');
          readBtnGroup.removeAttribute('rel');
        }
      }
      if (linkUrlModalOverlay) linkUrlModalOverlay.style.display = 'none';
    });
  }

  if (btnLinkUrlCancel) {
    btnLinkUrlCancel.addEventListener('click', () => {
      if (linkUrlModalOverlay) linkUrlModalOverlay.style.display = 'none';
    });
  }

  // 點擊全域任意處自動關閉自訂右鍵選單
  document.addEventListener('click', () => {
    // 加上 safe check 避免 contextMenu 變數未定義而報錯
    const coverContextMenu = document.getElementById('coverContextMenu');
    if (coverContextMenu) coverContextMenu.style.display = 'none';
    if (linkContextMenu) linkContextMenu.style.display = 'none';
  });

});