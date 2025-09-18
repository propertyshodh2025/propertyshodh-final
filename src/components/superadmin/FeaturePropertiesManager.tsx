import React, { useEffect, useState, useMemo } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, ExternalLink, X, Clock, TrendingUp, Calendar, Filter, Settings, Eye, BarChart3, Plus, Search, ArrowUpDown, Activity, CalendarClock } from 'lucide-react';
import FeaturedPropertiesActivityLog from './FeaturedPropertiesActivityLog';
import FeaturedPropertiesScheduler from './FeaturedPropertiesScheduler';
import { Property } from '@/types/database';
import { formatINRShort } from '@/lib/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FeaturedPropertyStats {
  totalFeatured: number;
  activeFeatured: number;
  expiredFeatured: number;
  totalRevenue: number;
}

interface FeaturingPackage {
  id: string;
  name: string;
  duration: number; // in days
  priority: number;
  price: number;
  features: string[];
}

const FEATURING_PACKAGES: FeaturingPackage[] = [
  {
    id: 'basic',
    name: 'Basic Featured',
    duration: 7,
    priority: 1,
    price: 999,
    features: ['Featured badge', 'Basic highlighting', 'Standard positioning']
  },
  {
    id: 'premium',
    name: 'Premium Featured',
    duration: 15,
    priority: 2,
    price: 1999,
    features: ['Premium badge', 'Enhanced highlighting', 'Top positioning', 'Analytics dashboard']
  },
  {
    id: 'platinum',
    name: 'Platinum Featured',
    duration: 30,
    priority: 3,
    price: 3999,
    features: ['Platinum badge', 'Maximum visibility', 'Priority positioning', 'Advanced analytics', 'Marketing boost']
  }
];

const PRESET_DURATIONS = [
  { key: '2d', label: '2 Days', days: 2 },
  { key: '1w', label: '1 Week', days: 7 },
  { key: '2w', label: '2 Weeks', days: 14 },
  { key: '1m', label: '1 Month', days: 30 },
  { key: '3m', label: '3 Months', days: 90 },
];

const FeaturePropertiesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'featured' | 'all' | 'analytics' | 'activity' | 'scheduler'>('featured');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'featured' | 'not_featured'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'price' | 'featured_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState<FeaturedPropertyStats>({
    totalFeatured: 0,
    activeFeatured: 0,
    expiredFeatured: 0,
    totalRevenue: 0
  });
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchFeaturedProperties(),
        fetchAllProperties(),
        fetchStats()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProperties = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('properties')
        .select('*')
        .eq('is_featured', true)
        .order('featured_at', { ascending: false });

      if (error) throw error;
      setFeaturedProperties(data || []);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch featured properties",
        variant: "destructive",
      });
    }
  };

  const fetchAllProperties = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('properties')
        .select('*')
        .eq('approval_status', 'approved')
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .limit(500);

      if (error) throw error;
      
      // Filter and sanitize property data to ensure no empty property_type values
      const sanitizedData = (data || []).map(property => ({
        ...property,
        property_type: property.property_type && property.property_type.trim() !== '' 
          ? property.property_type 
          : 'Other'
      }));
      
      setAllProperties(sanitizedData);
    } catch (error) {
      console.error('Error fetching all properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      });
    }
  };

  const fetchStats = async () => {
    try {
      const { data: featuredData, error } = await adminSupabase
        .from('properties')
        .select('is_featured, featured_until')
        .eq('is_featured', true);

      if (error) throw error;

      const now = new Date();
      const active = featuredData.filter(p => 
        !p.featured_until || new Date(p.featured_until) > now
      ).length;
      const expired = featuredData.filter(p => 
        p.featured_until && new Date(p.featured_until) <= now
      ).length;

      setStats({
        totalFeatured: featuredData.length,
        activeFeatured: active,
        expiredFeatured: expired,
        totalRevenue: 0 // We can calculate this based on featuring packages
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Feature property with package or custom duration
  const handleFeatureProperty = async (propertyId: string, duration: number, packageType?: string) => {
    try {
      const now = new Date();
      const until = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
      
      const updateData: any = {
        is_featured: true,
        featured_at: now.toISOString(),
        featured_until: until.toISOString(),
        approval_status: 'approved',
        listing_status: 'Active'
      };

      if (packageType) {
        updateData.featuring_package = packageType;
      }

      const { error } = await adminSupabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId);

      if (error) throw error;
      
      await fetchData();
      toast({
        title: "Success",
        description: `Property featured ${packageType ? `with ${packageType} package` : ''} until ${until.toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Error featuring property:', error);
      toast({
        title: "Error",
        description: "Failed to feature property",
        variant: "destructive",
      });
    }
  };

  const handleUnfeatureProperty = async (propertyId: string) => {
    try {
      const { error } = await adminSupabase
        .from('properties')
        .update({ 
          is_featured: false, 
          featured_at: null, 
          featured_until: null,
          featuring_package: null
        })
        .eq('id', propertyId);

      if (error) throw error;
      
      await fetchData();
      toast({
        title: "Success",
        description: "Property unfeatured successfully",
      });
    } catch (error) {
      console.error('Error unfeaturing property:', error);
      toast({
        title: "Error",
        description: "Failed to unfeature property",
        variant: "destructive",
      });
    }
  };

  // Bulk operations
  const handleBulkFeature = async (duration: number, packageType?: string) => {
    if (selectedProperties.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select properties to feature",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const propertyId of selectedProperties) {
        await handleFeatureProperty(propertyId, duration, packageType);
      }
      setSelectedProperties([]);
      toast({
        title: "Success",
        description: `${selectedProperties.length} properties featured successfully`,
      });
    } catch (error) {
      console.error('Error in bulk feature:', error);
    }
  };

  const handleBulkUnfeature = async () => {
    if (selectedProperties.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select properties to unfeature",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const propertyId of selectedProperties) {
        await handleUnfeatureProperty(propertyId);
      }
      setSelectedProperties([]);
      toast({
        title: "Success",
        description: `${selectedProperties.length} properties unfeatured successfully`,
      });
    } catch (error) {
      console.error('Error in bulk unfeature:', error);
    }
  };

  const openPropertyInNewTab = (propertyId: string) => {
    window.open(`/property/${propertyId}`, '_blank');
  };

  const isPropertyExpired = (property: Property) => {
    return property.is_featured && property.featured_until ? 
      new Date(property.featured_until) < new Date() : false;
  };

  const getRemainingDays = (property: Property) => {
    if (!property.featured_until) return null;
    const now = new Date();
    const until = new Date(property.featured_until);
    const diffTime = until.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const selectAllProperties = (properties: Property[]) => {
    const allIds = properties.map(p => p.id);
    setSelectedProperties(allIds);
  };

  const clearSelection = () => {
    setSelectedProperties([]);
  };

  // Filtered and sorted properties with memoization
  const filteredAllProperties = useMemo(() => {
    let filtered = allProperties;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower) ||
        property.city.toLowerCase().includes(searchLower) ||
        property.property_type.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(property => {
        if (filterStatus === 'featured') {
          return property.is_featured === true;
        } else if (filterStatus === 'not_featured') {
          return property.is_featured !== true;
        }
        return true;
      });
    }

    // Type filter
    if (filterType !== 'all' && filterType) {
      filtered = filtered.filter(property => 
        property.property_type && property.property_type === filterType
      );
    }

    return filtered;
  }, [allProperties, searchTerm, filterStatus, filterType]);

  const filteredFeaturedProperties = useMemo(() => {
    let filtered = featuredProperties;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower) ||
        property.city.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [featuredProperties, searchTerm]);

  const availablePropertyTypes = useMemo(() => {
    const types = new Set(allProperties.map(p => p.property_type).filter(type => type && type.trim() !== ''));
    return Array.from(types).sort();
  }, [allProperties]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Featured</p>
                <p className="text-2xl font-bold">{stats.totalFeatured}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Featured</p>
                <p className="text-2xl font-bold">{stats.activeFeatured}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{stats.expiredFeatured}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Potential</p>
                <p className="text-2xl font-bold">₹{(stats.totalFeatured * 1999).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="featured" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Featured ({stats.activeFeatured})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Browse ({allProperties.length})
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Scheduler
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Currently Featured Properties Tab */}
        <TabsContent value="featured" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Featured Properties Management</CardTitle>
                <div className="flex gap-2">
                  {selectedProperties.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkUnfeature}
                    >
                      Unfeature Selected ({selectedProperties.length})
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search featured properties by title, location, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading featured properties...</p>
                </div>
              ) : filteredFeaturedProperties.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No featured properties found</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setActiveTab('all')}
                  >
                    Browse All Properties to Feature
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllProperties(filteredFeaturedProperties)}
                    >
                      Select All
                    </Button>
                    {selectedProperties.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Clear Selection
                      </Button>
                    )}
                  </div>
                  
                  {filteredFeaturedProperties.map((property) => (
                    <Card key={property.id} className={`border transition-all ${
                      isPropertyExpired(property) ? 'border-red-200 bg-red-50/30' : 'border-border/80'
                    } ${selectedProperties.includes(property.id) ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4 items-center">
                          <Checkbox
                            checked={selectedProperties.includes(property.id)}
                            onCheckedChange={() => togglePropertySelection(property.id)}
                          />
                          
                          {/* Property Image Thumbnail */}
                          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                            {property.images && property.images.length > 0 ? (
                              <img 
                                src={property.images[0]} 
                                alt={property.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">No Image</div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Property Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{property.location}, {property.city}</p>
                            <p className="text-sm font-medium">{formatINRShort(property.price, language)}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span className={isPropertyExpired(property) ? 'text-red-600' : 'text-green-600'}>
                                  {isPropertyExpired(property) ? 'Expired' : 'Active'}
                                </span>
                              </div>
                              {property.featured_until && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-muted-foreground">
                                    {isPropertyExpired(property) 
                                      ? `Expired on ${new Date(property.featured_until).toLocaleDateString()}`
                                      : `${getRemainingDays(property)} days remaining`
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPropertyInNewTab(property.id)}
                              title="Open in new tab"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" title="Extend duration">
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Extend Featured Duration</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Select Duration</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                      {PRESET_DURATIONS.map((duration) => (
                                        <Button
                                          key={duration.key}
                                          variant="outline"
                                          onClick={() => {
                                            handleFeatureProperty(property.id, duration.days);
                                          }}
                                        >
                                          {duration.label}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  title="Remove from featured"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Featured Status</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove "{property.title}" from featured listings?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleUnfeatureProperty(property.id)}
                                  >
                                    Remove Feature
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Properties Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Feature New Properties</CardTitle>
                <div className="flex gap-2">
                  {selectedProperties.length > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Feature Selected ({selectedProperties.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Feature Properties</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-medium mb-3 block">Choose Featuring Package</Label>
                              <div className="grid gap-3">
                                {FEATURING_PACKAGES.map((pkg) => (
                                  <Card key={pkg.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-medium">{pkg.name}</h4>
                                          <p className="text-sm text-muted-foreground">
                                            {pkg.duration} days • ₹{pkg.price.toLocaleString()}
                                          </p>
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {pkg.features.map((feature, i) => (
                                              <Badge key={i} variant="outline" className="text-xs">
                                                {feature}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        <Button
                                          onClick={() => handleBulkFeature(pkg.duration, pkg.id)}
                                        >
                                          Select
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-base font-medium mb-3 block">Or Choose Custom Duration</Label>
                              <div className="grid grid-cols-3 gap-2">
                                {PRESET_DURATIONS.map((duration) => (
                                  <Button
                                    key={duration.key}
                                    variant="outline"
                                    onClick={() => handleBulkFeature(duration.days)}
                                  >
                                    {duration.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="not_featured">Not Featured</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {availablePropertyTypes && availablePropertyTypes.length > 0 ? 
                      availablePropertyTypes.filter(type => type && type.trim() !== '').map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      )) : null
                    }
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    fetchAllProperties();
                  }}
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Price {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading properties...</p>
                </div>
              ) : filteredAllProperties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No properties found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllProperties(filteredAllProperties.slice(0, 20))}
                    >
                      Select Visible
                    </Button>
                    {selectedProperties.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Clear Selection ({selectedProperties.length})
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredAllProperties.slice(0, 20).map((property) => (
                      <Card key={property.id} className={`border transition-all ${
                        selectedProperties.includes(property.id) ? 'ring-2 ring-blue-500' : ''
                      } ${property.is_featured ? 'border-yellow-200 bg-yellow-50/30' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex gap-3 items-start">
                            <Checkbox
                              checked={selectedProperties.includes(property.id)}
                              onCheckedChange={() => togglePropertySelection(property.id)}
                            />
                            
                            <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                              {property.images && property.images.length > 0 ? (
                                <img 
                                  src={property.images[0]} 
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">No Image</div>';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-1">
                              <h3 className="font-semibold line-clamp-2 text-sm">{property.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {property.location}, {property.city} • {property.property_type}
                              </p>
                              <p className="text-sm font-medium">{formatINRShort(property.price, language)}</p>
                              <div className="flex items-center gap-2">
                                {property.is_featured ? (
                                  <Badge variant="default" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" /> Featured
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Not Featured
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPropertyInNewTab(property.id)}
                                title="Open in new tab"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {!property.is_featured && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="default" size="sm">
                                      <Star className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Feature Property</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Select Duration</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                          {PRESET_DURATIONS.map((duration) => (
                                            <Button
                                              key={duration.key}
                                              variant="outline"
                                              onClick={() => {
                                                handleFeatureProperty(property.id, duration.days);
                                              }}
                                            >
                                              {duration.label}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {filteredAllProperties.length > 20 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        Showing 20 of {filteredAllProperties.length} properties. 
                        Use filters to narrow down results.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduler Tab */}
        <TabsContent value="scheduler" className="space-y-4">
          <FeaturedPropertiesScheduler />
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4">
          <FeaturedPropertiesActivityLog />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Featured Properties Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Total Featured This Month</span>
                    <span className="text-lg font-bold">{stats.totalFeatured}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Active Featured Properties</span>
                    <span className="text-lg font-bold text-green-600">{stats.activeFeatured}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Expired Featured Properties</span>
                    <span className="text-lg font-bold text-red-600">{stats.expiredFeatured}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Featuring Packages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {FEATURING_PACKAGES.map((pkg) => (
                    <div key={pkg.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{pkg.name}</h4>
                        <span className="text-sm font-medium text-green-600">
                          ₹{pkg.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pkg.duration} days • Priority Level {pkg.priority}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeaturePropertiesManager;