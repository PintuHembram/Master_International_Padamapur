import misLogo from "@/assets/mis-logo.png";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen,
  Download,
  FileText,
  GraduationCap,
  Plus,
  Printer,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
// Dynamic imports to avoid React context conflicts
const loadHtml2Canvas = () => import("html2canvas").then((m) => m.default);

interface Student {
  id: string;
  roll_number: string;
  name: string;
  class: string;
  section: string;
  photo_url: string | null;
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
  exam_time: string;
}

export default function AdmitCards() {
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [showAdmitCard, setShowAdmitCard] = useState(false);
  const [bulkClass, setBulkClass] = useState<string>("");
  const [bulkExam, setBulkExam] = useState<string>("");
  const [showBulkCards, setShowBulkCards] = useState(false);
  const admitCardRef = useRef<HTMLDivElement>(null);
  const bulkCardsRef = useRef<HTMLDivElement>(null);

  // New student form
  const [newStudent, setNewStudent] = useState({
    roll_number: "",
    name: "",
    class: "",
    section: "A",
    date_of_birth: "",
  });

  // New subject form
  const [newSubject, setNewSubject] = useState({
    exam_id: "",
    subject_name: "",
    exam_date: "",
    exam_time: "10:00 AM - 1:00 PM",
  });

  useEffect(() => {
    fetchStudents();
    fetchExams();
    fetchExamSubjects();
  }, []);

  async function fetchStudents() {
    if (supabase) {
      const { data } = await supabase.from("students").select("*").order("roll_number");
      if (data) setStudents(data);
    } else {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data);
    }
  }

  async function fetchExams() {
    if (supabase) {
      const { data } = await supabase.from("exams").select("*").order("name");
      if (data) setExams(data);
    } else {
      const res = await fetch('/api/exams');
      const data = await res.json();
      setExams(data);
    }
  }

  async function fetchExamSubjects() {
    if (supabase) {
      const { data } = await supabase.from("exam_subjects").select("*").order("exam_date");
      if (data) setExamSubjects(data);
    } else {
      const res = await fetch('/api/exam_subjects');
      const data = await res.json();
      setExamSubjects(data);
    }
  }

  async function addStudent() {
    if (!newStudent.roll_number || !newStudent.name || !newStudent.class || !newStudent.date_of_birth) {
      toast.error("Please fill all required fields");
      return;
    }
    if (supabase) {
      const { error } = await supabase.from("students").insert([newStudent]);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to add student');
        return;
      }
    }
    toast.success("Student added successfully");
    setNewStudent({ roll_number: "", name: "", class: "", section: "A", date_of_birth: "" });
    fetchStudents();
  }

  async function deleteStudent(id: string) {
    if (supabase) {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete student');
        return;
      }
    }
    toast.success("Student deleted");
    fetchStudents();
  }

  async function addSubject() {
    if (!newSubject.exam_id || !newSubject.subject_name || !newSubject.exam_date) {
      toast.error("Please fill all required fields");
      return;
    }
    if (supabase) {
      const { error } = await supabase.from("exam_subjects").insert([newSubject]);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const res = await fetch('/api/exam_subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject)
      });
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to add subject');
        return;
      }
    }
    toast.success("Subject added successfully");
    setNewSubject({ exam_id: "", subject_name: "", exam_date: "", exam_time: "10:00 AM - 1:00 PM" });
    fetchExamSubjects();
  }

  async function deleteSubject(id: string) {
    if (supabase) {
      const { error } = await supabase.from("exam_subjects").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const res = await fetch(`/api/exam_subjects/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete subject');
        return;
      }
    }
    toast.success("Subject deleted");
    fetchExamSubjects();
  }

  function generateAdmitCard() {
    if (!selectedStudent || !selectedExam) {
      toast.error("Please select both student and exam");
      return;
    }
    setShowAdmitCard(true);
  }

  function generateBulkCards() {
    if (!bulkClass || !bulkExam) {
      toast.error("Please select both class and exam");
      return;
    }
    setShowBulkCards(true);
  }

  async function downloadPDF(ref: React.RefObject<HTMLDivElement>, filename: string) {
    if (!ref.current) return;
    toast.info("Generating PDF...");
    try {
      const html2canvas = await loadHtml2Canvas();
      const { default: jsPDF } = await import("jspdf");
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let yOffset = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      while (yOffset < pdfHeight) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -yOffset, pdfWidth, pdfHeight);
        yOffset += pageHeight;
      }
      
      pdf.save(filename);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bulkStudents = students.filter((s) => s.class === bulkClass);

  const student = students.find((s) => s.id === selectedStudent);
  const exam = exams.find((e) => e.id === selectedExam);
  const subjects = examSubjects.filter((es) => es.exam_id === selectedExam);
  const bulkExamData = exams.find((e) => e.id === bulkExam);
  const bulkSubjects = examSubjects.filter((es) => es.exam_id === bulkExam);

  const classes = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

  return (
    <Layout>
      <Helmet>
        <title>Admit Card Generator | Master International School</title>
        <meta name="description" content="Generate exam admit cards for students of Master International School, Padamapur" />
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-navy via-navy/95 to-navy/90 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gold/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Exam Admit Cards
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Admit Card Generator
            </h1>
            <p className="text-white/70 text-lg">
              Manage students, exams, and generate printable admit cards with ease
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <Tabs defaultValue="generate" className="space-y-8">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 h-12">
              <TabsTrigger value="generate" className="gap-2">
                <FileText className="w-4 h-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="students" className="gap-2">
                <Users className="w-4 h-4" />
                Students
              </TabsTrigger>
              <TabsTrigger value="exams" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Exams
              </TabsTrigger>
            </TabsList>

            {/* ===== GENERATE TAB ===== */}
            <TabsContent value="generate" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Single Admit Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5 text-navy" />
                      Single Admit Card
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Select Student</Label>
                      <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                        <SelectTrigger><SelectValue placeholder="Choose student..." /></SelectTrigger>
                        <SelectContent>
                          {students.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.roll_number} — {s.name} (Class {s.class})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Select Exam</Label>
                      <Select value={selectedExam} onValueChange={setSelectedExam}>
                        <SelectTrigger><SelectValue placeholder="Choose exam..." /></SelectTrigger>
                        <SelectContent>
                          {exams.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.name} ({e.academic_year})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={generateAdmitCard} className="w-full bg-navy hover:bg-navy/90">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Generate Admit Card
                    </Button>
                  </CardContent>
                </Card>

                {/* Bulk Generation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="w-5 h-5 text-gold" />
                      Bulk Generate
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Select Class</Label>
                      <Select value={bulkClass} onValueChange={setBulkClass}>
                        <SelectTrigger><SelectValue placeholder="Choose class..." /></SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c} value={c}>Class {c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Select Exam</Label>
                      <Select value={bulkExam} onValueChange={setBulkExam}>
                        <SelectTrigger><SelectValue placeholder="Choose exam..." /></SelectTrigger>
                        <SelectContent>
                          {exams.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.name} ({e.academic_year})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={generateBulkCards} variant="outline" className="w-full border-gold text-gold hover:bg-gold/10">
                      <Printer className="w-4 h-4 mr-2" />
                      Generate All ({bulkStudents.length} students)
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Single Admit Card Preview */}
              {showAdmitCard && student && exam && (
                <div className="space-y-4">
                  <div className="flex justify-end gap-3">
                    <Button onClick={() => downloadPDF(admitCardRef, `AdmitCard_${student.roll_number}.pdf`)} className="bg-navy hover:bg-navy/90">
                      <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                      <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                  </div>
                  <div ref={admitCardRef}>
                    <AdmitCardTemplate student={student} exam={exam} subjects={subjects} />
                  </div>
                </div>
              )}

              {/* Bulk Preview */}
              {showBulkCards && bulkExamData && bulkStudents.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-end gap-3">
                    <Button onClick={() => downloadPDF(bulkCardsRef, `AdmitCards_Class${bulkClass}.pdf`)} className="bg-navy hover:bg-navy/90">
                      <Download className="w-4 h-4 mr-2" /> Download All PDF
                    </Button>
                  </div>
                  <div ref={bulkCardsRef} className="space-y-8">
                    {bulkStudents.map((s, i) => (
                      <div key={s.id}>
                        <AdmitCardTemplate student={s} exam={bulkExamData} subjects={bulkSubjects} />
                        {i % 2 === 1 && i < bulkStudents.length - 1 && (
                          <div className="page-break" style={{ pageBreakAfter: "always" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ===== STUDENTS TAB ===== */}
            <TabsContent value="students" className="space-y-6">
              {/* Add Student Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserPlus className="w-5 h-5 text-navy" />
                    Add New Student
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <Label>Roll Number *</Label>
                      <Input
                        value={newStudent.roll_number}
                        onChange={(e) => setNewStudent({ ...newStudent, roll_number: e.target.value })}
                        placeholder="MIS-006"
                      />
                    </div>
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        placeholder="Student Name"
                      />
                    </div>
                    <div>
                      <Label>Class *</Label>
                      <Select value={newStudent.class} onValueChange={(v) => setNewStudent({ ...newStudent, class: v })}>
                        <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Section</Label>
                      <Select value={newStudent.section} onValueChange={(v) => setNewStudent({ ...newStudent, section: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        value={newStudent.date_of_birth}
                        onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={addStudent} className="mt-4 bg-navy hover:bg-navy/90">
                    <Plus className="w-4 h-4 mr-2" /> Add Student
                  </Button>
                </CardContent>
              </Card>

              {/* Student List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Student List ({students.length})</CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or roll no..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-navy/5">
                          <TableHead>Roll No</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead>DOB</TableHead>
                          <TableHead className="w-16">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No students found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStudents.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="font-mono font-medium">{s.roll_number}</TableCell>
                              <TableCell className="font-medium">{s.name}</TableCell>
                              <TableCell>{s.class}</TableCell>
                              <TableCell>{s.section}</TableCell>
                              <TableCell>{new Date(s.date_of_birth).toLocaleDateString("en-IN")}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => deleteStudent(s.id)} className="text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== EXAMS TAB ===== */}
            <TabsContent value="exams" className="space-y-6">
              {/* Exam Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {exams.map((e) => (
                  <Card key={e.id} className="border-l-4 border-l-navy">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{e.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">Academic Year: {e.academic_year}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {examSubjects.filter((es) => es.exam_id === e.id).length} subjects scheduled
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Subject */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Plus className="w-5 h-5 text-navy" />
                    Add Exam Subject
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label>Exam *</Label>
                      <Select value={newSubject.exam_id} onValueChange={(v) => setNewSubject({ ...newSubject, exam_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                        <SelectContent>
                          {exams.map((e) => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Subject *</Label>
                      <Select
                        value={newSubject.subject_name}
                        onValueChange={(v) => setNewSubject({ ...newSubject, subject_name: v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                        <SelectContent>
                          {["Mathematics", "Science", "English", "Social Studies", "Hindi", "Computer Science", "Physical Education"].map((sub) => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={newSubject.exam_date}
                        onChange={(e) => setNewSubject({ ...newSubject, exam_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        value={newSubject.exam_time}
                        onChange={(e) => setNewSubject({ ...newSubject, exam_time: e.target.value })}
                        placeholder="10:00 AM - 1:00 PM"
                      />
                    </div>
                  </div>
                  <Button onClick={addSubject} className="mt-4 bg-navy hover:bg-navy/90">
                    <Plus className="w-4 h-4 mr-2" /> Add Subject
                  </Button>
                </CardContent>
              </Card>

              {/* Subjects List per Exam */}
              {exams.map((e) => {
                const subs = examSubjects.filter((es) => es.exam_id === e.id);
                if (subs.length === 0) return null;
                return (
                  <Card key={e.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{e.name} — Subjects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-navy/5">
                              <TableHead>Subject</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead className="w-16">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subs.map((sub) => (
                              <TableRow key={sub.id}>
                                <TableCell className="font-medium">{sub.subject_name}</TableCell>
                                <TableCell>{new Date(sub.exam_date).toLocaleDateString("en-IN")}</TableCell>
                                <TableCell>{sub.exam_time}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => deleteSubject(sub.id)} className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}

/* ===== ADMIT CARD TEMPLATE ===== */
function AdmitCardTemplate({
  student,
  exam,
  subjects,
}: {
  student: Student;
  exam: Exam;
  subjects: ExamSubject[];
}) {
  return (
    <div className="max-w-2xl mx-auto bg-white border-2 border-navy rounded-xl overflow-hidden shadow-lg print:shadow-none print:border">
      {/* Header */}
      <div className="bg-navy text-white p-6 text-center relative">
        <div className="absolute left-6 top-1/2 -translate-y-1/2">
          <img src={misLogo} alt="School Logo" className="w-16 h-16 rounded-full bg-white p-1" />
        </div>
        <h2 className="text-xl font-bold tracking-wide">Master International School</h2>
        <p className="text-white/80 text-sm">Padamapur, Odisha • CBSE Affiliated</p>
        <div className="mt-2 inline-block bg-gold/20 text-gold px-4 py-1 rounded-full text-sm font-semibold">
          ADMIT CARD — {exam.name.toUpperCase()} ({exam.academic_year})
        </div>
      </div>

      {/* Student Info */}
      <div className="p-6 flex gap-6 border-b border-navy/10">
        <div className="w-24 h-28 border-2 border-navy/20 rounded-lg flex items-center justify-center bg-muted shrink-0 overflow-hidden">
          {student.photo_url ? (
            <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-muted-foreground text-xs">
              <GraduationCap className="w-8 h-8 mx-auto mb-1 text-navy/30" />
              Photo
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1 text-sm">
          <div>
            <span className="text-muted-foreground text-xs block">Student Name</span>
            <span className="font-semibold text-foreground">{student.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Roll Number</span>
            <span className="font-semibold font-mono text-foreground">{student.roll_number}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Class & Section</span>
            <span className="font-semibold text-foreground">{student.class} - {student.section}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Date of Birth</span>
            <span className="font-semibold text-foreground">{new Date(student.date_of_birth).toLocaleDateString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Exam Schedule */}
      <div className="p-6">
        <h3 className="font-semibold text-navy mb-3 text-sm uppercase tracking-wider">Examination Schedule</h3>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy/5">
                <th className="text-left p-3 font-semibold text-navy">Subject</th>
                <th className="text-left p-3 font-semibold text-navy">Date</th>
                <th className="text-left p-3 font-semibold text-navy">Time</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-muted-foreground">
                    No subjects scheduled yet
                  </td>
                </tr>
              ) : (
                subjects.map((sub, i) => (
                  <tr key={sub.id} className={i % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                    <td className="p-3 font-medium">{sub.subject_name}</td>
                    <td className="p-3">{new Date(sub.exam_date).toLocaleDateString("en-IN")}</td>
                    <td className="p-3">{sub.exam_time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signatures */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-dashed border-navy/20">
          <div className="text-center">
            <div className="h-12 border-b border-navy/30 mb-2" />
            <p className="text-xs text-muted-foreground font-medium">Student's Signature</p>
          </div>
          <div className="text-center">
            <div className="h-12 border-b border-navy/30 mb-2" />
            <p className="text-xs text-muted-foreground font-medium">Class Teacher</p>
          </div>
          <div className="text-center">
            <div className="h-12 border-b border-navy/30 mb-2" />
            <p className="text-xs text-muted-foreground font-medium">Principal</p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-muted/50 px-6 py-3 text-xs text-muted-foreground text-center border-t">
        This admit card must be presented at the examination hall. Contact the school office for any discrepancies.
      </div>
    </div>
  );
}
