import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Application = Tables<"admission_applications">;

interface Props {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

const Field = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value || "—"}</p>
  </div>
);

export const ApplicationDetailsDialog = ({ application, open, onOpenChange, onUpdated }: Props) => {
  const [saving, setSaving] = useState(false);
  const [assess, setAssess] = useState({
    assessment_date: "",
    assessment_mode: "",
    assessment_remarks: "",
    assessment_result: "",
  });

  useEffect(() => {
    if (application) {
      setAssess({
        assessment_date: application.assessment_date || "",
        assessment_mode: application.assessment_mode || "",
        assessment_remarks: application.assessment_remarks || "",
        assessment_result: application.assessment_result || "",
      });
    }
  }, [application]);

  if (!application) return null;

  const docs = (application.documents as Record<string, string>) || {};
  const fee = (application.fee_breakdown as any[]) || [];

  const saveAssessment = async () => {
    setSaving(true);
    try {
      const updates: any = { ...assess };
      if (assess.assessment_date) {
        updates.status =
          assess.assessment_result === "Pass"
            ? "assessment_passed"
            : assess.assessment_result === "Fail"
              ? "assessment_failed"
              : "assessment_scheduled";
      }
      const { error } = await supabase
        .from("admission_applications")
        .update(updates)
        .eq("id", application.id);
      if (error) throw error;
      toast.success("Assessment saved");
      onUpdated();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{application.full_name || "Application"}</span>
            <Badge variant="outline" className="font-mono">{application.application_number}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
            <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
            <TabsTrigger value="assessment" className="flex-1">Assessment</TabsTrigger>
            <TabsTrigger value="payment" className="flex-1">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 pt-4">
            <h4 className="font-semibold">Student</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Full Name" value={application.full_name} />
              <Field label="Gender" value={application.gender} />
              <Field label="DOB" value={application.date_of_birth} />
              <Field label="Blood Group" value={application.blood_group} />
              <Field label="Category" value={application.category} />
              <Field label="Religion" value={application.religion} />
              <Field label="Nationality" value={application.nationality} />
              <Field label="Aadhaar" value={application.aadhaar_number} />
            </div>
            <Separator />
            <h4 className="font-semibold">Contact</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Mobile" value={application.mobile} />
              <Field label="Email" value={application.email} />
              <Field label="City" value={application.city} />
              <Field label="State" value={application.state} />
              <Field label="Pincode" value={application.pincode} />
              <div className="col-span-2 sm:col-span-3"><Field label="Address" value={application.address} /></div>
            </div>
            <Separator />
            <h4 className="font-semibold">Academic</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Applying Class" value={application.applying_class} />
              <Field label="Medium" value={application.medium} />
              <Field label="Previous School" value={application.previous_school} />
              <Field label="Previous Class" value={application.previous_class} />
              <Field label="Marks" value={application.previous_marks} />
            </div>
            <Separator />
            <h4 className="font-semibold">Parents / Guardian</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Father" value={application.father_name} />
              <Field label="Father Occupation" value={application.father_occupation} />
              <Field label="Father Phone" value={application.father_phone} />
              <Field label="Mother" value={application.mother_name} />
              <Field label="Mother Occupation" value={application.mother_occupation} />
              <Field label="Mother Phone" value={application.mother_phone} />
              <Field label="Guardian" value={application.guardian_name} />
              <Field label="Guardian Phone" value={application.guardian_phone} />
            </div>
            <Separator />
            <h4 className="font-semibold">Health & Other</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Height" value={application.height} />
              <Field label="Weight" value={application.weight} />
              <Field label="Transport" value={application.transport_required ? "Yes" : "No"} />
              <Field label="Hostel" value={application.hostel_required ? "Yes" : "No"} />
              <Field label="Activities" value={(application.activities as string[] | null)?.join(", ")} />
              <div className="col-span-2 sm:col-span-3"><Field label="Medical" value={application.medical_conditions} /></div>
              <div className="col-span-2 sm:col-span-3"><Field label="Allergies" value={application.allergies} /></div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-3 pt-4">
            {Object.keys(docs).length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              Object.entries(docs).map(([k, v]) => (
                <a
                  key={k}
                  href={v}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                >
                  <span className="text-sm capitalize">{k.replace("_", " ")}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              ))
            )}
          </TabsContent>

          <TabsContent value="assessment" className="space-y-4 pt-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Assessment Date</Label>
                <Input
                  type="date"
                  value={assess.assessment_date}
                  onChange={(e) => setAssess({ ...assess, assessment_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Mode</Label>
                <Select
                  value={assess.assessment_mode}
                  onValueChange={(v) => setAssess({ ...assess, assessment_mode: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Remarks</Label>
                <Textarea
                  rows={3}
                  value={assess.assessment_remarks}
                  onChange={(e) => setAssess({ ...assess, assessment_remarks: e.target.value })}
                />
              </div>
              <div>
                <Label>Result</Label>
                <Select
                  value={assess.assessment_result}
                  onValueChange={(v) => setAssess({ ...assess, assessment_result: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Pass">Pass</SelectItem>
                    <SelectItem value="Fail">Fail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={saveAssessment} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Assessment
            </Button>
          </TabsContent>

          <TabsContent value="payment" className="space-y-3 pt-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Status" value={application.payment_status} />
              <Field label="Total" value={application.fee_total ? `₹ ${Number(application.fee_total).toLocaleString("en-IN")}` : "—"} />
              <Field label="Transaction ID" value={application.payment_transaction_id} />
              <Field label="Paid On" value={application.payment_date ? new Date(application.payment_date).toLocaleString() : "—"} />
              <Field label="Admission No" value={application.admission_number} />
            </div>
            {fee.length > 0 && (
              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr><th className="p-2 text-left">Component</th><th className="p-2 text-right">Amount</th></tr>
                  </thead>
                  <tbody>
                    {fee.map((f, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-2">{f.label}</td>
                        <td className="p-2 text-right font-mono">₹ {Number(f.amount).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
