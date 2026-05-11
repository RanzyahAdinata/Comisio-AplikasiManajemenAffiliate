import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Copy, Check, Smartphone, Camera, Share2 } from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./ManageProduct.css";
import "./CampaignsPage.css";

const API_URL = "https://comisio-app.vercel.app";

export default function MarketingPage({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [copied, setCopied] = useState("");

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

  const formatCurrency = (val) => "IDR " + Number(val || 0).toLocaleString("id-ID");

  // Generate sample marketing text
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

        {/* Marketing Info */}
        <div className="stat-cards" style={{ marginBottom: "20px" }}>
          <div className="stat-card">
            <p className="stat-label">Your Campaigns</p>
            <h2 className="stat-value">{campaigns.length}</h2>
            <p className="stat-note">Products to promote</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Referral Code</p>
            <h2 className="stat-value" style={{ fontSize: "1rem", fontFamily: "'Courier New'" }}>
              {user.referralCode || 'N/A'}
            </h2>
            <p className="stat-note">Your main referral code</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Marketing Templates</p>
            <h2 className="stat-value">{campaigns.length * 2}</h2>
            <p className="stat-note">Ready to use</p>
          </div>
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
          <motion.div 
            className="layered-container" style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {campaigns.map(campaign => (
              <motion.div 
                key={campaign.id} 
                className="glass-panel" 
                style={{ padding: "24px" }}
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ background: "rgba(198, 40, 40, 0.05)", color: "var(--primary)", width: "60px", height: "60px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {campaign.image_url ? (
                      campaign.image_url.startsWith('http') 
                        ? <img src={campaign.image_url} alt={campaign.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> 
                        : <span style={{fontSize: '24px'}}>{campaign.image_url}</span>
                    ) : <Package size={32} strokeWidth={1.5} />}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Montserrat'", fontWeight: 800, margin: "0 0 4px", color: "var(--text-dark)" }}>
                      {campaign.product_name}
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-gray)", margin: 0 }}>
                      {campaign.category} • {formatCurrency(campaign.price)} • Commission: <span style={{ color: "var(--primary)", fontWeight: 700 }}>{campaign.commission_rate}%</span>
                    </p>
                  </div>
                </div>

                {/* Referral Links */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
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
                  <div style={{ background: "rgba(26,58,140,0.05)", border: "1px solid rgba(26,58,140,0.1)", borderRadius: "12px", padding: "14px" }}>
                    <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-gray)", marginBottom: "6px" }}>REFERRAL LINK</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.75rem", color: "#1A3A8C", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                        {campaign.referral_link}
                      </span>
                      <button className="btn-copy" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", padding: 0 }} onClick={() => copyToClipboard(campaign.referral_link, `link-${campaign.id}`)}>
                        {copied === `link-${campaign.id}` ? <Check size={16} color="#1A3A8C" /> : <Copy size={16} strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Marketing Templates */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {/* WhatsApp Template */}
                  <div style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#25D366", display: "flex", alignItems: "center", gap: "6px" }}><Smartphone size={16} /> WhatsApp Template</span>
                      <button className="btn-copy" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => copyToClipboard(generateWhatsAppText(campaign), `wa-${campaign.id}`)}>
                        {copied === `wa-${campaign.id}` ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                      </button>
                    </div>
                    <pre style={{
                      fontSize: "0.72rem", color: "var(--text-dark)", whiteSpace: "pre-wrap",
                      background: "rgba(255,255,255,0.6)", padding: "12px", borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.8)", fontFamily: "inherit", lineHeight: "1.5",
                      margin: 0, maxHeight: "120px", overflow: "auto"
                    }}>
                      {generateWhatsAppText(campaign)}
                    </pre>
                  </div>

                  {/* Instagram Template */}
                  <div style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#E4405F", display: "flex", alignItems: "center", gap: "6px" }}><Camera size={16} /> Instagram Caption</span>
                      <button className="btn-copy" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => copyToClipboard(generateInstagramCaption(campaign), `ig-${campaign.id}`)}>
                        {copied === `ig-${campaign.id}` ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                      </button>
                    </div>
                    <pre style={{
                      fontSize: "0.72rem", color: "var(--text-dark)", whiteSpace: "pre-wrap",
                      background: "rgba(255,255,255,0.6)", padding: "12px", borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.8)", fontFamily: "inherit", lineHeight: "1.5",
                      margin: 0, maxHeight: "120px", overflow: "auto"
                    }}>
                      {generateInstagramCaption(campaign)}
                    </pre>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
