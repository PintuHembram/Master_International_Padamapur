import misLogo from '@/assets/mis-logo.png';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';
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
  Users,
  X
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

interface Student {
  id: string;
  roll_number: string;
  name: string;
  class: string;
  section: string;
  date_of_birth: string;
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
}

interface SubjectMark {
  subject_name: string;
  max_marks: number;
  obtained_marks: number;
  grade: string;
}

interface StudentResult {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  exam_id: string;
  exam_name: string;
  class: string;
  section: string;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  grade: string;
  subject_marks: SubjectMark[];
  remarks: string;
  created_at: string;
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

  const { isAdmin, signOut, getToken, loading: authLoading } = useAuth();
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
      const token = getToken();

      const [admResp, studResp, examResp, subjResp, resResp] = await Promise.all([
        fetch('http://localhost:5000/api/admin/applications', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/students', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/exams', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/exam_subjects', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/student_results', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (admResp.ok) setAdmissions(await admResp.json());
      if (studResp.ok) setStudents(await studResp.json());
      if (examResp.ok) setExams(await examResp.json());
      if (subjResp.ok) setExamSubjects(await subjResp.json());
      if (resResp.ok) setResults(await resResp.json());
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
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
      const token = getToken();
      const method = editingStudentId ? 'PUT' : 'POST';
      const url = editingStudentId
        ? `http://localhost:5000/api/students/${editingStudentId}`
        : 'http://localhost:5000/api/students';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentForm),
      });

      if (!response.ok) throw new Error('Failed to save student');

      setShowStudentForm(false);
      setStudentForm({});
      setEditingStudentId(null);
      fetchAllData();
      toast({ title: 'Success', description: 'Student saved successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save student', variant: 'destructive' });
    }
  };

  const deleteStudent = async (id: string) => {
    if (!window.confirm('Delete this student?')) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
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
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/exams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examForm),
      });

      if (!response.ok) throw new Error('Failed to save exam');

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
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/exams/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
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
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/exam_subjects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examSubjectForm),
      });

      if (!response.ok) throw new Error('Failed to save');

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
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/exam_subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
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
      const token = getToken();
      const selectedStudent = students.find(s => s.id === resultForm.student_id);
      const selectedExam = exams.find(e => e.id === resultForm.exam_id);

      if (!selectedStudent || !selectedExam) {
        toast({ title: 'Error', description: 'Invalid student or exam', variant: 'destructive' });
        return;
      }

      const percentage = (Number(resultForm.obtained_marks) / Number(resultForm.total_marks)) * 100;
      const grade = calculateGrade(percentage);

      const payload = {
        ...resultForm,
        student_name: selectedStudent.name,
        roll_number: selectedStudent.roll_number,
        exam_name: selectedExam.name,
        class: selectedStudent.class,
        section: selectedStudent.section,
        percentage: Math.round(percentage * 100) / 100,
        grade,
        subject_marks: resultForm.subject_marks || [],
      };

      const method = editingResultId ? 'PUT' : 'POST';
      const url = editingResultId
        ? `http://localhost:5000/api/student_results/${editingResultId}`
        : 'http://localhost:5000/api/student_results';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save');

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
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/student_results/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
      fetchAllData();
      toast({ title: 'Success', description: 'Result deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
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
                        <Label>Remarks</Label>
                        <Input
                          value={resultForm.remarks || ''}
                          onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
                          placeholder="Remarks (optional)"
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
                                <TableCell>{mark.subject_name}</TableCell>
                                <TableCell>{mark.max_marks}</TableCell>
                                <TableCell>{mark.obtained_marks}</TableCell>
                                <TableCell>{calculateSubjectGrade(mark.obtained_marks, mark.max_marks)}</TableCell>
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

              {/* Results Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Student Results</CardTitle>
                  <Button onClick={() => setShowResultForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Result
                  </Button>
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
                          {results.map((result) => (
                            <TableRow key={result.id}>
                              <TableCell className="font-medium">{result.roll_number}</TableCell>
                              <TableCell>{result.student_name}</TableCell>
                              <TableCell>{result.class}</TableCell>
                              <TableCell>{result.exam_name}</TableCell>
                              <TableCell>{result.total_marks}</TableCell>
                              <TableCell>{result.obtained_marks}</TableCell>
                              <TableCell>{result.percentage}%</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-white font-bold ${
                                  result.grade === 'A+' || result.grade === 'A' ? 'bg-green-500' :
                                  result.grade === 'B+' || result.grade === 'B' ? 'bg-blue-500' :
                                  result.grade === 'C' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}>
                                  {result.grade}
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
                          ))}
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

