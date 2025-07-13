import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Menu, MenuItem, Avatar, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import useAuthStore from '../../store/authStore';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { navItems } from './Sidebar';

interface HeaderProps {
    drawerWidth: number;
    handleDrawerToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ drawerWidth, handleDrawerToggle }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const currentPage = navItems.find(item => item.path === location.pathname);
    const pageTitle = currentPage ? currentPage.text : 'ניהול מרכז טיפולי';

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    
    const handleLogout = async () => {
        handleCloseUserMenu();
        await logout();
        navigate('/login');
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                mr: { sm: `${drawerWidth}px` }, // For RTL, margin is on the right
                backgroundColor: 'background.paper',
                color: 'text.primary',
                borderBottom: 1,
                borderColor: 'divider',
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{
                        display: { sm: 'none' },
                        mr: 2, // For RTL, margin is on the right
                    }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    {pageTitle}
                </Typography>
                
                <Box sx={{ flexGrow: 0 }}>
                    <Tooltip title="פתח הגדרות משתמש">
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            <Avatar alt={user?.name} sx={{ bgcolor: 'primary.main' }}>
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        sx={{ mt: '45px' }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                        <MenuItem component={NavLink} to="/profile" onClick={handleCloseUserMenu}>
                            <Typography textAlign="center">פרופיל</Typography>
                        </MenuItem>
                         <MenuItem onClick={handleLogout}>
                            <Typography textAlign="center">התנתקות</Typography>
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
