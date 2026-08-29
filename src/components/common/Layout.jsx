// /home/caleb/Desktop/PROJECTS/KHC/src/components/common/Layout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export const Layout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Body Shell Wrapper */}
      <div 
        className="main-content-wrapper" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          minWidth: 0, 
          transition: 'margin-left var(--transition-normal)' 
        }}
      >
        {/* Header toolbar */}
        <Header toggleSidebar={toggleSidebar} title={title} />

        {/* Dynamic Page Container viewport */}
        <main 
          style={{ 
            flex: 1, 
            padding: '2rem 1.5rem', 
            maxWidth: '1200px', 
            width: '100%', 
            margin: '0 auto' 
          }} 
          className="animate-fade-in"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
