import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { ArrowRight, Calendar, CheckCircle, Download, FileText } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

const steps = [
  { step: 1, title: "Fill Application", desc: "Complete the online admission form with student details" },
  { step: 2, title: "Submit Documents", desc: "Upload required documents (birth certificate, photos, etc.)" },
  { step: 3, title: "Assessment", desc: "Interaction/assessment for age-appropriate evaluation" },
  { step: 4, title: "Fee Payment", desc: "Complete fee payment upon selection confirmation" },
  { step: 5, title: "Enrollment", desc: "Receive admission confirmation and welcome kit" },
];

const eligibility = [
  { class: "Pre-Nursery", age: "2.5 - 3 years" },
  { class: "Nursery", age: "3 - 4 years" },
  { class: "LKG", age: "4 - 5 years" },
  { class: "UKG", age: "5 - 6 years" },
  { class: "Class I", age: "6 - 7 years" },
  { class: "Class II - X", age: "Age appropriate" },
  { class: "Class XI", age: "As per CBSE norms" },
];

const Admissions = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    dob: "",
    gender: "",
    classApplying: "",
    fatherName: "",
    motherName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    previousSchool: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('admissions').insert({
        student_name: formData.studentName,
        date_of_birth: formData.dob,
        gender: formData.gender,
        class_applying: formData.classApplying,
        father_name: formData.fatherName,
        mother_name: formData.motherName,
        parent_phone: formData.parentPhone,
        parent_email: formData.parentEmail,
        address: formData.address,
        previous_school: formData.previousSchool || null,
      });

      if (error) throw error;

      toast.success("Application submitted successfully! We'll contact you within 48 hours.");
      setFormData({
        studentName: "",
        dob: "",
        gender: "",
        classApplying: "",
        fatherName: "",
        motherName: "",
        parentPhone: "",
        parentEmail: "",
        address: "",
        previousSchool: "",
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Admissions 2026-27 | Master International, Padamapur</title>
        <meta name="description" content="Apply for admissions at Master International, Padamapur. CBSE affiliated school offering K-12 education. Online application, eligibility criteria, and fee structure." />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-sm font-medium">Admissions Open 2026-27</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Start Your Journey with Us
            </h1>
            <p className="text-white/80 text-lg">
              Join the Master International family and give your child access to 
              world-class CBSE education and holistic development opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">How to Apply</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
              Admission Process
            </h2>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {steps.map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-card rounded-xl p-6 border border-border/50 h-full">
                  <div className="w-10 h-10 rounded-full bg-gold text-navy font-bold flex items-center justify-center mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-gold/50 -translate-y-1/2 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility & Form */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Eligibility */}
            <div>
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">Requirements</span>
              <h2 className="font-display text-3xl font-bold text-foreground mt-3 mb-8">
                Eligibility Criteria
              </h2>
              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold">Class</th>
                      <th className="text-left px-6 py-4 font-semibold">Age Criteria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibility.map((item, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="px-6 py-4 font-medium">{item.class}</td>
                        <td className="px-6 py-4 text-muted-foreground">{item.age}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Downloads */}
              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Downloads</h3>
                <a href="#" className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50 hover:border-gold transition-colors">
                  <FileText className="w-8 h-8 text-gold" />
                  <div>
                    <div className="font-medium">Fee Structure 2026-27</div>
                    <div className="text-sm text-muted-foreground">PDF, 245 KB</div>
                  </div>
                  <Download className="w-5 h-5 ml-auto text-muted-foreground" />
                </a>
                <a href="#" className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50 hover:border-gold transition-colors">
                  <FileText className="w-8 h-8 text-gold" />
                  <div>
                    <div className="font-medium">School Brochure</div>
                    <div className="text-sm text-muted-foreground">PDF, 2.1 MB</div>
                  </div>
                  <Download className="w-5 h-5 ml-auto text-muted-foreground" />
                </a>
              </div>
            </div>

            {/* Application Form */}
            <div>
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">Apply Now</span>
              <h2 className="font-display text-3xl font-bold text-foreground mt-3 mb-8">
                Online Application
              </h2>
              <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-border/50 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="studentName">Student's Full Name *</Label>
                    <Input
                      id="studentName"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      required
                      disabled={loading}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        required
                        disabled={loading}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        disabled={loading}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="class">Class Applying For *</Label>
                    <Select
                      value={formData.classApplying}
                      onValueChange={(value) => setFormData({ ...formData, classApplying: value })}
                      disabled={loading}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibility.map((item) => (
                          <SelectItem key={item.class} value={item.class}>{item.class}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fatherName">Father's Name *</Label>
                      <Input
                        id="fatherName"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        required
                        disabled={loading}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="motherName">Mother's Name *</Label>
                      <Input
                        id="motherName"
                        value={formData.motherName}
                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                        required
                        disabled={loading}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        required
                        disabled={loading}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                        required
                        disabled={loading}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Residential Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      disabled={loading}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="previousSchool">Previous School (if any)</Label>
                    <Input
                      id="previousSchool"
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      disabled={loading}
                      className="mt-2"
                      placeholder="Name of previous school"
                    />
                  </div>
                  <Button type="submit" variant="gold" className="w-full" size="lg" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Application'}
                    <CheckCircle className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Visit CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <Calendar className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-4">Visit Our Campus</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Experience our world-class facilities firsthand. Schedule a campus tour 
            and meet our faculty.
          </p>
          <Button variant="navy" size="lg" asChild>
            <a href="/contact">Book a Campus Visit</a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Admissions;
