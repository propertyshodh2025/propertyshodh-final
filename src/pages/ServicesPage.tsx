"use client";

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { ServiceCard } from '@/components/ServiceCard';
import {
  Home,
  Users,
  Handshake,
  FileText,
  TrendingUp,
  ShieldCheck,
  Lightbulb,
  Briefcase,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Megaphone,
  Building,
  ClipboardCheck,
  Wallet,
  Scale,
  BarChart,
  BookOpen,
  Star,
  Award,
  HeartHandshake,
  Headset,
  Clock,
  Zap,
  Globe,
  Lock,
  UserCheck,
  MessageSquare,
  Calendar,
  Search,
  Key,
  Landmark,
  Gavel,
  PiggyBank,
  LineChart,
  FileStack,
  UserPlus,
  Building2,
  Banknote,
  ReceiptText,
  HandCoins,
  Percent,
  TrendingUpIcon,
  ShieldEllipsis,
  LightbulbIcon,
  BriefcaseBusiness,
  MapPinned,
  PhoneCall,
  MailOpen,
  ArrowRightIcon,
  MegaphoneOff,
  BuildingIcon,
  ClipboardCheckIcon,
  WalletMinimal,
  ScaleIcon,
  BarChart3,
  BookOpenText,
  StarIcon,
  AwardIcon,
  HeartHandshakeIcon,
  HeadsetIcon,
  ClockIcon,
  ZapIcon,
  GlobeIcon,
  LockIcon,
  UserCheckIcon,
  MessageSquareIcon,
  CalendarDays,
  SearchIcon,
  KeyIcon,
  LandmarkIcon,
  GavelIcon,
  PiggyBankIcon,
  LineChartIcon,
  FileStackIcon,
  UserPlusIcon,
  Building2Icon,
  BanknoteIcon,
  ReceiptTextIcon,
  HandCoinsIcon,
  PercentIcon,
} from 'lucide-react';

const services = [
  {
    icon: Megaphone,
    titleKey: 'service_listing_marketing_title',
    descriptionKey: 'service_listing_marketing_description',
  },
  {
    icon: Users,
    titleKey: 'service_buyer_representation_title',
    descriptionKey: 'service_buyer_representation_description',
  },
  {
    icon: Building,
    titleKey: 'service_property_management_title',
    descriptionKey: 'service_property_management_description',
  },
  {
    icon: ClipboardCheck,
    titleKey: 'service_legal_documentation_title',
    descriptionKey: 'service_legal_documentation_description',
  },
  {
    icon: LineChart,
    titleKey: 'service_investment_advisory_title',
    descriptionKey: 'service_investment_advisory_description',
  },
  {
    icon: Scale,
    titleKey: 'service_valuation_services_title',
    descriptionKey: 'service_valuation_services_description',
  },
];

const whyChooseUs = [
  {
    icon: Star,
    titleKey: 'why_choose_expertise_title',
    descriptionKey: 'why_choose_expertise_description',
  },
  {
    icon: HeartHandshake,
    titleKey: 'why_choose_client_focus_title',
    descriptionKey: 'why_choose_client_focus_description',
  },
  {
    icon: ShieldCheck,
    titleKey: 'why_choose_transparency_title',
    descriptionKey: 'why_choose_transparency_description',
  },
  {
    icon: Zap,
    titleKey: 'why_choose_efficiency_title',
    descriptionKey: 'why_choose_efficiency_description',
  },
  {
    icon: Globe,
    titleKey: 'why_choose_local_knowledge_title',
    descriptionKey: 'why_choose_local_knowledge_description',
  },
  {
    icon: Lock,
    titleKey: 'why_choose_security_title',
    descriptionKey: 'why_choose_security_description',
  },
];

export const ServicesPage: React.FC = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top when the component mounts
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="heroGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="heroGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.08" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <path d="M0,200 Q250,50 500,150 T1000,100 L1000,0 L0,0 Z" fill="url(#heroGradient1)" />
            <path d="M0,400 Q300,250 600,350 T1000,300 L1000,0 L0,0 Z" fill="url(#heroGradient2)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            <TranslatableText text="our_services_title" />
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            <TranslatableText text="our_services_subtitle" />
          </p>
          <Button asChild size="lg" className="px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <Link to="/contact">
              <TranslatableText text="contact_us_button" /> <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            <TranslatableText text="explore_our_offerings_title" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                icon={service.icon}
                titleKey={service.titleKey}
                descriptionKey={service.descriptionKey}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            <TranslatableText text="why_choose_us_title" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <ServiceCard
                key={index}
                icon={item.icon}
                titleKey={item.titleKey}
                descriptionKey={item.descriptionKey}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            <TranslatableText text="ready_to_get_started_title" />
          </h2>
          <p className="text-xl mb-8">
            <TranslatableText text="ready_to_get_started_subtitle" />
          </p>
          <Button asChild size="lg" variant="secondary" className="px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <Link to="/contact">
              <TranslatableText text="talk_to_an_expert_button" /> <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};