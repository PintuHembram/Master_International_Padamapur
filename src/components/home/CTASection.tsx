import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Calendar } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-gold/10 via-background to-gold/5">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 rounded-full px-4 py-2 mb-8">
            <Calendar className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm font-medium">Applications Open for 2026-27 Session</span>
          </span>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Begin Your Child's Journey to{" "}
            <span className="text-gold">Excellence</span>
          </h2>
          
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Join the Master International family and give your child access to 
            world-class education, facilities, and opportunities. Limited seats available.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="gold" size="xl" asChild>
              <Link to="/admissions">
                Apply Online Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <a href="/brochure.pdf" download>
                <Download className="w-5 h-5" />
                Download Brochure
              </a>
            </Button>
          </div>
          
          <p className="text-muted-foreground text-sm mt-8">
            Need help? Call us at{" "}
            <a href="tel:+919876543210" className="text-gold font-medium hover:underline">
              +91 70082 82967
            </a>{" "}
            or schedule a{" "}
            <Link to="/contact" className="text-gold font-medium hover:underline">
              campus visit
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
