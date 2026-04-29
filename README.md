# AutoVision AI Web App

AutoVision AI is a production-ready SaaS MVP frontend for AI vehicle customization. Users can upload a vehicle photo, add vehicle details, choose modifications, build a prompt, and generate a realistic preview through a mock service or a future backend.

The app is frontend-only by design. Supabase, Stripe, and OpenAI integrations are represented through safe client abstractions and backend-ready documentation. Secret keys must never be exposed in Vite.

## Features

- Public landing, pricing, demo, login, and signup routes
- Protected dashboard app with mock auth fallback
- Multi-step vehicle build wizard with image validation and persisted state
- AI prompt builder and mock AI generation flow
- Results page with before/after comparison, download, save, share, regenerate, and edit actions
- Garage, AI gallery, billing, settings, and business shop mode screens
- Supabase-ready auth/data model structure
- Stripe-ready checkout structure
- Environment validation and helpful mock-mode warnings

## Tech Stack

- Vite, React, TypeScript, React Router
- Tailwind CSS, Radix UI components, lucide-react
- React Hook Form, Zod
- Zustand for app state
- Supabase client wrapper
- Stripe publishable-key client wrapper
- Sonner notifications

## Setup

```bash
npm install
npm run dev
```

Optional checks:

```bash
npm run typecheck
npm run build
```

## Environment Variables

Copy `.env.example` to `.env.local`.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_URL=http://localhost:5173
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_AI_GENERATION_FUNCTION_URL=
```

If Supabase or AI generation env vars are missing, the app uses mock auth, mock garage data, local usage limits, and mock generation. This keeps development usable without backend secrets.

## Routes

- Public: `/`, `/pricing`, `/demo`, `/login`, `/signup`
- App: `/dashboard`, `/dashboard/new-build`, `/dashboard/ai-loading`, `/dashboard/results/:generationId`, `/dashboard/garage`, `/dashboard/gallery`, `/dashboard/pricing`, `/dashboard/shop-mode`, `/dashboard/settings`, `/dashboard/billing`
- Legacy `/app/*` links redirect to `/dashboard/*`

## Production Setup

- Supabase: see `docs/SUPABASE_SETUP.md`
- AI generation backend: see `docs/AI_GENERATION_SETUP.md`
- Stripe billing: see `docs/STRIPE_SETUP.md`

Use Supabase Edge Functions or another backend for OpenAI calls, Stripe Checkout sessions, Stripe webhooks, image uploads, and database writes. Vite should only receive public anon/publishable keys.
