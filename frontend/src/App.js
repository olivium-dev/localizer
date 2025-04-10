import React, { useState } from 'react';
import { 
  CssBaseline, Box, AppBar, Toolbar, Typography, Container, 
  Tabs, Tab, Paper, ThemeProvider, createTheme
} from '@mui/material';
import KeyList from './components/KeyList';
import LanguageManagement from './components/LanguageManagement';

// Create Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Localizer
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper sx={{ width: '100%', mb: 4 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Localization Keys" />
              <Tab label="Languages" />
            </Tabs>
          </Paper>
          
          {activeTab === 0 && (
            <KeyList />
          )}
          
          {activeTab === 1 && (
            <LanguageManagement />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
