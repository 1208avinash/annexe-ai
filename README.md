# ANNEXE AI — Deployment Guide

## Deploy to Vercel via GitHub

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Import into Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import** next to your GitHub repo
3. Framework preset: **Other** (it's a static site)
4. Click **Deploy**

### 3. Add the OpenRouter API key
1. In Vercel → your project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** `sk-or-v1-xxxxxxxxxxxxxxxx`
   - **Environments:** ✅ Production, ✅ Preview
3. Click **Save**
4. Go to **Deployments** → **Redeploy** (so the new env var takes effect)

## File structure
```
my-site/
├── index.html      ← main site (no API keys inside)
├── api/
│   └── chat.js     ← serverless proxy (injects the key server-side)
└── vercel.json     ← routing config
```

## How it works
- The browser calls `/api/chat` (your own server)
- The serverless function adds the secret `OPENROUTER_API_KEY` and forwards to OpenRouter
- The key is **never exposed** in browser source or network calls

## Application generation

Use the universal production generator for ANNEXE AI V6:

```bash
node generate-application.js --type crm
node generate-application.js --type erp
node generate-application.js --type hrms
node generate-application.js --type hospital
node generate-application.js --type marketplace
node generate-application.js --type pos
node generate-application.js --type inventory
node generate-application.js --type school
node generate-application.js "Create a CRM for a real estate agency with customer management, lead tracking, invoicing, WhatsApp notifications and dashboards."
node generate-application.js --answers-file ./brief.json
node generate-application.js --interactive
```

- `generate-enterprise-crm.js` remains as a thin backward-compatible wrapper for CRM.
- A plain natural-language request now drives requirement analysis, capability selection, and application composition without needing `--type`.
- Questionnaire mode writes `requirements-analysis.json`, `application-composition.json`, `proposal.json`, and `generation-report.json`.
- All application types reuse the same Factory Kernel and differ only by capability composition.
- The company-layer entrypoint is `node generate-company.js "<business request>"`, which writes department reports under `workspace/<project>/reports/`.
- The commercial SaaS platform entrypoint is `node generate-saas-platform.js`, which creates the customer portal, admin portal, benchmark suite, and commercial readiness reports.

## Local development
```bash
npm i -g vercel
vercel dev
```
Then set the key in a local `.env` file:
```
OPENROUTER_API_KEY=sk-or-v1-...
```
