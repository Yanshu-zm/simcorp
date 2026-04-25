// ===== News Feed Component =====
import gameEngine from '../engine/GameEngine.js';

const DECORATIVE_MOMENTS = [
  { name: 'Sarah Jenkins', time: '2h ago', text: '"刚完成项目报告，感觉很有成就感！"', likes: 14, comments: 3 },
  { name: 'Marcus Thorne', time: '5h ago', text: '"新的咖啡机终于到了，小确幸。"', likes: 28, comments: 8 },
  { name: 'Alex Rivera', time: '1d ago', text: '"团建活动太有趣了，期待下次！"', likes: 22, comments: 5 },
  { name: 'Emily Chen', time: '2d ago', text: '"加班到深夜，但项目终于上线了。"', likes: 35, comments: 12 },
  { name: 'David Kim', time: '3d ago', text: '"新同事技术真强，学到很多。"', likes: 18, comments: 4 },
];

export function renderNewsFeed(pageType = 'default') {
  const news = gameEngine.gameState.newsLog.slice(0, 6);
  const tagLabels = {
    system: 'SYSTEM UPDATE',
    market: 'MARKET EVENT',
    warning: 'WARNING',
    breaking: 'BREAKING',
    personnel: 'PERSONNEL',
  };
  const tagClasses = {
    system: 'news-item__tag--system',
    market: 'news-item__tag--market',
    warning: 'news-item__tag--warning',
    breaking: 'news-item__tag--breaking',
    personnel: 'news-item__tag--personnel',
  };

  const newsTitle = {
    home: 'System News',
    employee: 'Company News',
    project: 'Market Pulse',
    equipment: 'Corporate News',
    default: 'System News',
  }[pageType] || 'System News';

  const momentsTitle = {
    home: 'Employee Moments',
    employee: 'Internal Moments',
    project: 'Corporate Moments',
    equipment: 'Office Moments',
    default: 'Employee Moments',
  }[pageType] || 'Employee Moments';

  // Pick 2 random moments
  const moments = DECORATIVE_MOMENTS.sort(() => Math.random() - 0.5).slice(0, 2);

  return `
    <div class="card" id="news-feed">
      <div class="card__title">${newsTitle}</div>
      ${news.length === 0 ? '<div class="empty-state"><div class="empty-state__text">暂无新闻</div></div>' : ''}
      ${news.map(n => `
        <div class="news-item">
          <div class="news-item__tag ${tagClasses[n.tag] || 'news-item__tag--system'}">
            ${tagLabels[n.tag] || 'NEWS'}
          </div>
          <div class="news-item__title">${n.title}</div>
          <div class="news-item__desc">${n.desc}</div>
          <div class="news-item__time">Year ${n.year}, Month ${n.month}</div>
        </div>
      `).join('')}
    </div>

    <div class="card" style="margin-top: var(--space-xl);">
      <div class="card__title">${momentsTitle}</div>
      ${moments.map(m => `
        <div class="news-item">
          <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-sm);">
            <div class="avatar avatar--initials" style="background:${getRandomColor()};width:32px;height:32px;font-size:0.7rem;">
              ${m.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <strong style="font-size:var(--font-size-sm);">${m.name}</strong>
              <span class="text-muted" style="font-size:var(--font-size-xs);margin-left:var(--space-sm);">${m.time}</span>
            </div>
          </div>
          <div style="font-size:var(--font-size-sm);color:var(--color-text-secondary);line-height:1.5;">
            ${m.text}
          </div>
          <div style="display:flex;gap:var(--space-lg);margin-top:var(--space-sm);font-size:var(--font-size-xs);color:var(--color-text-muted);">
            <span>👍 ${m.likes}</span>
            <span>💬 ${m.comments}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function getRandomColor() {
  const colors = ['#5B5FC7', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#A855F7', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
}
