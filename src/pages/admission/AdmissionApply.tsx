import { Layout } from "@/components/Layout";
import { AdmissionStepper } from "@/components/admission/AdmissionStepper";
import { Step1Application } from "@/components/admission/Step1Application";
import { Step2Documents } from "@/components/admission/Step2Documents";
import { Step3Assessment } from "@/components/admission/Step3Assessment";
import { Step4Payment } from "@/components/admission/Step4Payment";
import { Step5Enrollment } from "@/components/admission/Step5Enrollment";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Copy, Loader2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export type Application = Tables<"admission_applications">;

export default function AdmissionApply() {
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const sessionRaw = sessionStorage.getItem("admissionSession");
    if (!sessionRaw) {
      navigate("/admission/start");
      return;
    }
    const session = JSON.parse(sessionRaw);
    fetchApp(session.applicationId);
  }, [navigate]);

  const fetchApp = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admission_applications")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      toast.error("Could not load application");
      sessionStorage.removeItem("admissionSession");
      navigate("/admission/start");
      return;
    }
    setApplication(data);
    setStep(data.current_step || 1);
    setLoading(false);
  };

  const refresh = async () => {
    if (application) await fetchApp(application.id);
  };

  const goToStep = (n: number) => {
    if (!application) return;
    const highest = application.current_step || 1;
    if (n <= highest) setStep(n);
  };

  const logout = () => {
    sessionStorage.removeItem("admissionSession");
    navigate("/admission/start");
  };

  const copyAppNumber = () => {
    if (!application?.application_number) return;
    navigator.clipboard.writeText(application.application_number);
    toast.success("Application number copied");
  };

  if (loading || !application) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Admission Application — Step {step} of 5 | Master International School</title>
        <meta name="description" content="Complete your admission application in 5 steps." />
      </Helmet>

      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Admission Application</h1>
              <button
                onClick={copyAppNumber}
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <span className="font-mono">{application.application_number}</span>
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Save & Exit
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Save your Application Number</strong> — <span className="font-mono">{application.application_number}</span>.
              You can resume anytime with this number and the student's date of birth.
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-6">
              <AdmissionStepper
                currentStep={step}
                highestCompleted={application.current_step || 1}
                onStepClick={goToStep}
              />
            </CardContent>
          </Card>

          <div>
            {step === 1 && (
              <Step1Application
                application={application}
                onSaved={async () => {
                  await refresh();
                  setStep(2);
                }}
              />
            )}
            {step === 2 && (
              <Step2Documents
                application={application}
                onBack={() => setStep(1)}
                onSaved={async () => {
                  await refresh();
                  setStep(3);
                }}
              />
            )}
            {step === 3 && (
              <Step3Assessment
                application={application}
                onBack={() => setStep(2)}
                onContinue={async () => {
                  await refresh();
                  setStep(4);
                }}
              />
            )}
            {step === 4 && (
              <Step4Payment
                application={application}
                onBack={() => setStep(3)}
                onPaid={async () => {
                  await refresh();
                  setStep(5);
                }}
              />
            )}
            {step === 5 && (
              <Step5Enrollment
                application={application}
                onRefresh={refresh}
              />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
