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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, CheckCircle2, Clock, XCircle, Plus, Search, Eye, ShieldCheck,
  CheckCheck, Upload, FileSearch, CreditCard, UserPlus, GraduationCap,
  TrendingUp, TrendingDown, Inbox, Activity, Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Admission = {
  id: string;
  student_name: string;
  date_of_birth: string;
  gender?: string | null;
  class_applying: string;
  father_name: string;
  mother_name: string;
  parent_phone: string;
  parent_email: string;
  address: string;
  status: string;
  created_at: string;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300" },
  under_review: { label: "Under Review", cls: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300" },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300" },
  rejected: { label: "Rejected", cls: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300" },
};

const WORKFLOW = [
  { key: "submitted", label: "Application Submitted", icon: FileText },
  { key: "documents", label: "Document Verification", icon: FileSearch },
  { key: "interview", label: "Interview / Assessment", icon: ShieldCheck },
  { key: "payment", label: "Fee Payment", icon: CreditCard },
  { key: "confirmed", label: "Admission Confirmed", icon: CheckCheck },
];

const CLASSES = [
  "Pre-Nursery", "Nursery", "LKG", "UKG",
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII",
];

function shortId(id: string) {
  return "APP-" + id.slice(0, 8).toUpperCase();
}

export default function ErpAdmissions() {
  const [rows, setRows] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Admission | null>(null);
  const [openNew, setOpenNew] = useState(false);
  const pageSize = 8;

  const [form, setForm] = useState({
    student_name: "", date_of_birth: "", gender: "", class_applying: "",
    father_name: "", mother_name: "", parent_phone: "", parent_email: "", address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load admissions");
    else setRows((data as Admission[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const approved = rows.filter(r => r.status === "approved").length;
    const pending = rows.filter(r => r.status === "pending" || r.status === "under_review").length;
    const rejected = rows.filter(r => r.status === "rejected").length;
    return { total, approved, pending, rejected };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.student_name?.toLowerCase().includes(q) ||
        r.father_name?.toLowerCase().includes(q) ||
        r.mother_name?.toLowerCase().includes(q) ||
        r.class_applying?.toLowerCase().includes(q) ||
        shortId(r.id).toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("admissions").update({ status }).eq("id", id);
    if (error) return toast.error("Failed to update");
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Marked as ${STATUS_META[status]?.label ?? status}`);
  };

  const submitQuick = async () => {
    if (!form.student_name || !form.date_of_birth || !form.class_applying || !form.parent_phone) {
      return toast.error("Please fill required fields");
    }
    setSubmitting(true);
    const { error } = await supabase.from("admissions").insert({
      ...form,
      gender: form.gender || "other",
      parent_email: form.parent_email || `unknown-${Date.now()}@example.com`,
      father_name: form.father_name || "—",
      mother_name: form.mother_name || "—",
      address: form.address || "—",
      status: "pending",
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Quick admission created");
    setOpenNew(false);
    setForm({
      student_name: "", date_of_birth: "", gender: "", class_applying: "",
      father_name: "", mother_name: "", parent_phone: "", parent_email: "", address: "",
    });
    fetchAll();
  };

  const recent = rows.slice(0, 6);

  return (
    <div className="space-y-6">
      <Helmet><title>Admissions — School ERP</title></Helmet>

      {/* Header */}
      <div className="rounded-xl border bg-gradient-to-br from-[hsl(var(--navy))] via-[hsl(var(--navy))] to-blue-700 text-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/70">
              <GraduationCap className="h-4 w-4" /> ERP Module
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">Admissions</h1>
            <p className="text-white/80 text-sm md:text-base mt-1">
              Multi-step applications &amp; quick admissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/admin/admissions"><Eye className="h-4 w-4 mr-1" /> Online Applications</Link>
            </Button>
            <Button onClick={() => setOpenNew(true)} className="bg-white text-[hsl(var(--navy))] hover:bg-white/90">
              <Plus className="h-4 w-4 mr-1" /> New Admission
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications" value={stats.total} icon={Inbox}
          accent="border-l-blue-500" trend={{ up: true, value: "+12%" }} />
        <StatCard
          title="Approved Admissions" value={stats.approved} icon={CheckCircle2}
          accent="border-l-emerald-500" trend={{ up: true, value: "+8%" }} />
        <StatCard
          title="Pending Review" value={stats.pending} icon={Clock}
          accent="border-l-amber-500" trend={{ up: false, value: "-3%" }} />
        <StatCard
          title="Rejected" value={stats.rejected} icon={XCircle}
          accent="border-l-rose-500" trend={{ up: false, value: "-1%" }} />
      </div>

      {/* Workflow */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-lg">Admission Workflow</h2>
            <p className="text-sm text-muted-foreground">Standard 5-stage admission journey</p>
          </div>
          <Badge variant="outline" className="hidden md:inline-flex">CBSE • 2026-27</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-0 relative">
          {WORKFLOW.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex md:flex-col items-center gap-3 md:gap-2 relative">
                <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-md ring-4 ring-background">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="md:text-center">
                  <p className="text-xs font-semibold text-muted-foreground">Step {i + 1}</p>
                  <p className="text-sm font-medium">{s.label}</p>
                </div>
                {i < WORKFLOW.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-0.5 bg-gradient-to-r from-blue-500 to-blue-200 dark:to-blue-900" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Table */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <h3 className="font-semibold">Applications</h3>
              <p className="text-xs text-muted-foreground">{filtered.length} record(s)</p>
            </div>
            <div className="sm:ml-auto flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search name, ID, class…"
                  className="pl-8 h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>App ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden md:table-cell">Parent</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12">
                      <div className="text-center">
                        <Inbox className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="font-medium">No admissions found</p>
                        <p className="text-sm text-muted-foreground mb-4">Get started by creating a new admission</p>
                        <Button onClick={() => setOpenNew(true)}><Plus className="h-4 w-4 mr-1" /> Create New Admission</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : pageRows.map((r) => {
                  const meta = STATUS_META[r.status] ?? { label: r.status, cls: "bg-muted" };
                  return (
                    <TableRow key={r.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">{shortId(r.id)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{r.student_name}</div>
                        <div className="text-xs text-muted-foreground">{r.parent_phone}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">{r.father_name}</div>
                        <div className="text-xs text-muted-foreground">{r.mother_name}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{r.class_applying}</Badge></TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell><span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", meta.cls)}>{meta.label}</span></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(r)} title="View"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus(r.id, "under_review")} title="Verify"><FileSearch className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => updateStatus(r.id, "approved")} title="Approve"><CheckCircle2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filtered.length > pageSize && (
            <div className="p-3 border-t flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </Card>

        {/* Right column: Quick admission + Activities */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold">Quick Admission</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Capture essentials, complete details later</p>
            <QuickForm form={form} setForm={setForm} onSubmit={submitQuick} submitting={submitting} />
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <ol className="relative border-l border-border ml-2 space-y-4">
                {recent.map((r) => (
                  <li key={r.id} className="ml-4">
                    <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-background" />
                    <p className="text-sm">
                      <span className="font-medium">{r.student_name}</span>{" "}
                      <span className="text-muted-foreground">applied for {r.class_applying}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-GB")}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
        <span>School ERP • v1.0.0</span>
        <span>Support: erp@mispadamapur.in</span>
        <span>© {new Date().getFullYear()} Master International School</span>
      </div>

      {/* Details dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application {selected && shortId(selected.id)}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Field label="Student" value={selected.student_name} />
              <Field label="DOB" value={selected.date_of_birth} />
              <Field label="Gender" value={selected.gender || "—"} />
              <Field label="Class" value={selected.class_applying} />
              <Field label="Father" value={selected.father_name} />
              <Field label="Mother" value={selected.mother_name} />
              <Field label="Phone" value={selected.parent_phone} />
              <Field label="Email" value={selected.parent_email} />
              <Field label="Address" value={selected.address} className="sm:col-span-2" />
              <Field label="Status" value={STATUS_META[selected.status]?.label ?? selected.status} />
              <Field label="Submitted" value={new Date(selected.created_at).toLocaleString("en-GB")} />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => selected && updateStatus(selected.id, "rejected")}>
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button onClick={() => selected && updateStatus(selected.id, "approved")}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick admission dialog (also via right card; this is for header CTA) */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> New Admission</DialogTitle>
          </DialogHeader>
          <QuickForm form={form} setForm={setForm} onSubmit={submitQuick} submitting={submitting} expanded />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  title, value, icon: Icon, accent, trend,
}: { title: string; value: number; icon: any; accent: string; trend?: { up: boolean; value: string } }) {
  return (
    <Card className={cn("p-4 border-l-4 hover:shadow-md transition-shadow", accent)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
          {trend && (
            <div className={cn("flex items-center gap-1 text-xs mt-1", trend.up ? "text-emerald-600" : "text-rose-600")}>
              {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{trend.value} vs last month</span>
            </div>
          )}
        </div>
        <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("rounded-md border p-3 bg-muted/30", className)}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  );
}

function QuickForm({
  form, setForm, onSubmit, submitting, expanded,
}: { form: any; setForm: (v: any) => void; onSubmit: () => void; submitting: boolean; expanded?: boolean }) {
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Student Name *</Label>
        <Input value={form.student_name} onChange={e => set("student_name", e.target.value)} className="h-9 mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">DOB *</Label>
          <Input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} className="h-9 mt-1" />
        </div>
        <div>
          <Label className="text-xs">Gender</Label>
          <Select value={form.gender} onValueChange={v => set("gender", v)}>
            <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Class *</Label>
          <Select value={form.class_applying} onValueChange={v => set("class_applying", v)}>
            <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Parent Mobile *</Label>
          <Input value={form.parent_phone} onChange={e => set("parent_phone", e.target.value)} className="h-9 mt-1" />
        </div>
      </div>
      {expanded && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Father's Name</Label>
              <Input value={form.father_name} onChange={e => set("father_name", e.target.value)} className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs">Mother's Name</Label>
              <Input value={form.mother_name} onChange={e => set("mother_name", e.target.value)} className="h-9 mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Parent Email</Label>
            <Input type="email" value={form.parent_email} onChange={e => set("parent_email", e.target.value)} className="h-9 mt-1" />
          </div>
          <div>
            <Label className="text-xs">Address</Label>
            <Input value={form.address} onChange={e => set("address", e.target.value)} className="h-9 mt-1" />
          </div>
        </>
      )}
      <button
        type="button"
        className="w-full text-xs text-muted-foreground border border-dashed rounded-md py-2 flex items-center justify-center gap-2 hover:bg-muted/50"
        onClick={() => toast.info("Document upload will be enabled in next phase")}
      >
        <Upload className="h-3.5 w-3.5" /> Upload Documents (placeholder)
      </button>
      <Button onClick={onSubmit} disabled={submitting} className="w-full">
        {submitting ? "Submitting…" : (<><Edit3 className="h-4 w-4 mr-1" /> Submit Admission</>)}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        Aadhaar verification &amp; payment integration coming soon
      </p>
    </div>
  );
}
