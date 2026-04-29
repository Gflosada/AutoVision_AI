# Stripe Setup

Stripe secret keys, Checkout session creation, customer portal sessions, and webhooks must run on a backend or Supabase Edge Function.

## Products

- Free: no Stripe subscription required
- Pro: 100 generations/month, HD exports, no watermark
- Business: 500 generations/month, shop profile, client galleries, branding

Store Stripe price IDs in backend environment variables, not in the Vite client.

## Checkout Flow

1. User clicks upgrade in the frontend.
2. Frontend calls a backend endpoint with `{ plan, interval }`.
3. Backend verifies the user and creates a Stripe Checkout session.
4. Backend returns the Checkout URL or session ID.
5. Frontend redirects using Stripe.js or `window.location`.

## Customer Portal

Create portal sessions from the backend after verifying the Supabase user and Stripe customer ID.

## Webhook Events

Handle at least:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Sync subscription status and usage limits into `profiles` and `usage_limits`.

## Usage Limit Sync

When subscription changes:

- Free: 3 generations/month
- Pro: 100 generations/month
- Business: 500 generations/month

Reset `monthly_used` on the billing cycle or a scheduled monthly job.
