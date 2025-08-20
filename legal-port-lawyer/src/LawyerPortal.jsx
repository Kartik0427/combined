import React, { useState, useEffect } from "react";
import Modal from "./components/Modal";

// Import all the page components
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import ReportsPage from "./pages/ReportsPage";
import ContactPage from "./pages/ContactPage";
import ReviewsPage from "./pages/ReviewsPage";
import ChatPage from "./pages/ChatPage";
import AnalyticsPage from "./pages/AnalyticsPage";

const LawyerPortal = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // This data would typically come from an API
  const [user, setUser] = useState({
    name: "Adv. Anuj Kumar",
    specialization: "Criminal & Civil Law",
    experience: "12 Years",
    rating: 4.8,
    cases: 150,
    phone: "+91 98765 43210",
    email: "anuj.kumar@lawfirm.com",
  });
  const [balance, setBalance] = useState(2450);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // This function determines which page component to render
  const renderPage = () => {
    const pageProps = { user, balance, setCurrentPage, handleLogout };

    switch (currentPage) {
      case "profile":
        return <ProfilePage {...pageProps} />;
      case "analytics":
        return <AnalyticsPage {...pageProps} />;
      case "reports":
        return <ReportsPage {...pageProps} />;
      case "contact":
        return <ContactPage {...pageProps} />;
      case "reviews":
        return <ReviewsPage {...pageProps} />;
      case "chat":
        return <ChatPage {...pageProps} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  return (
    <div className="font-sans">
      {showLogoutModal && (
        <Modal
          title="Confirm Logout"
          message="Are you sure you want to logout?"
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}
      {renderPage()}
    </div>
  );
};

export default LawyerPortal;
