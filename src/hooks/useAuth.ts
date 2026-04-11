import { useCallback, useEffect, useState } from 'react';

interface AdminUser {
  id?: string;
  email: string;
  name?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if we have a stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminEmail = localStorage.getItem('adminEmail');
    const adminName = localStorage.getItem('adminName');
    
    if (token && adminEmail) {
      setUser({ email: adminEmail, name: adminName || undefined });
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: { message: data.message || 'Login failed' } };
      }

      const data = await response.json();
      
      // Store token and user info
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminEmail', email);
      if (data.name) {
        localStorage.setItem('adminName', data.name);
      }

      setUser({ email, name: data.name });
      setIsAdmin(true);
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      return { error: { message } };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: { message: data.message || 'Signup failed' } };
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      return { error: { message } };
    }
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    setUser(null);
    setIsAdmin(false);
    return { error: null };
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem('adminToken');
  }, []);

  return {
    user,
    session: user ? { user } : null,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    getToken,
  };
};
