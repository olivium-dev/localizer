import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography, Chip } from '@mui/material';
import { languageApi } from '../api/api';

const LanguageSelector = ({ selectedLanguage, onChange, label = "Language" }) => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const response = await languageApi.getAll();
        setLanguages(response.data);
      } catch (error) {
        console.error('Failed to fetch languages:', error);
        setError('Failed to load languages');
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  if (loading) return <Typography>Loading languages...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!languages.length) return <Typography>No languages available</Typography>;

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="language-select-label">{label}</InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={selectedLanguage || ''}
          label={label}
          onChange={(e) => onChange(e.target.value)}
        >
          {languages.map((language) => (
            <MenuItem key={language.id} value={language.id}>
              {language.name} ({language.code})
              {language.isDefault && (
                <Chip 
                  label="Default" 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }} 
                />
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector; 