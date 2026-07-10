import { useState } from 'react';
import { Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/pro-regular-svg-icons';
import './Sidebar.scss';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Link } from '@tanstack/react-router';
import SidebarTooltip from './SidebarToolTip';
import { externalLinks, menuLinks } from '@/constants/menu-options';

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className = '' }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside
      className={`d-flex flex-column p-3 ${className} sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{ transition: 'width 0.2s ease-in-out' }}
    >
      {/* --- TOP NAVIGATION GROUP --- */}
      <div className="d-flex flex-column gap-2 top-menu">
        {menuLinks.map((link) => {
          return (
            <SidebarTooltip
              text={link.text}
              isCollapsed={isCollapsed}
              key={link.text}
              isExternal={false}
            >
              <Link
                to={link.url}
                className={`d-flex align-items-start ${isCollapsed && 'justify-content-center'} text-decoration-none py-2 rounded hover-effect icon-container-wrapper`}
              >
                <div className="sidebar-icon-container flex-shrink-0 mt-1">
                  <Image
                    src={link.icon}
                    alt={link.iconAlt}
                    width={20}
                    height={20}
                  />
                </div>
                {!isCollapsed && <>{link.text}</>}
              </Link>
            </SidebarTooltip>
          );
        })}
      </div>

      {/* --- COMBINED BOTTOM GROUP --- */}
      <div className="d-flex flex-column mt-auto">
        {isCollapsed ? (
          <hr />
        ) : (
          <span className="text-nowrap fs-6 p-2 sub-title">
            Quick Links{' '}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare as IconProp} />
          </span>
        )}
        <div className="d-flex flex-column gap-2 mb-2">
          {externalLinks.map((link) => {
            return (
              <SidebarTooltip
                text={link.text}
                isCollapsed={isCollapsed}
                key={link.text}
                isExternal={true}
              >
                <a
                  href={link.url}
                  target="_blank"
                  className={`d-flex align-items-start ${isCollapsed && 'justify-content-center'} text-decoration-none py-2 rounded hover-effect icon-container-wrapper`}
                  rel="noreferrer"
                >
                  <div className="sidebar-quick-link-container flex-shrink-0 mt-1">
                    <Image
                      src={link.icon}
                      alt={link.iconAlt}
                      width={16}
                      height={16}
                    />
                  </div>
                  {!isCollapsed && (
                    <span className="ms-2 link-text">{link.text}</span>
                  )}
                </a>
              </SidebarTooltip>
            );
          })}
        </div>
        <button
          className={`btn btn-link w-100 d-flex align-items-right justify-content-end ${isCollapsed && 'justify-content-center'}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
          type="button"
        >
          {isCollapsed ? (
            <Image
              src="/images/sidebar/expand-icon.svg"
              alt="Expand Icon"
              width={24}
              height={24}
            />
          ) : (
            <Image
              src="/images/sidebar/collapse-icon.svg"
              alt="Collapse Icon"
              width={24}
              height={24}
            />
          )}
        </button>
      </div>
    </aside>
  );
};
