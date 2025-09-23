import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, Facebook, Instagram, Linkedin, Twitter, Youtube, ExternalLink, Send, Clock, Building2, Users, Heart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSimpleCentralContact, getContactWithFallback } from '@/hooks/useSimpleCentralContact';

export interface ContactSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

// Sliding City Name Component (reused from AboutPage)
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


const socialMediaPlatforms = [
  {
    name: 'Facebook',
    icon: Facebook,
    urlKey: 'facebook_url' as keyof SiteSettings,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Follow us on Facebook for updates and community discussions'
  },
  {
    name: 'Instagram', 
    icon: Instagram,
    urlKey: 'instagram_url' as keyof SiteSettings,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    description: 'Check out our latest property photos and stories'
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    urlKey: 'linkedin_url' as keyof SiteSettings,
    color: 'bg-blue-700 hover:bg-blue-800',
    description: 'Connect with us professionally on LinkedIn'
  },
  {
    name: 'Twitter',
    icon: Twitter,
    urlKey: 'twitter_url' as keyof SiteSettings,
    color: 'bg-blue-400 hover:bg-blue-500',
    description: 'Follow us for quick updates and market insights'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    urlKey: 'youtube_url' as keyof SiteSettings,
    color: 'bg-red-600 hover:bg-red-700',
    description: 'Watch property tours and educational content'
  }
];

export default function ContactSection({ className, style }: ContactSectionProps) {
  const { contactNumber, isLoading } = useSimpleCentralContact();
  
  console.log('📞 CONTACT PAGE: Contact number:', contactNumber, 'Loading:', isLoading);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just simulate a submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Header />
      
      <section className={["w-full bg-background pt-24", className].filter(Boolean).join(" ")} style={style} aria-label="Contact PropertyShodh">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 py-14 md:py-20">
        {/* Hero */}
        <header className="w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900 px-3 py-1.5">
            <MessageCircle className="h-4 w-4 text-green-700 dark:text-green-300" aria-hidden="true" />
            <span className="text-xs font-medium tracking-wide text-green-700 dark:text-green-300">Contact Us • Get in Touch</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Connect with PropertyShodh in <SlidingCityName />
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
            Ready to find your dream property? Have questions about our services? 
            We're here to help you every step of the way.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-3 py-1">Quick Response</Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full px-3 py-1">Expert Guidance</Badge>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full px-3 py-1">Local Knowledge</Badge>
          </div>
        </header>

        {/* Contact Information Cards */}
        <div className="mt-14 md:mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Address Card */}
          <Card className="group bg-card border border-border rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">Visit Our Office</CardTitle>
              <CardDescription className="text-muted-foreground">
                Come visit us for a personal consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">PropertyShodh Office</p>
                <p className="text-muted-foreground leading-relaxed">
                  Dargah, A-3, Sagar Apartment,<br />
                  Below Sangram Nagar Flyover<br />
                  Near Shahnoormiya Dargah Chowk,<br />
                  Beed Bypass Rd,<br />
                  Chhatrapati Sambhajinagar (Aurangabad),<br />
                  Maharashtra 431001
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
              </div>
            </CardFooter>
          </Card>

          {/* Phone Card */}
          <Card className="group bg-card border border-border rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Phone className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">Call or WhatsApp</CardTitle>
              <CardDescription className="text-muted-foreground">
                Speak directly with our property experts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {isLoading ? 'Loading...' : getContactWithFallback(contactNumber)}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open(`tel:${getContactWithFallback(contactNumber)}`, '_self')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`https://wa.me/${getContactWithFallback(contactNumber).replace(/[^\d]/g, '')}`, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Card */}
          <Card className="group bg-card border border-border rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-1">
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Mail className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">Email Us</CardTitle>
              <CardDescription className="text-muted-foreground">
                Send us your queries anytime
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-lg font-medium text-purple-600 dark:text-purple-400">
                  info@propertyshodh.com
                </div>
                <Button 
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => window.open('mailto:info@propertyshodh.com', '_self')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Response within 24 hours</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Social Media Section - Temporarily hidden until database columns are added */}
        {false && (
          <div className="mt-14 md:mt-20">
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  Stay Connected
                </div>
                <CardTitle className="text-2xl md:text-3xl">Social Media Coming Soon</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Social media integration will be available after database setup is complete.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Contact Form */}
        <div className="mt-14 md:mt-20">
          <Card className="bg-card border border-border rounded-2xl">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Send className="h-4 w-4" aria-hidden="true" />
                Get in Touch
              </div>
              <CardTitle className="text-2xl md:text-3xl">Send Us a Message</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Have a specific question or need personalized assistance? Fill out the form below and we'll get back to you shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What is this regarding?"
                      value={contactForm.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more about your requirements or questions..."
                    className="min-h-[120px]"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Us */}
        <div className="mt-14 md:mt-20">
          <Card className="bg-card border border-border rounded-2xl">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Why PropertyShodh?
              </div>
              <CardTitle className="text-2xl md:text-3xl">Your Trusted Property Partner in <SlidingCityName /></CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                We're not just another property portal. We're your local property experts, committed to making your property journey smooth and successful.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">Local Expertise</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Deep knowledge of <SlidingCityName />'s neighborhoods, pricing trends, and market dynamics.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Personal Service</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Dedicated support from our team of experienced property consultants who understand your needs.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200">Verified Properties</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        All listings are thoroughly verified for accuracy, legal compliance, and current availability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
    
    <Footer />
  </div>
  );
}