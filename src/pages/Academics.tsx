import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Microscope, Languages, Calculator, Palette, Code, ChevronRight } from "lucide-react";
import { Helmet } from "react-helmet-async";

const gradeBands = [
  {
    id: "primary",
    title: "Primary School",
    grades: "Pre-Nursery to Class V",
    description: "Foundation years focusing on holistic development through play-based and activity-based learning.",
    subjects: ["English", "Hindi", "Odia", "Mathematics", "EVS", "Computer Science", "Art & Craft", "Physical Education"],
    features: ["Smart Classrooms", "Activity-Based Learning", "Regular Parent Communication"],
  },
  {
    id: "middle",
    title: "Middle School",
    grades: "Class VI to Class VIII",
    description: "Building academic rigor while encouraging exploration and critical thinking skills.",
    subjects: ["English", "Hindi", "Odia", "Mathematics", "Science", "Social Science", "Computer Science", "Sanskrit/French"],
    features: ["Science Labs", "Project-Based Learning", "Career Counseling Intro"],
  },
  {
    id: "secondary",
    title: "Secondary School",
    grades: "Class IX & X",
    description: "CBSE Board preparation with comprehensive academic support and competitive exam guidance.",
    subjects: ["English", "Hindi/Sanskrit", "Mathematics", "Science", "Social Science", "IT/Computer Applications"],
    features: ["Board Exam Prep", "Career Guidance", "Olympiad Training"],
  },
  {
    id: "senior",
    title: "Senior Secondary",
    grades: "Class XI & XII",
    description: "Specialized streams with focus on board exams and competitive entrance preparation.",
    subjects: ["Science (PCM/PCB)", "Commerce", "Humanities"],
    features: ["Stream-wise Labs", "Entrance Coaching", "Industry Connect"],
  },
];

const specialPrograms = [
  { icon: Microscope, title: "STEM Labs", desc: "Advanced science and robotics facilities" },
  { icon: Languages, title: "Language Labs", desc: "Digital language learning systems" },
  { icon: Code, title: "Coding Club", desc: "Programming and app development" },
  { icon: Palette, title: "Arts Academy", desc: "Music, dance, and visual arts" },
];

const Academics = () => {
  return (
    <Layout>
      <Helmet>
        <title>Academics | Master International, Padamapur - CBSE Curriculum</title>
        <meta name="description" content="Explore our CBSE curriculum from Pre-Nursery to Class XII. Academic programs, subjects, STEM labs, and special programs at Master International." />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-3xl">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Academics</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
              Excellence in Education
            </h1>
            <p className="text-white/80 text-lg">
              Our CBSE-aligned curriculum combines academic rigor with innovative teaching 
              methodologies to prepare students for global challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Our Programs</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
              Curriculum by Grade Level
            </h2>
          </div>

          <div className="space-y-8">
            {gradeBands.map((band) => (
              <div
                key={band.id}
                id={band.id}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="grid lg:grid-cols-3">
                  <div className="bg-gradient-to-br from-navy to-navy-dark p-8 text-white">
                    <GraduationCap className="w-10 h-10 text-gold mb-4" />
                    <h3 className="font-display text-2xl font-bold mb-2">{band.title}</h3>
                    <p className="text-gold font-medium">{band.grades}</p>
                  </div>
                  <div className="lg:col-span-2 p-8">
                    <p className="text-muted-foreground mb-6">{band.description}</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gold" />
                          Subjects
                        </h4>
                        <ul className="space-y-1">
                          {band.subjects.map((subject, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-gold" />
                              {subject}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-gold" />
                          Key Features
                        </h4>
                        <ul className="space-y-1">
                          {band.features.map((feature, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-gold" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Programs */}
      <section className="py-20 bg-muted/50" id="labs">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Beyond Curriculum</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
              Special Programs
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialPrograms.map((program, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border/50 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <program.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{program.title}</h3>
                <p className="text-muted-foreground text-sm">{program.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Pattern */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">Evaluation</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-6">
                Assessment Pattern
              </h2>
              <p className="text-muted-foreground mb-6">
                Following CBSE's Continuous and Comprehensive Evaluation (CCE) pattern, 
                we assess students through a combination of formative and summative assessments.
              </p>
              <ul className="space-y-4">
                {[
                  "Periodic Tests (3 per year)",
                  "Half-Yearly Examinations",
                  "Annual Examinations",
                  "Project Work & Assignments",
                  "Co-scholastic Assessment",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-navy rounded-2xl p-8 text-white">
              <h3 className="font-display text-xl font-semibold mb-6">Sample Timetable</h3>
              <div className="space-y-3">
                {[
                  { time: "8:00 AM", activity: "Assembly & Attendance" },
                  { time: "8:30 AM", activity: "Period 1 - English" },
                  { time: "9:15 AM", activity: "Period 2 - Mathematics" },
                  { time: "10:00 AM", activity: "Period 3 - Science" },
                  { time: "10:45 AM", activity: "Break" },
                  { time: "11:15 AM", activity: "Period 4-6 - Various" },
                  { time: "2:00 PM", activity: "Dispersal" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-gold font-mono text-sm w-20">{item.time}</span>
                    <span className="text-white/80">{item.activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-muted-foreground mb-8">Explore admission options for the 2026-27 academic year.</p>
          <Button variant="gold" size="lg" asChild>
            <Link to="/admissions">Apply for Admission</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Academics;
