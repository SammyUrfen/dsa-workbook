# Deploying to GitHub Pages

The site is **already live** at **https://sammyurfen.github.io/dsa-workbook/** and
redeploys automatically. This doc explains how it works and how to reproduce it.

## How it works (the short version)

There is **no server to run**. A GitHub Actions workflow
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) builds the site on
GitHub's machines and publishes the `dist/` output to GitHub Pages.

**To update the live site: just push to `main`.**

```bash
git add -A
git commit -m "your change"
git push
```

Every push to `main` triggers a build → deploy (~30 seconds). You can watch it under the
repo's **Actions** tab, or from the terminal:

```bash
gh run watch      # follow the latest run
gh run list       # history
```

You can also trigger a deploy by hand from **Actions → Deploy to GitHub Pages → Run
workflow** (that's the `workflow_dispatch` trigger).

## What made it work (one-time setup — already done)

1. **Vite base path.** `vite.config.js` sets `base: './'` so assets load with relative
   paths — the site works under the `/dsa-workbook/` sub-path Pages serves it from,
   regardless of the repo name.

2. **The workflow.** `.github/workflows/deploy.yml`: checkout → Node 22 → `npm ci` →
   `npm run build` → upload `dist/` → deploy. Playwright's browser download is skipped in
   CI (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`) since it's only used for local QA.

3. **Pages was enabled with the "GitHub Actions" source.** This was set once. In the UI:
   **Settings → Pages → Build and deployment → Source → GitHub Actions**. (It was done via
   the API here: `gh api -X POST repos/SammyUrfen/dsa-workbook/pages -f build_type=workflow`.)

## If you ever need to set this up again from scratch

For a brand-new repo:

```bash
# 1. from the project dir, create/point at a GitHub repo and push
gh repo create dsa-workbook --public --source=. --remote=origin --push
# (or: git remote add origin git@github.com:<you>/dsa-workbook.git && git push -u origin main)

# 2. make sure .github/workflows/deploy.yml exists (it does), then enable Pages:
gh api -X POST repos/<you>/dsa-workbook/pages -f build_type=workflow

# 3. push anything to main — the workflow builds and deploys.
```

Then open **Settings → Pages** to see the published URL. First deploy can take a minute
to go live; after that it's near-instant.

## Local development (optional)

Deploying no longer needs any of this, but for editing content locally:

```bash
npm install
npm run dev       # hot-reloading dev server
npm run build     # produce dist/ (what CI also runs)
npm run preview   # serve the built dist/ locally
```

Content lives in `src/topics/t00.json … t15.json`. After editing, sanity-check with
`node scripts/validate.mjs` before pushing.
