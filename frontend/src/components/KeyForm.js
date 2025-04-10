import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Card, CardContent, 
  Divider, Grid, IconButton, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LanguageSelector from './LanguageSelector';
import { keyApi, languageApi } from '../api/api';

const KeyForm = ({ keyId = null, onSave, onCancel }) => {
  const [key, setKey] = useState({
    name: '',
    description: '',
    stringValues: []
  });
  const [languages, setLanguages] = useState([]);
  const [defaultLanguageId, setDefaultLanguageId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch languages and optionally the key data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get languages
        const languagesResponse = await languageApi.getAll();
        setLanguages(languagesResponse.data);
        
        // Set default language
        const defaultLang = languagesResponse.data.find(lang => lang.isDefault);
        if (defaultLang) {
          setDefaultLanguageId(defaultLang.id);
        }
        
        // If editing existing key, get its data
        if (keyId) {
          const keyResponse = await keyApi.getById(keyId);
          const keyData = keyResponse.data;
          
          // Transform data for the form
          const stringValues = keyData.StringValues?.map(sv => ({
            languageId: sv.languageId,
            value: sv.value
          })) || [];
          
          setKey({
            name: keyData.name,
            description: keyData.description || '',
            stringValues
          });
        } else {
          // For new key, add a default empty field for the default language
          if (defaultLang) {
            setKey(prev => ({
              ...prev,
              stringValues: [{
                languageId: defaultLang.id,
                value: ''
              }]
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [keyId]);
  
  // Add a new string value field
  const addStringValue = () => {
    setKey(prev => ({
      ...prev,
      stringValues: [...prev.stringValues, { languageId: '', value: '' }]
    }));
  };
  
  // Remove a string value field
  const removeStringValue = (index) => {
    setKey(prev => {
      const updatedValues = [...prev.stringValues];
      updatedValues.splice(index, 1);
      return { ...prev, stringValues: updatedValues };
    });
  };
  
  // Update a string value field
  const updateStringValue = (index, field, value) => {
    setKey(prev => {
      const updatedValues = [...prev.stringValues];
      updatedValues[index] = { ...updatedValues[index], [field]: value };
      return { ...prev, stringValues: updatedValues };
    });
  };
  
  // Check if default language has a value
  const isDefaultLanguageValueSet = () => {
    return key.stringValues.some(sv => 
      sv.languageId === defaultLanguageId && sv.value.trim() !== ''
    );
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!key.name.trim()) {
      setError('Key name is required');
      return;
    }
    
    if (!isDefaultLanguageValueSet()) {
      setError('A value for the default language is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Filter out empty string values
      const validStringValues = key.stringValues.filter(
        sv => sv.languageId && sv.value.trim() !== ''
      );
      
      const keyData = {
        name: key.name.trim(),
        description: key.description.trim(),
        stringValues: validStringValues
      };
      
      let response;
      if (keyId) {
        response = await keyApi.update(keyId, keyData);
      } else {
        response = await keyApi.create(keyData);
      }
      
      if (onSave) {
        onSave(response.data);
      }
    } catch (error) {
      console.error('Error saving key:', error);
      setError(error.response?.data?.message || 'Failed to save key');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !key.name) {
    return <Typography>Loading...</Typography>;
  }
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {keyId ? 'Edit Key' : 'Add New Key'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Typography 
              color="error" 
              sx={{ 
                mb: 2, 
                p: 1, 
                bgcolor: '#ffebee', 
                borderRadius: 1,
                fontWeight: 'bold',
                border: '1px solid #f44336'
              }}
              data-testid="error-message"
            >
              {error}
            </Typography>
          )}
          
          <TextField
            fullWidth
            label="Key Name"
            value={key.name}
            onChange={(e) => setKey({ ...key, name: e.target.value })}
            margin="normal"
            required
            data-testid="key-name-input"
          />
          
          <TextField
            fullWidth
            label="Description (Optional)"
            value={key.description}
            onChange={(e) => setKey({ ...key, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
            data-testid="key-description-input"
          />
          
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            String Values
          </Typography>
          
          {key.stringValues.map((stringValue, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <LanguageSelector
                    selectedLanguage={stringValue.languageId}
                    onChange={(value) => updateStringValue(index, 'languageId', value)}
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextField
                    fullWidth
                    label="Translation"
                    value={stringValue.value}
                    onChange={(e) => updateStringValue(index, 'value', e.target.value)}
                    required={stringValue.languageId === defaultLanguageId}
                    data-testid={`translation-input-${index}`}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton 
                    color="error" 
                    onClick={() => removeStringValue(index)}
                    disabled={
                      stringValue.languageId === defaultLanguageId && 
                      key.stringValues.filter(sv => sv.languageId === defaultLanguageId).length === 1
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
          
          <Button 
            startIcon={<AddIcon />} 
            onClick={addStringValue}
            sx={{ mb: 3 }}
          >
            Add Translation
          </Button>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              variant="contained"
              color="primary"
              disabled={loading}
              data-testid="save-key-button"
            >
              {loading ? 'Saving...' : keyId ? 'Update Key' : 'Create Key'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KeyForm; 