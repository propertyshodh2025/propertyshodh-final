import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, BarChart3, TrendingUp, Brain, Activity, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { adminSupabase } from '@/lib/adminSupabase';

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  value: string;
  icon_type: string;
  color_scheme: string;
  is_active: boolean;
  display_order: number;
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
  growth_rate: number;
  roi_percentage: number;
  demand_score: number;
  price_trend_direction: string;
  growth_trend: string;
  roi_trend: string;
  demand_trend: string;
}

interface ResearchReportLead {
  id: string;
  email: string;
  user_id: string | null;
  requested_at: string;
  is_verified_user: boolean;
  created_at: string;
}

const iconTypes = ['Brain', 'BarChart3', 'TrendingUp', 'Activity', 'Eye'];
const colorSchemes = [
  'from-blue-500 to-purple-600',
  'from-green-500 to-emerald-600', 
  'from-orange-500 to-red-600',
  'from-purple-500 to-pink-600',
];

const MarketIntelligenceManager = () => {
  console.log('🔥 MarketIntelligenceManager: Component is rendering!');
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [researchLeads, setResearchLeads] = useState<ResearchReportLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');
  const { toast } = useToast();

  console.log('🔥 MarketIntelligenceManager: State initialized');

  useEffect(() => {
    console.log('🔥 MarketIntelligenceManager: useEffect triggered');
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('🔥 MarketIntelligenceManager: fetchData called');
    setLoading(true);
    try {
      console.log('🔥 MarketIntelligenceManager: Making database queries...');
      const [insightsResult, marketDataResult, leadsResult] = await Promise.all([
        adminSupabase
          .from('market_insights')
          .select('*')
          .order('display_order'),
        adminSupabase
          .from('market_data')
          .select('*')
          .order('display_order'),
        adminSupabase
          .from('research_report_leads')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      console.log('🔥 MarketIntelligenceManager: Insights result:', insightsResult);
      console.log('🔥 MarketIntelligenceManager: Market data result:', marketDataResult);
      console.log('🔥 MarketIntelligenceManager: Research leads result:', leadsResult);

      if (insightsResult.error) {
        console.error('🔥 Error fetching insights:', insightsResult.error);
      } else {
        console.log('🔥 Setting insights data:', insightsResult.data?.length, 'items');
        setInsights(insightsResult.data || []);
      }

      if (marketDataResult.error) {
        console.error('🔥 Error fetching market data:', marketDataResult.error);
      } else {
        console.log('🔥 Setting market data:', marketDataResult.data?.length, 'items');
        setMarketData(marketDataResult.data || []);
      }

      if (leadsResult.error) {
        console.error('🔥 Error fetching research leads:', leadsResult.error);
      } else {
        console.log('🔥 Setting research leads data:', leadsResult.data?.length, 'items');
        setResearchLeads(leadsResult.data || []);
      }
    } catch (error) {
      console.error('🔥 MarketIntelligenceManager: Error fetching market intelligence data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch market intelligence data",
        variant: "destructive",
      });
    } finally {
      console.log('🔥 MarketIntelligenceManager: Setting loading to false');
      setLoading(false);
    }
  };

  const createInsight = async () => {
    try {
      const newInsight = {
        title: 'New Market Insight',
        description: 'Market insight description',
        value: '0',
        icon_type: 'Brain',
        color_scheme: 'from-blue-500 to-purple-600',
        is_active: true,
        display_order: insights.length + 1
      };

      const { data, error } = await adminSupabase
        .from('market_insights')
        .insert([newInsight])
        .select()
        .single();

      if (error) throw error;

      setInsights(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Market insight created successfully",
      });
    } catch (error) {
      console.error('Error creating insight:', error);
      toast({
        title: "Error",
        description: "Failed to create market insight",
        variant: "destructive",
      });
    }
  };

  const updateInsight = async (id: string, updates: Partial<MarketInsight>) => {
    try {
      const { error } = await adminSupabase
        .from('market_insights')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setInsights(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));

      toast({
        title: "Success",
        description: "Market insight updated successfully",
      });
    } catch (error) {
      console.error('Error updating insight:', error);
      toast({
        title: "Error",
        description: "Failed to update market insight",
        variant: "destructive",
      });
    }
  };

  const createMarketData = async () => {
    try {
      const newData = {
        area_name: 'New Area',
        avg_price: 5000000,
        price_change: 0,
        total_properties: 0,
        demand_level: 'Medium',
        trend: 'stable',
        is_active: true,
        display_order: marketData.length + 1,
        growth_rate: 8.5,
        roi_percentage: 7.2,
        demand_score: 65,
        price_trend_direction: 'stable',
        growth_trend: 'stable',
        roi_trend: 'stable',
        demand_trend: 'stable'
      };

      const { data, error } = await adminSupabase
        .from('market_data')
        .insert([newData])
        .select()
        .single();

      if (error) throw error;

      setMarketData(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Market data created successfully",
      });
    } catch (error) {
      console.error('Error creating market data:', error);
      toast({
        title: "Error",
        description: "Failed to create market data",
        variant: "destructive",
      });
    }
  };

  const updateMarketData = async (id: string, updates: Partial<MarketData>) => {
    try {
      const { error } = await adminSupabase
        .from('market_data')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setMarketData(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));

      toast({
        title: "Success",
        description: "Market data updated successfully",
      });
    } catch (error) {
      console.error('Error updating market data:', error);
      toast({
        title: "Error",
        description: "Failed to update market data",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string, type: 'insight' | 'data') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const table = type === 'insight' ? 'market_insights' : 'market_data';
      const { error } = await adminSupabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (type === 'insight') {
        setInsights(prev => prev.filter(item => item.id !== id));
      } else {
        setMarketData(prev => prev.filter(item => item.id !== id));
      }

      toast({
        title: "Success",
        description: `${type === 'insight' ? 'Insight' : 'Market data'} deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const convertToLead = async (researchLead: ResearchReportLead) => {
    try {
      // Create a new lead in the leads table
      const { error } = await adminSupabase
        .from('leads')
        .insert({
          source_type: 'research_report',
          source_id: researchLead.id,
          name: researchLead.email, // Use email as name initially
          phone: '', // Research report leads don't have phone
          email: researchLead.email,
          property_id: null,
          property_title: null,
          city: null,
          location: null,
          budget_range: null,
          property_type: null,
          purpose: 'Research Report Request',
          status: 'new',
          priority: 'medium',
          tags: ['research_report'],
          assigned_admin_id: null,
          next_follow_up_at: null,
          last_contacted_at: null,
          notes: `Research report requested on ${new Date(researchLead.requested_at).toLocaleString()}. ${researchLead.is_verified_user ? 'Verified user.' : 'Guest user.'}`
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Research report lead converted to CRM lead successfully",
      });

      // Refresh data to show the new lead
      fetchData();
    } catch (error) {
      console.error('Error converting to lead:', error);
      toast({
        title: "Error",
        description: "Failed to convert to CRM lead",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    console.log('🔥 MarketIntelligenceManager: Still loading...');
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">🔄 Loading Market Intelligence...</div>
      </div>
    );
  }

  console.log('🔥 MarketIntelligenceManager: Rendering with data - Insights:', insights.length, 'Market Data:', marketData.length, 'Research Leads:', researchLeads.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Market Intelligence Management</h2>
        <div className="text-sm text-muted-foreground">
          {insights.length} insights • {marketData.length} market data • {researchLeads.length} report leads
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Market Insights ({insights.length})</TabsTrigger>
          <TabsTrigger value="data">Market Data ({marketData.length})</TabsTrigger>
          <TabsTrigger value="leads">Research Report Leads ({researchLeads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Market Insights</h3>
            <Button onClick={createInsight}>
              <Plus className="h-4 w-4 mr-2" />
              Add Insight
            </Button>
          </div>

          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Input 
                          value={insight.title}
                          onChange={(e) => updateInsight(insight.id, { title: e.target.value })}
                          className="font-semibold"
                        />
                        <Badge variant={insight.is_active ? "default" : "secondary"}>
                          {insight.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <Textarea
                        value={insight.description}
                        onChange={(e) => updateInsight(insight.id, { description: e.target.value })}
                        className="mb-2"
                      />
                      <Input
                        value={insight.value}
                        onChange={(e) => updateInsight(insight.id, { value: e.target.value })}
                        placeholder="Value (e.g., 85%)"
                      />
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateInsight(insight.id, { is_active: !insight.is_active })}
                      >
                        {insight.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteItem(insight.id, 'insight')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {insights.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No market insights yet. Create your first one!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Market Data</h3>
            <Button onClick={createMarketData}>
              <Plus className="h-4 w-4 mr-2" />
              Add Market Data
            </Button>
          </div>

          <div className="grid gap-4">
            {marketData.map((data) => (
              <Card key={data.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Area Name</Label>
                      <Input
                        value={data.area_name}
                        onChange={(e) => updateMarketData(data.id, { area_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Average Price (₹)</Label>
                      <Input
                        type="number"
                        value={data.avg_price}
                        onChange={(e) => updateMarketData(data.id, { avg_price: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Price Change (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={data.price_change}
                        onChange={(e) => updateMarketData(data.id, { price_change: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Total Properties</Label>
                      <Input
                        type="number"
                        value={data.total_properties}
                        onChange={(e) => updateMarketData(data.id, { total_properties: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Growth Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={data.growth_rate}
                        onChange={(e) => updateMarketData(data.id, { growth_rate: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>ROI Percentage (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={data.roi_percentage}
                        onChange={(e) => updateMarketData(data.id, { roi_percentage: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Demand Score (0-100)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={data.demand_score}
                        onChange={(e) => updateMarketData(data.id, { demand_score: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Demand Level</Label>
                      <Select 
                        value={data.demand_level} 
                        onValueChange={(value) => updateMarketData(data.id, { demand_level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Very High">Very High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Price Trend</Label>
                      <Select 
                        value={data.price_trend_direction} 
                        onValueChange={(value) => updateMarketData(data.id, { price_trend_direction: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="up">Up</SelectItem>
                          <SelectItem value="stable">Stable</SelectItem>
                          <SelectItem value="down">Down</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Growth Trend</Label>
                      <Select 
                        value={data.growth_trend} 
                        onValueChange={(value) => updateMarketData(data.id, { growth_trend: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="up">Up</SelectItem>
                          <SelectItem value="stable">Stable</SelectItem>
                          <SelectItem value="down">Down</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>ROI Trend</Label>
                      <Select 
                        value={data.roi_trend} 
                        onValueChange={(value) => updateMarketData(data.id, { roi_trend: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="up">Up</SelectItem>
                          <SelectItem value="stable">Stable</SelectItem>
                          <SelectItem value="down">Down</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Demand Trend</Label>
                      <Select 
                        value={data.demand_trend} 
                        onValueChange={(value) => updateMarketData(data.id, { demand_trend: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="up">Up</SelectItem>
                          <SelectItem value="stable">Stable</SelectItem>
                          <SelectItem value="down">Down</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <Badge variant={data.is_active ? "default" : "secondary"}>
                      {data.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateMarketData(data.id, { is_active: !data.is_active })}
                      >
                        {data.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteItem(data.id, 'data')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {marketData.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No market data yet. Create your first entry!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Research Report Leads</h3>
            <Badge variant="secondary">{researchLeads.length} Total</Badge>
          </div>

          <div className="grid gap-4">
            {researchLeads.map((lead) => (
              <Card key={lead.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-lg">{lead.email}</span>
                        <Badge variant={lead.is_verified_user ? "default" : "outline"}>
                          {lead.is_verified_user ? "Verified User" : "Guest"}
                        </Badge>
                        {lead.user_id && (
                          <Badge variant="secondary" className="text-xs">
                            User ID: {lead.user_id.slice(0, 8)}...
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Requested: {new Date(lead.requested_at).toLocaleString()}</p>
                        <p>Lead Created: {new Date(lead.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => convertToLead(lead)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Convert to Lead
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {researchLeads.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No research report requests yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketIntelligenceManager;