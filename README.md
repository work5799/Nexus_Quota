# NexusQuota

Your AI Quota Command Center

## Setup

### Prerequisites
- Node.js (v18 or higher)
- A Supabase account (https://supabase.com)

### 1. Supabase Setup
1. Go to https://supabase.com and create a new project
2. In your Supabase project, go to **SQL Editor** and run the queries from `supabase.sql` to create the tables
3. Go to **Project Settings → API** to get your:
   - `Project URL`
   - `service_role` secret key

### 2. Easy Installation (One Command)
From the main `nexusquota` folder:
```bash
npm install && npm run install-all
```

### 3. Configure Environment Variables
1. Go to the `server` folder
2. Copy the `.env.example` file to `.env`
3. Fill in your:
   - JWT secret (any random string will work for development)
   - Google OAuth credentials (from Google Cloud Console)
   - Supabase URL and service role key (from your Supabase project)

## Running the App (Easy!)

From the main `nexusquota` folder:
```bash
npm run dev
```

This will start **both** the backend and frontend servers at the same time!

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Separate Servers (Optional)
If you want to run them separately:
- Backend only: `npm run server`
- Frontend only: `npm run client`

## Features

- Landing page
- User authentication (register/login)
- Dashboard overview
- Antigravity quota management
  - Connect Google accounts via OAuth
  - View and refresh quotas
  - Rename/remove accounts
  - Toggle account enabled/disabled
- Settings page
- Supabase database integration
"# Nexus_Quota" 
