import misLogo from '@/assets/mis-logo.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import {
    Award,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    FileText,
    Home,
    LogOut,
    Mail,
    Plus,
    Trash2,
    UserPlus,
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

interface SubjectMark {
  subject: string;
  maxMarks: number;
  obtained: number;
  grade: string;
}

interface StudentResult {
  id: string;
  student_name: string;
  roll_number: string;
  class: string;
  section: string;
  exam_type: string;
  academic_year: string;
  rank: number | null;
  subjects: SubjectMark[];
}

function getGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

const AdminDashboard = () => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
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
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'moderator'>('admin');
  const [assigning, setAssigning] = useState(false);

  // Result form state
  const [resultForm, setResultForm] = useState({
    student_name: '',
    roll_number: '',
    class: '',
    section: 'A',
    exam_type: 'Annual',
    academic_year: '2024-25',
    rank: '',
  });
  const [subjectRows, setSubjectRows] = useState<SubjectMark[]>([
    { subject: '', maxMarks: 100, obtained: 0, grade: '' },
  ]);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [showResultForm, setShowResultForm] = useState(false);
  const [resultFilter, setResultFilter] = useState({ class: 'all', exam: 'all' });

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

      const { data: admissionsData, error: admissionsError } = await supabase
        .from('admissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (admissionsError) throw admissionsError;
      setAdmissions(admissionsData || []);

      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Fetch results
      const { data: resultsData, error: resultsError } = await supabase
        .from('student_results')
        .select('*')
        .order('created_at', { ascending: false });
      if (resultsError) console.error('Results error:', resultsError);
      setResults((resultsData as any[])?.map(r => ({ ...r, subjects: r.subjects || [] })) || []);

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
      toast({ title: 'Status Updated', description: `Admission status updated to ${status}.` });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
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
      setStats((prev) => ({ ...prev, unreadMessages: Math.max(0, prev.unreadMessages - 1) }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  // ---- Results Management ----
  const addSubjectRow = () => {
    setSubjectRows([...subjectRows, { subject: '', maxMarks: 100, obtained: 0, grade: '' }]);
  };

  const removeSubjectRow = (index: number) => {
    setSubjectRows(subjectRows.filter((_, i) => i !== index));
  };

  const updateSubjectRow = (index: number, field: keyof SubjectMark, value: string | number) => {
    const updated = [...subjectRows];
    (updated[index] as any)[field] = value;
    // Auto-calculate grade
    if (field === 'obtained' || field === 'maxMarks') {
      const pct = updated[index].maxMarks > 0 ? (Number(updated[index].obtained) / Number(updated[index].maxMarks)) * 100 : 0;
      updated[index].grade = getGrade(pct);
    }
    setSubjectRows(updated);
  };

  const resetResultForm = () => {
    setResultForm({
      student_name: '', roll_number: '', class: '', section: 'A',
      exam_type: 'Annual', academic_year: '2024-25', rank: '',
    });
    setSubjectRows([{ subject: '', maxMarks: 100, obtained: 0, grade: '' }]);
    setEditingResultId(null);
    setShowResultForm(false);
  };

  const editResult = (r: StudentResult) => {
    setResultForm({
      student_name: r.student_name,
      roll_number: r.roll_number,
      class: r.class,
      section: r.section,
      exam_type: r.exam_type,
      academic_year: r.academic_year,
      rank: r.rank?.toString() || '',
    });
    setSubjectRows(r.subjects.length > 0 ? r.subjects : [{ subject: '', maxMarks: 100, obtained: 0, grade: '' }]);
    setEditingResultId(r.id);
    setShowResultForm(true);
  };

  const saveResult = async () => {
    if (!resultForm.student_name || !resultForm.roll_number || !resultForm.class) {
      toast({ title: 'Error', description: 'Please fill student name, roll number, and class.', variant: 'destructive' });
      return;
    }
    const validSubjects = subjectRows.filter(s => s.subject.trim() !== '');
    if (validSubjects.length === 0) {
      toast({ title: 'Error', description: 'Add at least one subject with marks.', variant: 'destructive' });
      return;
    }

    const payload = {
      student_name: resultForm.student_name,
      roll_number: resultForm.roll_number,
      class: resultForm.class,
      section: resultForm.section,
      exam_type: resultForm.exam_type,
      academic_year: resultForm.academic_year,
      rank: resultForm.rank ? parseInt(resultForm.rank) : null,
      subjects: validSubjects,
    };

    try {
      if (editingResultId) {
        const { error } = await supabase
          .from('student_results')
          .update(payload as any)
          .eq('id', editingResultId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Result updated successfully.' });
      } else {
        const { error } = await supabase
          .from('student_results')
          .insert([payload as any]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Result added successfully.' });
      }
      resetResultForm();
      fetchData();
    } catch (err) {
      console.error('Save result error:', err);
      toast({ title: 'Error', description: (err as any)?.message || 'Failed to save result.', variant: 'destructive' });
    }
  };

  const deleteResult = async (id: string) => {
    try {
      const { error } = await supabase
        .from('student_results')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Result deleted successfully.' });
      fetchData();
    } catch (err) {
      console.error('Delete result error:', err);
      toast({ title: 'Error', description: 'Failed to delete result.', variant: 'destructive' });
    }
  };

  const filteredResults = results.filter(r => {
    if (resultFilter.class !== 'all' && r.class !== resultFilter.class) return false;
    if (resultFilter.exam !== 'all' && r.exam_type !== resultFilter.exam) return false;
    return true;
  });

  const classes = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const subjectOptions = ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Science", "Physical Education", "Sanskrit", "EVS", "Drawing"];

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
                    <p className="text-sm opacity-80">Total Results</p>
                    <p className="text-3xl font-bold">{results.length}</p>
                  </div>
                  <Award className="h-10 w-10 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="admissions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="admissions" className="gap-2">
                <FileText className="h-4 w-4" /> Admissions
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-2">
                <Award className="h-4 w-4" /> Results
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <Mail className="h-4 w-4" /> Messages
              </TabsTrigger>
              <TabsTrigger value="admins" className="gap-2">
                <UserPlus className="h-4 w-4" /> Admins
              </TabsTrigger>
            </TabsList>

            {/* Admissions Tab */}
            <TabsContent value="admissions">
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
                              <td className="py-3 px-4 font-medium">{admission.student_name}</td>
                              <td className="py-3 px-4">{admission.class_applying}</td>
                              <td className="py-3 px-4">
                                <p className="text-sm">{admission.parent_email}</p>
                                <p className="text-xs text-muted-foreground">{admission.parent_phone}</p>
                              </td>
                              <td className="py-3 px-4 text-sm">{new Date(admission.created_at).toLocaleDateString()}</td>
                              <td className="py-3 px-4">
                                <Badge variant={admission.status === 'approved' ? 'default' : admission.status === 'rejected' ? 'destructive' : 'secondary'}>
                                  {admission.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => updateAdmissionStatus(admission.id, 'approved')} disabled={admission.status === 'approved'}>
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => updateAdmissionStatus(admission.id, 'rejected')} disabled={admission.status === 'rejected'}>
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

            {/* ===== RESULTS TAB ===== */}
            <TabsContent value="results" className="space-y-6">
              {/* Add / Edit Result Form */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      {showResultForm ? (editingResultId ? 'Edit Result' : 'Add New Result') : 'Student Results Management'}
                    </CardTitle>
                    {!showResultForm && (
                      <Button onClick={() => setShowResultForm(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Result
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {showResultForm && (
                  <CardContent className="space-y-6">
                    {/* Student Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label>Student Name *</Label>
                        <Input value={resultForm.student_name} onChange={(e) => setResultForm({ ...resultForm, student_name: e.target.value })} placeholder="Student Name" />
                      </div>
                      <div>
                        <Label>Roll Number *</Label>
                        <Input value={resultForm.roll_number} onChange={(e) => setResultForm({ ...resultForm, roll_number: e.target.value })} placeholder="MIS-2025-001" />
                      </div>
                      <div>
                        <Label>Class *</Label>
                        <Select value={resultForm.class} onValueChange={(v) => setResultForm({ ...resultForm, class: v })}>
                          <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                          <SelectContent>
                            {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Section</Label>
                        <Select value={resultForm.section} onValueChange={(v) => setResultForm({ ...resultForm, section: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label>Exam Type</Label>
                        <Select value={resultForm.exam_type} onValueChange={(v) => setResultForm({ ...resultForm, exam_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Unit Test">Unit Test</SelectItem>
                            <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                            <SelectItem value="Annual">Annual</SelectItem>
                            <SelectItem value="Semester 1">Semester 1</SelectItem>
                            <SelectItem value="Semester 2">Semester 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Academic Year</Label>
                        <Input value={resultForm.academic_year} onChange={(e) => setResultForm({ ...resultForm, academic_year: e.target.value })} placeholder="2024-25" />
                      </div>
                      <div>
                        <Label>Class Rank</Label>
                        <Input type="number" value={resultForm.rank} onChange={(e) => setResultForm({ ...resultForm, rank: e.target.value })} placeholder="1" />
                      </div>
                    </div>

                    {/* Subjects */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-semibold">Subject-wise Marks</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addSubjectRow} className="gap-1">
                          <Plus className="h-3 w-3" /> Add Subject
                        </Button>
                      </div>
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Subject</TableHead>
                              <TableHead className="w-28">Max Marks</TableHead>
                              <TableHead className="w-28">Obtained</TableHead>
                              <TableHead className="w-20">Grade</TableHead>
                              <TableHead className="w-16"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subjectRows.map((row, i) => (
                              <TableRow key={i}>
                                <TableCell>
                                  <Select value={row.subject} onValueChange={(v) => updateSubjectRow(i, 'subject', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                    <SelectContent>
                                      {subjectOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input type="number" value={row.maxMarks} onChange={(e) => updateSubjectRow(i, 'maxMarks', Number(e.target.value))} />
                                </TableCell>
                                <TableCell>
                                  <Input type="number" value={row.obtained} onChange={(e) => updateSubjectRow(i, 'obtained', Number(e.target.value))} />
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{row.grade || '—'}</Badge>
                                </TableCell>
                                <TableCell>
                                  {subjectRows.length > 1 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeSubjectRow(i)} className="text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={saveResult} className="gap-2">
                        <CheckCircle className="h-4 w-4" /> {editingResultId ? 'Update Result' : 'Save Result'}
                      </Button>
                      <Button variant="outline" onClick={resetResultForm}>Cancel</Button>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Results List */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle>All Results ({filteredResults.length})</CardTitle>
                    <div className="flex gap-3">
                      <Select value={resultFilter.class} onValueChange={(v) => setResultFilter({ ...resultFilter, class: v })}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="Filter class" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={resultFilter.exam} onValueChange={(v) => setResultFilter({ ...resultFilter, exam: v })}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="Filter exam" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Exams</SelectItem>
                          <SelectItem value="Unit Test">Unit Test</SelectItem>
                          <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                          <SelectItem value="Annual">Annual</SelectItem>
                          <SelectItem value="Semester 1">Semester 1</SelectItem>
                          <SelectItem value="Semester 2">Semester 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredResults.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No results found. Add student results using the form above.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Roll No</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Exam</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Subjects</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>%</TableHead>
                            <TableHead>Rank</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredResults.map((r) => {
                            const total = r.subjects.reduce((s, sub) => s + sub.maxMarks, 0);
                            const obt = r.subjects.reduce((s, sub) => s + sub.obtained, 0);
                            const pct = total > 0 ? ((obt / total) * 100).toFixed(1) : '0';
                            return (
                              <TableRow key={r.id}>
                                <TableCell className="font-mono text-sm">{r.roll_number}</TableCell>
                                <TableCell className="font-medium">{r.student_name}</TableCell>
                                <TableCell>{r.class}-{r.section}</TableCell>
                                <TableCell>{r.exam_type}</TableCell>
                                <TableCell>{r.academic_year}</TableCell>
                                <TableCell>{r.subjects.length}</TableCell>
                                <TableCell className="font-medium">{obt}/{total}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{pct}%</Badge>
                                </TableCell>
                                <TableCell>{r.rank || '—'}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => editResult(r)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteResult(r.id)} className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admins Tab */}
            <TabsContent value="admins">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Admins</CardTitle>
                  <CardDescription>Assign admin or moderator roles to existing users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <Label htmlFor="adminEmail">User Email</Label>
                      <Input id="adminEmail" type="email" placeholder="user@example.com" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="adminRole">Role</Label>
                      <div className="flex gap-2">
                        <Button size="sm" variant={newAdminRole === 'admin' ? 'default' : 'outline'} onClick={() => setNewAdminRole('admin')}>Admin</Button>
                        <Button size="sm" variant={newAdminRole === 'moderator' ? 'default' : 'outline'} onClick={() => setNewAdminRole('moderator')}>Moderator</Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={async () => {
                          if (!newAdminEmail || !newAdminEmail.includes('@')) {
                            toast({ title: 'Invalid email', description: 'Please provide a valid email', variant: 'destructive' });
                            return;
                          }
                          try {
                            setAssigning(true);
                            const { data: profile, error: profileError } = await supabase
                              .from('profiles').select('user_id').eq('email', newAdminEmail.trim()).maybeSingle();
                            if (profileError) throw profileError;
                            if (!profile || !profile.user_id) {
                              toast({ title: 'User not found', description: 'No user with that email exists. Ask them to sign up first.', variant: 'destructive' });
                              return;
                            }
                            const { error: insertError } = await supabase
                              .from('user_roles').insert({ user_id: profile.user_id, role: newAdminRole });
                            if (insertError) throw insertError;
                            toast({ title: 'Success', description: `Assigned ${newAdminRole} role to ${newAdminEmail}` });
                            setNewAdminEmail('');
                          } catch (err) {
                            console.error('Assign role error:', err);
                            const message = (err as any)?.message || 'Failed to assign role';
                            toast({ title: 'Error', description: message, variant: 'destructive' });
                          } finally {
                            setAssigning(false);
                          }
                        }}
                        disabled={assigning}
                      >
                        {assigning ? 'Assigning...' : 'Assign Role'}
                      </Button>
                    </div>
                  </div>
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
                        <Card key={message.id} className={`${!message.is_read ? 'border-secondary bg-secondary/5' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-medium">{message.name}</p>
                                  {!message.is_read && <Badge variant="secondary" className="text-xs">New</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{message.email}</p>
                                <p className="font-medium text-sm mb-2">{message.subject}</p>
                                <p className="text-sm text-muted-foreground">{message.message}</p>
                                <p className="text-xs text-muted-foreground mt-2">{new Date(message.created_at).toLocaleString()}</p>
                              </div>
                              {!message.is_read && (
                                <Button size="sm" variant="ghost" onClick={() => markMessageAsRead(message.id)}>
                                  <Eye className="h-4 w-4 mr-1" /> Mark Read
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
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
