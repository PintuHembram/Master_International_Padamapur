import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const initial = {
  name: "", roll_number: "", class: "", section: "A", gender: "", date_of_birth: "",
  blood_group: "", student_id: "", photo_url: "",
  session: "2025-26", admission_date: "", status: "active",
  father_name: "", father_phone: "", mother_name: "", mother_phone: "",
  guardian_name: "", guardian_phone: "", guardian_relation: "",
  phone: "", email: "", address: "", city: "", state: "", pincode: "",
  height: "", weight: "", medical_conditions: "", allergies: "",
};

export default function StudentNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(initial);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.roll_number || !form.class || !form.date_of_birth) {
      return toast.error("Name, Roll Number, Class and Date of Birth are required");
    }
    setSaving(true);
    const payload: any = { ...form };
    Object.keys(payload).forEach((k) => { if (payload[k] === "") payload[k] = null; });
    const { data, error } = await supabase.from("students").insert(payload).select().single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Student added");
    navigate(`/erp/students/${data.id}`);
  };

  const Field = ({ k, label, type = "text" }: { k: string; label: string; type?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type={type} value={form[k] || ""} onChange={(e) => set(k, e.target.value)} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link to="/erp/students"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
        <Button onClick={submit} disabled={saving}><Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save Student"}</Button>
      </div>

      <Card className="p-4 bg-[hsl(var(--navy))] text-white">
        <h2 className="text-xl font-bold">Add New Student</h2>
        <p className="text-sm text-white/80">Fill all applicable fields. Required: Name, Roll, Class, DOB.</p>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 pb-2 border-b">Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field k="name" label="Full Name *" />
          <Field k="student_id" label="PEN (auto-generated if blank)" />
          <Field k="roll_number" label="Roll Number *" />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Gender</Label>
            <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{["Male","Female","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Field k="date_of_birth" label="Date of Birth *" type="date" />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Blood Group</Label>
            <Select value={form.blood_group} onValueChange={(v) => set("blood_group", v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Field k="photo_url" label="Photo URL" />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 pb-2 border-b">Academic</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field k="class" label="Class *" />
          <Field k="section" label="Section" />
          <Field k="session" label="Session" />
          <Field k="admission_date" label="Admission Date" type="date" />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["active","inactive","transferred","graduated"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 pb-2 border-b">Family</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field k="father_name" label="Father's Name" />
          <Field k="father_phone" label="Father's Phone" />
          <Field k="mother_name" label="Mother's Name" />
          <Field k="mother_phone" label="Mother's Phone" />
          <Field k="guardian_name" label="Guardian's Name" />
          <Field k="guardian_phone" label="Guardian's Phone" />
          <Field k="guardian_relation" label="Guardian Relation" />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 pb-2 border-b">Contact & Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field k="phone" label="Mobile" />
          <Field k="email" label="Email" type="email" />
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs text-muted-foreground">Address</Label>
            <Textarea value={form.address || ""} onChange={(e) => set("address", e.target.value)} rows={2} />
          </div>
          <Field k="city" label="City" />
          <Field k="state" label="State" />
          <Field k="pincode" label="Pincode" />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 pb-2 border-b">Medical</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field k="height" label="Height" />
          <Field k="weight" label="Weight" />
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs text-muted-foreground">Medical Conditions</Label>
            <Textarea value={form.medical_conditions || ""} onChange={(e) => set("medical_conditions", e.target.value)} rows={2} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs text-muted-foreground">Allergies</Label>
            <Textarea value={form.allergies || ""} onChange={(e) => set("allergies", e.target.value)} rows={2} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={saving} size="lg"><Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save Student"}</Button>
      </div>
    </div>
  );
}
