import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Master International has transformed my child's approach to learning. The teachers are incredibly supportive and the holistic development programs are outstanding.",
    name: "Mrs. Sunita Patel",
    role: "Parent of Class X Student",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    quote: "The school's emphasis on both academics and extracurricular activities helped me become a well-rounded individual. Forever grateful for the foundation laid here.",
    name: "Rahul Sharma",
    role: "Alumni, Batch 2020",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    quote: "As an educator, I'm proud to be part of an institution that truly values every student's potential and works tirelessly to help them achieve their dreams.",
    name: "Dr. Priya Mohanty",
    role: "Senior Faculty Member",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
  },
];

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-20 lg:py-28 bg-navy relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Header */}
          <div>
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-3 mb-5">
              Voices of Our Community
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Hear from parents, alumni, and educators about their experiences 
              at Master International, Padamapur.
            </p>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-white hover:border-gold hover:text-gold transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-white hover:border-gold hover:text-gold transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="text-white/50 text-sm ml-4">
                {current + 1} / {testimonials.length}
              </span>
            </div>
          </div>

          {/* Right - Testimonial Card */}
          <div className="relative">
            <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-2xl">
              <Quote className="w-12 h-12 text-gold/30 mb-6" />
              <p className="text-foreground text-lg lg:text-xl leading-relaxed mb-8">
                "{testimonials[current].quote}"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonials[current].image}
                  alt={testimonials[current].name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonials[current].name}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {testimonials[current].role}
                  </div>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? "bg-gold w-6" : "bg-white/30"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
