import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, InputAdornment, IconButton } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

function DistributorList() {
  const { role, token } = useAuth();
  const [distributors, setDistributors] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newDistributor, setNewDistributor] = useState({ name: '', city: '', country: '', latitude: '', longitude: '' });
  const [editDistributor, setEditDistributor] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await fetch('http://your-backend-api/distributors', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setDistributors(data);
      } catch (error) {
        console.error('Error fetching distributors:', error);
      }
    };
    fetchDistributors();
  }, [token]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Distributor Name', width: 200 },
    { field: 'city', headerName: 'City', width: 150 },
    { field: 'country', headerName: 'Country', width: 150 },
    { field: 'latitude', headerName: 'Latitude', width: 120 },
    { field: 'longitude', headerName: 'Longitude', width: 120 },
    role === 'admin' && {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ].filter(Boolean);

  const filteredDistributors = distributors.filter(distributor =>
    distributor.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddDistributor = async () => {
    const latitude = newDistributor.latitude ? Number(newDistributor.latitude) : 0;
    const longitude = newDistributor.longitude ? Number(newDistributor.longitude) : 0;

    try {
      const response = await fetch('http://your-backend-api/distributors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newDistributor, latitude, longitude }),
      });

      if (response.ok) {
        const addedDistributor = await response.json();
        setDistributors([...distributors, addedDistributor]);
        setOpenAdd(false);
        setNewDistributor({ name: '', city: '', country: '', latitude: '', longitude: '' });
      } else {
        alert('Failed to add distributor.');
      }
    } catch (error) {
      alert('An error occurred while adding the distributor.');
    }
  };

  const handleEdit = (distributor) => {
    setEditDistributor(distributor);
    setNewDistributor({
      name: distributor.name,
      city: distributor.city,
      country: distributor.country,
      latitude: distributor.latitude,
      longitude: distributor.longitude,
    });
    setOpenEdit(true);
  };

  const handleUpdateDistributor = async () => {
    const latitude = newDistributor.latitude ? Number(newDistributor.latitude) : 0;
    const longitude = newDistributor.longitude ? Number(newDistributor.longitude) : 0;

    try {
      const response = await fetch(`http://your-backend-api/distributors/${editDistributor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newDistributor, latitude, longitude }),
      });

      if (response.ok) {
        setDistributors(
          distributors.map((dist) =>
            dist.id === editDistributor.id
              ? { ...dist, ...newDistributor, latitude, longitude }
              : dist
          )
        );
        setOpenEdit(false);
        setNewDistributor({ name: '', city: '', country: '', latitude: '', longitude: '' });
        setEditDistributor(null);
      } else {
        alert('Failed to update distributor.');
      }
    } catch (error) {
      alert('An error occurred while updating the distributor.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this distributor?')) {
      try {
        const response = await fetch(`http://your-backend-api/distributors/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setDistributors(distributors.filter((dist) => dist.id !== id));
        } else {
          alert('Failed to delete distributor.');
        }
      } catch (error) {
        alert('An error occurred while deleting the distributor.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5">Distributor List</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Search Distributors"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton><SearchIcon /></IconButton>
                </InputAdornment>
              ),
            }}
            size="small"
          />
          {role === 'admin' && (
            <Button variant="contained" onClick={() => setOpenAdd(true)}>
              Add Distributor
            </Button>
          )}
        </Box>
      </Box>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredDistributors}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      </div>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add New Distributor</DialogTitle>
        <DialogContent>
          <TextField
            label="Distributor Name"
            fullWidth
            margin="normal"
            value={newDistributor.name}
            onChange={(e) => setNewDistributor({ ...newDistributor, name: e.target.value })}
            required
          />
          <TextField
            label="City"
            fullWidth
            margin="normal"
            value={newDistributor.city}
            onChange={(e) => setNewDistributor({ ...newDistributor, city: e.target.value })}
            required
          />
          <TextField
            label="Country"
            fullWidth
            margin="normal"
            value={newDistributor.country}
            onChange={(e) => setNewDistributor({ ...newDistributor, country: e.target.value })}
            required
          />
          <TextField
            label="Latitude"
            type="number"
            fullWidth
            margin="normal"
            value={newDistributor.latitude}
            onChange={(e) => setNewDistributor({ ...newDistributor, latitude: e.target.value })}
            required
          />
          <TextField
            label="Longitude"
            type="number"
            fullWidth
            margin="normal"
            value={newDistributor.longitude}
            onChange={(e) => setNewDistributor({ ...newDistributor, longitude: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAddDistributor} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Distributor</DialogTitle>
        <DialogContent>
          <TextField
            label="Distributor Name"
            fullWidth
            margin="normal"
            value={newDistributor.name}
            onChange={(e) => setNewDistributor({ ...newDistributor, name: e.target.value })}
            required
          />
          <TextField
            label="City"
            fullWidth
            margin="normal"
            value={newDistributor.city}
            onChange={(e) => setNewDistributor({ ...newDistributor, city: e.target.value })}
            required
          />
          <TextField
            label="Country"
            fullWidth
            margin="normal"
            value={newDistributor.country}
            onChange={(e) => setNewDistributor({ ...newDistributor, country: e.target.value })}
            required
          />
          <TextField
            label="Latitude"
            type="number"
            fullWidth
            margin="normal"
            value={newDistributor.latitude}
            onChange={(e) => setNewDistributor({ ...newDistributor, latitude: e.target.value })}
            required
          />
          <TextField
            label="Longitude"
            type="number"
            fullWidth
            margin="normal"
            value={newDistributor.longitude}
            onChange={(e) => setNewDistributor({ ...newDistributor, longitude: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateDistributor} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DistributorList;