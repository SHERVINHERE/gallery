// assets/home.js
async function load() {
  const grid = document.getElementById('grid');
  const cardTmpl = document.getElementById('card-tmpl');
  if (!grid || !cardTmpl) return;

  // Cache-bust so GitHub Pages/CDN can't serve a stale projects.json
  const DATA_URL = `data/projects.json?v=${Date.now()}`;

  let projects = [];
  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    projects = await res.json();
    if (!Array.isArray(projects)) projects = [];
  } catch (err) {
    console.error('Failed to load projects.json:', err);
    grid.innerHTML = '<p style="color:#f88">Failed to load projects list.</p>';
    return;
  }

  // Normalize booleans that might arrive as strings
  const toBoolOrUndef = (v) => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (s === 'true') return true;
      if (s === 'false') return false;
    }
    return undefined;
  };

  // Visibility rule:
  // - If "visible" is provided: show only if visible !== false
  // - Else if "hidden" is provided: show only if hidden !== true
  // - Else (neither provided): show by default
  const isVisible = (p) => {
    const v = toBoolOrUndef(p.visible);
    if (v !== undefined) return v !== false;
    const h = toBoolOrUndef(p.hidden);
    if (h !== undefined) return h !== true;
    return true;
  };

  // Filter by visibility
  projects = projects.filter((p) => p && isVisible(p));

  // Sort by "order" ascending (missing/invalid -> bottom=9999), tie-breaker: title/slug A→Z
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

  // Render
  const frag = document.createDocumentFragment();

  projects.forEach((p) => {
    const node = cardTmpl.content.firstElementChild.cloneNode(true);

    // Link
    if (p.externalUrl) {
      node.href = p.externalUrl;
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
    } else {
      const slug = encodeURIComponent(p.slug || '');
      node.href = slug ? `project.html?slug=${slug}` : '#';
    }

    // Image
    const img = node.querySelector('img');
    if (img) {
      img.src = p.thumb || 'assets/placeholder.svg';
      img.alt = p.title || p.slug || 'project';
      img.loading = 'lazy';
      img.decoding = 'async';
    }

    // Title
    const titleEl = node.querySelector('.card-title');
    if (titleEl) titleEl.textContent = p.title || p.slug || 'Untitled';

    frag.appendChild(node);
  });

  grid.innerHTML = '';
  grid.appendChild(frag);
}

document.addEventListener('DOMContentLoaded', load);
