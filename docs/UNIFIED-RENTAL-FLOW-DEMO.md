# Unified rental flow demo

The demo entry point is `/rental-flow-demo.html`. It redirects to the production
page with `booking=1&flowDemo=1`, so it uses the same catalogue, availability,
calendar, pricing, discounts, game picker, contract context, and payment methods.
The feature flag keeps the redesigned flow out of the normal production journey
until the owner chooses to make it the default.

## Current demo stages

1. Equipment, dates, bundles, accessories, and games.
2. Customer name and phone, delivery map, returning-customer verification, and
   the embedded rental agreement. The agreement uses identity documents and an
   electronic signature; it does not use OTP.
3. Summary, payment choice, and the existing LINE / WhatsApp handoff.

The agreement sends an `AJ_CONTRACT_COMPLETED` message to the AJ parent page,
which unlocks the final stage. The contract server permits framing only by AJ's
production origin and local development origins.

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

