import misLogo from "@/assets/mis-logo.png";
import { ArrowRight, Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

const quickLinks = [
  { name: "UDISE+", href: "https://udiseplus.gov.in/#/en/home" },
  { name: "RTE-PARADARSHI", href: "https://rteparadarshi.odisha.gov.in/odisha" },
  { name: "CBSE", href: "https://www.cbse.gov.in/" },
  { name: "About Us", href: "/about" },
  { name: "Faculty", href: "/faculty" },
  { name: "Contact", href: "/contact" },
];

const academicLinks = [
  { name: "Primary School", href: "/academics#primary" },
  { name: "Middle School", href: "/academics#middle" },
  { name: "Secondary School", href: "/academics#secondary" },
  { name: "Senior Secondary", href: "/academics#senior" },
  { name: "Admit Cards", href: "/admit-cards" },
  { name: "Curriculum", href: "/academics#curriculum" },
  { name: "Results", href: "/results" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms of Service", href: "/terms-of-service" },
  { name: "Disclaimer", href: "/disclaimer" },
  { name: "Child Safety Policy", href: "/child-safety-policy" },
  { name: "Accessibility", href: "/accessibility" },
  { name: "Refund Policy", href: "/refund-policy" },
  { name: "Grievance Redressal", href: "/grievance-redressal" },
];

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/MISchool2014", label: "Facebook" },
  { icon: Twitter, href: "https://x.com/internatio50902", label: "Twitter" },
  { icon: Instagram, href: "https://www.instagram.com/MISchool2014", label: "Instagram" },
  { icon: Youtube, href: "https://www.youtube.com/@MASTERINTERNATIONALSCHOOL", label: "YouTube" },
];

export function Footer() {
  const [visitorCount, setVisitorCount] = useState("Loading...");
  const visitRequestStarted = useRef(false);

  useEffect(() => {
    if (visitRequestStarted.current) {
      return;
    }
    visitRequestStarted.current = true;

    const visitKey = "mis-visitor-counted";
    const countKey = "mis-visitor-count";

    const showCachedCount = () => {
      const cachedCount = Number(sessionStorage.getItem(countKey));
      if (Number.isSafeInteger(cachedCount) && cachedCount >= 0) {
        setVisitorCount(cachedCount.toLocaleString());
        return true;
      }
      return false;
    };

    try {
      if (sessionStorage.getItem(visitKey) === "true" && showCachedCount()) {
        return;
      }
      sessionStorage.setItem(visitKey, "true");
    } catch (error) {
      console.error("Unable to access visitor counter session storage.", error);
      setVisitorCount("Unavailable");
      return;
    }

    const recordVisit = async () => {
      if (!supabase) {
        console.error("Visitor counter is unavailable because Supabase is not configured.");
        setVisitorCount("Unavailable");
        return;
      }

      try {
        const { data, error } = await supabase.rpc("record_website_visit");
        if (error) {
          console.error("Unable to record website visit.", error);
          sessionStorage.removeItem(visitKey);
          setVisitorCount("Unavailable");
          return;
        }

        const count = Number(data);
        if (!Number.isSafeInteger(count) || count < 0) {
          console.error("The visitor counter returned an invalid count.", data);
          setVisitorCount("Unavailable");
          return;
        }

        try {
          sessionStorage.setItem(countKey, String(count));
        } catch (storageError) {
          console.error("Unable to cache visitor count for this session.", storageError);
        }
        setVisitorCount(count.toLocaleString());
      } catch (error) {
        console.error("Unable to record website visit.", error);
        try {
          sessionStorage.removeItem(visitKey);
        } catch (storageError) {
          console.error("Unable to reset visitor counter session storage.", storageError);
        }
        setVisitorCount("Unavailable");
      }
    };

    void recordVisit();
  }, []);

  return (
    <footer className="bg-navy text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-12">
          {/* School Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src={misLogo} 
                  alt="Master International School Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-display text-lg font-bold block leading-tight">
                  Master International
                </span>
                <span className="text-xs text-white/70">Padamapur • CBSE</span>
              </div>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Inspiring Excellence — Mind, Body & Character. Providing quality education 
              aligned with CBSE curriculum since our establishment.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-navy transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-gold transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Academics */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Academics</h3>
            <ul className="space-y-3">
              {academicLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-gold transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Legal & Policies</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-gold transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <span className="text-white/70 text-sm">
                  Master International School,<br />
                  Gate Chak, Padamapur, Anandapur<br />
                  Odisha, India - 768021
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <a href="tel:+919876543210" className="text-white/70 text-sm hover:text-gold transition-colors">
                  +91 70082 82967, +91 91148 60906
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <a href="mailto:info@masterinternationalpadamapur.edu" className="text-white/70 text-sm hover:text-gold transition-colors break-all">
                  mispadamapur@hembram.onmicrosoft.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm text-center md:text-left">
              © {new Date().getFullYear()} <a href="https://hembramit.blogspot.com/" className="hover:text-gold transition-colors">Hembram IT Solutions Pvt. Ltd</a> . All rights reserved.
            </p>
            <p className="text-white/50 text-sm" aria-live="polite">
              Visitors: <span className="text-white/80 font-medium">{visitorCount}</span>
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy-policy" className="text-white/50 hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-white/50 hover:text-gold transition-colors">
                Terms of Service
              </Link>
              <Link to="/admin/login" className="text-white/50 hover:text-gold transition-colors">
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
