import gameEngine from '../engine/GameEngine.js';
import { t, getCurrentLang } from '../utils/i18n.js';

const DECORATIVE_MOMENTS = [
  { name: 'Sarah Jenkins', timeZh: '2小时前', timeEn: '2h ago', textZh: '"刚完成项目报告，感觉很有成就感！"', textEn: '"Just finished the report, feeling accomplished!"', likes: 14, comments: 3 },
  { name: 'Marcus Thorne', timeZh: '5小时前', timeEn: '5h ago', textZh: '"新的咖啡机终于到了，小确幸。"', textEn: '"The new coffee machine is here! Small joys."', likes: 28, comments: 8 },
  { name: 'Alex Rivera', timeZh: '1天前', timeEn: '1d ago', textZh: '"团建活动太有趣了，期待下次！"', textEn: '"Team building was so much fun, looking forward to the next one!"', likes: 22, comments: 5 },
  { name: 'Emily Chen', timeZh: '2天前', timeEn: '2d ago', textZh: '"加班到深夜，但项目终于上线了。"', textEn: '"Late night overtime, but the project is finally live."', likes: 35, comments: 12 },
  { name: 'David Kim', timeZh: '3天前', timeEn: '3d ago', textZh: '"新同事技术真强，学到很多。"', textEn: '"New colleague is super skilled, learned a lot."', likes: 18, comments: 4 },
];

export function renderNewsFeed(pageType = 'default') {
  const news = gameEngine.gameState.newsLog.slice(0, 6);
  const lang = getCurrentLang();

  const tagLabels = {
    system: t('news.system'),
    market: t('news.market'),
    warning: t('news.warning'),
    breaking: t('news.breaking'),
    personnel: t('news.personnel'),
  };
  
  const tagClasses = {
    system: 'news-item__tag--system',
    market: 'news-item__tag--market',
    warning: 'news-item__tag--warning',
    breaking: 'news-item__tag--breaking',
    personnel: 'news-item__tag--personnel',
  };

  const newsTitle = t(`news.title.${pageType}`) || t('news.title.default');
  const momentsTitle = t(`news.moments.${pageType}`) || t('news.moments.default');

  // Pick 2 random moments
  const moments = DECORATIVE_MOMENTS.sort(() => Math.random() - 0.5).slice(0, 2);

  return `
    <div class="card" id="news-feed">
      <div class="card__title">${newsTitle}</div>
      ${news.length === 0 ? `<div class="empty-state"><div class="empty-state__text">${t('news.empty')}</div></div>` : ''}
      ${news.map(n => {
        const title = lang === 'en' ? n.titleEn || n.title : n.title;
        const desc = lang === 'en' ? n.descEn || n.desc : n.desc;
        return `
        <div class="news-item">
          <div class="news-item__tag ${tagClasses[n.tag] || 'news-item__tag--system'}">
            ${tagLabels[n.tag] || 'NEWS'}
          </div>
          <div class="news-item__title">${title}</div>
          <div class="news-item__desc">${desc}</div>
          <div class="news-item__time">${t('news.time').replace('{y}', n.year).replace('{m}', n.month)}</div>
        </div>
      `}).join('')}
    </div>

    <div class="card" style="margin-top: var(--space-xl);">
      <div class="card__title">${momentsTitle}</div>
      ${moments.map(m => {
        const time = lang === 'en' ? m.timeEn : m.timeZh;
        const text = lang === 'en' ? m.textEn : m.textZh;
        return `
        <div class="news-item">
          <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-sm);">
            <div class="avatar avatar--initials" style="background:${getRandomColor()};width:32px;height:32px;font-size:0.7rem;">
              ${m.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <strong style="font-size:var(--font-size-sm);">${m.name}</strong>
              <span class="text-muted" style="font-size:var(--font-size-xs);margin-left:var(--space-sm);">${time}</span>
            </div>
          </div>
          <div style="font-size:var(--font-size-sm);color:var(--color-text-secondary);line-height:1.5;">
            ${text}
          </div>
          <div style="display:flex;gap:var(--space-lg);margin-top:var(--space-sm);font-size:var(--font-size-xs);color:var(--color-text-muted);">
            <span>👍 ${m.likes}</span>
            <span>💬 ${m.comments}</span>
          </div>
        </div>
      `}).join('')}
    </div>
  `;
}

function getRandomColor() {
  const colors = ['#5B5FC7', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#A855F7', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
}
