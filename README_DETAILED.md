# 📊 Smartworld Sky Arc - Demand & Collection Analytics Dashboard

A comprehensive React-based analytics platform for analyzing real estate project demand, collection, and milestone-wise financial data.

## 🌟 Features

### Dashboard 1: Simple & Clean
- **KPI Cards** - Total Demand, Collected, Outstanding, Collection Rate
- **Tower Comparison** - Performance across all 6 towers
- **Milestone Analysis** - Top performing milestones
- **Collection Metrics** - Distribution and trends
- **Data Table** - Detailed milestone-wise breakdown

### Dashboard 2: Advanced Analytics
- **Multi-View System** - 5 different analytical views
- **Advanced Charts** - Scatter plots, radar charts, area charts
- **Customer Analytics** - Top 10 customer ranking
- **Tower Efficiency** - Collection rate by tower
- **Trend Analysis** - Cumulative and trend visualizations
- **Sorting & Filtering** - Dynamic data exploration

## 📈 Data Overview

| Metric | Count |
|--------|-------|
| Total Records | 12,078 |
| Milestones | 213 |
| Towers | 6 |
| Customers | 857 |
| Units | 11,157 |
| **Total Demand** | ₹1.57 Trillion |
| **Total Collected** | ₹1.08 Trillion |
| **Collection Rate** | 68.77% |

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ ([Download](https://nodejs.org/))
- npm v6+ (comes with Node.js)
- Git

### Installation & Run (4 Steps)

```bash
# 1. Clone repository
git clone https://github.com/aviverma007/Demand_Collection_Report.git
cd Demand_Collection_Report

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Copy the URL shown (usually http://localhost:5173/)
```

That's it! Your dashboard is now running! 🎉

## 📁 Project Structure

```
src/
├── App.jsx              # Dashboard 1 (Simple)
├── App.css
├── App2.jsx             # Dashboard 2 (Advanced)
├── App2.css
├── Launcher.jsx         # Landing Page
├── Launcher.css
├── main.jsx             # Entry Point
├── index.css
└── data/
    ├── demandCollectionData.json
    └── advancedData.json
```

## 🎮 Usage

1. **Open localhost:5173** in your browser
2. **Select a dashboard** from the landing page
3. **Explore the data** using interactive charts
4. **Filter & Sort** using the provided controls
5. **View detailed insights** in tables and visualizations

### Dashboard 1 Features
- Tower selector dropdown
- Milestone group selector (Top 10 vs All)
- Interactive charts with tooltips
- Sortable data table

### Dashboard 2 Features
- View mode selector (5 different views)
- Sorting options (by demand, collection, rate, outstanding)
- Advanced filtering capabilities
- Multiple chart types

## 🛠️ Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Fast setup instructions
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup & troubleshooting

## 🎨 Technologies Used

- **React 19** - UI Framework
- **Vite 8** - Build tool
- **Recharts** - Data visualization library
- **Lucide React** - Icon library
- **CSS3** - Styling with gradients & animations

## 🔧 Customization

### Change Colors
Edit color variables in CSS files:
```css
--primary: #3b82f6;
--success: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
```

### Update Data
Modify JSON files in `src/data/` folder

### Adjust Layout
Edit the grid layouts in respective CSS files

## 📱 Responsive Design

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

All charts and layouts adapt to screen size!

## 🚀 Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
1. Build: `npm run build`
2. Deploy `dist/` folder to Netlify

### Deploy to GitHub Pages
1. Build: `npm run build`
2. Push `dist/` to GitHub Pages branch

## ⚡ Performance

- **Optimized Charts** - Lazy loaded Recharts
- **Fast Rendering** - React 19 improvements
- **Minimal Bundle** - Tree-shaked dependencies
- **Smooth Animations** - CSS transitions

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5173 in use | Kill process or use different port |
| npm not found | Install Node.js from nodejs.org |
| Blank page | Clear cache and hard refresh |
| Module errors | Delete node_modules and run npm install |

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for detailed troubleshooting.

## 📊 Data Insights

### Collection Rate by Milestone
- **High (75-100%):** Quick payment collections
- **Medium (50-75%):** Moderate collection pace
- **Low (0-50%):** Slower collections

### Tower Performance
Compare demand vs collection across 6 towers:
- Tower A, B, C, D, E, F

### Customer Analytics
Track top 10 customers by demand

### Unit Distribution
Analyze how units are distributed across milestones

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push and create a Pull Request

## 📄 License

This project is open source and available for use.

## 👨‍💻 Author

Created with ❤️ for Smartworld Sky Arc Analytics

## 📞 Support

For issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Check [QUICK_START.md](./QUICK_START.md)
3. Review the code comments
4. Check browser console for errors (F12)

## 🎯 Future Enhancements

- [ ] Real-time data updates
- [ ] PDF export functionality
- [ ] Advanced filtering options
- [ ] User authentication
- [ ] Data caching
- [ ] Dark mode
- [ ] Mobile app version

## ✨ Credits

- **Data Source:** dapp_skyarc.XLSX
- **Built with:** React, Vite, Recharts
- **Designed for:** Smartworld Sky Arc

---

**Start exploring your data now!** 🚀📊

```bash
npm run dev
```

Visit: [http://localhost:5173/](http://localhost:5173/)
