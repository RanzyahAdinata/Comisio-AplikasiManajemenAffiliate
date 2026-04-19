import { useState } from "react";
import "./SignUpPage.css";

// 1. Import asset gambar
import logoComis from "./assets/Logo_merah.png";
import heroImage from "./assets/foto_signUp.jpg";

const API_URL = "http://localhost:5005";

export default function SignUpPage({ navigate }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "affiliate",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Semua field harus diisi!");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password dan Confirm Password tidak cocok!");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Registrasi berhasil! Mengarahkan ke Login...");
        setTimeout(() => navigate("login"), 1500);
      } else {
        setError(data.message || "Registrasi gagal, coba lagi.");
      }
    } catch (err) {
      setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      {/* Panel Kiri: Form */}
      <div className="signup-form-panel">
        <div className="signup-logo">
          {/* 2. Menggunakan Logo Comis.io */}
          <img src={logoComis} alt="Comis.io Logo" style={{ height: "45px", cursor: "pointer" }} onClick={() => navigate("landing")} />
        </div>

        <div className="signup-form-container">
          <h2 className="signup-title">Sign Up</h2>
          
          <div className="signup-form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="input-group">
              <input 
                type="text" name="firstName" placeholder="First Name"
                value={form.firstName} onChange={handleChange}
                className="form-input" disabled={loading} 
              />
            </div>

            <div className="input-group">
              <input 
                type="text" name="lastName" placeholder="Last Name"
                value={form.lastName} onChange={handleChange}
                className="form-input" disabled={loading} 
              />
            </div>

            <div className="input-group input-with-icon">
              <span className="input-icon">✉️</span>
              <input 
                type="email" name="email" placeholder="Email"
                value={form.email} onChange={handleChange}
                className="form-input" disabled={loading} 
              />
            </div>

            <div className="input-group input-with-icon">
              <span className="input-icon">🔒</span>
              <input 
                type="password" name="password" placeholder="Password"
                value={form.password} onChange={handleChange}
                className="form-input" disabled={loading} 
              />
            </div>

            <div className="input-group input-with-icon">
              <span className="input-icon">🔒</span>
              <input 
                type="password" name="confirmPassword" placeholder="Confirm Password"
                value={form.confirmPassword} onChange={handleChange}
                className="form-input" disabled={loading} 
              />
            </div>

            <div className="input-group input-with-icon">
              <span className="input-icon">👤</span>
              <select 
                name="role" 
                value={form.role} 
                onChange={handleChange}
                className="form-input" 
                disabled={loading}
                style={{ appearance: "auto", cursor: "pointer" }}
              >
                <option value="affiliate">Affiliate</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? "Memproses..." : "SignUp"}
            </button>

            <p className="login-redirect">
              already have an account?{" "}
              <span className="link" onClick={() => navigate("login")}>Login</span>
            </p>
          </div>
        </div>

        <div className="signup-footer">
          <span>Terms and conditions</span> | <span>Privacy Policy</span>
        </div>
      </div>

      {/* Panel Kanan: Gambar Hero */}
      <div className="signup-image-panel">
        <img 
          src={heroImage} 
          alt="Partnership Hero" 
          className="hero-img-fill" 
        />
      </div>
    </div>
  );
}