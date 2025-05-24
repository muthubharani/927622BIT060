import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import StockChart from './components/StockChart';
import CorrelationHeatmap from './components/CorrelationHeatmap';
import AdvancedTopBar from './components/AdvancedTopBar';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#2196f3',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          <AdvancedTopBar onThemeToggle={handleThemeToggle} isDarkMode={isDarkMode} />
          <Routes>
            <Route path="/" element={<StockChart />} />
            <Route path="/correlation" element={<CorrelationHeatmap />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
