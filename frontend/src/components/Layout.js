import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ children, schoolName }) => {
  return (
    <div className="layout">
      <Sidebar schoolName={schoolName} />
      <div className="main-area">
        <Header />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
