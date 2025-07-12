import React from 'react';
import './Notifications.css';

// Dummy notifications
const notifications = [
  { id: 1, text: 'Someone answered your question.' },
  { id: 2, text: 'Someone mentioned you in a comment.' },
  { id: 3, text: 'Your answer was accepted.' },
];

const Notifications = () => (
  <div className="notifications-dropdown">
    <h3 className="notifications-dropdown__title">Notifications</h3>
    <ul className="notifications-dropdown__list">
      {notifications.map(n => (
        <li key={n.id} className="notifications-dropdown__item">{n.text}</li>
      ))}
    </ul>
  </div>
);

export default Notifications;
