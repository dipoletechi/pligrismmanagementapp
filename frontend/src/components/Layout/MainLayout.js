import React, { useState, useEffect } from 'react';
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
  Person as PersonIcon,
  LocationOn as LocationIcon,
  LocalShipping as TransportIcon,
  Support as SupportIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightSubIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;
const collapsedDrawerWidth = 70;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['superadmin', 'admin', 'trip_manager', 'financial_manager', 'user'] },
  { text: 'Trip Management', icon: <TripIcon />, path: '/trips', roles: ['superadmin', 'admin', 'trip_manager', 'financial_manager', 'user'] },
  { text: 'Master Data', icon: <LocationIcon />, path: '/master-data', roles: ['superadmin', 'admin'] },
  { text: 'Vendors Management', icon: <PeopleIcon />, path: '/vendors', roles: ['superadmin', 'admin', 'financial_manager'] },
  { text: 'Support Management', icon: <SupportIcon />, path: '/support', roles: ['superadmin', 'admin'] },
  { text: 'User Management', icon: <PeopleIcon />, path: '/users', roles: ['superadmin'] },
  { text: 'Pilgrim', icon: <PersonIcon />, path: '/pilgrims', roles: ['superadmin', 'admin', 'trip_manager'] },
  { text: 'Reports', icon: <ReportsIcon />, path: '/reports', roles: ['superadmin', 'admin', 'trip_manager', 'financial_manager'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['superadmin', 'admin', 'trip_manager', 'financial_manager', 'user'] }
];

const MasterDataSubMenu = [
  { text: 'Destinations', path: '/master-data/destinations', permissions: { module: 'destinations', action: 'read' } },
  { text: 'Amenities', path: '/master-data/amenities', permissions: { module: 'amenities', action: 'read' } },
  { text: 'Food Management', path: '/master-data/food', permissions: { module: 'food', action: 'read' } }
];

const TripSubMenu = [
  { text: 'Create Trip', path: '/trips/create', permissions: { module: 'trips', action: 'create' } },
  { text: 'List Trips', path: '/trips/list', permissions: { module: 'trips', action: 'read' } }
];


const VendorsSubMenu = [
  { text: 'Accommodation', path: '/vendors/accommodation', permissions: { module: 'vendors', action: 'read' } },
  { text: 'Food', path: '/vendors/food', permissions: { module: 'vendors', action: 'read' } },
  { text: 'Transport', path: '/vendors/transport', permissions: { module: 'vendors', action: 'read' } }
];

function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user, logout, hasAnyRole, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Reset menu expansion when location changes, but keep relevant menus open
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Determine which menu should be expanded based on current path
    const newExpandedMenus = {};
    
    if (currentPath.startsWith('/master-data')) {
      newExpandedMenus['/master-data'] = true;
    } else if (currentPath.startsWith('/trips')) {
      newExpandedMenus['/trips'] = true;
    } else if (currentPath.startsWith('/finance')) {
      newExpandedMenus['/finance'] = true;
    } else if (currentPath.startsWith('/vendors')) {
      newExpandedMenus['/vendors'] = true;
    }
    
    setExpandedMenus(newExpandedMenus);
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    // Close all expanded menus when collapsing
    if (!sidebarCollapsed) {
      setExpandedMenus({});
    }
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
    let subMenu = [];
    switch (path) {
      case '/master-data':
        subMenu = MasterDataSubMenu;
        break;
      case '/trips':
        subMenu = TripSubMenu;
        break;
      case '/vendors':
        subMenu = VendorsSubMenu;
        break;
      default:
        return [];
    }
    
    // Filter submenu items based on permissions
    return subMenu.filter(item => {
      if (item.permissions) {
        return hasPermission(item.permissions.module, item.permissions.action);
      }
      return true; // If no permissions specified, show the item
    });
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        px: sidebarCollapsed ? 1 : 2,
        minHeight: '64px !important'
      }}>
        {!sidebarCollapsed && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            Tirth Yatra
          </Typography>
        )}
        <IconButton 
          onClick={handleSidebarToggle}
          sx={{ 
            color: 'inherit',
            ...(sidebarCollapsed && { mx: 'auto' })
          }}
        >
          {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ px: sidebarCollapsed ? 0.5 : 1 }}>
        {getFilteredMenuItems().map((item) => {
          const subMenu = getSubMenu(item.path);
          const isExpanded = expandedMenus[item.path];
          const isActive = location.pathname.startsWith(item.path);

          return (
            <div key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (subMenu.length > 0 && !sidebarCollapsed) {
                      toggleSubMenu(item.path);
                    } else if (subMenu.length === 0) {
                      navigate(item.path);
                    }
                  }}
                  selected={false}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    mx: sidebarCollapsed ? 0.5 : 0,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    ...(isActive && {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                      '& .MuiListItemText-primary': {
                        color: 'white',
                      }
                    })
                  }}
                  title={sidebarCollapsed ? item.text : ''}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? 'white' : 'inherit',
                    minWidth: sidebarCollapsed ? 'auto' : 40,
                    justifyContent: 'center',
                    mr: sidebarCollapsed ? 0 : 2
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!sidebarCollapsed && (
                    <>
                      <ListItemText 
                        primary={item.text}
                        sx={{ 
                          color: isActive ? 'white' : 'inherit',
                          '& .MuiListItemText-primary': {
                            fontSize: '0.9rem',
                            fontWeight: isActive ? 600 : 400
                          }
                        }}
                      />
                      {subMenu.length > 0 && (
                        <IconButton size="small" sx={{ color: 'inherit' }}>
                          {isExpanded ? <ExpandMoreIcon /> : <ChevronRightSubIcon />}
                        </IconButton>
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
              
              {subMenu.length > 0 && isExpanded && !sidebarCollapsed && (
                <List component="div" disablePadding sx={{ 
                  ml: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1,
                  mx: 1,
                  py: 0.5
                }}>
                  {subMenu.map((subItem) => (
                    <ListItem key={subItem.text} disablePadding>
                      <ListItemButton
                        sx={{ 
                          borderRadius: 1,
                          mb: 0.5,
                          pl: 7,
                          ml: 1,
                          mr: 1,
                          backgroundColor: 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          },
                          ...(location.pathname === subItem.path && {
                            backgroundColor: 'rgba(25, 118, 210, 0.12)',
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.16)',
                            },
                            '& .MuiListItemText-primary': {
                              color: 'primary.main',
                              fontWeight: 600
                            }
                          })
                        }}
                        onClick={() => {
                          // For Create Trip, always navigate with fresh state
                          if (subItem.path === '/trips/create') {
                            navigate(subItem.path, { 
                              state: { 
                                isEditMode: false, 
                                isViewMode: false, 
                                editingTrip: null 
                              } 
                            });
                          } else {
                            navigate(subItem.path);
                          }
                        }}
                        selected={location.pathname === subItem.path && !location.state?.isEditMode && !location.state?.isViewMode}
                      >
                        <ListItemText 
                          primary={subItem.text}
                          sx={{ 
                            '& .MuiListItemText-primary': {
                              fontSize: '0.85rem',
                              fontWeight: location.pathname === subItem.path ? 600 : 400,
                              color: location.pathname === subItem.path ? 'primary.main' : 'text.secondary'
                            }
                          }}
                        />
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
          width: { sm: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { sm: `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px` },
          transition: 'all 0.3s ease',
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
                {(user?.firstName && user?.lastName) 
                  ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                  : (user?.name?.charAt(0)?.toUpperCase() || 'U')
                }
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ 
          width: { sm: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth }, 
          flexShrink: { sm: 0 },
          transition: 'width 0.3s ease'
        }}
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              transition: 'width 0.3s ease',
              overflowX: 'hidden'
            },
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
          width: { sm: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          mt: 8,
          transition: 'all 0.3s ease'
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
        <MenuItem onClick={() => navigate('/settings', { state: { fromProfile: true } })}>
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
