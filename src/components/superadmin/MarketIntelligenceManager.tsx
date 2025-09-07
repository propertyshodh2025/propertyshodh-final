import React, { useEffect, useState } from 'react';
import { adminSupabase } from '@/lib/adminSupabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, TrendingUp, BarChart3, Brain, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  value: string;
  icon_type: string;
  color_scheme: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface MarketData {
  id: string;
  area_name: string;
  avg_price: number;
  price_change: number;
  total_properties: number;
  demand_level: string;
  trend: string;
  is_active: boolean;
  display_order: number;
  growth_rate: number | null;
  roi_percentage: number | null;
  demand_score: number | null;
  price_trend_direction: string | null;
  growth_trend: string | null;
  roi_trend: string | null;
  demand_trend: string | null;
  created_at: string;
  updated_at: string;
}

const iconOptions = [
  { value: 'Brain', label: 'Brain' },
  { value: 'TrendingUp', label: 'Trending Up' },
  { value: 'BarChart3', label: 'Bar Chart' },
  { value: 'Home', label: 'Home' },
  { value: 'DollarSign', label: 'Dollar Sign' },
];

const colorSchemeOptions = [
  { value: 'from-blue-500 to-purple-600', label: 'Blue to Purple' },
  { value: 'from-green-500 to-teal-600', label: 'Green to Teal' },
  { value: 'from-yellow-500 to-orange-600', label: 'Yellow to Orange' },
  { value: 'from-red-500 to-pink-600', label: 'Red to Pink' },
];

const MarketIntelligenceManager: React.FC = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInsight, setEditingInsight] = useState<MarketInsight | null>(null);
  const [editingMarketData, setEditingMarketData] = useState<MarketData | null>(null);
  const [isInsightDialogOpen, setIsInsightDialogOpen] = useState(false);
  const [isMarketDataDialogOpen, setIsMarketDataDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMarketIntelligence();
  }, []);

  const fetchMarketIntelligence = async () => {
    setLoading(true);
    try {
      const { data: insightsData, error: insightsError } = await adminSupabase
        .from('market_insights')
        .select('*')
        .order('display_order', { ascending: true });

      if (insightsError) throw insightsError;
      setInsights(insightsData || []);

      const { data: marketDataData, error: marketDataError } = await adminSupabase
        .from('market_data')
        .select('*')
        .order('display_order', { ascending: true });

      if (marketDataError) throw marketDataError;
      setMarketData(marketDataData || []);

    } catch (error) {
      console.error('Error fetching market intelligence:', error);
      toast({
        title: "Error",
        description: "Failed to fetch market intelligence data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInsight = async (insight: Partial<MarketInsight>) => {
    try {
      if (insight.id) {
        const { error } = await adminSupabase
          .from('market_insights')
          .update(insight)
          .eq('id', insight.id);
        if (error) throw error;
        toast({ title: "Success", description: "Market insight updated." });
      } else {
        const { error } = await adminSupabase
          .from('market_insights')
          .insert(insight);
        if (error) throw error;
        toast({ title: "Success", description: "New market insight created." });
      }
      setIsInsightDialogOpen(false);
      setEditingInsight(null);
      fetchMarketIntelligence();
    } catch (error) {
      console.error('Error saving insight:', error);
      toast({
        title: "Error",
        description: "Failed to save market insight",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInsight = async (id: string) => {
    if (!confirm('Are you sure you want to delete this market insight?')) return;
    try {
      const { error } = await adminSupabase
        .from('market_insights')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Market insight deleted." });
      fetchMarketIntelligence();
    } catch (error) {
      console.error('Error deleting insight:', error);
      toast({
        title: "Error",
        description: "Failed to delete market insight",
        variant: "destructive",
      });
    }
  };

  const handleSaveMarketData = async (data: Partial<MarketData>) => {
    try {
      if (data.id) {
        const { error } = await adminSupabase
          .from('market_data')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
        toast({ title: "Success", description: "Market data updated." });
      } else {
        const { error } = await adminSupabase
          .from('market_data')
          .insert(data);
        if (error) throw error;
        toast({ title: "Success", description: "New market data created." });
      }
      setIsMarketDataDialogOpen(false);
      setEditingMarketData(null);
      fetchMarketIntelligence();
    } catch (error) {
      console.error('Error saving market data:', error);
      toast({
        title: "Error",
        description: "Failed to save market data",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMarketData = async (id: string) => {
    if (!confirm('Are you sure you want to delete this market data entry?')) return;
    try {
      const { error } = await adminSupabase
        .from('market_data')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Market data entry deleted." });
      fetchMarketIntelligence();
    } catch (error) {
      console.error('Error deleting market data:', error);
      toast({
        title: "Error",
        description: "Failed to delete market data entry",
        variant: "destructive",
      });
    }
  };

  const InsightForm: React.FC<{
    insight: Partial<MarketInsight>;
    onSave: (insight: Partial<MarketInsight>) => void;
    onClose: () => void;
  }> = ({ insight, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<MarketInsight>>(insight);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
      setFormData(prev => ({ ...prev, is_active: checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="value">Value</Label>
          <Input id="value" name="value" value={formData.value || ''} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="icon_type">Icon Type</Label>
          <Select name="icon_type" value={formData.icon_type || 'Brain'} onValueChange={(val) => handleSelectChange('icon_type', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an icon" />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="color_scheme">Color Scheme</Label>
          <Select name="color_scheme" value={formData.color_scheme || 'from-blue-500 to-purple-600'} onValueChange={(val) => handleSelectChange('color_scheme', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a color scheme" />
            </SelectTrigger>
            <SelectContent>
              {colorSchemeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input id="display_order" name="display_order" type="number" value={formData.display_order || 0} onChange={handleChange} />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    );
  };

  const MarketDataForm: React.FC<{
    data: Partial<MarketData>;
    onSave: (data: Partial<MarketData>) => void;
    onClose: () => void;
  }> = ({ data, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<MarketData>>(data);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleSelectChange = (name: string, value: string) => {
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
      setFormData(prev => ({ ...prev, is_active: checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="area_name">Area Name</Label>
          <Input id="area_name" name="area_name" value={formData.area_name || ''} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="avg_price">Average Price</Label>
          <Input id="avg_price" name="avg_price" type="number" value={formData.avg_price || 0} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="price_change">Price Change (%)</Label>
          <Input id="price_change" name="price_change" type="number" value={formData.price_change || 0} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="total_properties">Total Properties</Label>
          <Input id="total_properties" name="total_properties" type="number" value={formData.total_properties || 0} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="demand_level">Demand Level</Label>
          <Select name="demand_level" value={formData.demand_level || 'Medium'} onValueChange={(val) => handleSelectChange('demand_level', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select demand level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="trend">Trend</Label>
          <Select name="trend" value={formData.trend || 'stable'} onValueChange={(val) => handleSelectChange('trend', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select trend" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upward">Upward</SelectItem>
              <SelectItem value="downward">Downward</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="growth_rate">Growth Rate (%)</Label>
          <Input id="growth_rate" name="growth_rate" type="number" value={formData.growth_rate || 0} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="roi_percentage">ROI (%)</Label>
          <Input id="roi_percentage" name="roi_percentage" type="number" value={formData.roi_percentage || 0} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="demand_score">Demand Score</Label>
          <Input id="demand_score" name="demand_score" type="number" value={formData.demand_score || 0} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="price_trend_direction">Price Trend Direction</Label>
          <Select name="price_trend_direction" value={formData.price_trend_direction || 'stable'} onValueChange={(val) => handleSelectChange('price_trend_direction', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select price trend" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upward">Upward</SelectItem>
              <SelectItem value="downward">Downward</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="growth_trend">Growth Trend</Label>
          <Select name="growth_trend" value={formData.growth_trend || 'stable'} onValueChange={(val) => handleSelectChange('growth_trend', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select growth trend" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upward">Upward</SelectItem>
              <SelectItem value="downward">Downward</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="roi_trend">ROI Trend</Label>
          <Select name="roi_trend" value={formData.roi_trend || 'stable'} onValueChange={(val) => handleSelectChange('roi_trend', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select ROI trend" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upward">Upward</SelectItem>
              <SelectItem value="downward">Downward</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="demand_trend">Demand Trend</Label>
          <Select name="demand_trend" value={formData.demand_trend || 'stable'} onValueChange={(val) => handleSelectChange('demand_trend', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select demand trend" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upward">Upward</SelectItem>
              <SelectItem value="downward">Downward</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input id="display_order" name="display_order" type="number" value={formData.display_order || 0} onChange={handleChange} />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading market intelligence...</div>
      ) : (
        <>
          {/* Market Insights */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">Market Insights</CardTitle>
              <Button size="sm" onClick={() => { setEditingInsight({}); setIsInsightDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add Insight
              </Button>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No market insights found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights.map(insight => (
                    <Card key={insight.id} className="border border-border/80 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{insight.title}</h3>
                          <Badge variant={insight.is_active ? 'default' : 'secondary'}>
                            {insight.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-bold text-xl">{insight.value}</span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditingInsight(insight); setIsInsightDialogOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteInsight(insight.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market Data */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">Market Data by Area</CardTitle>
              <Button size="sm" onClick={() => { setEditingMarketData({}); setIsMarketDataDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add Market Data
              </Button>
            </CardHeader>
            <CardContent>
              {marketData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No market data found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketData.map(data => (
                    <Card key={data.id} className="border border-border/80 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{data.area_name}</h3>
                          <Badge variant={data.is_active ? 'default' : 'secondary'}>
                            {data.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Avg Price: {formatINRShort(data.avg_price, 'en-IN')}</p>
                        <p className="text-sm text-muted-foreground">Price Change: {data.price_change}%</p>
                        <p className="text-sm text-muted-foreground">Total Properties: {data.total_properties}</p>
                        <p className="text-sm text-muted-foreground">Demand: {data.demand_level} ({data.demand_score || 'N/A'})</p>
                        <p className="text-sm text-muted-foreground">Trend: {data.trend}</p>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" onClick={() => { setEditingMarketData(data); setIsMarketDataDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteMarketData(data.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isInsightDialogOpen} onOpenChange={setIsInsightDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingInsight?.id ? 'Edit Market Insight' : 'Add New Market Insight'}</DialogTitle>
          </DialogHeader>
          <InsightForm
            insight={editingInsight || { is_active: true, display_order: 0, icon_type: 'Brain', color_scheme: 'from-blue-500 to-purple-600' }}
            onSave={handleSaveInsight}
            onClose={() => setIsInsightDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isMarketDataDialogOpen} onOpenChange={setIsMarketDataDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingMarketData?.id ? 'Edit Market Data' : 'Add New Market Data'}</DialogTitle>
          </DialogHeader>
          <MarketDataForm
            data={editingMarketData || { is_active: true, display_order: 0, avg_price: 0, price_change: 0, total_properties: 0, demand_level: 'Medium', trend: 'stable' }}
            onSave={handleSaveMarketData}
            onClose={() => setIsMarketDataDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketIntelligenceManager;