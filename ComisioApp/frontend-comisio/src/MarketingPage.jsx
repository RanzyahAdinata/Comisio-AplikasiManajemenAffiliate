import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Copy, Check, Smartphone, Camera, ChevronDown, ChevronUp } from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./ManageProduct.css";
import "./CampaignsPage.css";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function MarketingPage({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [copied, setCopied] = useState("");
  const [expandedIds, setExpandedIds] = useState({}); // track which cards are open

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "User", role: "affiliate" };
  } catch (e) {
    user = { name: "User", role: "affiliate" };
  }

  useEffect(() => {
    if (user.affiliateId) fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${user.affiliateId}`);
      const data = await res.json();
      if (data.success) setCampaigns(data.campaigns);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatCurrency = (val) => "IDR " + Number(val || 0).toLocaleString("id-ID");

  const generateWhatsAppText = (campaign) => {
    return `🛍️ *${campaign.product_name}* - ${formatCurrency(campaign.price)}\n\n✅ Berkualitas tinggi\n✅ Harga terjangkau\n✅ Pengiriman cepat\n\n🔗 Beli sekarang: ${campaign.referral_link}\n\nGunakan kode: *${campaign.referral_code}*`;
  };

  const generateInstagramCaption = (campaign) => {
    return `✨ ${campaign.product_name} ✨\n\nDapatkan produk ini dengan harga spesial ${formatCurrency(campaign.price)}!\n\n🔥 Link di bio atau gunakan kode: ${campaign.referral_code}\n\n#${campaign.product_name.replace(/\s+/g, '')} #Comisio #AffiliateMarketing #PromoSpecial`;
  };

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} navigate={navigate} active="marketing" user={user} />

      <main className="dashboard-main">
        <div className="topbar">
          <h1 className="page-title" style={{ fontFamily: "'Montserrat', sans-serif" }}>Marketing Assets</h1>
          <div className="topbar-right">
            <NotificationIcon navigate={navigate} />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="stat-cards" style={{ marginBottom: "20px", alignItems: "stretch" }}>
          <div className="stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <p className="stat-label">Your Campaigns</p>
            <h2 className="stat-value">{campaigns.length}</h2>
            <p className="stat-note">Products to promote</p>
          </div>
          <div className="stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <p className="stat-label">Referral Code</p>
            <h2 className="stat-value" style={{ fontSize: "1rem", fontFamily: "'Courier New'", wordBreak: "break-all" }}>
              {user.referralCode || 'N/A'}
            </h2>
            <p className="stat-note">Your main referral code</p>
          </div>
          <div className="stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <p className="stat-label">Marketing Templates</p>
            <h2 className="stat-value">{campaigns.length * 2}</h2>
            <p className="stat-note">Ready to use</p>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ color: "#999", fontSize: "0.88rem" }}>
              You haven't joined any campaign yet.
              <span className="stat-link" style={{ cursor: "pointer", marginLeft: "6px" }} onClick={() => navigate("campaigns")}>
                Join a Campaign →
              </span>
            </p>
          </div>
        ) : (
          <motion.div
            className="layered-container"
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {campaigns.map(campaign => {
              const isOpen = !!expandedIds[campaign.id];
              return (
                <motion.div
                  key={campaign.id}
                  className="glass-panel"
                  style={{ padding: "0", overflow: "hidden", borderRadius: "16px" }}
                  variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                >
                  {/* ── Header Row (always visible) ── */}
                  <div
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "18px 20px", cursor: "pointer", userSelect: "none",
                      borderBottom: isOpen ? "1px solid rgba(0,0,0,0.06)" : "none",
                      transition: "border-bottom 0.2s"
                    }}
                    onClick={() => toggleExpand(campaign.id)}
                  >
                    {/* Product Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        background: "rgba(198, 40, 40, 0.07)", color: "var(--primary)",
                        width: "52px", height: "52px", borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                        flexShrink: 0
                      }}>
                        {campaign.image_url ? (
                          campaign.image_url.startsWith('http')
                            ? <img src={campaign.image_url} alt={campaign.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '24px' }}>{campaign.image_url}</span>
                        ) : <Package size={28} strokeWidth={1.5} />}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "'Montserrat'", fontWeight: 800, margin: "0 0 3px", color: "var(--text-dark)", fontSize: "0.97rem" }}>
                          {campaign.product_name}
                        </h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-gray)", margin: 0 }}>
                          {campaign.category} · {formatCurrency(campaign.price)} · Commission: <span style={{ color: "var(--primary)", fontWeight: 700 }}>{campaign.commission_rate}%</span>
                        </p>
                      </div>
                    </div>

                    {/* Toggle button */}
                    <button
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        background: isOpen ? "rgba(198,40,40,0.08)" : "rgba(0,0,0,0.05)",
                        border: "none", borderRadius: "20px", padding: "6px 14px",
                        fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                        color: isOpen ? "var(--primary)" : "#666",
                        transition: "all 0.2s", whiteSpace: "nowrap"
                      }}
                    >
                      {isOpen ? <><ChevronUp size={15} /> Hide Assets</> : <><ChevronDown size={15} /> View Assets</>}
                    </button>
                  </div>

                  {/* ── Expandable Asset Panel ── */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>

                          {/* Referral Code & Link */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div style={{ background: "rgba(198,40,40,0.05)", border: "1px solid rgba(198,40,40,0.1)", borderRadius: "12px", padding: "14px" }}>
                              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-gray)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Referral Code</p>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontFamily: "'Courier New'", fontWeight: 800, color: "var(--primary)", fontSize: "1.05rem" }}>
                                  {campaign.referral_code}
                                </span>
                                <button className="btn-copy" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", padding: 0 }} onClick={() => copyToClipboard(campaign.referral_code, `code-${campaign.id}`)}>
                                  {copied === `code-${campaign.id}` ? <Check size={16} color="var(--primary)" /> : <Copy size={16} strokeWidth={1.5} />}
                                </button>
                              </div>
                            </div>
                            <div style={{ background: "rgba(26,58,140,0.05)", border: "1px solid rgba(26,58,140,0.1)", borderRadius: "12px", padding: "14px" }}>
                              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-gray)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Referral Link</p>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.73rem", color: "#1A3A8C", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "170px" }}>
                                  {campaign.referral_link}
                                </span>
                                <button className="btn-copy" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", padding: 0 }} onClick={() => copyToClipboard(campaign.referral_link, `link-${campaign.id}`)}>
                                  {copied === `link-${campaign.id}` ? <Check size={16} color="#1A3A8C" /> : <Copy size={16} strokeWidth={1.5} />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* WhatsApp & Instagram Templates */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {/* WhatsApp */}
                            <div style={{ background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.65)", borderRadius: "12px", padding: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#25D366", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <Smartphone size={15} /> WhatsApp Template
                                </span>
                                <button className="btn-copy" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => copyToClipboard(generateWhatsAppText(campaign), `wa-${campaign.id}`)}>
                                  {copied === `wa-${campaign.id}` ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                                </button>
                              </div>
                              <pre style={{ fontSize: "0.71rem", color: "var(--text-dark)", whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.65)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.8)", fontFamily: "inherit", lineHeight: "1.55", margin: 0, maxHeight: "120px", overflow: "auto" }}>
                                {generateWhatsAppText(campaign)}
                              </pre>
                            </div>

                            {/* Instagram */}
                            <div style={{ background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.65)", borderRadius: "12px", padding: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#E4405F", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <Camera size={15} /> Instagram Caption
                                </span>
                                <button className="btn-copy" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => copyToClipboard(generateInstagramCaption(campaign), `ig-${campaign.id}`)}>
                                  {copied === `ig-${campaign.id}` ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                                </button>
                              </div>
                              <pre style={{ fontSize: "0.71rem", color: "var(--text-dark)", whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.65)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.8)", fontFamily: "inherit", lineHeight: "1.55", margin: 0, maxHeight: "120px", overflow: "auto" }}>
                                {generateInstagramCaption(campaign)}
                              </pre>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
