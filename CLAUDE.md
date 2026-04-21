# Auxiron — Trading Intelligence PWA

## Project Overview
React + TypeScript PWA deployed on Vercel. Single file architecture: all UI in `src/App.tsx`.
API proxy in `api/analyze.js`. Prices in `api/prices.js`.

## Critical Rules
- **NEVER** edit `src/App.tsx` in small patches — it is 1,678 lines and brace-sensitive JSX
- **ALWAYS** verify brace balance after any App.tsx change: opens must equal closes
- **NEVER** increase max_tokens above these limits (causes Vercel timeout):
  - Intel tab (Sonnet + web search): max 2000
  - Macro tab (Haiku): max 1500  
  - Session/Filter/AI Filter (Haiku): max 2500
- **NEVER** change `vercel.json` maxDuration — it is already set to 60s correctly
- **NEVER** change `export default` to `module.exports` in api/ files

## Architecture
- `src/App.tsx` — entire React app (1,678 lines, monolithic by design)
- `api/analyze.js` — Anthropic API proxy, handles both Haiku and Sonnet+web search
- `api/prices.js` — TwelveData proxy with ETF scaling for indices
- `vercel.json` — maxDuration:60 for analyze.js, do not change
- `index.html` — viewport meta for mobile/tablet scaling

## Environment Variables (Vercel)
- `ANTHROPIC_KEY` — Claude API key
- `TWELVE_KEY` — TwelveData API key

## AI Features & Models
| Feature | Model | max_tokens | Web Search |
|---|---|---|---|
| AI Filter | claude-haiku-4-5 | 2500 | No |
| Session Briefing | claude-haiku-4-5 | 1800 | No |
| Instrument Detail | claude-haiku-4-5 | 1500 | No |
| Macro Intelligence | claude-haiku-4-5 | 1500 | No |
| Intel Tab | claude-sonnet-4-20250514 | 2000 | Yes |

## Known Working State
- 6 tabs: Markets, Charts, Session, Macro, Intel, Filter
- Live prices from TwelveData (ETF proxies for SPX/NDX/DXY/VIX)
- Responsive: mobile bottom nav, tablet/desktop sidebar at 1024px+
- Intel timeout fix: max_tokens reduced from 4000→2000

## Common Issues & Fixes
- **FUNCTION_INVOCATION_TIMEOUT on Intel/Macro**: reduce max_tokens, not maxDuration
- **Vercel build "Unterminated regex"**: extra </div> in JSX — check div balance
- **"Module not found" on deploy**: check export default vs module.exports in api/ files
- **Charts look like DNA/oscillating**: genFB simulation uses momentum engine, check dailyRange
