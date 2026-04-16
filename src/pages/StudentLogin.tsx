import misLogo from '@/assets/mis-logo.png';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Hash, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

const StudentLogin = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber.trim() || !dob) {
      toast({ title: 'Required', description: 'Roll number and date of birth are required.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, roll_number, date_of_birth, status')
        .eq('roll_number', rollNumber.trim())
        .eq('date_of_birth', dob)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({ title: 'Login Failed', description: 'Roll number or date of birth is incorrect.', variant: 'destructive' });
        return;
      }
      if (data.status === 'inactive') {
        toast({ title: 'Account Inactive', description: 'Please contact the school office.', variant: 'destructive' });
        return;
      }

      // Lightweight session in localStorage (lookup-based, not real auth)
      sessionStorage.setItem('studentSession', JSON.stringify({ id: data.id, name: data.name, roll_number: data.roll_number }));
      toast({ title: 'Welcome', description: `Hello ${data.name}!` });
      navigate('/student/dashboard');
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-bg min-h-screen flex items-center justify-center p-4">
      <Helmet>
        <title>Student Login - Master International</title>
        <meta name="description" content="Student portal login for Master International School. Access your profile, results, fees, and admit cards." />
      </Helmet>

      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={misLogo} alt="Master International School" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-3xl font-bold">Student Portal</CardTitle>
          <CardDescription>
            Sign in with your Roll Number and Date of Birth
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roll">Roll Number</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="roll" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="pl-10" placeholder="e.g. 101" disabled={loading} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="pl-10" disabled={loading} required />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? <span className="animate-spin mr-2">⏳</span> : <LogIn className="w-4 h-4 mr-2" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Trouble signing in? Contact the school office.<br />
              <Link to="/admin/login" className="text-primary hover:underline">Admin login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLogin;
