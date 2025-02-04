import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TIME_RANGES = {
  '1D': { days: 1, interval: 'minutely' },
  '1W': { days: 7, interval: 'hourly' },
  '1M': { days: 30, interval: 'hourly' },
  '6M': { days: 180, interval: 'daily' },
  '1Y': { days: 365, interval: 'daily' },
  'ALL': { days: 'max', interval: 'daily' }
};

export default function CryptoDashboard() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrencies, setSelectedCurrencies] = useState(new Set());
  const [timeRange, setTimeRange] = useState('1W');
  const [historicalData, setHistoricalData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 20,
            page: 1,
            sparkline: false,
          },
        });
        setCryptoData(response.data);
        if (!selectedCrypto) {
          setSelectedCrypto(response.data[0]);
          fetchHistoricalData(response.data[0].id, timeRange);
        }
        if (selectedCurrencies.size === 0) {
          setSelectedCurrencies(new Set(response.data.slice(0, 4).map(crypto => crypto.id)));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistoricalData = async (cryptoId, range) => {
    setChartLoading(true);
    try {
      let endpoint;
      let params = { vs_currency: 'usd' };

      if (range === '1D') {
        endpoint = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`;
        params.days = 1;
        params.interval = 'minute';
      } else if (range === '1W') {
        endpoint = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`;
        params.days = 7;
        params.interval = 'hourly';
      } else if (range === '1M') {
        endpoint = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`;
        params.days = 30;
        params.interval = 'hourly';
      } else {
        endpoint = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`;
        params.days = TIME_RANGES[range].days === 'max' ? 'max' : TIME_RANGES[range].days;
      }

      const response = await axios.get(endpoint, { params });
      setHistoricalData(response.data.prices);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
    setChartLoading(false);
  };

  useEffect(() => {
    if (selectedCrypto) {
      fetchHistoricalData(selectedCrypto.id, timeRange);
    }
  }, [timeRange, selectedCrypto?.id]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    switch(timeRange) {
      case '1D':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '1W':
        return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit' });
      case '1M':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '6M':
      case '1Y':
      case 'ALL':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  const chartData = {
    labels: historicalData.map(([timestamp]) => formatDate(timestamp)),
    datasets: [
      {
        label: selectedCrypto ? `${selectedCrypto.name} Price (USD)` : 'Price (USD)',
        data: historicalData.map(([, price]) => price),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointRadius: timeRange === '1D' ? 0 : 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${selectedCrypto?.name || ''} Price History (${timeRange})`,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `$${context.parsed.y.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: timeRange === '1D' ? 12 : 8,
          maxRotation: 0,
        },
        grid: {
          display: false,
        },
      },
      y: {
        position: 'right',
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Crypto Dashboard</h1>
          <p className="text-muted-foreground">Real-time cryptocurrency market data</p>
        </div>
        <div className="flex items-center gap-4">
          <DigitalClock />
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
              ) : (
                <Line options={chartOptions} data={chartData} />
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
                {cryptoData.map((crypto) => (
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