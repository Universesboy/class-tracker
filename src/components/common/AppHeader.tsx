import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  useMediaQuery, 
  useTheme,
  ListItemButton,
  Avatar,
  Tooltip,
  Badge,
  Chip,
  Container,
  alpha
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Home as HomeIcon, 
  Group as GroupIcon, 
  PersonAdd as PersonAddIcon,
  AddShoppingCart as AddShoppingCartIcon,
  HowToReg as HowToRegIcon,
  Logout as LogoutIcon,
  SportsTennis as SportsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

function AppHeader() {
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleDrawer = (open: boolean) => 
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  const navItems = [
    { 
      text: 'Dashboard', 
      icon: <HomeIcon />, 
      path: '/',
      roles: [UserRole.Admin]
    },
    { 
      text: 'Students', 
      icon: <GroupIcon />, 
      path: '/students',
      roles: [UserRole.Admin]
    },
    { 
      text: 'Add Student', 
      icon: <PersonAddIcon />, 
      path: '/students/add',
      roles: [UserRole.Admin]
    },
    { 
      text: 'Record Purchase', 
      icon: <AddShoppingCartIcon />, 
      path: '/record-purchase',
      roles: [UserRole.Admin]
    },
    { 
      text: 'Attendance', 
      icon: <HowToRegIcon />, 
      path: '/attendance',
      roles: [UserRole.Admin, UserRole.Student]
    }
  ];

  const filteredNavItems = currentUser 
    ? navItems.filter(item => item.roles.includes(currentUser.role))
    : [];

  const drawer = (
    <Box
      sx={{ width: 280 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #4361ee, #3a56d4)',
              color: 'white',
              mr: 1.5,
              boxShadow: '0px 4px 8px rgba(67, 97, 238, 0.3)'
            }}
          >
            <SportsIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" noWrap component="div" fontWeight="bold">
              Badminton Tracker
            </Typography>
            {currentUser && (
              <Chip 
                size="small" 
                label={currentUser.role === UserRole.Admin ? 'Admin' : 'Student'} 
                color={currentUser.role === UserRole.Admin ? 'primary' : 'secondary'}
                sx={{ 
                  mt: 0.5, 
                  height: 22, 
                  fontWeight: 500, 
                  fontSize: '0.7rem',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              />
            )}
          </Box>
        </Box>
        <IconButton 
          onClick={toggleDrawer(false)}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Divider sx={{ mx: 2 }} />
      
      <Box sx={{ pt: 2, pb: 1 }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            px: 3, 
            mb: 1, 
            display: 'block',
            textTransform: 'uppercase',
            fontWeight: 500,
            letterSpacing: '0.5px'
          }}
        >
          Menu
        </Typography>
        <List sx={{ px: 2 }}>
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  component={Link} 
                  to={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      }
                    },
                    '&:hover': {
                      transform: 'translateX(5px)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 44,
                    color: isActive ? 'primary.main' : 'action.active',
                    '& .MuiSvgIcon-root': {
                      transition: 'transform 0.2s ease',
                    },
                    '&:hover .MuiSvgIcon-root': {
                      transform: 'rotate(5deg)'
                    }
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.95rem'
                    }}
                  />
                  {isActive && (
                    <Box 
                      sx={{ 
                        width: 4, 
                        height: 20, 
                        borderRadius: 4,
                        bgcolor: 'primary.main',
                        ml: 1
                      }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      
      <Divider sx={{ mx: 2, my: 2 }} />
      
      {currentUser && (
        <Box sx={{ p: 2 }}>
          <Box 
            sx={{ 
              p: 2,
              mb: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              display: 'flex', 
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: 'primary.main',
                fontSize: '0.9rem',
                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography variant="body2" noWrap fontWeight={600}>
                {currentUser.displayName || currentUser.email}
              </Typography>
              {currentUser.displayName && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {currentUser.email}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Button 
            onClick={handleLogout}
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            fullWidth
            size="medium"
            sx={{ 
              justifyContent: 'center', 
              p: 1.2,
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderWidth: '2px',
                transform: 'translateY(-2px)',
                boxShadow: '0px 4px 8px rgba(229, 56, 59, 0.2)'
              }
            }}
          >
            Log Out
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={0}
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.06)',
          py: 0.5
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 0.5, px: { xs: 0, sm: 2 } }}>
            {currentUser && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ 
                  mr: 2, 
                  borderRadius: 1.5,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'rotate(-10deg)'
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #4361ee, #3a56d4)',
                  color: 'white',
                  mr: 1.5,
                  boxShadow: '0px 4px 8px rgba(67, 97, 238, 0.3)'
                }}
              >
                <SportsIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography 
                variant="h6" 
                component={Link} 
                to="/"
                sx={{ 
                  flexGrow: 1, 
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  color: 'text.primary',
                  background: 'linear-gradient(90deg, #2b2d42, #6c757d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}
              >
                Badminton Class Tracker
              </Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {currentUser ? (
              <>
                {!isMobile && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                    {filteredNavItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Button 
                          color={isActive ? 'primary' : 'inherit'} 
                          component={Link} 
                          to={item.path}
                          key={item.text}
                          startIcon={item.icon}
                          sx={{ 
                            mx: 0.5,
                            fontWeight: isActive ? 600 : 500,
                            position: 'relative',
                            py: 1.5,
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              transform: 'translateY(-2px)'
                            },
                            '&::after': isActive ? {
                              content: '""',
                              position: 'absolute',
                              bottom: 6,
                              left: '20%',
                              width: '60%',
                              height: '3px',
                              bgcolor: 'primary.main',
                              borderRadius: '3px 3px 0 0',
                            } : {}
                          }}
                        >
                          {item.text}
                        </Button>
                      );
                    })}
                  </Box>
                )}
                
                <Tooltip title="Logout">
                  <Button 
                    variant="outlined"
                    color="inherit"
                    onClick={handleLogout}
                    endIcon={<LogoutIcon />}
                    sx={{ 
                      display: { xs: 'none', sm: 'flex' },
                      borderWidth: '1.5px',
                      borderRadius: 2,
                      px: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: theme.palette.error.main,
                        color: theme.palette.error.main,
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    Logout
                  </Button>
                </Tooltip>
                
                <Tooltip title="Logout">
                  <IconButton 
                    color="inherit" 
                    onClick={handleLogout}
                    size="small"
                    sx={{ 
                      display: { sm: 'none' },
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: theme.palette.error.main,
                        transform: 'rotate(10deg)'
                      }
                    }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Button 
                  color="primary" 
                  component={Link} 
                  to="/login"
                  variant="contained"
                  sx={{ 
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: '0px 4px 10px rgba(67, 97, 238, 0.3)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0px 6px 15px rgba(67, 97, 238, 0.4)'
                    }
                  }}
                >
                  Login
                </Button>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            borderRadius: '0 24px 24px 0',
            boxShadow: '0px 8px 40px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default AppHeader;