# Project state

Running handover log between sessions and between assistants. Read at the start
of a session, update at the end. Newest entry first.

---

## 2026-08-17

### Fixed

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
