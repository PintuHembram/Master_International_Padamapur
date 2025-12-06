import misLogo from '@/assets/mis-logo.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, LogIn, Mail, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/admissions');
    }
  }, [navigate]);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    if (!email || !password) {
      setErrors({ submit: 'Please fill in all fields' });
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Invalid email address' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Login Failed',
          description: data.message || 'Invalid email or password',
          variant: 'destructive',
        });
        setErrors({ submit: data.message || 'Invalid credentials' });
      } else {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminEmail', email);
        
        // Notify other tabs/windows
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'adminToken',
          newValue: data.token,
          storageArea: localStorage,
        }));

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.name || 'Admin'}!`,
        });
        
        setTimeout(() => {
          navigate('/admin/admissions');
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      toast({
        title: 'Login Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Signup Failed',
          description: data.message || 'Unable to create account',
          variant: 'destructive',
        });
        setErrors({ submit: data.message || 'Signup failed' });
      } else {
        toast({
          title: 'Account Created Successfully!',
          description: 'You can now sign in with your email and password',
        });
        
        // Switch to sign in mode with prefilled email
        setIsSignIn(true);
        setEmail(email);
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      toast({
        title: 'Signup Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-bg min-h-screen flex items-center justify-center p-4">
      <Helmet>
        <title>{isSignIn ? 'Admin Sign In' : 'Create Admin Account'} - Master International</title>
      </Helmet>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={misLogo} alt="Logo" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-3xl font-bold">
            {isSignIn ? 'Admin Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isSignIn
              ? 'Enter your email and password to access the admin dashboard'
              : 'Create a new admin account'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-4">
            {/* Sign Up - Full Name */}
            {!isSignIn && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  disabled={loading}
                  required={!isSignIn}
                />
                {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName}</p>}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className="pl-10"
                  disabled={loading}
                  required
                />
              </div>
              {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  className="pl-10 pr-10"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
            </div>

            {/* Sign Up - Confirm Password */}
            {!isSignIn && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    className="pl-10 pr-10"
                    disabled={loading}
                    required={!isSignIn}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  {isSignIn ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {isSignIn ? (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </>
              )}
            </Button>

            {/* Toggle Sign In / Sign Up */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  setErrors({});
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setFullName('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {isSignIn
                  ? "Don't have an account? Create one"
                  : 'Already have an account? Sign in'}
              </button>
            </div>

            {/* Demo Credentials */}
            {isSignIn && (
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <p className="font-semibold mb-2">Demo Credentials:</p>
                <p>Email: <code className="bg-blue-100 px-2 py-1 rounded">admin@mis.com</code></p>
                <p>Password: <code className="bg-blue-100 px-2 py-1 rounded">admin123</code></p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
