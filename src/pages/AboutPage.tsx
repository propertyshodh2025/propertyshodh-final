import React, { useEffect, useState } from "react";
import { Building2, Goal, Target, KeyRound, Blocks, House, Frame, Linkedin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export interface AboutSectionProps {
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
    <span className={`relative inline-block min-w-[280px] ${className}`}>
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
          className="absolute left-1/2 -translate-x-1/2 inline-block whitespace-nowrap"
        >
          {cityNames[currentName]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const founders = [
  {
    name: "Sudhakar",
    role: "Founder & CEO",
    emphasis: "Vision for transparency • Real-estate expertise",
    image:
      "/uploads/sudhakar.jpg",
    highlights: [
      "Brings over a decade of deep real-estate knowledge in Chhatrapati Sambhaji Nagar (Aurangabad)",
      "Known for his clarity, ethics, and transparent approach",
      "Sets the benchmark for verified and trustworthy property deals",
    ],
    accent: "leader",
  },
  {
    name: "Rahul",
    role: "Co-Founder & COO",
    emphasis: "Community leadership • Growth partnerships",
    image:
      "/uploads/rahul.jpg",
    highlights: [
      "Strong in relationship-building and community leadership",
      "Focused on customer-first operations and smooth experiences",
      "Connects people, builders, and opportunities with trust",
    ],
    accent: "people",
  },
  {
    name: "Chaitanya",
    role: "Co-Founder & CMO",
    emphasis: "Creative strategy • Market execution",
    image:
      "/uploads/chaitanya.jpg",
    highlights: [
      "Leverages AI, marketing, and user-first design to innovate real estate.",
      "Focuses on data-driven campaigns and market penetration.",
      "Drives full-funnel growth with practical, result-oriented strategies",
    ],
    accent: "brand",
  },
  {
    name: "Yadish",
    role: "Co-Founder & CTO",
    emphasis: "Platform architecture • End-to-end development",
    image:
      "/uploads/yadish.jpg",
    highlights: [
      "The complete tech backbone of PropertyShodh",
      "Designs and develops systems that are fast, reliable, and scalable",
      "Turns complex problems into simple, user-friendly solutions",
    ],
    accent: "tech",
  },
];

function AccentBadge({ accent }: { accent: "leader" | "people" | "brand" | "tech" }) {
  const map: Record<typeof accent, string> = {
    leader: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    people: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    brand: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    tech: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[accent]}`} />;
}

export default function AboutSection({ className, style }: AboutSectionProps) {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Header />
      
      <section className={["w-full bg-background pt-24", className].filter(Boolean).join(" ")} style={style} aria-label="About PropertyShodh">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 py-14 md:py-20">
        {/* Hero */}
        <header className="w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1.5">
            <Building2 className="h-4 w-4 text-blue-700 dark:text-blue-300" aria-hidden="true" />
            <span className="text-xs font-medium tracking-wide text-blue-700 dark:text-blue-300">PropertyShodh • Built in <SlidingCityName /></span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Bringing clarity to real estate—starting in <SlidingCityName />
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
            Our mission is simple: make property discovery trustworthy, fast, and human.
            Our vision is bold: a transparent, tech‑powered marketplace that serves every
            home‑seeker in their own language.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full px-3 py-1">Verified Listings</Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-3 py-1">AI‑Powered Search</Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full px-3 py-1">Multi‑Language Support</Badge>
          </div>

          {/* Hype the instigators */}
          <div className="mx-auto max-w-3xl mt-6">
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 text-left">
              <p className="text-sm sm:text-base leading-relaxed">
                First came the spark: <span className="font-semibold">Sudhakar</span> saw the city's chaos and drew a clear line—
                trust, or nothing. Alongside him, <span className="font-semibold">Rahul</span> turned that line into a living network,
                rallying people, builders, and belief. That's where the story begins.
              </p>
            </div>
          </div>
        </header>

        {/* Origin Story */}
        <div className="mt-14 md:mt-20 grid gap-6">
          <Card className="bg-card border border-border rounded-2xl">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" aria-hidden="true" />
                Problem → Insight → Solution
              </div>
              <CardTitle className="text-2xl md:text-3xl">
                Born from the real problems of <SlidingCityName />'s property market
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                We heard the same stories again and again—unclear pricing, outdated postings,
                and wasted site visits. PropertyShodh began as a promise to fix this.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <Goal className="h-5 w-5 mt-0.5 text-red-600 dark:text-red-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-red-800 dark:text-red-200">The frustration</h3>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Hidden details, unverifiable claims, and listings that led nowhere—home‑seekers
                        were spending time, not making progress.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <KeyRound className="h-5 w-5 mt-0.5 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">The insight</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Trust is earned with verification, context, and speed—supported by tech,
                        delivered by people who care.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Blocks className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-green-800 dark:text-green-200">The solution</h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        A platform with verified listings, AI‑powered discovery, and local expertise—
                        purpose‑built for <SlidingCityName />.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Story: how each character joined - Flow Animation */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5">
                <h4 className="font-semibold mb-6 text-center">How the team came together — the journey</h4>
                
                {/* Flowing River Animation */}
                <div className="relative max-w-4xl mx-auto">
                  {/* Vertical Flow Line */}
                  <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-500 via-green-500 to-orange-500 opacity-60" />
                  
                  {/* Animated story cards */}
                  <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.6 } },
                    }}
                    className="space-y-8"
                  >
                    {/* Chapter 1 - The Spark */}
                    <motion.div
                      variants={{ 
                        hidden: { opacity: 0, x: -60, scale: 0.8 }, 
                        show: { 
                          opacity: 1, 
                          x: 0, 
                          scale: 1,
                          transition: { 
                            duration: 0.8,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }
                        } 
                      }}
                      className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6 group"
                    >
                      {/* Flow indicator */}
                      <div className="relative z-10 flex-shrink-0">
                        <motion.div
                          variants={{ 
                            hidden: { scale: 0, rotate: -180 }, 
                            show: { 
                              scale: 1, 
                              rotate: 0,
                              transition: { delay: 0.2, duration: 0.5 }
                            }
                          }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800"
                        >
                          <Goal className="h-6 w-6 text-white" aria-hidden="true" />
                        </motion.div>
                        {/* Ripple effect */}
                        <motion.div
                          variants={{
                            hidden: { scale: 0, opacity: 0 },
                            show: { 
                              scale: [1, 1.5, 2],
                              opacity: [0.5, 0.2, 0],
                              transition: { delay: 0.5, duration: 2, repeat: Infinity }
                            }
                          }}
                          className="absolute inset-0 rounded-full bg-blue-400"
                        />
                      </div>
                      
                      {/* Content */}
                      <motion.div
                        variants={{ 
                          hidden: { opacity: 0, y: 20 }, 
                          show: { 
                            opacity: 1, 
                            y: 0,
                            transition: { delay: 0.3, duration: 0.6 }
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Chapter 1</span>
                          <div className="h-1 w-8 bg-blue-400 rounded-full" />
                        </div>
                        <h5 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">The Spark</h5>
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                          It began when Sudhakar and Rahul looked closely at the property market in <SlidingCityName />. 
                          They noticed how difficult it was for people to find the right property—scattered listings, 
                          missing details, no transparency. They decided to fix it. That's when the idea of PropertyShodh 
                          was born. The name was chosen, the domain was registered, and the mission was set.
                        </p>
                      </motion.div>
                    </motion.div>

                    {/* Chapter 2 - The Bridge */}
                    <motion.div
                      variants={{ 
                        hidden: { opacity: 0, x: 60, scale: 0.8 }, 
                        show: { 
                          opacity: 1, 
                          x: 0, 
                          scale: 1,
                          transition: { 
                            duration: 0.8,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }
                        } 
                      }}
                      className="relative flex flex-col sm:flex-row-reverse items-start gap-4 sm:gap-6 group"
                    >
                      {/* Flow indicator */}
                      <div className="relative z-10 flex-shrink-0">
                        <motion.div
                          variants={{ 
                            hidden: { scale: 0, rotate: 180 }, 
                            show: { 
                              scale: 1, 
                              rotate: 0,
                              transition: { delay: 0.2, duration: 0.5 }
                            }
                          }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800"
                        >
                          <KeyRound className="h-6 w-6 text-white" aria-hidden="true" />
                        </motion.div>
                        {/* Ripple effect */}
                        <motion.div
                          variants={{
                            hidden: { scale: 0, opacity: 0 },
                            show: { 
                              scale: [1, 1.5, 2],
                              opacity: [0.5, 0.2, 0],
                              transition: { delay: 0.5, duration: 2, repeat: Infinity }
                            }
                          }}
                          className="absolute inset-0 rounded-full bg-purple-400"
                        />
                      </div>
                      
                      {/* Content */}
                      <motion.div
                        variants={{ 
                          hidden: { opacity: 0, y: 20 }, 
                          show: { 
                            opacity: 1, 
                            y: 0,
                            transition: { delay: 0.3, duration: 0.6 }
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-2 mb-2 sm:justify-end">
                          <div className="h-1 w-8 bg-purple-400 rounded-full" />
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Chapter 2</span>
                        </div>
                        <h5 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-3 sm:text-right">The Bridge</h5>
                        <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed sm:text-right">
                          With the vision in place, Rahul brought in Chaitanya. Having deep expertise in digital 
                          marketing and business strategy, Chaitanya understood the ground reality of <SlidingCityName />—how 
                          buyers search, what builders expect, and what was missing in the market. He started shaping 
                          the strategy to connect people and properties in a smarter way.
                        </p>
                      </motion.div>
                    </motion.div>

                    {/* Chapter 3 - The Engine */}
                    <motion.div
                      variants={{ 
                        hidden: { opacity: 0, x: -60, scale: 0.8 }, 
                        show: { 
                          opacity: 1, 
                          x: 0, 
                          scale: 1,
                          transition: { 
                            duration: 0.8,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }
                        } 
                      }}
                      className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6 group"
                    >
                      {/* Flow indicator */}
                      <div className="relative z-10 flex-shrink-0">
                        <motion.div
                          variants={{ 
                            hidden: { scale: 0, rotate: -180 }, 
                            show: { 
                              scale: 1, 
                              rotate: 0,
                              transition: { delay: 0.2, duration: 0.5 }
                            }
                          }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800"
                        >
                          <Blocks className="h-6 w-6 text-white" aria-hidden="true" />
                        </motion.div>
                        {/* Ripple effect */}
                        <motion.div
                          variants={{
                            hidden: { scale: 0, opacity: 0 },
                            show: { 
                              scale: [1, 1.5, 2],
                              opacity: [0.5, 0.2, 0],
                              transition: { delay: 0.5, duration: 2, repeat: Infinity }
                            }
                          }}
                          className="absolute inset-0 rounded-full bg-green-400"
                        />
                      </div>
                      
                      {/* Content */}
                      <motion.div
                        variants={{ 
                          hidden: { opacity: 0, y: 20 }, 
                          show: { 
                            opacity: 1, 
                            y: 0,
                            transition: { delay: 0.3, duration: 0.6 }
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-700 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Chapter 3</span>
                          <div className="h-1 w-8 bg-green-400 rounded-full" />
                        </div>
                        <h5 className="text-lg font-bold text-green-900 dark:text-green-100 mb-3">The Engine</h5>
                        <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                          To bring the idea to life, Chaitanya reached out to Yadish. With a strong background in 
                          Information Technology and Data Science, Yadish became the tech powerhouse behind PropertyShodh. 
                          He built the entire platform from scratch—verified listings, lightning-fast search, smooth design, 
                          and a reliable system tailored for <SlidingCityName />'s real estate needs.
                        </p>
                      </motion.div>
                    </motion.div>

                    {/* Chapter 4 - The Build */}
                    <motion.div
                      variants={{ 
                        hidden: { opacity: 0, x: 60, scale: 0.8 }, 
                        show: { 
                          opacity: 1, 
                          x: 0, 
                          scale: 1,
                          transition: { 
                            duration: 0.8,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }
                        } 
                      }}
                      className="relative flex flex-col sm:flex-row-reverse items-start gap-4 sm:gap-6 group"
                    >
                      {/* Flow indicator */}
                      <div className="relative z-10 flex-shrink-0">
                        <motion.div
                          variants={{ 
                            hidden: { scale: 0, rotate: 180 }, 
                            show: { 
                              scale: 1, 
                              rotate: 0,
                              transition: { delay: 0.2, duration: 0.5 }
                            }
                          }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800"
                        >
                          <Frame className="h-6 w-6 text-white" aria-hidden="true" />
                        </motion.div>
                        {/* Ripple effect */}
                        <motion.div
                          variants={{
                            hidden: { scale: 0, opacity: 0 },
                            show: { 
                              scale: [1, 1.5, 2],
                              opacity: [0.5, 0.2, 0],
                              transition: { delay: 0.5, duration: 2, repeat: Infinity }
                            }
                          }}
                          className="absolute inset-0 rounded-full bg-orange-400"
                        />
                      </div>
                      
                      {/* Content */}
                      <motion.div
                        variants={{ 
                          hidden: { opacity: 0, y: 20 }, 
                          show: { 
                            opacity: 1, 
                            y: 0,
                            transition: { delay: 0.3, duration: 0.6 }
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-2 mb-2 sm:justify-end">
                          <div className="h-1 w-8 bg-orange-400 rounded-full" />
                          <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Chapter 4</span>
                        </div>
                        <h5 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-3 sm:text-right">The Build</h5>
                        <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed sm:text-right">
                          The four—Sudhakar, Rahul, Chaitanya, and Yadish—teamed up with a clear purpose. From 
                          brainstorming sessions to on-field research, from whiteboard planning to actual development, 
                          they worked together with one goal: to create <SlidingCityName />'s first tech-driven property 
                          discovery platform.
                        </p>
                      </motion.div>
                    </motion.div>

                    {/* Final Flow Element */}
                    <motion.div
                      variants={{ 
                        hidden: { opacity: 0, y: 30 }, 
                        show: { 
                          opacity: 1, 
                          y: 0,
                          transition: { 
                            duration: 1,
                            ease: "easeOut"
                          }
                        } 
                      }}
                      className="text-center pt-6"
                    >
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-orange-100 dark:from-blue-900/30 dark:to-orange-900/30 rounded-full border border-slate-200 dark:border-slate-700">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          And that's how PropertyShodh took shape—built in <SlidingCityName />, for <SlidingCityName />.
                        </p>
                        <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <House className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">Origins</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        It started with a domain purchase and a commitment: build something better.
                        A small team formed around shared values—clarity, integrity, and speed.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-start gap-3">
                    <Frame className="h-5 w-5 mt-0.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">Focus on <SlidingCityName /></h4>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        An underserved market deserves category‑defining tools. We're building deeply
                        for local needs—neighborhood context, language support, and verified supply.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Founders */}
        <div className="mt-14 md:mt-20">
          <div className="mb-6 md:mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold">Meet the Founders</h2>
            <p className="mt-2 text-muted-foreground text-base">
              The people behind PropertyShodh—operators, builders, and community leaders.
            </p>
          </div>

          <div className="grid gap-6 md:gap-7 md:grid-cols-2">
            {founders.map((f, idx) => {
              return (
                <Card
                  key={f.name}
                  className={[
                    "bg-card border border-border rounded-2xl h-full transition-shadow",
                    "hover:shadow-lg",
                  ].join(" ")}
                  aria-label={`${f.name}, ${f.role}`}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            f.accent === "leader" ? "bg-accent text-accent-foreground" : "",
                            f.accent === "people" ? "bg-secondary text-secondary-foreground" : "",
                            f.accent === "brand" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" : "",
                            f.accent === "tech" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" : "",
                          ].join(" ")}
                        >
                          {f.role}
                        </span>
                        {idx === 0 && (
                          <span className="text-xs text-muted-foreground">Leads with transparency</span>
                        )}
                      </div>
                      <Badge className="bg-secondary text-secondary-foreground rounded-full">Core Team</Badge>
                    </div>

                    <CardTitle className="text-xl md:text-2xl">{f.name}</CardTitle>
                    <CardDescription className="text-sm md:text-base text-muted-foreground break-words">
                      {f.emphasis}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid gap-4">
                    <div className="relative overflow-hidden rounded-xl bg-secondary aspect-[3/4]">
                      <img
                        src={f.image}
                        alt={`${f.name} portrait`}
                        className="block w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <ul className="grid gap-2">
                      {f.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                            <Goal className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" aria-hidden="true" />
                          </span>
                          <p className="text-sm text-foreground">{h}</p>
                        </li>
                      ))}
                    </ul>
                    {/* LinkedIn button for Yadish only */}
                    {f.name === "Yadish" && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <a
                          href="https://www.linkedin.com/in/yadishh"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                          <Linkedin className="h-4 w-4" />
                          Connect on LinkedIn
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Differentiators */}
        <div className="mt-14 md:mt-20">
          <Card className="bg-card border border-border rounded-2xl">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Why PropertyShodh stands apart
              </div>
              <CardTitle className="text-2xl md:text-3xl">Designed for trust and speed</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Everything we build is measured against clarity for buyers, velocity for sellers, and confidence for brokers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <KeyRound className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Verified Listings</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Structured checks, documentation capture, and status freshness ensure what you see is accurate.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Blocks className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">AI‑Powered Search</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Relevance tuned for local priorities—budget, commute, schools, and neighborhood vibe.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200">Multi‑Language</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Search and support that meets you where you are—because clarity should speak your language.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vision */}
        <div className="mt-14 md:mt-20">
          <div className="text-center space-y-3">
            <h3 className="text-xl md:text-2xl font-extrabold">The road ahead</h3>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              We're scaling PropertyShodh methodically—feature by feature, neighborhood by neighborhood—
              keeping our promise of verified supply and human support at the core.
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <Footer />
  </div>
  );
}