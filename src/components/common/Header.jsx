// /home/caleb/Desktop/PROJECTS/KHC/src/components/common/Header.jsx
import React, { useState, useEffect } from 'react';
import { Menu, Shield, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Header = ({ toggleSidebar, title = 'Dashboard' }) => {
  const { user } = useAuth();
  
  // Theme switcher state with localStorage persistence
  const [theme, setTheme] = useState(localStorage.getItem('khc_theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('khc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const headerStyle = {
    height: '70px',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    position: 'sticky',
    top: 0,
    zIndex: 900,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
  };

  return (
    <header style={headerStyle}>
      {/* Left side: Hamburger (mobile) + Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--gold-primary)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="sidebar-toggle-btn"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={22} />
        </button>

        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600',
          fontFamily: 'var(--font-heading)',
          margin: 0
        }}>
          {title}
        </h1>
      </div>

      {/* Right side: Theme Toggle + Admin system status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--gold-primary)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color var(--transition-fast)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Admin Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.85rem',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderRadius: '20px',
          border: '1px solid rgba(37, 99, 235, 0.15)',
        }} className="sm-hide">
          <Shield size={14} style={{ color: 'var(--gold-primary)' }} />
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: '600', 
            color: 'var(--gold-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-heading)'
          }}>
            {user?.role || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
