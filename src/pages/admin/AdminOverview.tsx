import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, FileText, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

interface Stats {
  totalAdmissions: number;
  pendingAdmissions: number;
  unreadMessages: number;
  totalEvents: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalAdmissions: 0,
    pendingAdmissions: 0,
    unreadMessages: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [admissionsRes, messagesRes, eventsRes] = await Promise.all([
        supabase.from('admissions').select('status'),
        supabase.from('contact_messages').select('is_read'),
        supabase.from('events').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalAdmissions: admissionsRes.data?.length || 0,
        pendingAdmissions: admissionsRes.data?.filter((a) => a.status === 'pending').length || 0,
        unreadMessages: messagesRes.data?.filter((m) => !m.is_read).length || 0,
        totalEvents: eventsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Admissions',
      value: stats.totalAdmissions,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/admissions',
    },
    {
      title: 'Pending Review',
      value: stats.pendingAdmissions,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      link: '/admin/admissions',
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: Mail,
      color: 'from-green-500 to-green-600',
      link: '/admin/messages',
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/events',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <Helmet>
        <title>Admin Dashboard - Master International School</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card
              key={stat.title}
              className={`bg-gradient-to-br ${stat.color} text-white border-0 cursor-pointer hover:scale-[1.02] transition-transform`}
              onClick={() => navigate(stat.link)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">{stat.title}</p>
                    <p className="text-3xl font-bold">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <stat.icon className="h-10 w-10 opacity-50" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your school's content and applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'View Admissions', link: '/admin/admissions', icon: FileText },
                { title: 'Manage Events', link: '/admin/events', icon: Calendar },
                { title: 'View Messages', link: '/admin/messages', icon: Mail },
                { title: 'Update Gallery', link: '/admin/gallery', icon: Calendar },
              ].map((action) => (
                <Card
                  key={action.title}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(action.link)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <action.icon className="h-8 w-8 mb-2 text-primary" />
                    <p className="text-sm font-medium">{action.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
