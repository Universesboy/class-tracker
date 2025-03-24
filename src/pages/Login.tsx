import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Alert,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  Avatar
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined as LockIcon,
  SportsTennis as SportsIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      
      // Provide more specific error messages based on Firebase error codes
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password. If you haven\'t created an account yet, please register first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many unsuccessful login attempts. Please try again later or reset your password.');
      } else {
        setError(`Login failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: 8,
        backgroundImage: 'linear-gradient(135deg, rgba(67, 97, 238, 0.1) 0%, rgba(217, 217, 255, 0.1) 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 3, sm: 4, md: 5 },
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration element */}
          <Box 
            sx={{ 
              position: 'absolute',
              top: -70,
              right: -70,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, rgba(67, 97, 238, 0.15), rgba(76, 201, 240, 0.1))',
              zIndex: 0
            }} 
          />
          
          {/* App logo and name */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, zIndex: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 50, 
                height: 50,
                mr: 2,
                boxShadow: '0 4px 12px rgba(67, 97, 238, 0.3)',
              }}
            >
              <SportsIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1" fontWeight="bold">
                Badminton Tracker
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your badminton classes
              </Typography>
            </Box>
          </Box>
          
          <Typography 
            variant="h4" 
            component="div" 
            fontWeight="bold" 
            textAlign="center"
            gutterBottom
            sx={{ 
              mb: 1,
              background: 'linear-gradient(90deg, #4361ee 30%, #4cc9f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              zIndex: 1
            }}
          >
            Welcome Back
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            textAlign="center" 
            sx={{ mb: 4, maxWidth: '80%', zIndex: 1 }}
          >
            Sign in to your account to access the badminton class management system
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(229, 56, 59, 0.1)'
              }}
            >
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', zIndex: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5 }}
              InputProps={{
                sx: { borderRadius: 2, backgroundColor: 'white' }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                sx: { borderRadius: 2, backgroundColor: 'white' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ 
                mt: 4, 
                mb: 3,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: 2,
                boxShadow: '0 4px 10px rgba(67, 97, 238, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(67, 97, 238, 0.4)',
                }
              }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                New here?
              </Typography>
            </Divider>
            
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <MuiLink 
                  component={Link} 
                  to="/register" 
                  variant="body2"
                  sx={{ 
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'none',
                    }
                  }}
                >
                  Register now
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 