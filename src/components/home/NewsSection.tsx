import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const news = [
  {
    id: 1,
    title: "Annual Sports Day 2025 - A Grand Success",
    excerpt: "Students showcased their athletic prowess in various track and field events, with house competitions...",
    date: "Dec 1, 2025",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1461896836934- voices8d8b4d4?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    title: "Science Exhibition Winners Announced",
    excerpt: "Our students demonstrated innovative projects at the inter-school science exhibition, securing top positions...",
    date: "Nov 28, 2025",
    category: "Academics",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    title: "New STEM Lab Inauguration",
    excerpt: "State-of-the-art STEM laboratory inaugurated with advanced robotics and coding facilities for students...",
    date: "Nov 20, 2025",
    category: "Infrastructure",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop",
  },
];

export function NewsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Latest Updates</span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3">
              News & Events
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/events">
              View All News
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <article
              key={item.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-gold text-navy text-xs font-semibold px-3 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                  <Calendar className="w-4 h-4" />
                  {item.date}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-navy transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {item.excerpt}
                </p>
                <Link
                  to={`/events/${item.id}`}
                  className="text-gold font-medium text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
