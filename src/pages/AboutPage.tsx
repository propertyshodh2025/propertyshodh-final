"use client";

import * as React from "react";
import { Building2, Goal, Target, KeyRound, Blocks, House, Frame } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export interface AboutSectionProps {
  className?: string;
  style?: React.CSSProperties;
}

const founders = [
  {
    name: "Sudhakar",
    role: "Founder & CEO",
    emphasis: "Vision for transparency • Real‑estate depth",
    image:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1200&auto=format&fit=crop",
    highlights: [
      "Sets the standard for verified, ethical deals",
      "Brings a decade of on‑ground market insight",
      "Leads with clarity, trust, and momentum",
    ],
    accent: "leader",
  },
  {
    name: "Rahul",
    role: "Co‑Founder",
    emphasis: "Community leadership • Relationship‑building",
    image:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1200&auto=format&fit=crop",
    highlights: [
      "Turns vision into partnerships and growth",
      "Bridges people, policy, and opportunity",
      "Customer‑first operations that feel personal",
    ],
    accent: "people",
  },
  {
    name: "Chaitanya",
    role: "Marketing Co‑Founder",
    emphasis: "Creative strategy • Multi‑disciplinary execution",
    image:
      "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?q=80&w=1200&auto=format&fit=crop",
    highlights: [
      "Brand storytelling that builds trust",
      "Full‑funnel growth with clear metrics",
      "Design systems that scale with speed",
    ],
    accent: "brand",
  },
  {
    name: "Yadish",
    role: "Tech Partner",
    emphasis: "Platform architecture • Data‑driven systems",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
    highlights: [
      "Engineers search, ranking, and verification",
      "Builds for reliability, speed, and scale",
      "Translates real problems into elegant software",
    ],
    accent: "tech",
  },
];

function AccentBadge({ accent }: { accent: "leader" | "people" | "brand" | "tech" }) {
  const map: Record<typeof accent, string> = {
    leader: "bg-accent text-accent-foreground",
    people: "bg-secondary text-secondary-foreground",
    brand: "bg-brand-soft text-foreground",
    tech: "bg-success-soft text-foreground",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[accent]}`} />;
}

export default function AboutSection({ className, style }: AboutSectionProps) {
  return (
    <section className={["w-full bg-background", className].filter(Boolean).join(" ")} style={style} aria-label="About PropertyShodh">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-8 py-14 md:py-20">
        {/* Hero */}
        <header className="w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5">
            <Building2 className="h-4 w-4 text-foreground" aria-hidden="true" />
            <span className="text-xs font-medium tracking-wide text-foreground">PropertyShodh • Built in Aurangabad</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Bringing clarity to real estate—starting in Aurangabad
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
            Our mission is simple: make property discovery trustworthy, fast, and human.
            Our vision is bold: a transparent, tech‑powered marketplace that serves every
            home‑seeker in their own language.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Badge className="bg-secondary text-secondary-foreground rounded-full px-3 py-1">Verified Listings</Badge>
            <Badge className="bg-accent text-accent-foreground rounded-full px-3 py-1">AI‑Powered Search</Badge>
            <Badge className="bg-brand-soft text-foreground rounded-full px-3 py-1">Multi‑Language Support</Badge>
          </div>

          {/* Hype the instigators */}
          <div className="mx-auto max-w-3xl mt-6">
            <div className="rounded-2xl bg-brand-soft p-4 text-left">
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
                Born from the real problems of Aurangabad's property market
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                We heard the same stories again and again—unclear pricing, outdated postings,
                and wasted site visits. PropertyShodh began as a promise to fix this.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-secondary">
                  <div className="flex items-start gap-3">
                    <Goal className="h-5 w-5 mt-0.5 text-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="font-semibold">The frustration</h3>
                      <p className="text-sm text-muted-foreground">
                        Hidden details, unverifiable claims, and listings that led nowhere—home‑seekers
                        were spending time, not making progress.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-accent">
                  <div className="flex items-start gap-3">
                    <KeyRound className="h-5 w-5 mt-0.5 text-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="font-semibold">The insight</h3>
                      <p className="text-sm text-muted-foreground">
                        Trust is earned with verification, context, and speed—supported by tech,
                        delivered by people who care.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-brand-soft">
                  <div className="flex items-start gap-3">
                    <Blocks className="h-5 w-5 mt-0.5 text-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="font-semibold">The solution</h3>
                      <p className="text-sm text-muted-foreground">
                        A platform with verified listings, AI‑powered discovery, and local expertise—
                        purpose‑built for Aurangabad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Story: how each character joined */}
              <div className="rounded-xl bg-secondary p-5">
                <h4 className="font-semibold mb-3">How the team came together — the journey</h4>
                {/* Animated story cards */}
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.12 } },
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                >
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    className="rounded-lg bg-card border border-border p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft">
                        <Goal className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-xs text-muted-foreground">Chapter 1</div>
                        <div className="font-medium">The Spark</div>
                        <p className="mt-1 text-sm text-foreground">
                          Sudhakar draws the line—clarity or nothing. Rahul turns that resolve into momentum.
                          Domain bought. Promise made.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    className="rounded-lg bg-card border border-border p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                        <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-xs text-muted-foreground">Chapter 2</div>
                        <div className="font-medium">The Bridge</div>
                        <p className="mt-1 text-sm text-foreground">
                          Rahul reaches Chaitanya. He listens, maps the pulse—streets, builders, budgets—and
                          drafts the go‑to‑market path.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    className="rounded-lg bg-card border border-border p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent">
                        <Blocks className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-xs text-muted-foreground">Chapter 3</div>
                        <div className="font-medium">The Engine</div>
                        <p className="mt-1 text-sm text-foreground">
                          Chaitanya dials Yadish—precise, patient. Sketches become system: verified listings,
                          fast search, clean architecture.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    className="rounded-lg bg-card border border-border p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success-soft">
                        <Frame className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-xs text-muted-foreground">Chapter 4</div>
                        <div className="font-medium">The Build</div>
                        <p className="mt-1 text-sm text-foreground">
                          The four huddle—whiteboards, field notes, calls. Trust set, doors opened, story staged,
                          backbone shipped. The platform takes shape.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
                  A domain became a destination—built in Aurangabad, for Aurangabad.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-secondary">
                  <div className="flex items-start gap-3">
                    <House className="h-5 w-5 mt-0.5 text-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold">Origins</h4>
                      <p className="text-sm text-muted-foreground">
                        It started with a domain purchase and a commitment: build something better.
                        A small team formed around shared values—clarity, integrity, and speed.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-accent">
                  <div className="flex items-start gap-3">
                    <Frame className="h-5 w-5 mt-0.5 text-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold">Focus on Aurangabad</h4>
                      <p className="text-sm text-muted-foreground">
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
                            f.accent === "brand" ? "bg-brand-soft text-foreground" : "",
                            f.accent === "tech" ? "bg-success-soft text-foreground" : "",
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
                    <div className="relative overflow-hidden rounded-xl bg-secondary">
                      <img
                        src={f.image}
                        alt={`${f.name} portrait`}
                        className="block w-full h-48 md:h-56 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <ul className="grid gap-2">
                      {f.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft">
                            <Goal className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <p className="text-sm text-foreground">{h}</p>
                        </li>
                      ))}
                    </ul>
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
                <div className="p-5 rounded-xl bg-secondary">
                  <div className="flex items-start gap-3">
                    <KeyRound className="h-5 w-5 mt-0.5 text-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold">Verified Listings</h4>
                      <p className="text-sm text-muted-foreground">
                        Structured checks, documentation capture, and status freshness ensure what you see is accurate.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-accent">
                  <div className="flex items-start gap-3">
                    <Blocks className="h-5 w-5 mt-0.5 text-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold">AI‑Powered Search</h4>
                      <p className="text-sm text-muted-foreground">
                        Relevance tuned for local priorities—budget, commute, schools, and neighborhood vibe.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-brand-soft">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 mt-0.5 text-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <h4 className="font-semibold">Multi‑Language</h4>
                      <p className="text-sm text-muted-foreground">
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
  );
}