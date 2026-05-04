import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, ListChecks, Play, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const normalizeClassValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  const match = raw.match(/^Class\s*(\d+)$/i);
  return match ? match[1] : raw;
};

const buildClassFilter = (value: string | null | undefined) => {
  const normalized = normalizeClassValue(value);
  if (!normalized) return null;
  const variants = new Set<string>();
  variants.add(normalized);
  if (/^\d+$/.test(normalized)) {
    variants.add(`Class ${normalized}`);
  } else {
    const numeric = normalized.replace(/^Class\s*/i, '');
    if (/^\d+$/.test(numeric)) {
      variants.add(numeric);
    }
  }
  const filter = Array.from(variants)
    .map((c) => `class.eq.${c}`)
    .join(',');
  return filter || null;
};

const MockTestsList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const s = sessionStorage.getItem('studentSession');
    if (!s) { navigate('/student/login'); return; }
    const parsed = JSON.parse(s);
    setSession(parsed);
    load(parsed);
  }, [navigate]);

  const load = async (s: any) => {
    try {
      const { data: stu, error: studentError } = await supabase.from('students').select('class').eq('id', s.id).maybeSingle();
      if (studentError) throw studentError;

      const studentClass = s.class || stu?.class;
      const classFilter = buildClassFilter(studentClass);
      let testsQuery = supabase.from('mock_tests').select('*').eq('is_active', true);
      if (classFilter) {
        testsQuery = testsQuery.or(classFilter);
      }

      const [testsRes, attemptsRes] = await Promise.all([
        testsQuery.order('created_at', { ascending: false }),
        supabase.from('mock_attempts').select('*, mock_tests(title, subject)').eq('student_roll', s.roll_number).not('submitted_at', 'is', null).order('submitted_at', { ascending: false }),
      ]);

      if (testsRes.error) throw testsRes.error;
      if (attemptsRes.error) throw attemptsRes.error;

      setTests(testsRes.data || []);
      setAttempts(attemptsRes.data || []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load tests.');
      setTests([]);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet><title>Mock Tests | Student Portal</title></Helmet>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/dashboard')}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
            <h1 className="font-bold text-lg flex items-center gap-2"><ListChecks className="w-5 h-5" /> Mock Tests</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader><CardTitle>Available Tests</CardTitle></CardHeader>
          <CardContent>
            {error ? (
              <p className="text-sm text-destructive text-center py-6">{error}</p>
            ) : tests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No tests available for your class right now.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {tests.map(t => (
                  <div key={t.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="font-semibold">{t.title}</div>
                    <div className="flex flex-wrap gap-1 my-2">
                      <Badge variant="secondary">{t.subject}</Badge>
                      <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />{t.duration_minutes} min</Badge>
                      <Badge variant="outline">{t.total_marks} marks</Badge>
                    </div>
                    {t.instructions && <p className="text-xs text-muted-foreground mb-3">{t.instructions}</p>}
                    <Button size="sm" className="w-full gap-2" onClick={() => navigate(`/student/mock-tests/${t.id}/attempt`)}><Play className="w-4 h-4" /> Start Test</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5" /> Past Results</CardTitle></CardHeader>
          <CardContent>
            {attempts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No attempts yet.</p> : (
              <div className="space-y-2">
                {attempts.map(a => (
                  <div key={a.id} className="border rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{a.mock_tests?.title}</div>
                      <div className="text-xs text-muted-foreground">{a.mock_tests?.subject} · {new Date(a.submitted_at).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{a.score}/{a.total}</div>
                      <Badge variant={Number(a.percentage) >= 40 ? 'default' : 'destructive'}>{a.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MockTestsList;
