// src/components/Header.js
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from './logo.svg';
import './Header.css';

const Header = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <img src={logo} alt="Company Logo" className="logo" />
        <button onClick={handleLogout} className="btn btn-blue logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
