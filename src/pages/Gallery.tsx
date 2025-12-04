import { useState } from "react";
import { Layout } from "@/components/Layout";
import { X } from "lucide-react";
import { Helmet } from "react-helmet-async";

const categories = ["All", "Campus", "Sports", "Events", "Labs", "Activities"];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop", title: "Main Academic Block", category: "Campus" },
  { src: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=400&fit=crop", title: "School Library", category: "Campus" },
  { src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop", title: "Basketball Court", category: "Sports" },
  { src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop", title: "Football Ground", category: "Sports" },
  { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop", title: "Annual Day 2024", category: "Events" },
  { src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop", title: "Science Exhibition", category: "Events" },
  { src: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop", title: "Chemistry Lab", category: "Labs" },
  { src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop", title: "Computer Lab", category: "Labs" },
  { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop", title: "Classroom Session", category: "Activities" },
  { src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&h=400&fit=crop", title: "Art & Craft", category: "Activities" },
  { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&h=400&fit=crop", title: "School Assembly", category: "Activities" },
  { src: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop", title: "Reading Corner", category: "Campus" },
];

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  const filteredImages = galleryImages.filter(
    (img) => selectedCategory === "All" || img.category === selectedCategory
  );

  return (
    <Layout>
      <Helmet>
        <title>Gallery | Master International, Padamapur</title>
        <meta name="description" content="Explore our school gallery featuring campus, sports facilities, events, labs, and student activities at Master International, Padamapur." />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-3xl">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Photo Gallery</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
              Campus Life
            </h1>
            <p className="text-white/80 text-lg">
              Explore our vibrant campus, state-of-the-art facilities, and memorable moments 
              from school events and activities.
            </p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-muted/50 sticky top-20 z-30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-navy text-white"
                    : "bg-card border border-border hover:border-navy"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightboxImage(img)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl"
              >
                <img
                  src={img.src}
                  alt={img.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-gold font-medium">{img.category}</span>
                  <p className="text-white font-medium text-sm">{img.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-gold transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage.src.replace('w=600', 'w=1200')}
              alt={lightboxImage.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <span className="text-gold text-sm">{lightboxImage.title}</span>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Gallery;
