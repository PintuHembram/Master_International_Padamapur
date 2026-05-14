import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Download, UserPlus } from "lucide-react";

type Student = {
  id: string; name: string; roll_number: string; class: string; section: string;
  gender: string | null; father_name: string | null; phone: string | null; status: string;
  student_id: string | null;
};

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("students").select("id,name,roll_number,class,section,gender,father_name,phone,status,student_id").order("class").order("roll_number");
      setStudents((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q) || (s.student_id || "").toLowerCase().includes(q);
    const matchC = !classFilter || s.class === classFilter;
    return matchQ && matchC;
  });

  const classes = Array.from(new Set(students.map((s) => s.class))).sort();

  const exportCsv = () => {
    const headers = ["Student ID", "Name", "Roll No", "Class", "Section", "Gender", "Father", "Phone", "Status"];
    const rows = filtered.map((s) => [s.student_id, s.name, s.roll_number, s.class, s.section, s.gender, s.father_name, s.phone, s.status]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">List of All Students</h2>
          <p className="text-sm text-muted-foreground">Manage enrolled students • {filtered.length} record(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />Export CSV</Button>
          <Link to="/erp/students/new"><Button><UserPlus className="h-4 w-4 mr-1" />Add Student</Button></Link>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input placeholder="Search name, roll no, or student ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="md:col-span-2" />
          <select className="border rounded-md px-3 py-2 bg-background text-sm" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} aria-label="Filter by class">
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--navy))] text-white">
            <tr>
              <th className="p-3 text-left font-semibold">#</th>
              <th className="p-3 text-left font-semibold">Student ID</th>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Roll</th>
              <th className="p-3 text-left font-semibold">Class</th>
              <th className="p-3 text-left font-semibold">Father's Name</th>
              <th className="p-3 text-left font-semibold">Phone</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No students found</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} className="border-b hover:bg-muted/30">
                <td className="p-3">{i + 1}</td>
                <td className="p-3 font-mono text-xs">{s.student_id || "—"}</td>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.roll_number}</td>
                <td className="p-3">{s.class}-{s.section}</td>
                <td className="p-3">{s.father_name || "—"}</td>
                <td className="p-3">{s.phone || "—"}</td>
                <td className="p-3"><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></td>
                <td className="p-3">
                  <Link to={`/erp/students/${s.id}`}>
                    <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
