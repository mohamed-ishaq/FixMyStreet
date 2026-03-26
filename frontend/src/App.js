import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { getRouteTitle } from './utils/routeHelpers';
import theme from './theme';
import './styles/index.css';
import './styles/App.css';

function App() {
  // Update document title based on route
  useEffect(() => {
    const handleRouteChange = () => {
      const title = getRouteTitle(window.location.pathname);
      document.title = `${title} | Civic Issues Platform`;
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="app bg-gradient-subtle">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#2d3748',
                  color: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#38a169',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#e53e3e',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Header />
            <main className="main-content">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;