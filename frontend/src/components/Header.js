// src/components/Header.js
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './common';
import logo from './logo.svg';
import './Header.css';

const Header = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <img src={logo} alt="Company Logo" className="logo" />
        <div className="header-actions">
          <LanguageSwitcher />
          <button onClick={handleLogout} className="btn btn-blue logout-btn">
            {t('logout')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
