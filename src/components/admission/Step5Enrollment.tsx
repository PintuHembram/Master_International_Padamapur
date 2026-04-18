import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Application } from "@/pages/admission/AdmissionApply";
import { CheckCircle2, Download, IdCard, Loader2, PartyPopper } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  application: Application;
  onRefresh: () => void;
}

export const Step5Enrollment = ({ application }: Props) => {
  const [genReceipt, setGenReceipt] = useState(false);
  const [genIdCard, setGenIdCard] = useState(false);

  const generateReceipt = async () => {
    setGenReceipt(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("MASTER INTERNATIONAL SCHOOL", 105, y, { align: "center" });
      y += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Padamapur • CBSE Affiliated", 105, y, { align: "center" });
      y += 12;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("ADMISSION RECEIPT", 105, y, { align: "center" });
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const rows: [string, string][] = [
        ["Application Number", application.application_number || "—"],
        ["Admission Number", application.admission_number || "—"],
        ["Student Name", application.full_name || "—"],
        ["Class Applied", application.applying_class || "—"],
        ["Father's Name", application.father_name || "—"],
        ["Date of Birth", application.date_of_birth || "—"],
        ["Payment Date", application.payment_date ? new Date(application.payment_date).toLocaleDateString("en-IN") : "—"],
        ["Transaction ID", application.payment_transaction_id || "—"],
        ["Total Paid", `INR ${(application.fee_total || 0).toLocaleString("en-IN")}`],
        ["Status", "ENROLLED"],
      ];
      rows.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold");
        doc.text(k + ":", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(v), margin + 55, y);
        y += 7;
      });

      const breakdown = (application.fee_breakdown as any[]) || [];
      if (breakdown.length) {
        y += 6;
        doc.setFont("helvetica", "bold");
        doc.text("Fee Breakdown", margin, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        breakdown.forEach((b) => {
          doc.text(b.label, margin, y);
          doc.text(`INR ${Number(b.amount).toLocaleString("en-IN")}`, 190, y, { align: "right" });
          y += 6;
        });
      }

      y = 270;
      doc.setFontSize(8);
      doc.text("This is a computer-generated receipt and does not require a signature.", 105, y, { align: "center" });

      doc.save(`Admission-Receipt-${application.application_number}.pdf`);
      toast.success("Receipt downloaded");
    } catch (e: any) {
      toast.error("Failed to generate receipt");
    } finally {
      setGenReceipt(false);
    }
  };

  const generateIdCard = async () => {
    setGenIdCard(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [85, 54] });

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 85, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("MASTER INTERNATIONAL SCHOOL", 42.5, 5, { align: "center" });
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.text("Provisional Admission Card", 42.5, 9, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text((application.full_name || "—").toUpperCase(), 4, 20);

      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      const rows: [string, string][] = [
        ["Adm No", application.admission_number || "—"],
        ["App No", application.application_number || "—"],
        ["Class", application.applying_class || "—"],
        ["DOB", application.date_of_birth || "—"],
        ["Father", application.father_name || "—"],
        ["Mobile", application.mobile || "—"],
      ];
      let yy = 26;
      rows.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold");
        doc.text(k + ":", 4, yy);
        doc.setFont("helvetica", "normal");
        doc.text(String(v), 18, yy);
        yy += 4;
      });

      doc.setFontSize(5);
      doc.text("Valid until enrollment confirmation", 42.5, 52, { align: "center" });

      doc.save(`ID-Card-${application.application_number}.pdf`);
      toast.success("ID Card downloaded");
    } catch (e: any) {
      toast.error("Failed to generate ID card");
    } finally {
      setGenIdCard(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Enrollment Confirmation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 py-10 text-center">
          <div className="relative">
            <CheckCircle2 className="h-16 w-16 text-primary" />
            <PartyPopper className="absolute -right-3 -top-2 h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Congratulations!</h2>
          <p className="text-muted-foreground">Your admission has been confirmed.</p>
        </div>

        <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Application Number</p>
            <p className="font-mono font-semibold">{application.application_number}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Admission Number</p>
            <p className="font-mono font-semibold">{application.admission_number}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Student</p>
            <p className="font-semibold">{application.full_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Class</p>
            <p className="font-semibold">{application.applying_class}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={generateReceipt} disabled={genReceipt} variant="outline" size="lg">
            {genReceipt ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Admission Receipt (PDF)
          </Button>
          <Button onClick={generateIdCard} disabled={genIdCard} variant="outline" size="lg">
            {genIdCard ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <IdCard className="mr-2 h-4 w-4" />}
            Student ID Card (PDF)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
