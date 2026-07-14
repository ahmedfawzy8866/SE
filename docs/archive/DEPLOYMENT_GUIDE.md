# ═══════════════════════════════════════════════════════════════════════════
# Sierra Estates — Complete Deployment Guide
# ═══════════════════════════════════════════════════════════════════════════

## Overview

This guide covers deploying all 4 components of Sierra Estates:

| Component | Where | Cost |
|-----------|-------|------|
| Client Portal | Vercel | Free |
| Admin SPA | Vercel (or self-host) | Free |
| Database | Supabase | Free (500MB) |
| n8n + WhatsApp Bot | **AWS EC2** | $8-15/month |

---

## Phase 1: Database (Supabase) — 10 minutes

### Create Project
1. Go to https://supabase.com → Sign up
2. Click "New Project"
3. Name: `sierra-estates-prod`
4. Set database password (save it!)
5. Region: Choose closest to Egypt (eu-central-1 or me-central-1)
6. Wait 2 minutes for provisioning

### Run Schema
1. In Supabase Dashboard → **SQL Editor**
2. Click "New query"
3. Copy entire contents of `infra/schema.sql` from this repo
4. Click **Run** (▶)
5. Verify: 8 tables created (compounds, listings, units, agents, inquiries, career_applications, leads, users)

### Get API Keys
1. Go to **Project Settings → API**
2. Copy:
   - **Project URL** (e.g. `https://abcd1234.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Configure + Seed
```bash
# Run the automated setup script
cd SE
bash scripts/setup-supabase.sh
# Follow prompts — paste URL + key when asked
```

Or manually:
1. Edit `supabase-config.js` → paste URL + key → set `ENABLED = true`
2. Open `seed-supabase.html` in browser → click "Seed Supabase Now"

### Create Admin User
1. Supabase Dashboard → **Authentication → Users** → Add user
2. Copy the user's UID
3. SQL Editor:
```sql
INSERT INTO users (id, email, name, role)
VALUES ('YOUR-UID', 'your@email.com', 'Ahmed', 'admin');
```

✅ **Database ready!**

---

## Phase 2: Client Portal (Vercel) — 5 minutes

### Deploy
1. Go to https://vercel.com → Sign up with GitHub
2. Click "New Project" → Import `SE` repo
3. Configure:
   - **Root Directory:** `apps/client`
   - **Framework:** Next.js (auto-detected)
4. Add Environment Variables (Settings → Environment Variables):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY = your-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 000000000000
   NEXT_PUBLIC_FIREBASE_APP_ID = 1:0000:web:0000
   ```
5. Click **Deploy**
6. Vercel provides: `https://sierra-estates-client.vercel.app`

### Custom Domain (optional)
Settings → Domains → Add `sierraestates.com`

✅ **Client portal live!**

---

## Phase 3: Admin SPA (Vercel or self-host) — 5 minutes

### Option A: Vercel (recommended)
1. In Vercel, create another project from same repo
2. Configure:
   - **Root Directory:** `apps/admin`
   - **Framework:** Vite (auto-detected)
3. Add Environment Variables:
   ```
   VITE_FIREBASE_API_KEY = your-key
   VITE_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = your-project
   VITE_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID = 000000000000
   VITE_FIREBASE_APP_ID = 1:0000:web:0000
   VITE_N8N_URL = http://your-vps-ip:5678
   ```
4. Deploy

### Option B: Self-host (any static server)
```bash
cd apps/admin
npm install
npm run build
# Serve the dist/ folder with any static server (nginx, caddy, serve)
npx serve dist
```

✅ **Admin SPA live!**

---

## Phase 4: AWS EC2 (n8n + WhatsApp Bot) — 15 minutes

### Launch EC2 (one command from your laptop)
```bash
# Prerequisites: AWS CLI installed + configured
pip install awscli
aws configure  # enter access key + secret + region (eu-central-1)

# Launch EC2 with everything auto-configured
bash scripts/launch-aws-ec2.sh
```

The script will:
1. ✅ Find latest Ubuntu 22.04 AMI
2. ✅ Create security group (ports 22, 5678, 3000, 80, 443)
3. ✅ Launch EC2 instance with cloud-init script
4. ✅ Auto-install Docker + create 2GB swap + clone repo + start containers
5. ✅ Print SSH command + n8n URL + auto-generated password

**Instance types:**
- `t3.micro` (1GB RAM + 2GB swap) — $8/mo, free tier eligible (12 months)
- `t3.small` (2GB RAM) — $15/mo, **recommended**
- `t3.medium` (4GB RAM) — $30/mo, for high traffic

### Manual launch (AWS Console alternative)
1. AWS Console → EC2 → Launch Instance
2. AMI: **Ubuntu 22.04 LTS**
3. Instance type: **t3.small**
4. Storage: 30GB gp3
5. Security group: Allow ports 22, 5678, 3000, 80, 443
6. User data: Paste contents of `infra/aws/ec2-user-data.sh`
7. Launch with your SSH key

### Get n8n password (auto-generated)
```bash
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR-EC2-IP 'cat /var/log/user-data.log | grep Password'
```

### Link WhatsApp
```bash
# View the QR code
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR-EC2-IP \
  'docker compose -f /opt/sierra-estates/infra/docker-compose.yml logs whatsapp-scraper | grep -A 25 "Scan"'
```
1. Open WhatsApp on your phone
2. Settings → Linked Devices → Link a device
3. Scan the QR code in terminal

### Import n8n Workflows
1. Open `http://YOUR-EC2-IP:5678` in browser
2. Login (admin / password from user-data log)
3. Workflows → Add → Import from File
4. Import all 3 files from `/opt/sierra-estates/infra/n8n-workflows/`:
   - `01-property-finder-leads.json`
   - `02-whatsapp-bot-handler.json`
   - `03-ai-score-scheduler.json`
5. Activate all 3 workflows (toggle "Active" on each)

### Configure Gemini API in n8n
1. Get Gemini API key (see `infra/GEMINI_SETUP.md`)
2. n8n → Settings → Credentials → Add → "HTTP Header Auth"
   - Name: `Gemini API`
   - Header: `x-goog-api-key`
   - Value: `AIzaSyYourKeyHere`
3. Open workflow 02 → "Gemini AI Reply" node → select credential
4. Open workflow 03 → "Gemini AI Score" node → select credential

### Configure Firebase in n8n
1. Upload service account JSON to EC2:
```bash
scp -i ~/.ssh/your-key.pem ~/Downloads/service-account.json \
  ubuntu@YOUR-EC2-IP:/opt/sierra-estates/infra/secrets/firebase-service-account.json
```
2. n8n → Settings → Credentials → Add → "Firebase Realtime Database"
   - Upload the service account JSON
   - Name: `Sierra Firebase`
3. Each workflow node that uses Firebase → select this credential

### Set up S3 backups (recommended)
```bash
# Create S3 bucket (from your laptop)
aws s3 mb s3://sierra-estates-backups --region eu-central-1

# Add daily backup cron job on EC2
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR-EC2-IP \
  '(crontab -l 2>/dev/null; echo "0 3 * * * /opt/sierra-estates/scripts/backup-to-s3.sh sierra-estates-backups") | crontab -'
```

✅ **n8n + WhatsApp bot live on AWS!**

---

## Verification Checklist

After all 4 phases, verify:

| Check | How |
|-------|-----|
| Client portal loads | Visit Vercel URL |
| Listings show on client | Browse `/listings` page |
| Inquiry form works | Submit test inquiry → check Supabase `inquiries` table |
| Admin SPA loads | Visit admin Vercel URL |
| Admin can see listings | Login → Listings Manager |
| n8n is running | Visit `http://VPS-IP:5678` |
| WhatsApp bot connected | Send test message → check n8n executions |
| Gemini replies work | Send WhatsApp message → verify AI reply |
| AI scores updating | Check `listings.ai_score` in Supabase (updates every 4h) |

---

## Cost Summary

| Service | Cost |
|---------|------|
| Vercel (client + admin) | $0 (free tier) |
| Supabase (database) | $0 (free tier, 500MB) |
| **AWS EC2 t3.small** (n8n + WhatsApp) | **$15/month** |
| AWS S3 (backups) | $0.50/month (5GB) |
| Gemini API | $0 (free tier, 1500 req/day) |
| Firebase | $0 (free tier) |
| **Total** | **~$15.50/month** |

---

## Troubleshooting

### Client portal shows no listings
- Check Firebase/Supabase env vars in Vercel
- Verify listings have `status: 'active'` in database
- Check browser console for errors

### Admin SPA can't connect to Firestore
- Verify `VITE_FIREBASE_*` env vars are set
- Check Firestore Security Rules allow admin access
- Verify your user has `role: 'admin'` in `users` table

### n8n workflows not executing
- Check n8n logs: `ssh -i key.pem ubuntu@IP 'docker compose -f /opt/sierra-estates/infra/docker-compose.yml logs n8n'`
- Verify credentials are configured (Firebase + Gemini)
- Check webhook URLs are correct

### WhatsApp bot not responding
- Check bot logs: `ssh -i key.pem ubuntu@IP 'docker compose -f /opt/sierra-estates/infra/docker-compose.yml logs whatsapp-scraper'`
- Verify QR code was scanned (session saved in `whatsapp-auth/`)
- Test webhook: `curl -X POST http://EC2-IP:5678/webhook/whatsapp-incoming -H "Content-Type: application/json" -d '{"phone":"+201001234567","text":"test","jid":"test@s.whatsapp.net"}'`

### AWS-specific
- Instance unreachable: Check security group allows your IP on port 22
- Can't find password: `ssh -i key.pem ubuntu@IP 'cat /var/log/user-data.log'`
- n8n slow: Check swap is active: `ssh -i key.pem ubuntu@IP 'free -h'`
- Want to stop costs: `aws ec2 stop-instances --instance-ids i-xxxxx`

### Gemini API errors
- Verify API key is valid (test with curl in GEMINI_SETUP.md)
- Check free tier quota (1500 req/day)
- Ensure "Generative Language API" is enabled in Google Cloud
