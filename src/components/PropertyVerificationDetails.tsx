import React, { useState } from 'react';
import { Shield, FileText, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import VerificationBadge from '@/components/VerificationBadge';

interface PropertyVerificationDetailsProps {
  verificationDetails: any;
}

const PropertyVerificationDetails: React.FC<PropertyVerificationDetailsProps> = ({ 
  verificationDetails 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const verificationScore = verificationDetails.completeness_score || 0;

  const verificationItems = [
    {
      label: 'Ownership Type',
      value: verificationDetails.ownership_type || 'N/A',
      verified: !!verificationDetails.ownership_type
    },
    {
      label: 'Construction Status',
      value: verificationDetails.construction_status || 'N/A',
      verified: !!verificationDetails.construction_status
    },
    {
      label: 'Property Condition',
      value: verificationDetails.property_condition || 'N/A',
      verified: !!verificationDetails.property_condition
    },
    {
      label: 'Property Age',
      value: verificationDetails.property_age || 'N/A',
      verified: !!verificationDetails.property_age
    },
    {
      label: 'Title Clear',
      value: verificationDetails.title_clear ? 'Yes' : 'Not Verified',
      verified: verificationDetails.title_clear
    },
    {
      label: 'Actual Photos',
      value: verificationDetails.actual_photos_uploaded ? 'Uploaded' : 'Not Uploaded',
      verified: verificationDetails.actual_photos_uploaded
    }
  ];

  return (
    <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl text-foreground flex items-center gap-3">
          <Shield className="text-green-500" size={24} />
          Property Verification
          <VerificationBadge
            status="verified"
            score={verificationScore}
            showScore={true}
            size="sm"
          />
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-between bg-white/5 border-white/20 hover:bg-white/10 rounded-xl p-4"
            >
              <span className="flex items-center gap-2">
                <FileText size={16} />
                View Verification Details
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Verified by Admin
                </Badge>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </div>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-6 space-y-6">
            {/* Verification Score */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-green-800 dark:text-green-200">Verification Score</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{verificationScore}%</span>
              </div>
              <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                <div 
                  className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${verificationScore}%` }}
                />
              </div>
            </div>

            {/* Verification Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verificationItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    {item.verified ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <AlertCircle size={16} className="text-orange-500" />
                    )}
                    <span className="font-medium text-muted-foreground text-sm">{item.label}</span>
                  </div>
                  <span className="text-foreground font-semibold text-sm">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Contact Information */}
            <div className="space-y-4 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Verified Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300 text-sm">Name:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">{verificationDetails.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300 text-sm">Contact:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">{verificationDetails.contact_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300 text-sm">Email:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">{verificationDetails.email_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300 text-sm">Language:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100 text-sm capitalize">{verificationDetails.language_preference}</span>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {verificationDetails.additional_notes && (
              <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border border-gray-200/50 dark:border-gray-800/50">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Additional Notes</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {verificationDetails.additional_notes}
                </p>
              </div>
            )}

            {/* Verification Date */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t border-white/10">
              Verified on {new Date(verificationDetails.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default PropertyVerificationDetails;