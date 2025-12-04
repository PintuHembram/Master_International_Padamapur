import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award, Users, Target, Eye, BookOpen, Trophy } from "lucide-react";
import { Helmet } from "react-helmet-async";

const values = [
  { icon: Target, title: "Excellence", desc: "Striving for the highest standards in everything we do" },
  { icon: Users, title: "Integrity", desc: "Building character through honesty and ethical values" },
  { icon: BookOpen, title: "Innovation", desc: "Embracing new ideas and creative approaches to learning" },
  { icon: Trophy, title: "Respect", desc: "Fostering a culture of mutual respect and understanding" },
];

const milestones = [
  { year: "1998", event: "School Founded with Primary Section" },
  { year: "2003", event: "CBSE Affiliation Received" },
  { year: "2010", event: "New Campus Inaugurated" },
  { year: "2015", event: "Science & Computer Labs Upgraded" },
  { year: "2020", event: "25th Anniversary & Sports Complex" },
  { year: "2024", event: "STEM Lab & Smart Classrooms" },
];

const About = () => {
  return (
    <Layout>
      <Helmet>
        <title>About Us | Master International, Padamapur - CBSE School</title>
        <meta name="description" content="Learn about Master International's mission, vision, and 25+ years of excellence in education. CBSE affiliated school in Padamapur, Odisha." />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-3xl">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">About Us</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
              Building Futures Since 1998
            </h1>
            <p className="text-white/80 text-lg">
              For over 25 years, Master International has been at the forefront of quality 
              education in Padamapur, shaping young minds and creating responsible citizens.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-navy to-navy-dark rounded-2xl p-8 lg:p-12 text-white">
              <div className="w-16 h-16 rounded-xl bg-gold/20 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-white/80 leading-relaxed">
                To provide a nurturing and stimulating environment that empowers students 
                to achieve academic excellence while developing into responsible, creative, 
                and compassionate individuals who contribute positively to society.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gold to-gold-dark rounded-2xl p-8 lg:p-12">
              <div className="w-16 h-16 rounded-xl bg-navy/20 flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-navy" />
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-4 text-navy">Our Vision</h2>
              <p className="text-navy/80 leading-relaxed">
                To be the leading educational institution in Odisha, recognized for academic 
                excellence, innovative teaching, and holistic development of students who 
                become global citizens and future leaders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principal's Message */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=600&fit=crop"
                alt="Dr. Principal"
                className="rounded-2xl shadow-xl w-full max-w-md mx-auto"
              />
            </div>
            <div>
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">Principal's Message</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-6">
                Dr. Ramesh Kumar Mishra
              </h2>
              <blockquote className="text-muted-foreground text-lg leading-relaxed mb-6 border-l-4 border-gold pl-6">
                "Education is not just about acquiring knowledge; it's about developing 
                character, nurturing creativity, and building the foundation for a 
                meaningful life. At Master International, we believe every child has 
                unlimited potential waiting to be unlocked."
              </blockquote>
              <p className="text-muted-foreground mb-6">
                With over 30 years of experience in education, Dr. Mishra has been leading 
                Master International since 2010, transforming it into one of the most 
                respected institutions in the region.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Qualifications:</strong> Ph.D. in Education, M.Ed., B.Ed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Our Foundation</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
              Core Values
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-navy">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Our Journey</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">
              Milestones
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            {milestones.map((item, i) => (
              <div key={i} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-gold" />
                  {i !== milestones.length - 1 && <div className="w-0.5 h-full bg-gold/30 mt-2" />}
                </div>
                <div className="pb-8">
                  <span className="text-gold font-bold text-lg">{item.year}</span>
                  <p className="text-white/80 mt-1">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditation */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Award className="w-10 h-10 text-gold" />
            <h2 className="font-display text-2xl md:text-3xl font-bold">CBSE Affiliated</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Master International is proudly affiliated with the Central Board of Secondary Education (CBSE), 
            New Delhi, ensuring our curriculum meets national standards of excellence.
          </p>
          <div className="inline-block bg-muted rounded-lg px-6 py-3">
            <span className="text-sm text-muted-foreground">Affiliation Number: </span>
            <span className="font-mono font-semibold">21XXXXX</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Want to Know More?</h2>
          <p className="text-muted-foreground mb-8">Schedule a campus visit or contact us for more information.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" asChild>
              <Link to="/contact">Schedule Visit</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/admissions">View Admissions</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
