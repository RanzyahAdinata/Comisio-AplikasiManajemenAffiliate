import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Check, X, Banknote, Calendar, CreditCard, Filter, Eye } from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./ManageProduct.css";

const API_URL = "http://localhost:5005";

export default function PayoutApproval({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [payouts, setPayouts] = useState([]);
  const [filter, setFilter] = useState("all");

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "Admin", role: "admin" };
  } catch (e) {
    user = { name: "Admin", role: "admin" };
  }

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payouts`);
      const data = await res.json();
      if (data.success) setPayouts(data.payouts);
    } catch (err) {
      console.error("Error fetching payouts:", err);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm("Approve payout ini?")) return;
    try {
      await fetch(`${API_URL}/api/payouts/${id}/approve`, { method: "PUT" });
      fetchPayouts();
    } catch (err) {
      console.error("Error approve:", err);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Reject payout ini?")) return;
    try {
      await fetch(`${API_URL}/api/payouts/${id}/reject`, { method: "PUT" });
      fetchPayouts();
    } catch (err) {
      console.error("Error reject:", err);
    }
  };

  const formatCurrency = (val) => "IDR " + Number(val || 0).toLocaleString("id-ID");
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const filteredPayouts = payouts.filter(p => {
    const matchSearch = (p.first_name + ' ' + p.last_name).toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const pendingCount = payouts.filter(p => p.status === 'pending').length;
  const approvedCount = payouts.filter(p => p.status === 'approved').length;
  const rejectedCount = payouts.filter(p => p.status === 'rejected').length;

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} navigate={navigate} active="payout-approval" user={user} />

      <main className="dashboard-main">
        <div className="topbar">
          <h1 className="page-title">Payout Approval</h1>
          <div className="topbar-right">
            <div className="search-box">
              <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <NotificationIcon navigate={navigate} />
          </div>
        </div>

        {/* Stats */}
        <div className="stat-cards" style={{ marginBottom: "20px" }}>
          <div className="stat-card" onClick={() => setFilter("pending")} style={{ cursor: "pointer", border: filter === "pending" ? "2px solid #f57f17" : "2px solid transparent" }}>
            <p className="stat-label">Pending</p>
            <h2 className="stat-value" style={{ color: "#f57f17" }}>{pendingCount}</h2>
            <p className="stat-note">Awaiting review</p>
          </div>
          <div className="stat-card" onClick={() => setFilter("approved")} style={{ cursor: "pointer", border: filter === "approved" ? "2px solid #2e7d32" : "2px solid transparent" }}>
            <p className="stat-label">Approved</p>
            <h2 className="stat-value" style={{ color: "#2e7d32" }}>{approvedCount}</h2>
            <p className="stat-note">Payouts approved</p>
          </div>
          <div className="stat-card" onClick={() => setFilter("rejected")} style={{ cursor: "pointer", border: filter === "rejected" ? "2px solid #c62828" : "2px solid transparent" }}>
            <p className="stat-label">Rejected</p>
            <h2 className="stat-value" style={{ color: "#c62828" }}>{rejectedCount}</h2>
            <p className="stat-note">Payouts rejected</p>
          </div>
        </div>

        <div className="manage-actions">
          <button className={`btn-add-product ${filter === 'all' ? '' : 'btn-seed-product'}`} onClick={() => setFilter("all")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={16} strokeWidth={1.5} /> Show All
          </button>
          <span className="product-count">{filteredPayouts.length} requests</span>
        </div>

        <motion.div 
          className="layered-container"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
        >
          {filteredPayouts.length === 0 ? (
            <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1' }}>
              Belum ada payout request.
            </div>
          ) : (
            <table className="admin-table-mini glass-panel" style={{ width: "100%", overflow: "hidden", borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Affiliator</th>
                  <th>Amount</th>
                  <th>Bank Info</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Aksi</th>
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
                {filteredPayouts.map((p, i) => (
                  <motion.tr key={p.id} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                    <td className="td-center">{i + 1}</td>
                    <td>
                      <div className="product-cell" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ background: "rgba(198, 40, 40, 0.05)", color: "var(--primary)", width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User size={18} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="product-name" style={{ margin: "0 0 2px", fontWeight: "700" }}>{p.first_name} {p.last_name}</p>
                          <p className="product-desc" style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-gray)" }}>{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td-price" style={{ fontWeight: "700", color: "var(--primary)" }}>{formatCurrency(p.amount)}</td>
                    <td>
                      <p style={{ margin: "0 0 2px", fontWeight: "600", color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "6px" }}><CreditCard size={14} /> {p.bank_name || '-'}</p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-gray)" }}>{p.account_number || '-'} • {p.account_holder || '-'}</p>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-gray)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={12} strokeWidth={2} /> {formatDate(p.created_at)}</span>
                    </td>
                    <td className="td-center">
                      <span className={`status-badge status-${p.status}`}>{p.status}</span>
                    </td>
                    <td className="td-actions" style={{ minWidth: "90px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {p.status === 'pending' ? (
                          <>
                            <button onClick={() => handleApprove(p.id)} title="Approve" style={{ background: "#27ae60", color: "white", border: "none", borderRadius: "6px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, margin: 0 }}><Check size={16} strokeWidth={2} /></button>
                            <button onClick={() => handleReject(p.id)} title="Reject" style={{ background: "#c62828", color: "white", border: "none", borderRadius: "6px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, margin: 0 }}><X size={16} strokeWidth={2} /></button>
                          </>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#999", display: "flex", alignItems: "center", gap: "4px" }}><Check size={14} /> Processed</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          )}
        </motion.div>
      </main>
    </div>
  );
}
