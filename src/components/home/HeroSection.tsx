import heroCampus from "@/assets/School_bliding.png";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroCampus}
          alt="Master International School Campus aerial view"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gold/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float animation-delay-2s" />

      {/* Content */}
      <div className="relative container mx-auto px-4 lg:px-8 pt-24 pb-16">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm border border-gold/30 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-sm font-medium">Admissions Open for 2026-27</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6 animate-fade-in-up">
            Inspiring Excellence —{" "}
            <span className="text-gold">Mind, Body & Character</span>
          </h1>

          {/* Subtext */}
          <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl animate-fade-in-up animation-delay-200ms">
            Master International, Padamapur offers a holistic CBSE education nurturing 
            young minds from Kindergarten to Class XII in a world-class learning environment.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up animation-delay-400ms">
            <Button variant="hero" size="xl" asChild>
              <Link to="/admissions">
                Apply Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/about">
                <Play className="w-5 h-5" />
                Virtual Tour
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up animation-delay-600ms">
            {[
              { value: "K-12", label: "Classes Offered" },
              { value: "25+", label: "Years Legacy" },
              { value: "50+", label: "Expert Faculty" },
              { value: "5000+", label: "Alumni Network" },
            ].map((stat, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className="text-3xl md:text-4xl font-bold text-gold mb-1">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-white/50" />
        </div>
      </div>
    </section>
  );
}
