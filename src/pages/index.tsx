import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

export default function CryptoDashboard() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 10,
            page: 1,
            sparkline: false,
          },
        });
        setCryptoData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  const data = {
    labels: cryptoData.map((crypto) => crypto.name),
    datasets: [
      {
        label: 'Price in USD',
        data: cryptoData.map((crypto) => crypto.current_price),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Crypto Dashboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cryptoData.map((crypto) => (
            <Card key={crypto.id} className="p-4">
              <h2 className="text-2xl font-semibold mb-2">{crypto.name}</h2>
              <Badge variant="secondary">${crypto.current_price}</Badge>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-8">
        <Line data={data} />
      </div>
    </div>
  );
}
