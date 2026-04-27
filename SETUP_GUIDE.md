# 📊 Smartworld Sky Arc Dashboard - Setup Guide

## How to Run on Your VS Code

### Step 1: Clone or Download the Repository

```bash
git clone https://github.com/aviverma007/Demand_Collection_Report.git
cd Demand_Collection_Report
```

Or if you want to update an existing clone:
```bash
cd Demand_Collection_Report
git pull origin main
```

---

### Step 2: Install Dependencies

Open terminal in VS Code and run:

```bash
npm install
```

This will install all required packages:
- React
- React DOM
- Recharts (charts library)
- Lucide React (icons)
- Vite (build tool)
- XLSX (Excel parser)

**Time:** ~2-3 minutes (first time only)

---

### Step 3: Start the Development Server

```bash
npm run dev
```

You will see output like:
```
VITE v8.0.10  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### Step 4: Open in Browser

Click on the URL or copy-paste in your browser:
```
http://localhost:5173/
```

**That's it!** Your dashboard is now running! 🎉

---

## Project Structure

```
Demand_Collection_Report/
├── src/
│   ├── App.jsx                 # Dashboard 1 (Simple)
│   ├── App.css                 # Dashboard 1 Styling
│   ├── App2.jsx                # Dashboard 2 (Advanced)
│   ├── App2.css                # Dashboard 2 Styling
│   ├── Launcher.jsx            # Landing Page
│   ├── Launcher.css            # Landing Page Styling
│   ├── main.jsx                # Entry Point
│   ├── index.css               # Global Styles
│   └── data/
│       ├── demandCollectionData.json   # Dashboard 1 Data
│       └── advancedData.json           # Dashboard 2 Data
├── index.html                  # Main HTML File
├── vite.config.js              # Vite Configuration
├── package.json                # Dependencies
└── dist/                       # Build output (created after npm run build)
```

---

## Available Commands

### Development Mode (Hot Reload)
```bash
npm run dev
```
- Starts dev server on http://localhost:5173/
- Hot reload on file changes
- Great for development

### Build for Production
```bash
npm run build
```
- Creates optimized build in `dist/` folder
- Ready to deploy

### Preview Build Locally
```bash
npm run preview
```
- Preview the production build locally

---

## Troubleshooting

### Issue: Port 5173 already in use
**Solution:** Kill the process or use a different port:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

Or change the port in `vite.config.js`:
```javascript
server: {
  port: 3000,  // Change to 3000 or any free port
  host: true
}
```

### Issue: npm install fails
**Solution:** Try clearing npm cache:
```bash
npm cache clean --force
npm install
```

### Issue: Blank page or errors in console
**Solution:** 
1. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if data files exist in `src/data/`

---

## Features Overview

### 🎯 Dashboard 1: Simple Demand & Collection Report
- **4 KPI Cards** with key metrics
- **7 Different Charts** (bar, pie, line charts)
- **Milestone Summary Table** with sorting
- **Tower Comparison** analysis
- **Collection Rate Distribution**

**Navigation:** Dropdown filters for Tower and Milestone selection

### 🚀 Dashboard 2: Advanced Analytics
- **5 Different Views:**
  1. Overview - Multi-chart dashboard
  2. Milestones - Detailed table with sorting
  3. Towers - Performance cards
  4. Customers - Top customers analysis
  5. Analytics - Advanced visualizations

- **Advanced Charts:**
  - Scatter plots
  - Radar charts
  - Area charts
  - Line trend charts
  - Multi-bar comparisons

**Navigation:** View selector buttons at the top

---

## Data Details

- **Total Records:** 12,078
- **Milestones:** 213
- **Towers:** 6 (TA, TB, TC, TD, TE, TF)
- **Customers:** 857
- **Units:** 11,157

All data is processed from the Excel file `dapp_skyarc.XLSX`

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Hard Refresh | `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac) |
| Open DevTools | `F12` or `Ctrl+Shift+I` |
| Toggle Responsive | `Ctrl+Shift+M` |

---

## Performance Tips

1. **Use Chrome/Brave** - Better for large datasets
2. **Clear Browser Cache** - If experiencing slow loads
3. **Close Unnecessary Tabs** - Saves RAM
4. **Use Production Build** - For deployment (npm run build)

---

## Deployment

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
1. Build: `npm run build`
2. Deploy the `dist/` folder to Netlify

### Deploy to GitHub Pages
1. Build: `npm run build`
2. Push the `dist/` folder to GitHub

---

## Getting Help

If you encounter issues:

1. **Check the browser console** (F12) for error messages
2. **Verify Node.js version** - Should be 14+ 
   ```bash
   node --version
   ```
3. **Check internet connection** - Required for CDN assets
4. **Try clearing node_modules and reinstalling:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## System Requirements

- **Node.js:** v14.0.0 or higher
- **npm:** v6.0.0 or higher
- **Browser:** Chrome, Firefox, Safari, or Edge (recent version)
- **RAM:** 4GB minimum
- **Disk Space:** 500MB for node_modules

---

## Quick Start Summary

```bash
# 1. Clone/Navigate to project
cd Demand_Collection_Report

# 2. Install packages
npm install

# 3. Start dev server
npm run dev

# 4. Open browser
http://localhost:5173/

# 5. Select dashboard and start exploring! 🎉
```

---

## Next Steps

After running locally:
- 📊 Explore both dashboards
- 🔍 Try different filters and sorting options
- 📈 Analyze the data insights
- 🚀 Customize colors/layouts if needed
- 📦 Build and deploy to production

---

**Happy Analyzing! 📊✨**
