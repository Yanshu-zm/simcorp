// ===== News Feed Component =====
import gameEngine from '../engine/GameEngine.js';
import { t, tResult, getLang } from '../utils/i18n.js';

const DECORATIVE_MOMENTS = [
  { name: 'Sarah Jenkins', time: '2h ago', text: { zh: '"刚完成项目报告，感觉很有成就感！"', en: '"Just finished the project report, feeling accomplished!"' }, likes: 14, comments: 3 },
  { name: 'Marcus Thorne', time: '5h ago', text: { zh: '"新的咖啡机终于到了，小确幸。"', en: '"The new coffee machine finally arrived. Small joys."' }, likes: 28, comments: 8 },
  { name: 'Alex Rivera', time: '1d ago', text: { zh: '"团建活动太有趣了，期待下次！"', en: '"Team building was so fun, looking forward to the next one!"' }, likes: 22, comments: 5 },
  { name: 'Emily Chen', time: '2d ago', text: { zh: '"加班到深夜，但项目终于上线了。"', en: '"Worked late into the night, but the project is finally live."' }, likes: 35, comments: 12 },
  { name: 'David Kim', time: '3d ago', text: { zh: '"新同事技术真强，学到很多。"', en: '"The new colleague is really skilled, learned a lot."' }, likes: 18, comments: 4 },
];

export function renderNewsFeed(pageType = 'default') {
  const news = gameEngine.gameState.newsLog.slice(0, 6);
  const tagLabels = {
    system: t('news.systemUpdate'),
    market: t('news.marketEvent'),
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

  const newsTitle = {
    home: t('news.systemNews'),
    employee: t('news.companyNews'),
    project: t('news.marketPulse'),
    equipment: t('news.corporateNews'),
    default: t('news.systemNews'),
  }[pageType] || t('news.systemNews');

  const momentsTitle = {
    home: t('news.employeeMoments'),
    employee: t('news.internalMoments'),
    project: t('news.corporateMoments'),
    equipment: t('news.officeMoments'),
    default: t('news.employeeMoments'),
  }[pageType] || t('news.employeeMoments');

  // Pick 2 random moments
  const moments = DECORATIVE_MOMENTS.sort(() => Math.random() - 0.5).slice(0, 2);
  const lang = getLang();

  return `
    <div class="card" id="news-feed">
      <div class="card__title">${newsTitle}</div>
      ${news.length === 0 ? `<div class="empty-state"><div class="empty-state__text">${t('news.noNews')}</div></div>` : ''}
      ${news.map(n => `
        <div class="news-item">
          <div class="news-item__tag ${tagClasses[n.tag] || 'news-item__tag--system'}">
            ${tagLabels[n.tag] || 'NEWS'}
          </div>
          <div class="news-item__title">${tResult(n.title)}</div>
          <div class="news-item__desc">${tResult(n.desc)}</div>
          <div class="news-item__time">${t('news.yearMonth', { year: n.year, month: n.month })}</div>
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
            ${m.text[lang] || m.text.zh}
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
