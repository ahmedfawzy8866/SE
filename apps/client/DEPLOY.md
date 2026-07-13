# ═══════════════════════════════════════════════════════════════════════════
# Sierra Estates — Vercel Deployment Guide
# ═══════════════════════════════════════════════════════════════════════════

## Prerequisites
- GitHub account (repo already connected)
- Vercel account (sign up at vercel.com with GitHub)
- Firebase project (or Supabase — both work)

## Deploy Steps

### 1. Import to Vercel
1. Go to https://vercel.com/new
2. Select your `SE` repo from GitHub
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/client`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

### 2. Set Environment Variables
In the Vercel dashboard → Settings → Environment Variables, add:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | your-firebase-api-key | Production + Preview |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | Production + Preview |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your-project-id | Production + Preview |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | your-project.appspot.com | Production + Preview |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 000000000000 | Production + Preview |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 1:0000:web:0000 | Production + Preview |

> 💡 If using Supabase instead of Firebase, add the Supabase env vars instead.

### 3. Deploy
Click **"Deploy"** — Vercel will:
- Install dependencies
- Build the Next.js app
- Deploy to a global CDN
- Provide a `https://sierra-estates-client.vercel.app` URL

### 4. Custom Domain (optional)
Settings → Domains → Add your domain (e.g. `sierraestates.com`)
Vercel auto-provisions SSL certificates.

## CLI Deploy (alternative)
```bash
npm install -g vercel
cd apps/client
vercel --prod
```

## Security Headers
The `vercel.json` config adds:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY (prevents clickjacking)
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
