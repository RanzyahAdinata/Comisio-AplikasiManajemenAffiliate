import { useState, useEffect } from "react";
import "./CheckoutPage.css";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

// ─── SOLID ICON COMPONENTS ───────────────────────────────
const IconUser = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
  </svg>
);

const IconMail = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const IconPhone = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
  </svg>
);

const IconMapPin = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const IconCart = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.5 6H21l-1.68 8.39a2 2 0 01-1.97 1.61H8.83a2 2 0 01-1.98-1.71L5.5 6zM3 2H1v2h2l3.6 7.59L5.25 14A2 2 0 007 17h14v-2H7.42a.25.25 0 01-.25-.29L8 13h9.5a2 2 0 001.97-1.65L21 5H5.5L5 2.65A1 1 0 004 2H3z"/>
  </svg>
);

const IconShield = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
  </svg>
);

const IconCheckCircle = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const IconCard = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
  </svg>
);

const IconLock = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);

const IconCheck = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </svg>
);

const IconLink = ({ size = 42, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7C4.24 7 2 9.24 2 12s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
  </svg>
);

// ─── MAIN COMPONENT ──────────────────────────────────────
export default function CheckoutPage({ referralCode }) {
  const [step, setStep] = useState("loading");
  const [product, setProduct] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
  });

  const [inputReferral, setInputReferral] = useState(referralCode || "");
  const [discountApplied, setDiscountApplied] = useState(true);

  useEffect(() => {
    if (!referralCode) {
      setErrorMsg("Link referral tidak valid.");
      setStep("error");
      return;
    }
    fetchProductInfo();
  }, [referralCode]);

  const fetchProductInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/buy/${referralCode}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        setCampaign(data.campaign);
        setStep("product");
      } else {
        setErrorMsg(data.message || "Link tidak valid.");
        setStep("error");
      }
    } catch (err) {
      setErrorMsg("Tidak dapat terhubung ke server. Coba beberapa saat lagi.");
      setStep("error");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBuyNow = () => {
    setStep("form");
    setFormErrors([]);
  };

  const handleApplyReferral = (e) => {
    e.preventDefault();
    if (!inputReferral) return;
    window.location.href = `/buy/${inputReferral}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors([]);

    try {
      const res = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referral_code: referralCode,
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          customer_address: form.customer_address,
          product_id: product?.id,
          affiliate_id: campaign?.affiliate_id,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setOrderResult(data.order);
        setStep("success");
      } else if (data.errors) {
        setFormErrors(data.errors);
      } else {
        setFormErrors([data.message || "Terjadi kesalahan."]);
      }
    } catch (err) {
      setFormErrors(["Tidak dapat terhubung ke server. Coba lagi."]);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) =>
    "Rp " + Number(val || 0).toLocaleString("id-ID");

  const getDiscountedPrice = (price) => {
    return discountApplied ? price * 0.9 : price; // 10% discount
  };
  const getDiscountAmount = (price) => {
    return discountApplied ? price * 0.1 : 0;
  };

  // ─── LOADING ─────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div className="co-page">
        <div className="co-card co-card--loading">
          <div className="co-spinner" />
          <p>Memuat informasi produk…</p>
        </div>
      </div>
    );
  }

  // ─── ERROR ────────────────────────────────────────────────
  if (step === "error") {
    return (
      <div className="co-page">
        <div className="co-card co-card--error">
          <div className="co-logo">
            <span className="co-logo-text">BeliDisiniAja</span>
          </div>
          <div className="co-error-icon">
            <IconLink size={48} color="#b0c490" />
          </div>
          <h2>Link Tidak Valid</h2>
          <p>{errorMsg}</p>
          <p className="co-hint">Pastikan Anda menggunakan link yang benar dari penjual.</p>
        </div>
      </div>
    );
  }

  // ─── SUCCESS ──────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="co-page">
        <div className="co-card co-card--success">
          <div className="co-logo">
            <span className="co-logo-text">BeliDisiniAja</span>
          </div>
          <div className="co-success-icon">
            <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="successGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4caf1e"/>
                  <stop offset="100%" stopColor="#d4ac0d"/>
                </linearGradient>
              </defs>
              <circle cx="26" cy="26" r="25" stroke="url(#successGrad)" strokeWidth="2"/>
              <path d="M14 27l8 8 16-16" stroke="url(#successGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Pesanan Berhasil! 🎉</h2>
          <p className="co-success-msg">Terima kasih sudah berbelanja, <strong>{orderResult?.customer_name}</strong>!</p>

          <div className="co-order-summary">
            <div className="co-summary-row">
              <span className="co-summary-label">Produk</span>
              <span className="co-summary-value">{orderResult?.product_name}</span>
            </div>
            <div className="co-summary-row">
              <span className="co-summary-label">No. Pesanan</span>
              <span className="co-summary-value co-order-ref">{orderResult?.order_reference}</span>
            </div>
            <div className="co-summary-row">
              <span className="co-summary-label">Total</span>
              <span className="co-summary-value co-summary-total">{formatCurrency(getDiscountedPrice(orderResult?.amount))}</span>
            </div>
            <div className="co-summary-row">
              <span className="co-summary-label">Email Konfirmasi</span>
              <span className="co-summary-value">{orderResult?.customer_email}</span>
            </div>
          </div>

          <p className="co-hint" style={{ marginTop: "16px" }}>
            Detail pesanan akan dikirimkan melalui email. Penjual akan segera menghubungi Anda.
          </p>

          <div className="co-powered">
            Powered by <span className="co-logo-text" style={{ fontSize: "0.85rem" }}>BeliDisiniAja</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── PRODUCT VIEW ─────────────────────────────────────────
  if (step === "product") {
    return (
      <div className="co-page">
        <div className="co-container">
          <div className="co-header">
            <div className="co-logo">
              <span className="co-logo-text">BeliDisiniAja</span>
            </div>
            <p className="co-header-sub">Halaman Pembelian Produk</p>
          </div>

          <div className="co-card co-card--product">
            <div className="co-product-img">
              {product.image_url ? (
                product.image_url.startsWith("http") ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <span className="co-product-emoji">{product.image_url}</span>
                )
              ) : (
                <span className="co-product-emoji">📦</span>
              )}
            </div>

            <div className="co-product-info">
              <span className="co-product-badge">{product.category}</span>
              <h1 className="co-product-title">{product.name}</h1>

              {product.description && (
                <p className="co-product-desc">{product.description}</p>
              )}

              <div className="co-product-price-row">
                <span className="co-product-price" style={{ textDecoration: 'line-through', color: '#999', fontSize: '1rem', marginRight: '8px' }}>{formatCurrency(product.price)}</span>
                <span className="co-product-price">{formatCurrency(getDiscountedPrice(product.price))}</span>
              </div>

              {campaign?.affiliate_name && (
                <p className="co-seller-info">
                  <IconUser size={14} color="#a0b084" />
                  Dijual oleh <strong>{campaign.affiliate_name}</strong>
                </p>
              )}

              <button className="co-btn-primary" onClick={handleBuyNow}>
                <IconCart size={18} color="#fff" />
                Beli Sekarang — {formatCurrency(getDiscountedPrice(product.price))}
              </button>

              <div className="co-trust-badges">
                <span><IconShield size={13} color="#4caf1e" /> Pembayaran Aman</span>
                <span><IconCheckCircle size={13} color="#4caf1e" /> Terverifikasi</span>
                <span><IconCard size={13} color="#b8940a" /> Berbagai Metode</span>
              </div>
            </div>
          </div>

          <div className="co-powered">
            Powered by <span className="co-logo-text" style={{ fontSize: "0.85rem" }}>BeliDisiniAja</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── FORM CHECKOUT ────────────────────────────────────────
  if (step === "form") {
    return (
      <div className="co-page">
        <div className="co-container">
          <div className="co-header">
            <div className="co-logo">
              <span className="co-logo-text">BeliDisiniAja</span>
            </div>
            <p className="co-header-sub">Lengkapi Data Pemesanan</p>
          </div>

          <div className="co-checkout-layout">
            {/* Order Summary */}
            <div className="co-card co-card--summary">
              <h3 className="co-section-title">Ringkasan Pesanan</h3>

              <div className="co-summary-product">
                <div className="co-summary-product-img">
                  {product.image_url ? (
                    product.image_url.startsWith("http") ? (
                      <img src={product.image_url} alt={product.name} />
                    ) : (
                      <span>{product.image_url}</span>
                    )
                  ) : "📦"}
                </div>
                <div className="co-summary-product-info">
                  <p className="co-summary-product-name">{product.name}</p>
                  <p className="co-summary-product-cat">{product.category}</p>
                </div>
              </div>

              <div className="co-divider" />

              <div className="co-summary-row">
                <span className="co-summary-label">Harga Produk</span>
                <span className="co-summary-value">{formatCurrency(product.price)}</span>
              </div>
              <div className="co-summary-row">
                <span className="co-summary-label">Biaya Pengiriman</span>
                <span className="co-summary-value co-free">Gratis</span>
              </div>

              {discountApplied && (
                <div className="co-summary-row">
                  <span className="co-summary-label" style={{ color: '#C0152E' }}>Diskon Referral (10%)</span>
                  <span className="co-summary-value" style={{ color: '#C0152E' }}>- {formatCurrency(getDiscountAmount(product.price))}</span>
                </div>
              )}

              <div className="co-divider" />

              {/* Referral Input Box */}
              <div className="co-referral-input-box" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Punya Kode Referral Lain?</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={inputReferral}
                    onChange={(e) => setInputReferral(e.target.value)}
                    placeholder="Masukkan kode..."
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                  <button 
                    type="button" 
                    onClick={handleApplyReferral}
                    style={{ background: '#1A3A8C', color: 'white', border: 'none', borderRadius: '6px', padding: '0 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              <div className="co-divider" />

              <div className="co-summary-row co-summary-total-row">
                <span className="co-summary-label">Total Pembayaran</span>
                <span className="co-summary-value co-summary-total">{formatCurrency(getDiscountedPrice(product.price))}</span>
              </div>

              {campaign?.affiliate_name && (
                <p className="co-seller-info" style={{ marginTop: "12px" }}>
                  <IconUser size={14} color="#a0b084" />
                  via <strong>{campaign.affiliate_name}</strong>
                </p>
              )}
            </div>

            {/* Form */}
            <div className="co-card co-card--form">
              <h3 className="co-section-title">Data Pembeli</h3>

              {formErrors.length > 0 && (
                <div className="co-alert co-alert--error">
                  <ul>
                    {formErrors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="co-form">
                <div className="co-form-group">
                  <label htmlFor="co-name">Nama Lengkap *</label>
                  <div className="co-input-wrapper">
                    <span className="co-input-icon"><IconUser size={15} color="#a0b084" /></span>
                    <input
                      id="co-name"
                      type="text"
                      name="customer_name"
                      placeholder="Contoh: Budi Santoso"
                      value={form.customer_name}
                      onChange={handleChange}
                      className="co-input"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="co-form-group">
                  <label htmlFor="co-email">Email *</label>
                  <div className="co-input-wrapper">
                    <span className="co-input-icon"><IconMail size={15} color="#a0b084" /></span>
                    <input
                      id="co-email"
                      type="email"
                      name="customer_email"
                      placeholder="email@contoh.com"
                      value={form.customer_email}
                      onChange={handleChange}
                      className="co-input"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="co-form-group">
                  <label htmlFor="co-phone">Nomor Telepon / WhatsApp *</label>
                  <div className="co-input-wrapper">
                    <span className="co-input-icon"><IconPhone size={15} color="#a0b084" /></span>
                    <input
                      id="co-phone"
                      type="tel"
                      name="customer_phone"
                      placeholder="081234567890"
                      value={form.customer_phone}
                      onChange={handleChange}
                      className="co-input"
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="co-form-group">
                  <label htmlFor="co-address">Alamat Lengkap *</label>
                  <div className="co-input-wrapper co-input-wrapper--textarea">
                    <span className="co-input-icon co-input-icon--top"><IconMapPin size={15} color="#a0b084" /></span>
                    <textarea
                      id="co-address"
                      name="customer_address"
                      placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota, Provinsi"
                      value={form.customer_address}
                      onChange={handleChange}
                      className="co-input co-textarea"
                      rows={3}
                      required
                      autoComplete="street-address"
                    />
                  </div>
                </div>

                <div className="co-form-actions">
                  <button
                    type="button"
                    className="co-btn-secondary"
                    onClick={() => setStep("product")}
                    disabled={submitting}
                  >
                    ← Kembali
                  </button>
                  <button
                    type="submit"
                    className="co-btn-primary co-btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="co-btn-spinner" />
                        Memproses…
                      </>
                    ) : (
                      <>
                        <IconCheck size={16} color="#fff" />
                        Pesan &amp; Bayar — {formatCurrency(getDiscountedPrice(product.price))}
                      </>
                    )}
                  </button>
                </div>

                <p className="co-form-note">
                  <IconLock size={12} color="#94a67e" />{" "}
                  Data Anda aman dan terenkripsi. Dengan menekan tombol di atas, Anda menyetujui pembelian produk ini.
                </p>
              </form>
            </div>
          </div>

          <div className="co-powered">
            Powered by <span className="co-logo-text" style={{ fontSize: "0.85rem" }}>BeliDisiniAja</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
