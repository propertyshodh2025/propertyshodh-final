import React, { useEffect } from "react";
import { Building2, Shield, FileText, Scale, AlertTriangle, Lock, Users, Globe, Settings, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export interface TermsPageProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function TermsPage({ className, style }: TermsPageProps) {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Header />
      
      <section className={["w-full bg-background pt-24", className].filter(Boolean).join(" ")} style={style} aria-label="Terms and Conditions">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 py-14 md:py-20">
          
          {/* Hero */}
          <header className="w-full text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1.5">
              <Scale className="h-4 w-4 text-blue-700 dark:text-blue-300" aria-hidden="true" />
              <span className="text-xs font-medium tracking-wide text-blue-700 dark:text-blue-300">Legal • Terms & Conditions</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              🏡 Property Shodh – Terms & Conditions
            </h1>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
              These terms form a legal agreement between you and Property Shodh Private Limited. 
              Please read them carefully before using our platform.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full px-3 py-1">Transparent</Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-3 py-1">Fair Terms</Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full px-3 py-1">User-Centric</Badge>
            </div>
          </header>

          {/* Terms of Use Overview */}
          <div className="mt-14 md:mt-20 grid gap-6">
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Legal Agreement
                </div>
                <CardTitle className="text-2xl md:text-3xl">
                  Terms of Use
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  These Terms of Use form a legal agreement between you ("User") and Property Shodh Private Limited ("Company") 
                  concerning the use of our website, mobile application, or any services offered by Property Shodh.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200">Important Notice</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        By accessing or using the Platform, you agree to be bound by these Terms & Conditions. 
                        If you do not agree, kindly refrain from accessing or using our services.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    The Company reserves the right to modify these Terms at any time. Any changes will be effective 
                    immediately upon posting on the Platform. Continued use of the Platform constitutes acceptance of updated Terms.
                  </p>
                  <p>
                    Additionally, Property Shodh may temporarily suspend services for reasons such as technical upgrades, 
                    maintenance, or security, without prior notice.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RERA Disclaimer */}
          <div className="mt-14 md:mt-20">
            <Card className="bg-card border border-amber-200 dark:border-amber-800 rounded-2xl bg-amber-50/50 dark:bg-amber-900/20">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  Important Disclaimer
                </div>
                <CardTitle className="text-2xl md:text-3xl text-amber-800 dark:text-amber-200">RERA Disclaimer</CardTitle>
                <CardDescription className="text-base text-amber-700 dark:text-amber-300">
                  Please read this important disclaimer regarding real estate information and RERA compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 p-6">
                  <div className="space-y-4 text-sm">
                    <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                      <strong>Disclaimer:</strong> By using or accessing this Website, you agree with the Disclaimer without any qualification or limitation. This website is only for the purpose of providing information regarding real estate projects and properties in different geographies.
                    </p>
                    
                    <div className="space-y-3 text-amber-700 dark:text-amber-300">
                      <p><strong>www.Propertyshodh.com</strong> is a real estate marketing website. The information regarding real estate projects and properties provided herein have been collected from publicly available sources, and is yet to be verified as per RERA guidelines.</p>
                      
                      <p>Further, the company has not checked the RERA* registration status of the real estate projects listed herein. The company does not make any representation in regards to the compliances done against these projects.</p>
                      
                      <p>The Websites and all its content are provided with all faults on an "as is" and "as available" basis. You agree to our terms & Conditions, Cookie and Privacy Policy.</p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-amber-300 dark:border-amber-700">
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        * RERA: Real Estate (Regulation and Development) Act, 2016
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Defined Terms */}
          <div className="mt-14 md:mt-20">
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Definitions
                </div>
                <CardTitle className="text-2xl md:text-3xl">Defined Terms</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Key terms and definitions used throughout this agreement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {[
                    {
                      term: "Agreement",
                      definition: "refers to these Terms & Conditions, including registration data, policies, and any amendments made by the Company."
                    },
                    {
                      term: "Company",
                      definition: "Property Shodh Private Limited, registered under the Companies Act, 2013, with its primary operations in Chhatrapati Sambhajinagar (Aurangabad), Maharashtra, India."
                    },
                    {
                      term: "Platform",
                      definition: "the website, mobile application, or digital services operated under the brand name \"Property Shodh.\""
                    },
                    {
                      term: "User / You",
                      definition: "includes all property seekers, sellers, agents, developers, and browsers accessing or availing services on Property Shodh."
                    },
                    {
                      term: "Registration Data",
                      definition: "personal information submitted by Users (name, email, phone number, address, etc.) during signup."
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <h4 className="font-semibold text-foreground mb-2">{item.term}</h4>
                      <p className="text-sm text-muted-foreground">{item.definition}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services */}
          <div className="mt-14 md:mt-20">
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  What We Offer
                </div>
                <CardTitle className="text-2xl md:text-3xl">Services</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Property Shodh is a prop-tech platform designed to simplify property discovery, listing, 
                  and transactions across residential, commercial, industrial, agricultural, and land properties.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.1 } },
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {[
                    {
                      icon: Users,
                      title: "User Accounts",
                      description: "Personalized accounts for buyers, sellers, agents, and developers.",
                      color: "blue"
                    },
                    {
                      icon: Building2,
                      title: "Property Listings",
                      description: "Verified property listings with detailed specifications, images, and documents.",
                      color: "green"
                    },
                    {
                      icon: Globe,
                      title: "Search & Discovery",
                      description: "Advanced filters, AI-powered recommendations, and interactive map-based search.",
                      color: "purple"
                    },
                    {
                      icon: FileText,
                      title: "Advertisements & Promotions",
                      description: "Property promotion through digital campaigns and featured listings.",
                      color: "orange"
                    },
                    {
                      icon: Shield,
                      title: "Communication",
                      description: "Messaging, emails, WhatsApp, and notifications about inquiries, updates, or promotions.",
                      color: "indigo"
                    },
                    {
                      icon: Globe,
                      title: "Multi-Language Access",
                      description: "English, Hindi, and Marathi interface for inclusivity.",
                      color: "pink"
                    }
                  ].map((service, index) => (
                    <motion.div
                      key={index}
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                      className={`p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${
                        service.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' :
                        service.color === 'green' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' :
                        service.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' :
                        service.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800' :
                        service.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800' :
                        'bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <service.icon className={`h-5 w-5 mt-0.5 ${
                          service.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          service.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          service.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                          service.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          service.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
                          'text-pink-600 dark:text-pink-400'
                        }`} aria-hidden="true" />
                        <div className="min-w-0">
                          <h4 className={`font-semibold ${
                            service.color === 'blue' ? 'text-blue-800 dark:text-blue-200' :
                            service.color === 'green' ? 'text-green-800 dark:text-green-200' :
                            service.color === 'purple' ? 'text-purple-800 dark:text-purple-200' :
                            service.color === 'orange' ? 'text-orange-800 dark:text-orange-200' :
                            service.color === 'indigo' ? 'text-indigo-800 dark:text-indigo-200' :
                            'text-pink-800 dark:text-pink-200'
                          }`}>{service.title}</h4>
                          <p className={`text-sm ${
                            service.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                            service.color === 'green' ? 'text-green-700 dark:text-green-300' :
                            service.color === 'purple' ? 'text-purple-700 dark:text-purple-300' :
                            service.color === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                            service.color === 'indigo' ? 'text-indigo-700 dark:text-indigo-300' :
                            'text-pink-700 dark:text-pink-300'
                          }`}>{service.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </div>

          {/* Key Sections */}
          <div className="mt-14 md:mt-20 grid gap-6 md:grid-cols-2">
            
            {/* Eligibility & Subscription */}
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl md:text-2xl">Eligibility & Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Eligibility</h4>
                    <ul className="space-y-1 text-green-700 dark:text-green-300 text-xs">
                      <li>• Users must be 18 years or older with legal capacity</li>
                      <li>• Minors may use under parental/guardian supervision</li>
                      <li>• Users must provide accurate registration data</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Subscription & Fees</h4>
                    <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-xs">
                      <li>• Some services may require paid subscriptions</li>
                      <li>• Subscription fees must be paid in advance</li>
                      <li>• Payments are non-refundable except at Company's discretion</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security & Privacy */}
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl md:text-2xl">Security & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">Security Measures</h4>
                    <ul className="space-y-1 text-purple-700 dark:text-purple-300 text-xs">
                      <li>• All transactions secured with encryption</li>
                      <li>• Trusted payment gateways used</li>
                      <li>• We don't store payment details (cards, CVV)</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">User Responsibility</h4>
                    <ul className="space-y-1 text-orange-700 dark:text-orange-300 text-xs">
                      <li>• Maintain confidentiality of login credentials</li>
                      <li>• Notify immediately of unauthorized use</li>
                      <li>• Responsible for all account activities</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Obligations */}
          <div className="mt-14 md:mt-20">
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  Your Responsibilities
                </div>
                <CardTitle className="text-2xl md:text-3xl">User Obligations</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  By using the Platform, you agree to follow these guidelines and responsibilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-200">✅ You Must:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mt-0.5">
                          <span className="text-green-600 dark:text-green-300 text-xs">✓</span>
                        </span>
                        <span>Provide accurate property and personal data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mt-0.5">
                          <span className="text-green-600 dark:text-green-300 text-xs">✓</span>
                        </span>
                        <span>Use Property Shodh only for lawful purposes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mt-0.5">
                          <span className="text-green-600 dark:text-green-300 text-xs">✓</span>
                        </span>
                        <span>Maintain confidentiality of your account and password</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mt-0.5">
                          <span className="text-green-600 dark:text-green-300 text-xs">✓</span>
                        </span>
                        <span>Comply with Indian laws and regulations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mt-0.5">
                          <span className="text-green-600 dark:text-green-300 text-xs">✓</span>
                        </span>
                        <span>Pay subscription/advertising fees on time</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-800 dark:text-red-200">❌ Prohibited Actions:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-800 mt-0.5">
                          <span className="text-red-600 dark:text-red-300 text-xs">✗</span>
                        </span>
                        <span>Posting false, misleading, or duplicate listings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-800 mt-0.5">
                          <span className="text-red-600 dark:text-red-300 text-xs">✗</span>
                        </span>
                        <span>Uploading defamatory, obscene, or illegal content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-800 mt-0.5">
                          <span className="text-red-600 dark:text-red-300 text-xs">✗</span>
                        </span>
                        <span>Attempting unauthorized access to systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-800 mt-0.5">
                          <span className="text-red-600 dark:text-red-300 text-xs">✗</span>
                        </span>
                        <span>Copying or scraping content without permission</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-800 mt-0.5">
                          <span className="text-red-600 dark:text-red-300 text-xs">✗</span>
                        </span>
                        <span>Spamming or sending unsolicited messages</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Warning:</strong> Violation of these rules may result in suspension, termination, or legal action.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legal & Liability */}
          <div className="mt-14 md:mt-20 grid gap-6 md:grid-cols-2">
            
            {/* Intellectual Property & Data Use */}
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl md:text-2xl">Intellectual Property & Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Our IP Rights</h4>
                    <p className="text-indigo-700 dark:text-indigo-300 text-xs">
                      All content, logos, trademarks, and brand materials are exclusive property of Property Shodh. 
                      Users get limited, revocable, non-transferable license for personal use only.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800">
                    <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-1">Data Usage</h4>
                    <p className="text-teal-700 dark:text-teal-300 text-xs">
                      We use User data for platform improvement, analytics, and marketing. Data may be shared with 
                      agents/developers to fulfill requirements. Users consent to communication via SMS, email, WhatsApp.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Limitation & Governing Law */}
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl md:text-2xl">Limitation & Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">Liability Limitation</h4>
                    <p className="text-red-700 dark:text-red-300 text-xs">
                      We act as intermediary platform. We don't guarantee transaction completion and aren't responsible 
                      for disputes between users, brokers, or developers.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Jurisdiction</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-xs">
                      These terms are governed by laws of India, with jurisdiction in 
                      Aurangabad (Chhatrapati Sambhajinagar), Maharashtra.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact & Updates */}
          <div className="mt-14 md:mt-20">
            <div className="text-center space-y-3">
              <h3 className="text-xl md:text-2xl font-extrabold">Questions about these terms?</h3>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                We believe in transparency and clarity. If you have any questions about these terms, 
                please don't hesitate to contact us.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Last updated: January 2024</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Scale className="h-4 w-4" />
                  <span>Effective immediately</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      
      <Footer />
    </div>
  );
}