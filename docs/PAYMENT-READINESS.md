# Easy Consultants — Payment Readiness

## Status

Stripe integration is intentionally **not activated yet**. The merchant account will be established later.

## Commercial payment architecture

The target flow is:

Prospect → Qualification → Discovery → Proposal → Payment → Onboarding → Delivery → Retainer

Initial payment models:
- Business Digital Audit — one-time
- Website / Digital Presence — one-time
- Brand & Marketing — one-time
- AI & Automation — one-time or milestone-based
- Sales Systems — one-time or implementation + retainer
- Digital Transformation — proposal / milestone-based
- Growth & Automation Retainer — recurring

## Stripe implementation rule

When the Easy Consultants merchant account is ready:
1. Confirm the intended Stripe account.
2. Confirm live/test mode.
3. Use Stripe Checkout or Payment Links for simple offers where appropriate.
4. Use invoices/milestones for larger consulting engagements where appropriate.
5. Add webhook handling for payment success, failure and subscription events.
6. Reconcile successful payments against proposals/invoices in Supabase.
7. Never expose Stripe secret keys in the browser.
8. Test the complete payment → onboarding transition before live launch.

## Current state

No live Easy Consultants payment product, payment link or checkout has been created. This prevents accidental routing of customer funds through the currently connected PABOS Stripe account.

## Launch gate

Payments become a launch gate only after:
- merchant account is established,
- account ownership/use is confirmed,
- product/pricing structure is finalized,
- checkout/invoice flow is tested,
- webhook/security checks pass.

Until then, sales can proceed through enquiry → discovery → proposal and payment instructions can be added manually per approved client engagement.
