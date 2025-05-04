import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function UserManagement() {
  const { role, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://your-backend-api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    if (role === 'admin') fetchUsers();
  }, [role, token]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'fullname', headerName: 'Full Name', width: 200 },
    { field: 'role', headerName: 'Role', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleEdit = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setOpenEdit(true);
  };

  const handleUpdateRole = async () => {
    try {
      const response = await fetch(`http://your-backend-api/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setUsers(users.map((user) =>
          user.id === selectedUser.id ? { ...user, role: newRole } : user
        ));
        setOpenEdit(false);
        setSelectedUser(null);
        setNewRole('');
      } else {
        alert('Failed to update role.');
      }
    } catch (error) {
      alert('An error occurred while updating the role.');
    }
  };

  if (role !== 'admin') return null;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      </div>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Editing role for: {selectedUser?.username}
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateRole} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;