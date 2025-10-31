async function load() {
  const grid = document.getElementById('grid');
  const cardTmpl = document.getElementById('card-tmpl');

  let projects = [];
  try {
    const res = await fetch('data/projects.json', { cache: 'no-store' });
    projects = await res.json();
    if (!Array.isArray(projects)) projects = [];
  } catch (err) {
    console.error('Failed to load projects.json', err);
    grid.innerHTML = '<p style="color:#f88">Failed to load projects list.</p>';
    return;
  }

  // NEW: filter by visibility (missing flag => visible)
  projects = projects.filter(p => p && p.visible !== false);

  // --- Keep your sorting by "order" (ascending). Missing/invalid -> bottom (9999). Tie-breaker: title/slug A→Z.
  const normOrder = (v) => {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return Number.isFinite(n) ? n : 9999;
  };
  projects.sort((a, b) => {
    const ao = normOrder(a.order);
    const bo = normOrder(b.order);
    if (ao !== bo) return ao - bo;
    const at = (a.title || a.slug || '').toString();
    const bt = (b.title || b.slug || '').toString();
    return at.localeCompare(bt, undefined, { sensitivity: 'base' });
  });
  // --- END

  projects.forEach(p => {
    const a = cardTmpl.content.firstElementChild.cloneNode(true);

    if (p.externalUrl) {
      a.href = p.externalUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    } else {
      // Fallback-safe if slug is missing
      const slug = encodeURIComponent(p.slug || '');
      a.href = slug ? `project.html?slug=${slug}` : '#';
    }

    const img = a.querySelector('img');
    img.src = p.thumb || 'assets/placeholder.svg';
    img.alt = p.title || p.slug || 'project';

    a.querySelector('.card-title').textContent = p.title || p.slug || 'Untitled';
    grid.appendChild(a);
  });
}

document.addEventListener('DOMContentLoaded', load);
