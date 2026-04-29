# AI Generation Setup

The frontend must not expose OpenAI API keys. The browser calls a Supabase Edge Function through `VITE_AI_GENERATION_FUNCTION_URL`; the Edge Function reads `OPENAI_API_KEY` from Supabase secrets.

OpenAI's image docs describe the Image API as supporting generation and edits, with GPT Image models including `gpt-image-1.5`, `gpt-image-1`, and `gpt-image-1-mini`. The included function uses the image edit endpoint because AutoVision starts from an uploaded vehicle photo.

## Frontend Environment

Set this in `.env.local`:

```bash
VITE_AI_GENERATION_FUNCTION_URL=https://YOUR_PROJECT_REF.functions.supabase.co/generate-vehicle-design
```

Do not add `OPENAI_API_KEY` or any `VITE_OPENAI_*` variable to frontend env files.

## Supabase Function Secrets

Install/login to Supabase CLI, link your project, then set secrets:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase secrets set OPENAI_IMAGE_MODEL=gpt-image-1.5
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are automatically available to Supabase Edge Functions in hosted Supabase projects.

## Deploy

```bash
supabase functions deploy generate-vehicle-design
```

After deploy, update `.env.local`:

```bash
VITE_AI_GENERATION_FUNCTION_URL=https://YOUR_PROJECT_REF.functions.supabase.co/generate-vehicle-design
```

Restart Vite after changing env vars.

## Storage Requirements

Create these buckets:

- `vehicle-originals`
- `vehicle-generations`

The frontend uploads originals to `vehicle-originals`. The Edge Function uploads generated PNG files to `vehicle-generations`.

## Request Payload

```json
{
  "projectId": "uuid",
  "userId": "uuid",
  "title": "Satin Emerald M4",
  "originalImageUrl": "signed Supabase Storage URL",
  "vehicleMake": "BMW",
  "vehicleModel": "M4",
  "vehicleYear": "2024",
  "trim": "Competition",
  "customizationTypes": ["paint", "carbon-fiber"],
  "userPrompt": "Satin emerald green with carbon fiber hood",
  "desiredColor": "emerald green",
  "finish": "satin",
  "style": "luxury",
  "backgroundPreference": "keep-original",
  "anglePreference": "keep-original",
  "realismLevel": 9,
  "aiPrompt": "built by the frontend prompt builder"
}
```

The frontend sends the current Supabase access token as `Authorization: Bearer ...`.

## Response Payload

```json
{
  "generation": {
    "id": "uuid",
    "projectId": "uuid",
    "userId": "uuid",
    "prompt": "user prompt",
    "aiPrompt": "internal prompt",
    "customizationTypes": ["paint"],
    "style": "luxury",
    "finish": "satin",
    "originalImageUrl": "url",
    "generatedImageUrl": "url",
    "status": "completed",
    "createdAt": "iso timestamp"
  }
}
```

## What The Function Does

`supabase/functions/generate-vehicle-design/index.ts`:

- verifies the Supabase JWT
- confirms the project belongs to the authenticated user
- checks `usage_limits`
- downloads the uploaded vehicle image
- calls OpenAI `POST /v1/images/edits`
- uploads the generated PNG to `vehicle-generations`
- inserts a `customization_generations` row
- increments monthly usage
- returns the generation in the frontend's camelCase shape

## Local Function Development

```bash
supabase functions serve generate-vehicle-design --env-file ./supabase/.env.local
```

Example local `supabase/.env.local`:

```bash
OPENAI_API_KEY=sk-your-key
OPENAI_IMAGE_MODEL=gpt-image-1.5
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=local-anon-key
SUPABASE_SERVICE_ROLE_KEY=local-service-role-key
```
