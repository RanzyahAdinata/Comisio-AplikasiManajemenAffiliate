import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import "./LandingPage.css";
// Mengimpor logo dari folder assets
import logoKami from "./assets/Logo_putih.png";

export default function LandingPage({ navigate }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="landing-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          {/* Mengganti teks lama dengan image logo */}
          <img
            src={logoKami}
            alt="Logo Comis"
            style={{ height: "40px", width: "auto" }}
          />
        </div>
        <div className="navbar-links">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#blog">Blog</a>
          <a href="#review">Review</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="navbar-actions">
          <button className="btn-signup" onClick={() => navigate("signup")}>
            Sign Up
          </button>
          <button className="btn-login" onClick={() => navigate("login")}>
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Grow Your Career Through a High Impact Partnership
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Scale your earnings with a precision engineered affiliate ecosystem. Comis.io bridges the gap between visionary brands and top tier partners, transforming every click into transparent, measurable revenue.
          </motion.p>
          <motion.div
            className="search-bar"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Search className="search-icon" size={20} strokeWidth={2} />
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}