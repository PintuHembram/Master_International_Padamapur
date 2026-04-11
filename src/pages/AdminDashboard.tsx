import misLogo from '@/assets/mis-logo.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Clock,
  FileText,
  Home,
  LogOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

interface Admission {
  id: string;
  studentName: string;
  classApplying: string;
  parentEmail: string;
  parentPhone: string;
  status?: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAdmissions: 0,
    pendingAdmissions: 0,
  });

  const { isAdmin, signOut, getToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        if (!isAdmin) {
          toast({
            title: 'Access Denied',
            description: 'You must be logged in as admin to view this page.',
            variant: 'destructive',
          });
        }
        navigate('/admin/login');
      }
    }
  }, [isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const response = await fetch('http://localhost:5000/api/admin/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'Session Expired',
            description: 'Your session has expired. Please log in again.',
            variant: 'destructive',
          });
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch admissions');
      }

      const data: Admission[] = await response.json();
      setAdmissions(data || []);

      setStats({
        totalAdmissions: data?.length || 0,
        pendingAdmissions: data?.filter((a) => a.status === 'pending').length || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Master International School</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={misLogo} alt="MIS Logo" className="h-10 w-10 object-contain" />
              <div>
                <h1 className="text-lg font-bold">Admin Dashboard</h1>
                <p className="text-xs opacity-70">Master International School</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" /> View Site
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Total Applications</p>
                    <p className="text-3xl font-bold">{stats.totalAdmissions}</p>
                  </div>
                  <FileText className="h-10 w-10 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Pending Review</p>
                    <p className="text-3xl font-bold">{stats.pendingAdmissions}</p>
                  </div>
                  <Clock className="h-10 w-10 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Admission Applications</CardTitle>
              <CardDescription>Review and manage student admission applications</CardDescription>
            </CardHeader>
            <CardContent>
              {admissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No admission applications yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Class Applying</TableHead>
                        <TableHead>Parent Email</TableHead>
                        <TableHead>Parent Phone</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admissions.map((admission) => (
                        <TableRow key={admission.id}>
                          <TableCell className="font-medium">{admission.studentName}</TableCell>
                          <TableCell>{admission.classApplying}</TableCell>
                          <TableCell>{admission.parentEmail}</TableCell>
                          <TableCell>{admission.parentPhone}</TableCell>
                          <TableCell>{new Date(admission.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;

