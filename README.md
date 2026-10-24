# UniNest — Boarding House Agent & Room Unlock Platform

A modern web application built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**. It connects students with verified university boarding house rooms, protects landlord contacts until an agent unlock fee is paid, and provides landlords with an in-depth tenant and room occupancy management panel.

---

## 🚀 Quick Launch from GitHub

You can host this application directly from a GitHub repository for free using **Vercel**, **Netlify**, or **GitHub Pages**.

### Option A: Launch with Vercel (Recommended - Fastest)

1. Push this project to your GitHub account (see [Pushing to GitHub](#pushing-to-github) below).
2. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
3. Click **"Add New..."** > **"Project"**.
4. Select your **UniNest** GitHub repository and click **Import**.
5. Vercel automatically detects **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Your app will be live with a free `.vercel.app` URL and automatic deployments on every `git push`.

---

### Option B: Launch with Netlify

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub.
2. Click **"Add new site"** > **"Import an existing project"**.
3. Select your repository.
4. Set the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy UniNest**.

---

### Option C: Launch on GitHub Pages

1. In your repository on GitHub, go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
3. Select the **Static HTML** or **Vite** starter workflow to deploy automatically on push.

---

## 🛠️ Pushing to GitHub (Step-by-Step)

If you haven't pushed this code to GitHub yet, run the following commands in your terminal:

```bash
# 1. Initialize git (if not already done)
git init

# 2. Add all files
git add .

# 3. Create your first commit
git commit -m "Initial commit: UniNest boarding house agent platform"

# 4. Create a new repository on https://github.com/new (e.g. named 'uninest')

# 5. Link to your GitHub repository (replace with your GitHub username and repo)
git remote add origin https://github.com/YOUR_USERNAME/uninest.git
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

---

## 💻 Local Development

To run this project on your computer:

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To build for production:

```bash
npm run build
```

The production output is generated in the `dist/` directory.

---

## 🌟 Key Features

1. **Student Discovery & Contact Unlock Flow**
   - Safe public room specs (photos, pricing in ZMW, distance to campus, amenities, rules, safe general area).
   - Strict hiding of plot numbers and landlord phones until unlock fee is paid.
   - Payment simulation for MTN Mobile Money, Airtel Money, card, and manual bank slip uploads.
   - Unlocked contacts dashboard with direct WhatsApp, phone call, and map directions.

2. **Landlord Portal & Tenant Occupancy Roster**
   - Roster showing which student is in which room/bed.
   - Live countdown of remaining prepaid lease months and days.
   - Color-coded statuses: Paid Up, Due Soon (< 25 days), and Overdue.
   - One-click "Add Tenant to Room" and "Record Rent Payment" (+1, +2, +3, +6 months).
   - Instant WhatsApp and phone call triggers for landlord-to-tenant communication.

3. **Agent Admin Operations**
   - Review pending landlord submissions (inspecting both public and private data).
   - Approve or decline manual mobile money slips.
   - Adjust the platform agent unlock fee dynamically.
   - Dispute and report handling.
