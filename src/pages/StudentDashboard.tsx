import misLogo from '@/assets/mis-logo.png';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, GraduationCap, IdCard, LogOut, Phone, Receipt, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

interface StudentSession {
  id: string;
  name: string;
  roll_number: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionStr = sessionStorage.getItem('studentSession');
    if (!sessionStr) {
      navigate('/student/login');
      return;
    }
    const session: StudentSession = JSON.parse(sessionStr);
    fetchData(session.id, session.roll_number);
  }, [navigate]);

  const fetchData = async (studentId: string, rollNumber: string) => {
    try {
      const [studRes, resultsRes, feesRes] = await Promise.all([
        supabase.from('students').select('*').eq('id', studentId).maybeSingle(),
        supabase.from('student_results').select('*').eq('roll_number', rollNumber).order('created_at', { ascending: false }),
        supabase.from('fee_payments').select('*').eq('roll_number', rollNumber).order('payment_date', { ascending: false }),
      ]);

      if (studRes.data) setStudent(studRes.data);
      if (resultsRes.data) setResults(resultsRes.data);
      if (feesRes.data) setFees(feesRes.data);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('studentSession');
    navigate('/student/login');
  };

  const downloadIdCard = async () => {
    if (!student) return;
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: [85.6, 54] });
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 85.6, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('MASTER INTERNATIONAL SCHOOL', 42.8, 6, { align: 'center' });
      doc.setFontSize(6);
      doc.text('Padamapur • CBSE Affiliated', 42.8, 10, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(student.name, 4, 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.text(`Student ID: ${student.student_id || '—'}`, 4, 28);
      doc.text(`Roll No: ${student.roll_number}`, 4, 32);
      doc.text(`Class: ${student.class} - ${student.section || 'A'}`, 4, 36);
      doc.text(`DOB: ${student.date_of_birth}`, 4, 40);
      if (student.blood_group) doc.text(`Blood: ${student.blood_group}`, 4, 44);
      if (student.father_phone) doc.text(`Contact: ${student.father_phone}`, 4, 48);
      doc.setFontSize(5);
      doc.text(`Session: ${student.session || '2025-26'}`, 4, 52);
      doc.save(`id-card-${student.roll_number}.pdf`);
      toast({ title: 'Downloaded', description: 'ID card saved.' });
    } catch (err: any) {
      toast({ title: 'Error', description: 'Could not generate ID card', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <p className="text-muted-foreground mb-4">Student record not found.</p>
          <Button onClick={handleLogout}>Back to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Student Dashboard - Master International</title>
      </Helmet>

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={misLogo} alt="MIS" className="h-10 w-auto" />
            <div>
              <h1 className="font-bold text-lg">Student Portal</h1>
              <p className="text-xs text-muted-foreground">Welcome, {student.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Student ID</p>
              <p className="font-bold font-mono text-sm">{student.student_id || '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="font-bold">{student.class} - {student.section || 'A'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Roll No</p>
              <p className="font-bold">{student.roll_number}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Session</p>
              <p className="font-bold">{student.session || '2025-26'}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" />Profile</TabsTrigger>
            <TabsTrigger value="results" className="gap-2"><GraduationCap className="w-4 h-4" />Results</TabsTrigger>
            <TabsTrigger value="fees" className="gap-2"><Receipt className="w-4 h-4" />Fees</TabsTrigger>
            <TabsTrigger value="idcard" className="gap-2"><IdCard className="w-4 h-4" />ID Card</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <Section title="Basic Info" items={[
                  ['Full Name', student.name],
                  ['Date of Birth', student.date_of_birth],
                  ['Gender', student.gender],
                  ['Blood Group', student.blood_group],
                ]} />
                <Section title="Academic" items={[
                  ['Class', `${student.class} - ${student.section || 'A'}`],
                  ['Roll Number', student.roll_number],
                  ['Admission Date', student.admission_date],
                  ['Session', student.session],
                ]} />
                <Section title="Contact" items={[
                  ['Phone', student.phone],
                  ['Email', student.email],
                  ['Address', student.address],
                  ['City', student.city],
                  ['State', student.state],
                  ['Pincode', student.pincode],
                ]} />
                <Section title="Parent / Guardian" items={[
                  ['Father', student.father_name],
                  ['Father Phone', student.father_phone],
                  ['Mother', student.mother_name],
                  ['Mother Phone', student.mother_phone],
                  ['Guardian', student.guardian_name],
                ]} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader><CardTitle>Exam Results</CardTitle></CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No results published yet.</p>
                ) : (
                  <div className="space-y-6">
                    {results.map((r) => {
                      const subjects = Array.isArray(r.subjects) ? r.subjects : [];
                      const total = subjects.reduce((s: number, x: any) => s + (Number(x.obtained) || 0), 0);
                      const max = subjects.reduce((s: number, x: any) => s + (Number(x.maxMarks) || 0), 0);
                      const pct = max ? ((total / max) * 100).toFixed(1) : '0';
                      return (
                        <div key={r.id} className="border rounded-lg p-4">
                          <div className="flex flex-wrap justify-between gap-2 mb-3">
                            <h3 className="font-semibold">{r.exam_type} • {r.academic_year}</h3>
                            <span className="text-sm text-muted-foreground">Rank: {r.rank ?? '—'}</span>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-right">Max</TableHead>
                                <TableHead className="text-right">Obtained</TableHead>
                                <TableHead className="text-right">Grade</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {subjects.map((s: any, i: number) => (
                                <TableRow key={i}>
                                  <TableCell>{s.subject}</TableCell>
                                  <TableCell className="text-right">{s.maxMarks}</TableCell>
                                  <TableCell className="text-right font-medium">{s.obtained}</TableCell>
                                  <TableCell className="text-right">{s.grade}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="bg-muted/50 font-semibold">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right">{max}</TableCell>
                                <TableCell className="text-right">{total}</TableCell>
                                <TableCell className="text-right">{pct}%</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees">
            <Card>
              <CardHeader><CardTitle>Fee Payment History</CardTitle></CardHeader>
              <CardContent>
                {fees.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No fee payments recorded.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fees.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-mono text-xs">{f.receipt_number}</TableCell>
                          <TableCell>{f.payment_date}</TableCell>
                          <TableCell>{f.fee_category}</TableCell>
                          <TableCell className="capitalize">{f.payment_mode}</TableCell>
                          <TableCell className="text-right font-medium">₹{Number(f.amount).toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="idcard">
            <Card>
              <CardHeader><CardTitle>Download ID Card</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-6 bg-gradient-to-br from-primary/5 to-primary/10 max-w-md">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                    <img src={misLogo} alt="MIS" className="h-10 w-auto" />
                    <div>
                      <p className="font-bold text-sm">MASTER INTERNATIONAL SCHOOL</p>
                      <p className="text-xs text-muted-foreground">Padamapur • CBSE Affiliated</p>
                    </div>
                  </div>
                  <p className="font-bold text-lg">{student.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">{student.student_id}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div><span className="text-muted-foreground">Class:</span> {student.class}-{student.section}</div>
                    <div><span className="text-muted-foreground">Roll:</span> {student.roll_number}</div>
                    <div><span className="text-muted-foreground">DOB:</span> {student.date_of_birth}</div>
                    {student.blood_group && <div><span className="text-muted-foreground">Blood:</span> {student.blood_group}</div>}
                  </div>
                </div>
                <Button onClick={downloadIdCard} className="gap-2">
                  <Download className="w-4 h-4" /> Download as PDF
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Section = ({ title, items }: { title: string; items: [string, any][] }) => (
  <div>
    <h3 className="text-sm font-semibold text-primary mb-2">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
      {items.map(([label, value]) => (
        <div key={label} className="flex justify-between border-b py-1.5">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{value || '—'}</span>
        </div>
      ))}
    </div>
  </div>
);

export default StudentDashboard;
