import React, { useState, useEffect } from 'react';
import './Navbar.css';
import LoginModal from '../LoginModal/LoginModal';
import RegistrationModal from '../RegistrationModal/RegistrationModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getNotifications } from '../../api';


const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return stored && token ? JSON.parse(stored) : null;
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.user_id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const notes = await getNotifications(user.user_id);
      setNotifications(notes);
      // Count unread notifications
      setNotificationCount(notes.filter(n => !n.is_read).length);
    } catch (err) {
      setNotifications([]);
      setNotificationCount(0);
    }
  };

  const handleLoginSubmit = (data) => {
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

  const handleNotificationsClick = () => {
    setShowNotifications((prev) => !prev);
    // Optionally, mark notifications as read here
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo" onClick={redirectToHome}>StackIt</div>
      <div className="navbar__actions">
        {user && (
          <div style={{ position: 'relative' }}>
            <button className="navbar__bell" onClick={handleNotificationsClick}>
              <span role="img" aria-label="notifications">🔔</span>
              {notificationCount > 0 && (
                <span className="navbar__badge">{notificationCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="navbar__notifications-dropdown" style={{ position: 'absolute', right: 0, top: '2.5rem', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: '8px', minWidth: '250px', zIndex: 100 }}>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1rem', color: '#888' }}>No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #eee', background: n.is_read ? '#fff' : '#f5faff' }}>
                        {n.message}
                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
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
                  setNotifications([]);
                  setNotificationCount(0);
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
