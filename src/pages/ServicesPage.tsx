import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  ArrowLeft, 
  Home, 
  Calculator, 
  Scale, 
  Palette, 
  Building,
  Phone,
  Mail,
  CheckCircle,
  Star,
  Users,
  Clock,
  Award,
  TrendingUp,
  Shield,
  Briefcase
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('home-loans');

  // Extract service from URL params or default to home-loans
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/loans')) setActiveSection('home-loans');
    else if (path.includes('/valuation')) setActiveSection('property-valuation');
    else if (path.includes('/legal')) setActiveSection('legal-services');
    else if (path.includes('/interior')) setActiveSection('interior-design');
    else if (path.includes('/management')) setActiveSection('property-management');
  }, [location]);

  const services = [
    {
      id: 'home-loans',
      title: 'Home Loans',
      subtitle: 'Get the best home loan deals in Aurangabad',
      icon: Home,
      color: 'bg-blue-500',
      features: [
        'Competitive interest rates starting from 6.5% p.a.',
        'Quick loan approval within 7-14 days',
        'Up to 90% loan-to-value ratio',
        'Flexible repayment options',
        'Zero processing fees for limited time'
      ],
      process: [
        'Submit basic documents online',
        'Property evaluation by our experts',
        'Bank liaison and documentation',
        'Loan approval and disbursement'
      ],
      benefits: [
        'Save time with our streamlined process',
        'Compare offers from 15+ leading banks',
        'Expert guidance throughout the journey',
        'Post-disbursement support'
      ]
    },
    {
      id: 'property-valuation',
      title: 'Property Valuation',
      subtitle: 'Professional property assessment and market analysis',
      icon: Calculator,
      color: 'bg-green-500',
      features: [
        'Government-approved valuers',
        'Detailed market analysis reports',
        'Legal compliance verification',
        'Investment potential assessment',
        'Insurance valuation services'
      ],
      process: [
        'Site inspection by certified valuers',
        'Market research and analysis',
        'Detailed valuation report generation',
        'Legal documentation verification'
      ],
      benefits: [
        'Accurate property pricing',
        'Investment decision support',
        'Legal compliance assurance',
        'Insurance claim support'
      ]
    },
    {
      id: 'legal-services',
      title: 'Legal Services',
      subtitle: 'Complete legal support for property transactions',
      icon: Scale,
      color: 'bg-purple-500',
      features: [
        'Title verification and due diligence',
        'Property registration assistance',
        'Legal documentation review',
        'Dispute resolution support',
        'Regulatory compliance guidance'
      ],
      process: [
        'Document verification and analysis',
        'Legal clearance certification',
        'Registration and documentation',
        'Post-transaction legal support'
      ],
      benefits: [
        'Risk-free property transactions',
        'Expert legal guidance',
        'Complete documentation support',
        'Ongoing legal consultation'
      ]
    },
    {
      id: 'interior-design',
      title: 'Interior Design',
      subtitle: 'Transform your space with professional design solutions',
      icon: Palette,
      color: 'bg-pink-500',
      features: [
        '3D visualization and planning',
        'Customized design solutions',
        'Premium quality materials',
        'Turnkey project execution',
        'Post-completion maintenance'
      ],
      process: [
        'Space assessment and consultation',
        '3D design and visualization',
        'Material selection and procurement',
        'Professional installation and finishing'
      ],
      benefits: [
        'Personalized design solutions',
        'Quality craftsmanship',
        'Timely project completion',
        'Warranty and support'
      ]
    },
    {
      id: 'property-management',
      title: 'Property Management',
      subtitle: 'Comprehensive property management solutions',
      icon: Building,
      color: 'bg-orange-500',
      features: [
        'Tenant screening and management',
        'Rent collection and accounting',
        'Maintenance and repairs coordination',
        'Legal compliance management',
        'Investment performance tracking'
      ],
      process: [
        'Property assessment and listing',
        'Tenant acquisition and screening',
        'Ongoing management and support',
        'Regular reporting and updates'
      ],
      benefits: [
        'Hassle-free property ownership',
        'Maximized rental income',
        'Professional tenant management',
        'Comprehensive reporting'
      ]
    }
  ];

  const currentService = services.find(service => service.id === activeSection) || services[0];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
          <div className="absolute inset-0 opacity-30">
            <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="serviceGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path d="M0,100 Q250,50 500,80 T1000,60 L1000,0 L0,0 Z" fill="url(#serviceGradient1)" />
            </svg>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Back Button */}
              <div className="flex justify-start mb-8">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="bg-background/40 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Our Services
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light">
                  Complete real estate solutions tailored for Aurangabad
                </p>
              </div>

              {/* Service Navigation */}
              <div className="flex flex-wrap justify-center gap-2 mt-12">
                {services.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <Button
                      key={service.id}
                      variant={activeSection === service.id ? "default" : "outline"}
                      onClick={() => scrollToSection(service.id)}
                      className={`rounded-xl transition-all duration-300 ${
                        activeSection === service.id 
                          ? 'bg-primary text-primary-foreground shadow-lg' 
                          : 'bg-background/40 backdrop-blur-sm border border-white/20 hover:border-white/40'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {service.title}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Services Content */}
        <div className="container mx-auto px-4 py-16 space-y-32">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            const isEven = index % 2 === 0;
            
            return (
              <section 
                key={service.id} 
                id={service.id}
                className="scroll-mt-24"
              >
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-16 items-center`}>
                  
                  {/* Service Info */}
                  <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{service.title}</h2>
                          <p className="text-lg text-muted-foreground">{service.subtitle}</p>
                        </div>
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            Key Features
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {service.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Our Process
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ol className="space-y-2">
                            {service.process.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm">
                                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {idx + 1}
                                </div>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Benefits */}
                    <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border border-border/50">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Award className="w-5 h-5 text-primary" />
                          Why Choose Us
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {service.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <TrendingUp className="w-5 h-5 text-green-500" />
                              <span className="text-sm">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* CTA Section */}
                    <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                      <div className="text-center space-y-4">
                        <h3 className="text-xl font-semibold">Ready to get started with {service.title}?</h3>
                        <p className="text-muted-foreground">
                          Contact our experts for a free consultation and personalized solution.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button
                            onClick={() => {
                              if (!user) {
                                navigate('/dashboard');
                              } else {
                                // Navigate to contact form or dashboard
                                navigate('/dashboard?tab=contact');
                              }
                            }}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Get Free Consultation
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => navigate('/contact')}
                            className="bg-background/40 backdrop-blur-sm border border-border hover:border-primary/50 rounded-xl px-8 py-3 transition-all duration-300"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Send Inquiry
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Visual/Stats */}
                  <div className="flex-1 max-w-lg">
                    <Card className="bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-sm border border-border/50 shadow-xl">
                      <CardHeader className="text-center">
                        <div className={`w-20 h-20 ${service.color} rounded-3xl flex items-center justify-center mx-auto shadow-lg`}>
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                        <CardTitle className="text-2xl">{service.title} Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-background/40 rounded-xl">
                            <div className="text-2xl font-bold text-primary">500+</div>
                            <div className="text-sm text-muted-foreground">Happy Clients</div>
                          </div>
                          <div className="text-center p-4 bg-background/40 rounded-xl">
                            <div className="text-2xl font-bold text-green-600">98%</div>
                            <div className="text-sm text-muted-foreground">Success Rate</div>
                          </div>
                          <div className="text-center p-4 bg-background/40 rounded-xl">
                            <div className="text-2xl font-bold text-blue-600">24/7</div>
                            <div className="text-sm text-muted-foreground">Support</div>
                          </div>
                          <div className="text-center p-4 bg-background/40 rounded-xl">
                            <div className="text-2xl font-bold text-purple-600">5★</div>
                            <div className="text-sm text-muted-foreground">Rating</div>
                          </div>
                        </div>

                        {/* Expert Team */}
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Our Expert Team
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-background/40 rounded-lg">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">Certified Professionals</div>
                                <div className="text-xs text-muted-foreground">Licensed & Experienced</div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                10+ Years
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-background/40 rounded-lg">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Shield className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">Trusted Partners</div>
                                <div className="text-xs text-muted-foreground">Government Approved</div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Need Help Choosing the Right Service?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our experts are here to guide you through every step of your real estate journey. 
                Get personalized recommendations based on your specific needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/contact')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Schedule Free Consultation
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/')}
                  className="bg-background/40 backdrop-blur-sm border border-border hover:border-primary/50 rounded-xl px-8 py-4 transition-all duration-300"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Browse Properties
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">2000+</div>
                  <div className="text-sm text-muted-foreground">Properties Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">₹500Cr+</div>
                  <div className="text-sm text-muted-foreground">Transactions Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">50+</div>
                  <div className="text-sm text-muted-foreground">Expert Partners</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">5</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServicesPage;
