import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Application } from "@/pages/admission/AdmissionApply";
import { ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Props {
  application: Application;
  onBack: () => void;
  onContinue: () => void;
}

export const Step3Assessment = ({ application, onBack, onContinue }: Props) => {
  const result = application.assessment_result;
  const scheduled = !!application.assessment_date;
  const passed = result === "Pass";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Assessment</CardTitle>
        <p className="text-sm text-muted-foreground">
          The school will review your application and schedule an assessment.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!scheduled ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
            <Clock className="h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Awaiting Assessment Schedule</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Our admissions team is reviewing your application. You'll be notified once an assessment is scheduled. Check back here or contact the school office.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Assessment Date</p>
                <p className="flex items-center gap-2 font-medium">
                  <CalendarClock className="h-4 w-4" />
                  {new Date(application.assessment_date!).toLocaleDateString("en-IN", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mode</p>
                <p className="font-medium">{application.assessment_mode || "—"}</p>
              </div>
              {application.assessment_remarks && (
                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground">Remarks</p>
                  <p>{application.assessment_remarks}</p>
                </div>
              )}
            </div>

            {result && (
              <div
                className={`flex items-center gap-3 rounded-lg border p-4 ${
                  passed
                    ? "border-primary/30 bg-primary/5"
                    : result === "Fail"
                      ? "border-destructive/30 bg-destructive/5"
                      : "bg-muted"
                }`}
              >
                {passed ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : result === "Fail" ? (
                  <XCircle className="h-6 w-6 text-destructive" />
                ) : (
                  <Clock className="h-6 w-6 text-muted-foreground" />
                )}
                <div>
                  <p className="font-semibold">Result: <Badge variant={passed ? "default" : result === "Fail" ? "destructive" : "secondary"}>{result}</Badge></p>
                  {!passed && result === "Pending" && (
                    <p className="text-sm text-muted-foreground">Result will be published soon.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={onContinue} disabled={!passed}>
            Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {!passed && (
          <p className="text-center text-xs text-muted-foreground">
            Payment unlocks once the assessment is marked as Pass by the admin.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
