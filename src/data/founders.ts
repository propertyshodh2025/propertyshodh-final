import { Target, Users, Lightbulb, Code } from 'lucide-react';

export interface Founder {
  id: string;
  name: string;
  role: string;
  title: string;
  description: string;
  highlights: string[];
  gradient: string;
  icon: any;
  isSpecial?: boolean;
  imageUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    email?: string;
  };
  expertise: string[];
  achievements: string[];
}

export const founders: Founder[] = [
  {
    id: 'sudhakar-muley',
    name: 'Mr. Sudhakar Prabhakar Muley',
    role: 'Founder & CEO',
    title: 'The Visionary Pioneer',
    description: 'The mastermind who envisioned transforming Aurangabad\'s real estate landscape! With unparalleled expertise in property consulting and market research, Mr. Muley didn\'t just see problems—he saw possibilities. His revolutionary thinking sparked the PropertyShodh movement, bringing transparency and trust to every transaction.',
    highlights: [
      '🎯 Visionary Leader who conceptualized PropertyShodh',
      '🏆 Real Estate Consulting Expert',
      '💡 Champion of Trust & Transparency',
      '🚀 Market Research Innovator'
    ],
    expertise: ['Real Estate Consulting', 'Property Investment', 'Market Research', 'Business Strategy'],
    achievements: [
      'Founded PropertyShodh - Aurangabad\'s first homegrown prop-tech startup',
      'Years of experience in real estate consulting',
      'Built trusted relationships with developers and investors',
      'Pioneer of transparent real estate practices in Aurangabad'
    ],
    gradient: 'from-blue-600 to-purple-600',
    icon: Target,
    imageUrl: '/images/founders/sudhakar-muley.jpg' // Placeholder - add actual image
  },
  {
    id: 'rahul-jaiswal',
    name: 'Rahul Jaiswal',
    role: 'Co-Founder',
    title: 'The Dynamic Force',
    description: 'A powerhouse entrepreneur who transforms ideas into reality! Rahul\'s extraordinary blend of real estate mastery, community leadership, and strategic networking makes him the ultimate relationship architect. His PR genius and EdTech passion create bridges between dreams and achievements.',
    highlights: [
      '🌟 Community Leader & Relationship Master',
      '🎭 PR & Strategic Communication Expert',
      '📚 EdTech Enthusiast & Social Developer',
      '🤝 Network Builder Extraordinaire'
    ],
    expertise: ['Community Leadership', 'Public Relations', 'EdTech', 'NGO Management', 'Strategic Communication'],
    achievements: [
      'Co-founded PropertyShodh with visionary leadership',
      'Extensive network in real estate and government sectors',
      'Active in NGO and social development initiatives',
      'Expert in sales and strategic partnerships'
    ],
    gradient: 'from-green-600 to-teal-600',
    icon: Users,
    imageUrl: '/images/founders/rahul-jaiswal.jpg' // Placeholder - add actual image
  },
  {
    id: 'chaitanya-kapure',
    name: 'Chaitanya Kapure',
    role: 'Co-Founder (Marketing)',
    title: 'The Creative Genius',
    description: 'A multi-disciplinary marvel who operates at the intersection of art, technology, and business! As founder of \'Let\'s Build Brand\' and PropertyShodh\'s marketing mastermind, Chaitanya crafts cinematic campaigns and AI-powered strategies that don\'t just market—they mesmerize.',
    highlights: [
      '🎨 Creative Director & Content Strategist',
      '🤖 AI Marketing Pioneer',
      '🎬 Cinematic Campaign Creator',
      '💪 Fitness Expert & Wellness Advocate'
    ],
    expertise: ['Creative Direction', 'AI Marketing', 'Brand Strategy', 'Content Creation', 'Fitness Consulting'],
    achievements: [
      'Founder of Let\'s Build Brand - Fast-growing creative agency',
      'PropertyShodh\'s marketing and brand architect',
      'Certified Low Back Pain Expert and Fitness Consultant',
      'Pioneer in AI-powered marketing campaigns'
    ],
    gradient: 'from-orange-600 to-red-600',
    icon: Lightbulb,
    imageUrl: '/images/founders/chaitanya-kapure.jpg' // Placeholder - add actual image
  },
  {
    id: 'yadish-shaikh',
    name: 'Yadish Shaikh',
    role: 'Tech Partner',
    title: 'The Tech Architect & Digital Wizard',
    description: '🚀 THE TECHNOLOGICAL POWERHOUSE behind PropertyShodh\'s entire digital ecosystem! With a B.Tech in IT and advanced expertise from IIT Madras, Yadish isn\'t just a developer—he\'s a digital architect who single-handedly crafted the complete platform from ground zero. His genius transforms complex real estate challenges into elegant, scalable solutions!',
    highlights: [
      '💻 Complete Platform Architect & Developer',
      '🎓 IIT Madras Data Science Expert',
      '⚡ Single-handed Full-Stack Development',
      '🧠 AI & Innovation Specialist',
      '🏗️ Scalable Architecture Mastermind',
      '🔮 Future-Ready Technology Visionary'
    ],
    expertise: [
      'Full-Stack Development',
      'Data Science & Analytics',
      'AI/ML Implementation',
      'Scalable Architecture',
      'Database Design',
      'Cloud Computing',
      'Mobile Development',
      'DevOps & Automation'
    ],
    achievements: [
      'B.Tech in Information Technology',
      'Advanced Data Science certification from IIT Madras',
      'Single-handedly developed the entire PropertyShodh platform',
      'Architected scalable, future-ready technology infrastructure',
      'Built AI-powered search and recommendation systems',
      'Designed responsive, user-friendly interface',
      'Implemented robust security and data protection measures'
    ],
    gradient: 'from-purple-600 to-pink-600',
    icon: Code,
    isSpecial: true,
    imageUrl: '/images/founders/yadish-shaikh.jpg' // Placeholder - add actual image
  }
];

export const companyStory = {
  genesis: {
    title: 'The Genesis',
    description: 'In September 2025, two visionary minds in Aurangabad—Sudhakar Muley and Rahul Jaiswal—identified a massive problem plaguing their beloved city. Property hunting was a nightmare of endless broker visits, inconsistent pricing, and unreliable information.',
    keyPoints: [
      'Problem identification in Aurangabad\'s real estate market',
      'Immediate action to secure domain and start development',
      'Strategic team assembly with complementary skills',
      'Birth of Aurangabad\'s first homegrown prop-tech startup'
    ]
  },
  mission: 'To empower Aurangabad with a smart, secure, and transparent real-estate platform that saves time, builds trust, and unlocks opportunities.',
  vision: 'To become the most trusted digital authority for real estate in Aurangabad, expanding across Maharashtra as the model for transparent prop-tech.',
  futureGoal: 'PropertyShodh started here, and now it\'s helping millions across India find their dream homes.'
};

export const platformFeatures = [
  {
    icon: '✅',
    title: '3-Stage Verification',
    description: 'AI checks + Document validation + Admin approval'
  },
  {
    icon: '🤖',
    title: 'AI-Powered Search',
    description: 'Conversational assistant that understands your needs'
  },
  {
    icon: '🗺️',
    title: 'Interactive Maps',
    description: 'Visual location selection on Aurangabad\'s digital map'
  },
  {
    icon: '🔄',
    title: 'Real-Time Updates',
    description: 'Live availability status - no outdated information'
  },
  {
    icon: '🌐',
    title: 'Multi-Language Support',
    description: 'English, Hindi, and Marathi - inclusive for everyone'
  },
  {
    icon: '🛡️',
    title: 'Trust Badges',
    description: 'Verified properties with confidence scores'
  }
];