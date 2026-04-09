import misLogo from '@/assets/mis-logo.png';
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, FileText, Printer, Receipt, School } from "lucide-react";
import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

const feeCategories = ["Tuition Fee", "Exam Fee", "Transport Fee", "Hostel Fee"];
const paymentModes = ["Cash", "UPI", "Bank Transfer", "Cheque", "Online"];
const classes = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

interface ReceiptData {
  receipt_number: string;
  student_name: string;
  student_class: string;
  roll_number: string;
  father_name: string;
  fee_category: string;
  amount: number;
  payment_mode: string;
  payment_date: string;
  academic_year: string;
  remarks: string;
}

const generateReceiptNumber = () => {
  const now = new Date();
  return `MIS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const FeePayment = () => {
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    student_name: "",
    student_class: "",
    roll_number: "",
    father_name: "",
    fee_category: "",
    amount: "",
    payment_mode: "",
    payment_date: new Date().toISOString().split("T")[0],
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    remarks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fee_category || !formData.payment_mode || !formData.student_class) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const receiptNumber = generateReceiptNumber();

    try {
      const payload = {
        receipt_number: receiptNumber,
        student_name: formData.student_name,
        student_class: formData.student_class,
        roll_number: formData.roll_number || null,
        father_name: formData.father_name || null,
        fee_category: formData.fee_category,
        amount: parseFloat(formData.amount),
        payment_mode: formData.payment_mode.toLowerCase(),
        payment_date: formData.payment_date,
        academic_year: formData.academic_year,
        remarks: formData.remarks || null,
      };

      const { error } = await supabase.from("fee_payments").insert(payload);
      if (error) throw error;

      setReceipt({
        ...payload,
        amount: parseFloat(formData.amount),
        roll_number: formData.roll_number,
        father_name: formData.father_name,
        remarks: formData.remarks,
      });
      toast.success("Payment recorded successfully! Receipt generated.");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fee Receipt - ${receipt?.receipt_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a2a44; }
          .receipt { max-width: 700px; margin: 0 auto; border: 2px solid #1a3a5c; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1a3a5c, #2a5a8c); color: #fff; padding: 24px 32px; text-align: center; }
          .header h1 { font-size: 22px; margin-bottom: 4px; letter-spacing: 1px; }
          .header p { font-size: 12px; opacity: 0.85; }
          .receipt-title { background: #d4a853; color: #1a2a44; text-align: center; padding: 10px; font-weight: 700; font-size: 15px; letter-spacing: 2px; }
          .info { padding: 24px 32px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e0e0e0; }
          .row:last-child { border-bottom: none; }
          .label { font-weight: 600; color: #64748b; font-size: 13px; }
          .value { font-weight: 500; font-size: 14px; text-align: right; }
          .amount-row { background: #f0f7ff; padding: 14px 32px; margin: 0 0; }
          .amount-row .value { font-size: 22px; font-weight: 800; color: #1a3a5c; }
          .footer { padding: 20px 32px; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }
          .signature { text-align: right; margin-top: 40px; padding-right: 32px; }
          .signature-line { border-top: 1px solid #1a3a5c; width: 180px; display: inline-block; margin-bottom: 4px; }
          @media print { body { padding: 20px; } .receipt { border: 1px solid #333; } }
        </style>
      </head>
      <body>
        ${receiptRef.current.innerHTML}
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const resetForm = () => {
    setReceipt(null);
    setFormData({
      student_name: "",
      student_class: "",
      roll_number: "",
      father_name: "",
      fee_category: "",
      amount: "",
      payment_mode: "",
      payment_date: new Date().toISOString().split("T")[0],
      academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      remarks: "",
    });
  };

  return (
    <Layout>
      <Helmet>
        <title>Fee Payment Portal | Master International, Padamapur</title>
        <meta name="description" content="Online fee payment portal for Master International, Padamapur. Record tuition, exam, transport, and hostel fees with instant printable receipts." />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-3xl">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Fee Payment</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
              Online Fee Payment Portal
            </h1>
            <p className="text-white/80 text-lg">
              Record fee payments and generate instant printable receipts.
            </p>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {!receipt ? (
            <div className="max-w-3xl mx-auto">
              {/* Category Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {feeCategories.map((cat) => {
                  const icons: Record<string, typeof CreditCard> = {
                    "Tuition Fee": School,
                    "Exam Fee": FileText,
                    "Transport Fee": CreditCard,
                    "Hostel Fee": Receipt,
                  };
                  const Icon = icons[cat] || CreditCard;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, fee_category: cat })}
                      className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 ${
                        formData.fee_category === cat
                          ? "border-gold bg-gold/10 shadow-md"
                          : "border-border/50 bg-card hover:border-gold/50 hover:shadow-sm"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        formData.fee_category === cat ? "bg-gold text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-foreground text-center">{cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form */}
              <Card className="p-8 border-border/50 shadow-sm">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Payment Details</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student_name">Student Name *</Label>
                      <Input id="student_name" value={formData.student_name} onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} required disabled={loading} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="father_name">Father's Name</Label>
                      <Input id="father_name" value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} disabled={loading} className="mt-1.5" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Class *</Label>
                      <Select value={formData.student_class} onValueChange={(v) => setFormData({ ...formData, student_class: v })} disabled={loading}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select class" /></SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => <SelectItem key={c} value={c}>{c === "Nursery" || c === "LKG" || c === "UKG" ? c : `Class ${c}`}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="roll_number">Roll Number</Label>
                      <Input id="roll_number" value={formData.roll_number} onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })} disabled={loading} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="academic_year">Academic Year *</Label>
                      <Input id="academic_year" value={formData.academic_year} onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })} required disabled={loading} className="mt-1.5" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount (₹) *</Label>
                      <Input id="amount" type="number" min="1" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required disabled={loading} className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Payment Mode *</Label>
                      <Select value={formData.payment_mode} onValueChange={(v) => setFormData({ ...formData, payment_mode: v })} disabled={loading}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select mode" /></SelectTrigger>
                        <SelectContent>
                          {paymentModes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="payment_date">Payment Date *</Label>
                      <Input id="payment_date" type="date" value={formData.payment_date} onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} required disabled={loading} className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea id="remarks" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} disabled={loading} className="mt-1.5" rows={3} placeholder="Any additional notes..." />
                  </div>
                  <Button type="submit" variant="gold" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Processing..." : "Record Payment & Generate Receipt"}
                    <Receipt className="w-5 h-5" />
                  </Button>
                </form>
              </Card>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={handlePrint} variant="gold" size="lg">
                  <Printer className="w-5 h-5" />
                  Print Receipt
                </Button>
                <Button onClick={resetForm} variant="outline" size="lg">
                  Record Another Payment
                </Button>
              </div>

              {/* Receipt Preview */}
              <div ref={receiptRef}>
                <div className="receipt" style={{ maxWidth: 700, margin: "0 auto", border: "2px solid hsl(213, 52%, 24%)", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ background: "linear-gradient(135deg, hsl(213,52%,24%), hsl(213,40%,35%))", color: "#fff", padding: "24px 32px", textAlign: "center" }}>                  <img src={misLogo} alt="MIS Logo" style={{ width: '80px', height: 'auto', marginBottom: '10px' }} />                    <h1 style={{ fontSize: 22, marginBottom: 4, letterSpacing: 1 }}>Master International School</h1>
                    <p style={{ fontSize: 12, opacity: 0.85 }}>Padamapur, Anandapur, Odisha — CBSE Affiliated</p>
                  </div>
                  <div style={{ background: "hsl(43,65%,55%)", color: "hsl(213,52%,24%)", textAlign: "center", padding: 10, fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>
                    FEE PAYMENT RECEIPT
                  </div>
                  <div style={{ padding: "24px 32px" }}>
                    {[
                      ["Receipt No.", receipt.receipt_number],
                      ["Student Name", receipt.student_name],
                      ["Father's Name", receipt.father_name || "—"],
                      ["Class", receipt.student_class],
                      ["Roll Number", receipt.roll_number || "—"],
                      ["Fee Category", receipt.fee_category],
                      ["Payment Mode", receipt.payment_mode.charAt(0).toUpperCase() + receipt.payment_mode.slice(1)],
                      ["Payment Date", new Date(receipt.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })],
                      ["Academic Year", receipt.academic_year],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e0e0e0" }}>
                        <span style={{ fontWeight: 600, color: "#64748b", fontSize: 13 }}>{label}</span>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#f0f7ff", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "#64748b", fontSize: 14 }}>Amount Paid</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "hsl(213,52%,24%)" }}>₹{receipt.amount.toLocaleString("en-IN")}</span>
                  </div>
                  {receipt.remarks && (
                    <div style={{ padding: "12px 32px", fontSize: 13, color: "#64748b" }}>
                      <strong>Remarks:</strong> {receipt.remarks}
                    </div>
                  )}
                  <div style={{ padding: "20px 32px", textAlign: "right" }}>
                    <div style={{ marginTop: 40 }}>
                      <div style={{ borderTop: "1px solid hsl(213,52%,24%)", width: 180, display: "inline-block", marginBottom: 4 }} />
                      <p style={{ fontSize: 12, color: "#94a3b8" }}>Authorized Signature</p>
                    </div>
                  </div>
                  <div style={{ padding: "12px 32px", borderTop: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
                    <span>Generated on {new Date().toLocaleDateString("en-IN")}</span>
                    <span>Master International School, Padamapur</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default FeePayment;
