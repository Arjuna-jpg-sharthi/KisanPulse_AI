# KisanPulse AI - team handoff (member-1)

This is an independent working copy of the current integrated project, including the latest local source changes and Git history. Branch: `team/member-1`. Current local source edits are included as uncommitted changes; review them before staging, because `git add .` will include those copied edits with your new work.

## Run locally

1. Install Node.js if needed, then run `npm install` in this folder.
2. Copy `.env.example` to `.env` and add your own API keys locally. Never send or commit `.env`.
3. Run `npm run dev:full` from PowerShell. Keep that window open while using the app at `http://localhost:3000`.

## Push your work

The `origin` remote is set to the main KisanPulse GitHub repository. To push directly, its owner must first add your GitHub account as a collaborator. Otherwise, fork the repository under your own GitHub account, then change this copy's `origin` to your fork in GitHub Desktop or with `git remote set-url origin https://github.com/YOUR-USERNAME/KisanPulse_AI.git`. Commit your work on this branch and publish/push it; open a pull request to integrate it.

Coordinate with the other member and agree on separate files/features before editing, so the two work streams do not conflict. This copy includes a consistent snapshot of the full local SQLite database (11 tables, 5,514 rows). The database is not ignored here, so it can be committed and pushed with the project if intended. It contains the saved account and app data from the source project; share it only with the intended team and judges. `.env`, `node_modules`, `dist`, and the source ZIP archives are omitted. Install dependencies before running the app.


