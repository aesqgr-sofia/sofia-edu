// src/components/Sidebar.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';
import plannerIcon from './planner_icon.png';
import homeIcon from './home_icon.png';
import accountsIcon from './accounts_icon.png';
import defaultSchoolLogo from './logo_eliana.png';
import contentIcon from './content_icon.png';

const Sidebar = ({ schoolName, schoolLogo = defaultSchoolLogo }) => {
  const { t } = useTranslation(['navigation']);
  const navItems = [
    { title: t('navigation:dashboard'), icon: homeIcon, link: '/dashboard' },
    { title: t('navigation:content'), icon: contentIcon, link: '/content' },
    { title: t('navigation:planner'), icon: plannerIcon, link: '/planner' },
    { title: t('navigation:account'), icon: accountsIcon, link: '/account' },

    // Add more sections as needed...
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-top">
      <img src={schoolLogo} alt="School Logo" className="school-logo" />
        {schoolName && <p className="school-name">{schoolName}</p>}
      </div>
      <hr className="sidebar-divider" />
      <ul>
        {navItems.map((item, index) => (
          <li key={index} className="nav-item">
            <a href={item.link}>
              <img src={item.icon} alt={`${item.title} Icon`} className="nav-icon" />
              <span className="nav-title">{item.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
