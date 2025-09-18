import React, { useState, useEffect } from "react";
import { Shield, Database, Lock, Eye, UserCheck, Globe, Phone, Mail, MapPin, Calendar, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PrivacyPageProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function PrivacyPage({ className, style }: PrivacyPageProps) {
  const [contactNumber, setContactNumber] = useState<string>('');
  const { toast } = useToast();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchContactNumber = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('central_contact_number')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching contact number:', error);
        } else if (data && data.central_contact_number) {
          setContactNumber(data.central_contact_number);
        }
      } catch (error) {
        console.error('Error fetching contact number:', error);
      }
    };

    fetchContactNumber();
  }, []);

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Header />
      
      <section className={["w-full bg-background pt-24", className].filter(Boolean).join(" ")} style={style} aria-label="Privacy Policy">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 py-14 md:py-20">
          
          {/* Hero */}
          <header className="w-full text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1.5">
              <Shield className="h-4 w-4 text-blue-700 dark:text-blue-300" aria-hidden="true" />
              <span className="text-xs font-medium tracking-wide text-blue-700 dark:text-blue-300">Privacy • Data Protection</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              🛡️ PropertyShodh – Privacy Policy
            </h1>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
              We are committed to protecting your privacy and personal information. 
              This policy explains how we collect, use, and safeguard your data.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full px-3 py-1">Secure</Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-3 py-1">Transparent</Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full px-3 py-1">GDPR Ready</Badge>
            </div>

            {/* Effective Date */}
            <div className="mx-auto max-w-3xl mt-6">
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Effective Date: 15-August-2025
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Introduction */}
          <div className="mt-14 md:mt-20">
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Our Commitment
                </div>
                <CardTitle className="text-2xl md:text-3xl">How We Protect Your Privacy</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  This Privacy Policy explains how Property Shodh Private Limited ("Company," "we," "our," or "us") 
                  collects, uses, stores, and protects your personal information when you access or use our Platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Your Consent</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        By using PropertyShodh, you agree to the practices described in this Policy. 
                        We believe in transparency and give you control over your personal data.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Information We Collect */}
          <div className="mt-14 md:mt-20">
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Database className="h-4 w-4" aria-hidden="true" />
                  Data Collection
                </div>
                <CardTitle className="text-2xl md:text-3xl">1. Information We Collect</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  We may collect the following categories of information to provide and improve our services.
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
                  className="grid gap-4"
                >
                  {[
                    {
                      icon: UserCheck,
                      title: "Personal Information",
                      description: "Name, phone number, email address, password, residential address, profile photo, and government ID (if required for verification).",
                      color: "blue"
                    },
                    {
                      icon: Globe,
                      title: "Property Information",
                      description: "Details of properties you list, such as location, price, documents, images, and descriptions.",
                      color: "green"
                    },
                    {
                      icon: Eye,
                      title: "Usage Data",
                      description: "Log data, device type, browser type, IP address, location (if enabled), and activity on the Platform.",
                      color: "purple"
                    },
                    {
                      icon: Lock,
                      title: "Payment Information",
                      description: "When you purchase subscriptions or promotions. (Note: We do not store your debit/credit card details. Transactions are processed securely via trusted payment gateways.)",
                      color: "orange"
                    },
                    {
                      icon: Mail,
                      title: "Communications",
                      description: "Messages, feedback, inquiries, and responses through the Platform, SMS, email, or WhatsApp.",
                      color: "indigo"
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                      className={`p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${
                        item.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' :
                        item.color === 'green' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' :
                        item.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' :
                        item.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800' :
                        'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <item.icon className={`h-5 w-5 mt-0.5 ${
                          item.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          item.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          item.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                          item.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          'text-indigo-600 dark:text-indigo-400'
                        }`} aria-hidden="true" />
                        <div className="min-w-0">
                          <h4 className={`font-semibold ${
                            item.color === 'blue' ? 'text-blue-800 dark:text-blue-200' :
                            item.color === 'green' ? 'text-green-800 dark:text-green-200' :
                            item.color === 'purple' ? 'text-purple-800 dark:text-purple-200' :
                            item.color === 'orange' ? 'text-orange-800 dark:text-orange-200' :
                            'text-indigo-800 dark:text-indigo-200'
                          }`}>{item.title}</h4>
                          <p className={`text-sm ${
                            item.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                            item.color === 'green' ? 'text-green-700 dark:text-green-300' :
                            item.color === 'purple' ? 'text-purple-700 dark:text-purple-300' :
                            item.color === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                            'text-indigo-700 dark:text-indigo-300'
                          }`}>{item.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </div>

          {/* How We Use Information & Sharing */}
          <div className="mt-14 md:mt-20 grid gap-6 md:grid-cols-2">
            
            {/* How We Use Your Information */}
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl md:text-2xl">2. How We Use Your Information</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  We use the collected information to provide and improve our services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mt-0.5">
                      <span className="text-green-600 dark:text-green-300 text-xs">•</span>
                    </span>
                    <span>Create and manage user accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mt-0.5">
                      <span className="text-green-600 dark:text-green-300 text-xs">•</span>
                    </span>
                    <span>Enable property listings, searches, and recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mt-0.5">
                      <span className="text-green-600 dark:text-green-300 text-xs">•</span>
                    </span>
                    <span>Share your property details with relevant buyers, sellers, or agents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mt-0.5">
                      <span className="text-green-600 dark:text-green-300 text-xs">•</span>
                    </span>
                    <span>Improve our services through analytics and feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mt-0.5">
                      <span className="text-green-600 dark:text-green-300 text-xs">•</span>
                    </span>
                    <span>Send updates, promotional content, or notifications (opt-out available)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-800 mt-0.5">
                      <span className="text-green-600 dark:text-green-300 text-xs">•</span>
                    </span>
                    <span>Detect, prevent, and address fraud, misuse, or technical issues</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Sharing of Information */}
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl md:text-2xl">3. Sharing of Information</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  We may share your information in the following circumstances.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Business Partners</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-xs">
                      Agents, Developers, and Sellers – To help fulfill property requirements.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">Service Providers</h4>
                    <p className="text-purple-700 dark:text-purple-300 text-xs">
                      For hosting, payment processing, SMS/WhatsApp/email delivery, or analytics.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">Legal Requirements</h4>
                    <p className="text-orange-700 dark:text-orange-300 text-xs">
                      Legal Authorities – If required under law, regulation, or court order.
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>Important:</strong> We do not sell or rent your personal information to third parties for commercial gain.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Security & User Rights */}
          <div className="mt-14 md:mt-20 grid gap-6 md:grid-cols-2">
            
            {/* Data Security */}
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl md:text-2xl">4. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400" />
                    <span>All personal data is protected with encryption and secure servers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                    <span>Sensitive details (like passwords) are stored in encrypted format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 mt-0.5 text-purple-600 dark:text-purple-400" />
                    <span>Payment transactions handled through trusted gateways</span>
                  </li>
                </ul>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Note:</strong> Despite strong measures, no digital platform is 100% secure. 
                    Users are advised to keep login credentials confidential.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* User Rights */}
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl md:text-2xl">5. User Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-3">
                  As a User of PropertyShodh, you have the right to:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Eye className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                    <span>Access and review your personal information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400" />
                    <span>Correct or update inaccurate data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="h-4 w-4 mt-0.5 text-red-600 dark:text-red-400" />
                    <span>Request deletion of your account and personal data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 text-purple-600 dark:text-purple-400" />
                    <span>Opt out of promotional messages at any time</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Additional Sections */}
          <div className="mt-14 md:mt-20">
            <div className="grid gap-6 md:grid-cols-3">
              
              {/* Cookies & Tracking */}
              <Card className="bg-card border border-border rounded-2xl">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg">6. Cookies & Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Our Platform may use cookies and similar technologies to:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Improve user experience</li>
                    <li>• Remember login sessions</li>
                    <li>• Provide personalized recommendations</li>
                    <li>• Track website performance</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Data Retention */}
              <Card className="bg-card border border-border rounded-2xl">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg">7. Data Retention</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">We retain your personal information:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• As long as your account is active, or</li>
                    <li>• As needed to provide services</li>
                    <li>• To resolve disputes</li>
                    <li>• To comply with legal obligations</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Children's Privacy */}
              <Card className="bg-card border border-border rounded-2xl">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg">9. Children's Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Our services are intended for users 18 years and above. 
                      Minors may use the Platform only under parental/guardian supervision.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-14 md:mt-20">
            <Card className="bg-card border border-border rounded-2xl">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Get In Touch
                </div>
                <CardTitle className="text-2xl md:text-3xl">11. Contact Us</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  For any queries, concerns, or requests related to this Privacy Policy, please contact:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">Address</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Property Shodh Private Limited<br />
                          Chhatrapati Sambhajinagar (Aurangabad)<br />
                          Maharashtra, India
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400" aria-hidden="true" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-green-800 dark:text-green-200">Email</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          info@propertyshodh.com
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">Phone</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          {contactNumber || '+91 98765 43210'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Updates & Final Note */}
          <div className="mt-14 md:mt-20">
            <div className="text-center space-y-6">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-xl md:text-2xl font-extrabold mb-3">10. Updates to Privacy Policy</h3>
                  <p className="text-muted-foreground mb-4">
                    We may update this Privacy Policy from time to time. Updated versions will be posted on the Platform, 
                    with the "Effective Date" reflecting the latest revision.
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900 px-4 py-2">
                    <Shield className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Continued use constitutes acceptance of revised Policy
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <p className="mx-auto max-w-2xl text-muted-foreground">
                ✅ This Privacy Policy ensures compliance, builds trust, and complements your Terms & Conditions.
              </p>
            </div>
          </div>

        </div>
      </section>
      
      <Footer />
    </div>
  );
}