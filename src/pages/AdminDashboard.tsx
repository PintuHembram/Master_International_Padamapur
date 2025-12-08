import misLogo from '@/assets/mis-logo.png';
import { EventsManager } from '@/components/admin/EventsManager';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { NewsManager } from '@/components/admin/NewsManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Home,
    Image,
    LogOut,
    Mail,
    Newspaper,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

interface Admission {
  id: string;
  student_name: string;
  class_applying: string;
  parent_email: string;
  parent_phone: string;
  status: string;
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAdmissions: 0,
    pendingAdmissions: 0,
    unreadMessages: 0,
    totalEvents: 0,
  });

  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/admin/login');
      } else if (!isAdmin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
          variant: 'destructive',
        });
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch admissions
      const { data: admissionsData, error: admissionsError } = await supabase
        .from('admissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (admissionsError) throw admissionsError;
      setAdmissions(admissionsData || []);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Fetch events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Calculate stats
      setStats({
        totalAdmissions: admissionsData?.length || 0,
        pendingAdmissions: admissionsData?.filter((a) => a.status === 'pending').length || 0,
        unreadMessages: messagesData?.filter((m) => !m.is_read).length || 0,
        totalEvents: eventsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAdmissionStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('admissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setAdmissions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );

      toast({
        title: 'Status Updated',
        description: `Admission status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  const markMessageAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
      );

      setStats((prev) => ({
        ...prev,
        unreadMessages: Math.max(0, prev.unreadMessages - 1),
      }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
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
        <header className="sticky top-0 z-50 bg-navy-800 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={misLogo} alt="MIS Logo" className="h-10 w-10 object-contain" />
              <div>
                <h1 className="text-lg font-bold">Admin Dashboard</h1>
                <p className="text-xs text-gray-300">Master International School</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Total Admissions</p>
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

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Unread Messages</p>
                    <p className="text-3xl font-bold">{stats.unreadMessages}</p>
                  </div>
                  <Mail className="h-10 w-10 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Total Events</p>
                    <p className="text-3xl font-bold">{stats.totalEvents}</p>
                  </div>
                  <Calendar className="h-10 w-10 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="admissions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="admissions" className="gap-2">
                <FileText className="h-4 w-4" />
                Admissions
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <Mail className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="news" className="gap-2">
                <Newspaper className="h-4 w-4" />
                News
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <Image className="h-4 w-4" />
                Gallery
              </TabsTrigger>
            </TabsList>

            {/* Admissions Tab */}
            <TabsContent value="admissions">
              <Card>
                <CardHeader>
                  <CardTitle>Admission Applications</CardTitle>
                  <CardDescription>
                    Review and manage student admission applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {admissions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No admission applications yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Student</th>
                            <th className="text-left py-3 px-4 font-medium">Class</th>
                            <th className="text-left py-3 px-4 font-medium">Contact</th>
                            <th className="text-left py-3 px-4 font-medium">Date</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {admissions.map((admission) => (
                            <tr key={admission.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">
                                <p className="font-medium">{admission.student_name}</p>
                              </td>
                              <td className="py-3 px-4">{admission.class_applying}</td>
                              <td className="py-3 px-4">
                                <p className="text-sm">{admission.parent_email}</p>
                                <p className="text-xs text-muted-foreground">
                                  {admission.parent_phone}
                                </p>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {new Date(admission.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={
                                    admission.status === 'approved'
                                      ? 'default'
                                      : admission.status === 'rejected'
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                >
                                  {admission.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateAdmissionStatus(admission.id, 'approved')
                                    }
                                    disabled={admission.status === 'approved'}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateAdmissionStatus(admission.id, 'rejected')
                                    }
                                    disabled={admission.status === 'rejected'}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Messages</CardTitle>
                  <CardDescription>View and manage contact form submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <Card
                          key={message.id}
                          className={`${
                            !message.is_read ? 'border-gold-500 bg-gold-50/50 dark:bg-gold-950/20' : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-medium">{message.name}</p>
                                  {!message.is_read && (
                                    <Badge variant="secondary" className="text-xs">
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {message.email}
                                </p>
                                <p className="font-medium text-sm mb-2">{message.subject}</p>
                                <p className="text-sm text-muted-foreground">
                                  {message.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(message.created_at).toLocaleString()}
                                </p>
                              </div>
                              {!message.is_read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markMessageAsRead(message.id)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <EventsManager />
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news">
              <NewsManager />
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <GalleryManager />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
