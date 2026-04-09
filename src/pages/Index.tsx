import { Layout } from "@/components/Layout";
import { CTASection } from "@/components/home/CTASection";
import { HeroSection } from "@/components/home/HeroSection";
import { HighlightsSection } from "@/components/home/HighlightsSection";
import { NewsSection } from "@/components/home/NewsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <Layout>
      <Helmet>
        <title>Master International, Padamapur | Premier CBSE School in Odisha</title>
        <meta name="description" content="Master International, Padamapur offers comprehensive K-12 CBSE education with world-class facilities, expert faculty, and holistic development programs. Admissions open for 2026-27." />
        <meta property="og:title" content="Master International, Padamapur | Premier CBSE School" />
        <meta property="og:description" content="Inspiring Excellence — Mind, Body & Character. Join the leading CBSE school in Padamapur, Odisha." />
        <link rel="canonical" href="https://masterinternationalpadamapur.edu" />
      </Helmet>
      
      <HeroSection />
      <HighlightsSection />
      <TestimonialsSection />
      <NewsSection />
      <CTASection />
      <ImportantNewsModal />
    </Layout>
  );
};

export default Index;
