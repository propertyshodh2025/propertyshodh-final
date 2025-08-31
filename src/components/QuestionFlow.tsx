
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { propertyTypes, budgetRanges, aurangabadLocalities, bedroomOptions } from '@/data/propertyData';
import { LocationSelector } from './LocationSelector';
import { QuestionFlowState, QuestionOption } from '@/types/property';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserContact } from '@/contexts/UserContactContext';
import { useAuth } from '@/contexts/AuthContext';

interface QuestionFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (answers: QuestionFlowState) => void;
}

const purposeOptions: QuestionOption[] = [
  { id: 'buy', label: 'Buy Property', icon: 'ShoppingCart' },
  { id: 'rent', label: 'Rent Property', icon: 'Home' },
  { id: 'lease', label: 'Lease Property', icon: 'FileText' },
  { id: 'invest', label: 'Investment', icon: 'TrendingUp' }
];

export const QuestionFlow: React.FC<QuestionFlowProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setUserContact } = useUserContact();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<QuestionFlowState>({
    purpose: null,
    propertyType: null,
    budgetRange: null,
    location: null,
    bedrooms: null,
    bathrooms: null,
    name: null,
    phone: null,
    countryCode: '+91',
    currentStep: 0,
    isComplete: false
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const questions = [
    {
      id: 'purpose',
      title: 'RADAR SCAN INITIALIZATION',
      question: 'What is your primary purpose?',
      options: purposeOptions
    },
    {
      id: 'propertyType',
      title: 'RADAR SCAN PHASE 1',
      question: 'What type of property are you scanning for?',
      options: propertyTypes
    },
    {
      id: 'budgetRange',
      title: 'RADAR SCAN PHASE 2', 
      question: "What's your budget radar range?",
      options: budgetRanges
    },
    {
      id: 'location',
      title: 'RADAR SCAN PHASE 3',
      question: 'Which zone are you targeting?',
      options: aurangabadLocalities
    },
    {
      id: 'bedrooms',
      title: 'RADAR SCAN PHASE 4',
      question: 'How many bedrooms are you looking for?',
      options: bedroomOptions,
      conditional: true
    },
    {
      id: 'bathrooms',
      title: 'RADAR SCAN PHASE 5',
      question: 'How many bathrooms do you need?',
      options: [
        { id: '1', label: '1 Bathroom', icon: 'Bath' },
        { id: '2', label: '2 Bathrooms', icon: 'Bath' },
        { id: '3', label: '3 Bathrooms', icon: 'Bath' },
        { id: '4+', label: '4+ Bathrooms', icon: 'Bath' }
      ],
      conditional: true
    },
    {
      id: 'contact',
      title: 'RADAR SCAN FINALIZATION',
      question: 'Please provide your contact details',
      isContactForm: true
    }
  ];

  const currentQuestion = questions[currentStep];
  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const shouldShowBedroomQuestion = () => {
    return answers.propertyType !== 'land' && answers.propertyType !== 'commercial';
  };

  const handleOptionSelect = (optionId: string) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: optionId,
      currentStep: currentStep
    };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentStep === 3 && !shouldShowBedroomQuestion()) {
        // Skip bedroom and bathroom questions, go to contact form
        setCurrentStep(6);
      } else if (currentStep === 4 && !shouldShowBedroomQuestion()) {
        // Skip bathroom question, go to contact form
        setCurrentStep(6);
      } else if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 300);
  };

  const handleLocationChange = (locations: string[]) => {
    setSelectedLocations(locations);
    const locationValue = locations.length === 0 ? null : locations.includes('all') ? 'all' : locations.join(',');
    setAnswers({
      ...answers,
      location: locationValue,
      currentStep: currentStep
    });
  };

  const handleLocationNext = () => {
    if (selectedLocations.length > 0) {
      setTimeout(() => {
        if (currentStep === 3 && !shouldShowBedroomQuestion()) {
          // Skip bedroom and bathroom questions, go to contact form
          setCurrentStep(6);
        } else if (currentStep === 4 && !shouldShowBedroomQuestion()) {
          // Skip bathroom question, go to contact form
          setCurrentStep(6);
        } else if (currentStep < questions.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }, 300);
    }
  };

  const handleContactSubmit = async () => {
    if (answers.name && answers.phone) {
      setLoading(true);
      
      try {
        // Combine country code with phone number
        const fullPhoneNumber = `${answers.countryCode || '+91'}${answers.phone}`;
        
        // Save inquiry to database
        const { error } = await supabase
          .from('user_inquiries')
          .insert([{
            name: answers.name,
            phone: fullPhoneNumber,
            purpose: answers.purpose,
            property_type: answers.propertyType,
            budget_range: answers.budgetRange,
            location: answers.location,
            bedrooms: answers.bedrooms,
            bathrooms: answers.bathrooms,
            is_verified: !!user
          }]);

        if (error) throw error;

        // Store user contact in session for future use
        setUserContact({
          name: answers.name,
          phone: answers.phone,
          countryCode: answers.countryCode || '+91',
          sessionStartTime: new Date().toISOString()
        });

        toast({
          title: "Success!",
          description: "Your property inquiry has been submitted successfully. We'll contact you soon!",
        });

        const finalAnswers = { ...answers, isComplete: true };
        console.log('Complete form data:', finalAnswers);
        onComplete(finalAnswers);
      } catch (error) {
        console.error('Error saving inquiry:', error);
        toast({
          title: "Error",
          description: "Failed to submit inquiry. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      if (currentStep === 6 && !shouldShowBedroomQuestion()) {
        // Skip bedroom and bathroom questions when going back
        setCurrentStep(3);
      } else if (currentStep === 5 && !shouldShowBedroomQuestion()) {
        // Skip bathroom question when going back
        setCurrentStep(3);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Circle;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-card border-border relative overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground hover:text-muted-foreground transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-6 pb-0 bg-card shrink-0">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-400 font-mono text-sm">{currentQuestion.title}</span>
              <span className="text-blue-400 font-mono text-sm">
                SCAN {Math.round(progress)}% COMPLETE
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pt-0">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              {currentQuestion.question}
            </h2>

            {currentQuestion.isContactForm ? (
              <div className="space-y-6 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={answers.name || ''}
                    onChange={(e) => setAnswers({...answers, name: e.target.value})}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Mobile Number</Label>
                  <div className="flex gap-2">
                    <select
                      className="bg-background border border-border text-foreground rounded-md px-3 py-2 min-w-[100px]"
                      value={answers.countryCode || '+91'}
                      onChange={(e) => setAnswers({...answers, countryCode: e.target.value})}
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+971">🇦🇪 +971</option>
                    </select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 10 digit number"
                      maxLength={10}
                      value={answers.phone || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setAnswers({...answers, phone: value});
                      }}
                      className="bg-background border-border text-foreground flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Final number: {(answers.countryCode || '+91')}{answers.phone || 'XXXXXXXXXX'}
                  </p>
                </div>
                <Button
                  onClick={handleContactSubmit}
                  disabled={!answers.name || !answers.phone || loading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-bold text-lg"
                >
                  {loading ? 'Submitting...' : 'Complete Radar Scan'}
                </Button>
              </div>
            ) : currentQuestion.id === 'location' ? (
              <div className="mb-8">
                <LocationSelector
                  selectedLocations={selectedLocations}
                  onLocationChange={handleLocationChange}
                />
                {selectedLocations.length > 0 && (
                  <div className="mt-6 text-center">
                    <Button
                      onClick={handleLocationNext}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white px-8 py-2"
                    >
                      Continue Scan
                      <ChevronRight className="ml-2" size={16} />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.options?.map((option) => {
                  const IconComponent = getIconComponent(option.icon);
                  const isSelected = answers[currentQuestion.id as keyof QuestionFlowState] === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 text-left hover:scale-105 ${
                        isSelected
                          ? 'border-green-400 bg-green-400/10 shadow-lg shadow-green-400/25'
                          : 'border-border hover:border-green-400/50 bg-card/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${
                          isSelected ? 'bg-green-400 text-background' : 'bg-muted text-green-400'
                        }`}>
                          <IconComponent size={20} />
                        </div>
                        <span className={`font-medium ${
                          isSelected ? 'text-green-400' : 'text-foreground'
                        }`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                className="border-border text-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="mr-2" size={16} />
                Previous
              </Button>

              <div className="text-center text-muted-foreground font-mono text-sm">
                Step {currentStep + 1} of {totalSteps}
              </div>

              <div className="w-20" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
