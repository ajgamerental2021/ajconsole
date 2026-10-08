# AJ shared workspace (Claude Code + Codex)

This is the one file both agents read before working on any AJ repository.
Keep it short and current. Update it whenever a repository, a rule or an
ownership boundary changes.

## Repositories

All repositories are on GitHub under `ajgamerental2021`.

| Repo | What it is | Deploys to | Work on |
|---|---|---|---|
| `ajconsole` | Booking website: static HTML, no build step | ajgamerental.com (GitHub Pages) | `main`, via a feature branch |
| `aj-line-oa-bot` | The Bot: Node/Express. LINE, WhatsApp and Dialogflow webhooks, contracts and PDFs, payments (Beam, slips), delivery quotes (Lalamove), admin API, analytics | Render (aj-line-oa-bot.onrender.com) | `main`, via a feature branch |
| `delivery-app` | Delivery App: Express + TypeScript + Postgres backend, Expo app for staff (bookings, delivery, customers, finance, stock) | Render + app stores | `main` |
| AJ Chat Management | Codex's web app: one inbox for LINE OA, WhatsApp and Facebook, acting on the systems above from inside a chat | — | Codex's own repo |

## Read before working

1. `ajconsole/docs/AJ-SYSTEM-HANDOVER-FOR-AJ-CHAT.md` covers the whole system: every capability, route, data store, owner, env var name, and the in-chat action map.
2. `ajconsole/docs/PROJECT-STATE.md` is the running log of changes, newest first. Read the top entries.
3. Each repo's `AGENTS.md`, which `CLAUDE.md` points to as well.

## Rules for both agents

- **Secrets.** Never commit an API key, token or password. They live in `.env` / Render env. Docs name variables, never values. If a value is needed, the owner sets it.
- **One owner per rule. Call it; never copy it.**
  - Prices, deposits and the catalogue belong to the website plus the catalogue Gist.
  - Delivery times belong to the Delivery App (`deliveryTiming.ts`).
  - Rental Terms belong to the Bot (versioned; latest built-in version `2026-10-08`; retain `2026-10-07` for earlier acceptances).
  - LINE Flex cards belong to whichever system sends them today.
- **LINE OA has a single webhook URL,** and it is the Bot's. Do not repoint it. Get events by forwarding from the Bot, after agreeing it with the owner.
- **Thai and English** wherever a customer reads anything.
- **Never block a payment** on a failing side service.
- **LINE tests** go only to `LINE_TEST_USER_ID`.
- **Integrations between systems** use their own shared secret. Do not reuse another system's secret or the admin password.
- **Pushing.** Run the repo's tests before you push:
  - `ajconsole`: `node --test tests/*.test.mjs`
  - `aj-line-oa-bot`: `npm test`
  - `delivery-app`: `npm run test:*`
- **Logging.** Log every change at the top of `ajconsole/docs/PROJECT-STATE.md`: what changed, which commit, and anything the owner must do.
- **Notify Claude of Codex changes.** Whenever Codex creates, modifies or deletes anything in `ajconsole`, `aj-line-oa-bot` or `delivery-app`, add a clear entry at the top of `PROJECT-STATE.md` for Claude Code: who changed it, what was added/changed/deleted, why, the affected repo/commit, tests, and any owner or deploy action. Add a `Request` entry before implementation when another agent-owned repo is involved, then replace or follow it with the completed result.
- **Shared contracts.** If your change touches an API another system calls, update the handover file in the same commit, and say so in PROJECT-STATE.

## Working together

- **Claude Code** works on `ajconsole`, `aj-line-oa-bot` and `delivery-app`.
- **Codex** works on AJ Chat Management, and changes the other three only when an agreed integration needs it.
- **To ask for a change in another agent's repository,** add a "Request" entry at the top of PROJECT-STATE: who is asking, what is needed, and why. The owner relays it.
- **Open decisions** are listed at the end of the handover file, in section 11. Do not build past them before the owner decides.

## Current handoff — 8 October 2026

- **Payment UI, 8 Oct:** Website commit `0780455` separates the individual-rate notice from the total card and adds the missing yellow amount-due block to resumed payments. It reads the Bot's saved payment plan for the selected method, including fees and pay-on-delivery balance. Thai/English and 309 website tests passed; no payment was submitted during testing.
- **Analytics board editing:** Bot commit `5b1b0c4` corrects a resize-order race that could leave the two-column `หน้ารวม` board static after opening narrow. Drag/edge-resize return when the actual GridStack columns widen; `กรอบ− / กรอบ+` provide an explicit frame-size fallback. One-column/mobile stays a natural-height list and does not overwrite the saved 12-column arrangement. Bot tests 582/582 passed; live Render source and visible buttons were verified, but saved panels were not moved as a production test.
- **Queue/analytics and company-rate notice, 8 Oct:** Website availability checks had a 2-second redundant hedge against two sources; normal 3–5-second replies could produce four upstream calls. It now waits 6 seconds, retries only the direct Apps Script source, caps at three calls and 18 seconds, and rate-limits repeated error reporting per browser to once a minute. It still requires a fresh queue result at booking. Analytics gets Bangkok-calendar Yesterday/Last week/Last month. The live 7 Oct dashboard showed 34 failure *events* (only 1 timeout and 2 AggregateErrors specified); 8 Oct had 9 (6 timeouts, 3 AggregateErrors). This is not 34 unique renters, and exact historical upstream failures cannot be recovered from the 31 events without detail. No-cache live checks confirmed updated website, Bot Terms and analytics source after deployment; monitor failure counts/details over subsequent days.
- **Individual/company rates:** Production booking order and unpaid-resume summaries now show the Thai/English personal-rate notice below totals before payment methods, linking `@ajgame` to `https://lin.ee/VLB7CBe`. Bot Rental Terms `2026-10-08` add the same clause and both current contract/Rental Order PDFs print it near totals; historical versions remain unchanged. The wording asks renters to request a company rate; it does not claim that an individual renter can never receive a receipt. Have the owner/accountant review company-document eligibility. No company Rate Card was built.
- **Delivery card, `delivery-app`:** The ordinary website booking collects delivery with rent. `POST /api/line/push/delivery-message/:rowIndex` now defaults to no delivery-fee line in the Thai/English text and LINE Flex, even if an older app sends `deliveryFee: "default"`; only an explicitly positive `difference` adds a line. The staff popup no longer asks whether delivery was paid, and its preview has no redundant fee-status line. Deploy backend first, then update the staff app; an older app can still show an obsolete fee hint in its local preview even though the backend sends no such line. See `PROJECT-STATE.md` and Delivery App `CHANGELOG.md` for commit/tests.
- **Before-rent design demo, `ajconsole`:** `index-demo.html` (commit `4337f4e`) has the bilingual menu, footer links, per-console game-list buttons and no three-line note below the console rail. `index.html` production was not changed by that redesign. Demo: `https://ajgamerental.com/index-demo.html?demo=4337f4e`.
