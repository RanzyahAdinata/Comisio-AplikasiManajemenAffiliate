import { useState, useEffect } from "react";
import "./NotificationIcon.css";

const API_URL = "https://comis-io-kelompok-5.vercel.app";

export default function NotificationIcon({ navigate }) {
  const [unreadCount, setUnreadCount] = useState(0);

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "User", role: "affiliate" };
  } catch (e) {
    user = { name: "User", role: "affiliate" };
  }

  useEffect(() => {
    if (user.id) {
      fetchUnreadCount();
      // Optional: Polling every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user.id]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${user.id}`);
      const data = await res.json();
      if (data.success) {
        const unread = data.notifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Error fetching unread notifications:", err);
    }
  };

  return (
    <div className="notif-btn-wrapper" onClick={() => navigate("notifications")}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
    </div>
  );
}
