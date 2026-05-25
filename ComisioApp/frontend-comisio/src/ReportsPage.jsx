import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, BarChart2, Lightbulb, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./ManageProduct.css";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function ReportsPage({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    walletBalance: 0,
    pendingCommissions: 0,
    totalClicks: 0,
    totalSales: 0,
    activeCampaigns: 0,
    clicksChart: null
  });
  const [campaigns, setCampaigns] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "User", role: "affiliate" };
  } catch (e) {
    user = { name: "User", role: "affiliate" };
  }

  useEffect(() => {
    if (user.affiliateId) {
      fetchStats();
      fetchCampaigns();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/affiliate/${user.affiliateId}`);
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${user.affiliateId}`);
      const data = await res.json();
      if (data.success) setCampaigns(data.campaigns);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  };

  const formatCurrency = (val) => "IDR " + Number(val || 0).toLocaleString("id-ID");

  // Real-time monthly clicks from backend
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-based
  const chartYear = stats?.clicksChart?.year || now.getFullYear();
  const clickLabels = stats?.clicksChart?.labels || MONTH_NAMES.slice(0, currentMonth + 1);
  const clickValues = stats?.clicksChart?.values || clickLabels.map(() => 0);
  const maxClicks = Math.max(...clickValues, 1);

  const generatePDF = async () => {
    setIsGenerating(true);
    let pdfStats = { ...stats };
    let pdfCampaigns = [ ...campaigns ];

    try {
      const statsRes = await fetch(`${API_URL}/api/dashboard/affiliate/${user.affiliateId}`);
      const statsData = await statsRes.json();
      if (statsData.success) pdfStats = statsData.stats;

      const campRes = await fetch(`${API_URL}/api/campaigns/${user.affiliateId}`);
      const campData = await campRes.json();
      if (campData.success) pdfCampaigns = campData.campaigns;
    } catch (e) {
      console.error("Failed to fetch fresh data for PDF:", e);
    }

    const doc = new jsPDF({ format: 'a4' });
    const currentDate = new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' });

    // --- Header Background ---
    doc.setFillColor(192, 21, 46); // #C0152E
    doc.rect(0, 0, 210, 45, 'F');

    // --- Header Text ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text("Comis.io", 14, 20);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.text("Affiliate Performance Report", 14, 32);

    // --- Affiliate Info Box ---
    doc.setFillColor(245, 247, 250);
    doc.rect(14, 55, 182, 25, 'F');
    doc.setDrawColor(220, 225, 230);
    doc.rect(14, 55, 182, 25, 'S');

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Report Date:`, 20, 64);
    doc.text(`Affiliate Name:`, 20, 72);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(`${currentDate}`, 50, 64);
    doc.text(`${user.name}`, 50, 72);

    // --- Performance Summary ---
    doc.setFontSize(16);
    doc.setTextColor(26, 58, 140); // Blue Theme for headings
    doc.text("Performance Summary", 14, 95);

    const conversionRate = pdfStats.totalClicks > 0 ? ((pdfStats.totalSales / pdfStats.totalClicks) * 100).toFixed(1) : 0;

    autoTable(doc, {
      startY: 100,
      head: [['Metric', 'Value']],
      body: [
        ['Total Clicks', String(pdfStats.totalClicks || 0)],
        ['Total Sales', String(pdfStats.totalSales || 0)],
        ['Conversion Rate', `${conversionRate}%`],
        ['Active Campaigns', String(pdfStats.activeCampaigns || 0)],
        ['Wallet Balance', formatCurrency(pdfStats.walletBalance)],
        ['Pending Commissions', formatCurrency(pdfStats.pendingCommissions)],
      ],
      theme: 'plain',
      headStyles: { fillColor: [240, 242, 245], textColor: [100, 100, 100], fontStyle: 'bold' },
      bodyStyles: { borderBottomColor: [230, 230, 230], borderBottomWidth: 0.5 },
      styles: { fontSize: 11, cellPadding: 6 },
      alternateRowStyles: { fillColor: [252, 253, 255] }
    });

    // --- Campaigns Table ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 58, 140);
    doc.text("Active Campaigns", 14, doc.lastAutoTable.finalY + 20);

    if (pdfCampaigns && pdfCampaigns.length > 0) {
      const tableData = pdfCampaigns.map(c => [
        c.product_name,
        c.category || '-',
        `${c.commission_rate || 0}%`,
        c.referral_code
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 25,
        head: [['Product Name', 'Category', 'Commission', 'Referral Code']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 58, 140], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        alternateRowStyles: { fillColor: [245, 247, 250] }
      });
    } else {
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 120, 120);
      doc.text("No active campaigns found.", 14, doc.lastAutoTable.finalY + 30);
    }

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated by Comis.io | Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    const safeName = (user?.name || 'Affiliator').replace(/\s+/g, '_');
    const fileName = `Comisio_Report_${safeName}_${new Date().getTime()}.pdf`;
    
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsGenerating(false);
  };

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} navigate={navigate} active="reports" user={user} />

      <main className="dashboard-main">
        <div className="topbar">
          <h1 className="page-title">Reports</h1>
          <div className="topbar-right">
            <button 
              onClick={generatePDF} 
              disabled={isGenerating}
              className="btn-add-product" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isGenerating ? '#999' : '#1A3A8C', opacity: isGenerating ? 0.7 : 1, cursor: isGenerating ? 'wait' : 'pointer' }}
            >
              <Download size={16} /> {isGenerating ? "Generating..." : "Download PDF"}
            </button>
            <NotificationIcon navigate={navigate} />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stat-cards" style={{ marginBottom: "20px" }}>
          <div className="stat-card">
            <p className="stat-label">Total Clicks</p>
            <h2 className="stat-value">{stats.totalClicks}</h2>
            <p className="stat-note">From all referral links</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Sales</p>
            <h2 className="stat-value">{stats.totalSales}</h2>
            <p className="stat-note">Completed transactions</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Active Campaigns</p>
            <h2 className="stat-value">{stats.activeCampaigns}</h2>
            <p className="stat-note">Products promoted</p>
          </div>
        </div>

        <div className="stat-cards" style={{ marginBottom: "20px" }}>
          <div className="stat-card">
            <p className="stat-label">Conversion Rate</p>
            <h2 className="stat-value">
              {stats.totalClicks > 0 ? ((stats.totalSales / stats.totalClicks) * 100).toFixed(1) : 0}%
            </h2>
            <p className="stat-note">Clicks to sales ratio</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Wallet Balance</p>
            <h2 className="stat-value" style={{ fontSize: "1.2rem" }}>{formatCurrency(stats.walletBalance)}</h2>
            <p className="stat-note">Available for payout</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Pending Commissions</p>
            <h2 className="stat-value" style={{ fontSize: "1.2rem", color: "#f57f17" }}>{formatCurrency(stats.pendingCommissions)}</h2>
            <p className="stat-note">Awaiting approval</p>
          </div>
        </div>

        {/* Monthly Performance Chart */}
        <div className="dashboard-bottom">
          <div className="charts-col">
            <div className="chart-card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <p style={{ textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.62rem", color: "#aaa", fontWeight: 700, margin: 0 }}>
                  Monthly Clicks
                </p>
                <span style={{ fontSize: "0.62rem", color: "#C0152E", fontWeight: 600 }}>{chartYear}</span>
              </div>

              {/* Compact pill chart */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "6px", height: "56px" }}>
                {clickLabels.map((label, i) => {
                  const isPeak = i === clickValues.indexOf(Math.max(...clickValues));
                  const isLatest = i === clickLabels.length - 1;
                  const pct = maxClicks > 0 ? (clickValues[i] / maxClicks) * 100 : 10;
                  const h = Math.max(pct, 12);
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", flex: 1 }}>
                      <span style={{ fontSize: "0.55rem", fontWeight: isPeak ? 700 : 500, color: isPeak ? "#C0152E" : "#bbb" }}>{clickValues[i]}</span>
                      <div style={{
                        width: "14px", height: `${h}%`, minHeight: "6px",
                        borderRadius: "6px",
                        background: isPeak
                          ? "linear-gradient(180deg, #C0152E, rgba(192,21,46,0.55))"
                          : "linear-gradient(180deg, #ccc, #e4e4e4)",
                        transition: "height 0.4s ease"
                      }} />
                    </div>
                  );
                })}
              </div>

              {/* Month labels + dot */}
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "4px" }}>
                {clickLabels.map((label, i) => {
                  const isLatest = i === clickLabels.length - 1;
                  return (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      {isLatest && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#C0152E", margin: "0 auto 2px" }} />}
                      <span style={{ fontSize: "0.5rem", fontWeight: isLatest ? 700 : 400, color: isLatest ? "#C0152E" : "#bbb" }}>{label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total clicks summary */}
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.58rem", color: "#aaa" }}>Total Clicks</span>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#333" }}>{clickValues.reduce((a, b) => a + b, 0)}</span>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <p className="chart-label">Campaign Performance</p>
              </div>
              <div style={{ marginTop: "12px" }}>
                {campaigns.length === 0 ? (
                  <p style={{ color: "#999", fontSize: "0.85rem" }}>No active campaigns yet.</p>
                ) : (
                  <table className="admin-table-mini glass-panel" style={{ width: "100%", overflow: "hidden", borderSpacing: 0 }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Commission</th>
                        <th>Referral Code</th>
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
                      {campaigns.map((c, i) => (
                        <motion.tr key={i} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                          <td style={{ fontWeight: 700 }}>{c.product_name}</td>
                          <td>{c.category}</td>
                          <td>{c.commission_rate}%</td>
                          <td><code style={{ background: "rgba(198,40,40,0.05)", border: "1px solid rgba(198,40,40,0.2)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", color: "var(--primary)" }}>{c.referral_code}</code></td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="leaderboard-card">
            <h3 className="leaderboard-title">Performance Tips</h3>
            <div className="leaderboard-list">
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={14} /> Share More</p>
                  <p className="lb-sold">Share referral links on social media to increase clicks</p>
                </div>
              </div>
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={14} /> Target Audience</p>
                  <p className="lb-sold">Focus on products that match your audience interest</p>
                </div>
              </div>
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BarChart2 size={14} /> Track Results</p>
                  <p className="lb-sold">Monitor which campaigns perform best</p>
                </div>
              </div>
              <div className="leaderboard-item">
                <div className="lb-info">
                  <p className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={14} /> Create Content</p>
                  <p className="lb-sold">Write reviews and create content about products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
