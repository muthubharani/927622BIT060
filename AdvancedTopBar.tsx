import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  useTheme
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';

interface AdvancedTopBarProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const AdvancedTopBar: React.FC<AdvancedTopBarProps> = ({ onThemeToggle, isDarkMode }) => {
  const theme = useTheme();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState<null | HTMLElement>(null);

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setSettingsAnchorEl(null);
    setNotificationsAnchorEl(null);
    setAccountAnchorEl(null);
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
          : 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
        boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            fontWeight: 'bold',
            letterSpacing: '1px',
            flexGrow: 1
          }}
        >
          Stock Analytics
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            color="inherit" 
            onClick={onThemeToggle}
            sx={{ 
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'rotate(180deg)' }
            }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <IconButton 
            color="inherit"
            onClick={handleNotificationsClick}
            sx={{ 
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.1)' }
            }}
          >
            <NotificationsIcon />
          </IconButton>

          <IconButton 
            color="inherit"
            onClick={handleSettingsClick}
            sx={{ 
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'rotate(90deg)' }
            }}
          >
            <SettingsIcon />
          </IconButton>

          <IconButton 
            color="inherit"
            onClick={handleAccountClick}
            sx={{ 
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.1)' }
            }}
          >
            <AccountIcon />
          </IconButton>
        </Box>

        {/* Settings Menu */}
        <Menu
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem>
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={onThemeToggle}
                  color="primary"
                />
              }
              label="Dark Mode"
            />
          </MenuItem>
          <MenuItem onClick={handleClose}>Chart Settings</MenuItem>
          <MenuItem onClick={handleClose}>Display Options</MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsAnchorEl}
          open={Boolean(notificationsAnchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose}>Price Alerts</MenuItem>
          <MenuItem onClick={handleClose}>Market Updates</MenuItem>
          <MenuItem onClick={handleClose}>System Notifications</MenuItem>
        </Menu>

        {/* Account Menu */}
        <Menu
          anchorEl={accountAnchorEl}
          open={Boolean(accountAnchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>My Portfolio</MenuItem>
          <MenuItem onClick={handleClose}>Watchlist</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AdvancedTopBar; 