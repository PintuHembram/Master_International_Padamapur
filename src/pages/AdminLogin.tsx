import misLogo from '@/assets/mis-logo.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, LogIn, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast({
          title: 'Login Failed',
          description: data.message || 'Invalid username or password',
          variant: 'destructive',
        });
        setErrors({ submit: data.message || 'Invalid credentials' });
      } else {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        
        // Notify other tabs/windows
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'adminToken',
          newValue: data.token,
          storageArea: localStorage,
        }));

        toast({
          title: 'Login Successful',
          description: 'Welcome to Admin Dashboard!',
        });
        
        // Small delay to ensure token is stored before navigation
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

  return (
    <div className="admin-bg min-h-screen flex items-center justify-center p-4">
      <Helmet>
        <title>Admin Login - Master International</title>
      </Helmet>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={misLogo} alt="Logo" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-3xl font-bold">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors((prev) => ({ ...prev, username: '' }));
                  }}
                  className="pl-10"
                  disabled={loading}
                  required
                />
              </div>
              {errors.username && <p className="text-red-600 text-sm">{errors.username}</p>}
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

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full mt-6"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>

            {/* Demo Credentials */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <p className="font-semibold mb-2">Demo Credentials:</p>
              <p>Username: <code className="bg-blue-100 px-2 py-1 rounded">admin</code></p>
              <p>Password: <code className="bg-blue-100 px-2 py-1 rounded">admin</code></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
