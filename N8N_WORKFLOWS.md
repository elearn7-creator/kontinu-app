# n8n Workflow Documentation

This document outlines the n8n workflows required for Kontinu to function properly.

## Required Workflows

### 1. Workflow A: Onboarding (User Provisioning)

**Webhook URL**: `/onboarding`

**Trigger**: POST request from Clerk webhook when new user is created

**Input**:
```json
{
  "userId": "clerk_user_id",
  "email": "user@example.com"
}
```

**Steps**:
1. **Google Drive - Create Folder**
   - Name: `Kontinu - {email}`
   - Parent: Root or specific folder
   - Output: `folderId`

2. **Google Sheets - Create Spreadsheet**
   - Name: `Kontinu Bookkeeping - {email}`
   - Headers: `Date | Vendor | Amount | Category | Notes | File URL`
   - Output: `sheetId`

3. **Move Sheet to Folder**
   - Move the created sheet to the Drive folder

4. **Respond to Webhook**
   ```json
   {
     "success": true,
     "folderId": "{{folderId}}",
     "sheetId": "{{sheetId}}"
   }
   ```

---

### 2. Workflow B: Analyze Document (AI Extraction)

**Webhook URL**: `/analyze`

**Trigger**: POST request with file upload

**Input**: FormData with `file` field (image or PDF)

**Steps**:
1. **Extract File from FormData**

2. **Google Vision API / OCR**
   - Extract text from image/PDF
   - Output: Raw text

3. **OpenAI / Gemini AI**
   - Prompt: "Extract the following from this receipt/invoice: amount, vendor name, date. Return as JSON."
   - Input: OCR text
   - Output: Structured JSON

4. **Format Response**
   ```json
   {
     "success": true,
     "data": {
       "amount": 50000,
       "vendor": "Toko ABC",
       "date": "2024-01-14",
       "category": "Operasional",
       "notes": "Pembelian alat tulis"
     }
   }
   ```

5. **Error Handling**
   - If extraction fails:
   ```json
   {
     "success": false,
     "error": "Failed to extract data from document"
   }
   ```

---

### 3. Workflow C: Save Entry

**Webhook URL**: `/save`

**Trigger**: POST request with verified data

**Input**:
```json
{
  "userId": "clerk_user_id",
  "sheetId": "google_sheet_id",
  "folderId": "google_drive_folder_id",
  "amount": 50000,
  "vendor": "Toko ABC",
  "date": "2024-01-14",
  "category": "Operasional",
  "notes": "Pembelian alat tulis",
  "fileUrl": "optional_file_url"
}
```

**Steps**:
1. **Google Sheets - Append Row**
   - Sheet ID: `{{sheetId}}`
   - Values: `[date, vendor, amount, category, notes, fileUrl]`

2. **Optional: Upload File to Drive**
   - If file is provided, upload to folder
   - Get shareable link

3. **Update Sheet with File Link**
   - Update the row with the Drive file link

4. **Respond to Webhook**
   ```json
   {
     "success": true,
     "fileUrl": "https://drive.google.com/file/..."
   }
   ```

---

### 4. Workflow D: Generate Report

**Webhook URL**: `/generate-report`

**Trigger**: POST request with date range

**Input**:
```json
{
  "sheetId": "google_sheet_id",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "format": "pdf" // or "csv"
}
```

**Steps**:
1. **Google Sheets - Get Rows**
   - Sheet ID: `{{sheetId}}`
   - Filter by date range

2. **Filter Data**
   - Filter rows where date is between startDate and endDate

3. **Generate Report**
   - **If format = "pdf"**:
     - Use HTML to PDF converter
     - Create formatted report with table
   - **If format = "csv"**:
     - Convert filtered data to CSV

4. **Upload to Temporary Storage**
   - Upload generated file to Google Drive (temp folder)
   - Set expiration (24 hours)
   - Get shareable link

5. **Respond to Webhook**
   ```json
   {
     "success": true,
     "downloadUrl": "https://drive.google.com/file/..."
   }
   ```

---

## Google API Setup

### Required Scopes:
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/spreadsheets`

### Setup Steps:
1. Go to Google Cloud Console
2. Create a new project or use existing
3. Enable Google Drive API and Google Sheets API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs for n8n
6. Configure in n8n credentials

---

## AI Provider Setup

### Option 1: OpenAI
- API Key required
- Model: `gpt-4o-mini` or `gpt-3.5-turbo`
- Cost: ~$0.001 per analysis

### Option 2: Google Gemini
- API Key required
- Model: `gemini-1.5-flash`
- Cost: Free tier available

### Option 3: Anthropic Claude
- API Key required
- Model: `claude-3-haiku`
- Cost: ~$0.001 per analysis

---

## Testing Workflows

Use these curl commands to test each workflow:

### Test Onboarding
```bash
curl -X POST https://your-n8n-instance.com/webhook/onboarding \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user", "email": "test@example.com"}'
```

### Test Analyze (with file)
```bash
curl -X POST https://your-n8n-instance.com/webhook/analyze \
  -F "file=@receipt.jpg"
```

### Test Save
```bash
curl -X POST https://your-n8n-instance.com/webhook/save \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "sheetId": "your_sheet_id",
    "folderId": "your_folder_id",
    "amount": 50000,
    "vendor": "Test Vendor",
    "date": "2024-01-14"
  }'
```

### Test Report
```bash
curl -X POST https://your-n8n-instance.com/webhook/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "sheetId": "your_sheet_id",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "format": "pdf"
  }'
```
