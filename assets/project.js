function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  });
  children.forEach(c => e.appendChild(c));
  return e;
}

function getSlug() {
  const u = new URL(window.location.href);
  return u.searchParams.get('slug') || '';
}

function figureWrap(mediaEl, captionText) {
  const fig = el('figure');
  fig.appendChild(mediaEl);
  if (captionText) {
    const cap = el('figcaption', { class: 'caption' });
    cap.textContent = captionText;
    fig.appendChild(cap);
  }
  return fig;
}

function renderItem(gallery, item) {
  const t = (item.type || '').toLowerCase();
  if (t === 'image') {
    const img = el('img', { loading: 'lazy', alt: item.alt || '' });
    img.src = item.src;
    gallery.appendChild(figureWrap(img, item.caption));
  } else if (t === 'video') {
    const v = el('video', { controls: '' });
    v.src = item.src;
    gallery.appendChild(figureWrap(v, item.caption));
  } else if (t === 'iframe') {
    const f = el('iframe', {
      src: item.src,
      title: item.title || 'embedded content',
      allow: item.allow || 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: ''
    });
    gallery.appendChild(figureWrap(f, item.caption || item.title));
  } else if (t === 'html') {
    const block = el('div', { class: 'html-block', html: item.html || '' });
    gallery.appendChild(figureWrap(block, item.caption));
  }
}

async function loadProject() {
  const slug = getSlug();
  const title = document.getElementById('proj-title');
  const summary = document.getElementById('summary');
  const gallery = document.getElementById('gallery');

  if (!slug) {
    title.textContent = 'Project not found';
    summary.innerHTML = '<p style="color:#f88">Missing ?slug=… in the URL.</p>';
    return;
  }

  try {
    const res = await fetch(`projects/${encodeURIComponent(slug)}/index.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    title.innerHTML = `<a href="./">${data.title || slug}</a>`;
    summary.innerHTML = data.summaryHTML || '<p>No summary yet. Create a <code>summary.html</code> in this project.</p>';

    if (Array.isArray(data.content) && data.content.length) {
      data.content.forEach(item => renderItem(gallery, item));
    } else if (Array.isArray(data.media)) {
      data.media.forEach(src => {
        const isVid = /\.(mp4|webm|ogg|m4v|mov)$/i.test(src);
        renderItem(gallery, { type: isVid ? 'video' : 'image', src });
      });
    }
  } catch (err) {
    console.error(err);
    title.textContent = 'Error loading project';
    summary.innerHTML = '<p style="color:#f88">Could not load this project. Check that index.json exists.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadProject);
