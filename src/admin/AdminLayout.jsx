import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const location = useLocation();

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
  };

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/blog')) return 'Blog Management';
    if (path.includes('/resources')) return 'Resources';
    if (path.includes('/links')) return 'Links';
    if (path.includes('/map')) return 'Map Editor';
    if (path.includes('/gallery')) return 'Gallery';
    if (path.includes('/experiences')) return 'Experiences';
    if (path.includes('/reading')) return 'Reading Log';
    if (path.includes('/messages')) return 'Messages';
    if (path.includes('/content')) return 'Content Studio';
    return 'Dashboard';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      display: 'flex',
    }}>
      {/* Fixed Sidebar - always visible on desktop */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area - offset by sidebar width on desktop */}
      <div style={{
        flex: 1,
        marginLeft: isDesktop ? '240px' : '0',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: isDesktop ? 'calc(100% - 240px)' : '100%',
      }}>
        <AdminHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle()}
          showMenuButton={!isDesktop}
        />

        <main style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
