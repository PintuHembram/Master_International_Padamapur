import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Application = {
  id: number;
  studentName: string;
  dob: string;
  classApplying: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address?: string;
  message?: string;
  createdAt?: string;
};

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('/api/admin/applications', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error('Unauthorized or server error');
        return r.json();
      })
      .then((data: Application[]) => setApplications(data))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to fetch applications. Is the server running and are you authorized?');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    toast.success('Logged out');
    navigate('/admin/login');
  };

  const handleExport = async () => {
    if (!token) return toast.error('Not authorized');
    try {
      const res = await fetch('/api/admin/applications/export', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        toast.error('Export failed');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'applications.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error('Network error during export');
    }
  };

  const handleDeleteAll = async () => {
    if (!token) return toast.error('Not authorized');
    if (!confirm('Delete all applications? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/applications', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        toast.error('Delete failed');
        return;
      }
      setApplications([]);
      toast.success('All applications deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Network error while deleting.');
    }
  };

  const handleDeleteOne = async (id: number) => {
    if (!token) return toast.error('Not authorized');
    if (!confirm('Delete this application?')) return;
    try {
      const res = await fetch(`/api/admin/applications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        toast.error('Delete failed');
        return;
      }
      setApplications((prev) => prev.filter((p) => p.id !== id));
      toast.success('Application deleted');
    } catch (err) {
      console.error(err);
      toast.error('Network error while deleting.');
    }
  };

  if (!token) {
    return null;
  }

  // client-side filtering & pagination
  const filtered = applications.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      a.studentName.toLowerCase().includes(q) ||
      a.parentName.toLowerCase().includes(q) ||
      a.parentEmail.toLowerCase().includes(q) ||
      a.classApplying.toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Layout>
      <Helmet>
        <title>Admin — Applications</title>
      </Helmet>

      <section className="pt-32 pb-12 admin-bg">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <h1 className="text-2xl font-bold">Applications</h1>
              <div className="ml-4">
                <input
                  placeholder="Search by student, parent or class"
                  className="p-2 border rounded w-64"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
              <Button variant="destructive" onClick={handleDeleteAll}>
                <Trash className="w-4 h-4 mr-2" /> Delete All
              </Button>
              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 bg-card rounded">Loading...</div>
          ) : (
            <div className="bg-card rounded overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Student</th>
                    <th className="p-3 text-left">DOB</th>
                    <th className="p-3 text-left">Class</th>
                    <th className="p-3 text-left">Parent</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Applied At</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="p-3">{a.id}</td>
                      <td className="p-3">{a.studentName}</td>
                      <td className="p-3">{a.dob}</td>
                      <td className="p-3">{a.classApplying}</td>
                      <td className="p-3">{a.parentName}</td>
                      <td className="p-3">{a.parentPhone}</td>
                      <td className="p-3">{a.parentEmail}</td>
                      <td className="p-3">{a.createdAt}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button className="text-sm text-red-600" onClick={() => handleDeleteOne(a.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">Showing {Math.min(filtered.length, (page-1)*pageSize+1)} - {Math.min(filtered.length, page*pageSize)} of {filtered.length}</div>
            <div className="flex items-center gap-2">
              <button disabled={page<=1} onClick={() => setPage((p) => Math.max(1, p-1))} className="px-3 py-1 border rounded">Prev</button>
              <div className="px-3 py-1 border rounded">{page} / {totalPages}</div>
              <button disabled={page>=totalPages} onClick={() => setPage((p) => Math.min(totalPages, p+1))} className="px-3 py-1 border rounded">Next</button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
