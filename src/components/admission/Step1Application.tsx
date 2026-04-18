import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Application } from "@/pages/admission/AdmissionApply";
import { ArrowRight, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  application: Application;
  onSaved: () => void;
}

const ACTIVITY_OPTIONS = ["Sports", "Music", "Art", "Dance", "Drama", "Robotics", "Debate", "Coding"];

export const Step1Application = ({ application, onSaved }: Props) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: application.full_name || "",
    gender: application.gender || "",
    date_of_birth: application.date_of_birth || "",
    blood_group: application.blood_group || "",
    aadhaar_number: application.aadhaar_number || "",
    category: application.category || "",
    religion: application.religion || "",
    nationality: application.nationality || "Indian",
    mobile: application.mobile || "",
    email: application.email || "",
    address: application.address || "",
    city: application.city || "",
    state: application.state || "",
    pincode: application.pincode || "",
    applying_class: application.applying_class || "",
    previous_school: application.previous_school || "",
    previous_class: application.previous_class || "",
    previous_marks: application.previous_marks || "",
    medium: application.medium || "",
    father_name: application.father_name || "",
    father_occupation: application.father_occupation || "",
    father_phone: application.father_phone || "",
    mother_name: application.mother_name || "",
    mother_occupation: application.mother_occupation || "",
    mother_phone: application.mother_phone || "",
    guardian_name: application.guardian_name || "",
    guardian_phone: application.guardian_phone || "",
    height: application.height || "",
    weight: application.weight || "",
    medical_conditions: application.medical_conditions || "",
    allergies: application.allergies || "",
    transport_required: application.transport_required || false,
    hostel_required: application.hostel_required || false,
    activities: (application.activities as string[] | null) || [],
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const toggleActivity = (a: string) => {
    set(
      "activities",
      form.activities.includes(a) ? form.activities.filter((x) => x !== a) : [...form.activities, a],
    );
  };

  const save = async (advance: boolean) => {
    if (advance) {
      // Required fields for moving to step 2
      const required: [string, string][] = [
        ["full_name", "Full name"],
        ["gender", "Gender"],
        ["date_of_birth", "Date of birth"],
        ["mobile", "Mobile number"],
        ["address", "Address"],
        ["applying_class", "Applying class"],
        ["father_name", "Father's name"],
        ["mother_name", "Mother's name"],
      ];
      for (const [k, label] of required) {
        if (!form[k as keyof typeof form]) {
          toast.error(`${label} is required`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const updates: any = { ...form };
      // Mirror DOB into resume_dob so the resume lookup works after step 1.
      if (form.date_of_birth) updates.resume_dob = form.date_of_birth;
      if (advance) {
        updates.status = "submitted";
        updates.current_step = Math.max(application.current_step || 1, 2);
      }

      const { error } = await supabase
        .from("admission_applications")
        .update(updates)
        .eq("id", application.id);
      if (error) throw error;

      toast.success(advance ? "Step 1 complete" : "Saved");
      if (advance) onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Application Form</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* A. Basic */}
        <section>
          <h3 className="mb-4 text-lg font-semibold">A. Student Basic Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger id="gender"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={(e) => set("date_of_birth", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="blood_group">Blood Group</Label>
              <Select value={form.blood_group} onValueChange={(v) => set("blood_group", v)}>
                <SelectTrigger id="blood_group"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aadhaar_number">Aadhaar Number (optional)</Label>
              <Input id="aadhaar_number" value={form.aadhaar_number} onChange={(e) => set("aadhaar_number", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger id="category"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["General", "SC", "ST", "OBC"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="religion">Religion</Label>
              <Input id="religion" value={form.religion} onChange={(e) => set("religion", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
            </div>
          </div>
        </section>

        <Separator />

        {/* B. Contact */}
        <section>
          <h3 className="mb-4 text-lg font-semibold">B. Contact Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input id="mobile" type="tel" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Full Address *</Label>
              <Textarea id="address" rows={3} value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pincode">PIN Code</Label>
              <Input id="pincode" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
            </div>
          </div>
        </section>

        <Separator />

        {/* C. Academic */}
        <section>
          <h3 className="mb-4 text-lg font-semibold">C. Academic Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="applying_class">Applying for Class *</Label>
              <Input id="applying_class" placeholder="e.g. Class III" value={form.applying_class} onChange={(e) => set("applying_class", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="medium">Medium of Instruction</Label>
              <Select value={form.medium} onValueChange={(v) => set("medium", v)}>
                <SelectTrigger id="medium"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="previous_school">Previous School Name</Label>
              <Input id="previous_school" value={form.previous_school} onChange={(e) => set("previous_school", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="previous_class">Previous Class</Label>
              <Input id="previous_class" value={form.previous_class} onChange={(e) => set("previous_class", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="previous_marks">Marks / Grade</Label>
              <Input id="previous_marks" value={form.previous_marks} onChange={(e) => set("previous_marks", e.target.value)} />
            </div>
          </div>
        </section>

        <Separator />

        {/* D. Parents */}
        <section>
          <h3 className="mb-4 text-lg font-semibold">D. Parent / Guardian Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="father_name">Father's Name *</Label>
              <Input id="father_name" value={form.father_name} onChange={(e) => set("father_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="father_occupation">Father's Occupation</Label>
              <Input id="father_occupation" value={form.father_occupation} onChange={(e) => set("father_occupation", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="father_phone">Father's Phone</Label>
              <Input id="father_phone" type="tel" value={form.father_phone} onChange={(e) => set("father_phone", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="mother_name">Mother's Name *</Label>
              <Input id="mother_name" value={form.mother_name} onChange={(e) => set("mother_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="mother_occupation">Mother's Occupation</Label>
              <Input id="mother_occupation" value={form.mother_occupation} onChange={(e) => set("mother_occupation", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="mother_phone">Mother's Phone</Label>
              <Input id="mother_phone" type="tel" value={form.mother_phone} onChange={(e) => set("mother_phone", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="guardian_name">Guardian Name (optional)</Label>
              <Input id="guardian_name" value={form.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="guardian_phone">Guardian Phone</Label>
              <Input id="guardian_phone" type="tel" value={form.guardian_phone} onChange={(e) => set("guardian_phone", e.target.value)} />
            </div>
          </div>
        </section>

        <Separator />

        {/* E. Health */}
        <section>
          <h3 className="mb-4 text-lg font-semibold">E. Health Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="height">Height</Label>
              <Input id="height" placeholder="e.g. 120 cm" value={form.height} onChange={(e) => set("height", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input id="weight" placeholder="e.g. 25 kg" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="medical_conditions">Medical Conditions</Label>
              <Textarea id="medical_conditions" rows={2} value={form.medical_conditions} onChange={(e) => set("medical_conditions", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea id="allergies" rows={2} value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
            </div>
          </div>
        </section>

        <Separator />

        {/* F. Other */}
        <section>
          <h3 className="mb-4 text-lg font-semibold">F. Other Details</h3>
          <div className="space-y-4">
            <div>
              <Label>Transport Required</Label>
              <RadioGroup
                className="flex gap-6"
                value={form.transport_required ? "yes" : "no"}
                onValueChange={(v) => set("transport_required", v === "yes")}
              >
                <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="t-yes" /><Label htmlFor="t-yes" className="font-normal">Yes</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="no" id="t-no" /><Label htmlFor="t-no" className="font-normal">No</Label></div>
              </RadioGroup>
            </div>
            <div>
              <Label>Hostel Required</Label>
              <RadioGroup
                className="flex gap-6"
                value={form.hostel_required ? "yes" : "no"}
                onValueChange={(v) => set("hostel_required", v === "yes")}
              >
                <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="h-yes" /><Label htmlFor="h-yes" className="font-normal">Yes</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="no" id="h-no" /><Label htmlFor="h-no" className="font-normal">No</Label></div>
              </RadioGroup>
            </div>
            <div>
              <Label className="mb-2 block">Extra Activities Interest</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {ACTIVITY_OPTIONS.map((a) => (
                  <label key={a} className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      checked={form.activities.includes(a)}
                      onCheckedChange={() => toggleActivity(a)}
                    />
                    <span className="text-sm">{a}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => save(false)} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Draft
          </Button>
          <Button onClick={() => save(true)} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue to Documents <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
