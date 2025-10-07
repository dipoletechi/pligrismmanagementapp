import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  DirectionsBus as TripIcon,
  AccountBalance as FinanceIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  LocalShipping as TransportIcon,
  Support as SupportIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['superadmin', 'admin', 'trip_manager', 'financial_manager', 'user'] },
  { text: 'Trip Management', icon: <TripIcon />, path: '/trips', roles: ['superadmin', 'admin', 'trip_manager', 'financial_manager', 'user'] },
  { text: 'Master Data', icon: <LocationIcon />, path: '/master-data', roles: ['superadmin', 'admin'] },
  { text: 'Financial Management', icon: <FinanceIcon />, path: '/finance', roles: ['superadmin', 'admin', 'financial_manager'] },
  { text: 'Vendors Management', icon: <PeopleIcon />, path: '/vendors', roles: ['superadmin', 'admin'] },
  { text: 'Transportation', icon: <TransportIcon />, path: '/transport', roles: ['superadmin', 'admin'] },
  { text: 'Support Management', icon: <SupportIcon />, path: '/support', roles: ['superadmin', 'admin'] },
  { text: 'User Management', icon: <PeopleIcon />, path: '/users', roles: ['superadmin'] },
  { text: 'Reports', icon: <ReportsIcon />, path: '/reports', roles: ['superadmin', 'admin', 'trip_manager', 'financial_manager'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['superadmin', 'admin'] }
];

const MasterDataSubMenu = [
  { text: 'Destinations', path: '/master-data/destinations' },
  { text: 'Amenities', path: '/master-data/amenities' },
  { text: 'Food Management', path: '/master-data/food' }
];

const TripSubMenu = [
  { text: 'Create Trip', path: '/trips/create' },
  { text: 'List Trips', path: '/trips/list' },
  { text: 'Trip Tracking', path: '/trips/tracking' }
];

const FinanceSubMenu = [
  { text: 'Vendors', path: '/finance/vendors' },
  { text: 'Budget Management', path: '/finance/budget' },
  { text: 'Vendor Finance', path: '/finance/vendor-finance' }
];

const VendorsSubMenu = [
  { text: 'Accommodation', path: '/vendors/accommodation' },
  { text: 'Food', path: '/vendors/food' },
  { text: 'Transport', path: '/vendors/transport' }
];

const TransportSubMenu = [
  { text: 'Transport Management', path: '/transport' }
];

function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user, logout, hasAnyRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const toggleSubMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const getFilteredMenuItems = () => {
    return menuItems.filter(item => hasAnyRole(item.roles));
  };

  const getSubMenu = (path) => {
    switch (path) {
      case '/master-data':
        return MasterDataSubMenu;
      case '/trips':
        return TripSubMenu;
      case '/finance':
        return FinanceSubMenu;
      case '/vendors':
        return VendorsSubMenu;
      case '/transport':
        return TransportSubMenu;
      default:
        return [];
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Tirth Yatra
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getFilteredMenuItems().map((item) => {
          const subMenu = getSubMenu(item.path);
          const isExpanded = expandedMenus[item.path];
          const isActive = location.pathname.startsWith(item.path);

          return (
            <div key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (subMenu.length > 0) {
                      toggleSubMenu(item.path);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  selected={isActive && subMenu.length === 0}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{ color: isActive ? 'primary.main' : 'inherit' }}
                  />
                  {subMenu.length > 0 && (
                    <IconButton size="small">
                      {isExpanded ? '▼' : '▶'}
                    </IconButton>
                  )}
                </ListItemButton>
              </ListItem>
              
              {subMenu.length > 0 && isExpanded && (
                <List component="div" disablePadding>
                  {subMenu.map((subItem) => (
                    <ListItem key={subItem.text} disablePadding>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => navigate(subItem.path)}
                        selected={location.pathname === subItem.path}
                      >
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </div>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Tirth Yatra Admin Panel
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <AccountIcon sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default MainLayout;
