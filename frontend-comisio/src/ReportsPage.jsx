import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, BarChart2, Lightbulb } from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./ManageProduct.css";

const API_URL = "http://localhost:5005";

export default function ReportsPage({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    walletBalance: 0,
    pendingCommissions: 0,
    totalClicks: 0,
    totalSales: 0,
    activeCampaigns: 0
  });
  const [campaigns, setCampaigns] = useState([]);

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "User", role: "affiliate" };
  } catch (e) {
    user = { name: "User", role: "affiliate" };
  }

  useEffect(() => {
    if (user.affiliateId) {
      fetchStats();
      fetchCampaigns();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/affiliate/${user.affiliateId}`);
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${user.affiliateId}`);
      const data = await res.json();
      if (data.success) setCampaigns(data.campaigns);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  };

  const formatCurrency = (val) => "IDR " + Number(val || 0).toLocaleString("id-ID");

  // Simple chart data
  const monthlyData = [
    { month: "Jan", clicks: 45, sales: 3 },
    { month: "Feb", clicks: 68, sales: 5 },
    { month: "Mar", clicks: 92, sales: 8 },
    { month: "Apr", clicks: stats.totalClicks || 120, sales: stats.totalSales || 12 },
  ];

  const maxClicks = Math.max(...monthlyData.map(d => d.clicks), 1);

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} navigate={navigate} active="reports" user={user} />

      <main className="dashboard-main">
        <div className="topbar">
          <h1 className="page-title">Reports</h1>
          <div className="topbar-right">
            <NotificationIcon navigate={navigate} />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stat-cards" style={{ marginBottom: "20px" }}>
          <div className="stat-card">
            <p className="stat-label">Total Clicks</p>
            <h2 className="stat-value">{stats.totalClicks}</h2>
            <p className="stat-note">From all referral links</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Sales</p>
            <h2 className="stat-value">{stats.totalSales}</h2>
            <p className="stat-note">Completed transactions</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Active Campaigns</p>
            <h2 className="stat-value">{stats.activeCampaigns}</h2>
            <p className="stat-note">Products promoted</p>
          </div>
        </div>

        <div className="stat-cards" style={{ marginBottom: "20px" }}>
          <div className="stat-card">
            <p className="stat-label">Conversion Rate</p>
            <h2 className="stat-value">
              {stats.totalClicks > 0 ? ((stats.totalSales / stats.totalClicks) * 100).toFixed(1) : 0}%
            </h2>
            <p className="stat-note">Clicks to sales ratio</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Wallet Balance</p>
            <h2 className="stat-value" style={{ fontSize: "1.2rem" }}>{formatCurrency(stats.walletBalance)}</h2>
            <p className="stat-note">Available for payout</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Pending Commissions</p>
            <h2 className="stat-value" style={{ fontSize: "1.2rem", color: "#f57f17" }}>{formatCurrency(stats.pendingCommissions)}</h2>
            <p className="stat-note">Awaiting approval</p>
          </div>
        </div>

        {/* Monthly Performance Chart */}
        <div className="dashboard-bottom">
          <div className="charts-col">
            <div className="chart-card">
              <div className="chart-header">
                <p className="chart-label">Monthly Clicks Performance</p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", height: "140px", padding: "10px 0" }}>
                {monthlyData.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#C0152E" }}>{d.clicks}</span>
                    <div style={{
                      width: "100%",
                      maxWidth: "50px",
                      height: `${(d.clicks / maxClicks) * 100}px`,
                      background: i === monthlyData.length - 1 ? "#C0152E" : "#e0e0e0",
                      borderRadius: "8px 8px 0 0",
                      transition: "height 0.5s ease"
                    }} />
                    <span style={{ fontSize: "0.72rem", color: "#999", fontWeight: 600 }}>{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <p className="chart-label">Campaign Performance</p>
              </div>
              <div style={{ marginTop: "12px" }}>
                {campaigns.length === 0 ? (
                  <p style={{ color: "#999", fontSize: "0.85rem" }}>Belum ada campaign aktif.</p>
                ) : (
                  <table className="admin-table-mini glass-panel" style={{ width: "100%", overflow: "hidden", borderSpacing: 0 }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Commission</th>
                        <th>Referral Code</th>
                      </tr>
                    </thead>
                    <motion.tbody
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                      }}
                    >
                      {campaigns.map((c, i) => (
                        <motion.tr key={i} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                          <td style={{ fontWeight: 700 }}>{c.product_name}</td>
                          <td>{c.category}</td>
                          <td>{c.commission_rate}%</td>
                          <td><code style={{ background: "rgba(198,40,40,0.05)", border: "1px solid rgba(198,40,40,0.2)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", color: "var(--primary)" }}>{c.referral_code}</code></td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="leaderboard-card">
            <h3 className="leaderboard-title">Performance Tips</h3>
            <div className="leaderboard-list">
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={14} /> Share More</p>
                  <p className="lb-sold">Share referral links on social media to increase clicks</p>
                </div>
              </div>
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={14} /> Target Audience</p>
                  <p className="lb-sold">Focus on products that match your audience interest</p>
                </div>
              </div>
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BarChart2 size={14} /> Track Results</p>
                  <p className="lb-sold">Monitor which campaigns perform best</p>
                </div>
              </div>
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={14} /> Create Content</p>
                  <p className="lb-sold">Write reviews and create content about products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
