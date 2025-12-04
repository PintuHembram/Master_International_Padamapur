import pintuComputer from "@/assets/pintucomputer.png";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Mail, Search } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
const departments = ["All", "Administration", "Primary", "Upr-Primary", "Computer", "Sports", "Arts", "Dance",];

const facultyData = [
  { name: "Mrs. Ahalya Behera", role: "Principal", department: "Administration", qualification: "Ph.D., M.Ed.", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop", email: "principal@masterinternational.edu" },
  { name: "Er. Pintu Hembram", role: "Computer HOD", department: "Administration", qualification: "Diploma, B.Tech.", image: pintuComputer, email: "pintuhembram@outlook.com" },
  { name: "Miss. Bhagyashree Jena", role: "Head of Primary", department: "Primary", qualification: "M.A., B.Ed.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", email: "" },
  { name: "Mr. Narayan Das", role: "PRT - English", department: "Primary", qualification: "B.A., B.Ed.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop", email: "" },
  { name: "Mr. Ranjan Kumar Sahoo", role: "Founder MIS", department: "Secondary", qualification: "M.Sc., B.Ed.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop", email: "" },
  { name: "Mr. Sujit Kumar Das", role: "TGT - Science", department: "Secondary", qualification: "M.Sc., B.Ed.", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop", email: "" },
  { name: "Miss. Tapaswini Sahoo", role: "PGT - Physics", department: "Primary", qualification: "Ph.D., M.Sc.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop", email: "physics@masterinternational.edu" },
  { name: "Miss. Barasha Rani", role: "PGT - Chemistry", department: "Dance", qualification: "M.Sc., B.Ed.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop", email: "" },
  { name: "Mr. Bikash Sethi", role: "Sports Coordinator", department: "Sports", qualification: "M.P.Ed.", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop", email: "" },
  { name: "Mrs. Ranjita Mohanty", role: "Music Teacher", department: "Arts", qualification: "M.A. Music", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop", email: "" },
];

const Faculty = () => {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  const filteredFaculty = facultyData.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.role.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "All" || member.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <Layout>
      <Helmet>
        <title>Faculty | Master International, Padamapur</title>
        <meta name="description" content="Meet our dedicated faculty at Master International. Experienced educators committed to student success across all departments." />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-3xl">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
              Expert Faculty
            </h1>
            <p className="text-white/80 text-lg">
              Our dedicated team of 50+ educators brings expertise, passion, and commitment 
              to nurturing every student's potential.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-muted/50 sticky top-20 z-30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedDept === dept
                      ? "bg-navy text-white"
                      : "bg-card border border-border hover:border-navy"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFaculty.map((member, i) => (
              <div
                key={i}
                className="bg-card rounded-xl overflow-hidden border border-border/50 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-gold text-navy text-xs font-semibold px-2 py-1 rounded">
                      {member.department}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-gold text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm mb-3">{member.qualification}</p>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-2 text-sm text-navy hover:text-gold transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Contact
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredFaculty.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No faculty members found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Faculty;
