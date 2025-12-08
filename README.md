# GetBonusCasinos Backend

A NestJS application that reads casino bonus information from Google Sheets and provides a REST API to access the data.

## Features

- Reads bonus data from Google Sheets
- RESTful API endpoint to retrieve all bonuses
- Type-safe DTOs for bonus data
- Environment-based configuration

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud Project with Sheets API enabled
- Service Account credentials for Google Sheets

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name and create
   - Click on the service account and go to "Keys" tab
   - Click "Add Key" > "Create new key" > Choose JSON format
   - Download the JSON file

5. Share your Google Sheet with the service account email:
   - Open your Google Sheet
   - Click "Share" button
   - Add the service account email (found in the JSON file as `client_email`)
   - Give it "Viewer" permissions

6. Get your Sheet ID:
   - Open your Google Sheet
   - The Sheet ID is in the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### 3. Authentication Configuration

You have **two options** for authentication:

#### Option 1: JSON Credentials File (Recommended) ⭐

This is the **simplest and most reliable** method. It avoids all private key parsing issues.

1. Place the downloaded JSON credentials file in your project root (e.g., `credentials.json`)
2. Create a `.env` file:

```env
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
GOOGLE_SHEET_ID=your-google-sheet-id-here
```

**Benefits:**
- ✅ No key format conversion issues
- ✅ Works with all Node.js versions
- ✅ No need to handle newlines or quotes
- ✅ Google handles all the complexity

#### Option 2: Environment Variables (Alternative)

If you prefer not to use a JSON file:

1. Create a `.env` file:

```env
GOOGLE_SHEET_ID=your-google-sheet-id-here
GOOGLE_CLIENT_EMAIL=your-service-account-email@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

**Important:** 
- The `GOOGLE_PRIVATE_KEY` should include the full private key with `\n` for newlines
- Wrap the entire key in quotes
- The private key is found in the downloaded JSON file as `private_key`

### 4. Run the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

The application will start on `http://localhost:3000`

## API Endpoints

### GET /bonuses

Returns a list of all bonuses from the Google Sheet.

**Response:**
```json
[
  {
    "brandName": "Realz",
    "logo": "https://...",
    "welcomeBonus": "250% up to",
    "bonusDetails": "1st Deposit: 150% up to $1500 +50 F\n2nd Deposit:50% up to $1000 +50 FS\n3rd Deposit:50% up to $1500 +50 FS",
    "wager": "35x",
    "minDeposit": "30$",
    "trackingLink": "www.realz.com/au"
  }
]
```

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module
├── bonuses/
│   ├── bonuses.controller.ts  # Bonuses API controller
│   └── dto/
│       └── bonus.dto.ts       # Bonus data transfer object
└── google-sheets/
    └── google-sheets.service.ts  # Google Sheets integration service
```

## Google Sheet Format

The application expects the Google Sheet to have the following structure in the "Entries" tab:

| Brand name | Logo | Welcome bonus | Bonus details | Wager | Min. Deposit | Tracking Link (Temporar) |
|------------|------|---------------|---------------|-------|--------------|--------------------------|
| Realz      | ...  | 250% up to    | ...           | 35x   | 30$          | www.realz.com/au         |

The first row is treated as headers and is skipped.

## License

MIT

