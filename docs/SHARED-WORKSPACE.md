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
  - Rental Terms belong to the Bot (versioned; latest logged version `2026-10-07`).
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

- **Delivery card, `delivery-app`:** The ordinary website booking collects delivery with rent. `POST /api/line/push/delivery-message/:rowIndex` now defaults to no delivery-fee line in the Thai/English text and LINE Flex, even if an older app sends `deliveryFee: "default"`; only an explicitly positive `difference` adds a line. The staff popup no longer asks whether delivery was paid, and its preview has no redundant fee-status line. Deploy backend first, then update the staff app; an older app can still show an obsolete fee hint in its local preview even though the backend sends no such line. See `PROJECT-STATE.md` and Delivery App `CHANGELOG.md` for commit/tests.
- **Before-rent design demo, `ajconsole`:** `index-demo.html` (commit `4337f4e`) has the bilingual menu, footer links, per-console game-list buttons and no three-line note below the console rail. `index.html` production was not changed by that redesign. Demo: `https://ajgamerental.com/index-demo.html?demo=4337f4e`.
- **Pending owner decision, not implemented:** Place a concise individual-vs-company-rate notice by the booking payment totals, with a smaller heads-up on the price catalogue; link `@ajgame` to `https://lin.ee/VLB7CBe`. If approved, update both languages, a new version of Bot Rental Terms, and new rental contract PDFs together. Do not state that a customer can never receive a receipt without Thai tax/accounting review; a receipt and a VAT tax invoice are different documents. No rate-card, notice, Terms or PDF change has been made for this proposal.
