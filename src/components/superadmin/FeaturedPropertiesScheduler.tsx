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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchScheduledItems(),
        fetchAvailableProperties()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledItems = async () => {
    try {
      // Try to fetch scheduled items, but handle missing columns gracefully
      const { data, error } = await adminSupabase
        .from('properties')
        .select(`
          id,
          title,
          location,
          city,
          price,
          images
        `)
        .limit(0); // Start with empty query since columns may not exist

      // For now, return empty array until migration is run
      setScheduledItems([]);
      console.log('Scheduled items: Migration required for full functionality');
    } catch (error) {
      console.error('Error fetching scheduled items:', error);
      // Don't show error toast for missing table/columns as it's expected before migration
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

      // Try to filter by featuring_scheduled_at if the column exists
      // If it doesn't exist (migration not run), we'll just ignore this filter
      try {
        query = query.is('featuring_scheduled_at', null);
      } catch (e) {
        // Column doesn't exist, proceed without this filter
        console.log('featuring_scheduled_at column not found, proceeding without filter');
      }

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

    // Check if database migration has been run
    toast({
      title: "Database Migration Required",
      description: "Please run the database migration to enable scheduling functionality. For now, you can use the 'Browse' tab to feature properties immediately.",
      variant: "destructive",
    });
    return;

    /* This will be enabled after migration is run
    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      // Update the property with scheduled information
      const { error } = await adminSupabase
        .from('properties')
        .update({
          featuring_scheduled_at: scheduledDateTime.toISOString(),
          featuring_package: selectedPackage,
        })
        .eq('id', selectedPropertyId);

      if (error) throw error;

      // Log the scheduling action
      await adminSupabase
        .from('featured_properties_log')
        .insert([{
          property_id: selectedPropertyId,
          action: 'scheduled',
          package_type: selectedPackage,
          duration_days: durationDays,
          notes: notes || `Scheduled for ${scheduledDateTime.toLocaleString()}`,
          featured_from: scheduledDateTime.toISOString(),
          featured_until: new Date(scheduledDateTime.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
        }]);

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
    */
  };

  const handleActivateScheduled = async (item: ScheduledFeaturing) => {
    try {
      const now = new Date();
      const until = new Date(now.getTime() + item.duration_days * 24 * 60 * 60 * 1000);

      const { error } = await adminSupabase
        .from('properties')
        .update({
          is_featured: true,
          featured_at: now.toISOString(),
          featured_until: until.toISOString(),
          featuring_scheduled_at: null, // Clear the schedule
          approval_status: 'approved',
          listing_status: 'Active'
        })
        .eq('id', item.property_id);

      if (error) throw error;

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
      await adminSupabase
        .from('featured_properties_log')
        .insert([{
          property_id: item.property_id,
          action: 'unfeatured',
          notes: 'Scheduled featuring cancelled',
          system_action: false,
        }]);

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

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Featured Properties Scheduler</h2>
          <p className="text-muted-foreground">Schedule properties to be featured at specific times</p>
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
              <p className="text-muted-foreground">
                Schedule properties to be featured at specific times for better campaign management.
              </p>
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