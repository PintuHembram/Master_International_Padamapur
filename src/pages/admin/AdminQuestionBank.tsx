import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, BookOpen, Edit, LogOut, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const CLASSES = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const SUBJECTS = ['English', 'Hindi', 'Odia', 'Mathematics', 'EVS', 'Computer Science', 'SST'];

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
  difficulty?: string;
}

const emptyQuestion = {
  question_text: '',
  question_type: 'mcq',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_option: 'a',
  marks: 1,
  difficulty: 'medium'
};

const AdminQuestionBank = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<MockTest[]>([]);
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('1');
  const [selectedSubject, setSelectedSubject] = useState<string>('English');
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const [qDialog, setQDialog] = useState(false);
  const [editingQ, setEditingQ] = useState<any>(emptyQuestion);
  const [editingQId, setEditingQId] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      fetchQuestions(selectedTest.id);
    } else {
      setQuestions([]);
    }
  }, [selectedTest]);

  const fetchTests = async () => {
    const { data } = await supabase
      .from('mock_tests')
      .select('*')
      .order('created_at', { ascending: false });
    setTests(data || []);
  };

  const fetchQuestions = async (testId: string) => {
    const { data } = await supabase
      .from('mock_questions')
      .select('*')
      .eq('test_id', testId)
      .order('position');
    setQuestions(data || []);
  };

  const filteredTests = tests.filter(test =>
    test.class === selectedClass && test.subject === selectedSubject
  );

  const saveQuestion = async () => {
    if (!selectedTest) return;
    if (!editingQ.question_text) {
      return toast({ title: 'Question text required', variant: 'destructive' });
    }

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

    if (res.error) {
      return toast({ title: 'Error', description: res.error.message, variant: 'destructive' });
    }

    // Recalculate total marks for the test
    const { data: qs } = await supabase.from('mock_questions').select('marks').eq('test_id', selectedTest.id);
    const total = (qs || []).reduce((s: number, x: any) => s + (x.marks || 0), 0);
    await supabase.from('mock_tests').update({ total_marks: total }).eq('id', selectedTest.id);

    toast({ title: 'Question saved successfully' });
    setQDialog(false);
    setEditingQ(emptyQuestion);
    setEditingQId(null);
    fetchQuestions(selectedTest.id);
    fetchTests();
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    const { error } = await supabase.from('mock_questions').delete().eq('id', id);
    if (error) {
      return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    if (selectedTest) {
      fetchQuestions(selectedTest.id);
      // Recalculate total marks
      const { data: qs } = await supabase.from('mock_questions').select('marks').eq('test_id', selectedTest.id);
      const total = (qs || []).reduce((s: number, x: any) => s + (x.marks || 0), 0);
      await supabase.from('mock_tests').update({ total_marks: total }).eq('id', selectedTest.id);
      fetchTests();
    }
  };

  const handleTestSelect = (test: MockTest) => {
    setSelectedTest(test);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet>
        <title>Question Bank Admin | Master International</title>
      </Helmet>

      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/admissions')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <h1 className="font-bold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Question Bank Admin
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate('/admin/login'); }}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="class-select">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map(cls => (
                      <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject-select">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(sub => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tests List */}
          <Card>
            <CardHeader>
              <CardTitle>Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTests.length === 0 ? (
                  <p className="text-muted-foreground">No tests found for selected class and subject.</p>
                ) : (
                  filteredTests.map(test => (
                    <Button
                      key={test.id}
                      variant={selectedTest?.id === test.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleTestSelect(test)}
                    >
                      {test.title}
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Questions</CardTitle>
              {selectedTest && (
                <Dialog open={qDialog} onOpenChange={setQDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => {
                      setEditingQ(emptyQuestion);
                      setEditingQId(null);
                    }}>
                      <Plus className="w-4 h-4 mr-1" /> Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingQId ? 'Edit Question' : 'Add Question'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Question Type</Label>
                        <Select value={editingQ.question_type} onValueChange={(value) => setEditingQ({...editingQ, question_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Question Text</Label>
                        <Textarea
                          value={editingQ.question_text}
                          onChange={(e) => setEditingQ({...editingQ, question_text: e.target.value})}
                          placeholder="Enter question text"
                        />
                      </div>
                      {editingQ.question_type === 'mcq' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Option A</Label>
                              <Input
                                value={editingQ.option_a}
                                onChange={(e) => setEditingQ({...editingQ, option_a: e.target.value})}
                                placeholder="Option A"
                              />
                            </div>
                            <div>
                              <Label>Option B</Label>
                              <Input
                                value={editingQ.option_b}
                                onChange={(e) => setEditingQ({...editingQ, option_b: e.target.value})}
                                placeholder="Option B"
                              />
                            </div>
                            <div>
                              <Label>Option C</Label>
                              <Input
                                value={editingQ.option_c}
                                onChange={(e) => setEditingQ({...editingQ, option_c: e.target.value})}
                                placeholder="Option C"
                              />
                            </div>
                            <div>
                              <Label>Option D</Label>
                              <Input
                                value={editingQ.option_d}
                                onChange={(e) => setEditingQ({...editingQ, option_d: e.target.value})}
                                placeholder="Option D"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Correct Option</Label>
                            <Select value={editingQ.correct_option} onValueChange={(value) => setEditingQ({...editingQ, correct_option: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="a">A</SelectItem>
                                <SelectItem value="b">B</SelectItem>
                                <SelectItem value="c">C</SelectItem>
                                <SelectItem value="d">D</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                      {editingQ.question_type === 'true_false' && (
                        <div>
                          <Label>Correct Answer</Label>
                          <Select value={editingQ.correct_option} onValueChange={(value) => setEditingQ({...editingQ, correct_option: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Marks</Label>
                          <Input
                            type="number"
                            value={editingQ.marks}
                            onChange={(e) => setEditingQ({...editingQ, marks: parseInt(e.target.value) || 1})}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label>Difficulty</Label>
                          <Select value={editingQ.difficulty} onValueChange={(value) => setEditingQ({...editingQ, difficulty: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setQDialog(false)}>Cancel</Button>
                      <Button onClick={saveQuestion}>Save Question</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {!selectedTest ? (
                <p className="text-muted-foreground">Select a test to view questions.</p>
              ) : questions.length === 0 ? (
                <p className="text-muted-foreground">No questions found for this test.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {questions.map((q, index) => (
                    <Card key={q.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{index + 1}. {q.question_text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{q.question_type}</Badge>
                            <Badge variant="secondary">{q.marks} marks</Badge>
                            {q.difficulty && <Badge variant="outline">{q.difficulty}</Badge>}
                          </div>
                          {q.question_type === 'mcq' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Correct: {q.correct_option.toUpperCase()}
                            </div>
                          )}
                          {q.question_type === 'true_false' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Correct: {q.correct_option === 'true' ? 'True' : 'False'}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingQ(q);
                              setEditingQId(q.id);
                              setQDialog(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteQuestion(q.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminQuestionBank;