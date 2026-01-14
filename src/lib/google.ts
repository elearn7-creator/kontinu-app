import { google } from 'googleapis';

const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
];

console.log('Initializing Google Service...');
console.log('GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL ? 'Present' : 'MISSING');
console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? `Present (${process.env.GOOGLE_PRIVATE_KEY.substring(0, 50)}...)` : 'MISSING');

if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Missing Google Credentials');
}

// Handle private key newlines
const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
console.log('Private key after newline replacement:', privateKey.substring(0, 100) + '...');

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
    },
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

console.log('Google Service initialized successfully');

export const googleService = {
    async createFolder(name: string, parentId?: string) {
        try {
            const fileMetadata: any = {
                name,
                mimeType: 'application/vnd.google-apps.folder',
            };

            if (parentId) {
                fileMetadata.parents = [parentId];
            }

            const file = await drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });

            return file.data.id;
        } catch (error) {
            console.error('Error creating folder:', error);
            throw error;
        }
    },

    async createSpreadsheet(title: string, folderId: string) {
        let step = 'init';
        try {
            // 1. Create Spreadsheet using Drive API (allows setting parent directly)
            step = 'create_sheet_drive';
            const file = await drive.files.create({
                requestBody: {
                    name: title,
                    mimeType: 'application/vnd.google-apps.spreadsheet',
                    parents: [folderId],
                },
                fields: 'id',
            });

            const spreadsheetId = file.data.id;
            if (!spreadsheetId) throw new Error('Failed to create spreadsheet file');

            // 2. Set Header Row (Default sheet name is usually 'Sheet1')
            step = 'write_headers';
            // We'll target the first sheet by not specifying sheet name in range, or using 'Sheet1'
            // To be safe, let's rename the first sheet to 'Transactions' first? 
            // Or just write to "Sheet1" and rename it.

            // Let's just write to the first sheet (SheetId 0)
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            updateSheetProperties: {
                                properties: {
                                    sheetId: 0,
                                    title: 'Transactions',
                                    gridProperties: { frozenRowCount: 1 }
                                },
                                fields: 'title,gridProperties.frozenRowCount'
                            }
                        }
                    ]
                }
            });

            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'Transactions!A1:Z1',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[
                        'Date', 'Vendor', 'Category', 'Description',
                        'Amount', 'Type', 'Confidence', 'Invoice URL',
                        'Items', 'Verification Status', 'Created At'
                    ]]
                }
            });

            // 3. Formatting (Bold Header)
            step = 'format_headers';
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            repeatCell: {
                                range: {
                                    sheetId: 0,
                                    startRowIndex: 0,
                                    endRowIndex: 1,
                                },
                                cell: {
                                    userEnteredFormat: {
                                        textFormat: { bold: true },
                                        backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
                                    }
                                },
                                fields: 'userEnteredFormat(textFormat,backgroundColor)'
                            }
                        }
                    ]
                }
            });

            return spreadsheetId;

        } catch (error: any) {
            console.error(`Error in createSpreadsheet (Step: ${step}):`, error);
            console.error('Full error object:', JSON.stringify(error, null, 2));

            // Check for Quota Exceeded
            if (error.message?.includes('storage quota') || error.errors?.[0]?.reason === 'storageQuotaExceeded') {
                throw new Error("Google Drive Storage Full. Please empty the trash in your Google Drive or Service Account.");
            }

            // Check for various "API not enabled" error patterns
            if (
                error.code === 403 ||
                error.status === 403 ||
                error.message?.includes('API has not been used') ||
                error.message?.includes('Google Sheets API has not been used') ||
                error.message?.includes('it is disabled') ||
                error.errors?.[0]?.reason === 'accessNotConfigured'
            ) {
                throw new Error("Google Sheets API is disabled. Enable it in Google Cloud Console for the correct project.");
            }
            throw new Error(`Failed at ${step}: ${error.message || JSON.stringify(error)}`);
        }
    },

    async shareFile(fileId: string, email: string) {
        try {
            await drive.permissions.create({
                fileId,
                requestBody: {
                    role: 'writer',
                    type: 'user',
                    emailAddress: email,
                },
                fields: 'id',
            });
        } catch (error) {
            console.error('Error sharing file:', error);
            // Don't throw here, failing to share shouldn't break the whole flow 
            // but we log it.
        }
    },

    async setupOnboarding(userId: string, email: string) {
        try {
            // 1. Create Main Folder "Kontinu x User"
            // Use undefined for parentId to create in Root, or use env var GOOGLE_ROOT_FOLDER_ID
            const rootFolderId = process.env.GOOGLE_ROOT_FOLDER_ID || undefined;
            const mainFolderId = await this.createFolder(`Kontinu - ${email}`, rootFolderId);

            if (!mainFolderId) throw new Error('Failed to create main folder');

            // 2. Share Main Folder with User
            await this.shareFile(mainFolderId, email);

            // 3. Create "Invoices" Subfolder
            const invoicesFolderId = await this.createFolder('Invoices', mainFolderId);
            if (!invoicesFolderId) throw new Error('Failed to create invoices folder');

            // Wait 2 seconds to avoid Rate Limit (User request)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 4. Create Spreadsheet
            const sheetId = await this.createSpreadsheet('Kontinu Bookkeeping', mainFolderId);
            if (!sheetId) throw new Error('Failed to create spreadsheet');

            return {
                mainFolderId,
                invoicesFolderId,
                sheetId
            };
        } catch (error) {
            console.error('Onboarding Setup Failed:', error);
            throw error;
        }
    }
};
