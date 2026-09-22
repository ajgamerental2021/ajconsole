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
(30 days after the return date). The Apps Script `purgeExpiredIdentityFiles`
trigger moves expired files to the Drive trash; `aj-identity-hold` in a file's
description keeps it for a dispute. **Owner setup:** paste the updated
`google-apps-script/DriveUploadWebApp.gs` into the upload Web App, deploy a new
version, then run `installIdentityPurgeTrigger()` once. Until then the old
script ignores the description and nothing is deleted automatically.

## Lalamove delivery pricing before production switch

Do not store or call the Lalamove API secret from the browser. Add a server-side
quotation endpoint using Lalamove v3 `POST /v3/quotations`, with credentials held
in Render environment variables. Obtain an outbound quotation from AJ to the
customer and a separate return quotation from the customer to AJ, then store both
quotation IDs, expiry times, service type, price breakdowns, and the combined
amount in the Rental Order.

Use `MOTORCYCLE` for one ordinary device. Use `CAR` for Logitech G29 or more than
three devices. The exact rule for two or three bulky devices should be confirmed
from packed dimensions and weight before launch, rather than inferred from item
count alone.

Lalamove quotations expire quickly and the official priority fee is added to an
order after the order has been placed. Therefore the checkout must either:

- collect the live base quotations and show that a priority fee will be confirmed
  at dispatch; or
- use an owner-approved fixed priority allowance and reconcile the difference.

Do not label an estimated or cached amount as a final delivery charge. If either
quotation expires before payment, requote both trips and ask the customer to
review the changed total.

Required owner configuration:

- Lalamove production API key and secret in Render (never in Git or client code)
- exact AJ pickup latitude, longitude, and address
- approved priority-fee policy
- packed-size/weight rule for when two or three devices require `CAR`
