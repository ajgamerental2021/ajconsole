# Project state

Running handover log between sessions and between assistants. Read at the start
of a session, update at the end. Newest entry first.

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
