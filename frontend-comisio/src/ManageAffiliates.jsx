import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Search } from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./DashboardPage.css";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function ManageAffiliates({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "Admin", role: "admin" };
  } catch (e) {
    user = { name: "Admin", role: "admin" };
  }

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/affiliates`);
      const data = await res.json();
      if (data.success) setAffiliates(data.affiliates);
    } catch (err) {
      console.error("Error fetching affiliates:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncAffiliates = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch(`${API_URL}/api/sync-affiliates`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setSyncMsg(`✅ ${data.message}`);
        fetchAffiliates(); // Refresh the list
      } else {
        setSyncMsg(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error("Error syncing affiliates:", err);
      setSyncMsg("❌ Sync failed. Server not responding.");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(""), 5000);
    }
  };

  const toggleStatus = async (affiliateId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`${API_URL}/api/affiliates/${affiliateId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAffiliates();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const formatCurrency = (val) => {
    return "IDR " + Number(val || 0).toLocaleString("id-ID");
  };

  const filtered = affiliates.filter(
    (a) =>
      (a.first_name + " " + a.last_name + " " + a.email + " " + a.referral_code)
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        navigate={navigate}
        active="manage-affiliates"
        user={user}
      />

      <main className="dashboard-main">
        {/* Top Bar */}
        <div className="topbar">
          <h1 className="page-title">Manage Affiliates</h1>
          <div className="topbar-right">
            <button
              onClick={syncAffiliates}
              disabled={syncing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                fontSize: "0.8rem",
                borderRadius: "8px",
                border: "none",
                cursor: syncing ? "not-allowed" : "pointer",
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                marginRight: "12px",
                opacity: syncing ? 0.7 : 1,
                transition: "all 0.3s ease",
              }}
            >
              <RefreshCw size={14} className={syncing ? "spin-icon" : ""} /> {syncing ? "Syncing..." : "Sync Affiliates"}
            </button>
            <div className="search-box">
              <input type="text" placeholder="Search affiliates..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Sync Message */}
        {syncMsg && (
          <div style={{
            padding: "10px 16px",
            margin: "0 0 16px 0",
            borderRadius: "8px",
            background: syncMsg.startsWith("✅") ? "#d4edda" : "#f8d7da",
            color: syncMsg.startsWith("✅") ? "#155724" : "#721c24",
            fontSize: "0.85rem",
            fontWeight: 500,
            animation: "fadeIn 0.3s ease",
          }}>
            {syncMsg}
          </div>
        )}

        {/* Summary Cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <p className="stat-label">TOTAL AFFILIATES</p>
            <h2 className="stat-value">{affiliates.length}</h2>
            <p className="stat-note">Registered in system</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">ACTIVE AFFILIATES</p>
            <h2 className="stat-value">{affiliates.filter(a => a.status === "active").length}</h2>
            <p className="stat-note">Active status</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">TOTAL WALLET BALANCE</p>
            <h2 className="stat-value" style={{ fontSize: "1.3rem" }}>
              {formatCurrency(affiliates.reduce((sum, a) => sum + Number(a.wallet_balance || 0), 0))}
            </h2>
            <p className="stat-note">All affiliate wallets</p>
          </div>
        </div>

        {/* Affiliates Table */}
        <div className="dashboard-bottom" style={{ display: "block" }}>
          <div className="chart-card" style={{ maxWidth: "100%" }}>
            <div className="chart-header">
              <div>
                <p className="chart-label">AFFILIATES LIST</p>
              </div>
            </div>
            <div style={{ marginTop: "12px", overflowX: "auto" }}>
              {loading ? (
                <p style={{ color: "#999", fontSize: "0.85rem" }}>Loading data...</p>
              ) : filtered.length === 0 ? (
                <p style={{ color: "#999", fontSize: "0.85rem" }}>No affiliates registered yet.</p>
              ) : (
                <table className="admin-table-mini glass-panel" style={{ width: "100%", overflow: "hidden", borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>NAME</th>
                      <th>EMAIL</th>
                      <th>REFERRAL CODE</th>
                      <th>WALLET BALANCE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
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
                    {filtered.map((a, i) => (
                      <motion.tr key={a.id} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{a.first_name} {a.last_name}</td>
                        <td>{a.email}</td>
                        <td>
                          <code style={{
                            background: "rgba(255,255,255,0.4)",
                            border: "1px solid rgba(255,255,255,0.6)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            color: "var(--primary)"
                          }}>
                            {a.referral_code}
                          </code>
                        </td>
                        <td>{formatCurrency(a.wallet_balance)}</td>
                        <td>
                          <span className={`status-badge status-${a.status}`}>
                            {a.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => toggleStatus(a.id, a.status)}
                            style={{
                              padding: "4px 12px",
                              fontSize: "0.75rem",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: 600,
                              background: a.status === "active" ? "rgba(198,40,40,0.1)" : "rgba(39, 174, 96, 0.1)",
                              color: a.status === "active" ? "#c62828" : "#27ae60",
                            }}
                          >
                            {a.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
