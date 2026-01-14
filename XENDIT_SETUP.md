# Xendit Webhook Configuration Guide

## Overview
For Kontinu to automatically credit users after successful payments, you must configure the Xendit webhook URL in your Xendit dashboard.

## Step-by-Step Setup

### 1. Get Your Webhook URL
Your webhook URL should be:
```
https://your-domain.com/api/webhooks/xendit
```

For local development with ngrok:
```
https://your-ngrok-url.ngrok-free.app/api/webhooks/xendit
```

### 2. Configure in Xendit Dashboard

1. **Login to Xendit Dashboard**: https://dashboard.xendit.co/
2. **Navigate to Settings** → **Developers** → **Webhooks**
3. **Click "Add Webhook"** or **"Edit Webhook"**
4. **Enter your webhook URL**:
   - URL: `https://your-domain.com/api/webhooks/xendit`
5. **Select Events to Subscribe**:
   - ✅ **Invoice Paid** (REQUIRED)
   - ✅ Invoice Expired (Optional)
   - ✅ Invoice Failed (Optional)
6. **Save** the webhook configuration

### 3. Verify Webhook Token
Make sure your `.env.local` has the correct webhook token:
```env
XENDIT_WEBHOOK_TOKEN=xxxx
```

You can find this token in: **Xendit Dashboard** → **Settings** → **Developers** → **Callback/Webhook Token**

### 4. Test the Webhook

#### Option A: Use Xendit's Test Mode
1. Create a test invoice via the pricing page
2. In Xendit dashboard, find the test invoice
3. Manually mark it as "Paid"
4. Check your application logs for:
   ```
   📩 Xendit Webhook Received:
   ✅ Successfully updated user...
   ```

#### Option B: Use ngrok for Local Testing
1. Start your dev server: `npm run dev`
2. Start ngrok: `ngrok http 3000`
3. Update `NEXT_PUBLIC_APP_URL` in `.env.local` with the ngrok URL
4. Configure the ngrok URL in Xendit webhook settings
5. Make a test purchase

## Troubleshooting

### Credits Not Updating After Payment?

**Check the following:**

1. **Webhook URL is configured in Xendit**
   - Login to Xendit Dashboard
   - Verify webhook URL is correct
   - Ensure "Invoice Paid" event is selected

2. **Check application logs**
   ```bash
   # You should see:
   📩 Xendit Webhook Received:
   Signature: xxx
   Body: {...}
   Parsed data status: PAID
   Metadata: { user_id: 'xxx', plan_code: 'bronze' }
   ✅ Successfully updated user xxx with 100 credits (plan: bronze)
   ```

3. **Verify webhook token**
   - Check `.env.local` has `XENDIT_WEBHOOK_TOKEN`
   - Token should match the one in Xendit Dashboard

4. **Check for signature errors**
   - If you see `❌ Invalid signature` in logs, the webhook token is incorrect

5. **Verify plan_code is being sent**
   - Check logs for "Metadata"
   - Should contain `plan_code: 'bronze'` or similar

### Common Issues

| Issue | Solution |
|-------|----------|
| No webhook received | Webhook URL not configured in Xendit |
| `Invalid signature` | Update `XENDIT_WEBHOOK_TOKEN` in `.env.local` |
| `Missing metadata` | Ensure invoice was created with latest code (after plan_code fix) |
| Credits = 0 or wrong amount | Check `plan_code` in webhook logs, verify creditsMap in code |

## Development vs Production

### Development (ngrok)
```env
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok-free.app/
```
- Configure ngrok URL in Xendit webhook settings
- Use test mode payments
- Check terminal logs for webhook activity

### Production
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com/
```
- Configure production URL in Xendit webhook settings
- Use live mode payments
- Monitor server logs for webhook activity

## Security Note
⚠️ Always verify webhook signatures to prevent unauthorized access!
The code automatically checks `x-callback-token` header against your `XENDIT_WEBHOOK_TOKEN`.
