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

  return (
    <div className="winxp-window min-h-screen">
      <div className="winxp-titlebar">
        <div className="winxp-titlebar-text flex items-center gap-2">
          <img src="https://i.imgur.com/VA8RCtI.png" alt="Crypto" className="w-4 h-4" />
          Crypto Dashboard
        </div>
        <div className="winxp-window-controls">
          <button className="px-2 text-white hover:bg-blue-700">_</button>
          <button className="px-2 text-white hover:bg-blue-700">□</button>
          <button className="px-2 text-white hover:bg-red-600">×</button>
        </div>
      </div>

      <div className="p-4 bg-[#ECE9D8]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="winxp-button">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="winxp-window">
                <div className="winxp-titlebar">
                  <DialogTitle className="winxp-titlebar-text">Settings</DialogTitle>
                </div>
                <div className="p-4 bg-[#ECE9D8]">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Search Assets:</label>
                      <Input
                        className="winxp-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Enter asset name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Select Assets:</label>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {cryptoData.map((crypto) => (
                          <div key={crypto.id} className="flex items-center gap-2 p-1 hover:bg-blue-100">
                            <Checkbox
                              checked={selectedCurrencies.has(crypto.id)}
                              onCheckedChange={() => toggleCurrency(crypto.id)}
                            />
                            <img src={crypto.image} alt={crypto.name} className="w-5 h-5" />
                            <span>{crypto.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <DigitalClock />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {displayedCryptos.map((crypto) => (
            <Card
              key={crypto.id}
              className={`winxp-card cursor-pointer ${
                selectedCrypto?.id === crypto.id ? 'ring-2 ring-[#0831D9]' : ''
              }`}
              onClick={() => handleCryptoClick(crypto)}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                  <h3 className="font-bold">{crypto.name}</h3>
                  <Badge className="ml-auto winxp-badge">
                    {crypto.symbol.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">${crypto.current_price.toLocaleString()}</p>
                  <p className={crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {crypto.price_change_percentage_24h.toFixed(2)}% (24h)
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="winxp-card mb-6">
          <div className="p-4">
            <div className="flex justify-end gap-2 mb-4">
              {Object.keys(TIME_RANGES).map((range) => (
                <Button
                  key={range}
                  onClick={() => setTimeRange(range as keyof typeof TIME_RANGES)}
                  className={`winxp-button ${
                    timeRange === range ? 'bg-[#0831D9] text-white' : ''
                  }`}
                >
                  {range}
                </Button>
              ))}
            </div>
            <div className="h-[400px] relative">
              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  Loading chart...
                </div>
              ) : (
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
                  }}
                  enablePoints={false}
                  enableGridX={false}
                  curve="monotoneX"
                  colors={['#0831D9']}
                  theme={{
                    axis: {
                      ticks: {
                        text: {
                          fill: '#333333',
                          fontSize: 12,
                        },
                      },
                    },
                    grid: {
                      line: {
                        stroke: '#E5E5E5',
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </Card>

        <Card className="winxp-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#ECE9D8] border-b border-[#919B9C]">
                <tr>
                  <th className="text-left p-3">Asset</th>
                  <th className="text-right p-3">Price</th>
                  <th className="text-right p-3">24h Change</th>
                  <th className="text-right p-3">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {displayedCryptos.map((crypto) => (
                  <tr
                    key={crypto.id}
                    className={`cursor-pointer hover:bg-[#E8E8E8] ${
                      selectedCrypto?.id === crypto.id ? 'bg-[#E8E8E8]' : ''
                    }`}
                    onClick={() => handleCryptoClick(crypto)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                        <span className="font-medium">{crypto.name}</span>
                        <span className="text-gray-600">{crypto.symbol.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="text-right p-3">${crypto.current_price.toLocaleString()}</td>
                    <td className={`text-right p-3 ${
                      crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td className="text-right p-3">${crypto.market_cap.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CryptoDashboard;