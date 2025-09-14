import React from 'react';
import { Building2, Brain, Rocket, Trophy, Star, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { founders, companyStory, platformFeatures } from '@/data/founders';

const AboutPageSimple = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <Building2 className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              PropertyShodh
            </h1>
          </div>
          <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Born in the heart of <span className="font-bold text-orange-600">Chhatrapati Sambhajinagar</span>, 
            built by visionaries who dared to revolutionize real estate discovery
          </p>
        </div>

        {/* Origin Story */}
        <div className="mb-20">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <Rocket className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-gray-800 mb-6">The Genesis</h2>
              </div>
              
              <div className="max-w-4xl mx-auto text-lg text-gray-700 leading-relaxed space-y-6">
                <p>
                  In September 2025, two visionary minds in Aurangabad—<strong>Sudhakar Muley</strong> and <strong>Rahul Jaiswal</strong>—
                  identified a massive problem plaguing their beloved city. Property hunting was a nightmare of endless broker visits, 
                  inconsistent pricing, and unreliable information.
                </p>
                
                <p>
                  They didn't just complain—they acted! After conceptualizing the revolutionary PropertyShodh platform, 
                  they immediately secured the domain, marking the birth of Aurangabad's first homegrown prop-tech startup.
                </p>
                
                <p>
                  Rahul then reached out to his strategic connection, <strong>Chaitanya Kapure</strong>—a creative genius 
                  initially brought in for development. However, recognizing Chaitanya's exceptional marketing prowess, 
                  the team pivoted brilliantly when Chaitanya connected them with <strong>Yadish Shaikh</strong>—
                  the tech wizard who would architect their digital dreams into reality.
                </p>
                
                <div className="bg-white/80 rounded-xl p-6 mt-8">
                  <p className="text-xl font-semibold text-center text-blue-800">
                    "Four minds, one vision—to make property discovery in Aurangabad as simple as booking a train ticket!"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission & Vision */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <Target className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
                <p className="text-gray-700 text-lg">
                  {companyStory.mission}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
                <p className="text-gray-700 text-lg">
                  {companyStory.vision}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Founders Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet the Dream Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four extraordinary minds who dared to challenge the status quo and revolutionize real estate in Aurangabad
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {founders.map((founder, index) => (
              <div key={index} className="transition-transform hover:scale-105 duration-300">
                <Card className={`h-full shadow-2xl border-0 overflow-hidden ${
                  founder.isSpecial ? 'ring-4 ring-purple-300 ring-opacity-50' : ''
                }`}>
                  <div className={`h-2 bg-gradient-to-r ${founder.gradient}`} />
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${founder.gradient} text-white`}>
                        <founder.icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">{founder.name}</h3>
                        <Badge variant="outline" className="mb-2">{founder.role}</Badge>
                        <p className={`text-lg font-semibold bg-gradient-to-r ${founder.gradient} bg-clip-text text-transparent`}>
                          {founder.title}
                        </p>
                        {founder.isSpecial && (
                          <div className="flex gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {founder.description}
                    </p>
                    
                    <div className="space-y-2">
                      {founder.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                          <span className="text-sm text-gray-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="mb-20">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <Star className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-gray-800 mb-6">The PropertyShodh Revolution</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {platformFeatures.map((feature, idx) => (
                  <div key={idx} className="text-center p-6 bg-white/60 rounded-xl">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h4 className="font-bold text-gray-800 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Future Vision */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-0 shadow-xl">
            <CardContent className="p-12">
              <Rocket className="w-16 h-16 text-orange-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Looking Ahead</h2>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8">
                PropertyShodh started in Aurangabad, but our vision extends far beyond. We're building the model 
                for transparent, tech-first real estate across India. In 5 years, we want Aurangabad to proudly say:
              </p>
              <div className="bg-white/80 rounded-xl p-8 max-w-3xl mx-auto">
                <p className="text-2xl font-bold text-orange-600">
                  "{companyStory.futureGoal}"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPageSimple;