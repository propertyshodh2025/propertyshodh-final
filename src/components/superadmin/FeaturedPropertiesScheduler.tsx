import React, { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Star, Plus, Edit, Trash2, Play, Pause } from 'lucide-react';
import { formatINRShort } from '@/lib/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { Property } from '@/types/database';

interface ScheduledFeaturing {
  id: string;
  property_id: string;
  scheduled_at: string;
  duration_days: number;
  package_type?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  activated_at?: string;
  notes?: string;
  
  // Property details
  property_title?: string;
  property_location?: string;
  property_city?: string;
  property_price?: number;
  property_images?: string[];
}

const FEATURING_PACKAGES = [
  { id: 'basic', name: 'Basic Featured', duration: 7, price: 999 },
  { id: 'premium', name: 'Premium Featured', duration: 15, price: 1999 },
  { id: 'platinum', name: 'Platinum Featured', duration: 30, price: 3999 },
];

const FeaturedPropertiesScheduler: React.FC = () => {
  const [scheduledItems, setScheduledItems] = useState<ScheduledFeaturing[]>([]);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduledFeaturing | null>(null);
  
  // Form state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [selectedPackage, setSelectedPackage] = useState<string>('basic');
  const [notes, setNotes] = useState<string>('');
  
  const { toast } = useToast();
  const { language } = useLanguage();
  const [migrationStatus, setMigrationStatus] = useState<'checking' | 'applied' | 'required'>('checking');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // First check if migration has been applied
      await checkMigrationStatus();
      
      await Promise.all([
        fetchScheduledItems(),
        fetchAvailableProperties()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const checkMigrationStatus = async () => {
    try {
      // Try to query the featuring_scheduled_at column
      const { error } = await adminSupabase
        .from('properties')
        .select('featuring_scheduled_at')
        .limit(1);
      
      if (error && error.code === '42703') {
        setMigrationStatus('required');
      } else {
        setMigrationStatus('applied');
      }
    } catch (error) {
      console.error('Error checking migration status:', error);
      setMigrationStatus('required');
    }
  };

  const fetchScheduledItems = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('properties')
        .select(`
          id,
          title,
          location,
          city,
          price,
          images,
          featuring_scheduled_at,
          featuring_package
        `)
        .not('featuring_scheduled_at', 'is', null)
        .eq('is_featured', false)
        .order('featuring_scheduled_at', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: ScheduledFeaturing[] = (data || []).map(property => ({
        id: property.id,
        property_id: property.id,
        scheduled_at: property.featuring_scheduled_at,
        duration_days: 7, // Default, will be based on package
        package_type: property.featuring_package || 'basic',
        status: 'pending',
        created_at: property.featuring_scheduled_at,
        property_title: property.title,
        property_location: property.location,
        property_city: property.city,
        property_price: property.price,
        property_images: property.images
      }));
      
      setScheduledItems(transformedData);
      console.log('Scheduled items loaded:', transformedData.length);
    } catch (error) {
      console.error('Error fetching scheduled items:', error);
      
      // Check if columns don't exist (migration not run)
      if (error?.code === '42703') {
        console.log('Migration not yet applied, scheduler functionality disabled');
        setScheduledItems([]);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to fetch scheduled items",
        variant: "destructive",
      });
      setScheduledItems([]);
    }
  };

  const fetchAvailableProperties = async () => {
    try {
      let query = adminSupabase
        .from('properties')
        .select('id, title, location, city, price, images, is_featured')
        .eq('approval_status', 'approved')
        .eq('is_featured', false)
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter properties that are not already scheduled and not featured
      query = query.is('featuring_scheduled_at', null);

      const { data, error } = await query;

      if (error) {
        // If error is about missing column, try again without the featuring_scheduled_at filter
        if (error.code === '42703') {
          const { data: retryData, error: retryError } = await adminSupabase
            .from('properties')
            .select('id, title, location, city, price, images, is_featured')
            .eq('approval_status', 'approved')
            .eq('is_featured', false)
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (retryError) throw retryError;
          setAvailableProperties(retryData || []);
          return;
        }
        throw error;
      }
      
      setAvailableProperties(data || []);
      console.log('Available properties loaded:', data?.length || 0);
    } catch (error) {
      console.error('Error fetching available properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available properties",
        variant: "destructive",
      });
    }
  };

  const handleScheduleProperty = async () => {
    if (!selectedPropertyId || !scheduledDate) {
      toast({
        title: "Missing Information",
        description: "Please select a property and schedule date",
        variant: "destructive",
      });
      return;
    }

    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      // Get the selected package details
      const selectedPkg = FEATURING_PACKAGES.find(pkg => pkg.id === selectedPackage);
      const duration = selectedPkg ? selectedPkg.duration : durationDays;
      
      // Update the property with scheduled information
      const { error } = await adminSupabase
        .from('properties')
        .update({
          featuring_scheduled_at: scheduledDateTime.toISOString(),
          featuring_package: selectedPackage,
        })
        .eq('id', selectedPropertyId);

      if (error) {
        // If error is about missing column, show migration message
        if (error.code === '42703') {
          toast({
            title: "Database Migration Required",
            description: "Please run the database migration to enable scheduling functionality. For now, you can use the 'Browse' tab to feature properties immediately.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      // Log the scheduling action
      try {
        await adminSupabase
          .from('featured_properties_log')
          .insert([{
            property_id: selectedPropertyId,
            action: 'scheduled',
            package_type: selectedPackage,
            duration_days: duration,
            notes: notes || `Scheduled for ${scheduledDateTime.toLocaleString()}`,
            featured_from: scheduledDateTime.toISOString(),
            featured_until: new Date(scheduledDateTime.getTime() + duration * 24 * 60 * 60 * 1000).toISOString(),
            system_action: false
          }]);
      } catch (logError) {
        console.warn('Failed to log scheduling activity:', logError);
        // Don't fail the whole operation if logging fails
      }

      toast({
        title: "Success",
        description: "Property scheduled for featuring successfully",
      });

      // Reset form and refresh data
      resetForm();
      setIsDialogOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Error scheduling property:', error);
      toast({
        title: "Error",
        description: "Failed to schedule property",
        variant: "destructive",
      });
    }
  };

  const handleActivateScheduled = async (item: ScheduledFeaturing) => {
    try {
      const now = new Date();
      const selectedPkg = FEATURING_PACKAGES.find(pkg => pkg.id === item.package_type);
      const duration = selectedPkg ? selectedPkg.duration : item.duration_days;
      const until = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

      const { error } = await adminSupabase
        .from('properties')
        .update({
          is_featured: true,
          featured_at: now.toISOString(),
          featured_until: until.toISOString(),
          featuring_scheduled_at: null, // Clear the schedule
          featuring_package: item.package_type,
          approval_status: 'approved',
          listing_status: 'Active'
        })
        .eq('id', item.property_id);

      if (error) throw error;

      // Log the activation
      try {
        await adminSupabase
          .from('featured_properties_log')
          .insert([{
            property_id: item.property_id,
            action: 'featured',
            package_type: item.package_type,
            duration_days: duration,
            notes: 'Activated from scheduled featuring',
            featured_from: now.toISOString(),
            featured_until: until.toISOString(),
            system_action: false
          }]);
      } catch (logError) {
        console.warn('Failed to log activation:', logError);
      }

      toast({
        title: "Success",
        description: "Property activated and featured successfully",
      });

      await fetchData();
    } catch (error) {
      console.error('Error activating scheduled property:', error);
      toast({
        title: "Error",
        description: "Failed to activate scheduled property",
        variant: "destructive",
      });
    }
  };

  const handleCancelScheduled = async (item: ScheduledFeaturing) => {
    try {
      const { error } = await adminSupabase
        .from('properties')
        .update({
          featuring_scheduled_at: null,
          featuring_package: null,
        })
        .eq('id', item.property_id);

      if (error) throw error;

      // Log the cancellation
      try {
        await adminSupabase
          .from('featured_properties_log')
          .insert([{
            property_id: item.property_id,
            action: 'unfeatured',
            package_type: item.package_type,
            notes: 'Scheduled featuring cancelled',
            system_action: false,
          }]);
      } catch (logError) {
        console.warn('Failed to log cancellation:', logError);
      }

      toast({
        title: "Success",
        description: "Scheduled featuring cancelled",
      });

      await fetchData();
    } catch (error) {
      console.error('Error cancelling scheduled item:', error);
      toast({
        title: "Error",
        description: "Failed to cancel scheduled item",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedPropertyId('');
    setScheduledDate('');
    setScheduledTime('09:00');
    setDurationDays(7);
    setSelectedPackage('basic');
    setNotes('');
    setEditingItem(null);
  };

  const isScheduledTimeValid = (scheduledAt: string) => {
    return new Date(scheduledAt) > new Date();
  };

  const getScheduledStatus = (item: ScheduledFeaturing) => {
    const scheduledTime = new Date(item.scheduled_at);
    const now = new Date();
    
    if (scheduledTime <= now) {
      return 'ready';
    } else {
      return 'pending';
    }
  };

  const getTimeUntilScheduled = (scheduledAt: string) => {
    const scheduled = new Date(scheduledAt);
    const now = new Date();
    const diffMs = scheduled.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Ready to activate';
    
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`;
    }
  };

  // Function to check and auto-activate ready scheduled properties
  const checkAndActivateReadyProperties = async () => {
    const now = new Date();
    const readyItems = scheduledItems.filter(item => new Date(item.scheduled_at) <= now);
    
    if (readyItems.length === 0) return;
    
    console.log(`Found ${readyItems.length} properties ready for activation`);
    
    for (const item of readyItems) {
      try {
        await handleActivateScheduled(item);
        console.log(`Auto-activated property: ${item.property_title}`);
      } catch (error) {
        console.error(`Failed to auto-activate property ${item.property_title}:`, error);
      }
    }
  };

  // Check for ready properties every minute
  useEffect(() => {
    if (scheduledItems.length === 0) return;
    
    const interval = setInterval(checkAndActivateReadyProperties, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [scheduledItems]);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">Featured Properties Scheduler</h2>
            {migrationStatus === 'applied' && (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                ✓ Migration Applied
              </Badge>
            )}
            {migrationStatus === 'required' && (
              <Badge variant="destructive">
                ⚠ Migration Required
              </Badge>
            )}
            {migrationStatus === 'checking' && (
              <Badge variant="secondary">
                ... Checking
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Schedule properties to be featured at specific times</p>
          {migrationStatus === 'required' && (
            <p className="text-sm text-amber-600 mt-1">
              Please run the database migration to enable full scheduling functionality.
            </p>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Property for Featuring</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Property</Label>
                {availableProperties.length === 0 ? (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">
                      No available properties found. This could be because:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>All properties are already featured</li>
                      <li>No approved properties in the system</li>
                      <li>Database migration not yet applied</li>
                    </ul>
                  </div>
                ) : (
                  <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Choose from ${availableProperties.length} properties`} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProperties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{property.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {property.location}, {property.city} • {formatINRShort(property.price, language)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Schedule Date</Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Featuring Package</Label>
                <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEATURING_PACKAGES.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        <div className="flex justify-between w-full">
                          <span>{pkg.name}</span>
                          <span className="text-muted-foreground">
                            {pkg.duration} days • ₹{pkg.price.toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Add any notes about this scheduling..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleScheduleProperty} 
                className="w-full"
                disabled={!selectedPropertyId || !scheduledDate}
              >
                Schedule Property
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scheduled Items */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading scheduled items...</p>
          </div>
        ) : scheduledItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Scheduled Properties</h3>
              <p className="text-muted-foreground mb-4">
                Schedule properties to be featured at specific times for better campaign management.
              </p>
              {availableProperties.length === 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    If you just ran the database migration, please refresh the page to see available properties.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {scheduledItems.map((item) => {
              const status = getScheduledStatus(item);
              const selectedPkg = FEATURING_PACKAGES.find(p => p.id === item.package_type);
              
              return (
                <Card key={item.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Property Image */}
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {item.property_images && item.property_images.length > 0 ? (
                          <img 
                            src={item.property_images[0]} 
                            alt={item.property_title}
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold line-clamp-1">{item.property_title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.property_location}, {item.property_city}
                              {item.property_price && (
                                <span> • {formatINRShort(item.property_price, language)}</span>
                              )}
                            </p>
                          </div>
                          <Badge variant={status === 'ready' ? 'default' : 'secondary'}>
                            {status === 'ready' ? 'Ready' : 'Scheduled'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(item.scheduled_at).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {getTimeUntilScheduled(item.scheduled_at)}
                          </span>
                          {selectedPkg && (
                            <Badge variant="outline">
                              {selectedPkg.name} • {selectedPkg.duration} days
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {status === 'ready' && (
                            <Button
                              size="sm"
                              onClick={() => handleActivateScheduled(item)}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Activate Now
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelScheduled(item)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedPropertiesScheduler;