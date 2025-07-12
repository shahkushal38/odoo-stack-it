import React, { useState } from 'react';
import axios from 'axios';
import './LoginModal.css';
import { toast } from 'react-toastify';

const LoginModal = ({ isOpen, onClose, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await axios.post(`${backendUrl}/login`, { username, password });
      onSubmit(res.data); // Pass user/token to parent
      toast.success('Login successful!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
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
