import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { BookOpen, ClipboardList, LogOut, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type StaffProfile = Tables<'staff'>;

export default function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('email', user.email)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;
      if (error) {
        toast.error(`Unable to load teacher profile: ${error.message}`);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [user?.email]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(`Unable to sign out: ${error.message}`);
      return;
    }
    navigate('/admin/login');
  };

  const initials = profile?.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'T';

  return (
    <>
      <Helmet>
        <title>Teacher Dashboard - Master International School</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-primary text-primary-foreground shadow">
          <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
            <div>
              <p className="text-sm opacity-80">Master International School</p>
              <h1 className="text-xl font-bold">Teacher Dashboard</h1>
            </div>
            <Button variant="secondary" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>

        <main className="container mx-auto space-y-6 px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Your staff details and teaching assignment.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading your profile…</p>
              ) : profile ? (
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.photo_url ?? undefined} alt={profile.name} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Teacher name</p>
                      <p className="font-semibold">{profile.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employee ID</p>
                      <p className="font-semibold">{profile.employee_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Joining year</p>
                      <p className="font-semibold">{profile.joining_year ?? 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subject</p>
                      <p className="font-semibold">{profile.subject || profile.department || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Class</p>
                      <p className="font-semibold">{profile.assigned_class || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="flex items-center gap-2 font-semibold">
                        <Mail className="h-4 w-4" />
                        {profile.email}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No staff profile is linked to {user?.email}. Please ask an administrator to add your staff record using this sign-in email.
                </p>
              )}
            </CardContent>
          </Card>

          <section aria-labelledby="teaching-tools-title" className="space-y-3">
            <div>
              <h2 id="teaching-tools-title" className="text-xl font-semibold">Teaching tools</h2>
              <p className="text-sm text-muted-foreground">Your available teacher workspaces.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Question Bank
                  </CardTitle>
                  <CardDescription>Create and manage questions for assessments.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate('/admin/question-bank')}>Open question bank</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Mock Tests
                  </CardTitle>
                  <CardDescription>Create and manage student mock tests.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate('/admin/mock-tests')}>Open mock tests</Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
