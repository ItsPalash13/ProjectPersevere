import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ThemeProvider } from '@mui/material/styles';
import { Google as GoogleIcon, Facebook as FacebookIcon } from '@mui/icons-material';
import { authClient } from '../../lib/auth-client';
import { theme, Card, AuthContainer } from '../../theme/authTheme';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const { data: session } = authClient.useSession();

  React.useEffect(() => {
    if (session) {
      const from= location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [session, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const { data, error } = await authClient.signIn.email({
          email: formData.email,
          password: formData.password
        });

        if (error) {
          newErrors.submit = error.message;
          setErrors(newErrors);
        } else {
          setTimeout(() => {
            navigate('/dashboard');
          }, 100);
        }
      } catch (error) {
        newErrors.submit = 'An error occurred during login';
        setErrors(newErrors);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
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
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign in
          </Typography>
          {errors.submit && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Typography>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email}
                color={errors.email ? 'error' : 'primary'}
                disabled={isLoading}
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
                onChange={handleChange}
                autoComplete="current-password"
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password}
                color={errors.password ? 'error' : 'primary'}
                disabled={isLoading}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>or</Typography>
          </Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Sign in with Google')}
              startIcon={<GoogleIcon />}
            >
              Sign in with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Sign in with Facebook')}
              startIcon={<FacebookIcon />}
            >
              Sign in with Facebook
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Don't have an account?{' '}
              <MuiLink
                component={RouterLink}
                to="/register"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Sign up
              </MuiLink>
            </Typography>
          </Box>
        </Card>
      </AuthContainer>
    </ThemeProvider>
  );
};

export default Login; 