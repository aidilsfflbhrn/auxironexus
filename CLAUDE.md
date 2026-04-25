# Auxiron — Trading Intelligence PWA

## Project Overview
React + TypeScript PWA deployed on Vercel. Single file architecture.
- Main app: `src/App.tsx` (~2100 lines)
- API proxy: `api/analyze.js`
- Prices: `api/prices.js`
- Config: `vercel.json`

## RESPONSE BEHAVIOUR — FOLLOW STRICTLY
- Do NOT narrate every step while working
- Do NOT show file diffs or code blocks unless explicitly asked
- Do NOT explain what you are about to do before doing it
- Work silently in the background
- When done, reply with ONLY:
  - What was changed (1-2 sentences max)
  - Verification results (tsc errors, grep results)
  - Any blockers or questions
- If verification passes: "Done. Ready to commit."
- If verification fails: show ONLY the error lines, not the full file

## VERIFICATION (run after EVERY change to App.tsx)
1. npx tsc --noEmit → must show 0 errors
2. Show only: pass/fail + error count
3. Do NOT show the full TypeScript output unless there are errors
## VERIFICATION — MANDATORY
ALWAYS run: npm run build
NEVER use: npx tsc --noEmit alone
npm run build is the only check that matches Vercel exactly.
Do not commit if npm run build shows any error.

## Critical Rules — Never Break These
- NEVER change api/analyze.js
- NEVER change vercel.json maxDuration (stays at 60)
- NEVER set max_tokens above these limits:
  - Intel P1 (Sonnet + web search): 1400
  - Intel P2 (Sonnet, no web search): 2500
  - Macro P1 (Sonnet-4-6): 2000
  - Macro P2 (Sonnet-4-6): 2000
  - Filter (Haiku): 3500
  - Session (Haiku): 1800
  - Instrument Detail (Haiku): 1500
- NEVER use module.exports in api/ files (must use export default)
- NEVER hardcode API keys — always use process.env.ANTHROPIC_KEY

## Architecture
- Vercel plan: HOBBY — 60s hard timeout, cannot be increased
- All AI calls go through /api/analyze (callProxy function in App.tsx)
- Intel and Macro are now 2-part split (P1 auto, P2 on button tap)
- Session/Filter/AI Filter use Haiku — fast, no timeout issues

## Environment Variables
- ANTHROPIC_KEY — Claude API key
- TWELVE_KEY — TwelveData API key

## Current State (as of latest working version)
Working tabs: Markets, Charts, Session, AI Filter
In progress: Intel (2-part split), Macro (2-part split)
Known issue: Intel P1 timeout — being fixed with 2-part split

## Common Mistakes to Avoid
- Renaming intelElapsed variable (must stay as-is)
- Forgetting to reset Part 2 state when Part 1 is regenerated
- Adding web search to Part 2 calls (Part 2 must have NO web search)
- Removing the callProxy timeout (xhr.timeout=58000)
