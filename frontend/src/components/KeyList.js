import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Button, Dialog, Chip, TextField,
  InputAdornment, TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { keyApi } from '../api/api';
import KeyForm from './KeyForm';

const KeyList = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentKeyId, setCurrentKeyId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all keys
  const fetchKeys = async () => {
    try {
      setLoading(true);
      const response = await keyApi.getAll();
      setKeys(response.data);
    } catch (error) {
      console.error('Error fetching keys:', error);
      setError('Failed to load keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  // Open edit dialog
  const handleEdit = (keyId) => {
    setCurrentKeyId(keyId);
    setOpenDialog(true);
  };

  // Open create dialog
  const handleCreate = () => {
    setCurrentKeyId(null);
    setOpenDialog(true);
  };

  // Handle save (create/update)
  const handleSave = async () => {
    setOpenDialog(false);
    await fetchKeys();
  };

  // Handle delete
  const handleDelete = async (keyId) => {
    try {
      await keyApi.delete(keyId);
      await fetchKeys();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting key:', error);
      setError('Failed to delete key');
    }
  };

  // Filter keys based on search term
  const filteredKeys = keys.filter(key => 
    key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate
  const paginatedKeys = filteredKeys.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && keys.length === 0) {
    return <Typography>Loading keys...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Localization Keys</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleCreate}
          data-testid="add-key-button"
        >
          Add New Key
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <TextField
        fullWidth
        placeholder="Search keys..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        data-testid="search-input"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Languages</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedKeys.length > 0 ? (
              paginatedKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell component="th" scope="row">
                    {key.name}
                  </TableCell>
                  <TableCell>{key.description || '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {key.StringValues?.map((sv) => (
                        <Chip 
                          key={sv.id} 
                          label={sv.Language?.code} 
                          size="small"
                          color={sv.Language?.isDefault ? "primary" : "default"}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEdit(key.id)} 
                      aria-label="edit"
                      data-testid={`edit-key-${key.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => setConfirmDelete(key.id)} 
                      aria-label="delete"
                      data-testid={`delete-key-${key.id}`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {searchTerm ? 'No keys match your search' : 'No keys found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredKeys.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      {/* Edit/Create Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <KeyForm 
          keyId={currentKeyId} 
          onSave={handleSave}
          onCancel={() => setOpenDialog(false)}
        />
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
            Are you sure you want to delete this key? This action cannot be undone.
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

export default KeyList; 