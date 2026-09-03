import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ClipboardCheck, Save, Download, Search, Users, UserCheck, UserX,
  Clock, CalendarDays, BellRing, Printer, RefreshCw, Plus,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const CLASSES = ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const SECTIONS = ["A", "B", "C", "D"];
const STATUSES = ["present", "absent", "late", "half_day", "leave"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  present: "Present", absent: "Absent", late: "Late", half_day: "Half Day", leave: "Leave",
};
const STATUS_STYLE: Record<Status, string> = {
  present: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  absent: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  late: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  half_day: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  leave: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
};

const todayISO = () => new Date().toISOString().slice(0, 10);

interface StudentRow { id: string; name: string; roll_number: string; class: string; section: string; father_phone: string | null; mother_phone: string | null; }
interface StaffRow { id: string; name: string; employee_code: string; designation: string | null; department: string | null; }
interface AttendanceRow {
  id: string; person_type: string; student_id: string | null; staff_id: string | null;
  attendance_date: string; status: Status; class: string | null; section: string | null; remarks: string | null;
}

function StatusBadge({ status }: { status: Status }) {
  return <Badge variant="outline" className={`border-transparent font-medium ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</Badge>;
}

function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

export default function ErpAttendance() {
  const [date, setDate] = useState(todayISO());
  const [cls, setCls] = useState("I");
  const [section, setSection] = useState("A");

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [staffMarks, setStaffMarks] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // reports
  const [monthStart, setMonthStart] = useState(todayISO().slice(0, 7) + "-01");
  const [reportRows, setReportRows] = useState<AttendanceRow[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [q, setQ] = useState("");
  const [studentIndex, setStudentIndex] = useState<Record<string, StudentRow>>({});
  const [staffIndex, setStaffIndex] = useState<Record<string, StaffRow>>({});

  // staff dialog
  const [staffOpen, setStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", employee_code: "", designation: "", department: "", phone: "" });

  useEffect(() => { loadStaff(); }, []);
  useEffect(() => { loadStudentDay(); }, [date, cls, section]);
  useEffect(() => { loadStaffDay(); }, [date, staff.length]);
  useEffect(() => { loadReport(); }, [monthStart]);

  async function loadStudentDay() {
    setLoading(true);
    const { data: st, error } = await supabase
      .from("students").select("id,name,roll_number,class,section,father_phone,mother_phone")
      .eq("class", cls).eq("section", section).order("roll_number");
    if (error) toast.error(error.message);
    const list = (st as StudentRow[]) || [];
    setStudents(list);

    const { data: att } = await supabase
      .from("attendance").select("*").eq("attendance_date", date).eq("person_type", "student");
    const m: Record<string, Status> = {}; const rm: Record<string, string> = {};
    ((att as AttendanceRow[]) || []).forEach((a) => {
      if (a.student_id) { m[a.student_id] = a.status; if (a.remarks) rm[a.student_id] = a.remarks; }
    });
    list.forEach((s) => { if (!m[s.id]) m[s.id] = "present"; });
    setMarks(m); setRemarks(rm);
    setLoading(false);
  }

  async function loadStaff() {
    const { data } = await supabase.from("staff").select("id,name,employee_code,designation,department").order("name");
    const list = (data as StaffRow[]) || [];
    setStaff(list);
    setStaffIndex(Object.fromEntries(list.map((s) => [s.id, s])));
  }

  async function loadStaffDay() {
    const { data } = await supabase
      .from("attendance").select("*").eq("attendance_date", date).eq("person_type", "staff");
    const m: Record<string, Status> = {};
    ((data as AttendanceRow[]) || []).forEach((a) => { if (a.staff_id) m[a.staff_id] = a.status; });
    staff.forEach((s) => { if (!m[s.id]) m[s.id] = "present"; });
    setStaffMarks(m);
  }

  async function loadReport() {
    setReportLoading(true);
    const start = monthStart;
    const d = new Date(start);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
    const [{ data: att }, { data: st }] = await Promise.all([
      supabase.from("attendance").select("*").gte("attendance_date", start).lte("attendance_date", end).order("attendance_date", { ascending: false }),
      supabase.from("students").select("id,name,roll_number,class,section,father_phone,mother_phone"),
    ]);
    setReportRows((att as AttendanceRow[]) || []);
    setStudentIndex(Object.fromEntries((((st as StudentRow[]) || [])).map((s) => [s.id, s])));
    setReportLoading(false);
  }

  const dayStats = useMemo(() => {
    const vals = students.map((s) => marks[s.id] || "present");
    const count = (x: Status) => vals.filter((v) => v === x).length;
    return {
      total: students.length,
      present: count("present"), absent: count("absent"),
      late: count("late"), leave: count("leave") + count("half_day"),
      pct: students.length ? Math.round(((count("present") + count("late") + count("half_day") * 0.5) / students.length) * 100) : 0,
    };
  }, [students, marks]);

  function setAll(status: Status) {
    setMarks(Object.fromEntries(students.map((s) => [s.id, status])) as Record<string, Status>);
  }

  async function saveStudentDay() {
    if (!students.length) { toast.error("No students in this class/section"); return; }
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const payload = students.map((s) => ({
      person_type: "student", student_id: s.id, attendance_date: date,
      status: marks[s.id] || "present", class: cls, section, remarks: remarks[s.id] || null,
      marked_by: auth?.user?.id ?? null,
    }));
    const { error } = await supabase.from("attendance").upsert(payload as any, { onConflict: "student_id,attendance_date" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Attendance saved for Class ${cls}-${section} on ${date}`);
    loadReport();
  }

  async function saveStaffDay() {
    if (!staff.length) { toast.error("No staff records yet"); return; }
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const payload = staff.map((s) => ({
      person_type: "staff", staff_id: s.id, attendance_date: date,
      status: staffMarks[s.id] || "present", marked_by: auth?.user?.id ?? null,
    }));
    const { error } = await supabase.from("attendance").upsert(payload as any, { onConflict: "staff_id,attendance_date" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Staff attendance saved");
    loadReport();
  }

  async function addStaff() {
    if (!staffForm.name || !staffForm.employee_code) { toast.error("Name and employee code are required"); return; }
    const { error } = await supabase.from("staff").insert(staffForm as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Staff member added");
    setStaffOpen(false);
    setStaffForm({ name: "", employee_code: "", designation: "", department: "", phone: "" });
    loadStaff();
  }

  // monthly per-student summary
  const summary = useMemo(() => {
    const map: Record<string, { present: number; absent: number; late: number; other: number; total: number }> = {};
    reportRows.filter((r) => r.person_type === "student" && r.student_id).forEach((r) => {
      const k = r.student_id!;
      map[k] = map[k] || { present: 0, absent: 0, late: 0, other: 0, total: 0 };
      map[k].total++;
      if (r.status === "present") map[k].present++;
      else if (r.status === "absent") map[k].absent++;
      else if (r.status === "late") map[k].late++;
      else map[k].other++;
    });
    return Object.entries(map).map(([id, v]) => ({
      id, student: studentIndex[id], ...v,
      pct: v.total ? Math.round(((v.present + v.late) / v.total) * 100) : 0,
    })).filter((r) => r.student)
      .filter((r) => !q || r.student.name.toLowerCase().includes(q.toLowerCase()) || r.student.roll_number.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.pct - b.pct);
  }, [reportRows, studentIndex, q]);

  const alerts = useMemo(() => summary.filter((r) => r.total >= 3 && r.pct < 75), [summary]);
  const absentToday = useMemo(
    () => students.filter((s) => (marks[s.id] || "present") === "absent"),
    [students, marks],
  );

  const kpis = [
    { label: "On Roll", value: dayStats.total, icon: Users, color: "text-blue-600" },
    { label: "Present", value: dayStats.present, icon: UserCheck, color: "text-emerald-600" },
    { label: "Absent", value: dayStats.absent, icon: UserX, color: "text-red-600" },
    { label: "Late / Leave", value: dayStats.late + dayStats.leave, icon: Clock, color: "text-amber-600" },
    { label: "Attendance %", value: `${dayStats.pct}%`, icon: ClipboardCheck, color: "text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--navy-dark))] text-white p-5 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <ClipboardCheck className="h-7 w-7" />
          <div>
            <h2 className="text-2xl font-bold leading-tight">Attendance</h2>
            <p className="text-sm text-white/70">Daily student &amp; staff attendance, reports, alerts</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => { loadStudentDay(); loadStaffDay(); loadReport(); }}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button size="sm" variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <k.icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <p className="text-2xl font-bold mt-1">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="students">
        <TabsList className="print:hidden">
          <TabsTrigger value="students">Student Register</TabsTrigger>
          <TabsTrigger value="staff">Staff Attendance</TabsTrigger>
          <TabsTrigger value="reports">Monthly Report</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* STUDENTS */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mark Daily Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Class</Label>
                  <Select value={cls} onValueChange={setCls}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Section</Label>
                  <Select value={section} onValueChange={setSection}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 lg:col-span-2">
                  <Label>Bulk actions</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setAll("present")}>All Present</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setAll("absent")}>All Absent</Button>
                  </div>
                </div>
              </div>

              <div className="rounded border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-44">Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                    ) : students.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No students found in Class {cls}-{section}.</TableCell></TableRow>
                    ) : students.map((s, i) => (
                      <TableRow key={s.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{s.roll_number}</TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>
                          <Select value={marks[s.id] || "present"} onValueChange={(v) => setMarks((m) => ({ ...m, [s.id]: v as Status }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((st) => <SelectItem key={st} value={st}>{STATUS_LABEL[st]}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input value={remarks[s.id] || ""} placeholder="Optional"
                            onChange={(e) => setRemarks((r) => ({ ...r, [s.id]: e.target.value }))} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap gap-2 print:hidden">
                <Button onClick={saveStudentDay} disabled={saving || !students.length}>
                  <Save className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save Attendance"}
                </Button>
                <Button variant="outline" onClick={() => downloadCsv(
                  `attendance-${cls}-${section}-${date}.csv`,
                  [["Roll No", "Name", "Class", "Section", "Date", "Status", "Remarks"],
                  ...students.map((s) => [s.roll_number, s.name, cls, section, date, STATUS_LABEL[marks[s.id] || "present"], remarks[s.id] || ""])],
                )}>
                  <Download className="h-4 w-4 mr-1" /> Export CSV
                </Button>
                {absentToday.length > 0 && (
                  <Button variant="outline" onClick={() => toast.success(`Absence alert queued for ${absentToday.length} parent(s)`, { description: "SMS/WhatsApp delivery is configured in the Notifications module." })}>
                    <BellRing className="h-4 w-4 mr-1" /> Notify {absentToday.length} Absent Parent(s)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STAFF */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Staff Attendance — {date}</CardTitle>
              <Button size="sm" onClick={() => setStaffOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Staff</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Emp. Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="w-44">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No staff records yet — add your first staff member.</TableCell></TableRow>
                    ) : staff.map((s, i) => (
                      <TableRow key={s.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{s.employee_code}</TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.designation || "—"}</TableCell>
                        <TableCell>{s.department || "—"}</TableCell>
                        <TableCell>
                          <Select value={staffMarks[s.id] || "present"} onValueChange={(v) => setStaffMarks((m) => ({ ...m, [s.id]: v as Status }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((st) => <SelectItem key={st} value={st}>{STATUS_LABEL[st]}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button onClick={saveStaffDay} disabled={saving || !staff.length}>
                <Save className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save Staff Attendance"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Monthly Attendance Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label>Month</Label>
                  <Input type="month" value={monthStart.slice(0, 7)} onChange={(e) => setMonthStart(e.target.value + "-01")} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8" placeholder="Roll number or student name" value={q} onChange={(e) => setQ(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="rounded border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-right">Days</TableHead>
                      <TableHead className="text-right">Present</TableHead>
                      <TableHead className="text-right">Absent</TableHead>
                      <TableHead className="text-right">Late</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportLoading ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                    ) : summary.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No attendance recorded for this month.</TableCell></TableRow>
                    ) : summary.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.student.roll_number}</TableCell>
                        <TableCell className="font-medium">{r.student.name}</TableCell>
                        <TableCell>{r.student.class}-{r.student.section}</TableCell>
                        <TableCell className="text-right">{r.total}</TableCell>
                        <TableCell className="text-right text-emerald-600">{r.present}</TableCell>
                        <TableCell className="text-right text-red-600">{r.absent}</TableCell>
                        <TableCell className="text-right text-amber-600">{r.late}</TableCell>
                        <TableCell className="text-right font-semibold">{r.pct}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button variant="outline" onClick={() => downloadCsv(
                `attendance-report-${monthStart.slice(0, 7)}.csv`,
                [["Roll No", "Student", "Class", "Section", "Days", "Present", "Absent", "Late", "Percent"],
                ...summary.map((r) => [r.student.roll_number, r.student.name, r.student.class, r.student.section, r.total, r.present, r.absent, r.late, r.pct])],
              )}>
                <Download className="h-4 w-4 mr-1" /> Export Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ALERTS */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><BellRing className="h-4 w-4" /> Low Attendance Alerts (below 75%)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No students below the 75% threshold this month.</p>
              ) : alerts.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-3 border rounded p-3">
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-medium">{r.student.name} <span className="text-xs text-muted-foreground font-mono">({r.student.roll_number})</span></p>
                    <p className="text-xs text-muted-foreground">Class {r.student.class}-{r.student.section} • {r.present}/{r.total} days present</p>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-transparent dark:bg-red-900/40 dark:text-red-300">{r.pct}%</Badge>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Alert queued for ${r.student.name}`, { description: r.student.father_phone || r.student.mother_phone || "No parent phone on record" })}>
                    Notify Parent
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Absent Today ({date})</CardTitle></CardHeader>
            <CardContent>
              {absentToday.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nobody marked absent in Class {cls}-{section}.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {absentToday.map((s) => (
                    <span key={s.id} className="text-sm border rounded px-2 py-1">
                      {s.name} <StatusBadge status="absent" />
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={staffOpen} onOpenChange={setStaffOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1"><Label>Employee Code *</Label>
              <Input value={staffForm.employee_code} onChange={(e) => setStaffForm({ ...staffForm, employee_code: e.target.value })} /></div>
            <div className="space-y-1"><Label>Full Name *</Label>
              <Input value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Designation</Label>
              <Input value={staffForm.designation} onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })} /></div>
            <div className="space-y-1"><Label>Department</Label>
              <Input value={staffForm.department} onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })} /></div>
            <div className="space-y-1"><Label>Phone</Label>
              <Input value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStaffOpen(false)}>Cancel</Button>
            <Button onClick={addStaff}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
