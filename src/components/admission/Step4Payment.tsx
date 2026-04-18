import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Application } from "@/pages/admission/AdmissionApply";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  application: Application;
  onBack: () => void;
  onPaid: () => void;
}

const FEE_BREAKDOWN = [
  { label: "Admission Fee (one-time)", amount: 5000 },
  { label: "Tuition Fee (Term 1)", amount: 18000 },
  { label: "Books & Uniform", amount: 3500 },
  { label: "Activity & Lab Charges", amount: 1500 },
];
const TOTAL = FEE_BREAKDOWN.reduce((s, f) => s + f.amount, 0);

export const Step4Payment = ({ application, onBack, onPaid }: Props) => {
  const [paying, setPaying] = useState(false);
  const alreadyPaid = application.payment_status === "paid";

  const pay = async () => {
    setPaying(true);
    try {
      // MOCK payment — replace with Stripe/Razorpay later
      await new Promise((r) => setTimeout(r, 1500));
      const txnId = `MOCK-TXN-${Date.now()}`;
      const admNum = application.admission_number || `ADM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

      const { error } = await supabase
        .from("admission_applications")
        .update({
          fee_total: TOTAL,
          fee_breakdown: FEE_BREAKDOWN,
          payment_status: "paid",
          payment_transaction_id: txnId,
          payment_date: new Date().toISOString(),
          status: "paid",
          current_step: Math.max(application.current_step || 4, 5),
          admission_number: admNum,
          enrolled_at: new Date().toISOString(),
        })
        .eq("id", application.id);
      if (error) throw error;
      toast.success("Payment successful");
      onPaid();
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Fee Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">Fee Component</th>
                <th className="p-3 text-right text-sm font-semibold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {FEE_BREAKDOWN.map((f) => (
                <tr key={f.label} className="border-b last:border-0">
                  <td className="p-3 text-sm">{f.label}</td>
                  <td className="p-3 text-right font-mono text-sm">{f.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
              <tr className="bg-muted/30 font-semibold">
                <td className="p-3">Total</td>
                <td className="p-3 text-right font-mono">₹ {TOTAL.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
          <strong>Demo mode:</strong> This is a mock payment for demonstration. No real money will be charged.
          Real payment gateway (Stripe / Razorpay) can be enabled later.
        </div>

        {alreadyPaid && (
          <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <div className="text-sm">
              <p className="font-semibold">Payment Received</p>
              <p className="text-muted-foreground">Transaction: {application.payment_transaction_id}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {alreadyPaid ? (
            <Button onClick={onPaid}>Continue to Enrollment</Button>
          ) : (
            <Button onClick={pay} disabled={paying} size="lg">
              {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
              Pay ₹ {TOTAL.toLocaleString("en-IN")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
