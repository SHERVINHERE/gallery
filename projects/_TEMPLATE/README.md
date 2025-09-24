# Project Template (_TEMPLATE)

This folder is a template you can duplicate to create a new project.

## How to use
1. Duplicate `projects/_TEMPLATE` to `projects/<Your_Slug>`
2. In `projects/<Your_Slug>/meta.json`:
   - Set `"title"` to your project title
   - Keep `"thumb": "media/cover.jpg"` (or change to another image in this project's media folder)
   - Set `"hidden": false` (or delete the line) to make it appear on the homepage
   - (Optional) Set `"category"` to group/filter later
3. In `projects/<Your_Slug>/summary.html`: write your summary and optional iframe embeds
4. In `projects/<Your_Slug>/content.json`:
   - Update all `src` paths from `projects/_TEMPLATE/...` to `projects/<Your_Slug>/...`
   - Add/remove items (types: image, video, iframe, html). Add `caption` if you want.
5. Replace images in `media/` with your real `cover.jpg`, `01.jpg`, `02.jpg` (keep filenames or update content.json)
6. Commit your changes. The GitHub Action will rebuild manifests and the homepage will update.

## Notes
- This template is hidden from the homepage via `"hidden": true` in meta.json
- You can preview it directly at: /project.html?slug=_TEMPLATE (it won't appear on the index)
- Keep file/folder names case-sensitive; GitHub Pages is case-sensitive.
