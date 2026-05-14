import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Printer, Pencil, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

const FIELD_GROUPS: { title: string; fields: { key: string; label: string; type?: string; options?: string[] }[] }[] = [
  {
    title: "Identity",
    fields: [
      { key: "name", label: "Full Name" },
      { key: "student_id", label: "Permanent Education Number (PEN)" },
      { key: "roll_number", label: "Roll Number" },
      { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
      { key: "date_of_birth", label: "Date of Birth", type: "date" },
      { key: "blood_group", label: "Blood Group", type: "select", options: ["A+","A-","B+","B-","O+","O-","AB+","AB-"] },
      { key: "photo_url", label: "Photo URL" },
    ],
  },
  {
    title: "Academic",
    fields: [
      { key: "class", label: "Class" },
      { key: "section", label: "Section" },
      { key: "session", label: "Session" },
      { key: "admission_date", label: "Admission Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["active","inactive","transferred","graduated"] },
    ],
  },
  {
    title: "Family",
    fields: [
      { key: "father_name", label: "Father's Name" },
      { key: "father_phone", label: "Father's Phone" },
      { key: "mother_name", label: "Mother's Name" },
      { key: "mother_phone", label: "Mother's Phone" },
      { key: "guardian_name", label: "Guardian's Name" },
      { key: "guardian_phone", label: "Guardian's Phone" },
      { key: "guardian_relation", label: "Guardian Relation" },
    ],
  },
  {
    title: "Contact & Address",
    fields: [
      { key: "phone", label: "Mobile" },
      { key: "email", label: "Email", type: "email" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "pincode", label: "Pincode" },
    ],
  },
  {
    title: "Medical",
    fields: [
      { key: "height", label: "Height" },
      { key: "weight", label: "Weight" },
      { key: "medical_conditions", label: "Medical Conditions", type: "textarea" },
      { key: "allergies", label: "Allergies", type: "textarea" },
    ],
  },
];

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
      setStudent(data);
      setDraft(data);
      setLoading(false);
    })();
  }, [id]);

  const set = (k: string, v: any) => setDraft((d: any) => ({ ...d, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { id: _id, created_at, updated_at, ...payload } = draft;
    const { error } = await supabase.from("students").update(payload).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Student updated");
    setStudent(draft);
    setEditing(false);
  };

  const remove = async () => {
    if (!confirm("Delete this student? This cannot be undone.")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Student deleted");
    navigate("/erp/students");
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!student) return <div className="p-8 text-center text-muted-foreground">Student not found</div>;

  const data = editing ? draft : student;

  const renderField = (f: { key: string; label: string; type?: string; options?: string[] }) => {
    const v = data?.[f.key] ?? "";
    if (!editing) {
      let display = v;
      if (f.type === "date" && v) display = new Date(v).toLocaleDateString("en-GB");
      return <div className="text-sm text-foreground">{display || "—"}</div>;
    }
    if (f.type === "textarea") return <Textarea value={v || ""} onChange={(e) => set(f.key, e.target.value)} rows={2} />;
    if (f.type === "select") return (
      <Select value={v || ""} onValueChange={(val) => set(f.key, val)}>
        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
        <SelectContent>{f.options!.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    );
    return <Input type={f.type || "text"} value={v || ""} onChange={(e) => set(f.key, e.target.value)} />;
  };

  return (
    <div className="space-y-4">
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      <div className="flex items-center justify-between flex-wrap gap-2 no-print">
        <Link to="/erp/students">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back to Students</Button>
        </Link>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" />Print</Button>
              <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
              <Button variant="destructive" onClick={remove}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { setDraft(student); setEditing(false); }}><X className="h-4 w-4 mr-1" />Cancel</Button>
              <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}</Button>
            </>
          )}
        </div>
      </div>

      <Card className="p-4 bg-[hsl(var(--navy))] text-white">
        <h2 className="text-xl font-bold">{student.name}</h2>
        <p className="text-sm text-white/80">PEN: {student.student_id || "—"} • Class {student.class}-{student.section} • Roll {student.roll_number}</p>
      </Card>

      {FIELD_GROUPS.map((group) => (
        <Card key={group.title} className="p-4">
          <h3 className="font-semibold text-base mb-3 pb-2 border-b">{group.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{f.label}</Label>
                {renderField(f)}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
