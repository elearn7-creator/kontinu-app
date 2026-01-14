# Quick Start Guide

## Step 1: Create .env.local

Copy `.env.example` to `.env.local` and update with these values:

### ✅ Clerk (Already Configured)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c2VjdXJlLXNoYXJrLTQ2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_xC2bhh9RAMAUgrcoMQrO0yTZ7Z2TGFttD9xw54lIci
CLERK_WEBHOOK_SECRET=whsec_dTE7ECWIGt//WZdzr+g/CLSSZBKkEqhh
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### 🔲 Supabase (Need to Configure)
1. Go to https://supabase.com
2. Create a new project
3. Go to Project Settings → API
4. Copy the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vomgjpdkdzwczriodxbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_58ZGj0DAWKQKlq2y-yvggw_yTuy-Rv8
```

5. Go to SQL Editor and run the schema from `SUPABASE_SCHEMA.md`

### 🔲 n8n (Need to Configure)
You have two options:

**Option A: n8n Cloud (Easiest)**
1. Sign up at https://n8n.io
2. Create the 4 workflows from `N8N_WORKFLOWS.md`
3. Get webhook URLs

**Option B: Self-hosted n8n**
1. Deploy n8n using Docker:
   ```bash
   docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
   ```
2. Access at http://localhost:5678
3. Create the 4 workflows

```env
NEXT_PUBLIC_N8N_ONBOARDING_WEBHOOK=https://your-n8n.app.n8n.cloud/webhook/onboarding
NEXT_PUBLIC_N8N_ANALYZE_WEBHOOK=https://n8n.srv1241445.hstgr.cloud/webhook/33ca7768-ccbe-407a-8a3c-12403e4df685
NEXT_PUBLIC_N8N_SAVE_WEBHOOK=https://your-n8n.app.n8n.cloud/webhook/save
NEXT_PUBLIC_N8N_REPORT_WEBHOOK=https://your-n8n.app.n8n.cloud/webhook/generate-report
```

### 🔲 Xendit (Need to Configure)
1. Sign up at https://dashboard.xendit.co
2. Go to Settings → Developers → API Keys
3. Copy the keys:

```env
XENDIT_SECRET_KEY=xnd_development_5pXsCSS5EIn6w7raDNKLVkHwGJFOVr6i1KVHIApuMLYvEzTex6n12AkG8Cj0aLb
XENDIT_WEBHOOK_TOKEN=your_webhook_verification_token
NEXT_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_development_KJsG5179pG4LxZHHRQXGED8GVJoQLqBjkZm2kRJIPyW6zZEYmoeRowzqSUgY
```

### App URL
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Configure Clerk Google OAuth

1. Go to Clerk Dashboard → Configure → SSO Connections
2. Enable Google
3. Add these OAuth scopes:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/spreadsheets`
4. Save changes

## Step 3: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 4: Test the Flow

1. Sign up with Google account
2. Check if onboarding page appears
3. Verify redirect to dashboard

## What Works Now vs. What Needs Setup

### ✅ Works Now (Clerk configured)
- Landing page
- Sign in/Sign up pages
- Authentication flow
- Protected routes

### ⏳ Needs Setup
- **Supabase**: User data storage
- **n8n**: AI analysis and Google Workspace integration
- **Xendit**: Payment processing

## Minimal Setup to Test

If you want to test the UI without full backend setup:

1. Just add Supabase credentials (5 minutes)
2. Run `npm run dev`
3. You can navigate through all pages and see the UI
4. n8n and Xendit can be added later

## Priority Order

1. **Supabase** (Required for basic functionality)
2. **n8n** (Required for AI features)
3. **Xendit** (Required for payments)

Would you like help setting up any of these services?
