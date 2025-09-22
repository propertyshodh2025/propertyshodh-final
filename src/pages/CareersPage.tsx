import React, { useEffect, useState } from "react";
import { Briefcase, Users, TrendingUp, Heart, MapPin, Clock, Building2, Target, Lightbulb } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export interface CareersPageProps {
  className?: string;
  style?: React.CSSProperties;
}

// Sliding City Name Component
function SlidingCityName({ className = "" }: { className?: string }) {
  const [currentName, setCurrentName] = useState(0);
  const cityNames = ["Aurangabad", "Chhatrapati Sambhaji Nagar"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentName(prev => (prev + 1) % cityNames.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentName}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ 
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="inline-block"
        >
          {cityNames[currentName]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const jobOpenings = [
  {
    title: "Real Estate Associate",
    type: "Full-time",
    location: "Aurangabad",
    department: "Sales",
    description: "Join our growing sales team and help connect people with their dream properties in Aurangabad.",
    requirements: [
      "2+ years experience in real estate or sales",
      "Strong communication skills in English and Hindi/Marathi",
      "Local knowledge of Aurangabad property market",
      "Customer-focused approach"
    ],
    accent: "sales"
  },
  {
    title: "Property Verification Specialist",
    type: "Full-time", 
    location: "Aurangabad",
    department: "Operations",
    description: "Ensure the accuracy and quality of our property listings through detailed verification processes.",
    requirements: [
      "Experience in property documentation",
      "Attention to detail and analytical mindset",
      "Ability to work independently in the field",
      "Valid driving license preferred"
    ],
    accent: "ops"
  },
  {
    title: "Digital Marketing Specialist",
    type: "Full-time",
    location: "Remote/Aurangabad",
    department: "Marketing",
    description: "Drive growth through creative digital marketing strategies and community engagement.",
    requirements: [
      "2+ years in digital marketing",
      "Experience with social media, SEO, and content marketing",
      "Creative thinking and data-driven approach",
      "Understanding of real estate market preferred"
    ],
    accent: "marketing"
  },
  {
    title: "Software Developer",
    type: "Full-time",
    location: "Remote/Aurangabad",
    department: "Technology",
    description: "Help build and enhance our platform to serve the real estate needs of Aurangabad better.",
    requirements: [
      "3+ years experience in web development",
      "Proficiency in React, TypeScript, Node.js",
      "Experience with databases and API development",
      "Problem-solving mindset and attention to quality"
    ],
    accent: "tech"
  }
];

const benefits = [
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive health insurance and wellness programs for you and your family.",
    color: "red"
  },
  {
    icon: TrendingUp,
    title: "Growth Opportunities",
    description: "Clear career progression paths with regular skill development and training programs.",
    color: "green"
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description: "Work-life balance with flexible working hours and remote work options.",
    color: "blue"
  },
  {
    icon: Users,
    title: "Team Culture",
    description: "Collaborative environment where every voice matters and innovation is encouraged.",
    color: "purple"
  }
];

const values = [
  {
    icon: Target,
    title: "Transparency First",
    description: "We believe in honest communication and transparent business practices in everything we do."
  },
  {
    icon: Building2,
    title: "Customer-Centric",
    description: "Every decision we make puts our customers' needs and experience at the center."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We constantly seek better ways to serve our community through technology and creativity."
  },
  {
    icon: Heart,
    title: "Community Impact",
    description: "We're committed to making a positive difference in Aurangabad's real estate landscape."
  }
];

export default function CareersPage({ className, style }: CareersPageProps) {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Header />
      
      <section className={["w-full bg-background pt-24", className].filter(Boolean).join(" ")} style={style} aria-label="Careers at PropertyShodh">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 py-14 md:py-20">
          {/* Hero */}
          <header className="w-full text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1.5">
              <Briefcase className="h-4 w-4 text-blue-700 dark:text-blue-300" aria-hidden="true" />
              <span className="text-xs font-medium tracking-wide text-blue-700 dark:text-blue-300">Join PropertyShodh • Shape the future of real estate in <SlidingCityName /></span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Build your career with <SlidingCityName />'s most trusted property platform
            </h1>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
              Be part of a mission-driven team that's revolutionizing real estate discovery. 
              We're looking for passionate individuals who want to make property search transparent, 
              fast, and accessible for everyone.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full px-3 py-1">Growing Team</Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-3 py-1">Innovation Focus</Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full px-3 py-1">Local Impact</Badge>
            </div>
          </header>

          {/* Why Join Us */}
          <div className="mt-14 md:mt-20">
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  Why PropertyShodh is different
                </div>
                <CardTitle className="text-2xl md:text-3xl">More than just a job—a chance to build something meaningful</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  We're not just another tech company. We're a team of builders, dreamers, and problem-solvers 
                  committed to transforming how people find homes in <SlidingCityName />.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">Mission-Driven Work</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Every line of code, every customer interaction, and every strategic decision 
                          contributes to making property search better for thousands of families.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400" aria-hidden="true" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-green-800 dark:text-green-200">Small Team, Big Impact</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your contributions matter. In our lean team, you'll have ownership, visibility, 
                          and the opportunity to shape the direction of the company.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Our Values */}
          <div className="mt-14 md:mt-20">
            <div className="mb-6 md:mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold">Our Values</h2>
              <p className="mt-2 text-muted-foreground text-base">
                The principles that guide everything we do at PropertyShodh.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <Card key={index} className="bg-card border border-border rounded-2xl h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-14 md:mt-20">
            <div className="mb-6 md:mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold">Why You'll Love Working Here</h2>
              <p className="mt-2 text-muted-foreground text-base">
                We believe in taking care of our team so they can take care of our customers.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-card border border-border rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        benefit.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                        benefit.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        benefit.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        <benefit.icon className={`w-6 h-6 ${
                          benefit.color === 'red' ? 'text-red-600 dark:text-red-400' :
                          benefit.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          benefit.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Job Openings */}
          <div className="mt-14 md:mt-20">
            <div className="mb-6 md:mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold">Open Positions</h2>
              <p className="mt-2 text-muted-foreground text-base">
                Ready to make an impact? Check out our current openings and find your perfect fit.
              </p>
            </div>

            <div className="grid gap-6">
              {jobOpenings.map((job, index) => (
                <Card key={index} className="bg-card border border-border rounded-2xl hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl md:text-2xl">{job.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <Badge variant="secondary" className="rounded-full">
                            {job.department}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-base">
                      {job.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-semibold mb-3">Requirements:</h4>
                      <ul className="space-y-2">
                        {job.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start gap-2">
                            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                              <Target className="h-3 w-3 text-green-600 dark:text-green-300" aria-hidden="true" />
                            </span>
                            <p className="text-sm text-foreground">{req}</p>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 pt-4 border-t border-border">
                        <Button 
                          className="w-full md:w-auto"
                          onClick={() => window.open('mailto:careers@propertyshodh.com?subject=Application for ' + job.title, '_blank')}
                        >
                          Apply for this position
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-14 md:mt-20">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-border rounded-2xl">
              <CardContent className="p-8 md:p-12 text-center">
                <h3 className="text-2xl md:text-3xl font-extrabold mb-4">
                  Don't see the right fit? 
                </h3>
                <p className="text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
                  We're always looking for talented individuals who share our passion for making 
                  real estate transparent and accessible. Send us your resume and tell us how 
                  you'd like to contribute to PropertyShodh's mission.
                </p>
                <Button 
                  size="lg"
                  onClick={() => window.open('mailto:careers@propertyshodh.com?subject=General Application', '_blank')}
                >
                  Get in Touch
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}