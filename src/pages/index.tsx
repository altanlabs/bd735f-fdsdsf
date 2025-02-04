import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveLine } from '@nivo/line';
import { DigitalClock } from '@/components/blocks/digital-clock';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

const TIME_RANGES = {
  '1D': { days: 1 },
  '1W': { days: 7 },
  '1M': { days: 30 },
  '6M': { days: 180 },
  '1Y': { days: 365 },
  'ALL': { days: 'max' }
} as const;

const CryptoDashboard: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrencies, setSelectedCurrencies] = useState<Set<string>>(new Set());
  const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>('1W');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchCryptoData = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false');
      const data = await response.json();
      
      if (data && data.length > 0) {
        setCryptoData(data);
        
        if (!selectedCrypto) {
          setSelectedCrypto(data[0]);
          fetchHistoricalData(data[0].id);
        }
        
        if (selectedCurrencies.size === 0) {
          setSelectedCurrencies(new Set(data.slice(0, 4).map(c => c.id)));
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (cryptoId: string) => {
    if (!cryptoId) return;
    
    setChartLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${TIME_RANGES[timeRange].days}`
      );
      const data = await response.json();
      
      if (data && data.prices) {
        const formattedData = [{
          id: 'price',
          data: data.prices.map(([timestamp, price]: [number, number]) => ({
            x: new Date(timestamp),
            y: price
          }))
        }];
        setHistoricalData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setHistoricalData([]);
    }
    setChartLoading(false);
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCrypto) {
      fetchHistoricalData(selectedCrypto.id);
    }
  }, [timeRange, selectedCrypto?.id]);

  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    switch(timeRange) {
      case '1D':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '1W':
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      case '1M':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '6M':
      case '1Y':
      case 'ALL':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
      default:
        return date.toLocaleDateString();
    }
  };

  const handleCryptoClick = (crypto: CryptoData) => {
    setSelectedCrypto(crypto);
  };

  const toggleCurrency = (cryptoId: string) => {
    const newSelected = new Set(selectedCurrencies);
    if (newSelected.has(cryptoId)) {
      newSelected.delete(cryptoId);
    } else {
      newSelected.add(cryptoId);
    }
    setSelectedCurrencies(newSelected);
  };

  const displayedCryptos = cryptoData.filter(crypto => selectedCurrencies.has(crypto.id));

  const chartTheme = {
    background: 'transparent',
    textColor: '#00ff00',
    fontSize: 12,
    fontFamily: 'VT323',
    axis: {
      domain: {
        line: {
          stroke: '#00ff00',
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: '#00ff00',
          strokeWidth: 1,
        },
        text: {
          fill: '#00ff00',
        }
      },
    },
    grid: {
      line: {
        stroke: '#00ff0020',
        strokeWidth: 1,
      },
    },
    crosshair: {
      line: {
        stroke: '#00ff00',
        strokeWidth: 1,
        strokeDasharray: '4 4',
      },
    },
    tooltip: {
      container: {
        background: '#001a00',
        color: '#00ff00',
        fontFamily: 'VT323',
        fontSize: '16px',
        border: '1px solid #00ff00',
        boxShadow: '0 0 10px rgba(0, 255, 0, 0.2)',
      },
    },
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl mb-2 text-primary">CRYPTO TERMINAL v1.0</h1>
          <p className="text-muted-foreground font-vt323 text-lg">REAL-TIME MARKET DATA</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="digital-display">
            <DigitalClock />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="retro-button" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="retro-card max-w-md">
              <DialogHeader>
                <DialogTitle className="text-primary text-xl">SYSTEM CONFIG</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">SEARCH ASSETS</label>
                  <Input
                    className="retro-input"
                    placeholder="ENTER ASSET NAME..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">SELECT ASSETS</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                    {cryptoData.map((crypto) => (
                      <div key={crypto.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={crypto.id}
                          checked={selectedCurrencies.has(crypto.id)}
                          onCheckedChange={() => toggleCurrency(crypto.id)}
                          className="border-primary"
                        />
                        <label
                          htmlFor={crypto.id}
                          className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer"
                        >
                          <img src={crypto.image} alt={crypto.name} className="w-4 h-4" />
                          {crypto.name}
                          <span className="text-muted-foreground">({crypto.symbol.toUpperCase()})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-primary text-xl font-vt323">LOADING DATA...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {displayedCryptos.map((crypto) => (
              <Card 
                key={crypto.id} 
                className={`retro-card p-4 cursor-pointer transition-all hover:scale-105 ${
                  selectedCrypto?.id === crypto.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCryptoClick(crypto)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                  <h2 className="font-vt323 text-lg">{crypto.name}</h2>
                  <Badge variant="outline" className="ml-auto border-primary text-primary">
                    {crypto.symbol.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold font-vt323 text-primary">${crypto.current_price.toLocaleString()}</p>
                  <p className={`text-sm ${crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.price_change_percentage_24h.toFixed(2)}% (24h)
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="retro-card p-6 mb-8">
            <div className="flex justify-end gap-2 mb-4">
              {Object.keys(TIME_RANGES).map((range) => (
                <Button
                  key={range}
                  className={`retro-button ${timeRange === range ? 'bg-primary text-primary-foreground' : 'bg-background text-primary'}`}
                  onClick={() => setTimeRange(range as keyof typeof TIME_RANGES)}
                >
                  {range}
                </Button>
              ))}
            </div>
            <div className="h-[400px] relative">
              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <div className="text-primary text-xl font-vt323">LOADING CHART...</div>
                </div>
              ) : historicalData[0]?.data?.length > 0 ? (
                <ResponsiveLine
                  data={historicalData}
                  margin={{ top: 10, right: 40, bottom: 50, left: 60 }}
                  xScale={{
                    type: 'time',
                    format: 'native',
                  }}
                  yScale={{
                    type: 'linear',
                    min: 'auto',
                    max: 'auto',
                    stacked: false,
                  }}
                  axisLeft={{
                    format: value => 
                      value >= 1000
                        ? `$${(value / 1000).toFixed(1)}k`
                        : `$${value.toFixed(1)}`,
                  }}
                  axisBottom={{
                    format: (date: Date) => formatDate(date),
                    tickRotation: -45,
                    tickValues: 5,
                  }}
                  enableGridX={false}
                  curve="monotoneX"
                  enablePoints={false}
                  enableSlices="x"
                  animate={true}
                  motionConfig="gentle"
                  theme={chartTheme}
                  colors={['#00ff00']}
                  lineWidth={2}
                  enableArea={true}
                  areaOpacity={0.1}
                  sliceTooltip={({ slice }) => (
                    <div className="bg-background border border-primary rounded-none p-2 font-vt323">
                      <div className="text-sm">
                        {formatDate(new Date(slice.points[0].data.x))}
                      </div>
                      <div className="text-lg text-primary">
                        ${slice.points[0].data.y.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground font-vt323">
                  NO DATA AVAILABLE
                </div>
              )}
            </div>
          </Card>

          <div className="mt-8 overflow-x-auto">
            <table className="retro-table">
              <thead>
                <tr>
                  <th className="text-left">ASSET</th>
                  <th className="text-right">PRICE</th>
                  <th className="text-right">24H CHANGE</th>
                  <th className="text-right">MARKET CAP</th>
                </tr>
              </thead>
              <tbody>
                {displayedCryptos.map((crypto) => (
                  <tr 
                    key={crypto.id} 
                    className={`cursor-pointer ${
                      selectedCrypto?.id === crypto.id ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => handleCryptoClick(crypto)}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                        <span className="font-medium">{crypto.name}</span>
                        <span className="text-muted-foreground">{crypto.symbol.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="text-right">${crypto.current_price.toLocaleString()}</td>
                    <td className={`text-right ${crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td className="text-right">${crypto.market_cap.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
};

export default CryptoDashboard;