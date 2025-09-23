async function load() {
  const grid = document.getElementById('grid');
  const cardTmpl = document.getElementById('card-tmpl');

  let projects = [];
  try {
    const res = await fetch('data/projects.json', { cache: 'no-store' });
    projects = await res.json();
  } catch (err) {
    console.error('Failed to load projects.json', err);
    grid.innerHTML = '<p style="color:#f88">Failed to load projects list.</p>';
    return;
  }

  projects.forEach(p => {
    const a = cardTmpl.content.firstElementChild.cloneNode(true);

    if (p.externalUrl) {
      a.href = p.externalUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    } else {
      a.href = `project.html?slug=${encodeURIComponent(p.slug)}`;
    }

    a.querySelector('img').src = p.thumb || 'assets/placeholder.svg';
    a.querySelector('img').alt = p.title || p.slug;
    a.querySelector('.card-title').textContent = p.title || p.slug;
    grid.appendChild(a);
  });
}

document.addEventListener('DOMContentLoaded', load);
