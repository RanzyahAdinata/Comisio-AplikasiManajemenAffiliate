import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./NotificationsPage.css";

const API_URL = "http://localhost:5005";

export default function NotificationsPage({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "User", role: "affiliate" };
  } catch (e) {
    user = { name: "User", role: "affiliate" };
  }

  useEffect(() => {
    if (user.id) {
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PUT"
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'payout_success':
        return '💰';
      case 'payout_rejected':
        return '❌';
      default:
        return '🔔';
    }
  };

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} navigate={navigate} active="notifications" user={user} />

      <main className="dashboard-main notifications-main">
        <div className="topbar">
          <h1 className="page-title">Notifications</h1>
        </div>

        <div className="notifications-container">
          {loading ? (
            <div className="empty-state">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p>Belum ada notifikasi saat ini.</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-card ${notif.is_read ? 'read' : 'unread'}`}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                >
                  <div className="notification-icon">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="notification-content">
                    <h3 className="notification-title">{notif.title}</h3>
                    <p className="notification-message">{notif.message}</p>
                    <span className="notification-time">{formatDate(notif.created_at)}</span>
                  </div>
                  {!notif.is_read && <div className="unread-dot"></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
