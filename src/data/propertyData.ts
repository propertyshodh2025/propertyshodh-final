
import { QuestionOption, Property } from '@/types/property';
import { AURANGABAD_AREAS } from '@/lib/aurangabadAreas';

export const propertyTypes: QuestionOption[] = [
  { id: 'apartment', label: 'Flat/Apartment', icon: 'Building' },
  { id: 'bungalow', label: 'Bungalow', icon: 'Home' },
  { id: 'villa', label: 'Villa', icon: 'Castle' },
  { id: 'land', label: 'Land/Plot', icon: 'MapPin' },
  { id: 'commercial', label: 'Commercial', icon: 'Building2' },
  { id: 'all', label: 'All Property Types', icon: 'Grid3X3' }
];

export const budgetRanges: QuestionOption[] = [
  { id: 'under25', label: 'Under ₹25L', icon: 'IndianRupee' },
  { id: '25-50', label: '₹25-50L', icon: 'IndianRupee' },
  { id: '50-75', label: '₹50-75L', icon: 'IndianRupee' },
  { id: '75-100', label: '₹75L-1Cr', icon: 'IndianRupee' },
  { id: 'above100', label: 'Above ₹1Cr', icon: 'IndianRupee' },
  { id: 'all', label: 'All Budget Ranges', icon: 'CircleDollarSign' }
];

// Generate aurangabadLocalities from comprehensive AURANGABAD_AREAS
export const aurangabadLocalities: QuestionOption[] = [
  ...AURANGABAD_AREAS.map(area => ({
    id: area.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    label: area,
    icon: 'MapPin' as const
  })),
  { id: 'all', label: 'All Locations', icon: 'Globe' as const }
];

export const bedroomOptions: QuestionOption[] = [
  { id: '1bhk', label: '1 BHK', icon: 'Bed' },
  { id: '2bhk', label: '2 BHK', icon: 'Bed' },
  { id: '3bhk', label: '3 BHK', icon: 'Bed' },
  { id: '4bhk', label: '4+ BHK', icon: 'Bed' },
  { id: 'all', label: 'All Room Configurations', icon: 'Home' }
];

export const sampleProperties: Property[] = [
  {
    id: 1,
    title: "Luxury 3BHK Apartment in CIDCO",
    price: "₹85,00,000",
    location: "CIDCO N-7, Aurangabad",
    bedrooms: 3,
    bathrooms: 3,
    area: "1250 sq ft",
    type: "Apartment",
    status: "Available",
    furnishing: "Semi Furnished",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    description: "Premium 3BHK apartment in prime CIDCO location with modern amenities and excellent connectivity.",
    highlights: ["Prime Location", "Spacious Rooms", "Modern Kitchen", "Parking Available"],
    amenities: [
      { name: "Swimming Pool", icon: "Waves" },
      { name: "Gym", icon: "Dumbbell" },
      { name: "Security", icon: "Shield" }
    ],
    specifications: [
      { label: "Built Year", value: "2019" },
      { label: "Floor", value: "5th of 8" },
      { label: "Facing", value: "East" }
    ],
    coordinates: { lat: 19.8762, lng: 75.3433 },
    agentContact: {
      name: "Rajesh Sharma",
      phone: "+91 9876543210",
      whatsapp: "+91 9876543210"
    }
  },
  {
    id: 2,
    title: "Beautiful Villa in Kanchanwadi",
    price: "₹1,25,00,000",
    location: "Kanchanwadi, Aurangabad",
    bedrooms: 4,
    bathrooms: 4,
    area: "2100 sq ft",
    type: "Villa",
    status: "Available",
    furnishing: "Fully Furnished",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    description: "Stunning 4BHK villa with garden and modern amenities in peaceful Kanchanwadi area.",
    highlights: ["Garden Area", "Premium Interiors", "Car Parking", "Quiet Neighborhood"],
    amenities: [
      { name: "Garden", icon: "TreePine" },
      { name: "Parking", icon: "Car" },
      { name: "Power Backup", icon: "Zap" }
    ],
    specifications: [
      { label: "Built Year", value: "2020" },
      { label: "Plot Size", value: "3000 sq ft" },
      { label: "Facing", value: "North" }
    ],
    coordinates: { lat: 19.8567, lng: 75.3267 },
    agentContact: {
      name: "Priya Patil",
      phone: "+91 9876543211",
      whatsapp: "+91 9876543211"
    }
  }
];
