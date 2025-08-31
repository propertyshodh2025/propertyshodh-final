import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronRight, Play, Users, Building, BarChart3, Shield, Search, MessageSquare, Phone, Heart, Share2, Map, Eye, Settings, Filter, Star, TrendingUp, Globe, Lock, Database, Zap, Bell, FileText, Clock, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PresentationPage() {
  const [currentSection, setCurrentSection] = useState('overview');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingVisualPDF, setIsGeneratingVisualPDF] = useState(false);
  const navigate = useNavigate();

  const generateVisualPDF = async () => {
    setIsGeneratingVisualPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let isFirstPage = true;

      // Title page
      pdf.setFontSize(24);
      pdf.text('Real Estate Platform', pageWidth / 2, 30, { align: 'center' });
      pdf.setFontSize(16);
      pdf.text('Visual Presentation Overview', pageWidth / 2, 45, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 60, { align: 'center' });

      // Iterate through each section and capture it
      for (const section of presentationSections) {
        // Switch to the section first
        setCurrentSection(section.id);
        
        // Wait a bit for the content to render
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Find the main content area
        const contentElement = document.querySelector(`[data-section="${section.id}"]`) || 
                              document.querySelector('.tab-content') ||
                              document.getElementById('main-content');

        if (contentElement) {
          try {
            // Capture the section
            const canvas = await html2canvas(contentElement as HTMLElement, {
              scale: 1,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              width: contentElement.scrollWidth,
              height: contentElement.scrollHeight
            });

            // Add new page (except for first)
            if (!isFirstPage) {
              pdf.addPage();
            } else {
              pdf.addPage(); // Add page after title
              isFirstPage = false;
            }

            // Add section title
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text(section.title, 20, 15);

            // Calculate dimensions to fit the page
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // If image is too tall, scale it down
            const maxHeight = pageHeight - 30;
            const finalWidth = imgHeight > maxHeight ? (canvas.width * maxHeight) / canvas.height : imgWidth;
            const finalHeight = imgHeight > maxHeight ? maxHeight : imgHeight;

            // Add the image
            pdf.addImage(
              canvas.toDataURL('image/png'),
              'PNG',
              10,
              25,
              finalWidth,
              finalHeight
            );
          } catch (error) {
            console.error(`Error capturing section ${section.id}:`, error);
            // Add a text fallback
            pdf.setFontSize(12);
            pdf.text(`Error capturing visual for: ${section.title}`, 20, 40);
          }
        }
      }

      // Save the PDF
      pdf.save('Real-Estate-Platform-Visual-Presentation.pdf');
    } catch (error) {
      console.error('Error generating visual PDF:', error);
      alert('Failed to generate visual PDF. Please try again.');
    } finally {
      setIsGeneratingVisualPDF(false);
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Title page
      pdf.setFontSize(24);
      pdf.text('Real Estate Platform', pageWidth / 2, 30, { align: 'center' });
      pdf.setFontSize(16);
      pdf.text('Comprehensive Feature Overview', pageWidth / 2, 45, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 60, { align: 'center' });

      let yPosition = 80;
      const sections = presentationSections;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Add new page for each section (except first)
        if (i > 0) {
          pdf.addPage();
          yPosition = 20;
        } else {
          yPosition = 80;
        }

        // Section header
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${i + 1}. ${section.title}`, 20, yPosition);
        yPosition += 15;

        // Get section content
        const sectionContent = getSectionContent(section.id);
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        // Split content into lines that fit the page
        const lines = pdf.splitTextToSize(sectionContent, pageWidth - 40);
        
        for (const line of lines) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, 20, yPosition);
          yPosition += 6;
        }
      }

      // Save the PDF
      pdf.save('Real-Estate-Platform-Presentation.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getSectionContent = (sectionId: string): string => {
    const contentMap: Record<string, string> = {
      'overview': `Website Overview & Introduction
      
This is a comprehensive real estate platform designed for modern property management and lead generation.

Key Features:
• Multi-language support (English, Hindi, Marathi)
• Advanced property search and filtering
• Interactive maps with location-based search
• User authentication and profile management
• Admin dashboard for property and user management
• CRM system for lead tracking
• Mobile-responsive design
• SEO-optimized pages

Target Users:
• Property seekers looking for homes/commercial spaces
• Real estate agents managing listings
• Property owners listing their properties
• Admin staff managing the platform`,

      'user-journey': `User Journey & Features

Registration & Authentication:
• Mobile number verification with OTP
• Google Sign-in integration
• User profile creation and management
• Secure session management

Property Search Experience:
• Advanced search filters (price, location, type, etc.)
• Interactive map-based property discovery
• Property comparison features
• Saved properties and wishlist functionality
• Property recommendations based on user behavior

Property Details:
• High-quality image galleries
• Detailed property specifications
• Location information and nearby amenities
• Contact forms for inquiries
• Interest expression buttons
• Sharing functionality`,

      'property-features': `Property Features & Management

Property Listings:
• Comprehensive property details form
• Multiple image uploads with optimization
• Location mapping and area selection
• Property verification system
• Status tracking (available, sold, rented)

Search & Discovery:
• Advanced filtering system
• Location-based search
• Price range selection
• Property type categorization
• Area-specific searches
• Map-based property visualization

Property Interaction:
• Contact property owner/agent
• Express interest functionality
• Save to favorites
• Share property details
• Request property visits
• Download property brochures`,

      'lead-generation': `Lead Generation System

Lead Capture Points:
• Property inquiry forms
• Interest expression buttons
• Contact form submissions
• Research report requests
• Newsletter subscriptions
• Phone number captures

Lead Qualification:
• Automatic lead scoring based on user behavior
• Property view tracking
• Search pattern analysis
• Contact attempt logging
• Follow-up scheduling

Lead Distribution:
• Automatic assignment to available agents
• Geographic-based routing
• Load balancing among team members
• Priority scoring for hot leads
• Real-time notifications to sales team`,

      'admin-dashboard': `Admin Dashboard Features

Property Management:
• Add, edit, delete property listings
• Property verification and approval workflow
• Bulk property operations
• Image management and optimization
• Status updates and availability tracking

User Management:
• User registration monitoring
• Profile verification
• Activity tracking
• Suspension and ban management
• Communication logs

Analytics & Reporting:
• Property view statistics
• User engagement metrics
• Lead generation reports
• Revenue tracking
• Performance dashboards
• Export functionality`,

      'super-admin': `Super Admin Panel

System Administration:
• Admin user management
• Role and permission assignment
• System configuration settings
• Database maintenance tools
• Backup and restore functionality

Advanced Analytics:
• Platform-wide statistics
• Revenue and commission tracking
• User acquisition metrics
• Property performance analysis
• Market trend reports

System Monitoring:
• Real-time system health monitoring
• Error logging and tracking
• Performance metrics
• Security audit logs
• API usage statistics`,

      'crm-system': `CRM & Lead Management

Lead Pipeline Management:
• Kanban-style lead board
• Status progression tracking
• Follow-up scheduling
• Activity logging
• Communication history

Customer Relationship Management:
• Contact management
• Interaction tracking
• Preference recording
• Purchase history
• Communication preferences

Sales Process:
• Lead qualification scoring
• Automated follow-up sequences
• Meeting scheduling
• Document management
• Deal progression tracking
• Commission calculation`,

      'technical-features': `Technical Architecture

Frontend Technology:
• React 18 with TypeScript
• Tailwind CSS for styling
• Responsive design principles
• Progressive Web App features
• SEO optimization

Backend Integration:
• Supabase for database and authentication
• Real-time data synchronization
• File storage and management
• API security and rate limiting
• Database optimization

Performance Features:
• Image optimization and lazy loading
• Code splitting and caching
• Mobile-first responsive design
• Fast loading times
• Search engine optimization

Security Features:
• Row Level Security (RLS)
• JWT authentication
• Data encryption
• HTTPS enforcement
• Input validation and sanitization`,

      'benefits': `Business Benefits

For Property Seekers:
• Easy property discovery
• Detailed property information
• Direct communication with owners
• Saved searches and favorites
• Mobile-optimized experience

For Property Owners:
• Easy property listing process
• Lead generation and management
• Property visibility and marketing
• Analytics and performance tracking
• Direct communication with prospects

For Real Estate Agents:
• Comprehensive lead management
• Automated follow-up systems
• Client relationship tracking
• Performance analytics
• Mobile-friendly tools

For Platform Owners:
• Automated lead generation
• Revenue tracking and reporting
• Scalable architecture
• User engagement analytics
• Market intelligence gathering`
    };

    return contentMap[sectionId] || 'Content not available for this section.';
  };

  const presentationSections = [
    { id: 'overview', title: 'Website Overview', icon: <Building /> },
    { id: 'user-journey', title: 'User Journey & Features', icon: <Users /> },
    { id: 'property-features', title: 'Property Features', icon: <Search /> },
    { id: 'lead-generation', title: 'Lead Generation System', icon: <TrendingUp /> },
    { id: 'admin-dashboard', title: 'Admin Dashboard', icon: <Settings /> },
    { id: 'super-admin', title: 'Super Admin Panel', icon: <Shield /> },
    { id: 'crm-system', title: 'CRM & Lead Management', icon: <BarChart3 /> },
    { id: 'technical-features', title: 'Technical Architecture', icon: <Database /> },
    { id: 'benefits', title: 'Business Benefits', icon: <Star /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-primary">Real Estate Platform Presentation</h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">Comprehensive feature overview and demonstration guide</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => navigate('/')} variant="outline" size="sm" className="md:size-default">
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">View Live Site</span>
                <span className="sm:hidden">Live Site</span>
              </Button>
              <Button 
                onClick={generatePDF} 
                variant="outline" 
                size="sm" 
                className="md:size-default"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">
                  {isGeneratingPDF ? 'Generating...' : 'Text PDF'}
                </span>
                <span className="sm:hidden">
                  {isGeneratingPDF ? 'Gen...' : 'Text'}
                </span>
              </Button>
              <Button 
                onClick={generateVisualPDF} 
                variant="default" 
                size="sm" 
                className="md:size-default"
                disabled={isGeneratingVisualPDF}
              >
                {isGeneratingVisualPDF ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">
                  {isGeneratingVisualPDF ? 'Generating...' : 'Visual PDF'}
                </span>
                <span className="sm:hidden">
                  {isGeneratingVisualPDF ? 'Gen...' : 'PDF'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Play className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Presentation Sections</span>
                  <span className="sm:hidden">Sections</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px] md:h-[600px]">
                  <nav className="space-y-1 p-2 md:p-4">
                    {presentationSections.map((section) => (
                      <Button
                        key={section.id}
                        variant={currentSection === section.id ? "default" : "ghost"}
                        className="w-full justify-start text-xs md:text-sm py-2 md:py-3"
                        onClick={() => setCurrentSection(section.id)}
                      >
                        <span className="text-base md:text-lg">{section.icon}</span>
                        <span className="ml-2 text-left">{section.title}</span>
                      </Button>
                    ))}
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Tabs value={currentSection} onValueChange={setCurrentSection}>
              
              {/* Website Overview */}
              <TabsContent value="overview" data-section="overview">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-6 h-6" />
                      Website Overview & Introduction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">🎯 Presentation Script - Opening</h3>
                      <div className="space-y-4 text-sm">
                        <p><strong>Welcome Introduction:</strong></p>
                        <blockquote className="border-l-4 border-primary pl-4 italic">
                          "Good morning/afternoon everyone! Today I'm excited to present our comprehensive Real Estate Platform - a cutting-edge digital solution designed specifically for the Aurangabad property market. This isn't just another property listing website; it's a complete ecosystem that connects buyers, sellers, and real estate professionals through intelligent technology."
                        </blockquote>
                        
                        <p><strong>Key Value Proposition:</strong></p>
                        <blockquote className="border-l-4 border-primary pl-4 italic">
                          "Our platform combines advanced search capabilities, intelligent lead generation, comprehensive admin tools, and a sophisticated CRM system - all wrapped in a modern, responsive interface that works seamlessly across all devices."
                        </blockquote>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">🏠 Platform Highlights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li>• Advanced property search with 15+ filters</li>
                            <li>• Interactive map-based property discovery</li>
                            <li>• Multi-language support (English/Marathi)</li>
                            <li>• Intelligent lead capture and management</li>
                            <li>• Comprehensive admin and CRM tools</li>
                            <li>• Mobile-responsive design</li>
                            <li>• Real-time property verification system</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">👥 Target Audience</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li>• <strong>Property Buyers:</strong> Easy search and discovery</li>
                            <li>• <strong>Property Sellers:</strong> Maximum exposure</li>
                            <li>• <strong>Real Estate Agents:</strong> Lead management</li>
                            <li>• <strong>Property Developers:</strong> Project promotion</li>
                            <li>• <strong>Investors:</strong> Market intelligence</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Bell className="w-4 h-4" />
                      <AlertTitle>Demo Navigation Tips</AlertTitle>
                      <AlertDescription>
                        Each section includes live demo links, feature explanations, and presenter talking points. Use the navigation sidebar to jump between sections during your presentation.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Journey */}
              <TabsContent value="user-journey" data-section="user-journey">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-6 h-6" />
                      User Journey & Core Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">🎯 Presentation Script - User Journey</h3>
                      <div className="space-y-4 text-sm">
                        <blockquote className="border-l-4 border-green-500 pl-4 italic">
                          "Let me walk you through a typical user's journey on our platform. When a potential buyer visits our site, they're immediately greeted with our intelligent radar interface - a unique visual representation of properties that makes browsing intuitive and engaging."
                        </blockquote>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">🚀 Homepage Features Demo</h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <Card className="border-2 border-primary/20">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">Radar Interface</CardTitle>
                              <Button size="sm" onClick={() => navigate('/')} className="text-xs">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Demo
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm mb-3">Interactive property discovery system</p>
                            <div className="space-y-2">
                              <Badge variant="secondary">📍 Location-based search</Badge>
                              <Badge variant="secondary">🎯 Visual property mapping</Badge>
                              <Badge variant="secondary">⚡ Real-time filtering</Badge>
                            </div>
                            <Separator className="my-3" />
                            <p className="text-xs text-muted-foreground">
                              <strong>Demo Script:</strong> "Notice how properties appear as interactive dots on our radar. Users can filter by price, type, and location instantly."
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-primary/20">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">Featured Properties</CardTitle>
                              <Button size="sm" onClick={() => navigate('/properties')} className="text-xs">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Demo
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm mb-3">Curated premium listings showcase</p>
                            <div className="space-y-2">
                              <Badge variant="secondary">⭐ Premium listings</Badge>
                              <Badge variant="secondary">🖼️ High-quality images</Badge>
                              <Badge variant="secondary">💰 Competitive pricing</Badge>
                            </div>
                            <Separator className="my-3" />
                            <p className="text-xs text-muted-foreground">
                              <strong>Demo Script:</strong> "Our featured section highlights the most attractive properties, each with professional photography and detailed specifications."
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <h4 className="text-lg font-semibold mt-6">🔍 Advanced Search Capabilities</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Filter className="w-4 h-4" />
                              Search Filters
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-xs space-y-1">
                              <li>• Location/Area selection</li>
                              <li>• Price range slider</li>
                              <li>• Property type dropdown</li>
                              <li>• BHK configuration</li>
                              <li>• Transaction type (Buy/Rent)</li>
                              <li>• Carpet area range</li>
                              <li>• Amenities filter</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Search className="w-4 h-4" />
                              Search Results
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-xs space-y-1">
                              <li>• Grid/List view toggle</li>
                              <li>• Sort by price/date/relevance</li>
                              <li>• Property cards with key info</li>
                              <li>• Quick contact options</li>
                              <li>• Save property feature</li>
                              <li>• Share functionality</li>
                              <li>• Map integration</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Property Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-xs space-y-1">
                              <li>• High-resolution image gallery</li>
                              <li>• Detailed specifications</li>
                              <li>• Amenities checklist</li>
                              <li>• Location map</li>
                              <li>• Contact seller options</li>
                              <li>• Price calculator</li>
                              <li>• Similar properties</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Property Features */}
              <TabsContent value="property-features" data-section="property-features">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-6 h-6" />
                      Property Features & Interactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">🎯 Presentation Script - Property Features</h3>
                      <blockquote className="border-l-4 border-purple-500 pl-4 italic text-sm">
                        "Now let's dive into the heart of our platform - the property browsing experience. Every element is designed to provide maximum information while maintaining simplicity. Notice how each property card contains all essential information at a glance, yet provides multiple interaction points for deeper engagement."
                      </blockquote>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold">🏠 Property Card Components</h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <Card className="border-2 border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Visual Elements
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span>Property Image</span>
                                <Badge variant="outline">High-res gallery</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Price Display</span>
                                <Badge variant="outline">₹ formatted</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Transaction Badge</span>
                                <Badge variant="outline">Buy/Rent</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Verification Status</span>
                                <Badge variant="outline">Verified/Pending</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-green-200">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Interactive Elements
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span>Call Button</span>
                                <Button size="sm" variant="outline">
                                  <Phone className="w-3 h-3 mr-1" />
                                  Call
                                </Button>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>WhatsApp Button</span>
                                <Button size="sm" variant="outline" className="bg-green-50">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  WhatsApp
                                </Button>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Save Property</span>
                                <Button size="sm" variant="outline">
                                  <Heart className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Share Property</span>
                                <Button size="sm" variant="outline">
                                  <Share2 className="w-3 h-3 mr-1" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <h4 className="text-lg font-semibold">📱 Mobile Responsiveness</h4>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center">
                              <Badge className="mb-2">📱 Mobile</Badge>
                              <p className="text-sm">Optimized touch interfaces, swipe gestures, bottom navigation</p>
                            </div>
                            <div className="text-center">
                              <Badge className="mb-2">💻 Tablet</Badge>
                              <p className="text-sm">Adaptive grid layout, enhanced touch targets, landscape/portrait</p>
                            </div>
                            <div className="text-center">
                              <Badge className="mb-2">🖥️ Desktop</Badge>
                              <p className="text-sm">Full feature access, hover effects, keyboard navigation</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Lead Generation */}
              <TabsContent value="lead-generation" data-section="lead-generation">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-6 h-6" />
                      Lead Generation System
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">🎯 Presentation Script - Lead Generation</h3>
                      <blockquote className="border-l-4 border-orange-500 pl-4 italic text-sm">
                        "Our lead generation system is where the real magic happens. Every user interaction is an opportunity to capture valuable leads. From the moment someone shows interest in a property to requesting detailed market research - we track, nurture, and convert these interactions into meaningful business opportunities."
                      </blockquote>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold">📊 Lead Capture Points</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="border-2 border-red-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Phone className="w-4 h-4 text-red-500" />
                              Contact Interactions
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-2">
                              <li>• Call button clicks</li>
                              <li>• WhatsApp message initiation</li>
                              <li>• Contact form submissions</li>
                              <li>• Request callback feature</li>
                            </ul>
                            <div className="mt-3 p-2 bg-red-50 rounded text-xs">
                              <strong>Lead Quality:</strong> High - Direct contact intent
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Heart className="w-4 h-4 text-blue-500" />
                              Interest Indicators
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-2">
                              <li>• Property saves/favorites</li>
                              <li>• Share actions</li>
                              <li>• Multiple property views</li>
                              <li>• Search pattern analysis</li>
                            </ul>
                            <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                              <strong>Lead Quality:</strong> Medium - Consideration stage
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-green-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <FileText className="w-4 h-4 text-green-500" />
                              Research Requests
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-2">
                              <li>• Market research reports</li>
                              <li>• Area analysis requests</li>
                              <li>• Price trend inquiries</li>
                              <li>• Investment advice seeking</li>
                            </ul>
                            <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                              <strong>Lead Quality:</strong> Premium - Serious buyers
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <h4 className="text-lg font-semibold">🔄 Lead Processing Flow</h4>
                      
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Automated Lead Capture Process</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between space-x-4 text-sm">
                              <div className="flex-1 text-center p-3 bg-blue-50 rounded">
                                <div className="font-semibold">1. User Action</div>
                                <div className="text-xs mt-1">Click, view, save, contact</div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <div className="flex-1 text-center p-3 bg-green-50 rounded">
                                <div className="font-semibold">2. Data Capture</div>
                                <div className="text-xs mt-1">IP, timestamp, property ID</div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <div className="flex-1 text-center p-3 bg-orange-50 rounded">
                                <div className="font-semibold">3. Lead Scoring</div>
                                <div className="text-xs mt-1">Automatic priority assignment</div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <div className="flex-1 text-center p-3 bg-purple-50 rounded">
                                <div className="font-semibold">4. CRM Entry</div>
                                <div className="text-xs mt-1">Admin dashboard notification</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Lead Data Captured</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="text-sm space-y-1">
                                <li>• Contact information (when provided)</li>
                                <li>• Property interests and preferences</li>
                                <li>• Budget range (inferred from searches)</li>
                                <li>• Location preferences</li>
                                <li>• Interaction timestamps</li>
                                <li>• Device and browser information</li>
                                <li>• Referral source</li>
                                <li>• Session duration and page views</li>
                              </ul>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Follow-up Triggers</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="text-sm space-y-1">
                                <li>• Immediate admin notifications</li>
                                <li>• Automated email sequences</li>
                                <li>• SMS follow-up (where permitted)</li>
                                <li>• Retargeting campaign triggers</li>
                                <li>• Personal outreach scheduling</li>
                                <li>• Similar property recommendations</li>
                                <li>• Market update subscriptions</li>
                                <li>• Appointment booking links</li>
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admin Dashboard */}
              <TabsContent value="admin-dashboard" data-section="admin-dashboard">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-6 h-6" />
                      Admin Dashboard Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">🎯 Presentation Script - Admin Dashboard</h3>
                      <div className="space-y-3 text-sm">
                        <blockquote className="border-l-4 border-cyan-500 pl-4 italic">
                          "The admin dashboard is the command center of our platform. Here's where property managers, real estate agents, and administrators can manage the entire ecosystem. From adding new properties to tracking leads, everything is centralized for maximum efficiency."
                        </blockquote>
                        <p><strong>Demo Path:</strong> Navigate to /admin-login → Show login process → Demonstrate each admin feature</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card className="border-2 border-cyan-200">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Property Management</CardTitle>
                            <Button size="sm" onClick={() => navigate('/admin')}>
                              <Eye className="w-4 h-4 mr-1" />
                              Demo
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Add New Property</span>
                              <Badge variant="secondary">Form-based</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Edit Existing Properties</span>
                              <Badge variant="secondary">Inline editing</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Image Upload & Gallery</span>
                              <Badge variant="secondary">Multi-upload</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Property Status Control</span>
                              <Badge variant="secondary">Active/Inactive</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Featured Property Toggle</span>
                              <Badge variant="secondary">Promotion tool</Badge>
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <p className="text-xs text-muted-foreground">
                            <strong>Demo Script:</strong> "Watch how easy it is to add a complete property listing with all details, images, and specifications in under 2 minutes."
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-purple-200">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Lead Management</CardTitle>
                            <Button size="sm" onClick={() => navigate('/admin')}>
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Demo
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Real-time Lead Feed</span>
                              <Badge variant="secondary">Live updates</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Lead Priority Scoring</span>
                              <Badge variant="secondary">AI-powered</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Contact Information</span>
                              <Badge variant="secondary">One-click access</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Activity Timeline</span>
                              <Badge variant="secondary">Full history</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Follow-up Reminders</span>
                              <Badge variant="secondary">Automated</Badge>
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <p className="text-xs text-muted-foreground">
                            <strong>Demo Script:</strong> "Every lead interaction is captured here with complete context - property interest, contact details, and suggested follow-up actions."
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <h4 className="text-lg font-semibold">📊 Analytics & Reporting</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Property Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-xs space-y-1">
                            <li>• Views per property</li>
                            <li>• Contact conversion rates</li>
                            <li>• Time on market</li>
                            <li>• Price adjustment tracking</li>
                            <li>• Geographic performance</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Lead Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-xs space-y-1">
                            <li>• Lead source tracking</li>
                            <li>• Conversion funnel analysis</li>
                            <li>• Response time metrics</li>
                            <li>• Quality score trends</li>
                            <li>• Follow-up effectiveness</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Market Intelligence</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-xs space-y-1">
                            <li>• Price trend analysis</li>
                            <li>• Demand forecasting</li>
                            <li>• Competitive analysis</li>
                            <li>• Market share reports</li>
                            <li>• Investment insights</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Super Admin */}
              <TabsContent value="super-admin" data-section="super-admin">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-6 h-6" />
                      Super Admin Panel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">🎯 Presentation Script - Super Admin</h3>
                      <blockquote className="border-l-4 border-red-500 pl-4 italic text-sm">
                        "The Super Admin panel provides the highest level of control over the platform. This is where we manage user roles, monitor system health, and make platform-wide decisions. It's designed for maximum oversight while maintaining security and efficiency."
                      </blockquote>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card className="border-2 border-red-200">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              User Management
                            </CardTitle>
                            <Button size="sm" onClick={() => navigate('/superadmin')}>
                              <Shield className="w-4 h-4 mr-1" />
                              Demo
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Role Assignment</span>
                              <Badge variant="secondary">Admin/User/Super</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Permission Control</span>
                              <Badge variant="secondary">Granular access</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>User Activity Logs</span>
                              <Badge variant="secondary">Full audit trail</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Account Status Management</span>
                              <Badge variant="secondary">Active/Suspended</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-orange-200">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            System Controls
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Database Management</span>
                              <Badge variant="secondary">Backup/Restore</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>System Monitoring</span>
                              <Badge variant="secondary">Performance metrics</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>API Rate Limiting</span>
                              <Badge variant="secondary">Traffic control</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Security Settings</span>
                              <Badge variant="secondary">Platform-wide</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <h4 className="text-lg font-semibold">🔒 Advanced Security Features</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Access Control</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-xs space-y-1">
                            <li>• Multi-factor authentication</li>
                            <li>• IP-based restrictions</li>
                            <li>• Session management</li>
                            <li>• Login attempt monitoring</li>
                            <li>• Automated lockout policies</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Data Protection</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-xs space-y-1">
                            <li>• Encrypted data storage</li>
                            <li>• GDPR compliance tools</li>
                            <li>• Data retention policies</li>
                            <li>• Automated backups</li>
                            <li>• Audit trail maintenance</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Monitoring</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-xs space-y-1">
                            <li>• Real-time threat detection</li>
                            <li>• Unusual activity alerts</li>
                            <li>• Performance monitoring</li>
                            <li>• Error tracking</li>
                            <li>• Uptime monitoring</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* CRM System */}
              <TabsContent value="crm-system" data-section="crm-system">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-6 h-6" />
                      CRM & Lead Management System
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">🎯 Presentation Script - CRM System</h3>
                      <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-sm">
                        "Our CRM system transforms how real estate professionals manage their pipeline. It's not just about storing contact information - it's about understanding customer journeys, predicting buying behaviors, and optimizing every touchpoint for maximum conversion."
                      </blockquote>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold">🎯 Lead Lifecycle Management</h4>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Kanban-Style Lead Pipeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg border">
                              <Badge className="mb-2 bg-gray-500">New</Badge>
                              <div className="text-xs">Fresh leads from website interactions</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg border">
                              <Badge className="mb-2 bg-blue-500">Contacted</Badge>
                              <div className="text-xs">Initial outreach completed</div>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg border">
                              <Badge className="mb-2 bg-yellow-500">Qualified</Badge>
                              <div className="text-xs">Budget and requirements confirmed</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg border">
                              <Badge className="mb-2 bg-purple-500">Proposal</Badge>
                              <div className="text-xs">Property recommendations sent</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg border">
                              <Badge className="mb-2 bg-green-500">Closed</Badge>
                              <div className="text-xs">Deal successfully completed</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <Card className="border-2 border-indigo-200">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Lead Intelligence
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span>Behavior Tracking</span>
                                <Badge variant="outline">Page views, time spent</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Interest Scoring</span>
                                <Badge variant="outline">AI-powered ranking</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Budget Estimation</span>
                                <Badge variant="outline">Search pattern analysis</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Urgency Detection</span>
                                <Badge variant="outline">Time-based indicators</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Preference Learning</span>
                                <Badge variant="outline">Location, type, features</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-green-200">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Automation Features
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span>Auto-assign Rules</span>
                                <Badge variant="outline">Territory/expertise based</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Follow-up Sequences</span>
                                <Badge variant="outline">Customizable email/SMS</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Property Matching</span>
                                <Badge variant="outline">ML-powered suggestions</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Appointment Booking</span>
                                <Badge variant="outline">Calendar integration</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Deal Alerts</span>
                                <Badge variant="outline">Real-time notifications</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <h4 className="text-lg font-semibold">📊 Performance Analytics</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Conversion Metrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Lead to Contact</span>
                                <Badge variant="outline">78%</Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Contact to Qualified</span>
                                <Badge variant="outline">45%</Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Qualified to Proposal</span>
                                <Badge variant="outline">62%</Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Proposal to Close</span>
                                <Badge variant="outline">34%</Badge>
                              </div>
                              <div className="flex justify-between text-xs font-semibold border-t pt-2">
                                <span>Overall Conversion</span>
                                <Badge>8.5%</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Time Metrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Response Time</span>
                                <Badge variant="outline">&lt; 15 min</Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Avg. Sales Cycle</span>
                                <Badge variant="outline">23 days</Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Time to First Meeting</span>
                                <Badge variant="outline">3.2 days</Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Follow-up Frequency</span>
                                <Badge variant="outline">Every 2 days</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              Quality Indicators
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Lead Score Average</span>
                                <Badge variant="outline">7.3/10</Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Hot Leads</span>
                                <Badge variant="outline">23%</Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Repeat Customers</span>
                                <Badge variant="outline">12%</Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Referral Rate</span>
                                <Badge variant="outline">18%</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Technical Features */}
              <TabsContent value="technical-features" data-section="technical-features">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-6 h-6" />
                      Technical Architecture & Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">🎯 Presentation Script - Technical Overview</h3>
                      <blockquote className="border-l-4 border-slate-500 pl-4 italic text-sm">
                        "Behind this beautiful interface lies a robust, scalable technical architecture. We've chosen cutting-edge technologies that ensure fast performance, maximum security, and effortless scalability as the business grows."
                      </blockquote>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold">🏗️ Technology Stack</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="border-2 border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              Frontend
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Badge className="w-full justify-center">React 18</Badge>
                              <Badge variant="outline" className="w-full justify-center">TypeScript</Badge>
                              <Badge variant="outline" className="w-full justify-center">Tailwind CSS</Badge>
                              <Badge variant="outline" className="w-full justify-center">Vite Build Tool</Badge>
                              <Badge variant="outline" className="w-full justify-center">React Router</Badge>
                            </div>
                            <p className="text-xs mt-3 text-muted-foreground">
                              Modern, type-safe React application with optimized build process
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-green-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Database className="w-4 h-4" />
                              Backend
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Badge className="w-full justify-center">Supabase</Badge>
                              <Badge variant="outline" className="w-full justify-center">PostgreSQL</Badge>
                              <Badge variant="outline" className="w-full justify-center">Row Level Security</Badge>
                              <Badge variant="outline" className="w-full justify-center">Real-time APIs</Badge>
                              <Badge variant="outline" className="w-full justify-center">Edge Functions</Badge>
                            </div>
                            <p className="text-xs mt-3 text-muted-foreground">
                              Full-featured backend-as-a-service with enterprise-grade security
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-purple-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Infrastructure
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Badge className="w-full justify-center">Vercel Hosting</Badge>
                              <Badge variant="outline" className="w-full justify-center">CDN Distribution</Badge>
                              <Badge variant="outline" className="w-full justify-center">Auto-scaling</Badge>
                              <Badge variant="outline" className="w-full justify-center">SSL Certificates</Badge>
                              <Badge variant="outline" className="w-full justify-center">Global Edge Network</Badge>
                            </div>
                            <p className="text-xs mt-3 text-muted-foreground">
                              Lightning-fast global deployment with automatic scaling
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <h4 className="text-lg font-semibold">🔐 Security & Compliance</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <Card className="border-2 border-red-200">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Data Security
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-2">
                              <li>• <strong>Encryption at Rest:</strong> All database records encrypted with AES-256</li>
                              <li>• <strong>Encryption in Transit:</strong> TLS 1.3 for all API communications</li>
                              <li>• <strong>Row Level Security:</strong> PostgreSQL RLS policies for data isolation</li>
                              <li>• <strong>Authentication:</strong> JWT tokens with automatic refresh</li>
                              <li>• <strong>Authorization:</strong> Role-based access control (RBAC)</li>
                              <li>• <strong>Data Backup:</strong> Automated daily backups with point-in-time recovery</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-orange-200">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Privacy & Compliance
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-2">
                              <li>• <strong>GDPR Compliance:</strong> Right to deletion, data portability</li>
                              <li>• <strong>Data Minimization:</strong> Only collect necessary information</li>
                              <li>• <strong>Consent Management:</strong> Granular privacy controls</li>
                              <li>• <strong>Audit Logging:</strong> Complete access and modification history</li>
                              <li>• <strong>Data Retention:</strong> Automated policy enforcement</li>
                              <li>• <strong>Privacy by Design:</strong> Built-in privacy safeguards</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      <h4 className="text-lg font-semibold">⚡ Performance Optimizations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Frontend Performance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-xs space-y-1">
                              <li>• Code splitting and lazy loading</li>
                              <li>• Image optimization and WebP support</li>
                              <li>• Service worker caching</li>
                              <li>• Bundle size optimization</li>
                              <li>• Critical CSS inlining</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Database Performance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-xs space-y-1">
                              <li>• Optimized PostgreSQL indexes</li>
                              <li>• Query result caching</li>
                              <li>• Connection pooling</li>
                              <li>• Read replicas for scaling</li>
                              <li>• Automatic query optimization</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Network Performance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-xs space-y-1">
                              <li>• Global CDN distribution</li>
                              <li>• HTTP/2 and HTTP/3 support</li>
                              <li>• Gzip and Brotli compression</li>
                              <li>• DNS prefetching</li>
                              <li>• Edge caching strategies</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Business Benefits */}
              <TabsContent value="benefits" data-section="benefits">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-6 h-6" />
                      Business Benefits & ROI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">🎯 Presentation Script - Business Value</h3>
                      <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-sm">
                        "Let's talk numbers. This platform isn't just about technology - it's about transforming your real estate business. Every feature we've discussed translates into tangible business outcomes: more leads, faster sales cycles, higher conversion rates, and ultimately, increased revenue."
                      </blockquote>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold">📈 Measurable Business Impact</h4>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="text-center border-2 border-green-200">
                          <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-green-600 mb-2">3x</div>
                            <div className="text-sm font-semibold mb-1">Lead Generation</div>
                            <div className="text-xs text-muted-foreground">Compared to traditional methods</div>
                          </CardContent>
                        </Card>

                        <Card className="text-center border-2 border-blue-200">
                          <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-blue-600 mb-2">60%</div>
                            <div className="text-sm font-semibold mb-1">Faster Response</div>
                            <div className="text-xs text-muted-foreground">Automated lead notification</div>
                          </CardContent>
                        </Card>

                        <Card className="text-center border-2 border-purple-200">
                          <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-purple-600 mb-2">45%</div>
                            <div className="text-sm font-semibold mb-1">Higher Conversion</div>
                            <div className="text-xs text-muted-foreground">Intelligent lead scoring</div>
                          </CardContent>
                        </Card>

                        <Card className="text-center border-2 border-orange-200">
                          <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-orange-600 mb-2">25%</div>
                            <div className="text-sm font-semibold mb-1">Reduced Costs</div>
                            <div className="text-xs text-muted-foreground">Marketing automation</div>
                          </CardContent>
                        </Card>
                      </div>

                      <h4 className="text-lg font-semibold">💰 Revenue Impact Analysis</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <Card className="border-2 border-emerald-200">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Direct Revenue Drivers
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Increased Lead Volume</span>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-green-600">+200 leads/month</div>
                                  <div className="text-xs text-muted-foreground">@ 8.5% conversion</div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Faster Sales Cycles</span>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-green-600">-10 days average</div>
                                  <div className="text-xs text-muted-foreground">Improved cash flow</div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Premium Property Visibility</span>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-green-600">+15% listing prices</div>
                                  <div className="text-xs text-muted-foreground">Featured properties</div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center border-t pt-3">
                                <span className="text-sm font-semibold">Monthly Revenue Impact</span>
                                <div className="text-lg font-bold text-green-600">₹12.5L+</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              Cost Savings & Efficiency
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Marketing Automation</span>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-blue-600">₹25,000/month</div>
                                  <div className="text-xs text-muted-foreground">Reduced ad spend</div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Administrative Efficiency</span>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-blue-600">15 hours/week</div>
                                  <div className="text-xs text-muted-foreground">Staff productivity</div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Print & Traditional Media</span>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-blue-600">₹18,000/month</div>
                                  <div className="text-xs text-muted-foreground">Digital transition</div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center border-t pt-3">
                                <span className="text-sm font-semibold">Monthly Cost Savings</span>
                                <div className="text-lg font-bold text-blue-600">₹65,000+</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <h4 className="text-lg font-semibold">🚀 Competitive Advantages</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Market Positioning</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-xs space-y-2">
                              <li>• <strong>Technology Leadership:</strong> First mover in Aurangabad market</li>
                              <li>• <strong>Professional Image:</strong> Modern, trustworthy platform</li>
                              <li>• <strong>24/7 Availability:</strong> Always-on property showcase</li>
                              <li>• <strong>Data-Driven Insights:</strong> Market intelligence advantage</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Customer Experience</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-xs space-y-2">
                              <li>• <strong>Seamless Journey:</strong> From discovery to deal closing</li>
                              <li>• <strong>Instant Response:</strong> Real-time inquiry handling</li>
                              <li>• <strong>Personalization:</strong> Tailored property recommendations</li>
                              <li>• <strong>Multi-Channel:</strong> Web, mobile, WhatsApp integration</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Scalability Benefits</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-xs space-y-2">
                              <li>• <strong>Geographic Expansion:</strong> Easy new area addition</li>
                              <li>• <strong>Team Growth:</strong> Multi-agent collaboration tools</li>
                              <li>• <strong>Service Expansion:</strong> New property types & services</li>
                              <li>• <strong>Partnership Ready:</strong> API integrations available</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg">
                        <h4 className="text-lg font-semibold mb-4">💡 Closing Statement for Presentation</h4>
                        <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-sm">
                          "This platform represents more than just a website - it's a complete digital transformation of your real estate business. Every click, every interaction, every lead is an opportunity we capture and optimize. The technology adapts and learns, making your business smarter every day. The question isn't whether you can afford to invest in this platform - it's whether you can afford not to."
                        </blockquote>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}