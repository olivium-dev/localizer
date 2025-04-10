import React, { useState } from 'react';
import { 
  Box, Button, Typography, Card, CardContent, 
  CircularProgress, Snackbar, Alert,
  List, ListItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import MobileScreenShareIcon from '@mui/icons-material/MobileScreenShare';
import InfoIcon from '@mui/icons-material/Info';
import { exportApi } from '../api/api';

const ExportOptions = () => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Handle close of snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Handle export to Flutter
  const handleExportToFlutter = async () => {
    try {
      setLoading(true);
      
      // Create a response for file download
      const response = await exportApi.flutter();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'flutter_localizations.zip');
      document.body.appendChild(link);
      link.click();
      
      // Clean up and show success message
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      setSnackbar({
        open: true,
        message: 'Successfully exported to Flutter!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting to Flutter:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export to Flutter. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Export Options
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mobile App Exports
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <MobileScreenShareIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Flutter/Dart" 
                secondary="Export localization files ready to be used in a Flutter app" 
              />
              <Button 
                variant="contained" 
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
                onClick={handleExportToFlutter}
                disabled={loading}
              >
                Export
              </Button>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="What's Included"
                secondary={
                  <React.Fragment>
                    <Typography variant="body2" component="span">
                      The export includes:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Full Dart implementation of the AppLocalizations class" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Individual language files with all translations" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="l10n.yaml configuration file" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="README with installation and usage instructions" />
                      </ListItem>
                    </List>
                  </React.Fragment>
                }
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExportOptions; 