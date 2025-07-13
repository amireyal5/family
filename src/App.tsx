import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import useAuthStore from './store/authStore';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import ReferralPage from './pages/ReferralPage';
import DashboardPage from './pages/DashboardPage';
import PatientListPage from './pages/PatientListPage';
import CalendarPage from './pages/CalendarPage';
import RoomsPage from './pages/RoomsPage';
import FinancialsPage from './pages/FinancialsPage';
import ReportsPage from './pages/ReportsPage';
import GuardPage from './pages/GuardPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';

// A component to protect routes that require authentication
const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuthStore();
  // The DashboardLayout includes the Sidebar and Header, and an <Outlet> for nested routes
  return isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />;
};

// A component for routes accessible only to unauthenticated users
const PublicRoutes = () => {
    const { isAuthenticated } = useAuthStore();
    return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" />;
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/referral" element={<ReferralPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/financials" element={<FinancialsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/guard" element={<GuardPage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          
          {/* Redirect root path to the correct entry point */}
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;