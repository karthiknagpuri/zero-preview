import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    teal: '#4ECDC4',
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'HOME', exact: true },
    { path: '/admin/blog', label: 'Blog', icon: 'BLOG' },
    { path: '/admin/resources', label: 'Resources', icon: 'FILES' },
    { path: '/admin/links', label: 'Links', icon: 'LINKS' },
    { path: '/admin/gallery', label: 'Gallery', icon: 'PHOTOS' },
    { path: '/admin/map', label: 'Map Editor', icon: 'MAP' },
    { path: '/admin/experiences', label: 'Experiences', icon: 'WORK' },
    { path: '/admin/reading', label: 'Reading Log', icon: 'BOOKS' },
    { path: '/admin/messages', label: 'Messages', icon: 'INBOX' },
    { path: '/admin/content', label: 'Content Studio', icon: 'CREATE' },
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // On desktop, sidebar is always visible
  const shouldShow = isDesktop || isOpen;

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      <aside
        style={{
          width: '240px',
          height: '100vh',
          background: theme.surface,
          borderRight: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 50,
          transform: shouldShow ? 'translateX(0)' : 'translateX(-100%)',
          transition: isDesktop ? 'none' : 'transform 0.3s ease',
          overflowY: 'auto',
        }}
      >

        {/* Logo */}
        <div style={{
          padding: '24px',
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: '24px',
            color: theme.text,
            margin: 0,
          }}>
            Zero
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: theme.textMuted,
            margin: '4px 0 0 0',
            letterSpacing: '2px',
          }}>
            ADMIN PANEL
          </p>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: "'Space Mono', monospace",
                fontSize: '13px',
                color: isActive(item.path, item.exact) ? theme.text : theme.textMuted,
                background: isActive(item.path, item.exact) ? theme.bg : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: isActive(item.path, item.exact) ? theme.accent : theme.textMuted,
              }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Back to site */}
        <div style={{
          padding: '16px 12px',
          borderTop: `1px solid ${theme.border}`,
        }}>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.textMuted,
              transition: 'all 0.2s ease',
            }}
          >
            <span>←</span>
            <span>Back to site</span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
