import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ThemeProvider } from '@mui/material/styles';

import { authClient } from '../../lib/auth-client';
import { theme, Card, AuthContainer } from '../../theme/authTheme';
import { colors } from '../../theme/colors';
import AvatarSelector from '../../components/AvatarSelector';
import AvatarColorPicker from '../../components/AvatarColorPicker';
import { Avatar } from '@mui/material';
import { getAvatarSrc, getDefaultAvatar, getDefaultAvatarBgColor } from '../../utils/avatarUtils';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    avatar: '',
    avatarBgColor: '#2196F3'
  });
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [avatarSelectorOpen, setAvatarSelectorOpen] = React.useState(false);
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateInputs = () => {
    let isValid = true;

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!formData.password || formData.password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!formData.name || formData.name.length < 1) {
      setNameError(true);
      setNameErrorMessage('Name is required.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    return isValid;
  };

  const handleNextStep = () => {
    if (!validateInputs()) return;
    setCurrentStep(2);
  };

  const handleAvatarSelect = (selectedAvatar) => {
    setFormData(prev => ({ ...prev, avatar: selectedAvatar }));
  };

  const handleColorSelect = (selectedColor) => {
    setFormData(prev => ({ ...prev, avatarBgColor: selectedColor }));
  };

  const getCurrentAvatarSrc = () => {
    if (formData.avatar) {
      return getAvatarSrc(formData.avatar);
    }
    return getDefaultAvatar().src;
  };

  const getCurrentBgColor = () => {
    return formData.avatarBgColor || getDefaultAvatarBgColor();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    if (!formData.avatar || !formData.avatarBgColor) {
      setSubmitError('Please select an avatar and background color.');
      return;
    }

    try {
      const { data, error } = await authClient.signUp.email(
        {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          callbackURL: '/dashboard',
          // Send avatar data during registration
          avatar: formData.avatar,
          avatarBgColor: formData.avatarBgColor
        },
        {
          onRequest: () => setIsLoading(true),
          onSuccess: () => {
            navigate('/dashboard');
          },
          onError: ({ error }) => {
            setSubmitError(error.message);
          }
        }
      );
    } catch (err) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <AuthContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ 
              width: '100%', 
              fontSize: 'clamp(2rem, 10vw, 2.15rem)',
              color: colors.text.light.primary,
              fontWeight: 700
            }}
          >
            {currentStep === 1 ? 'Create Account' : 'Choose Avatar'}
          </Typography>
          {submitError && (
            <Typography 
              sx={{ 
                mb: 2,
                color: colors.error.main,
                fontSize: '0.875rem'
              }}
            >
              {submitError}
            </Typography>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {currentStep === 1 ? (
              <>
                <FormControl>
                  <FormLabel htmlFor="name">Full name</FormLabel>
                  <TextField
                    autoComplete="name"
                    name="name"
                    required
                    fullWidth
                    id="name"
                    placeholder="Jon Snow"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={nameError}
                    helperText={nameErrorMessage}
                    color={nameError ? 'error' : 'primary'}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    placeholder="your@email.com"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    variant="outlined"
                    error={emailError}
                    helperText={emailErrorMessage}
                    color={emailError ? 'error' : 'primary'}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    placeholder="••••••"
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    variant="outlined"
                    error={passwordError}
                    helperText={passwordErrorMessage}
                    color={passwordError ? 'error' : 'primary'}
                  />
                </FormControl>
                <FormControlLabel
                  control={<Checkbox value="allowExtraEmails" color="primary" />}
                  label="I want to receive updates via email."
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    backgroundColor: colors.text.light.primary,
                    color: colors.text.light.inverse || '#FFFFFF',
                    '&:hover': {
                      backgroundColor: colors.text.light.primary,
                      opacity: 0.9
                    },
                    '&:disabled': {
                      backgroundColor: colors.text.light.disabled,
                      color: colors.text.light.hint
                    }
                  }}
                >
                  Next Step
                </Button>
              </>
            ) : (
              <>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="body1" color={colors.text.light.secondary} sx={{ mb: 2 }}>
                    Choose your avatar and background color
                  </Typography>
                  
                  {/* Display selected avatar */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Avatar
                      src={getCurrentAvatarSrc()}
                      sx={{
                        width: 80,
                        height: 80,
                        fontSize: 32,
                        border: '3px solid',
                        borderColor: colors.border.light.primary,
                        bgcolor: getCurrentBgColor(),
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setAvatarSelectorOpen(true)}
                      sx={{
                        borderColor: colors.border.light.primary,
                        color: colors.text.light.secondary,
                        '&:hover': {
                          borderColor: colors.border.light.accent,
                          backgroundColor: colors.overlay.light.low
                        }
                      }}
                    >
                      Select Avatar
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setColorPickerOpen(true)}
                      sx={{
                        borderColor: colors.border.light.primary,
                        color: colors.text.light.secondary,
                        '&:hover': {
                          borderColor: colors.border.light.accent,
                          backgroundColor: colors.overlay.light.low
                        }
                      }}
                    >
                      Select Color
                    </Button>
                  </Box>
                  {formData.avatar && formData.avatarBgColor && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Typography variant="body2" color={colors.text.light.primary}>
                        ✓ Avatar and color selected
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentStep(1)}
                    sx={{
                      borderColor: colors.border.light.primary,
                      color: colors.text.light.secondary,
                      '&:hover': {
                        borderColor: colors.border.light.accent,
                        backgroundColor: colors.overlay.light.low
                      }
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading || !formData.avatar || !formData.avatarBgColor}
                    sx={{
                      backgroundColor: colors.text.light.primary,
                      color: colors.text.light.inverse || '#FFFFFF',
                      '&:hover': {
                        backgroundColor: colors.text.light.primary,
                        opacity: 0.9
                      },
                      '&:disabled': {
                        backgroundColor: colors.text.light.disabled,
                        color: colors.text.light.hint
                      }
                    }}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
          <Typography sx={{ 
            textAlign: 'center',
            color: colors.text.light.secondary
          }}>
            Already have an account?{' '}
            <MuiLink
              component={RouterLink}
              to="/login"
              variant="body2"
              sx={{ 
                alignSelf: 'center',
                color: colors.text.light.primary,
                '&:hover': {
                  color: colors.text.light.primary,
                  opacity: 0.8
                }
              }}
            >
              Sign in
            </MuiLink>
          </Typography>
        </Card>
      </AuthContainer>
      
      {/* Avatar Selector Dialog */}
      <AvatarSelector
        open={avatarSelectorOpen}
        onClose={() => setAvatarSelectorOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={formData.avatar}
      />
      
      {/* Avatar Color Picker Dialog */}
      <AvatarColorPicker
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        onSelect={handleColorSelect}
        currentColor={formData.avatarBgColor}
        currentAvatar={formData.avatar}
      />
    </ThemeProvider>
  );
} 