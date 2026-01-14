# Kontinu - Automated Bookkeeping PWA

AI-powered bookkeeping application with Google Workspace integration and automated document processing.

## Features

- 🤖 **AI Document Analysis**: Automatically extract data from receipts and invoices
- 📊 **Google Sheets Integration**: Data syncs directly to your Google Sheet
- 📁 **Google Drive Storage**: Documents stored in your personal Drive folder
- 💳 **Subscription Management**: Flexible plans with Xendit payment integration
- 📱 **Progressive Web App**: Install on mobile and desktop
- 📈 **Reporting**: Generate PDF and CSV reports by date range

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Authentication**: Clerk
- **Database**: Supabase
- **Automation**: n8n
- **Payment**: Xendit
- **Deployment**: Vercel (recommended)

## Prerequisites

1. **Node.js** 18+ and npm
2. **Clerk Account** (for authentication)
3. **Supabase Project** (for database)
4. **n8n Instance** (self-hosted or cloud)
5. **Xendit Account** (for payments)
6. **Google Cloud Project** (for Drive/Sheets API)

## Setup Instructions

### 1. Clone and Install

```bash
cd "Kontinu App"
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# n8n Webhooks
NEXT_PUBLIC_N8N_ONBOARDING_WEBHOOK=https://your-n8n.com/webhook/onboarding
NEXT_PUBLIC_N8N_ANALYZE_WEBHOOK=https://your-n8n.com/webhook/analyze
NEXT_PUBLIC_N8N_SAVE_WEBHOOK=https://your-n8n.com/webhook/save
NEXT_PUBLIC_N8N_REPORT_WEBHOOK=https://your-n8n.com/webhook/generate-report

# Xendit
XENDIT_SECRET_KEY=xnd_...
XENDIT_WEBHOOK_TOKEN=your_webhook_token
NEXT_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the SQL from `SUPABASE_SCHEMA.md`
4. Copy your project URL and anon key to `.env.local`

### 4. Clerk Setup

1. Create a new Clerk application
2. Enable Google OAuth provider
3. Add these OAuth scopes:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/spreadsheets`
4. Configure webhook endpoint: `https://your-app.com/api/webhooks/clerk`
5. Subscribe to `user.created` event
6. Copy publishable key, secret key, and webhook secret to `.env.local`

### 5. n8n Setup

1. Set up n8n instance (cloud or self-hosted)
2. Create the 4 workflows as documented in `N8N_WORKFLOWS.md`:
   - Onboarding workflow
   - Analyze workflow
   - Save workflow
   - Generate Report workflow
3. Configure Google Drive and Sheets credentials in n8n
4. Set up AI provider (OpenAI, Gemini, or Claude)
5. Copy webhook URLs to `.env.local`

### 6. Xendit Setup

1. Create Xendit account
2. Get API keys from dashboard
3. Configure webhook URL: `https://your-app.com/api/webhooks/xendit`
4. Copy secret key and webhook token to `.env.local`

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── create-invoice/      # Xendit invoice creation
│   │   └── webhooks/
│   │       ├── clerk/           # User creation webhook
│   │       └── xendit/          # Payment webhook
│   ├── dashboard/               # Main dashboard
│   ├── onboarding/              # New user setup
│   ├── upload/                  # Document upload & analysis
│   ├── reports/                 # Report generation
│   ├── pricing/                 # Subscription plans
│   ├── sign-in/                 # Auth pages
│   └── sign-up/
├── components/
│   ├── ui/                      # Shadcn components
│   └── providers.tsx            # App providers
└── lib/
    ├── supabase.ts              # Supabase client
    └── n8n.ts                   # n8n service layer
```

## User Flow

1. **Sign Up**: User signs up with Google account
2. **Onboarding**: System creates Drive folder and Sheet via n8n
3. **Upload**: User uploads receipt/invoice (camera/gallery/PDF)
4. **Analysis**: AI extracts data (amount, vendor, date)
5. **Verification**: User verifies and edits data if needed
6. **Save**: Data appended to Google Sheet, file moved to Drive
7. **Reports**: User can download PDF/CSV reports by date range
8. **Subscription**: User can upgrade for more credits

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

- Netlify
- Railway
- DigitalOcean App Platform

## Troubleshooting

### Webhook Not Working
- Check webhook URLs are correct
- Verify webhook secrets match
- Check n8n workflows are active

### Google API Errors
- Verify OAuth scopes in Clerk
- Check Google Cloud API is enabled
- Ensure n8n has correct credentials

### Payment Issues
- Verify Xendit webhook URL is accessible
- Check webhook token matches
- Test with Xendit sandbox mode first

## Support

For issues or questions, please contact support or check the documentation files:
- `SUPABASE_SCHEMA.md` - Database setup
- `N8N_WORKFLOWS.md` - n8n workflow details

## License

MIT
