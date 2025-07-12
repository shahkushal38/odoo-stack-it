import React, { useState } from 'react';
import './Navbar.css';
import LoginModal from '../LoginModal/LoginModal';

const Navbar = ({ onNotificationsClick, notificationCount }) => {
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginSubmit = (data) => {
    // Dummy login handler
    alert(`Logged in as: ${data.username}`);
    setShowLogin(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo">StackIt</div>
      <div className="navbar__actions">
        <button className="navbar__bell" onClick={onNotificationsClick}>
          <span role="img" aria-label="notifications">🔔</span>
          {notificationCount > 0 && (
            <span className="navbar__badge">{notificationCount}</span>
          )}
        </button>
        <button className="navbar__login" onClick={() => setShowLogin(true)}>Login</button>
        <button className="navbar__register">Register</button>
      </div>
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSubmit={handleLoginSubmit}
      />
    </nav>
  );
};

export default Navbar;
