import { AdminLayout } from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, FileText, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

interface Admission {
  id: string;
  student_name: string;
  class_applying: string;
  parent_email: string;
  parent_phone: string;
  status: string;
  created_at: string;
}

const AdminAdmissionsPage = () => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmissions(data || []);
    } catch (error) {
      console.error('Error fetching admissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admissions.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
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

  const filteredAdmissions = admissions.filter((a) => {
    const matchesSearch =
      a.student_name.toLowerCase().includes(search.toLowerCase()) ||
      a.parent_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Admissions">
      <Helmet>
        <title>Admissions - Admin | Master International School</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Card>
        <CardHeader>
          <CardTitle>Admission Applications</CardTitle>
          <CardDescription>
            Review and manage student admission applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No admission applications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Student</th>
                    <th className="text-left py-3 px-4 font-medium">Class</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmissions.map((admission) => (
                    <tr
                      key={admission.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium">{admission.student_name}</p>
                      </td>
                      <td className="py-3 px-4">{admission.class_applying}</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <p className="text-sm">{admission.parent_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {admission.parent_phone}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm hidden lg:table-cell">
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
                            onClick={() => updateStatus(admission.id, 'approved')}
                            disabled={admission.status === 'approved'}
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(admission.id, 'rejected')}
                            disabled={admission.status === 'rejected'}
                            title="Reject"
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
    </AdminLayout>
  );
};

export default AdminAdmissionsPage;
