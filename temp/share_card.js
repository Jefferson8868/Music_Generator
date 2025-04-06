// const generateBtn = document.getElementById('generate-card-btn');
// const shareCardContainer = document.getElementById('share-card-container');
// const shareCard = document.getElementById('share-card');
// const downloadBtn = document.getElementById('download-card-btn');
// const closeBtn = document.getElementById('close-card-btn');

// const colorHistoryList = document.getElementById('color-history');
// const MAX_HISTORY = 7;
// const selectedColorName = document.getElementById('selected-color-name');

// function updateColorHistoryDisplay() {
//     const records = JSON.parse(localStorage.getItem('userRecords') || '[]');
//     if (!colorHistoryList || records.length === 0) return;
  
//     // 最新在前
//     const lastColors = records.slice(-MAX_HISTORY).reverse();
//     colorHistoryList.innerHTML = '';
  
//     lastColors.forEach(item => {
//       const li = document.createElement('li');
//       li.textContent = item.color;
//       li.style.listStyle = 'none';
//       li.style.paddingLeft = '1em';
//       li.style.position = 'relative';
//       li.style.marginBottom = '4px';
  
//       const dot = document.createElement('span');
//       dot.style.position = 'absolute';
//       dot.style.left = '0';
//       dot.style.top = '4px';
//       dot.style.width = '10px';
//       dot.style.height = '10px';
//       dot.style.borderRadius = '50%';
//       dot.style.backgroundColor = getColorHexByName(item.color) || '#ccc';
//       li.prepend(dot);
  
//       colorHistoryList.appendChild(li);
//     });
// }  

// function getColorHexByName(name) {
//   if (!window.wuxingColorData) return null;
//   for (const category of window.wuxingColorData) {
//     const match = category.colors.find(c => c.Title === name);
//     if (match) return match.Color.replace(/^#FF/, '#');
//   }
//   return null;
// }

// document.addEventListener('DOMContentLoaded', () => {
//   updateColorHistoryDisplay();
//   renderMBTIEvolution();
// });

// function getWuxingRadarData() {
//   const records = JSON.parse(localStorage.getItem("userRecords") || '[]');
//   const wuxingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
//   records.forEach(item => {
//     if (item.wuxing in wuxingCount) wuxingCount[item.wuxing]++;
//   });
//   return Object.entries(wuxingCount).map(([label, count]) => ({ label, value: count }));
// }

// function showEmotionInArchive(emotion) {
//   const container = document.getElementById('emotion-insight-container');
//   if (!container) return;

//   container.innerHTML = `
//     <div class="emotion-title">色彩情绪分析</div>
//     <div class="emotion-name"><strong>主要情绪：</strong> ${emotion.primary}</div>
//     <div class="emotion-keywords"><strong>关键词：</strong> ${emotion.keywords.join('、')}</div>
//     <div class="emotion-music-styles"><strong>推荐风格：</strong> ${emotion.musicStyles.join('、')}</div>
//   `;
// }

// async function renderMBTIEvolution() {
//   const container = document.getElementById('mbti-evolution');
//   if (!container) return;

//   const mbtiMap = await fetch('mbti_persona_map.json').then(res => res.json());
//   const userMBTI = JSON.parse(localStorage.getItem("userMBTI") || '[]');

//   if (userMBTI.length === 0) {
//     container.innerHTML = '<p>尚无人格记录，快去多选几种颜色试试吧！</p>';
//     return;
//   }

//   container.innerHTML = '';
//   userMBTI.forEach((entry, index) => {
//     const section = document.createElement('div');
//     section.classList.add('mbti-entry');

//     const title = document.createElement('h5');
//     title.textContent = `${entry.type} ${index === userMBTI.length - 1 ? '（最新）' : ''}`;
//     section.appendChild(title);

//     const time = document.createElement('p');
//     time.textContent = `🕒 记录时间：${new Date(entry.time).toLocaleString()}`;
//     time.style.fontSize = '0.85em';
//     time.style.color = '#888';
//     section.appendChild(time);

//     const list = document.createElement('ul');
//     const people = mbtiMap[entry.type] || [];
//     if (people.length === 0) {
//       const li = document.createElement('li');
//       li.textContent = '暂无人物资料';
//       list.appendChild(li);
//     } else {
//       people.slice(0, 6).forEach(name => {
//         const li = document.createElement('li');
//         li.textContent = name;
//         list.appendChild(li);
//       });
//     }

//     section.appendChild(list);
//     container.appendChild(section);
//   });
// }

// (function () {
//     const initToggleArchive = () => {
//       const btn = document.getElementById("toggle-archive-btn");
//       const arc = document.getElementById("user-archive");
//       const card = document.getElementById("share-card-container");
  
//       if (!btn || !arc || !card) return false;
  
//       btn.addEventListener("click", () => {
//         const isVisible = !arc.classList.contains("hidden");
//         arc.classList.toggle("hidden", isVisible);
//         card.classList.toggle("hidden", isVisible);
//         btn.textContent = isVisible
//           ? "📖 查看我的创作档案"
//           : "📕 收起我的创作档案";
//       });
  
//       return true;
//     };
  
//     if (!initToggleArchive()) {
//       const retry = setInterval(() => {
//         if (initToggleArchive()) clearInterval(retry);
//       }, 200);
//     }
//   })();

document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("toggle-archive-btn");
    const archive = document.getElementById("user-archive");
  
    toggleBtn.addEventListener("click", function () {
      archive.classList.toggle("hidden");
  
      if (archive.classList.contains("hidden")) {
        toggleBtn.textContent = "📖 查看我的创作档案";
      } else {
        toggleBtn.textContent = "📕 收起我的创作档案";
      }
    });
});
