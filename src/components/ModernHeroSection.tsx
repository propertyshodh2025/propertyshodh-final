"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox'; // Import the new Combobox

// Dummy data for demonstration
const AURANGABAD_AREAS = [
  "Adalat Road", "Beed Bypass", "CIDCO", "Deolai", "Garkheda", "Harsul", "Jalna Road",
  "Kranti Chowk", "MGM Road", "N-1 CIDCO", "Osmanpura", "Pundaliknagar", "Satara Road",
  "Shahganj", "Ulka Nagari", "Waluj MIDC", "Zalta"
];

const PROPERTY_TYPES = [
  "residential", "commercial", "land", "industrial"
];

const PROPERTY_CATEGORIES = {
  residential: ["apartment", "house", "villa", "plot"],
  commercial: ["office", "shop", "showroom", "warehouse"],
  land: ["agricultural", "residential_plot", "commercial_plot"],
  industrial: ["factory", "shed", "industrial_plot"]
};

const BHK_OPTIONS = ["1BHK", "2BHK", "3BHK", "4BHK+", "Studio"];

const ModernHeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('residential');
  const [selectedPropertyCategory, setSelectedPropertyCategory] = useState('apartment');
  const [selectedBHK, setSelectedBHK] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('query', searchQuery);
    if (selectedPropertyType && selectedPropertyType !== 'all') params.append('property_type', selectedPropertyType);
    if (selectedPropertyCategory && selectedPropertyCategory !== 'all') params.append('property_category', selectedPropertyCategory);
    if (selectedBHK && selectedBHK !== 'all') params.append('bhk', selectedBHK);
    if (selectedLocation && selectedLocation !== 'all') params.append('location', selectedLocation);
    navigate(`/search?${params.toString()}`);
  };

  const availableCategories = PROPERTY_CATEGORIES[selectedPropertyType as keyof typeof PROPERTY_CATEGORIES] || [];

  const locationOptions = [
    { value: "all", label: t('all_locations') },
    ...AURANGABAD_AREAS.map(area => ({ value: area, label: area }))
  ];

  return (
    <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] flex items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/placeholder/img/hero-bg.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>
      <div className="relative z-10 text-center px-4 max-w-4xl w-full">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
          <TranslatableText text="Find Your Dream Property" />
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          <TranslatableText text="Explore thousands of listings, from cozy homes to commercial spaces." />
        </p>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Property Type */}
            <div className="relative">
              <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                <SelectTrigger className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent">
                  <SelectValue placeholder={t('property_type')} />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      <TranslatableText text={type.replace('_', ' ')} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Category */}
            <div className="relative">
              <Select value={selectedPropertyCategory} onValueChange={setSelectedPropertyCategory}>
                <SelectTrigger className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent">
                  <SelectValue placeholder={t('property_category')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      <TranslatableText text={category.replace('_', ' ')} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BHK */}
            <div className="relative">
              <Select value={selectedBHK} onValueChange={setSelectedBHK}>
                <SelectTrigger className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent">
                  <SelectValue placeholder={t('bhk')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all"><TranslatableText text="Any BHK" /></SelectItem>
                  {BHK_OPTIONS.map(bhk => (
                    <SelectItem key={bhk} value={bhk}>
                      <TranslatableText text={bhk} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Locations (now on its own line) */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <Combobox
              options={locationOptions}
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              placeholder={t('select_location')}
              emptyMessage={t('no_location_found')}
              searchPlaceholder={t('search_locations')}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Search Input and Button */}
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              placeholder={t('search_by_keyword')}
              className="flex-grow px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button
              onClick={handleSearch}
              className="w-full md:w-auto px-6 py-3 rounded-xl text-lg font-semibold bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Search size={20} />
              <TranslatableText text="Search" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHeroSection;