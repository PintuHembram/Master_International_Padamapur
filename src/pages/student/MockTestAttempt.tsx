import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

const MockTestAttempt = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [studentClass, setStudentClass] = useState<string>('');
  const submittedRef = useRef(false);

  useEffect(() => {
    const s = sessionStorage.getItem('studentSession');
    if (!s) { navigate('/student/login'); return; }
    setSession(JSON.parse(s));
  }, [navigate]);

  useEffect(() => {
    if (!session || !testId) return;
    (async () => {
      const [testRes, qRes, stuRes] = await Promise.all([
        supabase.from('mock_tests').select('*').eq('id', testId).maybeSingle(),
        supabase.from('mock_questions').select('*').eq('test_id', testId).order('position'),
        supabase.from('students').select('class, name').eq('id', session.id).maybeSingle(),
      ]);
      if (!testRes.data) { toast({ title: 'Test not found', variant: 'destructive' }); navigate('/student/mock-tests'); return; }
      setTest(testRes.data);
      // shuffle
      const qs = (qRes.data || []).slice().sort(() => Math.random() - 0.5);
      setQuestions(qs);
      setSecondsLeft((testRes.data.duration_minutes || 30) * 60);
      setStudentClass(stuRes.data?.class || '');
    })();
  }, [session, testId, navigate, toast]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submittedRef.current || !test || !session) return;
    submittedRef.current = true;
    setSubmitting(true);
    let score = 0;
    let total = 0;
    questions.forEach(q => {
      total += q.marks || 1;
      const a = (answers[q.id] || '').trim().toLowerCase();
      const correct = (q.correct_option || '').trim().toLowerCase();
      if (a && a === correct) score += q.marks || 1;
    });
    const percentage = total ? Number(((score / total) * 100).toFixed(2)) : 0;
    const { data, error } = await supabase.from('mock_attempts').insert({
      test_id: test.id,
      student_roll: session.roll_number,
      student_name: session.name,
      student_class: studentClass || '',
      answers,
      score,
      total,
      percentage,
      submitted_at: new Date().toISOString(),
    }).select('id').single();
    if (error) {
      toast({ title: 'Submit failed', description: error.message, variant: 'destructive' });
      setSubmitting(false); submittedRef.current = false;
      return;
    }
    if (auto) toast({ title: 'Time up — auto submitted' });
    navigate(`/student/mock-tests/result/${data.id}`);
  }, [test, session, questions, answers, studentClass, navigate, toast]);

  // Timer
  useEffect(() => {
    if (!test || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft(s => {
      if (s <= 1) { clearInterval(t); handleSubmit(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [test, secondsLeft, handleSubmit]);

  if (!test || questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">
      {!test ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /> :
        <div className="text-center"><p className="mb-4">No questions in this test.</p><Button onClick={() => navigate('/student/mock-tests')}>Back</Button></div>}
    </div>;
  }

  const q = questions[idx];
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const answered = Object.keys(answers).filter(k => answers[k]).length;

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet><title>{test.title} | Mock Test</title></Helmet>
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <div className="font-bold">{test.title}</div>
            <div className="text-xs text-muted-foreground">{test.subject} · Class {test.class}</div>
          </div>
          <Badge variant={secondsLeft < 60 ? 'destructive' : 'secondary'} className="text-base px-3 py-1.5 font-mono gap-1">
            <Clock className="w-4 h-4" /> {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </Badge>
        </div>
        <Progress value={((idx + 1) / questions.length) * 100} className="h-1 rounded-none" />
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Question {idx + 1} of {questions.length}</span>
          <span className="text-sm">Answered: {answered}/{questions.length}</span>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base leading-relaxed">Q{idx + 1}. {q.question_text}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {q.question_type === 'mcq' && (['a', 'b', 'c', 'd'] as const).map(k => {
              const val = q[`option_${k}`];
              if (!val) return null;
              const selected = answers[q.id] === k;
              return (
                <button key={k} type="button" onClick={() => setAnswers({ ...answers, [q.id]: k })}
                  className={`w-full text-left border rounded-lg p-3 transition ${selected ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}>
                  <span className="font-mono font-semibold mr-2">{k.toUpperCase()}.</span>{val}
                </button>
              );
            })}
            {q.question_type === 'truefalse' && ['true', 'false'].map(v => {
              const selected = answers[q.id] === v;
              return (
                <button key={v} type="button" onClick={() => setAnswers({ ...answers, [q.id]: v })}
                  className={`w-full text-left border rounded-lg p-3 capitalize transition ${selected ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}>
                  {v}
                </button>
              );
            })}
            {q.question_type === 'fill' && (
              <Input placeholder="Type your answer" value={answers[q.id] || ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)}><ChevronLeft className="w-4 h-4 mr-1" /> Previous</Button>
          {idx < questions.length - 1 ? (
            <Button onClick={() => setIdx(idx + 1)}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
          ) : (
            <Button onClick={() => handleSubmit(false)} disabled={submitting} className="gap-2"><CheckCircle2 className="w-4 h-4" /> Submit Test</Button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {questions.map((qq, i) => (
            <button key={qq.id} onClick={() => setIdx(i)}
              className={`w-8 h-8 rounded text-xs font-medium border transition ${i === idx ? 'border-primary bg-primary text-primary-foreground' : answers[qq.id] ? 'border-green-500 bg-green-500/10' : 'border-muted'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MockTestAttempt;
