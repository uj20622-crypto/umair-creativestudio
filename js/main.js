// Loads editable content from content/data.json and injects it into the page.
// This file is updated by the /admin panel (Decap CMS) via Git — no manual coding needed.

async function loadSiteData(){
  try{
    const res = await fetch('content/data.json', { cache: 'no-store' });
    if(!res.ok) throw new Error('data.json not found');
    return await res.json();
  }catch(err){
    console.error('Could not load site content:', err);
    return null;
  }
}

function fillText(id, value){
  const el = document.getElementById(id);
  if(el && value) el.textContent = value;
}

function fillImage(id, src, alt){
  const el = document.getElementById(id);
  if(el && src){
    el.src = src;
    if(alt) el.alt = alt;
  }
}

const CATEGORY_LABELS = {
  thumbnail: 'YouTube Thumbnail',
  aplus: 'Amazon A+ Content',
  product: 'Product Images',
  logo: 'Logo & Identity',
  packaging: 'Packaging',
  social: 'Social Media'
};

function renderPortfolio(items, gridId, filterBarId){
  const grid = document.getElementById(gridId);
  if(!grid) return;

  function draw(filter){
    grid.innerHTML = '';
    const list = filter && filter !== 'all' ? items.filter(i => i.category === filter) : items;
    if(list.length === 0){
      grid.innerHTML = '<div class="work-empty" style="grid-column:1/-1;padding:60px 0;">No work added in this category yet.</div>';
      return;
    }
    list.forEach(item => {
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'work-card';
      a.innerHTML = `
        <div class="work-img">
          ${item.image ? `<img src="${item.image}" alt="${item.title || ''}">` : `<div class="work-empty">No image yet</div>`}
        </div>
        <div class="work-meta">
          <h4>${item.title || 'Untitled project'}</h4>
          <span>${CATEGORY_LABELS[item.category] || item.category || ''}</span>
        </div>`;
      grid.appendChild(a);
    });
  }
  draw('all');

  const bar = document.getElementById(filterBarId);
  if(bar){
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if(!btn) return;
      bar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      draw(btn.dataset.filter);
    });
  }
}

function initMobileNav(){
  const burger = document.querySelector('.nav-burger');
  const mnav = document.querySelector('.mnav');
  if(burger && mnav){
    burger.addEventListener('click', () => mnav.classList.add('open'));
    const close = mnav.querySelector('.mnav-close');
    if(close) close.addEventListener('click', () => mnav.classList.remove('open'));
    mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mnav.classList.remove('open')));
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initMobileNav();
  const data = await loadSiteData();
  if(!data) return;

  // Profile photo — appears on hero (home) and bio (about)
  fillImage('heroPhoto', data.profile_photo, data.name);
  fillImage('bioPhoto', data.profile_photo, data.name);

  // Text content
  fillText('siteName', data.name);
  fillText('heroTagline', data.tagline);
  fillText('heroBio', data.bio);
  fillText('bioText', data.bio);
  fillText('yearsNum', data.years_experience);
  fillText('projectsNum', data.projects_delivered);

  // Portfolio grid (home preview + full portfolio page use the same data)
  if(Array.isArray(data.portfolio)){
    renderPortfolio(data.portfolio, 'portfolioGrid', 'filterBar');
    renderPortfolio(data.portfolio.slice(0, 3), 'homePortfolioGrid', null);
  }
});
