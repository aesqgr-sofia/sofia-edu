import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../../components/styles/layout.css';

/**
 * NavBar component for application navigation
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.logo] - Logo element to display
 * @param {React.ReactNode} [props.leftItems] - Items to display on the left side
 * @param {React.ReactNode} [props.rightItems] - Items to display on the right side
 * @param {boolean} [props.sticky=false] - Whether the navbar should stick to the top
 * @param {boolean} [props.bordered=true] - Whether to show a border
 * @param {boolean} [props.transparent=false] - Whether the navbar should be transparent
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} - NavBar component
 */
const NavBar = ({
  logo,
  leftItems,
  rightItems,
  sticky = false,
  bordered = true,
  transparent = false,
  className = '',
  ...props
}) => {
  const baseClasses = [
    'sofia-navbar',
    'sofia-d-flex',
    'sofia-justify-between',
    'sofia-items-center',
    'sofia-px-4',
    'sofia-py-2',
    sticky ? 'sofia-navbar-sticky' : '',
    bordered ? 'sofia-border-bottom' : '',
    transparent ? 'sofia-bg-transparent' : 'sofia-bg-white',
    className
  ].filter(Boolean).join(' ');

  return (
    <nav className={baseClasses} {...props}>
      <div className="sofia-d-flex sofia-items-center sofia-gap-4">
        {logo && <div className="sofia-navbar-logo">{logo}</div>}
        {leftItems && <div className="sofia-navbar-left">{leftItems}</div>}
      </div>
      {rightItems && <div className="sofia-navbar-right">{rightItems}</div>}
    </nav>
  );
};

NavBar.propTypes = {
  logo: PropTypes.node,
  leftItems: PropTypes.node,
  rightItems: PropTypes.node,
  sticky: PropTypes.bool,
  bordered: PropTypes.bool,
  transparent: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * NavBar.Item - An item in the navbar
 */
const NavBarItem = ({ 
  active = false,
  href,
  to,
  className = '', 
  children,
  ...props 
}) => {
  const baseClasses = [
    'sofia-navbar-item',
    'sofia-px-3',
    'sofia-py-2',
    'sofia-rounded-md',
    active ? 'sofia-navbar-item-active' : '',
    className
  ].filter(Boolean).join(' ');

  if (to) {
    return (
      <Link to={to} className={baseClasses} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClasses} {...props}>
        {children}
      </a>
    );
  }

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

NavBarItem.propTypes = {
  active: PropTypes.bool,
  href: PropTypes.string,
  to: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

/**
 * NavBar.Menu - A dropdown menu in the navbar
 */
const NavBarMenu = ({ 
  label,
  icon,
  items = [],
  className = '',
  ...props 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const baseClasses = [
    'sofia-navbar-menu',
    'sofia-relative',
    className
  ].filter(Boolean).join(' ');
  
  const menuButtonClasses = [
    'sofia-navbar-menu-button',
    'sofia-d-flex',
    'sofia-items-center',
    'sofia-gap-2',
    'sofia-px-3',
    'sofia-py-2',
    'sofia-rounded-md',
    'sofia-cursor-pointer',
    isOpen ? 'sofia-navbar-menu-button-active' : ''
  ].filter(Boolean).join(' ');
  
  const menuClasses = [
    'sofia-navbar-menu-items',
    'sofia-absolute',
    'sofia-right-0',
    'sofia-mt-1',
    'sofia-py-1',
    'sofia-bg-white',
    'sofia-rounded-md',
    'sofia-shadow-md',
    'sofia-min-w-48',
    'sofia-z-10',
    isOpen ? 'sofia-d-block' : 'sofia-d-none'
  ].filter(Boolean).join(' ');
  
  // Close menu when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event) => {
      if (event.target.closest('.sofia-navbar-menu') === null) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);
  
  return (
    <div className={baseClasses} {...props}>
      <div className={menuButtonClasses} onClick={toggleMenu}>
        {icon && <span className="sofia-navbar-menu-icon">{icon}</span>}
        {label && <span className="sofia-navbar-menu-label">{label}</span>}
        <span className="sofia-navbar-menu-arrow">▼</span>
      </div>
      
      <div className={menuClasses}>
        {items.map((item, index) => (
          <NavBarMenuItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

NavBarMenu.propTypes = {
  label: PropTypes.node,
  icon: PropTypes.node,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      to: PropTypes.string,
      href: PropTypes.string,
      onClick: PropTypes.func,
      divider: PropTypes.bool,
    })
  ),
  className: PropTypes.string,
};

/**
 * NavBar.MenuItem - A menu item in the navbar dropdown
 */
const NavBarMenuItem = ({ 
  label,
  to,
  href,
  onClick,
  divider = false,
  className = '',
  ...props 
}) => {
  const baseClasses = [
    'sofia-navbar-menu-item',
    'sofia-px-4',
    'sofia-py-2',
    'sofia-cursor-pointer',
    'sofia-d-block',
    'sofia-w-100',
    'sofia-text-left',
    divider ? 'sofia-border-top sofia-mt-1 sofia-pt-1' : '',
    className
  ].filter(Boolean).join(' ');
  
  if (to) {
    return (
      <Link to={to} className={baseClasses} {...props}>
        {label}
      </Link>
    );
  }
  
  if (href) {
    return (
      <a href={href} className={baseClasses} {...props}>
        {label}
      </a>
    );
  }
  
  return (
    <button className={baseClasses} onClick={onClick} {...props}>
      {label}
    </button>
  );
};

NavBarMenuItem.propTypes = {
  label: PropTypes.node.isRequired,
  to: PropTypes.string,
  href: PropTypes.string,
  onClick: PropTypes.func,
  divider: PropTypes.bool,
  className: PropTypes.string,
};

// Attach subcomponents to NavBar
NavBar.Item = NavBarItem;
NavBar.Menu = NavBarMenu;
NavBar.MenuItem = NavBarMenuItem;

export default NavBar; 