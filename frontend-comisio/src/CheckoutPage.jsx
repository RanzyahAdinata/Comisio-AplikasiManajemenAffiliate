import { useState, useEffect } from "react";
import "./CheckoutPage.css";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function CheckoutPage({ referralCode }) {
  const [step, setStep] = useState("loading"); // loading | product | form | success | error
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

  // ─── LOADING ────────────────────────────────────────
  if (step === "loading") {
    return (
      <div className="co-page">
        <div className="co-bg-blur co-bg-blur--1" />
        <div className="co-bg-blur co-bg-blur--2" />
        <div className="co-card co-card--loading">
          <div className="co-spinner" />
          <p>Memuat informasi produk…</p>
        </div>
      </div>
    );
  }

  // ─── ERROR ───────────────────────────────────────────
  if (step === "error") {
    return (
      <div className="co-page">
        <div className="co-bg-blur co-bg-blur--1" />
        <div className="co-bg-blur co-bg-blur--2" />
        <div className="co-card co-card--error">
          <div className="co-logo">
            <span className="co-logo-text">Comis</span>
            <span className="co-logo-badge">.io</span>
          </div>
          <div className="co-error-icon">🔗</div>
          <h2>Link Tidak Valid</h2>
          <p>{errorMsg}</p>
          <p className="co-hint">Pastikan Anda menggunakan link yang benar dari penjual.</p>
        </div>
      </div>
    );
  }

  // ─── SUCCESS ──────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="co-page">
        <div className="co-bg-blur co-bg-blur--1" />
        <div className="co-bg-blur co-bg-blur--2" />
        <div className="co-card co-card--success">
          <div className="co-logo">
            <span className="co-logo-text">Comis</span>
            <span className="co-logo-badge">.io</span>
          </div>
          <div className="co-success-icon">
            <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="26" cy="26" r="25" stroke="#22c55e" strokeWidth="2"/>
              <path d="M14 27l8 8 16-16" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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
              <span className="co-summary-value co-summary-total">{formatCurrency(orderResult?.amount)}</span>
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
            Powered by <span className="co-logo-text" style={{ fontSize: "0.9rem" }}>Comis</span><span className="co-logo-badge" style={{ fontSize: "0.75rem", padding: "0 4px" }}>.io</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── PRODUCT VIEW ─────────────────────────────────────
  if (step === "product") {
    return (
      <div className="co-page">
        <div className="co-bg-blur co-bg-blur--1" />
        <div className="co-bg-blur co-bg-blur--2" />

        <div className="co-container">
          {/* Header */}
          <div className="co-header">
            <div className="co-logo">
              <span className="co-logo-text">Comis</span>
              <span className="co-logo-badge">.io</span>
            </div>
            <p className="co-header-sub">Halaman Pembelian Produk</p>
          </div>

          {/* Product Card */}
          <div className="co-card co-card--product">
            {/* Product Image */}
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

            {/* Product Info */}
            <div className="co-product-info">
              <span className="co-product-badge">{product.category}</span>
              <h1 className="co-product-title">{product.name}</h1>

              {product.description && (
                <p className="co-product-desc">{product.description}</p>
              )}

              <div className="co-product-price-row">
                <span className="co-product-price">{formatCurrency(product.price)}</span>
              </div>

              {campaign?.affiliate_name && (
                <p className="co-seller-info">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Dijual oleh <strong>{campaign.affiliate_name}</strong>
                </p>
              )}

              <button className="co-btn-primary" onClick={handleBuyNow}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Beli Sekarang — {formatCurrency(product.price)}
              </button>

              <div className="co-trust-badges">
                <span>🔒 Pembayaran Aman</span>
                <span>✅ Terverifikasi</span>
                <span>💳 Berbagai Metode</span>
              </div>
            </div>
          </div>

          <div className="co-powered">
            Powered by <span className="co-logo-text" style={{ fontSize: "0.9rem" }}>Comis</span><span className="co-logo-badge" style={{ fontSize: "0.75rem", padding: "0 4px" }}>.io</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── FORM CHECKOUT ────────────────────────────────────
  if (step === "form") {
    return (
      <div className="co-page">
        <div className="co-bg-blur co-bg-blur--1" />
        <div className="co-bg-blur co-bg-blur--2" />

        <div className="co-container">
          {/* Header */}
          <div className="co-header">
            <div className="co-logo">
              <span className="co-logo-text">Comis</span>
              <span className="co-logo-badge">.io</span>
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

              <div className="co-divider" />

              <div className="co-summary-row co-summary-total-row">
                <span className="co-summary-label">Total Pembayaran</span>
                <span className="co-summary-value co-summary-total">{formatCurrency(product.price)}</span>
              </div>

              {campaign?.affiliate_name && (
                <p className="co-seller-info" style={{ marginTop: "12px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
                    <svg className="co-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
                    <svg className="co-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
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
                    <svg className="co-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 15.92z"/></svg>
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
                    <svg className="co-input-icon co-input-icon--top" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Pesan & Bayar — {formatCurrency(product.price)}
                      </>
                    )}
                  </button>
                </div>

                <p className="co-form-note">
                  🔒 Data Anda aman dan terenkripsi. Dengan menekan tombol di atas, Anda menyetujui pembelian produk ini.
                </p>
              </form>
            </div>
          </div>

          <div className="co-powered">
            Powered by <span className="co-logo-text" style={{ fontSize: "0.9rem" }}>Comis</span><span className="co-logo-badge" style={{ fontSize: "0.75rem", padding: "0 4px" }}>.io</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
