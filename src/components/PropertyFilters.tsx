import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { AURANGABAD_AREAS } from '@/lib/aurangabadAreas';

interface PropertyFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCity: string;
  setSelectedCity: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedBHK: string;
  setSelectedBHK: (value: string) => void;
  priceRange: string;
  setPriceRange: (value: string) => void;
  selectedTransaction: string;
  setSelectedTransaction: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  uniqueCities: string[];
  uniqueTypes: string[];
  uniqueTransactions: string[];
  uniqueCategories: string[];
  showFilters?: boolean;
  onToggleFilters?: () => void;
  onClearFilters?: () => void;
}

export const PropertyFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCity,
  setSelectedCity,
  selectedType,
  setSelectedType,
  selectedBHK,
  setSelectedBHK,
  priceRange,
  setPriceRange,
  selectedTransaction,
  setSelectedTransaction,
  selectedCategory,
  setSelectedCategory,
  uniqueCities,
  uniqueTypes,
  uniqueTransactions,
  uniqueCategories,
  showFilters = true,
  onToggleFilters,
  onClearFilters
}: PropertyFiltersProps) => {
  const hasActiveFilters = selectedCity !== 'all' || 
                          selectedType !== 'all' || 
                          selectedBHK !== 'all' || 
                          priceRange !== 'all' || 
                          selectedTransaction !== 'all' || 
                          selectedCategory !== 'all' ||
                          searchTerm.trim() !== '';

  if (!showFilters) return null;

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Search & Filter</CardTitle>
        <div className="flex items-center gap-2">
          {hasActiveFilters && onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2 lg:px-3"
            >
              Clear all
              <X className="ml-1 h-4 w-4" />
            </Button>
          )}
          {onToggleFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFilters}
              className="h-8 px-2 lg:px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          <Input
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lg:col-span-2"
          />
          
          <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
            <SelectTrigger>
              <SelectValue placeholder="Transaction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              {uniqueTransactions.map(transaction => (
                <SelectItem key={transaction} value={transaction}>
                  {transaction?.charAt(0).toUpperCase() + transaction?.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category?.charAt(0).toUpperCase() + category?.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger>
              <SelectValue placeholder="Areas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {AURANGABAD_AREAS.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBHK} onValueChange={setSelectedBHK}>
            <SelectTrigger>
              <SelectValue placeholder="BHK" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any BHK</SelectItem>
              <SelectItem value="1">1 BHK</SelectItem>
              <SelectItem value="2">2 BHK</SelectItem>
              <SelectItem value="3">3 BHK</SelectItem>
              <SelectItem value="4">4 BHK</SelectItem>
              <SelectItem value="5">5+ BHK</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Price</SelectItem>
              <SelectItem value="under-50">Under ₹50L</SelectItem>
              <SelectItem value="50-100">₹50L - ₹1Cr</SelectItem>
              <SelectItem value="100-200">₹1Cr - ₹2Cr</SelectItem>
              <SelectItem value="above-200">Above ₹2Cr</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};