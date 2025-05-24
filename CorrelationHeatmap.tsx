import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { fetchStocks, fetchStockData } from '../services/api';
import { Stock, StockData } from '../types/stock';
import { calculateCorrelation } from '../utils/analytics';

interface CorrelationMatrix {
  [key: string]: {
    [key: string]: number;
  };
}

const CorrelationHeatmap: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationMatrix>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const stocksList = await fetchStocks();
        setStocks(stocksList);
        await calculateCorrelations(stocksList);
      } catch (error) {
        console.error('Error loading stocks:', error);
      }
    };
    loadStocks();
  }, []);

  const calculateCorrelations = async (stocksList: Stock[]) => {
    setLoading(true);
    try {
      const stockDataMap: { [key: string]: number[] } = {};
      
      // Fetch price data for all stocks
      for (const stock of stocksList) {
        const data = await fetchStockData(stock.ticker, 60); // Use 60 minutes of data
        stockDataMap[stock.ticker] = data.prices.map(p => p.price);
      }

      // Calculate correlation matrix
      const matrix: CorrelationMatrix = {};
      for (const stock1 of stocksList) {
        matrix[stock1.ticker] = {};
        for (const stock2 of stocksList) {
          if (stock1.ticker === stock2.ticker) {
            matrix[stock1.ticker][stock2.ticker] = 1;
          } else {
            const correlation = calculateCorrelation(
              stockDataMap[stock1.ticker],
              stockDataMap[stock2.ticker]
            );
            matrix[stock1.ticker][stock2.ticker] = correlation;
          }
        }
      }
      
      setCorrelationMatrix(matrix);
    } catch (error) {
      console.error('Error calculating correlations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColor = (correlation: number) => {
    const hue = correlation > 0 ? 120 : 0; // Green for positive, Red for negative
    const saturation = Math.abs(correlation) * 100;
    return `hsl(${hue}, ${saturation}%, 50%)`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Stock Correlation Heatmap
      </Typography>
      
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px' }}></th>
              {stocks.map(stock => (
                <th key={stock.ticker} style={{ padding: '8px' }}>
                  {stock.ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stocks.map(stock1 => (
              <tr key={stock1.ticker}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>
                  {stock1.ticker}
                </td>
                {stocks.map(stock2 => (
                  <td
                    key={`${stock1.ticker}-${stock2.ticker}`}
                    style={{
                      padding: '8px',
                      backgroundColor: getColor(correlationMatrix[stock1.ticker]?.[stock2.ticker] || 0),
                      color: 'white',
                      textAlign: 'center',
                    }}
                  >
                    {correlationMatrix[stock1.ticker]?.[stock2.ticker]?.toFixed(2) || '0.00'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="subtitle1">Legend:</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: 'hsl(0, 100%, 50%)' }} />
          <Typography>Strong Negative</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: 'hsl(0, 0%, 50%)' }} />
          <Typography>No Correlation</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: 'hsl(120, 100%, 50%)' }} />
          <Typography>Strong Positive</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CorrelationHeatmap; 