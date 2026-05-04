import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Edit, Plus, Trash2, ListChecks, LogOut } from 'lucide-react';

const SUBJECTS = ['English', 'Hindi', 'Odia', 'Mathematics', 'EVS', 'Computer Science', 'SST'];
const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8'];

interface MockTest {
  id: string;
  title: string;
  class: string;
  subject: string;
  duration_minutes: number;
  total_marks: number;
  is_active: boolean;
  instructions?: string;
}

interface MockQuestion {
  id: string;
  test_id: string;
  question_text: string;
  question_type: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option: string;
  marks: number;
  position: number;
}

const emptyTest = { title: '', class: '1', subject: 'English', duration_minutes: 30, total_marks: 0, is_active: true, instructions: '' };
const emptyQuestion = { question_text: '', question_type: 'mcq', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', marks: 1 };

const MockTestsAdmin = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<MockTest[]>([]);
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const [testDialog, setTestDialog] = useState(false);
  const [qDialog, setQDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(emptyTest);
  const [editingQ, setEditingQ] = useState<any>(emptyQuestion);
  const [editingQId, setEditingQId] = useState<string | null>(null);

  useEffect(() => { fetchTests(); fetchAttempts(); }, []);
  useEffect(() => { if (selectedTest) fetchQuestions(selectedTest.id); else setQuestions([]); }, [selectedTest]);

  const fetchTests = async () => {
    const { data } = await supabase.from('mock_tests').select('*').order('created_at', { ascending: false });
    setTests(data || []);
  };
  const fetchQuestions = async (testId: string) => {
    const { data } = await supabase.from('mock_questions').select('*').eq('test_id', testId).order('position');
    setQuestions(data || []);
  };
  const fetchAttempts = async () => {
    const { data } = await supabase.from('mock_attempts').select('*, mock_tests(title, subject, class)').order('submitted_at', { ascending: false }).limit(200);
    setAttempts(data || []);
  };

  const saveTest = async () => {
    if (!editingTest.title) return toast({ title: 'Title required', variant: 'destructive' });
    const payload = { ...editingTest, total_marks: Number(editingTest.total_marks) || 0, duration_minutes: Number(editingTest.duration_minutes) || 30 };
    let res;
    if (editingTest.id) {
      res = await supabase.from('mock_tests').update(payload).eq('id', editingTest.id);
    } else {
      const { id, ...rest } = payload;
      res = await supabase.from('mock_tests').insert(rest);
    }
    if (res.error) return toast({ title: 'Error', description: res.error.message, variant: 'destructive' });
    toast({ title: 'Saved' });
    setTestDialog(false); setEditingTest(emptyTest); fetchTests();
  };

  const deleteTest = async (id: string) => {
    if (!confirm('Delete this test and all its questions?')) return;
    const { error } = await supabase.from('mock_tests').delete().eq('id', id);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    if (selectedTest?.id === id) setSelectedTest(null);
    fetchTests();
  };

  const saveQuestion = async () => {
    if (!selectedTest) return;
    if (!editingQ.question_text) return toast({ title: 'Question text required', variant: 'destructive' });
    const payload = {
      ...editingQ,
      test_id: selectedTest.id,
      marks: Number(editingQ.marks) || 1,
      position: editingQId ? undefined : questions.length + 1,
    };
    let res;
    if (editingQId) {
      res = await supabase.from('mock_questions').update(payload).eq('id', editingQId);
    } else {
      res = await supabase.from('mock_questions').insert(payload);
    }
    if (res.error) return toast({ title: 'Error', description: res.error.message, variant: 'destructive' });
    // recalc total marks
    const { data: qs } = await supabase.from('mock_questions').select('marks').eq('test_id', selectedTest.id);
    const total = (qs || []).reduce((s: number, x: any) => s + (x.marks || 0), 0);
    await supabase.from('mock_tests').update({ total_marks: total }).eq('id', selectedTest.id);
    toast({ title: 'Saved' });
    setQDialog(false); setEditingQ(emptyQuestion); setEditingQId(null);
    fetchQuestions(selectedTest.id); fetchTests();
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Delete question?')) return;
    await supabase.from('mock_questions').delete().eq('id', id);
    if (selectedTest) fetchQuestions(selectedTest.id);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet><title>Mock Tests Admin | Master International</title></Helmet>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/admissions')}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
            <h1 className="font-bold text-lg flex items-center gap-2"><ListChecks className="w-5 h-5" /> Mock Tests Admin</h1>
          </div>
          <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate('/admin/login'); }}><LogOut className="w-4 h-4 mr-1" /> Logout</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="tests">
          <TabsList>
            <TabsTrigger value="tests">Tests & Questions</TabsTrigger>
            <TabsTrigger value="attempts">Student Attempts</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Tests list */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Tests</CardTitle>
                  <Dialog open={testDialog} onOpenChange={(o) => { setTestDialog(o); if (!o) setEditingTest(emptyTest); }}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => setEditingTest(emptyTest)}><Plus className="w-4 h-4 mr-1" /> New Test</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{editingTest.id ? 'Edit Test' : 'New Test'}</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <div><Label>Title</Label><Input value={editingTest.title} onChange={(e) => setEditingTest({ ...editingTest, title: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Class</Label>
                            <Select value={editingTest.class} onValueChange={(v) => setEditingTest({ ...editingTest, class: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Subject</Label>
                            <Select value={editingTest.subject} onValueChange={(v) => setEditingTest({ ...editingTest, subject: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div><Label>Duration (minutes)</Label><Input type="number" value={editingTest.duration_minutes} onChange={(e) => setEditingTest({ ...editingTest, duration_minutes: e.target.value })} /></div>
                        <div><Label>Instructions</Label><Textarea value={editingTest.instructions || ''} onChange={(e) => setEditingTest({ ...editingTest, instructions: e.target.value })} /></div>
                        <div className="flex items-center gap-2"><input type="checkbox" id="active" checked={editingTest.is_active} onChange={(e) => setEditingTest({ ...editingTest, is_active: e.target.checked })} /><Label htmlFor="active">Active (visible to students)</Label></div>
                      </div>
                      <DialogFooter><Button onClick={saveTest}>Save</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {tests.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No tests yet. Create one.</p> : (
                    <div className="space-y-2">
                      {tests.map(t => (
                        <div key={t.id} className={`border rounded-lg p-3 cursor-pointer hover:bg-muted/50 ${selectedTest?.id === t.id ? 'border-primary bg-primary/5' : ''}`} onClick={() => setSelectedTest(t)}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-medium">{t.title}</div>
                              <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
                                <Badge variant="secondary">Class {t.class}</Badge>
                                <Badge variant="secondary">{t.subject}</Badge>
                                <Badge variant="outline">{t.duration_minutes} min</Badge>
                                <Badge variant="outline">{t.total_marks} marks</Badge>
                                {!t.is_active && <Badge variant="destructive">Inactive</Badge>}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingTest(t); setTestDialog(true); }}><Edit className="w-4 h-4" /></Button>
                              <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteTest(t.id); }}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Questions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{selectedTest ? `Questions — ${selectedTest.title}` : 'Questions'}</CardTitle>
                  {selectedTest && (
                    <Dialog open={qDialog} onOpenChange={(o) => { setQDialog(o); if (!o) { setEditingQ(emptyQuestion); setEditingQId(null); } }}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => { setEditingQ(emptyQuestion); setEditingQId(null); }}><Plus className="w-4 h-4 mr-1" /> Add Question</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader><DialogTitle>{editingQId ? 'Edit Question' : 'New Question'}</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <div>
                            <Label>Type</Label>
                            <Select value={editingQ.question_type} onValueChange={(v) => setEditingQ({ ...editingQ, question_type: v, correct_option: v === 'truefalse' ? 'true' : 'a' })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mcq">Multiple Choice</SelectItem>
                                <SelectItem value="truefalse">True / False</SelectItem>
                                <SelectItem value="fill">Fill in the Blank</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div><Label>Question</Label><Textarea value={editingQ.question_text} onChange={(e) => setEditingQ({ ...editingQ, question_text: e.target.value })} /></div>
                          {editingQ.question_type === 'mcq' && (
                            <>
                              {(['a', 'b', 'c', 'd'] as const).map(k => (
                                <div key={k}><Label>Option {k.toUpperCase()}</Label><Input value={editingQ[`option_${k}`] || ''} onChange={(e) => setEditingQ({ ...editingQ, [`option_${k}`]: e.target.value })} /></div>
                              ))}
                              <div>
                                <Label>Correct Option</Label>
                                <Select value={editingQ.correct_option} onValueChange={(v) => setEditingQ({ ...editingQ, correct_option: v })}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>{['a', 'b', 'c', 'd'].map(k => <SelectItem key={k} value={k}>{k.toUpperCase()}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                          {editingQ.question_type === 'truefalse' && (
                            <div>
                              <Label>Correct Answer</Label>
                              <Select value={editingQ.correct_option} onValueChange={(v) => setEditingQ({ ...editingQ, correct_option: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="true">True</SelectItem><SelectItem value="false">False</SelectItem></SelectContent>
                              </Select>
                            </div>
                          )}
                          {editingQ.question_type === 'fill' && (
                            <div><Label>Correct Answer (case-insensitive)</Label><Input value={editingQ.correct_option} onChange={(e) => setEditingQ({ ...editingQ, correct_option: e.target.value })} /></div>
                          )}
                          <div><Label>Marks</Label><Input type="number" value={editingQ.marks} onChange={(e) => setEditingQ({ ...editingQ, marks: e.target.value })} /></div>
                        </div>
                        <DialogFooter><Button onClick={saveQuestion}>Save</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  {!selectedTest ? <p className="text-sm text-muted-foreground text-center py-8">Select a test to manage questions.</p> :
                    questions.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No questions yet.</p> : (
                      <div className="space-y-2">
                        {questions.map((q, i) => (
                          <div key={q.id} className="border rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="text-sm font-medium">Q{i + 1}. {q.question_text}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  <Badge variant="outline">{q.question_type}</Badge> · Correct: <span className="font-mono">{q.correct_option}</span> · {q.marks} marks
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" onClick={() => { setEditingQ(q); setEditingQId(q.id); setQDialog(true); }}><Edit className="w-4 h-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => deleteQuestion(q.id)}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attempts">
            <Card>
              <CardHeader><CardTitle>Recent Student Attempts</CardTitle></CardHeader>
              <CardContent>
                {attempts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No attempts yet.</p> : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Student</TableHead><TableHead>Roll</TableHead><TableHead>Class</TableHead>
                      <TableHead>Test</TableHead><TableHead>Subject</TableHead>
                      <TableHead className="text-right">Score</TableHead><TableHead className="text-right">%</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {attempts.map(a => (
                        <TableRow key={a.id}>
                          <TableCell>{a.student_name}</TableCell>
                          <TableCell>{a.student_roll}</TableCell>
                          <TableCell>{a.student_class}</TableCell>
                          <TableCell>{a.mock_tests?.title || '—'}</TableCell>
                          <TableCell>{a.mock_tests?.subject || '—'}</TableCell>
                          <TableCell className="text-right">{a.score}/{a.total}</TableCell>
                          <TableCell className="text-right">{a.percentage}%</TableCell>
                          <TableCell className="text-xs">{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MockTestsAdmin;
