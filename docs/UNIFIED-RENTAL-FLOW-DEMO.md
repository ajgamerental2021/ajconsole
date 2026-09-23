# Unified rental flow demo

The demo entry point is `/rental-flow-demo.html`. It redirects to the production
page with `booking=1&flowDemo=1`, so it uses the same catalogue, availability,
calendar, pricing, discounts, game picker, contract context, and payment methods.
The feature flag keeps the redesigned flow out of the normal production journey
until the owner chooses to make it the default.

## Current demo stages

1. Equipment, dates, bundles, accessories, and games.
2. Customer name, phone, document type (Thai ID or passport, chosen separately
   from the page language), document number (Thai IDs are check-digit
   validated), structured delivery address, Google Maps, returning-customer
   verification, no-contract choice, and Rental Terms acceptance. It does not
   use OTP.
   - Typing a postal code fills subdistrict, district and province from
     `assets/data/service-area-addresses.json` (Bangkok and the five surrounding
     provinces, from kongvut/thai-province-data, MIT). Postal codes covering
     several subdistricts offer a list; unknown codes show an out-of-area note.
   - The Rental Terms checkbox stays disabled until the embedded terms page
     reports `AJ_RENTAL_TERMS_READ` (scrolled to the end, frame visible). The
     same message is sent when the terms are opened in a new tab from the demo.
3. Identity verification with a document-only image and a selfie holding that
   document, or an explicit verify-later path.

After stage 3 the demo shows one Rental ID dashboard for identity, pricing and
payment. Beam uses the existing one-baht demo endpoint. Its success return shows
LINE notification in both languages and WhatsApp in English. LINE uses a
confirmation-only handoff; the old preliminary booking-message Flex is not sent.

## Identity images

Identity numbers and the address stay in page memory, never localStorage. The
two images are resized in the browser (longest side 1,800 px, JPEG) and sent to
`POST /api/booking-context/:token/identity` on the Bot before the Rental ID page
opens. The Bot uploads them to the shop's Drive, deletes its local copies,
records `identityVerificationStatus: submitted_pending_review`, and notifies the
shop. The page says "images received — awaiting AJ review", never "verified".

Each Drive file's description carries `aj-identity-delete-after:YYYY-MM-DD`
(one year after the return date, the same window as the Master Agreement, so a
returning customer is never asked to verify identity again). The Apps Script `purgeExpiredIdentityFiles`
trigger moves expired files to the Drive trash; `aj-identity-hold` in a file's
description keeps it for a dispute. **Owner setup:** paste the updated
`google-apps-script/DriveUploadWebApp.gs` into the upload Web App, deploy a new
version, then run `installIdentityPurgeTrigger()` once. Until then the old
script ignores the description and nothing is deleted automatically.

## Lalamove delivery pricing

`POST /api/delivery/quote` on the Bot quotes both trips through Lalamove v3
(`POST /v3/quotations`) and returns the amounts the Rental ID page shows. The
key and secret live in Render only; the browser sends just the map link and the
load. The endpoint answers 503 until Lalamove is configured, and the page then
keeps saying the fare is awaiting confirmation.

Rules, as approved by the owner:

- `MOTORCYCLE` for one or two ordinary devices; `CAR` for a racing wheel or
  three or more devices.
- Lalamove charges its priority fee when the order is placed, so checkout adds
  an allowance of `LALAMOVE_PRIORITY_FEE_PER_TRIP` (฿50) to each trip instead.
- AJ's delivery promotion is a discount of ฿100 on the round trip, or ฿200 from
  a seven-day rental, never more than the fare itself.

The customer's Google Maps link is resolved server-side by
`services/maps-location.js`. Only Google's own map hosts are accepted and only
their redirect is followed, so a pasted link cannot make the server fetch an
arbitrary address. A link without a pin returns `delivery_location_unresolved`
and the page asks the customer to drop a pin and paste the link again.

Required owner configuration in Render:

- `LALAMOVE_API_KEY`, `LALAMOVE_API_SECRET` (sandbox first, then production)
- `LALAMOVE_BASE_URL` (`https://rest.sandbox.lalamove.com`, or
  `https://rest.lalamove.com` for production)
- `LALAMOVE_PICKUP_LAT`, `LALAMOVE_PICKUP_LNG`, `LALAMOVE_PICKUP_ADDRESS`
- `LALAMOVE_PRIORITY_FEE_PER_TRIP` if the ฿50 allowance changes

Still to confirm before production: the packed size and weight rule for two
bulky devices, which currently still quote a motorcycle.
