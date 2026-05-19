import {  useState, useEffect  } from "react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./ManageProduct.css";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function CommissionsPage({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [commissions, setCommissions] = useState([]);

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "User", role: "affiliate" };
  } catch (e) {
    user = { name: "User", role: "affiliate" };
  }

  useEffect(() => {
    if (user.affiliateId) fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/commissions/${user.affiliateId}`);
      const data = await res.json();
      if (data.success) setCommissions(data.commissions);
    } catch (err) {
      console.error("Error fetching commissions:", err);
    }
  };

  const formatCurrency = (val) => "IDR " + Number(val || 0).toLocaleString("id-ID");
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const totalPending = commissions.filter(c => c.status === 'pending').reduce((a, b) => a + parseFloat(b.commission_amount || 0), 0);
  const totalApproved = commissions.filter(c => c.status === 'approved').reduce((a, b) => a + parseFloat(b.commission_amount || 0), 0);
  const totalAll = commissions.reduce((a, b) => a + parseFloat(b.commission_amount || 0), 0);

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} navigate={navigate} active="commisions" user={user} />

      <main className="dashboard-main">
        <div className="topbar">
          <h1 className="page-title">Commisions</h1>
          <div className="topbar-right">
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-cards" style={{ marginBottom: "20px" }}>
          <div className="stat-card">
            <p className="stat-label">Total Commission</p>
            <h2 className="stat-value" style={{ fontSize: "1.2rem" }}>{formatCurrency(totalAll)}</h2>
            <p className="stat-note">{commissions.length} transactions</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Pending</p>
            <h2 className="stat-value" style={{ fontSize: "1.2rem", color: "#f57f17" }}>{formatCurrency(totalPending)}</h2>
            <p className="stat-note">Awaiting approval</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Approved</p>
            <h2 className="stat-value" style={{ fontSize: "1.2rem", color: "#2e7d32" }}>{formatCurrency(totalApproved)}</h2>
            <p className="stat-note">Ready for payout</p>
          </div>
        </div>

        <div className="products-table-wrap">
          <table className="products-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Order Reference</th>
                <th>Order Amount</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    Belum ada data komisi. Promosikan produk Anda untuk mendapatkan komisi!
                  </td>
                </tr>
              ) : (
                commissions.map((c, i) => (
                  <tr key={c.id}>
                    <td className="td-center">{i + 1}</td>
                    <td>
                      <span style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: "0.82rem" }}>
                        {c.order_reference || '-'}
                      </span>
                    </td>
                    <td className="td-price">{formatCurrency(c.order_amount)}</td>
                    <td className="td-price" style={{ color: "#27ae60" }}>{formatCurrency(c.commission_amount)}</td>
                    <td className="td-center">
                      <span className={`status-badge status-${c.status}`}>{c.status}</span>
                    </td>
                    <td style={{ fontSize: "0.78rem", color: "#666" }}>{formatDate(c.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
