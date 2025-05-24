import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
  Brush,
} from 'recharts';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Paper,
  IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { ZoomIn, ZoomOut, PanTool } from '@mui/icons-material';
import { fetchStocks, fetchStockData } from '../services/api';
import { Stock, StockData } from '../types/stock';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
} from '../utils/analytics';

interface IndicatorSettings {
  sma: boolean;
  ema: boolean;
  rsi: boolean;
  macd: boolean;
  bollingerBands: boolean;
}

const AdvancedChart: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [timeInterval, setTimeInterval] = useState<number>(60);
  const [stockData, setStockData] = useState<{ [key: string]: StockData }>({});
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    sma: false,
    ema: false,
    rsi: false,
    macd: false,
    bollingerBands: false,
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [brushStartIndex, setBrushStartIndex] = useState<number>(0);
  const [brushEndIndex, setBrushEndIndex] = useState<number>(0);

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const stocksList = await fetchStocks();
        setStocks(stocksList);
        if (stocksList.length > 0) {
          setSelectedStocks([stocksList[0].ticker]);
        }
      } catch (error) {
        console.error('Error loading stocks:', error);
      }
    };
    loadStocks();
  }, []);

  useEffect(() => {
    const loadStockData = async () => {
      const newStockData: { [key: string]: StockData } = {};
      for (const ticker of selectedStocks) {
        try {
          const data = await fetchStockData(ticker, timeInterval);
          newStockData[ticker] = data;
        } catch (error) {
          console.error(`Error loading data for ${ticker}:`, error);
        }
      }
      setStockData(newStockData);
    };
    loadStockData();
  }, [selectedStocks, timeInterval]);

  const handleStockChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedStocks(event.target.value as string[]);
  };

  const handleTimeIntervalChange = (event: SelectChangeEvent<number>) => {
    setTimeInterval(Number(event.target.value));
  };

  const handleIndicatorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIndicators({
      ...indicators,
      [event.target.name]: event.target.checked,
    });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handlePanToggle = () => {
    setIsPanning(prev => !prev);
  };

  const handleBrushChange = (newDomain: any) => {
    if (newDomain && newDomain.startIndex !== undefined && newDomain.endIndex !== undefined) {
      setBrushStartIndex(newDomain.startIndex);
      setBrushEndIndex(newDomain.endIndex);
    }
  };

  const renderChart = () => {
    if (selectedStocks.length === 0 || !stockData[selectedStocks[0]]?.prices) return null;

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
    const chartData = stockData[selectedStocks[0]].prices.map((price, index) => {
      const data: any = {
        timestamp: price.timestamp,
      };

      // Add price data for each selected stock
      selectedStocks.forEach((ticker, i) => {
        const stockPrices = stockData[ticker]?.prices;
        if (stockPrices) {
          data[`${ticker}_price`] = stockPrices[index]?.price;
        }
      });

      // Add technical indicators if enabled
      if (indicators.sma) {
        const sma = calculateSMA(
          stockData[selectedStocks[0]].prices.map(p => p.price),
          20
        );
        data.sma = sma[index];
      }

      if (indicators.ema) {
        const ema = calculateEMA(
          stockData[selectedStocks[0]].prices.map(p => p.price),
          20
        );
        data.ema = ema[index];
      }

      if (indicators.bollingerBands) {
        const bands = calculateBollingerBands(
          stockData[selectedStocks[0]].prices.map(p => p.price)
        );
        data.upperBand = bands.upper[index];
        data.middleBand = bands.middle[index];
        data.lowerBand = bands.lower[index];
      }

      return data;
    });

    // Initialize brush indices if not set
    if (brushEndIndex === 0 && chartData.length > 0) {
      setBrushEndIndex(chartData.length - 1);
    }

    const visibleData = chartData.slice(brushStartIndex, brushEndIndex + 1);

    return (
      <Box sx={{ height: 600 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1 }}>
          <MuiTooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </MuiTooltip>
          <MuiTooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </MuiTooltip>
          <MuiTooltip title={isPanning ? "Disable Panning" : "Enable Panning"}>
            <IconButton 
              onClick={handlePanToggle} 
              size="small"
              color={isPanning ? "primary" : "default"}
            >
              <PanTool />
            </IconButton>
          </MuiTooltip>
        </Box>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={visibleData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp: number) => new Date(timestamp).toLocaleTimeString()}
              scale="time"
              type="number"
              domain={['dataMin', 'dataMax']}
              allowDataOverflow={true}
            />
            <YAxis 
              yAxisId="left"
              domain={['auto', 'auto']}
              allowDataOverflow={true}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              domain={['auto', 'auto']}
              allowDataOverflow={true}
            />
            <Tooltip
              labelFormatter={(timestamp: number) => new Date(timestamp).toLocaleString()}
              formatter={(value: number, name: string) => [
                `$${value.toFixed(2)}`,
                name.replace('_price', ' Price'),
              ]}
            />
            <Legend />
            <Brush
              dataKey="timestamp"
              height={30}
              stroke="#8884d8"
              onChange={handleBrushChange}
              startIndex={brushStartIndex}
              endIndex={brushEndIndex}
            />

            {/* Price lines for each stock */}
            {selectedStocks.map((ticker, index) => (
              <Line
                key={ticker}
                yAxisId="left"
                type="monotone"
                dataKey={`${ticker}_price`}
                stroke={colors[index % colors.length]}
                name={`${ticker} Price`}
                dot={false}
                isAnimationActive={false}
              />
            ))}

            {/* Technical indicators */}
            {indicators.sma && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sma"
                stroke="#ff7300"
                name="SMA (20)"
                dot={false}
                isAnimationActive={false}
              />
            )}

            {indicators.ema && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ema"
                stroke="#00C49F"
                name="EMA (20)"
                dot={false}
                isAnimationActive={false}
              />
            )}

            {indicators.bollingerBands && (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="upperBand"
                  stroke="#8884d8"
                  name="Upper Band"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="middleBand"
                  stroke="#82ca9d"
                  name="Middle Band"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="lowerBand"
                  stroke="#8884d8"
                  name="Lower Band"
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Advanced Stock Chart
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Stocks</InputLabel>
                <Select
                  multiple
                  value={selectedStocks}
                  label="Select Stocks"
                  onChange={handleStockChange}
                >
                  {stocks.map((stock) => (
                    <MenuItem key={stock.ticker} value={stock.ticker}>
                      {stock.name} ({stock.ticker})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Time Interval (minutes)</InputLabel>
                <Select
                  value={timeInterval}
                  label="Time Interval (minutes)"
                  onChange={handleTimeIntervalChange}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                  <MenuItem value={240}>4 hours</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Technical Indicators
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={indicators.sma}
                      onChange={handleIndicatorChange}
                      name="sma"
                    />
                  }
                  label="Simple Moving Average (20)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={indicators.ema}
                      onChange={handleIndicatorChange}
                      name="ema"
                    />
                  }
                  label="Exponential Moving Average (20)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={indicators.bollingerBands}
                      onChange={handleIndicatorChange}
                      name="bollingerBands"
                    />
                  }
                  label="Bollinger Bands"
                />
              </FormGroup>
            </Paper>
          </Box>
        </Box>

        <Box>
          {renderChart()}
        </Box>
      </Box>
    </Box>
  );
};

export default AdvancedChart; 