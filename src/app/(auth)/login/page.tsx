'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/toaster';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Paper,
  Container,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security,
  MedicalServices,
  Email,
  Lock,
  Login
} from '@mui/icons-material';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();

  useEffect(() => {
    // Check if this is an admin login
    const role = searchParams.get('role');
    setIsAdminLogin(role === 'admin');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await signIn(email, password);
      
      toast({
        title: 'Welcome back!',
        description: `Successfully signed in as ${user.profile.firstName}`,
        variant: 'success'
      });

      // Redirect based on user role
      if (user.role === 'admin' || user.role === 'doctor') {
        router.push('/admin');
      } else {
        router.push('/patient');
      }
    } catch (error) {
      toast({
        title: 'Sign in failed',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F4F8E9 0%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #a5c422 0%, #8fb01a 100%)',
              py: 4,
              px: 3,
              textAlign: 'center',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              {isAdminLogin ? (
                <Security sx={{ fontSize: 40, mr: 2 }} />
              ) : (
                <MedicalServices sx={{ fontSize: 40, mr: 2 }} />
              )}
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                HeadacheMD
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {isAdminLogin ? 'Staff Portal Sign In' : 'Patient Portal Sign In'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {isAdminLogin 
                ? 'Access your administrative dashboard' 
                : 'Access your secure patient portal'
              }
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Security Notice */}
            <Alert
              icon={<Security />}
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  color: '#1e40af'
                }
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                HIPAA Compliant
              </Typography>
              <Typography variant="body2">
                Your data is encrypted and protected according to healthcare standards.
              </Typography>
            </Alert>

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#a5c422' }} />
                    </InputAdornment>
                  )
                }}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#a5c422' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                variant="outlined"
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox sx={{ color: '#a5c422', '&.Mui-checked': { color: '#a5c422' } }} />}
                  label="Remember me"
                />
                <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#a5c422',
                      fontWeight: 500,
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #a5c422 0%, #8fb01a 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8fb01a 0%, #7a9a15 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(165, 196, 34, 0.4)'
                  },
                  '&:disabled': {
                    background: '#e0e0e0'
                  }
                }}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Login />}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Don't have an account?
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#a5c422',
                    color: '#a5c422',
                    '&:hover': {
                      borderColor: '#8fb01a',
                      backgroundColor: 'rgba(165, 196, 34, 0.04)'
                    }
                  }}
                >
                  Sign up here
                </Button>
              </Link>
            </Box>

            {/* Login Type Toggle */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                {isAdminLogin ? 'Are you a patient?' : 'Are you a staff member?'}
              </Typography>
              <Link 
                href={isAdminLogin ? '/login' : '/login?role=admin'} 
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="text"
                  size="small"
                  sx={{
                    color: '#47542B',
                    '&:hover': {
                      backgroundColor: 'rgba(71, 84, 43, 0.04)'
                    }
                  }}
                >
                  {isAdminLogin ? 'Switch to Patient Login' : 'Switch to Staff Login'}
                </Button>
              </Link>
            </Box>


            {/* EMR Integration Notice */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                This platform integrates with Epic, Cerner, and other EMR systems.
                <br />
                Contact your IT administrator for EMR authentication setup.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #F4F8E9 0%, #ffffff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    }>
      <LoginForm />
    </Suspense>
  );
}
