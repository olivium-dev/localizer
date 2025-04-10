import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Button, Dialog, TextField,
  FormControlLabel, Switch, Chip, TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { languageApi } from '../api/api';

const LanguageManagement = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState({ code: '', name: '', isDefault: false });
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const response = await languageApi.getAll();
      setLanguages(response.data);
    } catch (error) {
      console.error('Error fetching languages:', error);
      setError('Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleCreateClick = () => {
    setCurrentLanguage({ code: '', name: '', isDefault: false });
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleEditClick = (language) => {
    setCurrentLanguage(language);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDeleteClick = (languageId) => {
    setConfirmDelete(languageId);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setCurrentLanguage({
      ...currentLanguage,
      [name]: name === 'isDefault' ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      if (!currentLanguage.code || !currentLanguage.name) {
        setError('Language code and name are required');
        return;
      }

      if (editMode) {
        await languageApi.update(currentLanguage.id, currentLanguage);
      } else {
        await languageApi.create(currentLanguage);
      }

      setOpenDialog(false);
      await fetchLanguages();
    } catch (error) {
      console.error('Error saving language:', error);
      setError(error.response?.data?.message || 'Failed to save language');
    }
  };

  const handleDelete = async (languageId) => {
    try {
      await languageApi.delete(languageId);
      setConfirmDelete(null);
      await fetchLanguages();
    } catch (error) {
      console.error('Error deleting language:', error);
      setError(error.response?.data?.message || 'Failed to delete language');
    }
  };

  // Paginate
  const paginatedLanguages = languages.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Language Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateClick}
        >
          Add New Language
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLanguages.length > 0 ? (
              paginatedLanguages.map((language) => (
                <TableRow key={language.id}>
                  <TableCell>{language.code}</TableCell>
                  <TableCell>{language.name}</TableCell>
                  <TableCell>
                    {language.isDefault && (
                      <Chip label="Default" color="primary" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEditClick(language)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(language.id)}
                      disabled={language.isDefault}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {loading ? 'Loading languages...' : 'No languages found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={languages.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <Box sx={{ p: 3, width: '400px' }}>
          <Typography variant="h6" gutterBottom>
            {editMode ? 'Edit Language' : 'Add New Language'}
          </Typography>

          <TextField
            fullWidth
            label="Language Code"
            name="code"
            value={currentLanguage.code}
            onChange={handleInputChange}
            margin="normal"
            required
            helperText="ISO code (e.g., en, fr, es)"
          />

          <TextField
            fullWidth
            label="Language Name"
            name="name"
            value={currentLanguage.name}
            onChange={handleInputChange}
            margin="normal"
            required
            helperText="Full language name (e.g., English, French, Spanish)"
          />

          <FormControlLabel
            control={
              <Switch
                checked={currentLanguage.isDefault}
                onChange={handleInputChange}
                name="isDefault"
              />
            }
            label="Set as default language"
            sx={{ mt: 2, mb: 2 }}
          />

          {currentLanguage.isDefault && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Only one language can be set as default. This will update existing default language.
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Confirm Delete
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Are you sure you want to delete this language? This will remove all translations for this language.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDelete(confirmDelete)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default LanguageManagement; 