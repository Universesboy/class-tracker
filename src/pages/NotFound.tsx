import React from 'react';
import { Typography, Button, Container, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFound: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2,
          background: 'linear-gradient(to right bottom, #ffffff, #f7f9fc)'
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 2, mb: 4 }}>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        
        <Button 
          component={Link} 
          to="/"
          variant="contained" 
          color="primary" 
          size="large"
          startIcon={<HomeIcon />}
          sx={{ 
            borderRadius: 2,
            px: 4,
            py: 1
          }}
        >
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFound; 