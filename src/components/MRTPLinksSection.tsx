import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, FolderOpen } from 'lucide-react';

interface MRTPLinksSectionProps {}

const MRTPLinksSection: React.FC<MRTPLinksSectionProps> = () => {
  const mrtpLinks = [
    {
      id: 1,
      title: "Draft Development plan published under MRTP section 26.(4)",
      url: "https://drive.google.com/drive/folders/1KN8OJQ1HGUm9JVFNxyvrsY2Fm6x50PJT"
    },
    {
      id: 2,
      title: "Draft development plan published under MRTP section 28(4)",
      url: "https://drive.google.com/drive/folders/1n8DktI0ukzsg8CxjLvtbZaUmWLUqiR99"
    }
  ];

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">
          <span className="text-gray-900 dark:text-gray-100">
            MRTP Development Plans
          </span>
        </h2>
      </div>
      
      {/* MRTP Buttons */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {mrtpLinks.map((link) => (
          <div key={link.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {link.title}
            </h3>
            <Button 
              onClick={() => handleLinkClick(link.url)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Open Google Drive
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MRTPLinksSection;