import React, { useState } from "react";
import "./RegistrationModal.css";
import axios from "axios";
import { toast } from "react-toastify";

const RegistrationModal = ({ isOpen, onClose, onRegister }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "user"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log("Form data:", form, backendUrl);
      await axios.post(`${backendUrl}/register`, form); // Change endpoint as needed
      toast.success("Registration successful!");
      if (onRegister) onRegister(form);
      onClose();
    } catch (err) {
        console.error("Registration error:", err);
      toast.error(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    }
    
  };

  if (!isOpen) return null;

  return (
    <div className="registration-modal__backdrop">
      <div className="registration-modal registration-modal--medium">
        <button className="registration-modal__close" onClick={onClose}>&times;</button>
        <div className="registration-modal__title">Register</div>
        <form className="registration-modal__form" onSubmit={handleSubmit}>
          <div className="registration-modal__row">
            <label className="registration-modal__label" htmlFor="username">Username</label>
            <input
              className="registration-modal__input"
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="registration-modal__row">
            <label className="registration-modal__label" htmlFor="name">Full Name</label>
            <input
              className="registration-modal__input"
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="registration-modal__row">
            <label className="registration-modal__label" htmlFor="email">Email</label>
            <input
              className="registration-modal__input"
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="registration-modal__row">
            <label className="registration-modal__label" htmlFor="password">Password</label>
            <input
              className="registration-modal__input"
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="registration-modal__row">
            <label className="registration-modal__label" htmlFor="role">Role</label>
            <select
              className="registration-modal__input"
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="registration-modal__submit" type="submit">
            Registration Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;
