import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Printer } from "lucide-react";

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
      setStudent(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!student) return <div className="p-8 text-center text-muted-foreground">Student not found</div>;

  const maskAadhaar = (v: string | null) => v ? `********${v.slice(-4)}` : "NA";

  const fields: { label: string; value: any }[] = [
    { label: "Student's Name (as per School record/Admission Register)", value: student.name?.toUpperCase() },
    { label: "Gender (as per School record/Admission Register)", value: student.gender },
    { label: "Date of Birth (as per School record) (DD/MM/YYYY)", value: student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString("en-GB") : "NA" },
    { label: "Permanent Education Number (PEN)", value: student.student_id || "NA" },
    { label: "Mother's Name", value: student.mother_name?.toUpperCase() || "NA" },
    { label: "Father's Name", value: student.father_name?.toUpperCase() || "NA" },
    { label: "Guardian's Name", value: student.guardian_name?.toUpperCase() || student.mother_name?.toUpperCase() || "NA" },
    { label: "AADHAAR Number of Student", value: maskAadhaar(null) },
    { label: "Address", value: student.address || "NA" },
    { label: "City", value: student.city || "NA" },
    { label: "State", value: student.state || "NA" },
    { label: "Pincode", value: student.pincode || "NA" },
    { label: "Mobile Number (of Student/Parent/Guardian)", value: student.phone || student.father_phone || student.mother_phone || "NA" },
    { label: "Alternate Mobile Number", value: student.guardian_phone || "NA" },
    { label: "Contact email-id", value: student.email || "NA" },
    { label: "Class & Section", value: `${student.class} - ${student.section}` },
    { label: "Roll Number", value: student.roll_number },
    { label: "Admission Date", value: student.admission_date ? new Date(student.admission_date).toLocaleDateString("en-GB") : "NA" },
    { label: "Session", value: student.session || "NA" },
    { label: "Blood Group", value: student.blood_group || "NA" },
    { label: "Height", value: student.height || "NA" },
    { label: "Weight", value: student.weight || "NA" },
    { label: "Medical Conditions", value: student.medical_conditions || "NA" },
    { label: "Allergies", value: student.allergies || "NA" },
    { label: "Status", value: student.status },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link to="/erp/students">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back to Students</Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" />Print</Button>
        </div>
      </div>

      <Card className="p-4 bg-[hsl(var(--navy))] text-white">
        <h2 className="text-xl font-bold">{student.name}</h2>
        <p className="text-sm text-white/80">PEN: {student.student_id || "—"} • Class {student.class}-{student.section} • Roll {student.roll_number}</p>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {fields.map((f, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="p-3 w-12 text-center text-muted-foreground bg-muted/50 font-medium">{i + 1}.</td>
                <td className="p-3 w-1/2 font-medium">{f.label}</td>
                <td className="p-3 text-foreground">{f.value || "NA"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
