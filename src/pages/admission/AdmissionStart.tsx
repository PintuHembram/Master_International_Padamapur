import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, FilePlus, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdmissionStart() {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [resumeNumber, setResumeNumber] = useState("");
  const [resumeDob, setResumeDob] = useState("");

  const startNew = async () => {
    setStarting(true);
    try {
      const { data, error } = await supabase
        .from("admission_applications")
        .insert({ status: "draft", current_step: 1 })
        .select("id, application_number")
        .single();

      if (error) throw error;

      sessionStorage.setItem(
        "admissionSession",
        JSON.stringify({ applicationId: data.id, applicationNumber: data.application_number }),
      );
      toast.success(`Application started: ${data.application_number}`, {
        description: "Save this number — you'll need it to resume.",
      });
      navigate("/admission/apply");
    } catch (e: any) {
      toast.error(e.message || "Failed to start application");
    } finally {
      setStarting(false);
    }
  };

  const resume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeNumber.trim() || !resumeDob) {
      toast.error("Enter both Application Number and Date of Birth");
      return;
    }
    setResuming(true);
    try {
      const { data, error } = await supabase
        .from("admission_applications")
        .select("id, application_number, resume_dob, date_of_birth")
        .eq("application_number", resumeNumber.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Application not found");
        return;
      }

      // Match against either the dedicated resume_dob OR the student DOB once filled.
      const stored = data.resume_dob || data.date_of_birth;
      if (!stored || stored !== resumeDob) {
        toast.error("Date of birth does not match");
        return;
      }

      sessionStorage.setItem(
        "admissionSession",
        JSON.stringify({ applicationId: data.id, applicationNumber: data.application_number }),
      );
      toast.success("Welcome back");
      navigate("/admission/apply");
    } catch (e: any) {
      toast.error(e.message || "Failed to resume");
    } finally {
      setResuming(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Start Admission Application | Master International School</title>
        <meta
          name="description"
          content="Start a new admission application or resume an existing one with your Application Number and Date of Birth."
        />
        <link rel="canonical" href="/admission/start" />
      </Helmet>

      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">Admission Application</h1>
            <p className="text-muted-foreground">
              Apply in 5 simple steps. No signup required — you'll get an Application Number to resume anytime.
            </p>
          </div>

          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">
                <FilePlus className="mr-2 h-4 w-4" />
                New Application
              </TabsTrigger>
              <TabsTrigger value="resume">
                <KeyRound className="mr-2 h-4 w-4" />
                Resume
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new">
              <Card>
                <CardHeader>
                  <CardTitle>Start a new application</CardTitle>
                  <CardDescription>
                    We'll generate an Application Number for you. Save it — you'll need it (with the student's date of birth) to resume.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={startNew} disabled={starting} size="lg" className="w-full">
                    {starting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                      </>
                    ) : (
                      <>
                        Start Application <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resume">
              <Card>
                <CardHeader>
                  <CardTitle>Resume your application</CardTitle>
                  <CardDescription>Enter your Application Number and the student's Date of Birth.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={resume} className="space-y-4">
                    <div>
                      <Label htmlFor="appnum">Application Number</Label>
                      <Input
                        id="appnum"
                        placeholder="MIS-APP-2026-0001"
                        value={resumeNumber}
                        onChange={(e) => setResumeNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={resumeDob}
                        onChange={(e) => setResumeDob(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={resuming} size="lg" className="w-full">
                      {resuming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Looking up...
                        </>
                      ) : (
                        "Resume"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}
