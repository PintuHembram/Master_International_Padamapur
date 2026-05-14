import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Download, FileText } from "lucide-react";

const CLASSES = ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const EXAM_TYPES = ["Unit Test", "Mid-Term", "Annual", "Semester 1", "Semester 2", "Pre-Board", "Board"];
const SECTIONS = ["A", "B", "C", "D"];

interface Subject { subject: string; maxMarks: number; obtained: number; grade: string; }
interface ResultRow {
  id: string;
  roll_number: string;
  student_name: string;
  class: string;
  section: string;
  exam_type: string;
  academic_year: string;
  rank: number | null;
  date_of_birth: string | null;
  subjects: Subject[];
}

const emptyForm: Omit<ResultRow, "id"> = {
  roll_number: "", student_name: "", class: "I", section: "A",
  exam_type: "Annual", academic_year: "2025-26", rank: null, date_of_birth: null,
  subjects: [{ subject: "English", maxMarks: 100, obtained: 0, grade: "F" }],
};

function gradeFor(pct: number) {
  if (pct >= 90) return "A+"; if (pct >= 80) return "A"; if (pct >= 70) return "B+";
  if (pct >= 60) return "B"; if (pct >= 50) return "C"; if (pct >= 40) return "D"; return "F";
}

export default function ExamsResults() {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterExam, setFilterExam] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ResultRow | null>(null);
  const [form, setForm] = useState<Omit<ResultRow, "id">>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRows(); }, []);

  async function fetchRows() {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_results").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(((data as any[]) || []).map((r) => ({ ...r, subjects: r.subjects || [] })));
    setLoading(false);
  }

  const filtered = useMemo(() => rows.filter((r) => {
    const m = !q || r.roll_number.toLowerCase().includes(q.toLowerCase()) || r.student_name.toLowerCase().includes(q.toLowerCase());
    const c = filterClass === "all" || r.class === filterClass;
    const e = filterExam === "all" || r.exam_type === filterExam;
    return m && c && e;
  }), [rows, q, filterClass, filterExam]);

  function openNew() { setEditing(null); setForm(emptyForm); setOpen(true); }
  function openEdit(r: ResultRow) {
    setEditing(r);
    setForm({
      roll_number: r.roll_number, student_name: r.student_name, class: r.class, section: r.section,
      exam_type: r.exam_type, academic_year: r.academic_year, rank: r.rank, date_of_birth: r.date_of_birth,
      subjects: r.subjects.length ? r.subjects : emptyForm.subjects,
    });
    setOpen(true);
  }

  function updateSubject(i: number, field: keyof Subject, value: any) {
    const subs = [...form.subjects];
    (subs[i] as any)[field] = field === "maxMarks" || field === "obtained" ? Number(value) : value;
    if (field === "obtained" || field === "maxMarks") {
      const pct = subs[i].maxMarks > 0 ? (subs[i].obtained / subs[i].maxMarks) * 100 : 0;
      subs[i].grade = gradeFor(pct);
    }
    setForm({ ...form, subjects: subs });
  }
  function addSubject() {
    setForm({ ...form, subjects: [...form.subjects, { subject: "", maxMarks: 100, obtained: 0, grade: "F" }] });
  }
  function removeSubject(i: number) {
    setForm({ ...form, subjects: form.subjects.filter((_, idx) => idx !== i) });
  }

  async function save() {
    if (!form.roll_number.trim() || !form.student_name.trim() || !form.class) {
      toast.error("Roll number, student name, and class are required."); return;
    }
    setSaving(true);
    const payload = { ...form, subjects: form.subjects as any, date_of_birth: form.date_of_birth || null, rank: form.rank ?? null };
    const { error } = editing
      ? await supabase.from("student_results").update(payload).eq("id", editing.id)
      : await supabase.from("student_results").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Result updated" : "Result published");
    setOpen(false); fetchRows();
  }

  async function del(id: string) {
    if (!confirm("Delete this result? This cannot be undone.")) return;
    const { error } = await supabase.from("student_results").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted"); fetchRows();
  }

  function exportCsv() {
    const header = ["Roll No", "Name", "Class", "Section", "Exam", "Year", "Total", "Obtained", "Percentage", "Grade", "Rank"];
    const lines = [header.join(",")];
    for (const r of filtered) {
      const total = r.subjects.reduce((s, x) => s + x.maxMarks, 0);
      const got = r.subjects.reduce((s, x) => s + x.obtained, 0);
      const pct = total ? ((got / total) * 100).toFixed(1) : "0";
      lines.push([r.roll_number, `"${r.student_name}"`, r.class, r.section, r.exam_type, r.academic_year, total, got, pct, gradeFor(Number(pct)), r.rank ?? ""].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `results-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" /> Exams & Results</h2>
          <p className="text-sm text-muted-foreground">Publish, edit and manage student examination results.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Publish Result</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by roll number or name..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {CLASSES.map((c) => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterExam} onValueChange={setFilterExam}>
              <SelectTrigger><SelectValue placeholder="Exam Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {EXAM_TYPES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-center">%</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Rank</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No results found</TableCell></TableRow>
              ) : filtered.map((r) => {
                const total = r.subjects.reduce((s, x) => s + x.maxMarks, 0);
                const got = r.subjects.reduce((s, x) => s + x.obtained, 0);
                const pct = total ? ((got / total) * 100).toFixed(1) : "0";
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.roll_number}</TableCell>
                    <TableCell>{r.student_name}</TableCell>
                    <TableCell>{r.class}-{r.section}</TableCell>
                    <TableCell>{r.exam_type}</TableCell>
                    <TableCell>{r.academic_year}</TableCell>
                    <TableCell className="text-center">{pct}%</TableCell>
                    <TableCell className="text-center font-semibold">{gradeFor(Number(pct))}</TableCell>
                    <TableCell className="text-center">{r.rank ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Result" : "Publish New Result"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Roll Number *</Label><Input value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} /></div>
            <div><Label>Student Name *</Label><Input value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} /></div>
            <div>
              <Label>Class *</Label>
              <Select value={form.class} onValueChange={(v) => setForm({ ...form, class: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Exam Type</Label>
              <Select value={form.exam_type} onValueChange={(v) => setForm({ ...form, exam_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXAM_TYPES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Academic Year</Label><Input value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} /></div>
            <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth || ""} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value || null })} /></div>
            <div><Label>Class Rank</Label><Input type="number" value={form.rank ?? ""} onChange={(e) => setForm({ ...form, rank: e.target.value ? Number(e.target.value) : null })} /></div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base">Subjects</Label>
              <Button size="sm" variant="outline" onClick={addSubject}><Plus className="h-3 w-3 mr-1" /> Add Subject</Button>
            </div>
            <div className="space-y-2">
              {form.subjects.map((s, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4"><Label className="text-xs">Subject</Label><Input value={s.subject} onChange={(e) => updateSubject(i, "subject", e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Max</Label><Input type="number" value={s.maxMarks} onChange={(e) => updateSubject(i, "maxMarks", e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Obtained</Label><Input type="number" value={s.obtained} onChange={(e) => updateSubject(i, "obtained", e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Grade</Label><Input value={s.grade} readOnly className="bg-muted" /></div>
                  <div className="col-span-2"><Button variant="ghost" size="icon" onClick={() => removeSubject(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Publish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
