// /home/caleb/Desktop/PROJECTS/KHC/src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  LogOut, 
  Church, 
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Members', path: '/members', icon: Users },
    { name: 'Add Member', path: '/members/add', icon: UserPlus },
  ];

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    width: '260px',
    backgroundColor: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transition: 'transform var(--transition-normal)',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
  };

  // Add responsive stylesheet behavior in JS or via global selectors
  // On desktop, the sidebar should show statically.
  // We can write responsive classes in css, but let's make it easy using CSS variable controls, 
  // or a styling wrapper inside Layout.jsx.

  return (
    <>
      {/* Sidebar Overlay on mobile */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
          }}
          className="md-hide"
        />
      )}

      <aside style={sidebarStyle} className="sidebar-element">
        {/* Brand/Logo header */}
        <div style={{
          padding: '1.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(197, 168, 128, 0.1)',
              color: 'var(--gold-primary)',
              border: '1px solid var(--border-color)'
            }}>
              <Church size={20} />
            </div>
            <div>
              <span style={{ 
                fontFamily: 'var(--font-heading)',
                fontWeight: 700, 
                fontSize: '1.25rem',
                letterSpacing: '0.05em',
                background: 'linear-gradient(135deg, var(--gold-dark) 0%, var(--gold-primary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>KHC</span>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>MANAGEMENT</p>
            </div>
          </div>
          
          {/* Close button on Mobile */}
          <button 
            onClick={toggleSidebar}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            className="sidebar-close-btn"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={() => {
                  // Auto close on mobile click
                  if (window.innerWidth <= 768) {
                    toggleSidebar();
                  }
                }}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(135deg, var(--gold-light) 0%, var(--gold-primary) 100%)' : 'transparent',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: isActive ? '600' : '400',
                  textDecoration: 'none',
                  fontSize: '1.02rem',
                  transition: 'all var(--transition-fast)',
                  border: isActive ? '1px solid var(--gold-primary)' : '1px solid transparent'
                })}
                className="nav-link-hover"
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer profile & logout */}
        <div style={{
          padding: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'rgba(37, 99, 235, 0.04)'
        }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--gold-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-heading)'
              }}>
                {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'A'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user.name || 'Admin User'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user.email}
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-danger)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'all var(--transition-fast)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-danger)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = 'var(--color-danger)';
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
