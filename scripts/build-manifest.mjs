#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PROJECTS_DIR = path.join(ROOT, 'projects');
const DATA_DIR = path.join(ROOT, 'data');

const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
const VID_EXTS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];

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

    const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
    const summaryHTML = (await fileExists(sumPath)) ? await fs.readFile(sumPath, 'utf8') : '';

    let content = [];
    if (await fileExists(contentPath)) {
      content = JSON.parse(await fs.readFile(contentPath, 'utf8'));
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

    await fs.writeFile(path.join(projDir, 'index.json'), JSON.stringify({
      slug,
      title: meta.title || slug,
      summaryHTML,
      content
    }, null, 2));

    projects.push({
      slug,
      title: meta.title || slug,
      thumb: meta.thumb ? path.posix.join('projects', slug, meta.thumb) : (content[0]?.src || 'assets/placeholder.svg'),
      externalUrl: meta.externalUrl || null
    });
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, 'projects.json'), JSON.stringify(projects, null, 2));
  console.log(`Built manifests for ${projects.length} project(s).`);
}

build().catch(err => { console.error(err); process.exit(1); });
