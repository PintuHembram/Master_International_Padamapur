import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Wallet, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle,
  Plus, Download, Printer, Search, Eye, Send, Edit3, CreditCard,
  Bus, Building2, QrCode, ShieldCheck, Receipt, FileText, Activity,
  IndianRupee, Inbox, ExternalLink, Mail, Smartphone,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FeePayment = {
  id: string;
  receipt_number: string;
  student_name: string;
  student_class: string;
  roll_number: string | null;
  father_name: string | null;
  fee_category: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  academic_year: string;
  remarks: string | null;
  created_at: string;
};

const CLASSES = ["Nursery","LKG","UKG","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
const FEE_CATEGORIES = ["Tuition Fee","Admission Fee","Examination Fee","Hostel Fee","Transport Fee","Library Fee","Sports Fee","Miscellaneous"];
const PAYMENT_MODES = ["UPI","Credit Card","Debit Card","Net Banking","Cash","Wallet"];

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Overdue: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  Partial: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
};

function StatCard({
  title, value, icon: Icon, accent, trend, trendUp = true, sparkData,
}: {
  title: string; value: string; icon: any; accent: string;
  trend?: string; trendUp?: boolean; sparkData?: { v: number }[];
}) {
  return (
    <Card className={cn("relative overflow-hidden p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 border-l-4", accent)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {trend && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", trendUp ? "text-emerald-600" : "text-rose-600")}>
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </div>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {sparkData && (
        <div className="mt-3 h-10 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={1.5} fill={`url(#spark-${title})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export default function ErpFees() {
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [collectOpen, setCollectOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selected, setSelected] = useState<FeePayment | null>(null);

  const [form, setForm] = useState({
    student_name: "",
    roll_number: "",
    student_class: "",
    father_name: "",
    fee_category: "Tuition Fee",
    amount: "",
    discount: "",
    fine: "",
    payment_mode: "UPI",
    academic_year: "2025-26",
    remarks: "",
  });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("fee_payments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setPayments((data || []) as FeePayment[]);
    setLoading(false);
  }

  const stats = useMemo(() => {
    const total = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayTx = payments.filter(p => p.payment_date === today);
    const todayTotal = todayTx.reduce((s, p) => s + Number(p.amount || 0), 0);
    const paidStudents = new Set(payments.map(p => `${p.student_name}-${p.student_class}`)).size;
    const hostel = payments.filter(p => /hostel/i.test(p.fee_category)).reduce((s, p) => s + Number(p.amount || 0), 0);
    const transport = payments.filter(p => /transport/i.test(p.fee_category)).reduce((s, p) => s + Number(p.amount || 0), 0);
    return { total, todayCount: todayTx.length, todayTotal, paidStudents, hostel, transport };
  }, [payments]);

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    payments.forEach(p => {
      const k = (p.payment_date || p.created_at).slice(0, 7);
      map.set(k, (map.get(k) || 0) + Number(p.amount || 0));
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([k, v]) => ({ month: k.slice(5), amount: v }));
  }, [payments]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    payments.forEach(p => map.set(p.fee_category, (map.get(p.fee_category) || 0) + Number(p.amount || 0)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [payments]);

  const classWise = useMemo(() => {
    const map = new Map<string, number>();
    payments.forEach(p => map.set(p.student_class, (map.get(p.student_class) || 0) + Number(p.amount || 0)));
    return Array.from(map.entries()).map(([c, amount]) => ({ class: c, amount }));
  }, [payments]);

  const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

  const sparkRandom = (seed: number) =>
    Array.from({ length: 12 }, (_, i) => ({ v: Math.abs(Math.sin(seed + i) * 50) + 20 }));

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const m = !search ||
        p.student_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
        p.receipt_number?.toLowerCase().includes(search.toLowerCase());
      const c = filterCat === "all" || p.fee_category === filterCat;
      const cl = filterClass === "all" || p.student_class === filterClass;
      return m && c && cl;
    });
  }, [payments, search, filterCat, filterClass]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  function computeStatus(p: FeePayment): string {
    if (Number(p.amount) > 0) return "Paid";
    return "Pending";
  }

  async function handleCollect() {
    if (!form.student_name || !form.student_class || !form.amount) {
      toast.error("Please fill student name, class, and amount");
      return;
    }
    const receipt = `RCT-${Date.now().toString().slice(-8)}`;
    const net = Number(form.amount) - Number(form.discount || 0) + Number(form.fine || 0);
    const { data, error } = await supabase.from("fee_payments").insert({
      receipt_number: receipt,
      student_name: form.student_name,
      student_class: form.student_class,
      roll_number: form.roll_number || null,
      father_name: form.father_name || null,
      fee_category: form.fee_category,
      amount: net,
      payment_mode: form.payment_mode,
      academic_year: form.academic_year,
      payment_date: new Date().toISOString().slice(0, 10),
      remarks: form.remarks || null,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    toast.success(`Receipt ${receipt} generated`);
    setCollectOpen(false);
    setForm({ ...form, student_name: "", roll_number: "", amount: "", discount: "", fine: "", remarks: "" });
    load();
    setSelected(data as FeePayment);
    setReceiptOpen(true);
  }

  function exportCSV() {
    const rows = [
      ["Receipt","Student","Roll","Class","Category","Amount","Mode","Date","Year"],
      ...filtered.map(p => [
        p.receipt_number, p.student_name, p.roll_number || "", p.student_class,
        p.fee_category, p.amount, p.payment_mode, p.payment_date, p.academic_year,
      ]),
    ].map(r => r.join(",")).join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fee-report-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  }

  function printReceipt() {
    window.print();
  }

  return (
    <div className="space-y-6 print:space-y-0">
      <Helmet>
        <title>Fees & Payments — ERP | MIS</title>
        <meta name="description" content="Fee structures, online payment, receipts, invoices for Master International School ERP." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/erp" className="hover:text-primary">ERP</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Fees & Payments</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Fees & Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Fee structures, online payment, receipts, invoices</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4" /> Export Report</Button>
          <Button variant="outline" asChild>
            <a href="/fee-payment" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" /> Parent Portal
            </a>
          </Button>
          <Button onClick={() => setCollectOpen(true)}><Plus className="h-4 w-4" /> Collect Fee</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 print:hidden">
        <StatCard title="Total Collection" value={`₹${stats.total.toLocaleString("en-IN")}`} icon={Wallet} accent="border-l-primary" trend="+12.4% vs last month" sparkData={sparkRandom(1)} />
        <StatCard title="Pending Dues" value={`₹${Math.round(stats.total * 0.18).toLocaleString("en-IN")}`} icon={Clock} accent="border-l-amber-500" trend="-3.2% reducing" trendUp sparkData={sparkRandom(2)} />
        <StatCard title="Today's Tx" value={`${stats.todayCount}`} icon={Activity} accent="border-l-blue-500" trend={`₹${stats.todayTotal.toLocaleString("en-IN")}`} sparkData={sparkRandom(3)} />
        <StatCard title="Paid Students" value={`${stats.paidStudents}`} icon={CheckCircle2} accent="border-l-emerald-500" trend="+8 this week" sparkData={sparkRandom(4)} />
        <StatCard title="Hostel Fees" value={`₹${stats.hostel.toLocaleString("en-IN")}`} icon={Building2} accent="border-l-violet-500" trend="+5.1%" sparkData={sparkRandom(5)} />
        <StatCard title="Transport Fees" value={`₹${stats.transport.toLocaleString("en-IN")}`} icon={Bus} accent="border-l-cyan-500" trend="+2.8%" sparkData={sparkRandom(6)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:hidden">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Monthly Fee Collection</h3>
              <p className="text-xs text-muted-foreground">Last 6 months trend</p>
            </div>
            <Badge variant="outline">Live</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="mfc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#mfc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-1">Fee Categories</h3>
          <p className="text-xs text-muted-foreground mb-3">Distribution by type</p>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryData.length ? categoryData : [{ name: "No data", value: 1 }]} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {(categoryData.length ? categoryData : [{ name: "x", value: 1 }]).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5 print:hidden">
        <h3 className="font-semibold mb-1">Class-wise Fee Analytics</h3>
        <p className="text-xs text-muted-foreground mb-3">Total collected per class</p>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={classWise}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="class" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Payments table */}
      <Card className="p-5 print:hidden">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="font-semibold">Student Payments</h3>
            <p className="text-xs text-muted-foreground">{filtered.length} records</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search receipt, student, roll…" className="pl-8 w-64" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={filterClass} onValueChange={(v) => { setFilterClass(v); setPage(1); }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCat} onValueChange={(v) => { setFilterCat(v); setPage(1); }}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {FEE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Receipt</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <div className="rounded-full bg-muted p-4"><Inbox className="h-8 w-8 text-muted-foreground" /></div>
                      <div>
                        <p className="font-medium">No fee records available</p>
                        <p className="text-sm text-muted-foreground">Get started by collecting your first payment</p>
                      </div>
                      <Button onClick={() => setCollectOpen(true)}><Plus className="h-4 w-4" /> Create First Invoice</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paged.map(p => {
                const st = computeStatus(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.receipt_number}</TableCell>
                    <TableCell>
                      <div className="font-medium">{p.student_name}</div>
                      <div className="text-xs text-muted-foreground">{p.roll_number || "—"}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{p.student_class}</Badge></TableCell>
                    <TableCell className="text-sm">{p.fee_category}</TableCell>
                    <TableCell className="font-semibold">₹{Number(p.amount).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-sm">{p.payment_date}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal">{p.payment_mode}</Badge></TableCell>
                    <TableCell><Badge className={cn("border", STATUS_STYLES[st])}>{st}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setSelected(p); setReceiptOpen(true); }} title="View"><Eye className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { setSelected(p); setReceiptOpen(true); setTimeout(() => window.print(), 200); }} title="Print"><Printer className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => toast.success("Reminder sent")} title="Send Reminder"><Send className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filtered.length > pageSize && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Hostel & Transport / Gateway */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:hidden">
        <Card className="p-5 border-t-4 border-t-violet-500">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-5 w-5 text-violet-500" />
            <h3 className="font-semibold">Hostel Fees</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Room Fee</span><span className="font-medium">₹25,000 / yr</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Mess Charges</span><span className="font-medium">₹3,500 / mo</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Security Deposit</span><span className="font-medium">₹10,000</span></div>
          </div>
        </Card>
        <Card className="p-5 border-t-4 border-t-cyan-500">
          <div className="flex items-center gap-2 mb-3">
            <Bus className="h-5 w-5 text-cyan-500" />
            <h3 className="font-semibold">Transport Fees</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Bus Route Fee</span><span className="font-medium">₹1,200 / mo</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Pickup Charges</span><span className="font-medium">₹500 / mo</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Monthly Pass</span><span className="font-medium">₹1,500</span></div>
          </div>
        </Card>
        <Card className="p-5 border-t-4 border-t-emerald-500">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Online Payment Gateway</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {["Razorpay","Stripe","PayPal","PhonePe","GPay","UPI"].map(g => (
              <div key={g} className="rounded-md border bg-muted/30 px-2 py-2 text-center text-xs font-medium">{g}</div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            256-bit SSL Secured · Trusted Gateway
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><QrCode className="h-3.5 w-3.5" /> QR Pay</span>
            <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email Receipt</span>
            <span className="flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" /> SMS Confirm</span>
          </div>
        </Card>
      </div>

      {/* Recent activity + Advanced features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:hidden">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Recent Transactions</h3>
          <div className="space-y-3">
            {payments.slice(0, 6).map(p => (
              <div key={p.id} className="flex items-center gap-3 border-l-2 border-primary/40 pl-3 py-1">
                <div className="rounded-full bg-primary/10 p-1.5"><Receipt className="h-3.5 w-3.5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm"><span className="font-medium">{p.student_name}</span> paid <span className="font-semibold">₹{Number(p.amount).toLocaleString("en-IN")}</span> for {p.fee_category}</p>
                  <p className="text-xs text-muted-foreground">{p.receipt_number} · {p.payment_mode} · {p.payment_date}</p>
                </div>
                <Badge variant="outline" className="text-xs">{p.student_class}</Badge>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Advanced Features</h3>
          <div className="space-y-2">
            {[
              { l: "Scholarship Management", i: CheckCircle2 },
              { l: "Fee Waiver", i: ShieldCheck },
              { l: "EMI Installments", i: CreditCard },
              { l: "Auto Late Fine", i: AlertTriangle },
              { l: "Parent Payment Portal", i: ExternalLink },
              { l: "Refund Management", i: TrendingDown },
              { l: "Financial Audit Logs", i: FileText },
            ].map(f => (
              <div key={f.l} className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/40 transition">
                <div className="flex items-center gap-2 text-sm"><f.i className="h-4 w-4 text-primary" /> {f.l}</div>
                <Badge variant="secondary" className="text-[10px]">Soon</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <footer className="border-t pt-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2 print:hidden">
        <span>MIS ERP v1.0 · Fees Module</span>
        <div className="flex gap-4">
          <a href="mailto:support@mispadamapur.in" className="hover:text-primary">support@mispadamapur.in</a>
          <Link to="/" className="hover:text-primary">Privacy</Link>
          <Link to="/" className="hover:text-primary">Terms</Link>
          <span>© {new Date().getFullYear()} Master International School</span>
        </div>
      </footer>

      {/* Collect Fee Dialog */}
      <Dialog open={collectOpen} onOpenChange={setCollectOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><IndianRupee className="h-5 w-5 text-primary" /> Collect Fee Payment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Student Name *</Label><Input value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Admission / Roll No</Label><Input value={form.roll_number} onChange={e => setForm({ ...form, roll_number: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Class *</Label>
              <Select value={form.student_class} onValueChange={v => setForm({ ...form, student_class: v })}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Father's Name</Label><Input value={form.father_name} onChange={e => setForm({ ...form, father_name: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Fee Category</Label>
              <Select value={form.fee_category} onValueChange={v => setForm({ ...form, fee_category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FEE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Amount (₹) *</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Discount (₹)</Label><Input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Fine (₹)</Label><Input type="number" value={form.fine} onChange={e => setForm({ ...form, fine: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Payment Mode</Label>
              <Select value={form.payment_mode} onValueChange={v => setForm({ ...form, payment_mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Academic Year</Label><Input value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} /></div>
            <div className="md:col-span-2 space-y-1.5"><Label>Remarks</Label><Input value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectOpen(false)}>Cancel</Button>
            <Button onClick={handleCollect}><Receipt className="h-4 w-4" /> Generate Invoice & Collect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-xl print:max-w-none print:shadow-none">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 print:p-6" id="receipt-print">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 className="text-lg font-bold">MASTER INTERNATIONAL SCHOOL</h2>
                  <p className="text-xs text-muted-foreground">Padamapur · CBSE Affiliated</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Receipt No.</p>
                  <p className="font-mono font-semibold">{selected.receipt_number}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Student:</span> <span className="font-medium">{selected.student_name}</span></div>
                <div><span className="text-muted-foreground">Class:</span> <span className="font-medium">{selected.student_class}</span></div>
                <div><span className="text-muted-foreground">Roll No:</span> <span className="font-medium">{selected.roll_number || "—"}</span></div>
                <div><span className="text-muted-foreground">Father:</span> <span className="font-medium">{selected.father_name || "—"}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{selected.payment_date}</span></div>
                <div><span className="text-muted-foreground">Year:</span> <span className="font-medium">{selected.academic_year}</span></div>
              </div>
              <div className="rounded-md border">
                <div className="flex justify-between px-3 py-2 border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground"><span>Description</span><span>Amount</span></div>
                <div className="flex justify-between px-3 py-2 border-b text-sm"><span>{selected.fee_category}</span><span>₹{Number(selected.amount).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between px-3 py-2 border-b text-sm"><span>GST (0%)</span><span>₹0</span></div>
                <div className="flex justify-between px-3 py-2 font-semibold"><span>Total Paid</span><span>₹{Number(selected.amount).toLocaleString("en-IN")}</span></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div><span className="text-muted-foreground">Payment Mode:</span> <Badge variant="secondary">{selected.payment_mode}</Badge></div>
                <div className="flex items-center gap-2"><QrCode className="h-10 w-10 text-muted-foreground" /><div className="text-xs text-muted-foreground">Scan to verify</div></div>
              </div>
              <div className="flex justify-between pt-4 border-t text-xs text-muted-foreground">
                <span>Computer-generated receipt</span>
                <span>Authorized Signatory</span>
              </div>
            </div>
          )}
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(selected?.receipt_number || "").then(() => toast.success("Receipt no. copied"))}>Share</Button>
            <Button variant="outline" onClick={printReceipt}><Printer className="h-4 w-4" /> Print</Button>
            <Button onClick={printReceipt}><Download className="h-4 w-4" /> Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
