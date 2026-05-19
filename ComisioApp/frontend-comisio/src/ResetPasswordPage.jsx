import { useState, useEffect } from "react";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import "./LoginPage.css";

import logoComis from "./assets/Logo_merah.png";
import heroImage from "./assets/foto_Login.jpg";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function ResetPasswordPage({ navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("resetEmail");
    if (!savedEmail) {
      // Jika tidak ada email, arahkan kembali ke halaman forgot password
      navigate("forgot-password");
    } else {
      setEmail(savedEmail);
    }
  }, [navigate]);

  const handleSubmit = async () => {
    setError("");
    
    if (!password || !confirmPassword) {
      setError("Semua field password harus diisi!");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        sessionStorage.removeItem("resetEmail");
      } else {
        setError(data.message || "Gagal mereset password.");
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
          {success ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <CheckCircle size={60} color="#ff4f2a" style={{ margin: "0 auto 20px" }} />
              <h2 className="login-title" style={{ fontSize: "2rem", marginBottom: "15px" }}>Password Reset!</h2>
              <p style={{ color: "#666", marginBottom: "30px", fontSize: "1rem" }}>
                Your password has been successfully reset. You can now login with your new password.
              </p>
              <button className="btn-submit" onClick={() => navigate("login")}>
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="login-title" style={{ fontSize: "2rem", marginBottom: "30px", textAlign: "center" }}>Reset password</h2>

              <div className="login-form">
                {error && <div className="alert alert-error">{error}</div>}
                
                <div style={{ marginBottom: "15px", textAlign: "left" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: "600", color: "#333" }}>New password</label>
                  <div className="input-group input-with-icon" style={{ margin: 0 }}>
                    <span className="input-icon"><Lock size={18} /></span>
                    <input 
                      type="password" 
                      name="password" 
                      placeholder="Enter new password"
                      value={password} 
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      className="form-input" 
                      disabled={loading} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "25px", textAlign: "left" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: "600", color: "#333" }}>Confirm password</label>
                  <div className="input-group input-with-icon" style={{ margin: 0 }}>
                    <span className="input-icon"><Lock size={18} /></span>
                    <input 
                      type="password" 
                      name="confirmPassword" 
                      placeholder="Confirm your password"
                      value={confirmPassword} 
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      className="form-input" 
                      disabled={loading} 
                    />
                  </div>
                </div>

                <button className="btn-submit" onClick={handleSubmit} disabled={loading} style={{ marginBottom: "20px" }}>
                  {loading ? "Memproses..." : "Reset Password"}
                </button>

                <div style={{ textAlign: "center" }}>
                  <p className="link" onClick={() => navigate("login")} style={{ display: "inline-flex", alignItems: "center", gap: "5px", cursor: "pointer", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>
                    <ArrowLeft size={16} /> Back to Login
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="login-footer">
          <span>Terms and conditions</span> | <span>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}
