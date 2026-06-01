Work silently.

Rewrite CLAUDE.md in the repo root with exactly this content, replacing everything:

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
- api/prices.js — TwelveData proxy
- api/cot.js — CFTC COT proxy
- vercel.json — maxDuration:60 (NEVER change)

## Environment Variables
- ANTHROPIC_KEY
- TWELVE_KEY

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

After updating CLAUDE.md run npm run build then npm run dev. Report: "Done — build clean, dev tested" or exact error.
