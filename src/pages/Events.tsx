import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const events = [
  {
    id: 1,
    title: "Annual Sports Day 2025",
    excerpt: "Students showcased their athletic prowess in various track and field events, with inter-house competitions creating an atmosphere of healthy competition and team spirit.",
    date: "Dec 1, 2025",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1461896836934-8d8b4d4?w=800&h=450&fit=crop",
    type: "past",
  },
  {
    id: 2,
    title: "Science Exhibition Winners",
    excerpt: "Our students demonstrated innovative projects at the inter-school science exhibition, securing top positions and bringing laurels to the school.",
    date: "Nov 28, 2025",
    category: "Academics",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop",
    type: "past",
  },
  {
    id: 3,
    title: "Winter Break Announcement",
    excerpt: "School will remain closed from December 25, 2025 to January 2, 2026 for winter vacations. Classes resume on January 3, 2026.",
    date: "Dec 20, 2025",
    category: "Notice",
    image: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&h=450&fit=crop",
    type: "upcoming",
  },
  {
    id: 4,
    title: "Parent-Teacher Meeting",
    excerpt: "PTM scheduled for all classes. Parents are requested to attend and discuss their ward's progress with respective class teachers.",
    date: "Jan 15, 2026",
    category: "Events",
    image: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&h=450&fit=crop",
    type: "upcoming",
  },
  {
    id: 5,
    title: "Republic Day Celebrations",
    excerpt: "Join us for the Republic Day celebrations featuring flag hoisting ceremony, cultural programs, and march past by NCC cadets.",
    date: "Jan 26, 2026",
    category: "Events",
    image: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&h=450&fit=crop",
    type: "upcoming",
  },
  {
    id: 6,
    title: "New STEM Lab Inauguration",
    excerpt: "State-of-the-art STEM laboratory inaugurated with advanced robotics and coding facilities for students of all age groups.",
    date: "Nov 20, 2025",
    category: "Infrastructure",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop",
    type: "past",
  },
];

const Events = () => {
  const upcomingEvents = events.filter((e) => e.type === "upcoming");
  const pastEvents = events.filter((e) => e.type === "past");

  return (
    <Layout>
      <Helmet>
        <title>Events & News | Master International, Padamapur</title>
        <meta name="description" content="Stay updated with latest news, events, and announcements from Master International, Padamapur. Upcoming events, past highlights, and school notices." />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-3xl">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Stay Updated</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
              News & Events
            </h1>
            <p className="text-white/80 text-lg">
              Discover what's happening at Master International. From academic achievements 
              to cultural celebrations, stay connected with our vibrant community.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">Mark Your Calendar</span>
              <h2 className="font-display text-3xl font-bold text-foreground mt-2">Upcoming Events</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <article
                key={event.id}
                className="bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl transition-all"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-gold text-navy text-xs font-semibold px-3 py-1 rounded-full">
                      Upcoming
                    </span>
                    <span className="bg-white/90 text-navy text-xs font-semibold px-3 py-1 rounded-full">
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gold text-sm font-medium mb-3">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {event.excerpt}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/events/${event.id}`}>
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-10">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Recent Highlights</span>
            <h2 className="font-display text-3xl font-bold text-foreground mt-2">Past Events & News</h2>
          </div>
          <div className="space-y-6">
            {pastEvents.map((event) => (
              <article
                key={event.id}
                className="bg-card rounded-xl overflow-hidden border border-border/50 hover:shadow-lg transition-shadow"
              >
                <div className="grid md:grid-cols-4 gap-6 p-6">
                  <div className="md:col-span-1">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-40 md:h-32 object-cover rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gold text-sm font-medium">
                        <Tag className="w-4 h-4" />
                        {event.category}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {event.excerpt}
                    </p>
                    <Link
                      to={`/events/${event.id}`}
                      className="text-gold font-medium text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Read Full Story
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
