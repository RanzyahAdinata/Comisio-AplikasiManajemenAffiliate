import { motion } from "framer-motion";
import { 
  LayoutDashboard, ShoppingBag, Receipt, Wallet, 
  BarChart3, Megaphone, CheckCircle, Package, 
  Percent, Users, ChevronLeft, LogOut 
} from "lucide-react";
import "./Sidebar.css";

// Menu items untuk Affiliate
const affiliateMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "campaigns", label: "Campaigns", icon: ShoppingBag },
  { id: "commisions", label: "Commisions", icon: Receipt },
  { id: "wallets", label: "Wallets", icon: Wallet },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "marketing", label: "Marketing Assets", icon: Megaphone },
];

// Menu items untuk Admin
const adminMenuItems = [
  { id: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "payout-approval", label: "Payout Approval", icon: CheckCircle },
  { id: "manage-product", label: "Manage Product", icon: Package },
  { id: "manage-commission", label: "Manage Commision", icon: Percent },
  { id: "manage-affiliates", label: "Manage Affiliates", icon: Users },
];

export default function Sidebar({ collapsed, setCollapsed, navigate, active, user }) {
  const isAdmin = user?.role === 'admin';
  const menuItems = isAdmin ? adminMenuItems : affiliateMenuItems;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* User Profile */}
      <div className="sidebar-profile">
        <div className="profile-avatar">
          <span>{initial}</span>
        </div>
        {!collapsed && (
          <div className="profile-info">
            <p className="profile-name">{user?.name || "User"}</p>
            <p className="profile-role">{isAdmin ? "Admin" : "Affiliate"} <span className="profile-caret">▾</span></p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => navigate && navigate(item.id)}
              title={collapsed ? item.label : ""}
              style={{ position: 'relative' }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    background: "var(--primary)",
                    borderRadius: "0 4px 4px 0",
                    boxShadow: "2px 0 8px rgba(198, 40, 40, 0.4)"
                  }}
                />
              )}
              <span className="nav-icon">
                <Icon size={20} strokeWidth={1.5} />
              </span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {collapsed && isActive && <span className="active-dot" />}
            </button>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        <ChevronLeft size={20} strokeWidth={2} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
      </button>

      {/* Sign Out */}
      <div className="sidebar-bottom">
        <button className="signout-btn" onClick={() => {
          localStorage.removeItem("user");
          navigate("login");
        }}>
          <LogOut size={18} strokeWidth={1.5} />
          {!collapsed && <span>Sign Out</span>}
        </button>
        {!collapsed && <p className="sidebar-copyright">Copyright © 2026 by Comisio</p>}
      </div>
    </aside>
  );
}
