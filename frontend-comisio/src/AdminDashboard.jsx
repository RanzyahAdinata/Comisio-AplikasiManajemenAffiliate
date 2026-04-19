import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Percent, CheckCircle, Users, Database, Server, Clock, Activity } from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./DashboardPage.css";

const API_URL = "http://localhost:5005";

export default function AdminDashboard({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    totalProducts: 0,
    pendingPayouts: 0,
    totalRevenue: 0,
    totalCommissions: 0
  });
  const [recentPayouts, setRecentPayouts] = useState([]);

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "Admin", role: "admin" };
  } catch (e) {
    user = { name: "Admin", role: "admin" };
  }

  useEffect(() => {
    fetchStats();
    fetchPayouts();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/admin`);
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchPayouts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payouts`);
      const data = await res.json();
      if (data.success) setRecentPayouts(data.payouts.slice(0, 5));
    } catch (err) {
      console.error("Error fetching payouts:", err);
    }
  };

  const formatCurrency = (val) => {
    return "IDR " + Number(val || 0).toLocaleString("id-ID");
  };

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        navigate={navigate}
        active="admin-dashboard"
        user={user}
      />

      <main className="dashboard-main">
        {/* Top Bar */}
        <div className="topbar">
          <h1 className="page-title">Dashboard</h1>
          <div className="topbar-right">
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search Data" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <NotificationIcon navigate={navigate} />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <p className="stat-label">Total Affiliates</p>
            <h2 className="stat-value">{stats.totalAffiliates}</h2>
            <p className="stat-note">Active affiliators</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Products</p>
            <h2 className="stat-value">{stats.totalProducts}</h2>
            <p className="stat-note">Available campaigns</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Pending Payouts</p>
            <h2 className="stat-value">{stats.pendingPayouts}</h2>
            <div className="stat-sub">
              <span className="stat-link" onClick={() => navigate("payout-approval")}>Review →</span>
            </div>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="stat-cards" style={{ marginTop: 0 }}>
          <div className="stat-card">
            <p className="stat-label">Total Revenue</p>
            <h2 className="stat-value" style={{ fontSize: "1.3rem" }}>{formatCurrency(stats.totalRevenue)}</h2>
            <p className="stat-note">From all transactions</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Commissions Paid</p>
            <h2 className="stat-value" style={{ fontSize: "1.3rem" }}>{formatCurrency(stats.totalCommissions)}</h2>
            <p className="stat-note">To affiliators</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-bottom">
          <div className="charts-col">
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <p className="chart-label">Quick Actions</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                <button className="admin-action-btn" onClick={() => navigate("manage-product")} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={16} strokeWidth={1.5} /> Manage Products
                </button>
                <button className="admin-action-btn" onClick={() => navigate("manage-commission")} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Percent size={16} strokeWidth={1.5} /> Manage Commission
                </button>
                <button className="admin-action-btn" onClick={() => navigate("payout-approval")} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} strokeWidth={1.5} /> Payout Approvals
                </button>
                <button className="admin-action-btn" onClick={() => navigate("manage-affiliates")} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} strokeWidth={1.5} /> Kelola Affiliator
                </button>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <p className="chart-label">Recent Payout Requests</p>
                </div>
              </div>
              <div style={{ marginTop: "12px" }}>
                {recentPayouts.length === 0 ? (
                  <p style={{ color: "#999", fontSize: "0.85rem" }}>Belum ada payout request</p>
                ) : (
                  <table className="admin-table-mini glass-panel" style={{ width: "100%", overflow: "hidden", borderSpacing: 0 }}>
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Amount</th>
                        <th>Status</th>
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
                      {recentPayouts.map((p, i) => (
                        <motion.tr key={i} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                          <td>{p.first_name} {p.last_name}</td>
                          <td>{formatCurrency(p.amount)}</td>
                          <td>
                            <span className={`status-badge status-${p.status}`}>
                              {p.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Admin Info Panel */}
          <div className="leaderboard-card">
            <h3 className="leaderboard-title">System Info</h3>
            <div className="leaderboard-list">
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Server size={14} /> Server Status</p>
                  <p className="lb-sold" style={{ color: "#27ae60" }}>● Online</p>
                </div>
              </div>
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Database size={14} /> Database</p>
                  <p className="lb-sold" style={{ color: "#27ae60" }}>● PostgreSQL</p>
                </div>
              </div>
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={14} /> API Version</p>
                  <p className="lb-sold">v1.0.0</p>
                </div>
              </div>
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> Last Updated</p>
                  <p className="lb-sold">{new Date().toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
