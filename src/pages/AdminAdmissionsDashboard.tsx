import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Admission = {
  id: string;
  student_name: string;
  date_of_birth: string;
  class_applying: string;
  father_name: string;
  mother_name: string;
  parent_phone: string;
  parent_email: string;
  address: string;
  previous_school: string | null;
  documents_url: string | null;
  gender: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function AdminAdmissionsDashboard() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  // Fetch admissions from Supabase
  useEffect(() => {
    if (!token) return;
    fetchAdmissions();
  }, [token]);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') { // PGRST116 is table not found
        console.warn('Supabase error:', error);
        // Fall back to local API
        await fetchFromLocal();
      } else if (data) {
        setAdmissions(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      await fetchFromLocal();
    } finally {
      setLoading(false);
    }
  };

  const fetchFromLocal = async () => {
    try {
      const res = await fetch('/api/admin/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdmissions(data.map((d: any) => ({
          id: String(d.id),
          ...d,
        })));
      }
    } catch (err) {
      console.error('Local fetch error:', err);
      toast.error('Failed to load admissions');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('admissions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setAdmissions(prev =>
        prev.map(a => a.id === id ? { ...a, status } : a)
      );
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this admission?')) return;

    try {
      const { error } = await supabase
        .from('admissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAdmissions(prev => prev.filter(a => a.id !== id));
      toast.success('Admission deleted');
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Failed to delete admission');
    }
  };

  const handleExport = () => {
    if (admissions.length === 0) {
      toast.error('No admissions to export');
      return;
    }

    const headers = ['ID', 'Student Name', 'DOB', 'Class', 'Father', 'Mother', 'Phone', 'Email', 'Status', 'Date'];
    const rows = admissions.map(a => [
      a.id,
      a.student_name,
      a.date_of_birth,
      a.class_applying,
      a.father_name,
      a.mother_name,
      a.parent_phone,
      a.parent_email,
      a.status || 'pending',
      a.created_at,
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admissions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('Admissions exported');
  };

  // Client-side filtering
  const filtered = admissions.filter(a => {
    const q = search.toLowerCase();
    return (
      a.student_name.toLowerCase().includes(q) ||
      a.father_name.toLowerCase().includes(q) ||
      a.parent_email.toLowerCase().includes(q) ||
      a.class_applying.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Layout>
      <Helmet>
        <title>Admin — Admissions Dashboard</title>
      </Helmet>

      <section className="pt-32 pb-12 admin-bg min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admissions Dashboard</h1>
            <p className="text-muted-foreground">Manage and track all admission applications</p>
          </div>

          {/* Filters & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Search by student, parent, email or class..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="md:col-span-2"
            />
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{admissions.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {admissions.filter(a => a.status === 'approved').length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {admissions.filter(a => a.status === 'pending').length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {admissions.filter(a => a.status === 'rejected').length}
              </p>
            </Card>
          </div>

          {/* Table */}
          {loading ? (
            <Card className="p-8 text-center">Loading admissions...</Card>
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold">Student</th>
                    <th className="p-4 text-left text-sm font-semibold">Class</th>
                    <th className="p-4 text-left text-sm font-semibold">Parent</th>
                    <th className="p-4 text-left text-sm font-semibold">Email</th>
                    <th className="p-4 text-left text-sm font-semibold">Status</th>
                    <th className="p-4 text-left text-sm font-semibold">Date</th>
                    <th className="p-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(admission => (
                    <tr key={admission.id} className="border-b hover:bg-muted/30 transition">
                      <td className="p-4 text-sm">{admission.student_name}</td>
                      <td className="p-4 text-sm">{admission.class_applying}</td>
                      <td className="p-4 text-sm">{admission.father_name}</td>
                      <td className="p-4 text-sm text-blue-600">{admission.parent_email}</td>
                      <td className="p-4 text-sm">
                        <select
                          title="Update admission status"
                          value={admission.status || 'pending'}
                          onChange={(e) => handleUpdateStatus(admission.id, e.target.value as any)}
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium border",
                            admission.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' :
                            admission.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                            'bg-yellow-100 text-yellow-800 border-yellow-300'
                          )}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(admission.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">
                        <button
                          onClick={() => handleDelete(admission.id)}
                          title="Delete this admission"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(filtered.length, (page - 1) * pageSize + 1)} - {Math.min(filtered.length, page * pageSize)} of {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                variant="outline"
                size="sm"
              >
                Prev
              </Button>
              <span className="text-sm font-medium">{page} / {totalPages}</span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

import { cn } from "@/lib/utils";
