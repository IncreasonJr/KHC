// /home/caleb/Desktop/PROJECTS/KHC/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Components & Layout
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Page Views
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import AddMember from './pages/AddMember';
import EditMember from './pages/EditMember';
import ImportMembers from './pages/ImportMembers';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/common/ErrorBoundary';

// Initialize React Query client for remote state management caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent aggressive automatic tab refocus checks
      retry: 1                     // Single retry on transient network errors
    }
  }
});

// Guard component checking administrative authentication
const ProtectedRoute = ({ children, title }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout title={title}>{children}</Layout>;
};

export const App = () => {
  React.useEffect(() => {
    const storedTheme = localStorage.getItem('khc_theme') || 'light';
    if (storedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />

              {/* Protected dashboard views */}
              <Route
                path="/"
                element={
                  <ProtectedRoute title="Administrative Overview">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute title="Administrative Overview">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/members"
                element={
                  <ProtectedRoute title="Congregant Directory">
                    <Members />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/members/add"
                element={
                  <ProtectedRoute title="New Member Registration">
                    <AddMember />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/members/import"
                element={
                  <ProtectedRoute title="Bulk Member Import">
                    <ImportMembers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/members/:id"
                element={
                  <ProtectedRoute title="Member Profile Records">
                    <MemberProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/members/:id/edit"
                element={
                  <ProtectedRoute title="Update Member Profile">
                    <EditMember />
                  </ProtectedRoute>
                }
              />

              {/* Global 404 Error page route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
