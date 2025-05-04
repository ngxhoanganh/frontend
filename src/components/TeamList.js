import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, InputAdornment, IconButton } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

function TeamList() {
  const { role, token } = useAuth();
  const [teams, setTeams] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', manager: '', salesReps: '' });
  const [editTeam, setEditTeam] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://your-backend-api/teams', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    if (role === 'admin') fetchTeams();
  }, [role, token]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Sales Team', width: 150 },
    { field: 'manager', headerName: 'Manager', width: 150 },
    { field: 'salesReps', headerName: 'Sales Reps', width: 200 },
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

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCreateTeam = async () => {
    try {
      const response = await fetch('http://your-backend-api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTeam.name,
          manager: newTeam.manager,
          members: newTeam.salesReps.split(',').map(rep => rep.trim()),
        }),
      });

      if (response.ok) {
        const addedTeam = await response.json();
        setTeams([...teams, addedTeam]);
        setOpenAdd(false);
        setNewTeam({ name: '', manager: '', salesReps: '' });
      } else {
        alert('Failed to create team.');
      }
    } catch (error) {
      alert('An error occurred while creating the team.');
    }
  };

  const handleEdit = (team) => {
    setEditTeam(team);
    setNewTeam({ name: team.name, manager: team.manager, salesReps: team.salesReps.join(', ') });
    setOpenEdit(true);
  };

  const handleUpdateTeam = async () => {
    try {
      const response = await fetch(`http://your-backend-api/teams/${editTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTeam.name,
          manager: newTeam.manager,
          members: newTeam.salesReps.split(',').map(rep => rep.trim()),
        }),
      });

      if (response.ok) {
        setTeams(
          teams.map((team) =>
            team.id === editTeam.id
              ? { ...team, ...newTeam, salesReps: newTeam.salesReps.split(',').map(rep => rep.trim()) }
              : team
          )
        );
        setOpenEdit(false);
        setNewTeam({ name: '', manager: '', salesReps: '' });
        setEditTeam(null);
      } else {
        alert('Failed to update team.');
      }
    } catch (error) {
      alert('An error occurred while updating the team.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sales team?')) {
      try {
        const response = await fetch(`http://your-backend-api/teams/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setTeams(teams.filter((team) => team.id !== id));
        } else {
          alert('Failed to delete team.');
        }
      } catch (error) {
        alert('An error occurred while deleting the team.');
      }
    }
  };

  if (role !== 'admin') return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5">Sales Team List</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Search Sales Teams"
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
          <Button variant="contained" onClick={() => setOpenAdd(true)}>
            Create Sales Team
          </Button>
        </Box>
      </Box>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredTeams}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      </div>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Create New Sales Team</DialogTitle>
        <DialogContent>
          <TextField
            label="Sales Team Name"
            fullWidth
            margin="normal"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            required
          />
          <TextField
            label="Manager"
            fullWidth
            margin="normal"
            value={newTeam.manager}
            onChange={(e) => setNewTeam({ ...newTeam, manager: e.target.value })}
            required
          />
          <TextField
            label="Sales Reps (comma-separated)"
            fullWidth
            margin="normal"
            value={newTeam.salesReps}
            onChange={(e) => setNewTeam({ ...newTeam, salesReps: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Sales Team</DialogTitle>
        <DialogContent>
          <TextField
            label="Sales Team Name"
            fullWidth
            margin="normal"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            required
          />
          <TextField
            label="Manager"
            fullWidth
            margin="normal"
            value={newTeam.manager}
            onChange={(e) => setNewTeam({ ...newTeam, manager: e.target.value })}
            required
          />
          <TextField
            label="Sales Reps (comma-separated)"
            fullWidth
            margin="normal"
            value={newTeam.salesReps}
            onChange={(e) => setNewTeam({ ...newTeam, salesReps: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateTeam} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeamList;