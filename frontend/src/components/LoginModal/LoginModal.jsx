import React, { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <div className="login-modal__backdrop" onClick={onClose}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        <h2 className="login-modal__title">Login</h2>
        <form className="login-modal__form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="login-modal__input"
            placeholder="Username or Email Address"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-modal__input"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-modal__submit">Login</button>
        </form>
        <button className="login-modal__forgot" onClick={() => alert('Password reset flow')}>Forgot password?</button>
        <button className="login-modal__close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default LoginModal;
