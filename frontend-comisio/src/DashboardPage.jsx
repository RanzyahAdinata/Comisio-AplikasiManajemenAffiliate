import {  useState, useEffect  } from "react";
import NotificationIcon from "./NotificationIcon";
import Sidebar from "./Sidebar";
import "./DashboardPage.css";
import SalesChart from "./SalesChart";
import ReputationChart from "./ReputationChart";

const avatarColors = ["#4D96FF", "#4ECDC4", "#A8A8A8", "#FF6B6B", "#FFD93D", "#FF924C"];

export default function DashboardPage({ navigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    walletBalance: 0,
    pendingCommissions: 0,
    pendingOrdersCount: 0,
    totalClicks: 0,
    totalSales: 0
  });
  const [leaderboard, setLeaderboard] = useState([]);

  // Default hardcoded leaderboard for fallback exactly as Figma
  const fallbackLeaderboard = [
    { rank: 1, name: "Abraham Lincolyn Z.", sold: "2300 products sold" },
    { rank: 2, name: "Molly Arabella E.", sold: "1554 products sold" },
    { rank: 3, name: "Ranzyah Adinata A.", sold: "1121 products sold" },
    { rank: 4, name: "Kemal Pahlevi T.", sold: "983 products sold" },
    { rank: 5, name: "Sasha Azzahra S.", sold: "657 products sold" },
    { rank: 6, name: "Hanni Pham C.", sold: "398 products sold" },
  ];

  let user;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : { name: "User", role: "Affiliate" };
  } catch (e) {
    user = { name: "User", role: "Affiliate" };
  }

  useEffect(() => {
    const fetchData = async () => {
      if (user?.affiliateId) {
        try {
          const res = await fetch(`https://comis-io-backend.vercel.app/api/dashboard/affiliate/${user.affiliateId}`);
          const data = await res.json();
          if (data.success) {
            setStats(prev => ({ ...prev, ...data.stats }));
          }
        } catch (err) {
          console.error(err);
        }
      }
      
      try {
        const resLb = await fetch(`https://comis-io-backend.vercel.app/api/leaderboard`);
        const dataLb = await resLb.json();
        if (dataLb.success) {
          setLeaderboard(dataLb.leaderboard);
        } else {
          setLeaderboard(fallbackLeaderboard);
        }
      } catch (err) {
        console.error(err);
        setLeaderboard(fallbackLeaderboard);
      }
    };

    fetchData();
  }, [user?.affiliateId]);

  const formatIDR = (val) => "IDR " + Number(val || 0).toLocaleString("id-ID");

  return (
    <div className={`dashboard-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} navigate={navigate} active="dashboard" user={user} />

      <main className="dashboard-main dashboard-bg-white">
        <div className="topbar">
          <h1 className="page-title">Dashboard</h1>
          <div className="topbar-right">
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search Data" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <NotificationIcon navigate={navigate} />
          </div>
        </div>

        <div className="dashboard-stats-row">
          <div className="stat-block">
            <p className="stat-label">Wallet Balance</p>
            <h2 className="stat-value">{formatIDR(stats?.walletBalance ?? 0)}</h2>
            <div className="stat-sub">
              <span className="stat-link" onClick={() => navigate("wallets")} style={{cursor: "pointer"}}>Payout</span>
              {stats?.pendingCommissions > 0 ? (
                <span className="stat-note"> &nbsp;|&nbsp; {formatIDR(stats.pendingCommissions)} will be available soon ⓘ</span>
              ) : (
                <span className="stat-note"> &nbsp;|&nbsp; No pending commissions ⓘ</span>
              )}
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-block">
            <p className="stat-label">Pending Commisions</p>
            <h2 className="stat-value">{formatIDR(stats?.pendingCommissions ?? 0)}</h2>
            <p className="stat-note">{stats?.pendingOrdersCount ?? 0} orders</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-block">
            <p className="stat-label">Total Clicks</p>
            <h2 className="stat-value">{stats?.totalClicks ?? 687}</h2>
            <p className="stat-note">product /month</p>
          </div>
        </div>

        <div className="dashboard-content-split">
          <div className="charts-column">
            <h3 className="section-title">Commisions Earnings</h3>
            <div className="grey-rounded-box charts-grey-box">
              <div className="chart-row">
                <div className="chart-text-col">
                  <p className="chart-title">Total Product Sold (Monthly)</p>
                  <h3 className="chart-big-number">{stats?.totalSales ?? 38}</h3>
                  <div className="chart-badge-row">
                    <span className="trend-badge red-badge">
                      <svg style={{marginRight:3}} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                      9
                    </span>
                    <span className="trend-text">Since last month</span>
                  </div>
                  <p className="chart-desc">Increase your sales to earn more commission</p>
                </div>
                <div className="chart-graphics-col">
                  <SalesChart />
                </div>
              </div>
              
              <div className="horizontal-divider"></div>
              
              <div className="chart-row">
                <div className="chart-text-col">
                  <p className="chart-title">Your Reputation Score</p>
                  <h3 className="chart-big-number">91.54</h3>
                  <div className="chart-badge-row">
                    <span className="trend-badge green-badge">
                      <svg style={{marginRight:3}} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15" /></svg>
                      8.3
                    </span>
                    <span className="trend-text">Since 7 last days</span>
                  </div>
                  <p className="chart-desc">You're in the top of 5% of all sales affiliator</p>
                </div>
                <div className="chart-graphics-col" style={{ marginTop: '10px' }}>
                  <ReputationChart />
                </div>
              </div>
            </div>
          </div>

          <div className="leaderboard-column">
            <h3 className="section-title">Leaderboards</h3>
            <div className="grey-rounded-box leaderboard-grey-box">
              {leaderboard.length === 0 ? <p style={{color:'#aaa', fontSize:'0.8rem'}}>No leaderboard data</p> : null}
              {leaderboard.slice(0, 6).map((item, i) => {
                const rank = item.rank || (i + 1);
                const name = item.first_name ? `${item.first_name} ${item.last_name || ''}` : item.name;
                const top3Class = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : 'rank-normal';
                
                return (
                  <div key={i} className="lb-list-item">
                    <div className={`lb-rank-circle ${top3Class}`}>{rank}</div>
                    <div className="lb-avatar-circle" style={{background: avatarColors[i % avatarColors.length]}}>
                      {name.charAt(0)}
                    </div>
                    <div className="lb-details">
                      <p className="lb-name-text">{name}</p>
                      <p className="lb-sold-text">{item.sold || '0 products sold'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}