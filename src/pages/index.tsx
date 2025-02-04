"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveLine } from '@nivo/line';
import axios from 'axios';
import { DigitalClock } from '@/components/blocks/digital-clock';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const TIME_RANGES = {
  '1D': { days: 1 },
  '1W': { days: 7 },
  '1M': { days: 30 },
  '6M': { days: 180 },
  '1Y': { days: 365 },
  'ALL': { days: 'max' }
};

export default function CryptoDashboard() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrencies, setSelectedCurrencies] = useState(new Set());
  const [timeRange, setTimeRange] = useState('1W');
  const [historicalData, setHistoricalData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

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

  const fetchHistoricalData = async (cryptoId) => {
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
          data: data.prices.map(([timestamp, price]) => ({
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

  const formatDate = (date) => {
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

  const handleCryptoClick = (crypto) => {
    setSelectedCrypto(crypto);
  };

  const toggleCurrency = (cryptoId) => {
    const newSelected = new Set(selectedCurrencies);
    if (newSelected.has(cryptoId)) {
      newSelected.delete(cryptoId);
    } else {
      newSelected.add(cryptoId);
    }
    setSelectedCurrencies(newSelected);
  };

  const filteredCryptoData = cryptoData.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedCryptos = cryptoData.filter(crypto => selectedCurrencies.has(crypto.id));

  const chartTheme = {
    background: 'transparent',
    textColor: theme === 'dark' ? '#e2e8f0' : '#1e293b',
    fontSize: 12,
    axis: {
      domain: {
        line: {
          stroke: theme === 'dark' ? '#475569' : '#cbd5e1',
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: theme === 'dark' ? '#475569' : '#cbd5e1',
          strokeWidth: 1,
        },
        text: {
          fill: theme === 'dark' ? '#94a3b8' : '#64748b',
        }
      },
    },
    grid: {
      line: {
        stroke: theme === 'dark' ? '#1e293b' : '#e2e8f0',
        strokeWidth: 1,
      },
    },
    crosshair: {
      line: {
        stroke: theme === 'dark' ? '#94a3b8' : '#64748b',
        strokeWidth: 1,
        strokeDasharray: '4 4',
      },
    },
    tooltip: {
      container: {
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
        fontSize: 'inherit',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        padding: '6px 8px',
      },
    },
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Crypto Dashboard</h1>
          <p className="text-muted-foreground">Real-time cryptocurrency market data</p>
        </div>
        <div className="flex items-center gap-4">
          <DigitalClock />
          <ThemeToggle />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Dashboard Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Cryptocurrencies</label>
                  <Input
                    placeholder="Search by name or symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Cryptocurrencies to Display</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                    {filteredCryptoData.map((crypto) => (
                      <div key={crypto.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={crypto.id}
                          checked={selectedCurrencies.has(crypto.id)}
                          onCheckedChange={() => toggleCurrency(crypto.id)}
                        />
                        <label
                          htmlFor={crypto.id}
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {displayedCryptos.map((crypto) => (
              <Card 
                key={crypto.id} 
                className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                  selectedCrypto?.id === crypto.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCryptoClick(crypto)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                  <h2 className="font-semibold">{crypto.name}</h2>
                  <Badge variant="outline" className="ml-auto">
                    {crypto.symbol.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">${crypto.current_price.toLocaleString()}</p>
                  <p className={`text-sm ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {crypto.price_change_percentage_24h.toFixed(2)}% (24h)
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <div className="flex justify-end gap-2 mb-4">
              {Object.keys(TIME_RANGES).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
            <div className="h-[400px] relative">
              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                    format: formatDate,
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
                  colors={['rgb(75, 192, 192)']}
                  lineWidth={2}
                  enableArea={true}
                  areaOpacity={0.1}
                  sliceTooltip={({ slice }) => (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-2">
                      <div className="text-sm font-medium">
                        {formatDate(slice.points[0].data.x)}
                      </div>
                      <div className="text-lg font-bold">
                        ${slice.points[0].data.y.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </Card>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Asset</th>
                  <th className="text-right p-4">Price</th>
                  <th className="text-right p-4">24h Change</th>
                  <th className="text-right p-4">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {displayedCryptos.map((crypto) => (
                  <tr 
                    key={crypto.id} 
                    className={`border-b hover:bg-muted/50 cursor-pointer ${
                      selectedCrypto?.id === crypto.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleCryptoClick(crypto)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                        <span className="font-medium">{crypto.name}</span>
                        <span className="text-muted-foreground">{crypto.symbol.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="text-right p-4">${crypto.current_price.toLocaleString()}</td>
                    <td className={`text-right p-4 ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td className="text-right p-4">${crypto.market_cap.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}