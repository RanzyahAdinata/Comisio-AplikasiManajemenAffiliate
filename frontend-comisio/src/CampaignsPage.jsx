import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Shirt, Laptop, Sparkles, Home, Tent, MonitorSmartphone,
  Package, Search, Copy, Check, Ticket, CheckCircle2, ShoppingBag,
  Tag, Link
} from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import Swal from "sweetalert2";
import "./CampaignsPage.css";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function CampaignsPage({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralData, setReferralData] = useState(null);
  const [joining, setJoining] = useState(null);
  const [tab, setTab] = useState("available");
  const [copied, setCopied] = useState(false);
  const [affiliateReady, setAffiliateReady] = useState(false);

  // Use ref to hold the latest user data (survives async updates)
  const userRef = useRef(null);

  // Initialize user from localStorage
  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "User", role: "affiliate" };
  } catch (e) {
    user = { name: "User", role: "affiliate" };
  }
  userRef.current = user;

  useEffect(() => {
    fetchProducts();
    resolveAffiliateId();
  }, []);

  // Auto-resolve affiliateId: if missing from localStorage, fetch from backend
  const resolveAffiliateId = async () => {
    const currentUser = userRef.current;
    if (currentUser.affiliateId) {
      // Already has affiliateId, just fetch campaigns
      setAffiliateReady(true);
      fetchMyCampaignsFor(currentUser.affiliateId);
      return;
    }

    // affiliateId is missing - try to fetch from backend using user id
    if (currentUser.id) {
      try {
        const res = await fetch(`${API_URL}/api/affiliate-by-user/${currentUser.id}`);
        const data = await res.json();
        if (data.success && data.affiliate) {
          // Update localStorage with the resolved affiliateId
          const updatedUser = {
            ...currentUser,
            affiliateId: data.affiliate.id,
            referralCode: data.affiliate.referral_code,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          userRef.current = updatedUser;
          setAffiliateReady(true);
          fetchMyCampaignsFor(data.affiliate.id);
          console.log("✅ AffiliateId resolved:", data.affiliate.id);
          return;
        }
      } catch (err) {
        console.error("Error resolving affiliate:", err);
      }
    }
    setAffiliateReady(true); // Even if we failed, mark ready to unblock UI
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchMyCampaignsFor = async (affiliateId) => {
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${affiliateId}`);
      const data = await res.json();
      if (data.success) setMyCampaigns(data.campaigns);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  };

  const fetchMyCampaigns = async () => {
    const currentUser = userRef.current;
    if (currentUser.affiliateId) {
      fetchMyCampaignsFor(currentUser.affiliateId);
    }
  };

  const handleJoin = async (product) => {
    const currentUser = userRef.current;
    if (!currentUser.affiliateId) {
      Swal.fire({ icon: "error", title: "Akses Ditolak", text: "Anda belum terdaftar sebagai affiliate. Silakan logout dan login kembali." });
      return;
    }

    setJoining(product.id);
    try {
      const res = await fetch(`${API_URL}/api/campaigns/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliate_id: currentUser.affiliateId,
          product_id: product.id,
          affiliate_name: currentUser.name
        })
      });
      const data = await res.json();
      if (data.success) {
        setReferralData({
          productName: product.name,
          productEmoji: product.image_url || "📦",
          referralCode: data.campaign.referral_code,
          referralLink: data.campaign.referral_link,
          commissionRate: product.commission_rate || 10,
          price: product.price,
          alreadyJoined: data.alreadyJoined
        });
        setShowReferralModal(true);
        fetchMyCampaigns();
      }
    } catch (err) {
      console.error("Error joining:", err);
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal bergabung campaign." });
    } finally {
      setJoining(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (val) => "IDR " + Number(val || 0).toLocaleString("id-ID");

  const joinedProductIds = myCampaigns.map(c => c.product_id);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categoryIcons = {
    "Fashion": <Shirt size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />,
    "Electronics": <Laptop size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />,
    "Health & Beauty": <Sparkles size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />,
    "Home & Living": <Home size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />,
    "Sports & Outdoor": <Tent size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />,
    "Digital": <MonitorSmartphone size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />
  };

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} navigate={navigate} active="campaigns" user={user} />

      <main className="dashboard-main">
        <div className="topbar">
          <h1 className="page-title">Campaigns</h1>
          <div className="topbar-right">
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search Product..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <NotificationIcon navigate={navigate} />
          </div>
        </div>

        {/* Tabs */}
        <div className="campaign-tabs">
          <button className={`campaign-tab ${tab === 'available' ? 'active' : ''}`} onClick={() => setTab('available')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} strokeWidth={1.5} /> Available Products ({products.length})
          </button>
          <button className={`campaign-tab ${tab === 'joined' ? 'active' : ''}`} onClick={() => setTab('joined')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} strokeWidth={1.5} /> My Campaigns ({myCampaigns.length})
          </button>
        </div>

        {tab === 'available' && (
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
                <p>Belum ada produk tersedia. Admin belum menambahkan produk.</p>
              </div>
            ) : (
              filteredProducts.map(product => {
                const isJoined = joinedProductIds.includes(product.id);
                return (
                  <motion.div
                    key={product.id}
                    className={`campaign-card glass-panel ${isJoined ? 'joined' : ''}`}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ scale: 1.02, filter: "brightness(1.05)" }}
                  >
                    <div className="campaign-card-emoji" style={{ color: "var(--primary)", background: "rgba(198, 40, 40, 0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {product.image_url ? (
                        product.image_url.startsWith('http')
                          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '24px' }}>{product.image_url}</span>
                      ) : <Package size={32} strokeWidth={1.5} />}
                    </div>
                    <div className="campaign-card-info" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 className="campaign-card-title">{product.name}</h3>
                      <span className="campaign-card-category" style={{ display: "inline-flex", alignItems: "center", justifySelf: "center", alignSelf: "center" }}>
                        {categoryIcons[product.category] || <Package size={14} strokeWidth={1.5} style={{ marginRight: '4px' }} />} {product.category}
                      </span>
                      <p className="campaign-card-price" style={{ marginTop: "auto" }}>{formatCurrency(product.price)}</p>
                      <p className="campaign-card-commission">
                        <Ticket size={14} strokeWidth={1.5} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Commission: <strong>{product.commission_rate || 10}%</strong>
                      </p>
                    </div>
                    <button
                      className={`btn-join ${isJoined ? 'btn-joined' : ''}`}
                      style={{ boxShadow: '0 4px 12px rgba(198, 40, 40, 0.1)' }}
                      onClick={() => handleJoin(product)}
                      disabled={joining === product.id}
                    >
                      {joining === product.id ? "Joining..." : isJoined ? "View Code" : "Join"}
                    </button>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* My Campaigns */}
        {tab === 'joined' && (
          <motion.div
            className="my-campaigns-list layered-container" style={{ gridTemplateColumns: "1fr" }}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {myCampaigns.length === 0 ? (
              <div className="campaign-empty glass-panel">
                <p>Anda belum bergabung di campaign manapun. Klik "Join" pada produk yang tersedia.</p>
              </div>
            ) : (
              myCampaigns.map(campaign => (
                <motion.div key={campaign.id} className="my-campaign-card glass-panel" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                  <div className="my-campaign-left">
                    <span className="product-emoji-large" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {campaign.image_url ? (
                        campaign.image_url.startsWith('http')
                          ? <img src={campaign.image_url} alt={campaign.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '24px' }}>{campaign.image_url}</span>
                      ) : <Package size={32} strokeWidth={1.5} />}
                    </span>
                    <div>
                      <h3>{campaign.product_name}</h3>
                      <p className="my-campaign-cat">{campaign.category} • {formatCurrency(campaign.price)}</p>
                      <p className="my-campaign-commission">Commission: {campaign.commission_rate || 10}%</p>
                    </div>
                  </div>
                  <div className="my-campaign-right">
                    <div className="referral-code-box" style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.6)" }}>
                      <span className="referral-label">Referral Code:</span>
                      <span className="referral-code" style={{ color: "var(--primary)" }}>{campaign.referral_code}</span>
                      <button className="btn-copy" style={{ background: "white", padding: "6px" }} onClick={() => copyToClipboard(campaign.referral_code)}><Copy size={14} strokeWidth={1.5} /></button>
                    </div>
                    <div className="referral-link-box" style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.6)" }}>
                      <span className="referral-label">Link:</span>
                      <span className="referral-link-text">{campaign.referral_link}</span>
                      <button className="btn-copy" style={{ background: "white", padding: "6px" }} onClick={() => copyToClipboard(campaign.referral_link)}><Copy size={14} strokeWidth={1.5} /></button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Referral Code Modal */}
        {showReferralModal && referralData && (
          <div className="modal-overlay" onClick={() => setShowReferralModal(false)}>
            <div className="referral-modal" onClick={e => e.stopPropagation()}>
              <div className="referral-modal-header">
                <div className="referral-modal-icon-wrapper">
                  <CheckCircle2 size={32} strokeWidth={2.5} />
                </div>
                <h2>{referralData.alreadyJoined ? "Your Referral Info" : "Campaign Joined!"}</h2>
                <p>{referralData.alreadyJoined
                  ? `You are part of the ${referralData.productName} campaign.`
                  : `Congratulations! You've joined the ${referralData.productName} campaign.`
                }</p>
              </div>

              <div className="referral-details-modern">
                <div className="detail-row">
                  <span className="detail-label">Product Name</span>
                  <span className="detail-value">{referralData.productName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Product Price</span>
                  <span className="detail-value">{formatCurrency(referralData.price)}</span>
                </div>
                <div className="detail-row highlight-row">
                  <span className="detail-label">Your Commission</span>
                  <span className="detail-value commission-value">{referralData.commissionRate}%</span>
                </div>
              </div>

              <div className="referral-copy-group">
                <label><Tag size={14} /> Referral Code</label>
                <div className="copy-input-wrapper">
                  <input type="text" readOnly value={referralData.referralCode} />
                  <button className="btn-copy-modern" onClick={() => copyToClipboard(referralData.referralCode)}>
                    {copied ? <Check size={16} color="#27ae60" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="referral-copy-group">
                <label><Link size={14} /> Referral Link</label>
                <div className="copy-input-wrapper">
                  <input type="text" readOnly value={referralData.referralLink} />
                  <button className="btn-copy-modern" onClick={() => copyToClipboard(referralData.referralLink)}>
                    {copied ? <Check size={16} color="#27ae60" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="referral-alert">
                <Sparkles size={16} color="#b8940a" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>Share this code or link with your audience. Every purchase through your link earns you commission!</span>
              </div>

              <button className="btn-close-modal" onClick={() => setShowReferralModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
