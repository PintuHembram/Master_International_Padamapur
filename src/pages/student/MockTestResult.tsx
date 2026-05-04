import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Trophy, ArrowLeft } from 'lucide-react';

const MockTestResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (!attemptId) return;
    (async () => {
      const { data: a } = await supabase.from('mock_attempts').select('*, mock_tests(title, subject, class)').eq('id', attemptId).maybeSingle();
      if (!a) return;
      setAttempt(a);
      const { data: qs } = await supabase.from('mock_questions').select('*').eq('test_id', a.test_id).order('position');
      setQuestions(qs || []);
    })();
  }, [attemptId]);

  if (!attempt) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const pass = Number(attempt.percentage) >= 40;
  const answers = attempt.answers || {};

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet><title>Result | Mock Test</title></Helmet>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/student/mock-tests')}><ArrowLeft className="w-4 h-4 mr-1" /> Back to Tests</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <Card className={pass ? 'border-green-500/50' : 'border-destructive/50'}>
          <CardContent className="pt-6 text-center space-y-3">
            <Trophy className={`w-16 h-16 mx-auto ${pass ? 'text-green-500' : 'text-muted-foreground'}`} />
            <h2 className="text-2xl font-bold">{attempt.mock_tests?.title}</h2>
            <p className="text-muted-foreground">{attempt.mock_tests?.subject} · Class {attempt.mock_tests?.class}</p>
            <div className="flex justify-center gap-6 pt-3">
              <div><p className="text-xs text-muted-foreground">Score</p><p className="text-3xl font-bold">{attempt.score}/{attempt.total}</p></div>
              <div><p className="text-xs text-muted-foreground">Percentage</p><p className="text-3xl font-bold">{attempt.percentage}%</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge className="text-base mt-1" variant={pass ? 'default' : 'destructive'}>{pass ? 'PASS' : 'TRY AGAIN'}</Badge></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Review Answers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {questions.map((q, i) => {
              const userAns = (answers[q.id] || '').toString().trim().toLowerCase();
              const correct = (q.correct_option || '').toString().trim().toLowerCase();
              const isCorrect = userAns && userAns === correct;
              return (
                <div key={q.id} className={`border rounded-lg p-3 ${isCorrect ? 'border-green-500/40 bg-green-500/5' : userAns ? 'border-destructive/40 bg-destructive/5' : 'border-muted'}`}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="font-medium text-sm">Q{i + 1}. {q.question_text}</div>
                      <div className="text-xs mt-1.5 space-y-0.5">
                        <div>Your answer: <span className="font-mono font-semibold">{userAns ? (q.question_type === 'mcq' ? `${userAns.toUpperCase()}. ${q[`option_${userAns}`] || ''}` : userAns) : '—'}</span></div>
                        {!isCorrect && <div className="text-green-600 dark:text-green-400">Correct: <span className="font-mono font-semibold">{q.question_type === 'mcq' ? `${correct.toUpperCase()}. ${q[`option_${correct}`] || ''}` : correct}</span></div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MockTestResult;
