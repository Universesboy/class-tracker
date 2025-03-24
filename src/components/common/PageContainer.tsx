import React, { ReactNode } from 'react';
import { Container, Paper, Box, Typography, Breadcrumbs, useTheme, useMediaQuery, Fade } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

interface PageContainerProps {
  title: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  subtitle?: ReactNode;
}

interface Breadcrumb {
  path: string;
  label: string;
}

// A mapping of paths to human-readable names
const pathNames: Record<string, string> = {
  '/': 'Dashboard',
  '/students': 'Students',
  '/students/add': 'Add Student',
  '/record-purchase': 'Record Purchase',
  '/attendance': 'Attendance',
  '/students/:id/attendance': 'Attendance History',
};

const PageContainer: React.FC<PageContainerProps> = ({ 
  title, 
  children, 
  maxWidth = 'lg',
  subtitle
}) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Generate breadcrumbs from the current path
  const generateBreadcrumbs = (): Breadcrumb[] => {
    const paths = location.pathname.split('/').filter(Boolean);
    let currentPath = '';
    
    const initialBreadcrumbs: Breadcrumb[] = [{ path: '/', label: 'Home' }];
    
    return paths.reduce((acc: Breadcrumb[], path, i) => {
      currentPath += `/${path}`;
      
      // Handle direct student ID (edit student) path
      if (i === 1 && path === 'students' && paths.length > 2 && paths[2] !== 'add' && paths[2] !== 'edit' && !paths[3]) {
        acc.push({ path: '/students', label: 'Students' });
        acc.push({ path: currentPath + '/' + paths[i+1], label: 'Edit Student' });
        return acc;
      }
      
      // Handle special case for attendance with ID
      if (path === 'attendance' && paths[i-1] && paths[i-2] === 'students') {
        acc.push({ path: currentPath, label: 'Attendance History' });
        return acc;
      }
      
      // Check if this is an ID segment (typically used in routes like students/:id)
      if (
        i > 0 && 
        (
          (paths[i-1] === 'students' && paths.length === 3 && i === 2) || // Direct student ID path
          (paths[i-1] !== 'students' && paths[i+1] === 'attendance') ||
          (i === 2 && paths[i-2] === 'students')
        )
      ) {
        return acc; // Skip ID segments
      }
      
      acc.push({ 
        path: currentPath, 
        label: pathNames[currentPath] || path.charAt(0).toUpperCase() + path.slice(1) 
      });
      
      return acc;
    }, initialBreadcrumbs);
  };
  
  const breadcrumbs = generateBreadcrumbs();

  return (
    <Fade in={true} timeout={600}>
      <Container maxWidth={maxWidth} sx={{ mt: 3, mb: 6 }}>
        {/* Page header */}
        <Box 
          sx={{ 
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {/* Background decorative element */}
          <Box 
            sx={{
              position: 'absolute',
              top: 10,
              left: -40,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.1), rgba(247, 37, 133, 0.1))',
              filter: 'blur(40px)',
              zIndex: -1
            }}
          />
          
          {/* Breadcrumbs navigation */}
          {!isMobile && location.pathname !== '/' && (
            <Breadcrumbs 
              aria-label="breadcrumb" 
              sx={{ 
                mb: 1.5,
                '& .MuiBreadcrumbs-ol': {
                  fontSize: '0.85rem',
                },
                '& a': {
                  color: 'text.secondary',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                    transform: 'translateY(-1px)',
                  },
                },
                '& .MuiBreadcrumbs-li:last-child': {
                  color: 'text.primary',
                  fontWeight: 500,
                },
                '& .MuiBreadcrumbs-separator': {
                  color: 'text.disabled'
                }
              }}
            >
              {breadcrumbs.map((breadcrumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                
                return isLast ? (
                  <Typography 
                    key={breadcrumb.path}
                    color="text.primary"
                    fontSize="0.85rem"
                    fontWeight={500}
                  >
                    {breadcrumb.label}
                  </Typography>
                ) : (
                  <Link key={breadcrumb.path} to={breadcrumb.path}>
                    {breadcrumb.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          )}
          
          {/* Page title */}
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            fontWeight={700}
            sx={{
              mb: subtitle ? 1 : 0,
              background: 'linear-gradient(90deg, #2b2d42 30%, #6c757d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: '40px',
                height: '4px',
                borderRadius: '4px',
                background: 'linear-gradient(to right, #4361ee, #f72585)'
              }
            }}
          >
            {title}
          </Typography>
          
          {/* Optional subtitle */}
          {subtitle && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 1, maxWidth: '800px' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {/* Main content */}
        <Paper 
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.05)',
            bgcolor: '#ffffff',
            overflow: 'hidden',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          <Box>
            {children}
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
};

export default PageContainer;