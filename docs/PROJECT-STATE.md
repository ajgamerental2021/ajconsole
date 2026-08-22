# Project state

## 2026-08-22 — Automatic LINE returning-customer verification

- On page startup, an existing LIFF login is detected without forcing a login. The LINE access token is verified with LINE server-side when available. LINE's in-app browser can retain the known LINE User ID while exposing no LIFF access token on the direct production URL, so that validated opaque `U` identifier is now a rate-limited fallback for the same server-side history lookup.
- A verified LINE User ID qualifies through either an `AJ Contract` row or a `Line / WhatsApp LOGs` Rental History row whose status is exactly `Confirmed`. Merely submitted `Pending` records and `Canceled` records never qualify.
- Customers without a LIFF session, without a linked LINE User ID, or without matching history retain the existing bilingual partial-identity verification fallback.
- When LINE eligibility is found, the page automatically selects the 10% returning-customer discount, keeps the contract branch consistent, and skips the corresponding Finger Guide questions. Step 3 shows a prominent bilingual green confirmation above the already-checked discount box. The manual partial-identity check continues to search contract rows only.

## 2026-08-22 — Returning-customer eligibility and newest-first event cards

- The 10% returning-customer checkbox now opens a bilingual eligibility dialog before it can affect pricing. Thai customers enter their prior-rental phone number plus the last four Thai-ID digits; English customers enter their agreement name plus the last four Passport characters.
- The bot checks those two values against prior contract rows server-side, returns only `eligible: true/false`, rate-limits attempts, and never returns identity or contract details to the booking page. Invalid, unavailable, and no-match states leave the discount unchecked.
- Customer Reviews & Past Events now places newly added Admin entries first. Added “TILOG-LogistiX 2026 at BITEC Bangna” as the first current card, with a 1000×1000 optimized image and the supplied Facebook detail link.
- Bot verification: 119/119 tests pass, including Thai/English partial-identity validation and renter-type matching.

## 2026-08-22 — Wise business-day guard and restored Step 3 order

- English Wise full payment is disabled on Saturdays, Sundays, and the 2026 Bank of Thailand financial-institution holidays. The card explains why it is unavailable and any previously selected Wise value falls back safely to balance on delivery.
- Production Step 3 is again ordered as Board Game Bundle → Google Maps → returning-customer discount (and its review discounts) → rental contract choice/link → payment.
- Thai and English returning-customer labels now state that the 10% discount is for returning customers only; review cards carry the same eligibility badge, while the one-year agreement warning remains intact.
- The finger guide follows the same visual order in both languages, including the returning-customer and no-contract branches.
- Returning-customer identity verification was intentionally not enabled yet. Recommended next step is a server-side eligibility endpoint with rate limiting and a short-lived signed eligibility token; do not expose or query Thai ID/passport records directly from the browser.

## 2026-08-21 — All rental-agreement handoffs use LIFF

- Booking messages shared through LINE, Messenger, and WhatsApp now carry a `liff.line.me` agreement URL even before a LINE user ID is known, allowing LIFF to capture the customer's LINE profile when opened.
- Structured booking context tokens now travel in the LIFF URL instead of a direct Render `/c/` URL, preserving device, dates, duration, delivery map, games, add-ons, and every applicable discount.
- LIFF Admin booking corrections now return and copy the same LIFF agreement URL in Thai and English; the Rental ID still reloads the corrected structured booking.

## 2026-08-21 — English booking copy says Thai QR Scan

- The generated and rebuilt English booking message now labels the balance-on-delivery method “Thai QR Scan”; payment-page and Thai copy are unchanged.

## 2026-08-21 — Removed cash from English payment copy

- English payment options and generated/rebuilt booking messages now list Thai QR, Card, and E-Wallet for the balance due on delivery without offering cash.
- Removed the obsolete English cash-payment sentence from the admin-managed FAQ in the production Gist.
- Thai payment copy and behavior are unchanged.

## 2026-08-21 — Complete corrected booking copy and faster Admin save

- Corrected booking copy now includes a non-zero delivery fee even when a legacy dedicated field still contains `0`; the Admin form also derives that field from an existing Thai or English delivery cost row and stores one canonical row on save.
- Successful Admin corrections append the reusable rental-agreement link to the copied Thai/English booking details unless No contract is selected.
- Reservation cancellation copy now names the exact deposit: Thai bank-transfer reservations are ฿200; English card/E-Wallet/Thai QR bank-transfer reservations are ฿1,000.
- Removed the redundant post-write Apps Script read from Admin booking saves. It could return stale data and made mobile requests time out after the write had already succeeded. Save progress/failure labels are now specific to saving rather than sending.
- Bot verification: 118/118 tests pass, including a regression for `deliveryFee: 0` plus a `Delivery fee = ฿300` cost row.

## 2026-08-21 — Bilingual Admin booking correction and delivery fee

- LIFF Admin > Bookings now includes an explicit TH/EN output-language selector and a dedicated delivery-fee field.
- The delivery fee is stored with the structured booking and appears exactly once in rebuilt Thai or English booking details.
- The edit screen can copy the untouched original customer booking message before any correction. After saving, the result screen can copy the newly rebuilt booking message as well as copy/open the rental-agreement link.
- The selected language controls both the rebuilt booking message and the generated agreement URL.
- Bot verification: 117/117 tests pass.

## 2026-08-21 — Admin booking correction now returns a contract link

- Saving LIFF Admin > Bookings now refreshes any seven-day in-memory booking context so the contract does not reload stale pre-edit pricing.
- A successful save shows a reusable rental-agreement URL for the same Rental ID, with Copy and Open actions. No replacement Rental ID is created.
- For an accidental returning-customer discount, remove the discount row, restore total/upfront/on-delivery values, leave No contract unchecked, save, and send the generated link.
- Bot test suite: 116/116.

## 2026-08-20 — English deposit-refund guidance restored

- Production payment options again state: “Deposit refund: Wise (1–3 business days) or Thai bank transfer, if available.”
- The English note includes links to Wise transfer timing, transfer policy, and country coverage. Thai wording is unchanged.

## 2026-08-20 — PS5 bundles hold every physical device

- A PS5 bundle booking now sends an atomic multi-device hold containing PS5 plus the selected physical bundle device: PS Portal, PS VR2, Logitech G29, or PS FlexStrike Wireless Fight Stick.
- The booking-hold API exposes each held device to availability polling, so a bundled peripheral is blocked from standalone and other bundle bookings for the same dates.
- Multi-device holds are stored and restored together in the customer's browser while remaining compatible with older single-device hold data.

## 2026-08-20 — LINE booking message fallback on desktop

- LINE booking handoffs still use the official message URL so mobile opens LINE with the complete booking message prefilled.
- On desktop devices with a fine pointer, the booking message is also copied to the clipboard before opening LINE. This gives PC customers a paste-ready fallback when LINE cannot open automatically.
- Mobile user agents are explicitly excluded from the extra copy step, preserving the existing working mobile flow.

## 2026-08-18 — reliable LINE, WhatsApp, and Messenger booking handoff

- Both the booking page and post-contract completion flow now use the current percent-encoded LINE OA URL (`%40ajgame`) and same-page universal navigation for LINE/WhatsApp, avoiding popup blockers after asynchronous booking work.
- Messenger no longer uses the stale numeric deep-link id. Both flows use `https://m.me/ajgamerental`, which resolves to the current AJ Page conversation.
- Messenger now has a dedicated bilingual handoff screen showing the complete booking message, a user-initiated Copy button, an Open Messenger button, and instructions to paste and tap Send. Opening retries the copy but still opens the universal fallback if clipboard permission is denied.
- LINE and WhatsApp carry their message in the supported URL and no longer depend on clipboard permission. WhatsApp remains English-only by product design.
- Verification: bot test suite 112/112; website inline syntax, diff check, and static regression checks for all three channel URLs pass.

## 2026-08-18 — LINE verified-slip Thai wrapping

- Corrected the target after screenshot clarification: the payment-purpose value remains `รอร้านตรวจสอบประเภทยอด`. The explanatory sentence below the rows now forces a break after `และจะตรวจสอบว่า`, keeping `ยอดนี้` together at the start of the next line instead of letting LINE strand `ย` at the end of the previous line. English copy is unchanged.
- Bot test suite: 111/111, including exact assertions for the unchanged purpose value and corrected explanatory newline.

## 2026-08-18 — net-balance loyalty discount and real 30-minute hold configuration

- Returning-customer 10% now applies last to the remaining eligible console rental balance: regular rental/accessories, less After Work, console promotions, and fixed Google/Facebook review discounts. Example: PS5 ฿1,200 − After Work ฿201 − reviews ฿200 = ฿799; loyalty rounds 10% to ฿80.
- Summary UI, structured contract handoff, and Thai/English booking messages list discounts in that same calculation order. The bot does not recalculate them: LIFF and PDF sum the signed booking-cost rows received from the website.
- Root cause of production still showing 10 minutes: `src/config/env.js` supplied its own 10-minute fallback to the 30-minute hold store. The server fallback is now 30, `render.yaml` explicitly sets `BOOKING_HOLD_MINUTES=30`, and a regression test asserts the server configuration—not only the standalone store.
- Bot verification: 111/111 tests pass. Production must report `ttlSeconds: 1800` before the 30-minute rollout is considered live.

## 2026-08-18 — Visible booking-share feedback and hold countdown

- Production `index.html` now shows an inline, accessible status directly below the LINE / Messenger / WhatsApp buttons as soon as the customer confirms. All share buttons are locked while the message is being prepared and for 12 seconds after the chat opens; the status survives returning from the chat app for 60 seconds. Thai and English copy explicitly tells the customer to send the prepared message in the chat, avoiding a false “sent automatically” claim.
- Calendar hold rendering now takes priority over the generic unavailable state for the current browser's hold and for capacity-blocking holds from other customers. Cells show `กำลังจอง · เช็คใหม่ใน N นาที` / `In progress · retry in N min`, calculated from the real hold expiry.
- Verified the production page at a 375×812 viewport in Thai and English with no browser console errors; inline JavaScript passes `node --check`.
- Follow-up review fixed the return-from-chat lock lifecycle: `lockedUntil` is persisted separately from the 60-second visible status, so Safari bfcache cannot unlock immediately or accidentally keep buttons locked for the full status duration.
- A production follow-up fixed two calendar regressions seen on iOS: failed first-load availability no longer remains labelled “checking” forever, concurrent callers now await the same in-flight refresh, and the customer's own 10-minute hold is persisted locally and merged back after Safari reload/bfcache or a backend instance change. The last successful availability payload is cached for display while the slow Apps Script refreshes; creating a new hold still requires a successful fresh refresh.
- Final root-cause review found `renderMonth()` was overwriting every busy cell's specific note with the generic unavailable label after `calendarDayStatus()` had already returned the hold countdown. That overwrite was removed. Render was retriggered after the production booking-hold endpoint was found returning `404`; the endpoint is now live. End-to-end production verification against a real Xbox Series S hold showed dates 18–21 as `In progress · retry in 4 min` and `กำลังจอง · เช็คใหม่ใน 4 นาที`, with no browser console errors.
- Hold acquisition is now the first network action after booking confirmation, using a provisional unique rental code when the final code is not ready; slow availability, payment-link, contract-context, and Sheet work happens only after the atomic hold exists. Open calendars poll the lightweight hold endpoint every 3 seconds and apply its result immediately without waiting for the slow Apps Script. Hold TTL is 30 minutes to cover contract completion and payment, while failed booking preparation releases the hold.
- Production concurrency verification: a second calendar that was already open changed to the hold label within 3.5 seconds, and a second overlapping acquisition returned HTTP 409. The frontend is live. The bot's 30-minute TTL commit is on `main`, but Render was still reporting `ttlSeconds: 600` after repeated checks, so the service needs a successful/manual deploy before production TTL becomes 30 minutes.

Running handover log between sessions and between assistants. Read at the start
of a session, update at the end. Newest entry first.

---

## 2026-08-18 — discounted contract totals and booking holds

### Fixed

- Contract pricing from the booking context is no longer overwritten by the
  catalog's undiscounted total in the bot backend. The LIFF form and local PDF
  independently sum the signed booking-cost rows, so PS5 ฿1,200 − After Work
  ฿201 + deposit ฿2,000 is stored and printed as ฿2,999 rather than ฿3,200.
- Added a server-side booking hold API and integrated it into every production
  booking action. Holds are atomic within the running bot service, scoped by
  physical model and overlapping dates, capacity-aware, and expire
  automatically after 10 minutes. `BOOKING_HOLD_MINUTES` can change the TTL.
- The booking page reads active holds with availability. A held last unit is
  unavailable in the calendar and the selected range explains that one booking
  is in progress with the remaining wait in minutes. The same browser can
  refresh its own hold without blocking itself.

### Verification

- Bot test suite: 102/102, including overlapping, refresh and expiry hold cases
  plus signed PDF booking-total calculation.
- Local API returned 201 for the first PS5 hold and 409 for a second overlapping
  hold; hold listing returned a 600-second TTL.
- Production booking page loaded in-browser, calculator rendered, and browser
  console had no errors. Inline JavaScript syntax and both repos' diff checks
  pass.

### Operational note

- Holds live in the bot process, which is sufficient for the current single
  Render instance. If the service is scaled to multiple instances, move the
  hold store to Redis/Postgres so all instances share the same atomic lock.

## 2026-08-17b — booking/steps/terms wording (both repos)

### Fixed

- Booking message (web `index.html` + bot `line.js`): added a "deposit
  refunded 100% when returned complete" line under the early-return line;
  reworded the reservation warning to point at the details above and end with
  a pointing hand (reservation variant only, both languages); Thai reservation
  footnote now says bank transfer; removed a doubled blank line before the
  amount due on delivery in the web Thai cash message (bot already collapses
  blank runs).
- Rental steps (web): transport both ways only, online service only with no
  shop pickup/return, dropped "if convenient" on the return confirmation, added
  a one-year-contract note. Removed "full deposit refund on return" from the
  Before rent terms line. Returning-customer hint notes a contract over a year
  old must be redone.
- Contract terms (bot LIFF `app.js`): cancellation clause now withholds the
  reservation fee too; new clause: contract valid one year, redo after.
- Contract PDF (`pdf.js`): 100% refund note under the refund account and the
  one-year term. Added a page-break guard — flowing content that reaches the
  signature zone starts a new page; normal contracts stay one page, a
  worst-case foreigner contract now flows to two instead of overlapping the
  signatures.

### Watch out for

- The rental clauses now live in two places: bot LIFF `termsCopy` (numbered
  list) and, for the one-year clause only, `pdf.js`. Update both if the terms
  change again.
- The full-payment warning ("before making payment") was left in the old
  `⚠️…⚠️` form; only the reservation warning was restyled, per the request.
- The Thai reservation warning reads "อ่าน…อย่างด้านบนละเอียด" verbatim as
  requested; the phrasing is slightly awkward if a future edit wants to smooth it.

### Verification

- Bot suite 97/97. Web: TH/EN booking footer, single-blank spacing, steps
  footnotes, terms line, returning hint all confirmed in-browser. PDF: normal
  1 page, worst-case foreigner 2 pages, Thai strings render.

---

## 2026-08-17

### Fixed

- Restored Beam only for the English “Balance on delivery” reservation option.
  It creates an exact ฿1,000 link with Card, E-Wallet, and Thai QR scan enabled;
  the English booking message, contract-completion Flex card, and shop
  notification include that link and its 12-hour expiry. Thai reservation and
  both Thai/English full bank-transfer options remain on the AJ Krungthai
  account and do not receive Beam links.
- The booking calendar now blocks the current Bangkok date from exactly 20:00
  onward (previously it remained selectable during the 20:00 minute).
- Restored the production Admin “Close queue” tab and the public queue-closure
  checks that were lost during the Before Rent merge. Admin authentication now
  uses the bot API again instead of credentials embedded in the static page.
- Queue closures can be permanent or scheduled with Bangkok start/end times at
  three scopes: all devices, one device type, or one device. The booking gate
  and calendar reject any rental range that overlaps an applicable closure.
  Existing boolean closures remain readable. The `Queue Closures` sheet now
  adds `Start At` and `End At` columns while preserving old rows.
- Thai reservation and full-payment bank-transfer options have temporarily
  reverted from Beam QR PromptPay to the AJ Krungthai account because SlipOK
  rejects Beam's settlement account as a different receiver. Cash/reservation
  and `bank` bookings no longer create, store, display, or forward Beam links;
  Thai booking text, contract completion text, Flex cards, and shop
  notifications show account `8690576029` instead. English ฿1,000 reservations,
  Credit Card, and E-Wallet use Beam. Restore Beam for Thai reservation and full
  bank-transfer options only after the receiver-account verification path is solved.
- The production `index.html?viewMsg=<Rental ID>` viewer now reads the bot's
  `/api/bookings/:code` endpoint first. This lets a just-created booking use the
  server-side handoff cache instead of waiting for Google Sheets propagation.
- Missing records are retried for a bounded period, then the existing Apps
  Script JSONP lookup is used as a fallback. A visible retry button replaces the
  former one-shot empty/not-found state.
- The bot's public booking lookup now permits cross-origin GET requests from the
  static booking site. No booking data is cached by the browser.
- Payment-option cards now match the supplied Thai and English reference layout:
  grouped headers, Recommended badge, stronger selected state, payment logos,
  separate fee lines, and card/E-Wallet deposit-refund notices. English Wise
  now warns that weekend and Thai-holiday payments arrive on the next business
  day. Labels use “Thai QR PromptPay” / “QR PromptPay” as requested; Beam link
  amounts and creation logic were not changed.
- Production checkout now creates real Beam links instead of the ฿1 demo
  endpoint. Thai ฿200 reservations use Beam QR PromptPay only; full Thai bank
  payments use Beam QR PromptPay in Thai and English. Card and E-Wallet links
  retain their configured fees, while English reservations retain the existing
  ฿1,000 card/E-Wallet/Thai-QR choice.
- Every Beam link expires after 12 hours. The booking page stores the expiry and
  refuses to reuse an expired cached link. Booking text, contract-completion
  text, LINE Flex cards, and shop notifications now identify Beam consistently
  and include the 12-hour notice.
- Successful Beam webhooks update the booking to “ชำระค่าจองแล้ว” for a
  reservation or “ชำระเต็มจำนวนแล้ว” for a full payment, with the amount,
  transaction reference, and payment timestamp stored against the Rental ID.
- Booking-to-contract handoff now stores a short-lived structured booking
  context before opening the LIFF contract. The context carries the exact cost
  rows and total from the booking page, including After Work, returning-customer,
  Google Maps review, and Facebook review discounts.
- The contract form, saved Google Sheet row, PDF, and post-contract LINE/Flex
  summary now preserve that exact breakdown instead of recalculating a gross
  device rate. The obsolete instruction telling staff to trust a separate chat
  total was removed in both languages.
- Contract-admin device creation now locks the Save button and changes its text
  to “กำลังทำรายการ...” / “Processing...” while the API request is pending. A
  submit guard prevents fast repeated clicks from creating duplicate rows.
- Successful device creation restores the Save button, clears the add-device
  form, keeps it open for another entry, and shows a Thai/English success popup.
  Failed requests restore the button without clearing the entered data. The LIFF
  `app.js` cache-buster was updated so admins receive the fix immediately.
- Full-payment bookings no longer show reservation-deposit cancellation text.
  The booking page, post-contract LINE text, and automatic Flex summary now all
  derive this from `paymentOption` instead of hard-coded Thai copy.
- Thai and English full Thai-bank-transfer messages keep the full-payment amount
  and bank account instructions, but omit every reference to a ฿200 reservation
  deposit. Reservation-only wording remains for payment choices that actually
  collect a reservation amount.

### Verification

- Browser-checked the Thai payment summary and confirmed the full-payment
  option is shown as Beam QR PromptPay with the exact discounted ฿2,999 total.
- Bot regression suite passes all 93 tests, including Thai PromptPay-only
  reservation links, full-payment QR links, 12-hour expiry, LINE/Flex copy, and
  webhook booking-status mapping.
- Browser-tested a PS5 contract context containing the ฿1,200 rental, -฿201
  After Work promotion, -฿80 returning-customer discount, -฿100 Google Maps
  review discount, -฿100 Facebook review discount, and ฿2,000 deposit. The form
  showed every row and the exact ฿2,619 total.
- Browser-tested the production page locally through the full booking flow:
  selecting Thai bank transfer shows the full amount due and no amount due on
  delivery.
- The booking-cost handoff and admin-device submit regression coverage remains
  green.
  lock/reset behavior, Thai/English post-contract
  text and Thai/English full-payment Flex cards.
- Inline production JavaScript syntax and `git diff --check` pass.

---

## 2026-08-16

### Fixed

- Restored the production-only After Work promotion in `index.html`: a
  ฿400/day console rented for exactly 3 days starting on Monday or Tuesday is
  discounted from ฿1,200 to ฿999.
- Restored the calendar marker (`โปร 3 วัน ฿999` / `3-day promo ฿999`) and the
  discount line in the rental summary, structured booking data, and Thai and
  English booking messages.
- Kept `index-demo.html` unchanged. This was a selective restoration from the
  former production implementation, not another production/demo file copy.

### Verification

- Browser test: PS5, 24–27 August 2026, showed the promotion, a ฿201 discount,
  and a ฿2,999 total including the ฿2,000 refundable deposit.
- Browser exclusion test: PS5 Pro at ฿500/day for the same dates did not receive
  the promotion.
- Browser console had no warnings or errors; inline JavaScript syntax and
  `git diff --check` pass.

---

## 2026-08-15

### Finished

- `index.html` and `index-demo.html` now carry the same Before rent experience;
  production was published from commit `9a33331` on 2026-08-14.
- Shortened the two delivery-promotion lines in both languages. The stated
  policy is: rentals of 3–6 days get free return delivery; rentals of 7+ days
  get both trips free, up to ฿100 per trip, within Bangkok metro.
- Renamed the social highlight section to “รีวิวจากลูกค้าและกิจกรรมที่ผ่านมา” /
  “Customer Reviews & Past Events” so it no longer implies partnerships or
  media endorsement.

### Verification

- `index.html` and `index-demo.html` are byte-identical after the copy changes.
- Inline JavaScript syntax and `git diff --check` pass for both files.
- Browser visual verification was unavailable because the in-app browser
  blocked localhost navigation in this session.

### Security still outstanding

- Admin credentials are still recoverable from client-side JavaScript.
- The Gist write token is still stored in browser `localStorage`.

---

## 2026-08-14

### In flight

**Social proof on the Before rent page (`index-demo.html` only).**
A trust strip under the four menu buttons and a swipeable row of customer
reviews after the promotions. Edited from a new "รีวิว" admin tab and synced in
the Gist under `socialProof`.

Daily Apps Script (`google-apps-script/social-proof-sync.gs`) writes
`socialProof.googleAuto` (rating, rating count, up to five reviews) and
`socialProof.facebookAuto` (follower count). The page prefers those over the
admin fields and falls back to the admin values when a sync has not run, so a
paused job shows slightly old numbers rather than an empty section.

**Waiting on the shop owner:**
- Apps Script Script Properties: `GOOGLE_MAPS_API_KEY`, `GOOGLE_PLACE_ID`,
  `FACEBOOK_PAGE_ID`, `FACEBOOK_PAGE_ACCESS_TOKEN`, `GIST_ID`, `GITHUB_TOKEN`.
  Nobody has run `findPlaceId()` or `installDailyTrigger()` yet.
- More real reviews. Four are seeded from screenshots of the Facebook and Google
  pages; the owner wants around ten. Google's sync adds at most five more.
  Do not write reviews that were not left by a customer.

**Not ported to `index.html`.** Everything above is demo-only, as asked.

### Known gaps, deliberately left

- Facebook recommendation rate and review count are typed in by hand. Meta does
  not return review text for this page and the public page rejects any client
  that is not a browser, so there is nothing to read automatically.
- The three promo cards all link to `?go=calc`. Each card's URL is admin data;
  the fix is to set them in the admin panel, not in code.
- The console card carries six lines (day rate, week rate, minimum, deposit,
  call to action). Flagged as cluttered in review; not acted on.

### Recently finished

- Before rent landing page: four-button menu, console rail with carousel arrows,
  type filters, promotions rail, terms line. Merged into `index.html` as a
  three-way merge, not a copy.
- Game picker: `chrome=compact` hides the picker page's own instructions bar and
  console tabs when embedded, with a same-origin style injection as a fallback
  for a picker page that predates the parameter.
- Catalogue page renders 24 cards per platform behind a "show more" button,
  down from all 1,237 at once.
- Bot repo: a foreigner's deposit is refunded through Wise rather than cash.
  Payout route is a single radio choice; the details, the contract PDF and the
  Discord, Telegram and email notifications all read one shared module.

### Watch out for

- `index.html` and `index-demo.html` have diverged. See `AGENTS.md`.
- Declaration order in the inline script has caused three separate
  `ReferenceError: Cannot access X before initialization` faults. `applyLanguage()`
  runs at startup; anything it touches must be declared above it.
- The browser preview pane sometimes renders blank after a resize. Measure the
  DOM rather than trusting a screenshot when that happens.
- The console keeps errors from previous page loads. Check the `?v=` in an error
  before believing it came from the current build.
