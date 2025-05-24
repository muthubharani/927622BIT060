import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { fetchStocks, fetchStockData } from '../services/api';
import { Stock, StockData } from '../types/stock';

const StockChart: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [timeInterval, setTimeInterval] = useState<number>(60);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const stocksList = await fetchStocks();
        console.log('Loaded stocks:', stocksList);
        setStocks(stocksList);
        if (stocksList.length > 0) {
          setSelectedStock(stocksList[0].ticker);
        }
      } catch (error) {
        console.error('Error loading stocks:', error);
      }
    };
    loadStocks();
  }, []);

  useEffect(() => {
    const loadStockData = async () => {
      if (selectedStock) {
        setIsLoading(true);
        try {
          const data = await fetchStockData(selectedStock, timeInterval);
          setStockData(data);
          // Animate chart appearance
          if (chartRef.current) {
            chartRef.current.style.opacity = '0';
            setTimeout(() => {
              if (chartRef.current) {
                chartRef.current.style.opacity = '1';
              }
            }, 50);
          }
        } catch (error) {
          console.error('Error loading stock data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadStockData();
  }, [selectedStock, timeInterval]);

  const handleStockChange = (event: SelectChangeEvent<string>) => {
    const newStock = event.target.value;
    // Animate stock change
    if (chartRef.current) {
      chartRef.current.style.transform = 'translateX(-20px)';
      chartRef.current.style.opacity = '0';
      setTimeout(() => {
        setSelectedStock(newStock);
        if (chartRef.current) {
          chartRef.current.style.transform = 'translateX(0)';
          chartRef.current.style.opacity = '1';
        }
      }, 300);
    } else {
      setSelectedStock(newStock);
    }
  };

  const handleTimeIntervalChange = (event: SelectChangeEvent<number>) => {
    setTimeInterval(Number(event.target.value));
  };

  console.log('Current stocks state:', stocks);

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{
          opacity: 0,
          animation: 'fadeIn 0.5s ease-in forwards',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(-20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        Stock Price Chart
      </Typography>
      
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 3,
          opacity: 0,
          animation: 'slideIn 0.5s ease-in 0.3s forwards',
          '@keyframes slideIn': {
            '0%': { opacity: 0, transform: 'translateX(-20px)' },
            '100%': { opacity: 1, transform: 'translateX(0)' }
          }
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="stock-select-label">Select Stock</InputLabel>
          <Select
            labelId="stock-select-label"
            id="stock-select"
            value={selectedStock}
            label="Select Stock"
            onChange={handleStockChange}
          >
            {stocks.map((stock) => (
              <MenuItem key={stock.ticker} value={stock.ticker}>
                {stock.name} ({stock.ticker})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="interval-select-label">Time Interval</InputLabel>
          <Select
            labelId="interval-select-label"
            id="interval-select"
            value={timeInterval}
            label="Time Interval"
            onChange={handleTimeIntervalChange}
          >
            <MenuItem value={15}>15 minutes</MenuItem>
            <MenuItem value={30}>30 minutes</MenuItem>
            <MenuItem value={60}>1 hour</MenuItem>
            <MenuItem value={120}>2 hours</MenuItem>
            <MenuItem value={240}>4 hours</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box 
        ref={chartRef}
        sx={{ 
          height: 400,
          transition: 'all 0.3s ease',
          opacity: isLoading ? 0.5 : 1,
          transform: 'translateX(0)',
          position: 'relative'
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 0.5 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.5 }
              }
            }}
          >
            Loading...
          </Box>
        )}
        {stockData && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stockData.prices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp: number) => new Date(timestamp).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(timestamp: number) => new Date(timestamp).toLocaleString()}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                name={`${selectedStock} Price`}
                animationDuration={1000}
                animationBegin={0}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
};

export default StockChart;