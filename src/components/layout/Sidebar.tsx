import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Divider } from '@mui/material';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SecurityIcon from '@mui/icons-material/Security';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import MenuBookIcon from '@mui/icons-material/MenuBook';

interface SidebarProps {
    drawerWidth: number;
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
}

// Exported for use in other components like the Header for dynamic titles
export const navItems = [
    { text: 'לוח בקרה', path: '/dashboard', icon: <DashboardIcon />, roles: ['admin', 'therapist', 'secretary', 'accountant'] },
    { text: 'מטופלים', path: '/patients', icon: <PeopleIcon />, roles: ['admin', 'therapist', 'secretary'] },
    { text: 'יומן', path: '/calendar', icon: <CalendarMonthIcon />, roles: ['admin', 'therapist', 'secretary'] },
    { text: 'חדרים', path: '/rooms', icon: <MeetingRoomIcon />, roles: ['admin', 'secretary'] },
    { text: 'כספים', path: '/financials', icon: <RequestQuoteIcon />, roles: ['admin', 'accountant'] },
    { text: 'דוחות', path: '/reports', icon: <AssessmentIcon />, roles: ['admin', 'accountant'] },
    { text: 'תצוגת שומר', path: '/guard', icon: <SecurityIcon />, roles: ['admin', 'guard'] },
    { text: 'מאגר ידע', path: '/knowledge-base', icon: <MenuBookIcon />, roles: ['admin', 'therapist', 'secretary', 'accountant'] },
    { text: 'הגדרות', path: '/settings', icon: <SettingsIcon />, roles: ['admin'] },
];

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth, mobileOpen, handleDrawerToggle }) => {
    const { user } = useAuthStore();
    const userRole = user?.role || 'therapist';

    const drawerContent = (
        <div>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                 <Typography variant="h6" noWrap component="div" color="primary.main" fontWeight="bold">
                   מרכז טיפולי
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {navItems.filter(item => item.roles.includes(userRole)).map((item, index) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            component={NavLink}
                            to={item.path}
                            sx={{
                                '&.active': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                                m: 1,
                                borderRadius: 2,
                            }}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
        >
            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Desktop Drawer */}
            <Drawer
                anchor="right"
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderLeft: '1px solid #e0e0e0', borderRight: 'none' },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
