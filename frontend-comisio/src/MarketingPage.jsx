import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Copy, Check, Smartphone, Camera, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./ManageProduct.css";
import "./CampaignsPage.css";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function MarketingPage({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [copied, setCopied] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);

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

  const toggleExpand = (id) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
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
          <h1 className="page-title">Marketing Assets</h1>
          <div className="topbar-right">
            <NotificationIcon navigate={navigate} />
          </div>
        </div>

        {/* Info Section */}
        <div className="glass-panel" style={{ padding: "20px", marginBottom: "24px", borderLeft: "4px solid var(--primary)" }}>
          <h3 style={{ fontSize: "1rem", margin: "0 0 8px", color: "var(--primary)" }}>💡 Apa itu Kode Referral?</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-gray)", margin: 0, lineHeight: "1.6" }}>
            Kode referral adalah identitas unik Anda. Saat pembeli menggunakan kode Anda, mereka akan mendapatkan <strong>potongan harga 5%</strong> secara otomatis, dan sistem akan mencatat transaksi tersebut sebagai milik Anda sehingga komisi langsung masuk ke dompet Anda.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ color: "#999", fontSize: "0.88rem" }}>
              Anda belum bergabung di campaign manapun.
              <span className="stat-link" style={{ cursor: "pointer", marginLeft: "6px" }} onClick={() => navigate("campaigns")}>
                Bergabunglah di Campaign →
              </span>
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {campaigns.map(campaign => {
              const isExpanded = expandedIds.includes(campaign.id);
              return (
                <div 
                  key={campaign.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: "16px 20px", 
                    transition: "all 0.3s ease",
                    border: isExpanded ? "1px solid rgba(192, 21, 46, 0.2)" : "1px solid rgba(255,255,255,0.5)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                      <div style={{ background: "rgba(198, 40, 40, 0.05)", color: "var(--primary)", width: "45px", height: "45px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                        {campaign.image_url ? (
                          campaign.image_url.startsWith('http') 
                            ? <img src={campaign.image_url} alt={campaign.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> 
                            : <span style={{fontSize: '20px'}}>{campaign.image_url}</span>
                        ) : <Package size={24} strokeWidth={1.5} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 2px", color: "var(--text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {campaign.product_name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1A3A8C" }}>
                          <LinkIcon size={12} />
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {campaign.referral_link}
                          </span>
                          <button 
                            className="btn-copy" 
                            style={{ background: "none", border: "none", padding: "4px", color: "#1A3A8C", cursor: "pointer", display: "flex" }}
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(campaign.referral_link, `link-${campaign.id}`); }}
                          >
                            {copied === `link-${campaign.id}` ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => toggleExpand(campaign.id)}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px", 
                        padding: "8px 14px", 
                        fontSize: "0.8rem", 
                        borderRadius: "8px", 
                        border: "1px solid #ddd",
                        background: isExpanded ? "rgba(192, 21, 46, 0.05)" : "#fff",
                        color: isExpanded ? "var(--primary)" : "#555",
                        fontWeight: 600,
                        cursor: "pointer",
                        marginLeft: "20px"
                      }}
                    >
                      {isExpanded ? (
                        <><ChevronUp size={16} /> Hide Details</>
                      ) : (
                        <><ChevronDown size={16} /> View Assets</>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ paddingTop: "20px", marginTop: "16px", borderTop: "1px dashed #eee" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ background: "rgba(198,40,40,0.05)", border: "1px solid rgba(198,40,40,0.1)", borderRadius: "12px", padding: "14px" }}>
                              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-gray)", marginBottom: "6px" }}>REFERRAL CODE</p>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontFamily: "'Courier New'", fontWeight: 800, color: "var(--primary)", fontSize: "1.1rem" }}>
                                  {campaign.referral_code}
                                </span>
                                <button className="btn-copy" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", padding: 0 }} onClick={() => copyToClipboard(campaign.referral_code, `code-${campaign.id}`)}>
                                  {copied === `code-${campaign.id}` ? <Check size={16} color="var(--primary)" /> : <Copy size={16} strokeWidth={1.5} />}
                                </button>
                              </div>
                            </div>
                            <div style={{ background: "#f8f9fa", border: "1px solid #eee", borderRadius: "12px", padding: "14px" }}>
                              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-gray)", marginBottom: "6px" }}>PRODUCT PRICE</p>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "1rem" }}>
                                  {formatCurrency(campaign.price)}
                                </span>
                                <span style={{ fontSize: "0.7rem", color: "var(--primary)", background: "rgba(192,21,46,0.1)", padding: "2px 8px", borderRadius: "20px", fontWeight: 700 }}>
                                  {campaign.commission_rate}% Commission
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "12px", padding: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#25D366", display: "flex", alignItems: "center", gap: "6px" }}><Smartphone size={16} /> WhatsApp Template</span>
                                <button className="btn-copy" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => copyToClipboard(generateWhatsAppText(campaign), `wa-${campaign.id}`)}>
                                  {copied === `wa-${campaign.id}` ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                                </button>
                              </div>
                              <pre style={{ fontSize: "0.72rem", color: "var(--text-dark)", whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.6)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.8)", fontFamily: "inherit", lineHeight: "1.5", margin: 0, maxHeight: "100px", overflow: "auto" }}>
                                {generateWhatsAppText(campaign)}
                              </pre>
                            </div>

                            <div style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "12px", padding: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#E4405F", display: "flex", alignItems: "center", gap: "6px" }}><Camera size={16} /> Instagram Caption</span>
                                <button className="btn-copy" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => copyToClipboard(generateInstagramCaption(campaign), `ig-${campaign.id}`)}>
                                  {copied === `ig-${campaign.id}` ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                                </button>
                              </div>
                              <pre style={{ fontSize: "0.72rem", color: "var(--text-dark)", whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.6)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.8)", fontFamily: "inherit", lineHeight: "1.5", margin: 0, maxHeight: "100px", overflow: "auto" }}>
                                {generateInstagramCaption(campaign)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
