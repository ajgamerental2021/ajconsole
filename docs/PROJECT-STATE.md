# Project state

## 2026-08-30 — Analytics disclosure and social footer

- The before-rental landing panel now shows the complete bilingual anonymous-analytics disclosure near the initial trust/decision content; the existing disclosure remains below FAQ as well.
- Added a responsive site footer with bilingual AJ Game Rental copyright copy and direct, accessible SVG-icon links to AJ's YouTube, Facebook, and TikTok pages. External links open safely in a new tab.
- Social-link clicks are recorded as an anonymous analytics event and appear in the owner dashboard. Desktop and 390×844 mobile browser checks pass in Thai and English with no horizontal overflow or JavaScript errors.

## 2026-08-30 — Privacy-first website analytics dashboard

- The production booking page now sends non-blocking first-party analytics events for page visits, language changes, funnel steps, game/terms/contract actions, returning-customer verification, and LINE/Messenger/WhatsApp handoffs.
- Analytics uses random browser/session identifiers and deliberately excludes customer names, phone numbers, LINE IDs, identity documents, maps links, addresses, rental codes, and message contents. The bilingual website notice discloses this anonymous usage measurement.
- The Bot accepts only allowlisted event names and fields, rate-limits submissions, batches Google Sheets writes to a dedicated `Analytics Events` tab, and keeps booking usable when analytics storage fails.
- `/analytics/` is a separate no-index owner dashboard using the existing server-side Admin login. It provides selectable 1/7/30/90/365-day views, daily activity, weekly/monthly summaries, channel counts, funnel actions, and estimated conversion.
- Unauthenticated analytics reports return HTTP 401. The event endpoint returns HTTP 202, the production page has no new JavaScript errors in browser verification, and all 192 Bot tests pass.
- Analytics login now remains valid on the same browser for 30 days. The remembered token is signed with the configured Admin password, survives Bot restarts/deployments, becomes invalid when the Admin password changes, and is removed immediately by the dashboard Logout button.

## 2026-08-30 — Delivery area, timing, and fee FAQ aligned

- The pre-rental service line now explicitly says delivery is limited to Bangkok and the metropolitan area in both languages.
- Canonical bilingual FAQ entries are applied after Gist data loads, so stale remote copy cannot restore the old wording. The delivery section is ordered: delivery time, device-preparation time, service area, then Pattaya/Chonburi.
- The duplicate “ให้บริการพื้นที่ไหนบ้าง / Which areas do you serve?” entry is removed. The service-area answer lists Nakhon Pathom, Samut Sakhon, Samut Prakan, Pathum Thani, and Nonthaburi.
- Delivery timing now explains the 18:00 cutoff concisely. Lalamove/Grab and the estimated 1–2 hour transit time are consistent in FAQ and rental steps. Delivery-fee FAQ copy includes the actual app rate, 3–6 day return-trip benefit, 7+ day round-trip benefit, and customer-paid overage above ฿100.
- Verified the Gist-backed FAQ in a real local browser in Thai and English, including order, multiline fee formatting, removal of the duplicate area entry, and zero console errors.

## 2026-08-30 — Master Agreement wording clarified

- The bilingual rental-step guide now explains that the Master Agreement lasts one year and only its verified information and signature may be referenced for a later rental. Every rental still requires fresh confirmation of its details and Rental Terms.
- The guide and returning-customer note both require a new Master Agreement after expiry or whenever material customer information changes; the former wording that implied reusing the whole rental contract was removed.

## 2026-08-30 — Full device names in booking Flex

- The booking Flex device row now gives the device value more width and allows it to wrap. Long names such as Meta Quest variants are shown in full instead of ending in `...` in narrow LINE clients.
- The behavior is identical for Thai and English cards. A bilingual regression test covers a deliberately long device name; all 190 Bot tests pass.

## 2026-08-29 — Booking journey reduced to three steps

- Removed the automatic Finger Guide overlays. The customer-controlled rental-steps guide remains available from its button.
- Combined game selection with delivery, payment, contract, map, and returning-customer options in one Booking Details step. A game-catalog rental now defaults to “send game list later”; selecting games remains optional.
- Reduced the calculator from four steps to three: Device/Dates, Booking Details, and Review/Send. Existing saved drafts are clamped safely into the new flow.
- The general Connect/Refresh LINE button is hidden; LINE connection is requested only by flows that actually need it. Existing connected customers still see Rental History.
- Returning customers accept identity/contact reuse and the current Rental Order/Rental Terms with one combined checkbox.
- Before submission, the generated identifier is labelled “รหัสรายการชั่วคราว” / “Temporary order ID”. The rental summary and booking Flex now say “ยอดรวมก่อนค่าจัดส่ง” / “Total before delivery”.
- Verified JavaScript syntax and the three-step/default-game behavior in a real local browser. No browser console errors were reported. All 189 Bot tests pass.

## 2026-08-29 — Master Agreement + Rental Order rollout

- The existing signed identity contract is now described as a **Master Agreement**. It records verified identity, signature, and general Rental Terms acceptance for one year; it no longer claims that the whole old contract is reused for every future rental.
- Returning-customer discount and agreement eligibility are separate. Discount history alone never authorizes reusing a signature.
- The booking page stores the verified Master Agreement metadata only after the Bot API has verified either a LINE User ID or the existing manual returning-customer challenge. A customer without LINE cannot retrieve agreement metadata before that challenge succeeds.
- A valid agreement opens a bilingual confirmation modal showing agreement number/expiry and the current Rental Order number. One combined checkbox confirms unchanged identity/contact details and current-order/Rental-Terms acceptance.
- The structured booking message carries agreement/order metadata. The Bot creates a separate Rental Order PDF and the LINE booking Flex can show buttons for the Master Agreement, current Rental Order, and Rental Terms.
- An expired or missing agreement does not skip the contract flow; the returning-customer price discount may still apply independently.

### Delivery App handoff still required

- Persist these optional fields on each booking: `masterAgreementId`, `masterAgreementSignedAt`, `masterAgreementValidUntil`, `masterAgreementPdfUrl`, `rentalOrderId`, `rentalOrderPdfUrl`, `rentalOrderAcceptedAt`, `rentalTermsVersion`, and `rentalTermsUrl`.
- Booking Confirm Flex and My Rentals (active/history) must display the immutable agreement/order references captured for that rental. Never replace historic rows with the customer's newest agreement.
- Continue enforcing customer ownership before redirecting to either PDF, as the existing `/c/my/contract` route does.

## 2026-08-29 — Booking Flex labels no longer truncate

- Thai and English booking Flex cards now wrap Google Maps, payment-summary,
  and bank-transfer headings instead of displaying ellipses on narrow LINE
  clients. Summary labels can wrap while numeric values stay aligned.
- The compact identifier label is now `รหัสเช่า` / `Rental ID`, while the full
  Rental ID value remains prominent.
- Bot syntax and all 183 automated tests pass.

## 2026-08-29 — Full dates in booking Flex cards

- Thai and English booking Flex date rows now split their width evenly between
  label and value, so `DD/MM/YYYY` remains fully visible instead of ending in
  an ellipsis on narrow LINE clients.
- Bot syntax and all 182 automated tests pass.

## 2026-08-29 — Contract-completion LINE Flex handoff

- Only the contract form's `จองผ่าน LINE` / `Book via LINE` completion action
  now enters the verified booking LIFF and links the signed-in LINE Unique ID to
  the same Rental ID. Messenger, WhatsApp, and the PDF action are unchanged.
- The Bot sends the booking Flex first with the rental-contract action removed,
  because the customer has already completed the agreement. It then sends the
  existing contract-ready Flex with the PDF and payment instructions directly
  below it.
- Thai and English use the booking language throughout. The completion handoff
  has bilingual progress, success, and failure messages, and duplicate taps are
  idempotent for the same LINE user and booking context.
- Bot syntax and whitespace checks pass, and all 181 automated tests pass.

## 2026-08-29 — Chat booking no longer double-checks the same hold

- LINE, Messenger, and WhatsApp now acquire one server-side booking hold only,
  after the final Rental ID is available. The former provisional hold followed
  by a second hold/refresh was removed because one click could fail between the
  two checks and incorrectly report that queue verification failed.
- If the historical Rental ID Sheet is temporarily unavailable, checkout now
  uses the existing allocator/offline collision-resistant suffix instead of
  blocking every chat channel with an unrelated queue error.
- The real queue conflict check remains active before preparing each channel's
  message or payment link. Syntax, whitespace, endpoint, and source-flow checks
  pass for LINE, Messenger, and WhatsApp.

## 2026-08-29 — No-contract Rental Terms acknowledgement

- Selecting the no-contract option now opens the complete bilingual Rental
  Terms before the option can be enabled. The renter must explicitly check an
  acknowledgement and continue; closing or cancelling leaves the option off.
- The acknowledgement stores its timestamp, language, and terms version in the
  booking payload. Existing saved no-contract selections without the current
  acknowledgement are reset and must be accepted again.
- Thai and English booking messages state that the renter acknowledged the
  terms and include the matching-language read-only terms link. The LINE Flex
  card presents the same status and link; Messenger and WhatsApp use the same
  localized plain-message output.
- The standalone terms page opens in the booking language, supports an explicit
  Thai/English switch, and is safely frameable only by the AJ booking origin.
- AJ Console syntax and whitespace checks pass. AJ Bot syntax and all 179 tests
  pass, including both terms-page languages and both Flex-card languages.

## 2026-08-28 — Book via LINE verified LIFF handoff

- Only the `จองผ่าน LINE` / `Book via LINE` confirmation now enters the
  production booking LIFF before opening the AJ Official Account chat.
- LIFF obtains the signed-in LINE profile and sends its access token to the Bot;
  the Bot verifies that token with LINE and links the resulting LINE Unique ID
  and display name to the same Rental ID/booking context.
- After the verified link, the existing AJ chat opens with the complete booking
  message prefilled and still waiting for the customer to press Send. Copy,
  WhatsApp, and Messenger flows are unchanged.
- The durable booking-row update retries briefly to cover the race between the
  booking page's background Sheet append and the LIFF transition. The chat only
  opens after that link succeeds; otherwise LIFF shows a bilingual retry action.
- AJ Console inline JavaScript and Bot syntax checks pass; all 171 Bot tests pass.
- Follow-up: verified identity now links to the live booking context immediately
  and the slower Sheet persistence retries in the background, so LIFF no longer
  waits on Apps Script. Safari shows a clear “LINE has been opened” handoff page
  with an Open LINE again action instead of appearing to jump back to the home page.

## 2026-08-28 — Full bilingual contract terms and channel-specific refunds

- Web terms and the two-page contract PDF now share the same late-return,
  damage, two-day extension, delivery/return-time, inspection-photo, and GPS
  conditions in Thai and English.
- Late charges explicitly count any partial day as one full day. The accidental
  empty third recovery-cost item was removed.
- The refund section now states that cash refunds are never available. The web
  explains Thai-bank and Wise timing separately; each generated PDF prints only
  the selected route's timing and details. Thai-bank refunds are due after
  return inspection within the return date, while Wise states 1-3 business days
  and includes the three official help links.
- Page-one term labels and page-two clause headings/key phrases are bold. Both
  languages remain two A4 pages with signatures on both pages.
- JavaScript syntax, rendered four-page visual QA, and all 170 Bot tests pass.

## 2026-08-28 — Admin After Work ฿999 selector

- The Bot Admin booking editor now detects the existing After Work 3 Nights
  conditions for ฿400/day consoles: a three-day rental beginning Monday or
  Tuesday.
- Eligible bookings display a bilingual green checkbox for the ฿999 promotion.
  Selecting it inserts the ฿201 promotion discount and recalculates the total
  and pay-on-delivery amount; removing eligibility also removes the promotion.
- Existing bookings that already contain the promotion reopen with the option
  selected. The cost rows remain editable for exceptional Admin adjustments.
- JavaScript syntax and all 167 Bot tests pass.

## 2026-08-28 — Legacy foreign-renter history in returning discount checks

- Returning-customer eligibility now also reads the legacy English Google Form
  responses in spreadsheet `13nL...lJzJk`, gid `19272404`.
- The source supports exact first name + last four Passport characters and the
  existing exact first name + phone fallback. Header matching follows the sheet's
  real English columns, including `Passport No.` and `Mobile Number`.
- The Admin eligibility tester can show matched foreign legacy details and labels
  this source separately in Thai and English.
- Bot tests pass 166/166 and the LIFF cache-buster was updated.

## 2026-08-28 — Two-page contract signatures and ajgameid copy guide

- Thai and English contracts now use the verified local two-page A4 generator in
  production, including the expanded late-return and damage clauses.
- Both lessor and renter signatures appear on pages 1 and 2, with a comfortable
  gap after each page's final paragraph instead of being pinned to the page edge.
- `ajgameid/index.html` adds the existing bilingual rental-guide action to the
  successful-copy popup as a full-width green play button above OK.
- All 163 bot tests, syntax checks, bilingual browser checks, and four rendered
  PDF page inspections passed before release.

## 2026-08-27 — Rental-change FAQ

- Added a bilingual FAQ explaining that the start date or rental duration may
  be changed once, within 15 days of the original date, with notice by 12:00 on
  the preceding day and subject to availability.
- The same FAQ points customers to LINE > “คิวเช่าของฉัน” / “My Rentals” for
  accessory additions, or to an admin when using another channel.
- FAQ data is normally pulled from the shared Gist. `normalizeFaq()` therefore
  inserts this item immediately after the cancellation/refund question when it
  is missing, so existing cached and remotely managed FAQ lists also receive it.
- Applied independently to `index.html` and `index-demo.html`; no page was copied
  over the other.

## 2026-08-26 — One-time rental rescheduling clause

- Added a new item 4 to the Thai and English rental terms: a renter may change or postpone the rental start date once, within 15 days of the original date, subject to availability, and must notify AJ before 12:00 on the day before the rental starts. Existing items shift down automatically. The final wording was shortened for readability.
- The generated Thai/English contract PDF includes the same rule. A Thai test contract with an Additional notes value remains on one signed A4 page, and the shared Telegram/Discord/email message builder includes the note.
- LIFF app cache-buster updated. Bot tests pass 151/151. Bot production commit: `60824ce`.

## 2026-08-26 — Availability refresh no longer contradicts the calendar

- Fixed a race where the calendar continued showing the last successful queue snapshot as available, but a later transient refresh error immediately blocked Step 1 and disabled the Next button.
- Queue refresh now retries both independent availability sources once. A successfully verified snapshot remains usable for five minutes while a background refresh is pending or temporarily fails, keeping the calendar, readiness message, and Next button consistent.
- Booking safety is unchanged: before retaining the server-side booking hold, the site still requires a fresh live availability response. A cached snapshot can help the customer continue through the form but cannot finalize a conflicting booking.
- Verified the reported Xbox Series X period (30 Aug–2 Sep 2026) in Thai and English at desktop and 390×844 mobile sizes: the calendar accepts the three-day range, Step 1 reports ready, Next is enabled, and the browser console has no errors. Inline JavaScript and `git diff --check` pass.

## 2026-08-26 — Admin eligibility results show matched private details

- After an eligible result, the Admin tester now fetches customer details through a separate Bearer-token-protected endpoint. The public customer eligibility API remains Boolean/source-only.
- The Admin result shows matched name, phone, full Thai ID/Passport, latest rental dates, Rental ID, device, and deposit-refund bank/account details. Missing legacy fields are labeled as not recorded rather than inferred.
- Added an explicit private-information warning and responsive definition-list layout in Thai and English.
- Verified production assets and confirmed the details endpoint returns HTTP 401 without a valid Admin session. Bot tests pass 148/148. Bot commit: `bbd3d5a`.

## 2026-08-26 — Admin returning-customer eligibility tester

- Added a dedicated `ทดสอบสิทธิ์ลูกค้าเก่า` card to the authenticated LIFF Admin home. It calls the same eligibility API used by customers and displays only eligible/not eligible plus the matched source—never another customer's record.
- The tester switches independently between Thai and English and supports three paths: phone/name + last four ID/Passport characters, first name + phone, and first name + last five Rental ID characters.
- Added concise bilingual validation/status copy, responsive mobile styling, and cache-busters for both JS and CSS.
- Verified the Admin flow in the real local server at a 390×844 viewport: language and method switching work with no horizontal overflow. Production assets were verified after deployment. Bot tests pass 146/146. Bot commit: `2aebb35`.

## 2026-08-26 — Returning discount reads legacy rental agreements

- Returning-customer verification now reads the legacy Google Form agreement responses in spreadsheet `15pbl...SwkQUQ`, gid `1940708406`, in addition to current Contracts, confirmed Rental History, and Delivery Customers.
- Columns are resolved from their real headers (including `เลขบัตรประจำตัวประชาชน` and `เบอร์โทรศัพท์ที่ติดต่อได้`) rather than fixed positions.
- Thai verification requires phone + last four ID characters; the no-ID fallback requires exact first name + phone. English verification requires first name + last four Passport characters. Mismatches remain rejected.
- Production API checks for the reported customer returned `eligible: true` both through legacy-contract identity and the phone fallback. Bot tests pass 145/145. Bot commit: `d3dde5c`.

## 2026-08-26 — Renter notes preserved across contract outputs

- The LIFF agreement form now snapshots the live Additional notes value before asynchronous image compression and submission, preventing mobile input methods or writing-assistant overlays from leaving the shared payload blank.
- The same normalized `notes` value continues to feed the PDF and the one shared message used by Telegram, Discord, and email; it is now also retained in local contract metadata for audit/recovery.
- Bumped the LIFF cache-buster and verified the new script on production after deployment. Bot tests pass 143/143. Bot commit: `3bab091`.

## 2026-08-26 — Contract checkbox compatibility

- Fixed contract submissions from pages opened before a deployment where a checked native checkbox can arrive as the HTML value `on` instead of Boolean `true`.
- The server accepts only recognized checked values (`true`, `on`, or `1`) for privacy acknowledgement, agreement consent, and rental terms; missing, unchecked, and false values remain rejected.
- Validation errors for these fields now show clear Thai/English instructions instead of the raw Zod message `Invalid input: expected true`.
- Bumped the LIFF app cache-buster and verified the production assets after deployment. Bot tests pass 142/142. Bot commit: `071e84c`.

## 2026-08-25 — Contract booking costs follow the selected language

- The rental-agreement page now localizes structured booking-cost labels every time it loads or changes language, rather than retaining the language used on the booking page.
- Thai booking context switched to English now shows English rental, After Work promotion, review discount, returning-customer discount, payment-fee, and deposit labels; switching back restores Thai.
- The localized rows are also stored in the submitted `bookingCosts`, so the PDF and shop notifications use the agreement language while all amounts and pricing calculations remain unchanged.
- Production and local browser checks passed for Thai → English → Thai, including the hidden submission value and default Thai/Foreigner customer type. Bot tests pass 140/140.

## 2026-08-25 — Selective Trust/privacy and Booking-flow release

- Prepared a production release from the latest remote `main` rather than the
  locally advanced worktrees, so unrelated contract, delivery, pricing, game-ID,
  and admin-security commits are not included.
- The booking page now adds bilingual privacy reassurance beside the rental
  contract and returning-customer verification, without changing eligibility or
  pricing calculations.
- The rental-agreement form explains document purpose, access limits, 30-day
  document-copy deletion, and the existing one-year agreement/data-retention
  limit in Thai and English. Submission now requires an explicit privacy
  acknowledgement, validated by both the browser and server schema.
- Booking steps now expose bilingual live readiness, keep later steps locked
  until prerequisites and a successful queue check exist, and provide direct
  queue retry actions in the form and calendar.
- Verified at a 390×844 mobile viewport in Thai and English. The website inline
  script passes `node --check`; the bot suite passes 138/138; pricing and payment
  implementation files are unchanged by this selective release.

## 2026-08-24 — Rental agreement works with and without LINE

- The production booking page now offers two agreement routes outside LINE:
  `Open with LINE` uses the existing contract LIFF, while `Continue in browser`
  opens the same contract form through the direct HTTPS `/liff/` route.
- Both routes use the same short booking-context token and preserve Rental ID,
  language, device, dates, games, add-ons, payment, promotion, discounts, and
  delivery-map data. There is still only one contract form and submission API.
- When the booking page is already inside LINE, the agreement button skips the
  chooser and continues through LIFF. LINE booking messages keep the LIFF URL;
  Messenger, WhatsApp, and copied booking messages now use the direct web URL
  so customers without LINE are not prompted to install or open it.
- The chooser is bilingual, mobile responsive, keyboard-cancellable, and does
  not mark the Finger Guide contract step complete when the customer cancels.
- Verified locally in Thai and English at desktop and 390×844 mobile sizes.
  The direct web contract loaded without a LINE redirect, inline JavaScript and
  `git diff --check` passed, and all 133 bot regression tests passed.

## 2026-08-24 — Returning-customer fallback through Delivery App Customers

- Manual phone verification now checks both the existing confirmed rental history and the Delivery App Customers tab (`gid 281638460`).
- A customer without an AJ Contract can qualify when the normalized first name and phone number match the same Customers row; matching only one value never grants the discount.
- Rental-ID verification remains restricted to confirmed rental history and is not weakened by this fallback.
- The Customers reader supports both named-column sheets and the legacy fixed layout (`UUID`, name, phone, Maps URL, timestamp).
- Bot tests pass 131/131, including exact match, mismatched name/phone, and legacy headerless Customers cases.

## 2026-08-23 — One-page rental agreement and note notifications

- The local A4 agreement generator now uses a compact bottom signature area so a normal completed contract, including a renter note, stays on one page without shrinking the existing body text.
- Exceptionally long content can still flow safely to another page instead of overlapping the signatures.
- A rendered Thai contract matching the reported Nintendo Switch 2 case was visually checked: all sections, the note, and both signatures fit cleanly on one A4 page.
- Contract notes are now included in the single shared notification message sent to Discord, Telegram, and email.
- Bot tests pass 129/129, including regressions for one-page signed PDF layout and note propagation.

## 2026-08-23 — After Work 3 Nights promo across four daily rates

- The Monday/Tuesday-start, exactly-three-night After Work promotion now supports every requested daily-rate tier: ฿300/day → ฿777, ฿350/day → ฿888, ฿400/day → ฿999, and ฿500/day → ฿1,299.
- Thai and English calendar cells, booking summaries, and share messages display the rate-specific promo price instead of a fixed ฿999 label.
- Structured booking costs carry the same rate-specific promo label and discount into the LIFF rental agreement; PDF totals continue to calculate from those rows without recomputing or losing the discount.
- Review discounts remain ฿50 each whenever any After Work tier applies, and the returning-customer 10% discount continues to apply last.
- Frontend syntax and eligibility checks pass for all four tiers and invalid weekday/duration/rate cases. Bot tests pass 127/127, including a PDF regression covering all four promo tiers.

## 2026-08-23 — First-name matching and resilient availability loading

- Manual returning-customer checks now require the customer's first name only; surname is explicitly not required in Thai and English. The Rental ID suffix or phone must match a `Confirmed` row with the same normalized first name.
- A repeated five-character Rental ID suffix is therefore safe when the first names differ. Multiple confirmed rows with both the same suffix and first name still fail closed.
- English Passport verification also uses first name only, while Thai ID verification keeps phone plus the last four Thai-ID digits.
- Availability now races the existing Apps Script request against a same-origin bot proxy with a 30-second server cache. The first valid response wins, and the calendar no longer waits for queue-closure or booking-hold refreshes before showing dates.
- Local UI verification showed available calendar cells after 4.5 seconds with no stuck checking or queue-error state. Bot tests pass 126/126 and frontend syntax/diff checks pass.

## 2026-08-23 — Returning-customer verification without an ID/Passport record

- The bilingual returning-customer dialog keeps the existing contract-based verification and adds an explicit branch for customers whose Thai ID or Passport was not recorded.
- That branch verifies either the last five characters of a previous Rental ID or a previously supplied phone number against `Line / WhatsApp LOGs`. Only rows whose status is exactly `Confirmed` qualify.
- Five-character Rental ID suffixes can repeat across dates, so the API fails closed unless exactly one confirmed row matches. Phone lookup accepts 8–15 digits and ignores formatting.
- A switch beside the Rental ID field changes the lookup to phone, and a “How to find Rental ID” control reveals the supplied Thai or English example image in the dialog.
- LINE Unique ID auto-verification remains the first choice and bypasses this dialog when a confirmed rental is already linked.
- Bot verification: 125/125 tests pass, including pending/cancelled rejection, ambiguous Rental ID rejection, and confirmed phone matching.

## 2026-08-23 — Review discounts during After Work promotion

- When After Work 3 Nights sets the rental price to ฿999, the Google Maps and Facebook review discounts are now ฿50 each instead of ฿100 each.
- Step 3 labels switch dynamically between ฿50 for eligible After Work dates and the normal ฿100 for all other rentals in both Thai and English.
- Summary, booking messages, and rental-contract handoff use the same calculated ฿50 amounts; the returning-customer 10% discount continues to apply last to the remaining eligible balance.

## 2026-08-22 — Rental-agreement minimum-age notice

- The production Step 3 rental-agreement card now states in Thai and English that the person entering into the rental agreement must be at least 20 years old.
- The warning appears only in the branch where the customer will complete a rental agreement; no-contract behavior and pricing are unchanged.

## 2026-08-22 — Dedicated LIFF endpoint for the production booking site

- Production `index.html` now uses LIFF ID `2010212481-IXO3gDQp` for the main booking website. The former ID belongs to the Delivery App and is no longer used by production booking-page LINE initialization.
- Browsers that retained the former Delivery App LIFF ID in `aj_liff_id` automatically remove only that obsolete value and migrate to the new production ID. Custom/non-matching values remain untouched.
- The rental-contract LIFF ID and `index-demo.html` are unchanged.

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

## 2026-08-29 — Rental Order acceptance UX and PDF snapshot

- Returning-customer Rental Order review now appears inside the returning-customer discount card only after the customer is verified by LINE or the manual eligibility flow.
- The Rental Order modal has its own Thai/English switch, safer edge spacing, and properly spaced acknowledgement checkboxes.
- When the modal is opened by LINE, Messenger, or WhatsApp booking intent, accepting continues that selected channel immediately. Opening the review button directly accepts only the order and prompts the customer to choose a channel.
- LINE Desktop itself does not run LIFF. Desktop booking therefore stays in the external browser, enables LIFF external-browser login, returns to the same signed booking context after login, and then links the LINE account and pushes the Flex card. It no longer invokes LINE Desktop's unsupported-LIFF QR dialog. Mobile external browsers keep the standard LIFF app-launch route.
- The bot's language-specific Rental Order PDF now includes the full accepted Rental Terms snapshot and version on subsequent PDF pages for durable reference.
## 2026-08-30 — Admin review save regression fixed

- Fixed the Reviews admin Save button after the new footer social links reused the admin form's `data-social` attribute and caused `undefined.trim()`.
- Footer analytics links now use `data-analytics-social`; review saving is additionally scoped to `#adminReviews` so unrelated page elements cannot enter the admin payload.
## 2026-08-30 — Analytics delivery reliability

- Website analytics now uses cross-origin `fetch` with `keepalive` as the primary transport and retains `sendBeacon` only as a fallback, avoiding silent beacon loss in stricter browsers.
- The private analytics dashboard now refreshes automatically every 60 seconds and displays its latest refresh time.
## 2026-08-30 — Analytics device and time breakdowns

- Moved the anonymous analytics disclosure to the very bottom of the Before Rent panel and removed the duplicate beneath FAQ.
- Anonymous events now include coarse browser and operating-system families without versions; the dashboard adds device class, browser, OS, and Bangkok hour-of-day session breakdowns.
- Daily chart bars now show their session count directly instead of requiring hover.
## 2026-08-30 — Compact mobile analytics dashboard

- Mobile analytics metrics now use three columns (six metrics in two rows) instead of six full-width cards.
- Device, browser, and OS summaries remain in one three-column row; weekly and monthly summaries share a two-column row.
- Mobile cards, headings, controls, and bar rows use compact spacing; verified at 390 px with no horizontal overflow.
## 2026-08-30 — Product rankings, funnel drop-off, and calendar analytics

- Analytics events now carry anonymous device/game IDs and display names; game selections are emitted from embedded-picker and handoff flows.
- Dashboard ranks devices and games by unique selecting Session, defaults to Top 5, and can expand to all; games are filterable by device.
- Added session funnel/drop-off analysis with explicitly labelled possible causes, plus calendar-month, calendar-year, recent-range, and five-year views.
- Analytics Sheet schema expanded through column P for device/game fields; old rows remain compatible. Mobile dashboard verified at 390 px with no horizontal overflow.
