import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, FileText, Globe } from 'lucide-react';

interface ReadyReckonerData {
  location: string;
  locationMarathi: string;
  rates: {
    plot: number;
    flat: number;
    commercialUpper: number;
    commercialGround: number;
  };
}

const readyReckonerData: ReadyReckonerData[] = [
  {
    location: "Nandanvan Colony, Bhavsinghpura",
    locationMarathi: "नंदनवन कॉलनी, भावसिंगपुरा",
    rates: {
      plot: 2563.94,
      flat: 3344.50,
      commercialUpper: 3846.13,
      commercialGround: 4180.62
    }
  },
  {
    location: "Mitmita, Padegaon Area",
    locationMarathi: "मिटमिटा, पडेगाव परिसर",
    rates: {
      plot: 882.58,
      flat: 2933.87,
      commercialUpper: 3374.20,
      commercialGround: 3669.53
    }
  },
  {
    location: "Sutgirni to Shahnoormiya",
    locationMarathi: "सूतगिरणी ते शहानूरमिया",
    rates: {
      plot: 1932.36,
      flat: 3530.29,
      commercialUpper: 4059.85,
      commercialGround: 5341.85
    }
  },
  {
    location: "Beed Bypass Satara Area",
    locationMarathi: "बीड बायपास सातारा परिसर",
    rates: {
      plot: 1765.16,
      flat: 3065.61,
      commercialUpper: 3525.68,
      commercialGround: 3832.32
    }
  },
  {
    location: "Deolai, Beed Bypass Area",
    locationMarathi: "देवळाई, बीड बायपास परिसर",
    rates: {
      plot: 1997.42,
      flat: 3065.61,
      commercialUpper: 3525.68,
      commercialGround: 3832.32
    }
  },
  {
    location: "Harsul-Jalgaon Road",
    locationMarathi: "हर्सुल-जळगाव रोड",
    rates: {
      plot: 2520.28,
      flat: 3530.29,
      commercialUpper: 4059.85,
      commercialGround: 5852.88
    }
  },
  {
    location: "Jalgaon Road to TV Centre",
    locationMarathi: "जळगाव रोड ते टीव्ही सेंटर",
    rates: {
      plot: 2563.94,
      flat: 2787.09,
      commercialUpper: 3952.99,
      commercialGround: 7385.99
    }
  },
  {
    location: "Kanchanwadi Area",
    locationMarathi: "कांचनवाडी परिसर",
    rates: {
      plot: 2127.46,
      flat: 3994.83,
      commercialUpper: 4594.21,
      commercialGround: 4993.54
    }
  },
  {
    location: "Amarpreet to Shahnoormiya Dargah Road",
    locationMarathi: "अमरप्रीत ते शहानूरमिया दर्गा मार्ग",
    rates: {
      plot: 3056.32,
      flat: 3716.12,
      commercialUpper: 4273.54,
      commercialGround: 7432.23
    }
  },
  {
    location: "Jalna Road",
    locationMarathi: "जालना रोड",
    rates: {
      plot: 4682.26,
      flat: 5852.88,
      commercialUpper: 6730.56,
      commercialGround: 8918.68
    }
  },
  {
    location: "Gulmandi Rangar Galli to City Chowk",
    locationMarathi: "गुलमंडी रंगारगल्ली ते सिटीचौक",
    rates: {
      plot: 6019.94,
      flat: 7524.96,
      commercialUpper: 8654.21,
      commercialGround: 10683.91
    }
  },
  {
    location: "Tilakpath Road",
    locationMarathi: "टिळकपथ मार्ग",
    rates: {
      plot: 6986.32,
      flat: 8732.99,
      commercialUpper: 10033.53,
      commercialGround: 13285.08
    }
  },
  {
    location: "Samarthnagar to Nirala Bazar",
    locationMarathi: "समर्थनगर ते निरालाबाजार",
    rates: {
      plot: 5574.18,
      flat: 6967.72,
      commercialUpper: 8013.08,
      commercialGround: 9290.29
    }
  },
  {
    location: "CIDCO N1 Jalgaon Road",
    locationMarathi: "सिडको एन १ जळगावरोड",
    rates: {
      plot: 4478.12,
      flat: 5574.18,
      commercialUpper: 6410.29,
      commercialGround: 8593.52
    }
  },
  {
    location: "Nakshatrawadi Area",
    locationMarathi: "नक्षत्रवाडी परिसर",
    rates: {
      plot: 1347.10,
      flat: 3100.01,
      commercialUpper: 3561.74,
      commercialGround: 3872.20
    }
  },
  {
    location: "Kranti Chowk to Railway Station Road Area",
    locationMarathi: "क्रांतीचौक ते रेल्वेस्टेशन मार्ग परिसर",
    rates: {
      plot: 4162.06,
      flat: 4273.54,
      commercialUpper: 4914.57,
      commercialGround: 8268.46
    }
  },
  {
    location: "Baba Pump to Panchavati Area",
    locationMarathi: "बाबापंप ते पंचवटी परिसर",
    rates: {
      plot: 4273.54,
      flat: 5109.66,
      commercialUpper: 5852.88,
      commercialGround: 8454.35
    }
  },
  {
    location: "Zambad Estate, Pannalal Nagar, Shrey Nagar",
    locationMarathi: "झांबड इस्टेट, पन्नालालनगर, श्रेयनगर",
    rates: {
      plot: 2322.62,
      flat: 4050.58,
      commercialUpper: 4552.25,
      commercialGround: 7060.62
    }
  }
];

const ReadyReckonerRate: React.FC = () => {
  const [language, setLanguage] = useState<'english' | 'marathi'>('english');

  const formatRate = (rate: number): string => {
    return `₹${rate.toFixed(2)}`;
  };

  const getLocationName = (data: ReadyReckonerData): string => {
    return language === 'english' ? data.location : data.locationMarathi;
  };

  const getColumnHeaders = () => {
    if (language === 'english') {
      return {
        location: 'Location',
        plot: 'Plot',
        flat: 'Flat',
        commercialUpper: 'Commercial (Upper Floor)',
        commercialGround: 'Commercial (Ground Floor)'
      };
    } else {
      return {
        location: 'स्थान',
        plot: 'प्लॉट',
        flat: 'फ्लॅट',
        commercialUpper: 'व्यापारी (वरील मजला)',
        commercialGround: 'व्यापारी (तळ मजला)'
      };
    }
  };

  const headers = getColumnHeaders();

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-0 rounded-3xl overflow-hidden shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-3">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {language === 'english' ? 'Ready Reckoner Rate' : 'तयार रेकनर दर'}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  {language === 'english' 
                    ? 'Rates in ₹ per sq. ft. - New Rates Only'
                    : 'दर प्रति चौरस फूट मध्ये - फक्त नवीन दरांची यादी'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                {language === 'english' ? 'Official Rates' : 'अधिकृत दर'}
              </Badge>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={language === 'english' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('english')}
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  English
                </Button>
                <Button
                  variant={language === 'marathi' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('marathi')}
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  मराठी
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="font-semibold text-foreground min-w-[250px]">
                    {headers.location}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-right">
                    {headers.plot}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-right">
                    {headers.flat}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-right">
                    {headers.commercialUpper}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-right">
                    {headers.commercialGround}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readyReckonerData.map((data, index) => (
                  <TableRow key={index} className="border-border/30 hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium py-4">
                      <div className="max-w-[240px]">
                        <span className="text-sm leading-relaxed">
                          {getLocationName(data)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatRate(data.rates.plot)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatRate(data.rates.flat)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatRate(data.rates.commercialUpper)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatRate(data.rates.commercialGround)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {language === 'english' ? 'Important Note' : 'महत्वाची नोंद'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'english' 
                ? 'This entire list is for new rates only. All rates are per square foot.'
                : 'ही संपूर्ण यादी फक्त नवीन दरांसाठी आहे. सर्व दर प्रति चौरस फूट आहेत.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadyReckonerRate;