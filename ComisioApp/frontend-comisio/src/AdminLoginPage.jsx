import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import "./LoginPage.css";

import logoComis from "./assets/Logo_merah.png";
import heroImage from "./assets/foto_Login.jpg";

const API_URL = "https://comis-io-kelompok-5-backend.vercel.app";

export default function AdminLoginPage({ navigate }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.username || !form.password) {
      setError("Email dan Password harus diisi!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.username,
          password: form.password,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.user.role && data.user.role.toLowerCase() === 'admin') {
          // Simpan data user ke localStorage agar Dashboard bisa membacanya
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("admin-dashboard");
          console.log(`Login Admin berhasil! Selamat datang, ${data.user.name}`);
        } else {
          setError("Akses Ditolak! Akun ini bukan milik Admin.");
        }
      } else {
        setError(data.message || "Login gagal, periksa email dan password.");
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
          style={{ filter: "brightness(0.7)" }} // Sedikit digelapkan untuk membedakan
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
          <h2 className="login-title">Admin Log In</h2>
          <div className="login-form">
            {error && <div className="alert alert-error">{error}</div>}
            
            <div className="input-group input-with-icon">
              <span className="input-icon"><Mail size={18} /></span>
              <input 
                type="text" 
                name="username" 
                placeholder="Admin Email"
                value={form.username} 
                onChange={handleChange}
                className="form-input" 
                disabled={loading} 
              />
            </div>
            
            <div className="input-group input-with-icon">
              <span className="input-icon"><Lock size={18} /></span>
              <input 
                type="password" 
                name="password" 
                placeholder="Password"
                value={form.password} 
                onChange={handleChange}
                className="form-input" 
                disabled={loading} 
              />
            </div>

            <button className="btn-submit" onClick={handleSubmit} disabled={loading} style={{ marginTop: "10px", backgroundColor: "#c62828" }}>
              {loading ? "Memproses..." : "Login to Admin Portal"}
            </button>
            
            <p className="signup-redirect">
              <span className="link" onClick={() => navigate("login")}>&larr; Back to Affiliate Login</span>
            </p>
          </div>
        </div>

        <div className="login-footer">
          <span>Terms and conditions</span> | <span>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}
