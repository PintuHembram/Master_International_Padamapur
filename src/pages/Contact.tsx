import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Helmet } from "react-helmet-async";

const contactInfo = [
  { icon: MapPin, title: "Address", content: "Master International School,\nMain Road, Padamapur,\nAnandapur, Odisha, India - 768021" },
  { icon: Phone, title: "Phone", content: "+91 70082 82967\n+91 91148 60906" },
  { icon: Mail, title: "Email", content: "info@masterinternational.edu\nadmissions@masterinternational.edu" },
  { icon: Clock, title: "Office Hours", content: "Monday - Friday: 8:00 AM - 4:00 PM\nSaturday: 8:00 AM - 1:00 PM" },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <Layout>
      <Helmet>
        <title>Contact Us | Master International, Padamapur</title>
        <meta name="description" content="Get in touch with Master International, Padamapur. Contact us for admissions, campus visits, or general inquiries. Located in Padamapur, Odisha." />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-3xl">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Get in Touch</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
              Contact Us
            </h1>
            <p className="text-white/80 text-lg">
              Have questions about admissions, academics, or want to schedule a campus visit? 
              We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">
                Reach Out to Us
              </h2>
              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                {contactInfo.map((item, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 border border-border/50">
                    <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">{item.content}</p>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-border/50">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4440.390662424938!2d86.12344007586861!3d21.23630098061673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1eaf865963e70d%3A0x258b41b1bfb7b7a0!2sMaster%20International%20School!5e1!3m2!1sen!2sus!4v1764866021350"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="School Location"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-border/50 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admissions">Admissions Inquiry</SelectItem>
                        <SelectItem value="academics">Academic Information</SelectItem>
                        <SelectItem value="visit">Campus Visit</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="mt-2"
                      rows={5}
                      placeholder="How can we help you?"
                    />
                  </div>
                  <Button type="submit" variant="gold" className="w-full" size="lg">
                    Send Message
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
