import React, {useState } from 'react';
import './Navbar.css';
import LoginModal from '../LoginModal/LoginModal';
import RegistrationModal from '../RegistrationModal/RegistrationModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = ({ onNotificationsClick, notificationCount }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return stored && token ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate();

  const handleLoginSubmit = (data) => {
    console.log("Login data:", data);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.user.role);
    setUser(data.user);
    setShowLogin(false);
  };

  const redirectToHome = () => {
    navigate(`/`);
  };

  const handleRegisterSubmit = (data) => {
    localStorage.setItem('user', JSON.stringify(data));   
    setShowRegister(false);
    setShowLogin(true);
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo" onClick={redirectToHome}>StackIt</div>
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
          <>
            <span className="navbar__greeting">Hi, {user.name}</span>
            <button
              className="navbar__logout"
              onClick={async () => {
                try {
                  const backendUrl = import.meta.env.VITE_BACKEND_URL;
                  await fetch(`${backendUrl}/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  localStorage.removeItem('user');
                  localStorage.removeItem('token');
                  localStorage.removeItem('role');
                  setUser(null);
                  toast.success('Logged out successfully!');
                } catch (err) {
                  toast.error('Logout failed.');
                }
              }}
            >
              Logout
            </button>
          </>
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
