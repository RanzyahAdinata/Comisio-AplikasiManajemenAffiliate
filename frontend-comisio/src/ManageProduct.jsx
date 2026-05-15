import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Shirt, Laptop, Sparkles, Home, Tent, 
  Package, Pencil, Trash2, BookOpen, MonitorPlay, Code, FolderDown, Users
} from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import CustomSelect from "./CustomSelect";
import "./ManageProduct.css";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function ManageProduct({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [form, setForm] = useState({
    name: "", price: "", category: "Fashion", image_url: "", description: "", commission_rate: "10"
  });

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "Admin", role: "admin" };
  } catch (e) {
    user = { name: "Admin", role: "admin" };
  }

  useEffect(() => {
    fetchProducts();
    fetchSchemes();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchSchemes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/commission-schemes`);
      const data = await res.json();
      if (data.success) {
        // Hanya ambil skema yang aktif dan tipe persentase
        setSchemes(data.schemes.filter(s => s.is_active && s.type === 'percentage'));
      }
    } catch (err) {
      console.error("Error fetching schemes:", err);
    }
  };



  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      alert("Nama dan Harga harus diisi!");
      return;
    }
    setLoading(true);
    try {
      const url = editProduct
        ? `${API_URL}/api/products/${editProduct.id}`
        : `${API_URL}/api/products`;
      const method = editProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          commission_rate: parseFloat(form.commission_rate)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditProduct(null);
        setForm({ name: "", price: "", category: "Fashion", image_url: "", description: "", commission_rate: "10" });
        fetchProducts();
      }
    } catch (err) {
      console.error("Error save product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error("Error delete:", err);
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      image_url: product.image_url || "",
      description: product.description || "",
      commission_rate: String(product.commission_rate || 10)
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: "", price: "", category: "Fashion", image_url: "", description: "", commission_rate: "10" });
    setShowModal(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [
    "Fashion", "Electronics", "Health & Beauty", "Home & Living", "Sports & Outdoor",
    "E-book", "E-course", "Software", "Digital Asset", "Membership"
  ];
  const categoryIcons = {
    "Fashion": <Shirt size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />, 
    "Electronics": <Laptop size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />, 
    "Health & Beauty": <Sparkles size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />,
    "Home & Living": <Home size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />, 
    "Sports & Outdoor": <Tent size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />,
    "E-book": <BookOpen size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />,
    "E-course": <MonitorPlay size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />,
    "Software": <Code size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />,
    "Digital Asset": <FolderDown size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />,
    "Membership": <Users size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />
  };

  const formatCurrency = (val) => "IDR " + Number(val || 0).toLocaleString("id-ID");

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} navigate={navigate} active="manage-product" user={user} />

      <main className="dashboard-main">
        <div className="topbar">
          <h1 className="page-title">Manage Product</h1>
          <div className="topbar-right">
            <div className="search-box">
              <input type="text" placeholder="Search Product..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <NotificationIcon navigate={navigate} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="manage-actions">
          <button className="btn-add-product" onClick={openAdd}>
            + Add Product
          </button>
          <span className="product-count">{products.length} products total</span>
        </div>

        {/* Products Grid */}
        <motion.div 
          className="campaign-grid layered-container"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
        >
          {filteredProducts.length === 0 ? (
            <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1' }}>
              {products.length === 0 
                ? "Belum ada produk. Klik '+ Add Product' untuk menambahkan produk baru." 
                : "Tidak ada produk yang cocok dengan pencarian."}
            </div>
          ) : (
            filteredProducts.map((p, i) => (
              <motion.div 
                key={p.id} 
                className="campaign-card glass-panel" 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02, filter: "brightness(1.05)" }}
                style={{ position: "relative" }}
              >
                <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px" }}>
                  <button onClick={() => openEdit(p)} style={{ background: "rgba(255,255,255,0.7)", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer", padding: "4px", color: "var(--text-gray)", display: "flex" }}><Pencil size={14} strokeWidth={2} /></button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: "rgba(255,255,255,0.7)", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer", padding: "4px", color: "var(--primary)", display: "flex" }}><Trash2 size={14} strokeWidth={2} /></button>
                </div>
                
                <div className="campaign-card-emoji" style={{ color: "var(--primary)", background: "rgba(198, 40, 40, 0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {p.image_url ? (
                    p.image_url.startsWith('http') 
                      ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> 
                      : <span style={{fontSize: '24px'}}>{p.image_url}</span>
                  ) : <Package size={32} strokeWidth={1.5} />}
                </div>

                <div className="campaign-card-info" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 className="campaign-card-title">{p.name}</h3>
                  <span className="campaign-card-category" style={{ display: "inline-flex", alignItems: "center", justifySelf: "center", alignSelf: "center" }}>
                    {categoryIcons[p.category] || <Package size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />} {p.category}
                  </span>
                  
                  <p className="campaign-card-price" style={{ marginTop: "auto" }}>{formatCurrency(p.price)}</p>
                  <p className="campaign-card-commission" style={{ margin: "4px 0 0" }}>
                    Commission: <strong>{p.commission_rate || 10}%</strong>
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Modal Add/Edit */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">{editProduct ? "Edit Product" : "Add New Product"}</h2>
              <div className="modal-form">
                <div className="modal-field">
                  <label>Product Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
                </div>
                <div className="modal-row">
                  <div className="modal-field">
                    <label>Price (IDR)</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" />
                  </div>
                  <div className="modal-field">
                    <label>Commission Scheme</label>
                    {schemes.length > 0 ? (
                      <CustomSelect 
                        name="commission_rate"
                        value={form.commission_rate}
                        onChange={e => setForm({ ...form, commission_rate: e.target.value })}
                        options={[
                          { label: "Default (10%)", value: "10" },
                          ...schemes.map(s => ({ label: `${s.name} (${s.value}%)`, value: String(s.value) }))
                        ]}
                      />
                    ) : (
                      <input type="number" value={form.commission_rate} onChange={e => setForm({ ...form, commission_rate: e.target.value })} placeholder="10" />
                    )}
                  </div>
                </div>
                <div className="modal-field">
                  <label>Category</label>
                  <CustomSelect 
                    name="category"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    options={categories.map(c => ({ label: c, value: c }))}
                  />
                </div>
                <div className="modal-field">
                  <label>Emoji / Image URL</label>
                  <input type="text" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="👟 or URL" />
                </div>
                <div className="modal-field">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description" rows={3} />
                </div>
                <div className="modal-buttons">
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-save" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : (editProduct ? "Update" : "Add Product")}
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
