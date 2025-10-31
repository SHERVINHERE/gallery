#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PROJECTS_DIR = path.join(ROOT, 'projects');
const DATA_DIR = path.join(ROOT, 'data');

const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
const VID_EXTS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];

// ---------- helpers ----------
function isMedia(file) {
  const ext = path.extname(file).toLowerCase();
  return IMG_EXTS.includes(ext) || VID_EXTS.includes(ext);
}
function sortFiles(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}
async function fileExists(p) {
  try { await fs.stat(p); return true; } catch { return false; }
}
// Normalize order to a number if possible, otherwise undefined
function normalizeOrder(v) {
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : undefined;
}
// Parse booleans safely (true/false or "true"/"false"), otherwise undefined
function toBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return undefined;
}
// Preferred visibility: explicit meta.visible wins; else legacy meta.hidden; else default true
function computeVisible(meta) {
  const v = toBool(meta?.visible);
  if (v !== undefined) return v !== false;      // visible:true|undefined => show; visible:false => hide
  const h = toBool(meta?.hidden);
  if (h !== undefined) return h !== true;       // hidden:true => hide; hidden:false|undefined => show
  return true;                                   // default visible
}
// Resolve thumb path: allow absolute/URL; otherwise prefix with projects/<slug>/
function resolveThumb(slug, metaThumb, firstContentSrc) {
  if (!metaThumb) return firstContentSrc || null;
  const t = String(metaThumb);
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('/')) return t;
  // keep URLs web-safe regardless of OS
  return path.posix.join('projects', slug, t);
}
// ---------- /helpers ----------

async function build() {
  const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true }).catch(() => []);
  const projects = [];

  for (const d of entries) {
    if (!d.isDirectory()) continue;
    const slug = d.name;
    if (slug.startsWith('.')) continue;

    const projDir = path.join(PROJECTS_DIR, slug);
    const metaPath = path.join(projDir, 'meta.json');
    const sumPath = path.join(projDir, 'summary.html');
    const contentPath = path.join(projDir, 'content.json');
    const mediaDir = path.join(projDir, 'media');

    if (!(await fileExists(metaPath))) {
      console.warn(`Skipping ${slug}: missing meta.json`);
      continue;
    }

    // Read/parse meta & summary
    const metaRaw = await fs.readFile(metaPath, 'utf8');
    const meta = JSON.parse(metaRaw);
    const summaryHTML = (await fileExists(sumPath)) ? await fs.readFile(sumPath, 'utf8') : '';

    // Load content (explicit content.json or inferred from media/)
    let content = [];
    if (await fileExists(contentPath)) {
      const contentRaw = await fs.readFile(contentPath, 'utf8');
      content = JSON.parse(contentRaw);
    } else {
      const files = (await fs.readdir(mediaDir).catch(() => []))
        .filter(f => isMedia(f))
        .sort(sortFiles)
        .map(f => path.posix.join('projects', slug, 'media', f));
      content = files.map(src => {
        const ext = path.extname(src).toLowerCase();
        const isVid = VID_EXTS.includes(ext);
        return { type: isVid ? 'video' : 'image', src };
      });
    }

    // Normalize passthrough fields
    const order = normalizeOrder(meta.order);
    const category = meta.category ?? null;
    const visible = computeVisible(meta); // <-- key addition

    const firstSrc = content[0]?.src || null;

    // Per-project manifest (detail page)
    const indexJson = {
      slug,
      title: meta.title || slug,
      summaryHTML,
      content,
      thumb: resolveThumb(slug, meta.thumb, firstSrc),
      category,
      visible,                              // <-- include on detail too
      ...(order !== undefined ? { order } : {})
      // Note: we intentionally do NOT carry legacy "hidden" forward here
    };
    await fs.writeFile(path.join(projDir, 'index.json'), JSON.stringify(indexJson, null, 2));

    // Item for compiled homepage list
    const listItem = {
      slug,
      title: meta.title || slug,
      thumb: resolveThumb(slug, meta.thumb, firstSrc) || 'assets/placeholder.svg',
      externalUrl: meta.externalUrl ?? null,
      category,
      visible,                              // <-- include visible in data/projects.json
      ...(order !== undefined ? { order } : {})
      // legacy "hidden" omitted on purpose; homepage should rely on visible only
    };
    projects.push(listItem);
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, 'projects.json'), JSON.stringify(projects, null, 2));
  console.log(`Built manifests for ${projects.length} project(s).`);
}

build().catch(err => { console.error(err); process.exit(1); });
