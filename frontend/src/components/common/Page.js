import React from 'react';
import PropTypes from 'prop-types';
import '../../components/styles/layout.css';

/**
 * Page component for standardized page layouts
 * 
 * @param {Object} props - Component props
 * @param {string} [props.title] - Page title
 * @param {React.ReactNode} [props.subtitle] - Page subtitle
 * @param {React.ReactNode} [props.headerActions] - Actions to display in the header
 * @param {React.ReactNode} [props.breadcrumbs] - Breadcrumb navigation
 * @param {React.ReactNode} [props.footer] - Page footer content
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Page content
 * @returns {React.ReactElement} - Page component
 */
const Page = ({
  title,
  subtitle,
  headerActions,
  breadcrumbs,
  footer,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = [
    'sofia-page-layout',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses} {...props}>
      {(title || headerActions || breadcrumbs) && (
        <header className="sofia-page-header">
          {breadcrumbs && <div className="sofia-page-breadcrumbs">{breadcrumbs}</div>}
          <div className="sofia-d-flex sofia-justify-between sofia-items-center">
            <div>
              {title && <h1 className="sofia-page-title">{title}</h1>}
              {subtitle && <p className="sofia-subtitle">{subtitle}</p>}
            </div>
            {headerActions && <div className="sofia-page-actions">{headerActions}</div>}
          </div>
        </header>
      )}
      <main className="sofia-page-content">
        {children}
      </main>
      {footer && (
        <footer className="sofia-page-footer">
          {footer}
        </footer>
      )}
    </div>
  );
};

Page.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  headerActions: PropTypes.node,
  breadcrumbs: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

/**
 * Page.Section - A subcomponent for page sections
 */
const PageSection = ({ 
  title, 
  subtitle,
  actions,
  className = '', 
  children,
  ...props 
}) => {
  const classes = ['sofia-section', className].filter(Boolean).join(' ');
  
  return (
    <section className={classes} {...props}>
      {(title || actions) && (
        <div className="sofia-section-header">
          <div>
            {title && <h2 className="sofia-section-title">{title}</h2>}
            {subtitle && <p className="sofia-text-secondary sofia-mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="sofia-section-actions">{actions}</div>}
        </div>
      )}
      <div className="sofia-section-content">
        {children}
      </div>
    </section>
  );
};

PageSection.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

/**
 * Page.Container - A container with max width for consistent page layouts
 */
const PageContainer = ({ 
  size = 'default', 
  className = '', 
  children,
  ...props 
}) => {
  const sizeClass = size !== 'default' ? `sofia-layout-container-${size}` : '';
  
  const classes = [
    'sofia-layout-container',
    sizeClass,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

PageContainer.propTypes = {
  size: PropTypes.oneOf(['default', 'sm', 'md', 'lg', 'xl', 'fluid']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

// Attach subcomponents to Page
Page.Section = PageSection;
Page.Container = PageContainer;

export default Page; 