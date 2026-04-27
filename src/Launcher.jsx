import React, { useState } from 'react';
import App from './App';
import App2 from './App2';
import './Launcher.css';
import { BarChart3, Gauge } from 'lucide-react';

const Launcher = () => {
  const [selectedDashboard, setSelectedDashboard] = useState(null);

  if (selectedDashboard === 'dashboard1') {
    return <App />;
  }

  if (selectedDashboard === 'dashboard2') {
    return <App2 />;
  }

  return (
    <div className="launcher">
      <header className="launcher-header">
        <h1>📊 Smartworld Sky Arc</h1>
        <p>Demand & Collection Analytics Platform</p>
      </header>

      <div className="launcher-content">
        <h2>Select Dashboard</h2>
        
        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => setSelectedDashboard('dashboard1')}>
            <div className="card-icon">
              <BarChart3 size={48} />
            </div>
            <h3>Dashboard 1</h3>
            <p>Milestone-wise Demand & Collection Report</p>
            <ul className="features">
              <li>✓ KPI Cards</li>
              <li>✓ Demand vs Collection Charts</li>
              <li>✓ Tower-wise Analysis</li>
              <li>✓ Collection Rate Distribution</li>
              <li>✓ Milestone Summary Table</li>
            </ul>
            <button className="btn-primary">Open Dashboard</button>
          </div>

          <div className="dashboard-card" onClick={() => setSelectedDashboard('dashboard2')}>
            <div className="card-icon icon-purple">
              <Gauge size={48} />
            </div>
            <h3>Dashboard 2</h3>
            <p>Advanced Analytics & Deep Insights</p>
            <ul className="features">
              <li>✓ Multi-view Analysis</li>
              <li>✓ Advanced Visualizations</li>
              <li>✓ Customer Analytics</li>
              <li>✓ Scatter & Radar Charts</li>
              <li>✓ Cumulative Analysis</li>
            </ul>
            <button className="btn-primary">Open Dashboard</button>
          </div>
        </div>
      </div>

      <footer className="launcher-footer">
        <p>© 2025 Smartworld Sky Arc - Analytics Platform</p>
      </footer>
    </div>
  );
};

export default Launcher;
