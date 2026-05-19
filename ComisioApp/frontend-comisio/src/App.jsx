import { useState } from "react";
import LandingPage from "./LandingPage";
import SignUpPage from "./SignUpPage";
import LoginPage from "./LoginPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";
import DashboardPage from "./DashboardPage";
import AdminDashboard from "./AdminDashboard";
import ManageProduct from "./ManageProduct";
import ManageCommission from "./ManageCommission";
import ManageAffiliates from "./ManageAffiliates";
import PayoutApproval from "./PayoutApproval";
import CampaignsPage from "./CampaignsPage";
import CommissionsPage from "./CommissionsPage";
import WalletsPage from "./WalletsPage";
import ReportsPage from "./ReportsPage";
import MarketingPage from "./MarketingPage";
import NotificationsPage from "./NotificationsPage";
export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const navigate = (page) => setCurrentPage(page);

  return (
    <>
      {currentPage === "landing" && <LandingPage navigate={navigate} />}
      {currentPage === "signup" && <SignUpPage navigate={navigate} />}
      {currentPage === "login" && <LoginPage navigate={navigate} />}
      {currentPage === "forgot-password" && <ForgotPasswordPage navigate={navigate} />}
      {currentPage === "reset-password" && <ResetPasswordPage navigate={navigate} />}

      {/* Affiliate Pages */}
      {currentPage === "dashboard" && <DashboardPage navigate={navigate} />}
      {currentPage === "campaigns" && <CampaignsPage navigate={navigate} />}
      {currentPage === "commissions" && <CommissionsPage navigate={navigate} />}
      {currentPage === "wallets" && <WalletsPage navigate={navigate} />}
      {currentPage === "reports" && <ReportsPage navigate={navigate} />}
      {currentPage === "marketing" && <MarketingPage navigate={navigate} />}
      {currentPage === "notifications" && <NotificationsPage navigate={navigate} />}

      {/* Admin Pages */}
      {currentPage === "admin-dashboard" && <AdminDashboard navigate={navigate} />}
      {currentPage === "manage-product" && <ManageProduct navigate={navigate} />}
      {currentPage === "manage-commission" && <ManageCommission navigate={navigate} />}
      {currentPage === "manage-affiliates" && <ManageAffiliates navigate={navigate} />}
      {currentPage === "payout-approval" && <PayoutApproval navigate={navigate} />}
    </>
  );
}