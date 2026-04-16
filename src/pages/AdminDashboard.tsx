import misLogo from '@/assets/mis-logo.png';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Award,
  BookOpen,
  Edit,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Plus,
  Save,
  Trash2,
  Upload,
  Users,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

interface Admission {
  id: string;
  studentName: string;
  classApplying: string;
  parentEmail: string;
  parentPhone: string;
  status?: string;
  createdAt?: string;
}

interface Student {
  id: string;
  student_id?: string;
  roll_number: string;
  name: string;
  class: string;
  section: string;
  date_of_birth: string;
  gender?: string;
  blood_group?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  admission_date?: string;
  session?: string;
  father_name?: string;
  father_phone?: string;
  mother_name?: string;
  mother_phone?: string;
  guardian_name?: string;
  height?: string;
  weight?: string;
  medical_conditions?: string;
  allergies?: string;
  photo_url?: string;
  documents_url?: string;
  status?: string;
}

interface Exam {
  id: string;
  name: string;
  academic_year: string;
}

interface ExamSubject {
  id: string;
  exam_id: string;
  subject_name: string;
  exam_date: string;
  exam_time?: string;
  class?: string;
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
  rank?: number | null;
  subjects: SubjectMark[];
  created_at?: string;
  // Form-only fields
  student_id?: string;
  exam_id?: string;
  subject_marks?: SubjectMark[];
  obtained_marks?: number;
  total_marks?: number;
}

const AdminDashboard = () => {
  // Data state
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState<Partial<Student>>({});
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const [showExamForm, setShowExamForm] = useState(false);
  const [examForm, setExamForm] = useState<Partial<Exam>>({});
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  const [showExamSubjectForm, setShowExamSubjectForm] = useState(false);
  const [examSubjectForm, setExamSubjectForm] = useState<Partial<ExamSubject>>({});
  const [editingExamSubjectId, setEditingExamSubjectId] = useState<string | null>(null);

  const [showResultForm, setShowResultForm] = useState(false);
  const [resultForm, setResultForm] = useState<Partial<StudentResult>>({});
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const csvFileRef = useRef<HTMLInputElement>(null);

  const { isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, authLoading, navigate]);

  // Fetch all data
  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [admRes, studRes, examRes, subjRes, resRes] = await Promise.all([
        supabase.from('admissions').select('*').order('created_at', { ascending: false }),
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('exams').select('*').order('created_at', { ascending: false }),
        supabase.from('exam_subjects').select('*').order('created_at', { ascending: false }),
        supabase.from('student_results').select('*').order('created_at', { ascending: false }),
      ]);

      if (admRes.data) setAdmissions(admRes.data.map((a: any) => ({
        id: a.id, studentName: a.student_name, classApplying: a.class_applying,
        parentEmail: a.parent_email, parentPhone: a.parent_phone, status: a.status,
      })));
      if (studRes.data) setStudents(studRes.data);
      if (examRes.data) setExams(examRes.data);
      if (subjRes.data) setExamSubjects(subjRes.data);
      if (resRes.data) setResults(resRes.data.map((r: any) => ({ ...r, subjects: r.subjects as SubjectMark[] })));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Student CRUD
  const saveStudent = async () => {
    if (!studentForm.name || !studentForm.roll_number || !studentForm.class) {
      toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      const payload: any = {
        name: studentForm.name,
        roll_number: studentForm.roll_number,
        class: studentForm.class,
        section: studentForm.section || 'A',
        date_of_birth: studentForm.date_of_birth || '2010-01-01',
        gender: studentForm.gender || null,
        blood_group: studentForm.blood_group || null,
        phone: studentForm.phone || null,
        email: studentForm.email || null,
        address: studentForm.address || null,
        city: studentForm.city || null,
        state: studentForm.state || null,
        pincode: studentForm.pincode || null,
        admission_date: studentForm.admission_date || null,
        session: studentForm.session || '2025-26',
        father_name: studentForm.father_name || null,
        father_phone: studentForm.father_phone || null,
        mother_name: studentForm.mother_name || null,
        mother_phone: studentForm.mother_phone || null,
        guardian_name: studentForm.guardian_name || null,
        height: studentForm.height || null,
        weight: studentForm.weight || null,
        medical_conditions: studentForm.medical_conditions || null,
        allergies: studentForm.allergies || null,
        photo_url: studentForm.photo_url || null,
        documents_url: studentForm.documents_url || null,
        status: studentForm.status || 'active',
      };
      if (editingStudentId) {
        const { error } = await supabase.from('students').update(payload).eq('id', editingStudentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('students').insert(payload);
        if (error) throw error;
      }

      setShowStudentForm(false);
      setStudentForm({});
      setEditingStudentId(null);
      fetchAllData();
      toast({ title: 'Success', description: 'Student saved successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to save student', variant: 'destructive' });
    }
  };

  const deleteStudent = async (id: string) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      fetchAllData();
      toast({ title: 'Success', description: 'Student deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete student', variant: 'destructive' });
    }
  };

  // Exam CRUD
  const saveExam = async () => {
    if (!examForm.name || !examForm.academic_year) {
      toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('exams').insert({
        name: examForm.name,
        academic_year: examForm.academic_year,
      });
      if (error) throw error;
      setShowExamForm(false);
      setExamForm({});
      fetchAllData();
      toast({ title: 'Success', description: 'Exam saved' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save exam', variant: 'destructive' });
    }
  };

  const deleteExam = async (id: string) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
      fetchAllData();
      toast({ title: 'Success', description: 'Exam deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete exam', variant: 'destructive' });
    }
  };

  // ExamSubject CRUD
  const saveExamSubject = async () => {
    if (!examSubjectForm.exam_id || !examSubjectForm.subject_name || !examSubjectForm.exam_date) {
      toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('exam_subjects').insert({
        exam_id: examSubjectForm.exam_id,
        subject_name: examSubjectForm.subject_name,
        exam_date: examSubjectForm.exam_date,
        exam_time: examSubjectForm.exam_time || '09:00 AM',
        class: examSubjectForm.class || 'ALL',
      });
      if (error) throw error;
      setShowExamSubjectForm(false);
      setExamSubjectForm({});
      fetchAllData();
      toast({ title: 'Success', description: 'Exam subject saved' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    }
  };

  const deleteExamSubject = async (id: string) => {
    if (!window.confirm('Delete this exam subject?')) return;
    try {
      const { error } = await supabase.from('exam_subjects').delete().eq('id', id);
      if (error) throw error;
      fetchAllData();
      toast({ title: 'Success', description: 'Deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  // Result CRUD
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const calculateSubjectGrade = (obtained: number, max: number): string => {
    const percentage = (obtained / max) * 100;
    return calculateGrade(percentage);
  };

  const saveResult = async () => {
    if (!resultForm.student_id || !resultForm.exam_id || !resultForm.obtained_marks || !resultForm.total_marks) {
      toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      const selectedStudent = students.find((s: any) => s.id === resultForm.student_id);
      const selectedExam = exams.find((e: any) => e.id === resultForm.exam_id);

      if (!selectedStudent || !selectedExam) {
        toast({ title: 'Error', description: 'Invalid student or exam', variant: 'destructive' });
        return;
      }

      const subjects = (resultForm.subject_marks || []).map((sm: any) => ({
        subject: sm.subject,
        maxMarks: Number(sm.maxMarks || 100),
        obtained: Number(sm.obtained || 0),
        grade: calculateSubjectGrade(Number(sm.obtained || 0), Number(sm.maxMarks || 100)),
      }));

      const payload = {
        student_name: selectedStudent.name,
        roll_number: selectedStudent.roll_number,
        class: selectedStudent.class,
        section: selectedStudent.section || 'A',
        exam_type: selectedExam.name,
        academic_year: selectedExam.academic_year || '2024-25',
        rank: resultForm.rank ? Number(resultForm.rank) : null,
        subjects: subjects as any,
      };

      if (editingResultId) {
        const { error } = await supabase.from('student_results').update(payload).eq('id', editingResultId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('student_results').insert(payload);
        if (error) throw error;
      }

      setShowResultForm(false);
      setResultForm({});
      setEditingResultId(null);
      fetchAllData();
      toast({ title: 'Success', description: 'Result saved' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    }
  };

  const deleteResult = async (id: string) => {
    if (!window.confirm('Delete this result?')) return;
    try {
      const { error } = await supabase.from('student_results').delete().eq('id', id);
      if (error) throw error;
      fetchAllData();
      toast({ title: 'Success', description: 'Result deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const requiredCols = ['student_name', 'roll_number', 'class', 'exam_type', 'subjects'];
        const headers = result.meta.fields || [];
        const missing = requiredCols.filter(c => !headers.includes(c));
        if (missing.length > 0) {
          toast({
            title: 'Invalid CSV format',
            description: `Missing columns: ${missing.join(', ')}`,
            variant: 'destructive',
          });
          return;
        }
        setCsvPreview(result.data);
        setShowCsvPreview(true);
      },
      error: () => {
        toast({ title: 'Error', description: 'Failed to parse CSV file', variant: 'destructive' });
      },
    });
    e.target.value = '';
  };

  const importCsvResults = async () => {
    if (csvPreview.length === 0) return;
    setImporting(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const row of csvPreview) {
        try {
          let subjects: any[] = [];
          try {
            subjects = typeof row.subjects === 'string' ? JSON.parse(row.subjects) : row.subjects || [];
          } catch {
            subjects = [];
          }

          const { error } = await supabase.from('student_results').insert({
            student_name: row.student_name,
            roll_number: row.roll_number,
            class: row.class,
            section: row.section || 'A',
            exam_type: row.exam_type || 'Annual',
            academic_year: row.academic_year || '2024-25',
            rank: row.rank ? parseInt(row.rank) : null,
            subjects: subjects as any,
          });

          if (error) errorCount++;
          else successCount++;
        } catch {
          errorCount++;
        }
      }

      toast({
        title: 'Import Complete',
        description: `${successCount} results imported, ${errorCount} failed.`,
      });
      setShowCsvPreview(false);
      setCsvPreview([]);
      fetchAllData();
    } catch (error) {
      toast({ title: 'Error', description: 'Import failed', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const downloadCsvTemplate = () => {
    const template = 'student_name,roll_number,class,section,exam_type,academic_year,rank,subjects\nJohn Doe,101,V,A,Annual,2024-25,1,"[{""subject"":""Math"",""maxMarks"":100,""obtained"":95,""grade"":""A+""},{""subject"":""Science"",""maxMarks"":100,""obtained"":88,""grade"":""A""}]"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_results_template.csv';
    a.click();
    URL.revokeObjectURL(url);
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

  if (!isAdmin) return null;

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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <p className="text-sm opacity-80">Admissions</p>
                <p className="text-3xl font-bold">{admissions.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <p className="text-sm opacity-80">Students</p>
                <p className="text-3xl font-bold">{students.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <p className="text-sm opacity-80">Exams</p>
                <p className="text-3xl font-bold">{exams.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <p className="text-sm opacity-80">Exam Subjects</p>
                <p className="text-3xl font-bold">{examSubjects.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
              <CardContent className="p-6">
                <p className="text-sm opacity-80">Results</p>
                <p className="text-3xl font-bold">{results.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different data types */}
          <Tabs defaultValue="admissions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="admissions" className="gap-2">
                <FileText className="h-4 w-4" /> Admissions
              </TabsTrigger>
              <TabsTrigger value="students" className="gap-2">
                <Users className="h-4 w-4" /> Students
              </TabsTrigger>
              <TabsTrigger value="exams" className="gap-2">
                <BookOpen className="h-4 w-4" /> Exams
              </TabsTrigger>
              <TabsTrigger value="exam-subjects" className="gap-2">
                <GraduationCap className="h-4 w-4" /> Subjects
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-2">
                <Award className="h-4 w-4" /> Results
              </TabsTrigger>
            </TabsList>

            {/* ADMISSIONS TAB */}
            <TabsContent value="admissions">
              <Card>
                <CardHeader>
                  <CardTitle>Admission Applications</CardTitle>
                  <CardDescription>View all student admission applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {admissions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No admission applications yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Parent Email</TableHead>
                            <TableHead>Phone</TableHead>
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
            </TabsContent>

            {/* STUDENTS TAB */}
            <TabsContent value="students" className="space-y-6">
              {/* Add Student Form */}
              {showStudentForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingStudentId ? 'Edit Student' : 'Add New Student'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name *</Label>
                        <Input
                          value={studentForm.name || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                          placeholder="Student name"
                        />
                      </div>
                      <div>
                        <Label>Roll Number *</Label>
                        <Input
                          value={studentForm.roll_number || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, roll_number: e.target.value })}
                          placeholder="Roll number"
                        />
                      </div>
                      <div>
                        <Label>Class *</Label>
                        <Input
                          value={studentForm.class || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                          placeholder="Class"
                        />
                      </div>
                      <div>
                        <Label>Section</Label>
                        <Input
                          value={studentForm.section || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                          placeholder="A/B/C"
                        />
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={studentForm.date_of_birth || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveStudent} className="gap-2">
                        <Save className="h-4 w-4" /> Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowStudentForm(false);
                          setStudentForm({});
                          setEditingStudentId(null);
                        }}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Students Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>All Students</CardTitle>
                  <Button
                    onClick={() => {
                      setShowStudentForm(true);
                      setStudentForm({});
                      setEditingStudentId(null);
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Student
                  </Button>
                </CardHeader>
                <CardContent>
                  {students.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No students yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll Number</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>DOB</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>{student.roll_number}</TableCell>
                              <TableCell className="font-medium">{student.name}</TableCell>
                              <TableCell>{student.class}</TableCell>
                              <TableCell>{student.section || '—'}</TableCell>
                              <TableCell>{student.date_of_birth || '—'}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setStudentForm(student);
                                      setEditingStudentId(student.id);
                                      setShowStudentForm(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteStudent(student.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* EXAMS TAB */}
            <TabsContent value="exams" className="space-y-6">
              {/* Add Exam Form */}
              {showExamForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Exam</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Exam Name *</Label>
                        <Input
                          value={examForm.name || ''}
                          onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                          placeholder="Exam name"
                        />
                      </div>
                      <div>
                        <Label>Academic Year *</Label>
                        <Input
                          value={examForm.academic_year || ''}
                          onChange={(e) => setExamForm({ ...examForm, academic_year: e.target.value })}
                          placeholder="2024-25"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveExam} className="gap-2">
                        <Save className="h-4 w-4" /> Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowExamForm(false);
                          setExamForm({});
                        }}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Exams Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>All Exams</CardTitle>
                  <Button onClick={() => setShowExamForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Exam
                  </Button>
                </CardHeader>
                <CardContent>
                  {exams.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No exams yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Exam Name</TableHead>
                            <TableHead>Academic Year</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exams.map((exam) => (
                            <TableRow key={exam.id}>
                              <TableCell className="font-medium">{exam.name}</TableCell>
                              <TableCell>{exam.academic_year}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteExam(exam.id)}
                                  className="gap-2"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* EXAM SUBJECTS TAB */}
            <TabsContent value="exam-subjects" className="space-y-6">
              {/* Add Exam Subject Form */}
              {showExamSubjectForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Exam Subject</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Exam *</Label>
                        <Select
                          value={examSubjectForm.exam_id || ''}
                          onValueChange={(v) => setExamSubjectForm({ ...examSubjectForm, exam_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select exam" />
                          </SelectTrigger>
                          <SelectContent>
                            {exams.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Subject Name *</Label>
                        <Input
                          value={examSubjectForm.subject_name || ''}
                          onChange={(e) => setExamSubjectForm({ ...examSubjectForm, subject_name: e.target.value })}
                          placeholder="Subject name"
                        />
                      </div>
                      <div>
                        <Label>Exam Date *</Label>
                        <Input
                          type="date"
                          value={examSubjectForm.exam_date || ''}
                          onChange={(e) => setExamSubjectForm({ ...examSubjectForm, exam_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveExamSubject} className="gap-2">
                        <Save className="h-4 w-4" /> Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowExamSubjectForm(false);
                          setExamSubjectForm({});
                        }}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Exam Subjects Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Exam Subjects</CardTitle>
                  <Button onClick={() => setShowExamSubjectForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Subject
                  </Button>
                </CardHeader>
                <CardContent>
                  {examSubjects.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No exam subjects yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Exam</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Exam Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {examSubjects.map((subject) => {
                            const exam = exams.find((e) => e.id === subject.exam_id);
                            return (
                              <TableRow key={subject.id}>
                                <TableCell>
                                  <span className="font-medium">{exam?.name || 'Unknown'}</span>
                                </TableCell>
                                <TableCell>{subject.subject_name}</TableCell>
                                <TableCell>{new Date(subject.exam_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteExamSubject(subject.id)}
                                    className="gap-2"
                                  >
                                    <Trash2 className="h-3 w-3" /> Delete
                                  </Button>
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

            {/* RESULTS TAB */}
            <TabsContent value="results" className="space-y-6">
              {/* Add Result Form */}
              {showResultForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingResultId ? 'Edit Result' : 'Add Student Result'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Student *</Label>
                        <Select
                          value={resultForm.student_id || ''}
                          onValueChange={(v) => {
                            const student = students.find(s => s.id === v);
                            setResultForm({
                              ...resultForm,
                              student_id: v,
                              class: student?.class,
                              section: student?.section,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.roll_number} - {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Exam *</Label>
                        <Select
                          value={resultForm.exam_id || ''}
                          onValueChange={(v) => setResultForm({ ...resultForm, exam_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select exam" />
                          </SelectTrigger>
                          <SelectContent>
                            {exams.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Total Marks *</Label>
                        <Input
                          type="number"
                          value={resultForm.total_marks || ''}
                          onChange={(e) => setResultForm({ ...resultForm, total_marks: parseInt(e.target.value) })}
                          placeholder="Total marks"
                        />
                      </div>
                      <div>
                        <Label>Obtained Marks *</Label>
                        <Input
                          type="number"
                          value={resultForm.obtained_marks || ''}
                          onChange={(e) => setResultForm({ ...resultForm, obtained_marks: parseInt(e.target.value) })}
                          placeholder="Obtained marks"
                        />
                      </div>
                      <div>
                        <Label>Rank (optional)</Label>
                        <Input
                          type="number"
                          value={resultForm.rank || ''}
                          onChange={(e) => setResultForm({ ...resultForm, rank: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Rank (optional)"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3 block">Subject-wise Marks</Label>
                      <div className="mb-4 overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead>Max Marks</TableHead>
                              <TableHead>Obtained</TableHead>
                              <TableHead>Grade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(resultForm.subject_marks || []).map((mark, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{mark.subject}</TableCell>
                                <TableCell>{mark.maxMarks}</TableCell>
                                <TableCell>{mark.obtained}</TableCell>
                                <TableCell>{calculateSubjectGrade(mark.obtained, mark.maxMarks)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveResult} className="gap-2">
                        <Save className="h-4 w-4" /> {editingResultId ? 'Update' : 'Save'} Result
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowResultForm(false);
                          setResultForm({});
                          setEditingResultId(null);
                        }}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CSV Preview */}
              {showCsvPreview && csvPreview.length > 0 && (
                <Card className="border-dashed border-2 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">CSV Preview ({csvPreview.length} records)</CardTitle>
                    <CardDescription>Review the data before importing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto mb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Exam Type</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Subjects</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvPreview.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{row.student_name}</TableCell>
                              <TableCell>{row.roll_number}</TableCell>
                              <TableCell>{row.class}</TableCell>
                              <TableCell>{row.section || 'A'}</TableCell>
                              <TableCell>{row.exam_type}</TableCell>
                              <TableCell>{row.academic_year || '2024-25'}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{row.subjects}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={importCsvResults} disabled={importing} className="gap-2">
                        {importing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {importing ? 'Importing...' : `Import ${csvPreview.length} Results`}
                      </Button>
                      <Button variant="outline" onClick={() => { setShowCsvPreview(false); setCsvPreview([]); }} className="gap-2">
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results Table */}
              <Card>
               <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                  <CardTitle>Student Results</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={downloadCsvTemplate} className="gap-2">
                      <FileText className="h-4 w-4" /> Download Template
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      ref={csvFileRef}
                      className="hidden"
                      onChange={handleCsvUpload}
                    />
                    <Button variant="outline" onClick={() => csvFileRef.current?.click()} className="gap-2">
                      <Upload className="h-4 w-4" /> Import CSV
                    </Button>
                    <Button onClick={() => setShowResultForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" /> Add Result
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {results.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No results yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Exam</TableHead>
                            <TableHead>Total Marks</TableHead>
                            <TableHead>Obtained</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((result) => {
                            const totalMax = (result.subjects || []).reduce((s, m) => s + (m.maxMarks || 0), 0);
                            const totalObt = (result.subjects || []).reduce((s, m) => s + (m.obtained || 0), 0);
                            const pct = totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : 0;
                            const grade = calculateGrade(pct);
                            return (
                            <TableRow key={result.id}>
                              <TableCell className="font-medium">{result.roll_number}</TableCell>
                              <TableCell>{result.student_name}</TableCell>
                              <TableCell>{result.class}</TableCell>
                              <TableCell>{result.exam_type}</TableCell>
                              <TableCell>{totalMax}</TableCell>
                              <TableCell>{totalObt}</TableCell>
                              <TableCell>{pct}%</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded font-bold ${
                                  grade === 'A+' || grade === 'A' ? 'bg-green-500 text-green-50' :
                                  grade === 'B+' || grade === 'B' ? 'bg-blue-500 text-blue-50' :
                                  grade === 'C' ? 'bg-yellow-500 text-yellow-50' :
                                  'bg-red-500 text-red-50'
                                }`}>
                                  {grade}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setResultForm(result);
                                      setEditingResultId(result.id);
                                      setShowResultForm(true);
                                    }}
                                    className="gap-2"
                                  >
                                    <Edit className="h-3 w-3" /> Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteResult(result.id)}
                                    className="gap-2"
                                  >
                                    <Trash2 className="h-3 w-3" /> Delete
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
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;

