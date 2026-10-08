# AJ Game Rental: the whole system, for AJ Chat Management

Written 2026-10-03 for the Codex project **AJ Chat Management**: a web app that
brings LINE OA, WhatsApp and Facebook Messenger chats into one inbox and is
meant to do everything from inside a chat.

This file describes what already exists, who owns what, and how to connect to
it. **Build on the systems below; do not re-implement them.** Each rule here
(prices, deposits, delivery times, terms) already has one owner. A second copy
in the chat app would drift from it, and customers would see two different
answers.

Facts come from the code as of today:

| Repo | What it is | Commit |
|---|---|---|
| `ajconsole` | The booking website | `c4a07d2` |
| `aj-line-oa-bot` | The Bot | `5fc2788` |
| `delivery-app` | Delivery App | `24f9544` |

The running handover log is `ajconsole/docs/PROJECT-STATE.md`.

Update, 2026-10-08 (Codex; live source/API verified): the production booking page's queue check waits six seconds before one direct Apps Script retry (at most three upstream calls, 18-second deadline) and reports repeated failure at most once a minute per browser; final booking still checks fresh availability. The Bot analytics page adds complete Bangkok-calendar Yesterday, Last week and Last month. New built-in Rental Terms `2026-10-08` add the individual/company-rate notice; `2026-10-07` is retained for earlier acceptances. Both new contract PDF types show that notice near totals, and the booking order and unpaid-resume pages show it below total before payment choice, in Thai/English with `@ajgame` linking to `https://lin.ee/VLB7CBe`. No company Rate Card exists yet. See `PROJECT-STATE.md` for diagnostic evidence, test results and what was not live-tested.

Additional analytics board fix, 2026-10-08: the Bot re-enables dragging and edge resizing when a `หน้ารวม` edit session expands from a narrow one-column window to a multi-column window. The `กรอบ− / กรอบ+` buttons resize the frame without edge dragging; `A− / A+` size only the text. Mobile remains a full-width ordered list, while the desktop arrangement persists in the admin analytics layout.

Payment UI follow-up, 2026-10-08: the personal-rate notice has spacing below the payment summary. The unpaid "continue payment" page now has the same amount-due breakdown as the first order page. Pay-now, on-delivery, fee and total values come from the selected method in the Bot's saved `plan.methods`; the frontend does not recalculate them independently.

---

## 1. The map

```
 Customers ──► LINE OA ──► Bot /webhook/line ──► (forward) Dialogflow / chatbot
           ──► Facebook ─► Dialogflow ─► Bot /webhook/dialogflow (fulfillment)
           ──► WhatsApp ─► Bot /webhook/whatsapp
           ──► ajgamerental.com (website, LIFF pages) ──► Bot APIs
                                                         │
             Bot (aj-line-oa-bot, Node/Express on Render) ◄──► Delivery App backend
             Google Sheets / Drive / Apps Script               (Express + TS + Postgres,
             Lalamove, Beam, SlipOK/EasySlip, SMTP,             Expo app for staff)
             Telegram, Discord, Google Maps
```

| System | Where | Stack | Who uses it |
|---|---|---|---|
| **Website** (`ajconsole`) | ajgamerental.com (static, GitHub Pages) | One big `index.html` plus pages; no build step | Customers book; Admin edits the catalogue |
| **Bot** (`aj-line-oa-bot`) | aj-line-oa-bot.onrender.com | Node 20, Express 5, ES modules | Webhooks, contracts, payments, LINE messages, analytics, admin API |
| **Delivery App** (`delivery-app`) | Backend on Render; Expo app (iOS / Android / web) for staff | Express + TypeScript + Postgres (mirrors Google Sheets) | Shop staff: bookings, delivery, customers, finance, stock |

---

## 2. Channels today, and the one constraint that matters most

- **LINE OA.** A LINE channel has **one webhook URL**, and it is the Bot's `/webhook/line`.
  - The Bot verifies the signature and answers itself:
    - slip images (payment check);
    - quick-quote codes (`QQ-XXXXXX`), answered with a quote card.
  - Everything else is forwarded to `LINE_FORWARD_WEBHOOK_URL`, the chatbot (Dialogflow).
  - `greeting-gate.js` holds back from the chatbot any customer who already got a card from the shop today, so the bot does not greet someone mid-conversation.
  - **The chat app cannot take over the LINE webhook without breaking all of this.** Choose one:
    1. Be added to the Bot's forward chain. The Bot already forwards events; add a second forward target, or have the Bot fan out.
    2. Be the webhook and forward every event, unchanged and signed, to the Bot first.
  - Talk to the owner before switching anything. Option 1 is the smaller change.
- **Facebook Messenger.** It goes through Dialogflow's Facebook integration, with the Bot as fulfillment (`/webhook/dialogflow`).
  - The daily greeting for Messenger asks an outside "greeting bridge" (`GREETING_BRIDGE_URL` / `GREETING_BRIDGE_TOKEN`) whether to greet.
  - Find out whether that bridge is already part of AJ Chat Management.
- **WhatsApp.** WhatsApp Business Cloud API, webhook at the Bot's `/webhook/whatsapp` (`WHATSAPP_*` env).
- **Sending to customers.**
  - LINE push and reply go through the Bot (LINE Flex cards) and the Delivery App (its own LINE service for booking, payment, delivery and reminder cards).
  - Both use the same OA channel token.
  - The chat app should **ask these systems to send** their cards rather than build copies of the cards.

---

## 3. What a customer can do today (the journey)

1. **Price check**, at `ajgamerental.com/quote/` or the pop-up on the site ("คำนวณค่าเช่า").
   - Device, days, bundle, accessories, and the no-ID option are priced from the catalogue.
   - The place box offers suggestions. It also takes a pasted Google Maps link, "📍 ใช้ตำแหน่งปัจจุบัน", or "🗺️ ปักหมุดบนแผนที่". The map is Google Maps with a TH/EN button, falling back to OpenStreetMap.
   - The round-trip delivery fee is a live Lalamove quote from the Bot (`/api/delivery/quote`), with AJ's discount applied.
   - "ส่งราคานี้ให้ร้านทาง LINE" sends a quote card into the customer's LINE chat (LIFF, `/api/quick-quote/line-send`). Without LIFF, the customer types a message carrying the code `QQ-…`, and the Bot answers it with the card.
2. **Book** on `ajgamerental.com`, in 3 steps:
   1. Device and dates. A live queue check (`/api/availability`), closures and ready dates, and holds (`/api/booking-holds`) that keep two people from booking the same slot.
   2. Customer details. LINE connect, returning-customer discount (10%), review discounts, VIP rates, ID or passport and expiry, the no-identity option (deposit ฿2,000 → ฿10,000, ฿4,000 → ฿15,000, any PS5 bundle ฿15,000), address, Google Maps place, and Rental Terms acceptance.
   3. Order page ("Rental ID" page). Payment by Beam (card / e-wallet / PromptPay), bank transfer with a slip check, or pay later.
   - Before choosing payment, individual-rate pricing and the company-document contact are shown after totals; the same notice appears when resuming payment. The website does not promise or categorically refuse a receipt or VAT tax invoice.
   - The ordinary website booking collects its quoted delivery charge with rent. The Delivery App's dispatch card does not ask the customer to pay that fee again; only an explicitly entered unpaid difference appears on the card. A delivery quote failure must not be presented as a paid fee.
3. **Identity.** Photos (ID + selfie), refund account (Thai bank or Wise) and signature, now or later ("ยืนยันตอนนี้"). The result is a contract PDF, plus a Master Agreement valid for 1 year.
4. **Games.** The game picker (`game_index.html`, up to 10 games, storage warning). Games cannot be added or changed during the rental (Rental Terms 2026-10-03, item 9). The game card in LINE has "แก้ไขรายการเกม".
5. **After booking.**
   - LINE confirmation cards, and confirmation email with PDFs.
   - The "คิวเช่าของฉัน / My rental" page (`/my-rental/:token` on the Bot, `/c/my…` on the Delivery App). From there the customer can extend, change dates, cancel or modify, see delivery and return times, and pay a balance.
6. **ajgameid.** PS5 and Nintendo Switch game-account (ID) rental pages, ordered over LINE.
7. **Analytics** for the shop at `/analytics/` on the Bot:
   - three tabs: website, quick quote, greeting buttons;
   - a 🧩 "หน้ารวม" board the admin arranges, saved per admin.
   - The website tab can select Yesterday, previous Monday–Sunday and previous calendar month in Bangkok time; availability failures are event counts, not unique customers.

---

## 4. The Bot (aj-line-oa-bot): every capability

All routes are in `src/server.js`; logic lives in `src/services/*`.

### Customer-facing pages served by the Bot
- `/c/:token` (contract start)
- `/verify-identity/:token`
- `/no-contract/:token` (accept higher-deposit terms)
- `/pay/:token` (private payment page)
- `/pay-method/:token`
- `/my-rental/:token`
- `/rental-terms/` (embedded by the site)
- `/game-selection/link/:code`
- `/quick-quote/:key` (redirects to the site)
- `public/liff/*` (the LINE LIFF contract form and booking tools)

### Booking and contract
- `POST /api/booking-context/:code` creates the booking context (the site hands the booking over here).
- `GET /api/booking-context/:token` reads it.
- Writes to a booking context:
  - `…/agreement`
  - `…/identity`
  - `…/delivery` (stamps the quote shown)
  - `…/line-link`
  - `PATCH …/message`
- `POST /api/contracts` creates a contract.
- `GET /api/contracts/search` and `GET /api/contracts/history` find contracts.
- PDFs come from `services/pdf.js`: the contract and the Rental Order, with the full Rental Terms of the accepted version.
- `services/rental-terms.js`: versioned Rental Terms, latest built-in `2026-10-08` (preserve earlier versions for accepted orders; an admin-published version may supersede the built-in default).
  - `GET /api/rental-terms` reads them; admin publishes with `PUT /api/admin/rental-terms`.
- Identity:
  - `/api/identity-drafts` (the number is kept server-side; the page keeps only the last 4 digits);
  - `/api/identity-verify/:token`;
  - `/api/identity-upgrade/:token`.
- Customer checks:
  - `/api/customers/returning-eligibility` (returning discount);
  - `/api/vip-entitlement`.
- Blacklist check (blacklistseller.com), off by default (`BLACKLISTSELLER_ENABLED`).

### Availability and catalogue
- `GET /api/availability`
- `GET /api/queue-closures` (Admin → ปิดคิว)
- `GET/POST/DELETE /api/booking-holds`
- `GET /api/catalog`
- The catalogue the site reads lives in a GitHub Gist, `aj_rental_data.json` (devices, bundles, accessories, ready dates).

### Delivery
- `POST /api/delivery/quote`: Lalamove round trip.
  - It takes `{mapsUrl, address, deviceCount, hasLargeItem, days, lang, rentalCode?, attempt?}` and returns `{quote, location}`.
  - It is limited to 30 requests per 15 minutes per IP.
  - When a quote fails, AJ is alerted by LINE.
- `POST /api/places/search`: place suggestions `{name, address, lat, lng, link, pin}`, using Google Places, then Geocoding, then Nominatim. Limited to 60 requests per 15 minutes.
- `services/maps-location.js` resolves any Maps link (short links included) to coordinates.

### Payments
- Beam:
  - `POST /api/payments/beam-link`
  - `GET /api/payments/beam-status`
  - `POST /api/payments/confirm-return`
  - the `/webhook/beam` webhook (HMAC)
- Bank slips: a LINE image goes through SlipOK, then EasySlip, then a check against AJ's receiving accounts (`SHOP_RECEIVER_*`).
- Pay later:
  - `/api/rentals/pay-later`
  - `/api/rentals/payment-page`
  - `POST /api/rentals/payment-page/update`: the private email token may update the same unpaid Rental ID from the booking site's original step controls. The Bot allowlists customer-editable booking fields, preserves identity/agreement/payment-status fields, invalidates an old unpaid Beam link, and writes both Console Pending and the rental-history mirror. Delivery App sees the changed Console Pending row on refresh.
  - `/api/rentals/payment-page/link`
  - reminder email
- `services/rental-confirmation.js` turns a payment into the paid flow: confirmation cards and email, a Delivery App update, and the PDFs.

### LINE
- `services/line.js` holds every Flex card the Bot sends:
  - booking and confirmation;
  - game picker and game saved ("⚠️ ไม่สามารถเพิ่มหรือเปลี่ยนเกมได้ระหว่างระยะเวลาเช่า" above "แก้ไขรายการเกม");
  - quick quote;
  - payment;
  - identity reminders.
- `POST /api/line/game-picker-card` sends the game picker card.
- Admin notices go to the shop's LINE (`ADMIN_LINE_USER_ID`), Telegram and Discord (`services/notifications.js`).
- The quick-quote LIFF captures the customer's LINE user id, so a card can be pushed to them.

### Analytics
- `POST /api/analytics/event` (queued, written to the analytics sheet)
- `GET /api/admin/analytics`
- `GET/PUT /api/admin/analytics-layout`

### Admin API
- Authentication: `POST /api/admin/login` (or a passkey) returns a Bearer token used on every `/api/admin/*` route.
- Bookings and rentals:
  - `/api/admin/bookings`
  - `/api/admin/bookings/:code`
  - `…/send`
  - `/api/admin/rentals/:code`
  - `…/resend-confirmation`
- Contracts:
  - `/api/admin/contracts`
  - `PUT …/:rowNumber`
  - `…/regenerate`
- Settings and data:
  - `/api/admin/devices`
  - `/api/admin/pickup-locations`
  - `/api/admin/queue-closures`
  - `/api/admin/site-content/:key`
- Customers:
  - `/api/admin/vip-customers` (+ `line-lookup`)
  - `/api/admin/returning-eligibility-details`
  - `/api/admin/identity-reminders/run`
  - `/api/admin/blacklistseller/check-past`
- Test endpoints exist under `/api/admin/test/*` and `/api/integrations/test/*`. LINE test messages go to `LINE_TEST_USER_ID`.

### Integration with the Delivery App (signed with the shared secret `AJ_RENTAL_WEBHOOK_SECRET`)
- The Delivery App calls the Bot:
  - `/api/integrations/delivery-app/rental-status`
  - `…/my-rental-change`
  - `…/pay-later-email`
  - `…/pay-later-preview`
  - `…/lalamove/{setup,quote,order,status,cancel,priority-fee,change-driver}`: the Lalamove gateway for trips called from the delivery queue. The Bot holds the Lalamove credentials and the shop pickup point. Every call is signed and carries `sentAt` (refused when more than 5 minutes off). `order` also requires a `requestId`: the same id within 30 minutes returns the same order, never a second paid one. `leg: 'delivery'` runs shop → customer; `'return'` runs customer → shop. The shop end is named `jj`, phone `0816244715`. Lalamove's `shareLink` shows both ends of the trip, so it is for staff only.
- The Bot calls the Delivery App at `/api/integrations/aj-rental/*` (see section 5).
- Other Bot endpoints the Delivery App uses:
  - `GET /api/id-pending` (game-ID requests);
  - `POST /api/console-pending-submissions`.

---

## 5. The Delivery App: every capability

Backend routes are mounted in `backend/src/server.ts`. The staff screens are in `frontend/src/screens`.

### Screens (staff)
- Dashboard
- Booking Log, with:
  - Console Pending (requests from the site, with Confirm / "ยกเลิกรายการ");
  - ID Pending (PS5 and Switch game-ID requests);
  - เช่าต่อ / Extension Pending: open customer extension requests. Staff can deduct the extension rent from the refundable deposit; this moves the return date, writes the remaining deposit to Booking `คืนเงินโอน`, and sends the existing Delivery App LINE Flex confirmation in Thai or English.
- Delivery Queue (today / tomorrow, route, proofs)
- Customers (list, detail, history, identity)
- Stock / Inventory
- Game Accounts
- Finance
- Quotation (PDF quotes)
- Global Search
- AI Chat / Search AI (an agent with tools)

### APIs (prefix, then main routes)
- `/api/bookings` covers the rental itself:
  - today, tomorrow and range; route optimisation;
  - creating, editing and deleting a booking;
  - time, location and done;
  - return check;
  - proofs (photos);
  - contract;
  - dispatch holds;
  - identity status;
  - customer confirmations;
  - run-confirmation;
  - extras.
- `/api/console-pending`: list, quote, pay-later preview and email, confirm, cancel.
- `/api/extension-pending`: authenticated staff list; `POST /:extensionRequestId/deduct-deposit` settles from the refundable deposit. Extension price and queue rules remain in `rentalExtensionService.ts`; repeated deductions continue from Booking `returnTransferRefund`, not the original deposit.
- `/api/customers`: list, lookup, sync, history, identity, rental extras, contract PDF, rental and contract lookup.
- `/api/deliveries`: delivery records.
- `/api/game-selection`: state, notify, resolve, submit. Game card: `services/gameSelectionFlex.ts`.
- `/api/game-accounts`: platforms, plan, assign, release.
- `/api/inventory`
- `/api/padlocks`: bag-lock codes.
- `/api/dispatch` (staff auth): Lalamove trips from the delivery queue. Routes: `prepare`, `quote`, `confirm` (idempotent on `jobId`; one live trip per booking and leg), `jobs?rows=`, `jobs/:jobId/{refresh,cancel,priority-fee,change-driver}`.
  - `POST /api/dispatch/quote` may include `customerPoint` and/or `shopPoint`, each `{lat,lng,address}` in Thailand. Without overrides, the booking customer location and configured shop location are always the defaults. A selected point replaces the customer or shop end for either delivery or return. The backend stores both ends in the held Lalamove quote, so `confirm` uses the same stops and quotation. Staff edit all four route positions in the Delivery App picker at `/dispatch-place/`, and can reset each end to its default; named saved places stay on that staff device. Bot signed quote accepts `shopPoint` while keeping the configured shop contact name and phone.
  - Trips are kept on the Sheet tab `Lalamove Jobs`.
  - A 60-second poller sends the customer LINE Flex cards. These never show a fare, the shop address or a tracking link.
  - Delivery cards: confirmed (dropoff, recipient, phone); picked up with ETA; then 30 / 15 / 5 minutes away; then "เครื่องถึงที่อยู่ของคุณแล้ว" on completion. The last one is the shop's delivery card (bag codes, balance), using the payment method the shop confirmed when it sent that card (recorded on the Sheet tab `Delivery Card Sent`); with no confirmed method it has no payment part.
  - Customer tracking page `/c/track/<token>` (deliveries only, HMAC-signed with `AJ_RENTAL_WEBHOOK_SECRET`, prefix `aj-track:`): the customer's point, plus the driver once more than 2 km from the shop, and the ETA. It never shows the shop. JSON at `/c/track/<token>/state`. The map is Google Maps, using the Bot's `GOOGLE_MAPS_BROWSER_KEY` from `/api/config`, with an OpenStreetMap fallback.
  - Return cards: confirmed (pickup point, sender, phone); one card on pickup saying when the items reach the shop. No updates, no tracking page, no arrival card. Every ETA is labelled as an estimate that depends on traffic and weather.
  - ETA comes from the Google Routes API with traffic, falling back to a distance estimate.
- `/api/finance`: summary, entries, expenses, sales, refs.
- `/api/quotation`
- `/api/fraud`: blacklist and reports.
- `/api/web-push`: staff push notifications.
- `/api/agent`: AI agent, with chat, stream and confirm.
- `/api/line`:
  - its own LINE webhook;
  - pushes: booking-confirm, payment-request, details-confirmed, delivery-message, no-contract-terms, reminders;
  - `POST /api/line/push/delivery-message/:rowIndex` builds the same dispatch text used for staff preview and the customer LINE Flex. For ordinary prepaid bookings, omitted, `paid` and legacy `default` delivery-fee choices all omit the delivery-fee line; an explicit positive `difference` is the only exception. The mobile popup no longer shows the "delivery already paid" checkbox. Backend deployment should precede a new app bundle so older staff clients cannot make the sent card ask for the fee again.
  - account bind and unbind;
  - my-rental link.
- `/api/integrations/aj-rental/*`, called by the Bot:
  - contract-signed, payment-confirmed, line-linked, blacklist-check, identity-updated;
  - extension-payment, unreadable-slip;
  - flex-sent, game-selection, delivery-payment-link;
  - payments.
- Customer pages under `/c/*`:
  - delivery and return confirmation;
  - date change;
  - terms;
  - extension (quote, pay, status);
  - rental guide, cancel and modify;
  - My rental (`/c/my…`);
  - payment match;
  - help.
- Background jobs:
  - reminders (delivery and return LINE reminders);
  - delivery and extension payment pollers;
  - Lalamove trip poller (status, ETA, customer cards);
  - Postgres backup;
  - sheet mirror.

### Business rules the Delivery App owns
- **Delivery times** (`deliveryTiming.ts`), applied when an order arrives:
  - from the cutoff up to 22:00: 10:00;
  - after 22:00 (until 06:00): 13:00;
  - 19:00–19:59: +1 h;
  - otherwise +3 h with games, +1 h without.
- Bundle partner bookings: one booking per device of a bundle.
- No-ID deposits and VIP rates carried onto bookings.
- Rental ID allocation: `AJ-YYYYMMDD-R0001`, from the rental-code sheet or Apps Script.

---

## 6. The website (ajconsole)

- `index.html`: the whole booking flow, plus pop-ups for:
  - all consoles, the calculator and FAQ;
  - steps, rental terms and reviews.
  It also holds Admin (catalogue, closures, site content), signed in with the Bot's admin login or a passkey.
- `quote/`: the rental calculator.
- `game_index.html`: the game picker and catalogue (also used inside LINE).
- `ajgameid/`, `ajgameid/switch/`: game-ID rental.
- `ajboardgame/`: board games.
- `assets/place-search.js` + `assets/pin-map.html`: the shared place box and pin map.
- `google-apps-script/`: the rental-code allocator and social-proof sync.

The site has no server of its own. Everything stateful goes through the Bot (`CONFIG.apiBase`).

---

## 7. Data: where things live

| Data | Store | Owner |
|---|---|---|
| Contracts, bookings, booking context, site content, Rental Terms versions, analytics layout | Google Sheets (`GOOGLE_SHEETS_ID`, tabs per kind) | Bot |
| Analytics events | `ANALYTICS_SHEETS_ID` | Bot |
| Customer DBs (Thai / foreign), legacy contracts | Sheets (`DELIVERY_CUSTOMERS_*`, `LEGACY_*`) | Bot reads; Delivery App writes |
| Bookings, deliveries, customers, finance, inventory, payments, extensions, rental codes | **Postgres** (`DATABASE_URL`), mirrored to Sheets | Delivery App |
| Catalogue (devices, prices, bundles, accessories, ready dates) | GitHub Gist `aj_rental_data.json` | Website Admin |
| Contract and proof PDFs and photos | Google Drive (+ Apps Script uploads) | Bot / Delivery App |

**IDs to key on:**
- Rental ID `AJ-YYYYMMDD-R####`;
- the LINE user id (`U…`);
- the phone number (Thai numbers normalised to `0…`);
- the quick-quote code `QQ-XXXXXX`.

---

## 8. What AJ Chat Management should do from inside a chat

Each row is an action, and the system that already does it. Call that system;
show its result in the chat.

| In the chat | Ask | Notes |
|---|---|---|
| Who is this customer? Past rentals, VIP, blacklist, identity status | Delivery App `/api/customers/lookup`, `/api/customers/:id/history`; Bot `/api/vip-entitlement`, `/api/admin/vip-customers` | Match by LINE user id first, then phone |
| Price a rental and send the quote | Bot `/api/delivery/quote` + the catalogue Gist; or send the customer the calculator link `ajgamerental.com/quote/?device=<id>` | Prices follow the site's rules (`quote/index.html` `rentalCost`). Do not re-type them |
| Check the queue | Bot `/api/availability`, `/api/queue-closures` | |
| Create / edit / cancel a booking | Delivery App `/api/bookings`, `/api/console-pending/confirm`, `…/cancel` | Admin auth |
| Send the booking link, game picker, payment request, My rental link | Delivery App `/api/line/push/*`, `/api/line/my-rental-link`; Bot `/api/line/game-picker-card`, `/api/rentals/payment-page/link` | Uses the existing Flex cards |
| Payment status / check a slip | Bot `/api/payments/beam-status`; the slip flow is automatic for LINE images; Delivery App `/api/integrations/aj-rental/payments` | |
| Delivery time, driver, proofs | Delivery App `/api/bookings/today|tomorrow|range`, `/:rowIndex/proofs` | |
| Lalamove trip: status, driver, ETA | Delivery App `/api/dispatch/jobs?rows=`, `/api/dispatch/jobs/:jobId/refresh` | Read-only from a chat. Placing, cancelling and tipping spend the Lalamove wallet; leave them to the queue screen unless the owner agrees otherwise |
| Extend / change dates | Delivery App `/c/extension…`, `/c/date-change…`, `/c/rental/modify…` (customer links); staff deposit settlement at `/api/extension-pending/:extensionRequestId/deduct-deposit` | Send the customer link for self-service; the staff endpoint reuses the same extension request and rules |
| Contract / PDFs / identity follow-up | Bot `/api/admin/contracts`, `/api/admin/rentals/:code/resend-confirmation`, `/api/admin/identity-reminders/run` | |
| Game-ID rental requests | Bot `/api/id-pending` (`?platform=ps5|switch`) | |
| Shop notes / AI help | Delivery App `/api/agent/*` | Already has tools |

Integration needed in the existing systems (agree with the owner first):
- **A service credential for the chat app.** Today admin routes use the Bot's admin login token (`/api/admin/login`), and Bot ↔ Delivery App uses `AJ_RENTAL_WEBHOOK_SECRET`. Add a dedicated secret for the chat app; do not reuse either.
- **LINE webhook chain** (section 2).
- **Who sends the reply.** Messages typed by staff in the chat app should go out through the OA's push / reply API using the same channel. Either the chat app holds the token (`LINE_CHANNEL_ACCESS_TOKEN`), or it asks the Bot to send. Do not open a second LINE channel.

---

## 9. Rules every system here follows (keep them)

- **Secrets.** Never commit an API key, token or password. They go in `.env` / Render env, untracked. Only the **names** appear in this file.
- **Thai and English everywhere** a customer reads anything. Thai is the default; English follows `lang`.
- **Never block a payment** on a failed side service (delivery quote, address lookup). Let the customer pay; AJ settles the rest.
- **One owner per rule.** Prices and deposits come from the catalogue and the site's rules; delivery times from the Delivery App; terms from the Bot's Rental Terms (versioned). Do not copy them.
- **Rental Terms** are versioned. Every acceptance stores its version, and PDFs print the version accepted.
- **LINE test messages** go to `LINE_TEST_USER_ID`, never to real customers.
- Log changes in `ajconsole/docs/PROJECT-STATE.md`.

## 10. Environment variable names (no values)

**Bot:** `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `LINE_LIFF_ID`, `ID_RENTAL_LIFF_ID`, `LINE_FORWARD_WEBHOOK_URL`, `ADMIN_LINE_USER_ID`, `DIALOGFLOW_*`, `GREETING_BRIDGE_URL`, `GREETING_BRIDGE_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_GRAPH_VERSION`, `BEAM_*`, `SLIPOK_*`, `EASYSLIP_*`, `SHOP_RECEIVER_ACCOUNTS`, `SHOP_RECEIVER_NAMES`, `LALAMOVE_*`, `GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_BROWSER_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_SHEETS_ID`, `ANALYTICS_SHEETS_ID`, `DELIVERY_CUSTOMERS_SHEETS_ID`, `LEGACY_CONTRACTS_SHEETS_ID`, `GOOGLE_DOC_TEMPLATE_ID_TH/EN`, `GOOGLE_DRIVE_OUTPUT_FOLDER_ID`, `GOOGLE_APPS_SCRIPT_UPLOAD_URL`, `GOOGLE_APPS_SCRIPT_SECRET`, `AJ_RENTAL_WEBHOOK_SECRET`, `DELIVERY_APP_BASE_URL`, `IDENTITY_LINK_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SMTP_*`, `EMAIL_TO`, `BOOKING_EMAIL_*`, `TELEGRAM_*`, `DISCORD_WEBHOOK_URL`, `BLACKLISTSELLER_*`.

**Delivery App:** `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `DIALOGFLOW_LINE_WEBHOOK_URL`, `AJ_LINE_OA_BOT_BASE_URL`, `AJ_BOT_BASE_URL`, `AJ_RENTAL_WEBHOOK_SECRET`, `AJ_SHOP_LINE_USER_IDS`, `AJ_MY_LIFF_ID`, `AJ_HOP_LIFF_ID`, `GOOGLE_SHEET_ID`, `GOOGLE_SHEETS_CREDENTIALS_JSON`, `RENTAL_CODE_SHEET_ID`, `FINANCE_SPREADSHEET_ID`, `THAI/FOREIGN_CUSTOMER_DB_SPREADSHEET_ID`, `CONTRACT_*`, `PROOF_*`, `QUOTATION_*`, `GOOGLE_MAPS_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `WEB_PUSH_*`, `TELEGRAM_*`, `DISCORD_WEBHOOK_URL`, `SMS_*`, `REMINDER*`, `DATA_SOURCE_*`.

## 11. Open questions for the owner before building

1. LINE webhook: should AJ Chat Management sit after the Bot (forwarded events), or in front of it?
2. Is the Messenger "greeting bridge" (`GREETING_BRIDGE_URL`) already AJ Chat Management?
3. When a staff member replies in the chat app, should the chatbot (Dialogflow) stay quiet for that customer for the day? The Bot's `greeting-gate.js` already does this for cards.
4. Which staff accounts and roles does the chat app need? Today there is one admin login per system, plus passkeys on the Bot.
5. Should the chat app write bookings directly (Delivery App API), or only send customers the existing links and cards?
