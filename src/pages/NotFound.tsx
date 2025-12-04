import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <Helmet>
        <title>Page Not Found | Master International, Padamapur</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <section className="pt-32 pb-20 min-h-screen flex items-center bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-lg mx-auto">
            <div className="text-[120px] md:text-[180px] font-display font-bold text-navy/10 leading-none mb-0">
              404
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground -mt-8 mb-4">
              Page Not Found
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Sorry, the page you're looking for doesn't exist or has been moved. 
              Let us help you find your way back.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" asChild>
                <Link to="/">
                  <Home className="w-5 h-5" />
                  Go to Home
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.history.back()}>
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
