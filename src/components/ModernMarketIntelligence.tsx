import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, ArrowRight, Brain, Database, Search, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ResearchReportDialog } from './ResearchReportDialog';

interface MarketData {
  id: string;
  area_name: string;
  avg_price: number;
  price_change: number;
  total_properties: number;
  demand_level: string;
  trend: string;
  growth_rate: number;
  roi_percentage: number;
  demand_score: number;
  price_trend_direction: string;
  growth_trend: string;
  roi_trend: string;
  demand_trend: string;
}

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  value: string;
  icon_type: string;
  color_scheme: string;
}

export const ModernMarketIntelligence: React.FC = () => {
  const { t } = useLanguage();
  const [selectedMetric, setSelectedMetric] = useState('price');
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch data from database and user info
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user session and profile
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUser(session?.user || null);

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          setUserProfile(profile);
        }

        // Fetch market data
        const [insightsResult, marketDataResult] = await Promise.all([
          supabase.from('market_insights').select('*').eq('is_active', true).order('display_order'),
          supabase.from('market_data').select('*').eq('is_active', true).order('display_order')
        ]);

        if (insightsResult.data) setInsights(insightsResult.data);
        if (marketDataResult.data) setMarketData(marketDataResult.data);
      } catch (error) {
        console.error('Error fetching market intelligence data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Icon mapping
  const getIconComponent = (iconType: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      Brain, Database, Search, Eye, BarChart3, TrendingUp, Activity, PieChart
    };
    return icons[iconType] || Brain;
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString()}`;
  };

  // Get metric-specific data
  const getMetricData = (data: MarketData) => {
    switch (selectedMetric) {
      case 'price':
        return {
          value: formatPrice(data.avg_price),
          change: data.price_change,
          trend: data.price_trend_direction,
          label: t('avg_price'),
          changeLabel: t('price_change')
        };
      case 'demand':
        return {
          value: Math.round(data.demand_score).toString(),
          change: data.demand_score > 70 ? 15 : data.demand_score > 40 ? 5 : -5,
          trend: data.demand_trend,
          label: t('demand_score'),
          changeLabel: t('demand_change')
        };
      case 'growth':
        return {
          value: `${data.growth_rate.toFixed(1)}%`,
          change: data.growth_rate,
          trend: data.growth_trend,
          label: t('growth_rate'),
          changeLabel: t('growth_change')
        };
      case 'roi':
        return {
          value: `${data.roi_percentage.toFixed(1)}%`,
          change: data.roi_percentage,
          trend: data.roi_trend,
          label: t('roi_percentage'),
          changeLabel: t('roi_change')
        };
      default:
        return {
          value: formatPrice(data.avg_price),
          change: data.price_change,
          trend: data.trend,
          label: t('avg_price'),
          changeLabel: t('price_change')
        };
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedValues(prev => ({
        ...prev,
        pulse: Math.random() * 100
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Complex Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            <defs>
              <pattern id="research-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5"/>
              </pattern>
              <pattern id="data-dots" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="1" fill="hsl(var(--accent))">
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
                </circle>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#research-grid)"/>
            <rect width="100%" height="100%" fill="url(#data-dots)"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Research-Style Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('ai_powered_research')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              {t('market_intelligence')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('advanced_analytics')}
          </p>
        </div>

        {/* Research Insights Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-2xl bg-muted mb-4 animate-pulse" />
                  <div className="h-4 bg-muted rounded mb-2 animate-pulse" />
                  <div className="h-3 bg-muted rounded mb-3 animate-pulse" />
                  <div className="h-5 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {insights.map((insight, index) => {
              const IconComponent = getIconComponent(insight.icon_type);
              return (
                <Card key={insight.id} className="group bg-card/50 backdrop-blur-sm border-0 hover:bg-card/80 transition-all duration-500 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${insight.color_scheme} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    <div className="text-lg font-bold text-primary">{insight.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Interactive Dashboard */}
        <Card className="bg-card/50 backdrop-blur-sm border-0 rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Control Panel */}
              <div className="lg:w-1/3 space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    {t('research_dashboard')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('real_time_market_analysis')}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">{t('analysis_type')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['price', 'demand', 'growth', 'roi'].map((metric) => (
                      <Button
                        key={metric}
                        variant={selectedMetric === metric ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMetric(metric)}
                        className="capitalize text-xs"
                      >
                        {metric}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{t('live_analytics')}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('last_updated')}: {new Date().toLocaleTimeString()}
                  </div>
                  <div className="mt-2 h-2 bg-primary/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                      style={{ width: `${65 + (animatedValues.pulse || 0) * 0.35}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Data Visualization */}
              <div className="lg:w-2/3">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, index) => (
                      <Card key={index} className="bg-background/50 border border-border/50">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="h-6 bg-muted rounded animate-pulse" />
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-3 bg-muted rounded animate-pulse" />
                              <div className="h-3 bg-muted rounded animate-pulse" />
                              <div className="h-3 bg-muted rounded animate-pulse" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {marketData.map((data, index) => (
                      <Card key={data.id} className="bg-background/50 border border-border/50 hover:bg-background/80 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-lg">{data.area_name}</h4>
                              <p className="text-sm text-muted-foreground">{t('market_analysis_text')}</p>
                            </div>
                            <Badge 
                              variant={data.demand_level === 'High' ? 'default' : data.demand_level === 'Medium' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {data.demand_level === 'High' ? t('high_demand') : data.demand_level === 'Medium' ? t('medium_demand') : t('low_demand')}
                            </Badge>
                          </div>

                           <div className="space-y-4">
                             {(() => {
                               const metricData = getMetricData(data);
                               return (
                                 <>
                                   <div className="flex items-center justify-between">
                                     <span className="text-sm text-muted-foreground">{metricData.label}</span>
                                     <span className="font-semibold">{metricData.value}</span>
                                   </div>
                                   
                                   <div className="flex items-center justify-between">
                                     <span className="text-sm text-muted-foreground">{metricData.changeLabel}</span>
                                     <div className="flex items-center gap-1">
                                       {metricData.trend === 'up' ? (
                                         <TrendingUp className="h-4 w-4 text-green-500" />
                                       ) : metricData.trend === 'down' ? (
                                         <TrendingDown className="h-4 w-4 text-red-500" />
                                       ) : (
                                         <Activity className="h-4 w-4 text-muted-foreground" />
                                       )}
                                       <span className={`text-sm font-medium ${metricData.change > 0 ? 'text-green-500' : metricData.change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                         {metricData.change > 0 ? '+' : ''}{selectedMetric === 'demand' ? Math.round(metricData.change) : metricData.change}
                                         {selectedMetric === 'demand' ? '' : '%'}
                                       </span>
                                     </div>
                                   </div>

                                   <div className="flex items-center justify-between">
                                     <span className="text-sm text-muted-foreground">{t('total_properties')}</span>
                                     <span className="font-medium">{data.total_properties}</span>
                                   </div>
                                 </>
                               );
                             })()}

                            {/* Progress Indicator */}
                            <div className="mt-4">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                                  style={{ 
                                    width: `${Math.max(20, Math.min(100, (data.total_properties / 500) * 100))}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-8 text-center">
                  <Button 
                    size="lg" 
                    className="px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => setShowReportDialog(true)}
                  >
                    {t('view_full_research_report')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Research Report Dialog */}
      <ResearchReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        userEmail={userProfile?.email || currentUser?.email}
        isUserLoggedIn={!!currentUser}
      />
    </section>
  );
};