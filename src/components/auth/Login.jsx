import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
  Fade,
  Slide
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email as EmailIcon,
  Lock as LockIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { colorScheme } from '../../utils/colorScheme';
import { useAuth } from '../../utils/authContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlertMessage('');

    try {
      // Mock login for testing - remove this when backend is ready
      console.log('Mock login attempt with:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login response
      const mockResponse = {
        data: {
          user: {
            id: 1,
            email: formData.email,
            username: formData.email.split('@')[0],
            first_name: 'Test',
            last_name: 'User'
          },
          token: 'mock-jwt-token-' + Date.now()
        }
      };
      
      console.log('Mock login response:', mockResponse.data);
      login(mockResponse.data.user, mockResponse.data.token);
      console.log('Login successful, navigating to home...');
      navigate('/');
      
      // Uncomment this when backend is ready:
      // const response = await axios.post('http://localhost:8000/api/auth/login/', formData);
      // console.log('Login response:', response.data);
      // login(response.data.user, response.data.token);
      // console.log('Login successful, navigating to home...');
      // navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setAlertMessage(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >

      {/* Left Side - Form */}
      <Fade in timeout={1000}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            position: 'relative',
            zIndex: 2
          }}
        >
          <Slide direction="right" in timeout={800}>
            <Paper
              elevation={16}
              sx={{
                p: { xs: 3.5, md: 4.5 },
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.3)',
                maxWidth: 450,
                width: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >

              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 3.5 }}>
                <Box
                  sx={{
                    width: 65,
                    height: 65,
                    borderRadius: '50%',
                    background: colorScheme.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2.5,
                    boxShadow: '0 7px 22px rgba(146, 90, 155, 0.3)'
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    color: colorScheme.textPrimary,
                    mb: 0.75,
                    fontSize: { xs: '1.6rem', md: '1.85rem' }
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: colorScheme.textSecondary,
                    fontSize: '0.95rem',
                    fontWeight: 400
                  }}
                >
                  Sign in to your analytics dashboard
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#888',
                    fontSize: '0.75rem',
                    mt: 1,
                    display: 'block'
                  }}
                >
                  💡 Test: Use any email and password (6+ chars)
                </Typography>
              </Box>

              {alertMessage && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: '0.875rem'
                  }}
                >
                  {alertMessage}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: colorScheme.primary, fontSize: 19 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '0.92rem',
                      background: '#fafafa',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: '#f5f5f5'
                      },
                      '&.Mui-focused': {
                        background: '#ffffff',
                        boxShadow: '0 0 0 2px rgba(146, 90, 155, 0.2)'
                      },
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                        borderWidth: '1px'
                      },
                      '&:hover fieldset': {
                        borderColor: colorScheme.primary,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorScheme.primary,
                        borderWidth: '2px'
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.87rem',
                      color: colorScheme.textSecondary
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: colorScheme.primary,
                      fontWeight: 500
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: colorScheme.primary, fontSize: 19 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          size="small"
                          sx={{ 
                            color: colorScheme.primary,
                            '&:hover': {
                              background: 'rgba(146, 90, 155, 0.1)'
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '0.92rem',
                      background: '#fafafa',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: '#f5f5f5'
                      },
                      '&.Mui-focused': {
                        background: '#ffffff',
                        boxShadow: '0 0 0 2px rgba(146, 90, 155, 0.2)'
                      },
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                        borderWidth: '1px'
                      },
                      '&:hover fieldset': {
                        borderColor: colorScheme.primary,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colorScheme.primary,
                        borderWidth: '2px'
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.87rem',
                      color: colorScheme.textSecondary
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: colorScheme.primary,
                      fontWeight: 500
                    }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.35,
                    borderRadius: 2,
                    bgcolor: colorScheme.primary,
                    fontSize: '0.97rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(146, 90, 155, 0.3)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#7B4A82',
                      boxShadow: '0 6px 16px rgba(146, 90, 155, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      bgcolor: '#ccc',
                      transform: 'none',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={23} sx={{ color: 'white' }} />
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <Divider sx={{ my: 3.5 }}>
                  <Typography variant="body2" sx={{ color: colorScheme.textSecondary, px: 2, fontWeight: 500, fontSize: '0.82rem' }}>
                    or
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1.75, fontWeight: 500 }}>
                    Don't have an account?
                  </Typography>
                  <Link
                    href="/signup"
                    sx={{
                      color: colorScheme.primary,
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      padding: '9px 18px',
                      borderRadius: 2,
                      background: 'rgba(146, 90, 155, 0.08)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(146, 90, 155, 0.15)',
                        color: colorScheme.secondary,
                        textDecoration: 'none'
                      }
                    }}
                  >
                    Create a new account
                  </Link>
                  
                  {/* Debug: Clear Auth State */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <Button
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      size="small"
                      sx={{
                        color: '#666',
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        '&:hover': {
                          background: 'rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      Clear Auth State (Debug)
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Slide>
        </Box>
      </Fade>

      {/* Right Side - Security Showcase */}
      <Fade in timeout={1500}>
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden'
          }}
        >
          <Slide direction="left" in timeout={1000}>
            <Box sx={{ textAlign: 'center', color: 'white', position: 'relative' }}>
              {/* Security Icons */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 6 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <VerifiedUserIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <ShieldIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  mb: 3,
                  fontSize: { lg: '2.5rem', xl: '3rem' },
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              >
                Secure Analytics Platform
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 400,
                  maxWidth: 450,
                  mx: 'auto',
                  lineHeight: 1.6,
                  mb: 5,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >
                Join thousands of users who trust our secure and reliable analytics platform
              </Typography>

              {/* Feature List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                {[
                  'Enterprise-grade security',
                  'Advanced user authentication',
                  'Data encryption & privacy protection',
                  '24/7 security monitoring'
                ].map((feature, index) => (
                  <Box 
                    key={feature}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'white',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                      }} 
                    />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 400,
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Slide>
        </Box>
      </Fade>
    </Box>
  );
};

export default Login;
