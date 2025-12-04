import { BookOpen, Trophy, Users, Palette, FlaskConical, Bus } from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  {
    icon: BookOpen,
    title: "Academic Excellence",
    description: "Comprehensive CBSE curriculum with innovative teaching methodologies and personalized attention.",
    color: "bg-blue-500/10 text-blue-600",
    link: "/academics",
  },
  {
    icon: Trophy,
    title: "Sports & Athletics",
    description: "State-of-the-art sports facilities including cricket, basketball, athletics, and indoor games.",
    color: "bg-orange-500/10 text-orange-600",
    link: "/gallery#sports",
  },
  {
    icon: Palette,
    title: "Arts & Culture",
    description: "Nurturing creativity through music, dance, drama, and visual arts programs.",
    color: "bg-purple-500/10 text-purple-600",
    link: "/academics#arts",
  },
  {
    icon: FlaskConical,
    title: "STEM Labs",
    description: "Modern science and computer labs encouraging hands-on learning and innovation.",
    color: "bg-green-500/10 text-green-600",
    link: "/academics#labs",
  },
  {
    icon: Users,
    title: "Expert Faculty",
    description: "Highly qualified and experienced teachers dedicated to student success.",
    color: "bg-red-500/10 text-red-600",
    link: "/faculty",
  },
  {
    icon: Bus,
    title: "Safe Transport",
    description: "GPS-enabled buses covering all major routes ensuring safe commute for students.",
    color: "bg-teal-500/10 text-teal-600",
    link: "/contact",
  },
];

export function HighlightsSection() {
  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-5">
            Nurturing Tomorrow's Leaders
          </h2>
          <p className="text-muted-foreground text-lg">
            A perfect blend of academics, sports, and co-curricular activities 
            designed to bring out the best in every student.
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {highlights.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="group bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/50"
            >
              <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-navy transition-colors">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
