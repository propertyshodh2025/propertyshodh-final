import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const SimplePrivacyPolicy: React.FC = () => {
  return (
    <ScrollArea className="h-96 w-full rounded-md border p-4">
      <div className="space-y-4 text-sm">
        <h3 className="text-lg font-semibold mb-4">Privacy Policy</h3>
        
        <div className="space-y-3">
          <p className="font-medium">PropertyShodh is committed to protecting your privacy and personal information.</p>
          
          <div className="space-y-2">
            <p><strong>1. Information We Collect:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Personal Information: Name, phone number, email address, residential address, profile photo</li>
              <li>• Property Information: Details of properties you list (location, price, documents, images)</li>
              <li>• Usage Data: Log data, device type, browser type, IP address, activity on the platform</li>
              <li>• Communications: Messages, feedback, inquiries through the platform, SMS, email, or WhatsApp</li>
            </ul>
            
            <p><strong>2. How We Use Your Information:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Create and manage user accounts</li>
              <li>• Enable property listings, searches, and recommendations</li>
              <li>• Share your property details with relevant buyers, sellers, or agents</li>
              <li>• Improve our services through analytics and feedback</li>
              <li>• Send updates, promotional content, or notifications</li>
              <li>• Detect, prevent, and address fraud or technical issues</li>
            </ul>
            
            <p><strong>3. Information Sharing:</strong> We may share your information with:</p>
            <ul className="ml-4 space-y-1">
              <li>• Business Partners: Agents, developers, and sellers to fulfill property requirements</li>
              <li>• Service Providers: For hosting, payment processing, SMS/email delivery, or analytics</li>
              <li>• Legal Authorities: If required under law, regulation, or court order</li>
            </ul>
            
            <p><strong>4. Data Security:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• All personal data is protected with encryption and secure servers</li>
              <li>• Sensitive details (passwords) are stored in encrypted format</li>
              <li>• Payment transactions handled through trusted gateways</li>
              <li>• We do not store your debit/credit card details</li>
            </ul>
            
            <p><strong>5. Your Rights:</strong> You have the right to:</p>
            <ul className="ml-4 space-y-1">
              <li>• Access and review your personal information</li>
              <li>• Correct or update inaccurate data</li>
              <li>• Request deletion of your account and personal data</li>
              <li>• Opt out of promotional messages at any time</li>
            </ul>
            
            <p><strong>6. Cookies & Tracking:</strong> We use cookies to improve user experience, remember login sessions, provide personalized recommendations, and track website performance.</p>
            
            <p><strong>7. Data Retention:</strong> We retain your information as long as your account is active, or as needed to provide services, resolve disputes, and comply with legal obligations.</p>
            
            <p><strong>8. Children's Privacy:</strong> Our services are intended for users 18 years and above. Minors may use the platform only under parental/guardian supervision.</p>
            
            <p><strong>9. Contact Us:</strong> For privacy-related queries, contact us at info@propertyshodh.com or our registered office in Aurangabad, Maharashtra.</p>
            
            <p><strong>10. Updates:</strong> We may update this Privacy Policy from time to time. Updated versions will be posted on the platform with the effective date.</p>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Effective Date: 15-August-2025 | By using PropertyShodh, you consent to this Privacy Policy
          </p>
        </div>
      </div>
    </ScrollArea>
  );
};