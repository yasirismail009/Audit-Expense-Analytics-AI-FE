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
  Grid,
  Divider,
  Paper,
  Fade,
  Slide,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  Shield as ShieldIcon,
  LockPerson as LockPersonIcon,
  VpnKey as VpnKeyIcon,
  SecurityUpdate as SecurityUpdateIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { colorScheme } from '../../utils/colorScheme';
import { useAuth } from '../../utils/authContext';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters long';
    }

    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters long';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
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
      // Mock signup for testing - remove this when backend is ready
      console.log('Mock signup attempt with:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful signup response
      const mockResponse = {
        data: {
          user: {
            id: 2,
            email: formData.email,
            username: formData.username,
            first_name: formData.first_name,
            last_name: formData.last_name
          },
          token: 'mock-jwt-token-signup-' + Date.now()
        }
      };
      
      console.log('Mock signup response:', mockResponse.data);
      login(mockResponse.data.user, mockResponse.data.token);
      setAlertMessage('Account created successfully! Welcome to our platform.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
      // Uncomment this when backend is ready:
      // const response = await axios.post('http://localhost:8000/api/auth/signup/', formData);
      // 
      // if (response.data.token) {
      //   login(response.data.user, response.data.token);
      //   navigate('/');
      // } else {
      //   setAlertMessage('Account created successfully! Please sign in.');
      //   setTimeout(() => {
      //     navigate('/login');
      //   }, 2000);
      // }
    } catch (error) {
      console.error('Signup error:', error);
      setAlertMessage(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, color: 'default', label: '', percentage: 0 };
    
    let strength = 0;
    let percentage = 0;
    
    if (formData.password.length >= 8) { strength++; percentage += 25; }
    if (/[a-z]/.test(formData.password)) { strength++; percentage += 25; }
    if (/[A-Z]/.test(formData.password)) { strength++; percentage += 25; }
    if (/\d/.test(formData.password)) { strength++; percentage += 12.5; }
    if (/[@$!%*?&]/.test(formData.password)) { strength++; percentage += 12.5; }

    const colors = ['error', 'warning', 'info', 'success', 'success'];
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    
    return {
      strength,
      color: colors[Math.min(strength - 1, 4)],
      label: labels[Math.min(strength - 1, 4)],
      percentage: Math.min(percentage, 100)
    };
  };

  const passwordStrength = getPasswordStrength();

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
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)',
          animation: 'float 20s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' }
          }
        }}
      />

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
                maxWidth: 550,
                width: '100%',
                position: 'relative',
                zoom: 0.8
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
                  <LockPersonIcon sx={{ fontSize: 32, color: 'white' }} />
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
                  Create Your Account
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: colorScheme.textSecondary,
                    fontSize: '0.95rem',
                    fontWeight: 400
                  }}
                >
                  Join our secure analytics platform
                </Typography>
              </Box>

              {alertMessage && (
                <Alert 
                  severity={alertMessage.includes('successfully') ? 'success' : 'error'} 
                  sx={{ 
                    mb: 3.5,
                    borderRadius: 2,
                    fontSize: '0.875rem'
                  }}
                >
                  {alertMessage}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  <Grid item sx={{xs: 12, sm: 6, md: 6}}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      error={!!errors.first_name}
                      helperText={errors.first_name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: colorScheme.primary, fontSize: 19 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
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
                  </Grid>
                    <Grid item sx={{xs: 12, sm: 6, md: 6}}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      error={!!errors.last_name}
                      helperText={errors.last_name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: colorScheme.primary, fontSize: 19 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
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
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountIcon sx={{ color: colorScheme.primary, fontSize: 19 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2.5,
                    mt: 2.5,
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
                  helperText={
                    <Box>
                      {errors.password}
                      {formData.password && (
                        <Box sx={{ mt: 0.75 }}>
                          <LinearProgress
                            variant="determinate"
                            value={passwordStrength.percentage}
                            color={passwordStrength.color}
                            sx={{ 
                              height: 3.5, 
                              borderRadius: 2,
                              mb: 0.75
                            }}
                          />
                          <Chip
                            label={passwordStrength.label}
                            color={passwordStrength.color}
                            size="small"
                            sx={{ mr: 1, fontSize: '0.72rem' }}
                          />
                        </Box>
                      )}
                    </Box>
                  }
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
                              background: 'rgba(146, 90, 155, 0.08)'
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
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
                  label="Confirm Password"
                  name="password_confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.password_confirm}
                  onChange={handleChange}
                  error={!!errors.password_confirm}
                  helperText={errors.password_confirm}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: colorScheme.primary, fontSize: 19 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                          size="small"
                          sx={{ 
                            color: colorScheme.primary,
                            '&:hover': {
                              background: 'rgba(146, 90, 155, 0.08)'
                            }
                          }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                    'Create Account'
                  )}
                </Button>

                <Divider sx={{ my: 3.5 }}>
                  <Typography variant="body2" sx={{ color: colorScheme.textSecondary, px: 2, fontWeight: 400, fontSize: '0.82rem' }}>
                    or
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1.75, fontWeight: 400 }}>
                    Already have an account?
                  </Typography>
                  <Link
                    href="/login"
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
                    Sign in to your account
                  </Link>
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

export default Signup;
