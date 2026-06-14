# AuxiroNexus — Claude Code Rules
## Last updated: June 2026

## Project
React + TypeScript PWA · Single file: src/App.tsx · Deployed on Vercel via GitHub main branch · Domain: auxironexus.com

## Stack
- React + TypeScript — src/App.tsx (monolithic, do not split)
- Vite — build tool
- Vercel Hobby plan — 60s hard timeout
- GitHub — auto-deploys on push to main

## API Files
- api/analyze.js — Anthropic proxy (NEVER modify)
- api/stream.js — Anthropic streaming proxy (NEVER modify)
- api/prices.js — TwelveData proxy
- api/cot.js — CFTC COT proxy
- api/news.js — GNews headlines proxy
- api/accounts.js — MT5 account read from Redis (Exness + FundedNext)
- api/accounts/sync.js — MT5 EA bridge: receives POST from EA, stores to Redis
- vercel.json — maxDuration:60 (NEVER change)

## Environment Variables — Exact Casing (must match Vercel exactly)
- ANTHROPIC_key — api/analyze.js (Anthropic Claude non-streaming)
- ANTHROPIC_API_key — api/stream.js (Anthropic Claude streaming)
- TWELVE_key — api/prices.js (TwelveData market data)
- GNEWS_key — api/news.js (GNews headlines)
- FINNHUB_key — api/calendar.js (coming)
- FRED_API_key — api/macro.js (coming)
- MARKETAUX_key — api/newsfeed.js (coming)
- KV_URL — Upstash Redis (auto-injected by Vercel)
- KV_REST_API_URL — Upstash Redis (auto-injected by Vercel)
- KV_REST_API_TOKEN — Upstash Redis (auto-injected by Vercel)
- KV_REST_API_ONLY_TOKEN — Upstash Redis (auto-injected by Vercel)
- REDIS_URL — Upstash Redis (auto-injected by Vercel)
- EXNESS_LOGIN — Exness MT5 account login number
- EXNESS_PASSWORD — Exness MT5 account password
- EXNESS_SERVER — Exness MT5 server (default: Exness-MT5Real5)
- FUNDEDNEXT_LOGIN — FundedNext MT5 account login number
- FUNDEDNEXT_PASSWORD — FundedNext MT5 account password
- FUNDEDNEXT_SERVER — FundedNext MT5 server (default: FundedNext-Server2)
- FUNDEDNEXT_STARTING_BALANCE — challenge starting balance (e.g. 100000)
- FUNDEDNEXT_DAILY_DD_PCT — daily drawdown % as decimal (default: 0.05)
- FUNDEDNEXT_TOTAL_DD_PCT — max drawdown % as decimal (default: 0.10)
- FUNDEDNEXT_PROFIT_TARGET_PCT — profit target % as decimal (default: 0.10)

## Response Rules
- Work silently — no narration, no explanation before acting
- No code blocks or diffs shown unless explicitly asked
- When done report only: what changed (1–2 sentences) + build result
- If build passes: "Done — [summary]. Ready."
- If build fails: show only the error lines

## Mandatory Workflow — Every Single Change
Follow this exact order every time, no exceptions:

1. Make the change
2. Run: npm run build
   → Must complete with zero errors
   → If errors — fix them before proceeding, do not skip
3. Run: npm run dev
   → Open localhost:5173 and confirm app renders visually
   → Check browser console — must show zero red errors
   → If blank screen or console errors — fix before proceeding
4. Only after both steps pass — commit directly to main
5. Report: "Done — [summary]. Build clean. Dev tested."

Never skip steps 2 or 3. Never commit before both pass.

## Pre-Task Protocol — MANDATORY BEFORE ANY EDIT
1. Read App.tsx in full before touching it
2. Read every file that will be changed
3. State exactly which lines will be touched
4. State what will NOT be touched
5. Only then execute

## Post-Task Review Protocol — MANDATORY BEFORE REPORTING DONE
1. Visually review changed section as a first-time user
2. Confirm output matches what was asked — not just builds without errors
3. Confirm nothing outside task scope changed
4. Only then commit

## Scope Boundary Rule
If a fix requires touching something outside the defined task scope:
STOP. Report what needs changing. Wait for confirmation. Never fix silently.

## Critical Rules — Never Break
- NEVER modify api/analyze.js
- NEVER change vercel.json maxDuration
- NEVER use module.exports in api/ files — use export default
- NEVER hardcode API keys — use process.env
- NEVER create a Pull Request — commit directly to main only
- NEVER leave git conflict markers in any file (<<<<<<< ======= >>>>>>>)
- NEVER commit if npm run build shows any error
- NEVER commit if npm run dev shows blank screen or console errors
- NEVER patch App.tsx in small pieces without verifying brace balance after

## Commit Rules
- Commit directly to main — no branches, no PRs
- Commit message format: "feat: [what was added]" or "fix: [what was fixed]"
- One focused change per commit — do not bundle unrelated changes

## If Something Breaks
- Run: git log --oneline -10
- Report the list and wait for instruction
- Do not attempt auto-fix without confirmation
