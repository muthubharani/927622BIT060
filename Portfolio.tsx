import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchStocks, fetchStockData } from '../services/api';
import { Stock, Portfolio as PortfolioType, PortfolioStock } from '../types/stock';
import { calculatePortfolioValue, calculatePortfolioPerformance } from '../utils/analytics';

const Portfolio: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioType>({
    id: '1',
    name: 'My Portfolio',
    stocks: [],
    totalValue: 0,
    performance: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
    },
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState('');
  const [shares, setShares] = useState('');
  const [averagePrice, setAveragePrice] = useState('');

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const stocksList = await fetchStocks();
        setStocks(stocksList);
      } catch (error) {
        console.error('Error loading stocks:', error);
      }
    };
    loadStocks();
  }, []);

  useEffect(() => {
    const updatePortfolioData = async () => {
      const updatedStocks = await Promise.all(
        portfolio.stocks.map(async (stock) => {
          try {
            const data = await fetchStockData(stock.ticker, 1);
            const currentPrice = data.prices[data.prices.length - 1].price;
            return {
              ...stock,
              currentPrice,
              value: stock.shares * currentPrice,
              performance: ((currentPrice - stock.averagePrice) / stock.averagePrice) * 100,
            };
          } catch (error) {
            console.error(`Error updating ${stock.ticker}:`, error);
            return stock;
          }
        })
      );

      const totalValue = calculatePortfolioValue(updatedStocks);
      const performance = calculatePortfolioPerformance(updatedStocks);

      setPortfolio({
        ...portfolio,
        stocks: updatedStocks,
        totalValue,
        performance: {
          daily: performance,
          weekly: performance,
          monthly: performance,
          yearly: performance,
        },
      });
    };

    if (portfolio.stocks.length > 0) {
      updatePortfolioData();
    }
  }, [portfolio.stocks.length]);

  const handleAddStock = () => {
    if (selectedStock && shares && averagePrice) {
      const newStock: PortfolioStock = {
        ticker: selectedStock,
        shares: Number(shares),
        averagePrice: Number(averagePrice),
        currentPrice: 0,
        value: 0,
        performance: 0,
      };

      setPortfolio({
        ...portfolio,
        stocks: [...portfolio.stocks, newStock],
      });

      setOpenDialog(false);
      setSelectedStock('');
      setShares('');
      setAveragePrice('');
    }
  };

  const handleRemoveStock = (ticker: string) => {
    setPortfolio({
      ...portfolio,
      stocks: portfolio.stocks.filter((stock) => stock.ticker !== ticker),
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Portfolio</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Stock
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Portfolio Summary
              </Typography>
              <Typography variant="body1">
                Total Value: ${portfolio.totalValue.toFixed(2)}
              </Typography>
              <Typography variant="body1">
                Daily Performance: {portfolio.performance.daily.toFixed(2)}%
              </Typography>
              <Typography variant="body1">
                Weekly Performance: {portfolio.performance.weekly.toFixed(2)}%
              </Typography>
              <Typography variant="body1">
                Monthly Performance: {portfolio.performance.monthly.toFixed(2)}%
              </Typography>
              <Typography variant="body1">
                Yearly Performance: {portfolio.performance.yearly.toFixed(2)}%
              </Typography>
            </Paper>
          </Box>
        </Box>

        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stock</TableCell>
                  <TableCell align="right">Shares</TableCell>
                  <TableCell align="right">Avg. Price</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">Performance</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {portfolio.stocks.map((stock) => (
                  <TableRow key={stock.ticker}>
                    <TableCell>{stock.ticker}</TableCell>
                    <TableCell align="right">{stock.shares}</TableCell>
                    <TableCell align="right">${stock.averagePrice.toFixed(2)}</TableCell>
                    <TableCell align="right">${stock.currentPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">${stock.value.toFixed(2)}</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: stock.performance >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {stock.performance.toFixed(2)}%
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveStock(stock.ticker)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Stock to Portfolio</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              select
              label="Stock"
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              fullWidth
            >
              {stocks.map((stock) => (
                <MenuItem key={stock.ticker} value={stock.ticker}>
                  {stock.name} ({stock.ticker})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Number of Shares"
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              fullWidth
            />
            <TextField
              label="Average Price"
              type="number"
              value={averagePrice}
              onChange={(e) => setAveragePrice(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddStock} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Portfolio; 