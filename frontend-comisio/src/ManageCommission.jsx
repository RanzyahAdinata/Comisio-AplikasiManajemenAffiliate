import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Percent, Banknote, PieChart, Pencil, Trash2, Search
} from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./ManageProduct.css";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function ManageCommission({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [schemes, setSchemes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editScheme, setEditScheme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "percentage", value: "", is_active: true
  });

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "Admin", role: "admin" };
  } catch (e) {
    user = { name: "Admin", role: "admin" };
  }

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/commission-schemes`);
      const data = await res.json();
      if (data.success) setSchemes(data.schemes);
    } catch (err) {
      console.error("Error fetching schemes:", err);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.value) {
      alert("Nama dan Value harus diisi!");
      return;
    }
    setLoading(true);
    try {
      const url = editScheme
        ? `${API_URL}/api/commission-schemes/${editScheme.id}`
        : `${API_URL}/api/commission-schemes`;
      const method = editScheme ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: parseFloat(form.value)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditScheme(null);
        setForm({ name: "", type: "percentage", value: "", is_active: true });
        fetchSchemes();
      }
    } catch (err) {
      console.error("Error save scheme:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus skema ini?")) return;
    try {
      await fetch(`${API_URL}/api/commission-schemes/${id}`, { method: "DELETE" });
      fetchSchemes();
    } catch (err) {
      console.error("Error delete:", err);
    }
  };

  const openEdit = (scheme) => {
    setEditScheme(scheme);
    setForm({
      name: scheme.name,
      type: scheme.type,
      value: String(scheme.value),
      is_active: scheme.is_active
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditScheme(null);
    setForm({ name: "", type: "percentage", value: "", is_active: true });
    setShowModal(true);
  };

  const filteredSchemes = schemes.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} navigate={navigate} active="manage-commission" user={user} />

      <main className="dashboard-main">
        <div className="topbar">
          <h1 className="page-title">Manage Commision</h1>
          <div className="topbar-right">
            <div className="search-box">
              <input type="text" placeholder="Search Scheme..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <NotificationIcon navigate={navigate} />
          </div>
        </div>

        {/* Info Card */}
        <div className="stat-cards" style={{ marginBottom: "20px" }}>
          <div className="stat-card">
            <p className="stat-label">Total Schemes</p>
            <h2 className="stat-value">{schemes.length}</h2>
            <p className="stat-note">Commission schemes configured</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Active Schemes</p>
            <h2 className="stat-value">{schemes.filter(s => s.is_active).length}</h2>
            <p className="stat-note">Currently active</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Avg Commission</p>
            <h2 className="stat-value">
              {schemes.length > 0
                ? (schemes.reduce((a, b) => a + parseFloat(b.value || 0), 0) / schemes.length).toFixed(1) + "%"
                : "0%"}
            </h2>
            <p className="stat-note">Average rate</p>
          </div>
        </div>

        <div className="manage-actions">
          <button className="btn-add-product" onClick={openAdd}>
            + Add Commission Scheme
          </button>
          <span className="product-count">{schemes.length} schemes total</span>
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
          {filteredSchemes.length === 0 ? (
            <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1' }}>
              Belum ada skema komisi. Klik '+ Add Commission Scheme' untuk menambahkan.
            </div>
          ) : (
            filteredSchemes.map((s, i) => (
              <motion.div
                key={s.id}
                className="glass-panel"
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02, filter: "brightness(1.05)" }}
                style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}
              >
                <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px" }}>
                  <button onClick={() => openEdit(s)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, color: "var(--text-gray)" }}><Pencil size={18} strokeWidth={1.5} /></button>
                  <button onClick={() => handleDelete(s.id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, color: "var(--text-gray)" }}><Trash2 size={18} strokeWidth={1.5} /></button>
                </div>

                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ color: "var(--primary)", background: "rgba(198, 40, 40, 0.05)", borderRadius: "12px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.type === 'percentage' ? <Percent size={24} strokeWidth={2} /> : <Banknote size={24} strokeWidth={2} />}
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", color: "var(--text-dark)", fontWeight: "700" }}>{s.name}</h3>
                    <span className="category-badge" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {s.type === 'percentage' ? <PieChart size={14} strokeWidth={1.5} /> : <Banknote size={14} strokeWidth={1.5} />}
                      {s.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.3)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.6)", marginTop: "8px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-light)", fontWeight: "600" }}>Value</p>
                    <p style={{ margin: "2px 0 0", fontSize: "1.1rem", fontWeight: "800", color: "var(--primary)" }}>
                      {s.type === 'percentage' ? `${s.value}%` : `IDR ${Number(s.value).toLocaleString('id-ID')}`}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`status-badge ${s.is_active ? 'status-approved' : 'status-rejected'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content glass-bento-card" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">{editScheme ? "Edit Commission Scheme" : "Add Commission Scheme"}</h2>
              <div className="modal-form">
                <div className="modal-field">
                  <label>Scheme Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fashion Commission" />
                </div>
                <div className="modal-row">
                  <div className="modal-field">
                    <label>Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (IDR)</option>
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Value</label>
                    <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'percentage' ? '10' : '50000'} />
                  </div>
                </div>
                <div className="modal-field">
                  <label>Status</label>
                  <select value={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="modal-buttons">
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-save" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : (editScheme ? "Update" : "Add Scheme")}
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
