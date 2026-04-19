import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WalletCards, Banknote, Calendar, CreditCard } from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./ManageProduct.css";

const API_URL = "http://localhost:5005";

export default function WalletsPage({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [payouts, setPayouts] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: "", bank_name: "", account_number: "", account_holder: ""
  });

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "User", role: "affiliate" };
  } catch (e) {
    user = { name: "User", role: "affiliate" };
  }

  useEffect(() => {
    if (user.affiliateId) {
      fetchWallet();
      fetchPayouts();
    }
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallets/${user.affiliateId}`);
      const data = await res.json();
      if (data.success) setWallet(data.wallet);
    } catch (err) {
      console.error("Error fetching wallet:", err);
    }
  };

  const fetchPayouts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payouts/affiliate/${user.affiliateId}`);
      const data = await res.json();
      if (data.success) setPayouts(data.payouts);
    } catch (err) {
      console.error("Error fetching payouts:", err);
    }
  };

  const handleRequestPayout = async () => {
    if (!form.amount || !form.bank_name || !form.account_number || !form.account_holder) {
      alert("Semua field harus diisi!");
      return;
    }
    if (parseFloat(form.amount) > parseFloat(wallet.balance || 0)) {
      alert("Saldo tidak mencukupi!");
      return;
    }
    if (parseFloat(form.amount) < 50000) {
      alert("Minimum payout IDR 50.000!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/payouts/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliate_id: user.affiliateId,
          ...form,
          amount: parseFloat(form.amount)
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Payout request berhasil diajukan! Tunggu persetujuan admin.");
        setShowRequestModal(false);
        setForm({ amount: "", bank_name: "", account_number: "", account_holder: "" });
        fetchPayouts();
      }
    } catch (err) {
      console.error("Error requesting payout:", err);
      alert("Gagal memproses payout request.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => "IDR " + Number(val || 0).toLocaleString("id-ID");
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((a, b) => a + parseFloat(b.amount || 0), 0);

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} navigate={navigate} active="wallets" user={user} />

      <main className="dashboard-main">
        <div className="topbar">
          <h1 className="page-title">Wallets</h1>
          <div className="topbar-right">
            <NotificationIcon navigate={navigate} />
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="stat-cards" style={{ marginBottom: "20px" }}>
          <div className="stat-card" style={{ background: "linear-gradient(135deg, #C0152E, #a01228)", color: "white" }}>
            <p className="stat-label" style={{ color: "rgba(255,255,255,0.7)" }}>Wallet Balance</p>
            <h2 className="stat-value" style={{ color: "white", fontSize: "1.8rem" }}>{formatCurrency(wallet.balance)}</h2>
            <div className="stat-sub">
              <span className="stat-link" style={{ color: "rgba(255,255,255,0.9)" }} onClick={() => setShowRequestModal(true)}>
                Request Payout →
              </span>
            </div>
          </div>
          <div className="stat-card">
            <p className="stat-label">Pending Payout</p>
            <h2 className="stat-value" style={{ fontSize: "1.2rem", color: "#f57f17" }}>{formatCurrency(pendingPayouts)}</h2>
            <p className="stat-note">Awaiting admin approval</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Payout Requests</p>
            <h2 className="stat-value">{payouts.length}</h2>
            <p className="stat-note">All time</p>
          </div>
        </div>

        <div className="manage-actions">
          <button className="btn-add-product" onClick={() => setShowRequestModal(true)}>
            <WalletCards size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Request Payout
          </button>
          <span className="product-count">Min. payout: IDR 50.000</span>
        </div>

        {/* Payout History */}
        <motion.div 
          className="layered-container"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
        >
          {payouts.length === 0 ? (
            <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1' }}>
              Belum ada riwayat payout. Klik "Request Payout" untuk mengajukan pencairan.
            </div>
          ) : (
            payouts.map((p, i) => (
              <motion.div 
                key={p.id} 
                className="glass-panel" 
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02, filter: "brightness(1.05)" }}
                style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div style={{ display: "flex", gap: "16px", alignItems: "center", flex: 1 }}>
                  <div style={{ background: "rgba(198, 40, 40, 0.05)", color: "var(--primary)", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Banknote size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: "700", color: "var(--primary)" }}>{formatCurrency(p.amount)}</h3>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-gray)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={12} strokeWidth={2} /> {formatDate(p.created_at)}
                    </p>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CreditCard size={14} /> {p.bank_name}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-gray)" }}>{p.account_number} • {p.account_holder}</p>
                </div>

                <div style={{ textAlign: "right", minWidth: "100px" }}>
                  <span className={`status-badge status-${p.status}`} style={{ display: "inline-block" }}>
                    {p.status}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Request Payout Modal */}
        {showRequestModal && (
          <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
            <div className="modal-content glass-bento-card" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Request Payout</h2>
              <p style={{ fontSize: "0.82rem", color: "#888", marginBottom: "16px" }}>
                Saldo tersedia: <strong style={{ color: "#C0152E" }}>{formatCurrency(wallet.balance)}</strong>
              </p>
              <div className="modal-form">
                <div className="modal-field">
                  <label>Amount (IDR)</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Minimum 50000" />
                </div>
                <div className="modal-field">
                  <label>Bank Name</label>
                  <select value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })}>
                    <option value="">-- Pilih Bank --</option>
                    <option value="BCA">BCA</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="CIMB Niaga">CIMB Niaga</option>
                    <option value="Danamon">Danamon</option>
                    <option value="OVO">OVO</option>
                    <option value="GoPay">GoPay</option>
                    <option value="DANA">DANA</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Account Number</label>
                  <input type="text" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} placeholder="1234567890" />
                </div>
                <div className="modal-field">
                  <label>Account Holder Name</label>
                  <input type="text" value={form.account_holder} onChange={e => setForm({ ...form, account_holder: e.target.value })} placeholder="Nama pemilik rekening" />
                </div>
                <div className="modal-buttons">
                  <button className="btn-cancel" onClick={() => setShowRequestModal(false)}>Cancel</button>
                  <button className="btn-save" onClick={handleRequestPayout} disabled={loading}>
                    {loading ? "Processing..." : "Submit Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
