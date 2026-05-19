import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import "./LoginPage.css";

import logoComis from "./assets/Logo_merah.png";
import heroImage from "./assets/foto_Login.jpg";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function ForgotPasswordPage({ navigate }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email) {
      setError("Email harus diisi!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Simpan email ke sessionStorage untuk digunakan di halaman reset password
        sessionStorage.setItem("resetEmail", email);
        navigate("reset-password");
      } else {
        setError(data.message || "Email tidak terdaftar.");
      }
    } catch (err) {
      setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Panel Kiri: Gambar Hero */}
      <div className="login-image-panel">
        <img 
          src={heroImage} 
          alt="Login Hero" 
          className="hero-img-fill" 
        />
      </div>

      {/* Panel Kanan: Form */}
      <div className="login-form-panel">
        <div className="login-logo">
          <img 
            src={logoComis} 
            alt="Comis.io Logo" 
            style={{ height: "45px", cursor: "pointer" }} 
            onClick={() => navigate("landing")} 
          />
        </div>

        <div className="login-form-container">
          <h2 className="login-title" style={{ fontSize: "2rem", marginBottom: "10px", textAlign: "left" }}>Forgot your password?</h2>
          <p style={{ color: "#666", textAlign: "left", marginBottom: "30px", fontSize: "0.9rem" }}>
            Enter your email so that we can send you password reset link
          </p>

          <div className="login-form">
            {error && <div className="alert alert-error">{error}</div>}
            
            <div className="input-group input-with-icon" style={{ marginBottom: "20px" }}>
              <span className="input-icon"><Mail size={18} /></span>
              <input 
                type="email" 
                name="email" 
                placeholder="Email"
                value={email} 
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="form-input" 
                disabled={loading} 
              />
            </div>

            <button className="btn-submit" onClick={handleSubmit} disabled={loading} style={{ marginBottom: "20px" }}>
              {loading ? "Memproses..." : "Send Email"}
            </button>

            <div style={{ textAlign: "center" }}>
              <p className="link" onClick={() => navigate("login")} style={{ display: "inline-flex", alignItems: "center", gap: "5px", cursor: "pointer", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>
                <ArrowLeft size={16} /> Back to Login
              </p>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <span>Terms and conditions</span> | <span>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}
