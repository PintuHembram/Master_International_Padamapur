import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { Application } from "@/pages/admission/AdmissionApply";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  application: Application;
  onBack: () => void;
  onSaved: () => void;
}

const DOC_SLOTS: { key: string; label: string; required: boolean }[] = [
  { key: "birth_cert", label: "Birth Certificate", required: true },
  { key: "photo", label: "Student Photo", required: true },
  { key: "aadhaar", label: "Aadhaar Card", required: false },
  { key: "tc", label: "Previous School TC", required: false },
  { key: "marksheet", label: "Marksheet", required: false },
];

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

type DocsState = Record<string, string | undefined>;

export const Step2Documents = ({ application, onBack, onSaved }: Props) => {
  const [docs, setDocs] = useState<DocsState>(
    (application.documents as DocsState) || {},
  );
  const [uploading, setUploading] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const upload = async (slot: string, file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Only PDF, JPG, PNG accepted");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Max file size is 5 MB");
      return;
    }

    setUploading(slot);
    try {
      const ext = file.name.split(".").pop();
      const path = `${application.application_number}/${slot}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("admission-documents")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from("admission-documents")
        .getPublicUrl(path);

      const next = { ...docs, [slot]: urlData.publicUrl };
      setDocs(next);

      const { error: updErr } = await supabase
        .from("admission_applications")
        .update({ documents: next })
        .eq("id", application.id);
      if (updErr) throw updErr;

      toast.success(`${slot} uploaded`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const remove = async (slot: string) => {
    const next = { ...docs };
    delete next[slot];
    setDocs(next);
    await supabase
      .from("admission_applications")
      .update({ documents: next })
      .eq("id", application.id);
    toast.success("Removed");
  };

  const advance = async () => {
    const missingRequired = DOC_SLOTS.filter((s) => s.required && !docs[s.key]);
    if (missingRequired.length) {
      toast.error(`Required: ${missingRequired.map((s) => s.label).join(", ")}`);
      return;
    }
    setAdvancing(true);
    try {
      const { error } = await supabase
        .from("admission_applications")
        .update({
          status: "documents_pending",
          current_step: Math.max(application.current_step || 2, 3),
        })
        .eq("id", application.id);
      if (error) throw error;
      toast.success("Documents submitted");
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Submit Documents</CardTitle>
        <p className="text-sm text-muted-foreground">PDF, JPG, or PNG. Max 5 MB per file.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {DOC_SLOTS.map((slot) => {
          const url = docs[slot.key];
          const isUploading = uploading === slot.key;
          return (
            <div key={slot.key} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {url ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label className="text-base">
                      {slot.label}
                      {slot.required && <span className="ml-1 text-destructive">*</span>}
                    </Label>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs text-primary hover:underline"
                      >
                        View uploaded file
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {url && (
                    <Button variant="ghost" size="sm" onClick={() => remove(slot.key)}>
                      <X className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  )}
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) upload(slot.key, f);
                        e.target.value = "";
                      }}
                      disabled={isUploading}
                    />
                    <Button variant={url ? "outline" : "default"} size="sm" disabled={isUploading} type="button">
                      {isUploading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading</>
                      ) : (
                        <><Upload className="mr-2 h-4 w-4" /> {url ? "Replace" : "Upload"}</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={advance} disabled={advancing}>
            {advancing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue to Assessment <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
