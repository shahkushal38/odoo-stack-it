import React from 'react';
import './Navbar.css';

const Navbar = ({ onNotificationsClick, notificationCount }) => (
  <nav className="navbar">
    <div className="navbar__logo">StackIt</div>
    <div className="navbar__actions">
      <button className="navbar__bell" onClick={onNotificationsClick}>
        <span role="img" aria-label="notifications">🔔</span>
        {notificationCount > 0 && (
          <span className="navbar__badge">{notificationCount}</span>
        )}
      </button>
      <button className="navbar__login">Login</button>
      <button className="navbar__register">Register</button>
    </div>
  </nav>
);

export default Navbar;
