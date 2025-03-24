import React from 'react';
import { Box, Button, Typography, alpha, SvgIconProps } from '@mui/material';
import { Link } from 'react-router-dom';

interface DashboardButtonProps {
  title: string;
  description: string;
  icon: React.ReactElement<SvgIconProps>;
  path: string;
  color?: string;
  gradient?: string;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({
  title,
  description,
  icon,
  path,
  color = 'primary.main',
  gradient = 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)'
}) => {
  return (
    <Button
      component={Link}
      to={path}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
        p: 3,
        height: '100%',
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.08)',
          '& .dashboard-icon-wrapper': {
            transform: 'scale(1.1) rotate(5deg)',
          },
          '& .dashboard-title': {
            color: color,
          },
          '& .dashboard-overlay': {
            opacity: 0.07,
          }
        },
      }}
    >
      {/* Background overlay with gradient that shows on hover */}
      <Box
        className="dashboard-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: gradient,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          zIndex: 0,
        }}
      />

      {/* Icon with background */}
      <Box
        className="dashboard-icon-wrapper"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          borderRadius: 2.5,
          background: alpha(color as string, 0.1),
          color: color,
          mb: 2,
          position: 'relative',
          zIndex: 1,
          transition: 'transform 0.3s ease',
          boxShadow: `0px 4px 10px ${alpha(color as string, 0.2)}`,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 28 } })}
      </Box>

      {/* Title with hover effect */}
      <Typography
        variant="h6"
        component="div"
        className="dashboard-title"
        sx={{ 
          fontWeight: 600, 
          mb: 0.5,
          position: 'relative',
          zIndex: 1,
          transition: 'color 0.3s ease',
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ 
          position: 'relative',
          zIndex: 1,
        }}
      >
        {description}
      </Typography>
    </Button>
  );
};

export default DashboardButton; 