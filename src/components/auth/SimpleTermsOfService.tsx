import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const SimpleTermsOfService: React.FC = () => {
  return (
    <ScrollArea className="h-96 w-full rounded-md border p-4">
      <div className="space-y-4 text-sm">
        <h3 className="text-lg font-semibold mb-4">Terms of Service</h3>
        
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ Important RERA Disclaimer</h4>
            <div className="space-y-2 text-xs text-amber-700 dark:text-amber-300">
              <p><strong>Disclaimer:</strong> By using or accessing this Website, you agree with the Disclaimer without any qualification or limitation. This website is only for the purpose of providing information regarding real estate projects and properties in different geographies.</p>
              <p><strong>www.Propertyshodh.com</strong> is a real estate marketing website. The information regarding real estate projects and properties provided herein have been collected from publicly available sources, and is yet to be verified as per RERA guidelines.</p>
              <p>Further, the company has not checked the RERA registration status of the real estate projects listed herein. The company does not make any representation in regards to the compliances done against these projects.</p>
              <p>The Websites and all its content are provided with all faults on an "as is" and "as available" basis. You agree to our terms & Conditions, Cookie and Privacy Policy.</p>
            </div>
          </div>
          
          <p className="font-medium">By using PropertyShodh, you agree to these terms:</p>
          
          <div className="space-y-2">
            <p><strong>1. Service Agreement:</strong> PropertyShodh is a property discovery and listing platform operated by Property Shodh Private Limited.</p>
            
            <p><strong>2. User Eligibility:</strong> You must be 18 years or older with legal capacity to use our services. Minors may use under parental supervision.</p>
            
            <p><strong>3. Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</p>
            
            <p><strong>4. Accurate Information:</strong> You must provide accurate property and personal data. False or misleading information may result in account termination.</p>
            
            <p><strong>5. Prohibited Activities:</strong> You may not:
              <br />• Post false, misleading, or duplicate listings
              <br />• Upload defamatory, obscene, or illegal content  
              <br />• Attempt unauthorized access to systems
              <br />• Copy or scrape content without permission
              <br />• Send spam or unsolicited messages
            </p>
            
            <p><strong>6. Payment Terms:</strong> Some services require paid subscriptions. Fees must be paid in advance and are generally non-refundable except at our discretion.</p>
            
            <p><strong>7. Privacy & Data:</strong> We use your data to provide services, improve our platform, and connect you with relevant parties. We may share your information with agents and developers to fulfill your requirements.</p>
            
            <p><strong>8. Intellectual Property:</strong> All platform content, logos, and trademarks are exclusive property of PropertyShodh. You receive only limited usage rights.</p>
            
            <p><strong>9. Limitation of Liability:</strong> We act as an intermediary platform. We don't guarantee transaction completion and aren't responsible for disputes between users.</p>
            
            <p><strong>10. Communications:</strong> You consent to receive communications via SMS, email, WhatsApp, and platform notifications about inquiries, updates, or promotions.</p>
            
            <p><strong>11. Governing Law:</strong> These terms are governed by Indian law, with jurisdiction in Aurangabad (Chhatrapati Sambhajinagar), Maharashtra.</p>
            
            <p><strong>12. Updates:</strong> We may modify these terms at any time. Continued use constitutes acceptance of updated terms.</p>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Last updated: January 2024 | Effective immediately upon acceptance
          </p>
        </div>
      </div>
    </ScrollArea>
  );
};