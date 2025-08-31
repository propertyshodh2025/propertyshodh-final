
import { QuestionOption, Property } from '@/types/property';

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

export const aurangabadLocalities: QuestionOption[] = [
  { id: 'cidco', label: 'CIDCO', icon: 'MapPin' },
  { id: 'osmanpura', label: 'Osmanpura', icon: 'MapPin' },
  { id: 'garkheda', label: 'Garkheda', icon: 'MapPin' },
  { id: 'beed-bypass', label: 'Beed Bypass', icon: 'MapPin' },
  { id: 'waluj', label: 'Waluj', icon: 'MapPin' },
  { id: 'paithan-road', label: 'Paithan Road', icon: 'MapPin' },
  { id: 'kanchanwadi', label: 'Kanchanwadi', icon: 'MapPin' },
  { id: 'jalna-road', label: 'Jalna Road', icon: 'MapPin' },
  { id: 'samarth-nagar', label: 'Samarth Nagar', icon: 'MapPin' },
  { id: 'aurangpura', label: 'Aurangpura', icon: 'MapPin' },
  { id: 'shahgunj', label: 'Shahgunj', icon: 'MapPin' },
  { id: 'gulmandi', label: 'Gulmandi', icon: 'MapPin' },
  { id: 'ulkanagari', label: 'Ulkanagari', icon: 'MapPin' },
  { id: 'jyoti-nagar', label: 'Jyoti Nagar', icon: 'MapPin' },
  { id: 'bansilal-nagar', label: 'Bansilal Nagar', icon: 'MapPin' },
  { id: 'shreya-nagar', label: 'Shreya Nagar', icon: 'MapPin' },
  { id: 'satara-parisar', label: 'Satara Parisar', icon: 'MapPin' },
  { id: 'padegaon', label: 'Padegaon', icon: 'MapPin' },
  { id: 'harsul', label: 'Harsul', icon: 'MapPin' },
  { id: 'mukundwadi', label: 'Mukundwadi', icon: 'MapPin' },
  { id: 'naregaon', label: 'Naregaon', icon: 'MapPin' },
  { id: 'chikalthana', label: 'Chikalthana', icon: 'MapPin' },
  { id: 'shendra-midc', label: 'Shendra MIDC', icon: 'MapPin' },
  { id: 'begumpura', label: 'Begumpura', icon: 'MapPin' },
  { id: 'jadhavwadi', label: 'Jadhavwadi', icon: 'MapPin' },
  { id: 'pundlik-nagar', label: 'Pundlik Nagar', icon: 'MapPin' },
  { id: 'deolai', label: 'Deolai', icon: 'MapPin' },
  { id: 'chishtiya-colony', label: 'Chishtiya Colony', icon: 'MapPin' },
  { id: 'jawahar-colony', label: 'Jawahar Colony', icon: 'MapPin' },
  { id: 'station-road', label: 'Station Road', icon: 'MapPin' },
  { id: 'vedant-nagar', label: 'Vedant Nagar', icon: 'MapPin' },
  { id: 'bajaj-nagar', label: 'Bajaj Nagar', icon: 'MapPin' },
  { id: 'nakshatrawadi', label: 'Nakshatrawadi', icon: 'MapPin' },
  { id: 'mondha-naka', label: 'Mondha Naka', icon: 'MapPin' },
  { id: 'bhavsinghpura', label: 'Bhavsinghpura', icon: 'MapPin' },
  { id: 'mgm', label: 'MGM (Mahatma Gandhi Mission)', icon: 'MapPin' },
  { id: 'nirala-bazar', label: 'Nirala Bazar', icon: 'MapPin' },
  { id: 'town-centre', label: 'Town Centre', icon: 'MapPin' },
  { id: 'mayur-park', label: 'Mayur Park', icon: 'MapPin' },
  { id: 'khadkeshwar', label: 'Khadkeshwar', icon: 'MapPin' },
  { id: 'padampura', label: 'Padampura', icon: 'MapPin' },
  { id: 'dashmesh-nagar', label: 'Dashmesh Nagar', icon: 'MapPin' },
  { id: 'shahanurwadi', label: 'Shahanurwadi', icon: 'MapPin' },
  { id: 'kotla-colony', label: 'Kotla Colony', icon: 'MapPin' },
  { id: 'itkheda', label: 'Itkheda', icon: 'MapPin' },
  { id: 'new-usmanpura', label: 'New Usmanpura', icon: 'MapPin' },
  { id: 'seven-hills', label: 'Seven Hills', icon: 'MapPin' },
  { id: 'tilak-nagar', label: 'Tilak Nagar', icon: 'MapPin' },
  { id: 'kranti-chowk', label: 'Kranti Chowk', icon: 'MapPin' },
  { id: 'sillod-road', label: 'Sillod Road', icon: 'MapPin' },
  { id: 'all', label: 'All Locations', icon: 'Globe' }
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
