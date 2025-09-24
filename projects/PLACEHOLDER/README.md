# Project Template (projects/PLACEHOLDER)

This folder is your reusable template for new projects. It is **hidden** from the homepage by default.

## How to use
1. Duplicate the folder to a new slug: `projects/<Your_Slug>/`
2. Edit `projects/<Your_Slug>/meta.json`:
   - Set `"title"` to your project title
   - Keep `"thumb": "media/cover.jpg"` or change to another image in this project's `media/` folder
   - Set `"hidden": false` (or delete the property) to make it appear on the homepage
   - (Optional) Add `"category"` for grouping later
3. Edit `projects/<Your_Slug>/summary.html`: write your summary and optional iframe embeds
4. Edit `projects/<Your_Slug>/content.json`:
   - Update all `src` paths from `projects/PLACEHOLDER/...` to `projects/<Your_Slug>/...`
   - Add/remove items (types: image, video, iframe, html) and captions
5. Replace files in `projects/<Your_Slug>/media/` with your real `cover.jpg`, `01.jpg`, `02.jpg` (filenames can change if you update `content.json` accordingly)
6. Commit your changes. The GitHub Action builds manifests; your project appears on the homepage.

## Notes
- Keep this template hidden (`"hidden": true`) so it never shows on the homepage.
- You can still preview it directly: /project.html?slug=PLACEHOLDER
- Paths and filenames are **case-sensitive** on GitHub Pages.
