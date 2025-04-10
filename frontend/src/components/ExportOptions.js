import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Divider
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DataObjectIcon from '@mui/icons-material/DataObject';
import TableChartIcon from '@mui/icons-material/TableChart';
import { exportApi } from '../api/api';

const ExportOptions = () => {
  const [loading, setLoading] = useState({
    flutter: false,
    json: false,
    csv: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const downloadExport = async (exportType, fileName, apiCall) => {
    setLoading({ ...loading, [exportType]: true });
    
    try {
      const response = await apiCall();
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({
        open: true,
        message: `${exportType.charAt(0).toUpperCase() + exportType.slice(1)} export completed successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error(`Error exporting to ${exportType}:`, error);
      setSnackbar({
        open: true,
        message: `Failed to export to ${exportType}. Please try again.`,
        severity: 'error'
      });
    } finally {
      setLoading({ ...loading, [exportType]: false });
    }
  };

  const handleExportToFlutter = () => {
    downloadExport('flutter', 'flutter_localization.zip', exportApi.flutter);
  };

  const handleExportToJson = () => {
    downloadExport('json', 'localization.json', exportApi.json);
  };

  const handleExportToCsv = () => {
    downloadExport('csv', 'localization.csv', exportApi.csv);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Export Options
      </Typography>
      <Typography variant="body1" paragraph>
        Export your localization data in various formats to use in different platforms and systems.
      </Typography>

      <Grid container spacing={3}>
        {/* Flutter Export Option */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Export to Flutter
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" paragraph>
              Export your localization data for Flutter applications.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CodeIcon />
                </ListItemIcon>
                <ListItemText primary="Dart implementation" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary="Language files" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Configuration file" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary="README file" />
              </ListItem>
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading.flutter ? <CircularProgress size={24} color="inherit" /> : <FileDownloadIcon />}
                onClick={handleExportToFlutter}
                disabled={loading.flutter}
              >
                {loading.flutter ? 'Exporting...' : 'Export'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* JSON Export Option */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Export to JSON
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" paragraph>
              Export your localization data as a JSON file.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <DataObjectIcon />
                </ListItemIcon>
                <ListItemText primary="Structured JSON format" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary="All languages included" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FormatListBulletedIcon />
                </ListItemIcon>
                <ListItemText primary="Key-value organization" />
              </ListItem>
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={loading.json ? <CircularProgress size={24} color="inherit" /> : <FileDownloadIcon />}
                onClick={handleExportToJson}
                disabled={loading.json}
              >
                {loading.json ? 'Exporting...' : 'Export'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* CSV Export Option */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Export to CSV
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" paragraph>
              Export your localization data as a CSV spreadsheet.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <TableChartIcon />
                </ListItemIcon>
                <ListItemText primary="Tabular format" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary="All languages included" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary="Excel/Google Sheets compatible" />
              </ListItem>
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={loading.csv ? <CircularProgress size={24} color="inherit" /> : <FileDownloadIcon />}
                onClick={handleExportToCsv}
                disabled={loading.csv}
              >
                {loading.csv ? 'Exporting...' : 'Export'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExportOptions; 