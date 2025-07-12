/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Tooltip,
  useMediaQuery,
  CssBaseline,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LoginIcon from '@mui/icons-material/Login';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SecurityIcon from '@mui/icons-material/Security';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';

import { getTheme } from './config/theme';
import { useClinicStore } from './store';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './views/DashboardView';
import { PatientDetailView } from './views/PatientDetailView';
import { CalendarView } from './views/CalendarView';
import { PaymentsView } from './views/PaymentsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { ReferralView } from './views/ReferralView';
import { GuardView } from './views/GuardView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import { RoomSchedulingView } from './views/RoomSchedulingView';
import { RoomCalendarView } from './views/RoomCalendarView';
import { DataImportDialog } from './components/DataImportDialog';
import { PatientsView } from './views/PatientsView';
import { useUser } from './context/UserContext';
import { signOut } from './lib/auth';

const drawerWidth = 250;

const menuItems = [
  { text: 'לוח מחוונים', icon: <DashboardIcon />, view: 'dashboard', roles: ['מנהל/ת', 'מטפל/ת', 'מזכירה', 'תחשיבנית'] },
  { text: 'מטופלים', icon: <PeopleIcon />, view: 'patients', roles: ['מנהל/ת', 'מטפל/ת', 'מזכירה', 'תחשיבנית'] },
  { text: 'יומן פגישות', icon: <EventIcon />, view: 'calendar', roles: ['מנהל/ת', 'מטפל/ת', 'מזכירה'] },
  { text: 'שיבוץ חדרים', icon: <MeetingRoomIcon />, view: 'room-scheduling', roles: ['מזכירה'] },
  { text: 'יומן חדרים', icon: <ViewAgendaIcon />, view: 'room-calendar', roles: ['מנהל/ת', 'מטפל/ת', 'מזכירה'] },
  { text: 'סקירה פיננסית', icon: <PaymentsIcon />, view: 'payments', roles: ['מנהל/ת', 'תחשיבנית'] },
  { text: 'דוחות', icon: <AssessmentIcon />, view: 'reports', roles: ['מנהל/ת', 'תחשיבנית'] },
  { text: 'מאגר ידע', icon: <LibraryBooksIcon />, view: 'knowledge', roles: ['מנהל/ת', 'מטפל/ת', 'מזכירה', 'תחשיבנית'] },
  { text: 'הגדרות', icon: <SettingsIcon />, view: 'settings', roles: ['מנהל/ת'] },
  { text: 'תצוגת שומר', icon: <SecurityIcon />, view: 'guard', roles: ['מנהל/ת', 'מזכירה', 'שומר'] },
];

const App = () => {
    const userProfile = useUser();
    // State is now managed by Zustand store for non-auth state
    const {
        view,
        selectedPatientId,
        drawerOpen,
        snackbar,
        userMenuAnchor,
        setView,
        setSelectedPatientId,
        setDrawerOpen,
        closeSnackbar,
        setUserMenuAnchor
    } = useClinicStore();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const selectedPatient = useClinicStore(state => state.patients.find(p => p.id === state.selectedPatientId));

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  const handleLogout = async () => {
    await signOut();
    setUserMenuAnchor(null);
  };

  const renderView = () => {
    // These views do not require authentication
    if (view === 'login') return <LoginScreen />;
    if (view === 'referral') return <ReferralView />;
    
    // All subsequent views require a logged-in user
    if (!userProfile) return <LoginScreen />;

    // Authenticated views
    if(view === 'guard') return <GuardView />;
    if (selectedPatientId && selectedPatient) {
      return <PatientDetailView patient={selectedPatient} />;
    }
    switch (view) {
      case 'dashboard': return <DashboardView />;
      case 'patients': return <PatientsView />;
      case 'calendar': return <CalendarView />;
      case 'room-scheduling': return <RoomSchedulingView />;
      case 'room-calendar': return <RoomCalendarView />;
      case 'payments': return <PaymentsView />;
      case 'reports': return <ReportsView />;
      case 'knowledge': return <KnowledgeBaseView />;
      case 'settings': return <SettingsView />;
      default: return <Typography>View not found</Typography>;
    }
  };

  const visibleMenuItems = menuItems.filter(item => userProfile && item.roles.includes(userProfile.role));

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1 }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, mb: 1 }}>
        <img src="https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/clinical_notes/default/48px.svg" alt="logo" width="32" height="32" />
        <Typography variant="h6" sx={{fontWeight: 'bold'}}>מערכת ניהול</Typography>
      </Toolbar>
      <List sx={{ flexGrow: 1, px: 1 }}>
        {visibleMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={view === item.view}
              onClick={() => { setView(item.view); if(isMobile) setDrawerOpen(false); setSelectedPatientId(null); }}
              sx={{ 
                minHeight: 48, 
                justifyContent: 'initial', 
                px: 2.5, 
                mb: 0.5,
                borderRadius: 'var(--card-radius)', 
                '&.Mui-selected': { 
                  bgcolor: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  fontWeight: 'bold',
                  '& .MuiListItemIcon-root': {
                    color: 'var(--primary-dark)',
                  }
                },
                '&:hover': {
                   bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: 1 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
       <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">© 2024 מרכז טיפולי</Typography>
        </Box>
    </Box>
  );

  // Special view for Guard role
  if (userProfile?.role === 'שומר') {
    return (
       <Box sx={{bgcolor: 'background.default', minHeight: '100vh', p: {xs: 1, sm: 2, md: 4}}}>
         <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', mb: 2 }}>
            <Toolbar sx={{ p: '0 !important' }}>
                <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 'bold' }}>
                    תצוגת שומר
                </Typography>
                <Button color="inherit" onClick={handleLogout}>התנתקות</Button>
            </Toolbar>
        </AppBar>
         <GuardView />
       </Box>
    );
  }

  // Handle unauthenticated views
  if (!userProfile || view === 'login' || view === 'referral') {
    return <Box sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
      {renderView()}
    </Box>
  }

  // This handles the main layout for all other authenticated users
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mr: { sm: `${drawerWidth}px` },
          borderBottom: '1px solid var(--border-color)',
          bgcolor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <ThemeToggleButton />
          <Tooltip title="הגדרות משתמש">
            <span>
              <Button
                  color="inherit"
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  startIcon={<Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>{userProfile?.full_name[0]}</Avatar>}
                  sx={{ textTransform: 'none', borderRadius: 'var(--card-radius)'}}
              >
                  <Typography sx={{display: {xs: 'none', md: 'block'}}}>{userProfile?.full_name}</Typography>
              </Button>
            </span>
          </Tooltip>
           <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right'}}
                slotProps={{ paper: { sx: { borderRadius: 'var(--card-radius)', mt: 1 }}}}
            >
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LoginIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>התנתקות</ListItemText>
                </MenuItem>
            </Menu>

        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
              width: drawerWidth, 
              boxSizing: 'border-box', 
              borderLeft: '1px solid var(--border-color)',
              borderRight: 'none',
              backgroundColor: 'var(--sidebar-bg)'
            },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: {xs: 2, sm: 3, md: 4},
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mr: { sm: `${drawerWidth}px` },
          mt: '64px', // For AppBar height
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      >
        {renderView()}
      </Box>

        <DataImportDialog />

       <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
       >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
            {snackbar.message}
        </Alert>
       </Snackbar>
    </Box>
  );
};


const AppWrapper = () => {
    const [mode, setMode] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialMode = savedMode || (prefersDark ? 'dark' : 'light');
        setMode(initialMode);
        document.body.classList.toggle('dark', initialMode === 'dark');
    }, []);

    const toggleTheme = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('themeMode', newMode);
        document.body.classList.toggle('dark', newMode === 'dark');
    };
    
    const theme = useMemo(() => getTheme(mode), [mode]);

    // Provide the toggle function via context
    return (
        <ThemeContext.Provider value={{ toggleTheme }}>
            <ThemeProvider theme={theme}>
                <App />
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}

const ThemeContext = React.createContext({
  toggleTheme: () => {},
});

const ThemeToggleButton = () => {
  const { toggleTheme } = React.useContext(ThemeContext);
  const theme = useTheme();
  return (
    <Tooltip title={theme.palette.mode === 'dark' ? 'עבור למצב בהיר' : 'עבור למצב כהה'}>
      <span>
        <IconButton onClick={toggleTheme} color="inherit">
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
};


export default AppWrapper;