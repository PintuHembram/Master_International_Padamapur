import { DarkModeToggle } from '@/components/DarkModeToggle';
import misLogo from '@/assets/mis-logo.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, signIn, loading: authLoading } = useAuth();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate('/admin/admissions');
    }
  }, [user, isAdmin, authLoading, navigate]);

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
      const { error } = await signIn(email.trim(), password.trim());

      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message || 'Invalid email or password',
          variant: 'destructive',
        });
        setErrors({ submit: error.message || 'Invalid credentials' });
      } else {
        toast({
          title: 'Login Successful',
          description: 'Checking admin privileges...',
        });
        // The useEffect will handle redirect once isAdmin is confirmed
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

  // Show access denied if user is logged in but not admin
  if (!authLoading && user && !isAdmin) {
    return (
      <div className="admin-bg min-h-screen flex items-center justify-center p-4">
        <Helmet>
          <title>Access Denied - Master International</title>
        </Helmet>
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You do not have admin privileges. Please contact an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={async () => {
                const { signOut } = await import('@/hooks/useAuth').then(m => ({ signOut: m.useAuth }));
                // Sign out and reload
                const { supabase } = await import('@/integrations/supabase/client');
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="w-full"
              variant="outline"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-bg min-h-screen flex items-center justify-center p-4">
      <Helmet>
        <title>Admin Sign In - Master International</title>
      </Helmet>
      
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={misLogo} alt="Logo" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-3xl font-bold">Admin Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to access the admin dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
              {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded text-sm">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || authLoading}
              className="w-full mt-6"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;