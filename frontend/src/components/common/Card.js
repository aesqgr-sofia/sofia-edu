import React from 'react';
import PropTypes from 'prop-types';
import '../../components/styles/layout.css';

/**
 * Card component for displaying content in a contained box
 * 
 * @param {Object} props - Component props
 * @param {string} [props.title] - Card title
 * @param {React.ReactNode} [props.headerActions] - Actions to display in the header
 * @param {React.ReactNode} [props.footerActions] - Actions to display in the footer
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.noPadding=false] - Whether to remove padding from content
 * @param {React.ReactNode} props.children - Card content
 * @returns {React.ReactElement} - Card component
 */
const Card = ({
  title,
  headerActions,
  footerActions,
  className = '',
  noPadding = false,
  children,
  ...props
}) => {
  const baseClasses = [
    'sofia-card',
    className
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'sofia-card-content',
    noPadding ? 'p-0' : ''
  ].filter(Boolean).join(' ');

  const hasHeader = title || headerActions;
  const hasFooter = footerActions;

  return (
    <div className={baseClasses} {...props}>
      {hasHeader && (
        <div className="sofia-card-header">
          {title && <h3 className="sofia-card-title">{title}</h3>}
          {headerActions && <div className="sofia-card-actions">{headerActions}</div>}
        </div>
      )}
      <div className={contentClasses}>{children}</div>
      {hasFooter && (
        <div className="sofia-card-footer">
          {footerActions}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.node,
  headerActions: PropTypes.node,
  footerActions: PropTypes.node,
  className: PropTypes.string,
  noPadding: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

/**
 * Card.Header - A subcomponent for custom card headers
 */
const CardHeader = ({ className = '', children, ...props }) => {
  const classes = ['sofia-card-header', className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

/**
 * Card.Content - A subcomponent for card content
 */
const CardContent = ({ className = '', noPadding = false, children, ...props }) => {
  const classes = [
    'sofia-card-content',
    noPadding ? 'p-0' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

CardContent.propTypes = {
  className: PropTypes.string,
  noPadding: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

/**
 * Card.Footer - A subcomponent for custom card footers
 */
const CardFooter = ({ className = '', children, ...props }) => {
  const classes = ['sofia-card-footer', className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

// Attach subcomponents to Card
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card; 