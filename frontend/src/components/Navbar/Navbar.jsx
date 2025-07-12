import React, { useState } from 'react';
import './Navbar.css';
import LoginModal from '../LoginModal/LoginModal';
import RegistrationModal from '../RegistrationModal/RegistrationModal';

const Navbar = ({ onNotificationsClick, notificationCount }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLoginSubmit = (data) => {
    console.log("Login data:", data);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setShowLogin(false);
  };

  const handleRegisterSubmit = (data) => {
    localStorage.setItem('user', JSON.stringify(data));   
    setShowRegister(false);
    setShowLogin(true);
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
        {!user && (
          <>
            <button className="navbar__login" onClick={() => setShowLogin(true)}>Login</button>
            <button className="navbar__register" onClick={() => setShowRegister(true)}>Register</button>
          </>
        )}
        {user && (
          <span className="navbar__greeting">Hi, {user.name}</span>
        )}
      </div>
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSubmit={handleLoginSubmit}
      />
      <RegistrationModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onRegister={handleRegisterSubmit}
      />
    </nav>
  );
};

export default Navbar;
