import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

function OrderList() {
  const { role, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]); // Danh sách khách hàng để chọn
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newOrder, setNewOrder] = useState({
    product: '',
    distributor: '',
    quantity: '',
    customerId: '',
    status: 'Processing',
    createdAt: new Date(),
    newCustomer: { name: '', city: '', channel: '', sub_channel: '', country: '', latitude: '', longitude: '' },
  });
  const [editOrder, setEditOrder] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Lấy danh sách đơn hàng và khách hàng từ backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://your-backend-api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://your-backend-api/customers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchOrders();
    fetchCustomers();
  }, [token]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'product', headerName: 'Product', width: 150 },
    { field: 'distributor', headerName: 'Distributor', width: 150 },
    { field: 'quantity', headerName: 'Quantity', width: 110 },
    { field: 'customer', headerName: 'Customer', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'createdAt', headerName: 'Created At', width: 120 },
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

  const filteredOrders = orders.filter(order =>
    order.product.toLowerCase().includes(searchText.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCreateOrder = async () => {
    const orderData = {
      product: newOrder.product,
      distributor: newOrder.distributor,
      quantity: Number(newOrder.quantity),
      status: newOrder.status,
      createdAt: format(newOrder.createdAt, 'yyyy-MM-dd'),
    };

    if (newOrder.customerId) {
      orderData.customerId = newOrder.customerId;
    } else {
      orderData.newCustomer = newOrder.newCustomer;
    }

    try {
      const response = await fetch('http://your-backend-api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const addedOrder = await response.json();
        setOrders([...orders, addedOrder]);
        setOpenAdd(false);
        setNewOrder({
          product: '',
          distributor: '',
          quantity: '',
          customerId: '',
          status: 'Processing',
          createdAt: new Date(),
          newCustomer: { name: '', city: '', channel: '', sub_channel: '', country: '', latitude: '', longitude: '' },
        });
      } else {
        alert('Failed to create order.');
      }
    } catch (error) {
      alert('An error occurred while creating the order.');
    }
  };

  const handleEdit = (order) => {
    setEditOrder(order);
    setNewOrder({
      ...order,
      createdAt: new Date(order.createdAt),
      customerId: order.customerId || '',
    });
    setOpenEdit(true);
  };

  const handleUpdateOrder = async () => {
    const orderData = {
      product: newOrder.product,
      distributor: newOrder.distributor,
      quantity: Number(newOrder.quantity),
      status: newOrder.status,
      createdAt: format(newOrder.createdAt, 'yyyy-MM-dd'),
    };

    if (newOrder.customerId) {
      orderData.customerId = newOrder.customerId;
    } else {
      orderData.newCustomer = newOrder.newCustomer;
    }

    try {
      const response = await fetch(`http://your-backend-api/orders/${editOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setOrders(
          orders.map((ord) =>
            ord.id === editOrder.id
              ? { ...ord, ...orderData }
              : ord
          )
        );
        setOpenEdit(false);
        setNewOrder({
          product: '',
          distributor: '',
          quantity: '',
          customerId: '',
          status: 'Processing',
          createdAt: new Date(),
          newCustomer: { name: '', city: '', channel: '', sub_channel: '', country: '', latitude: '', longitude: '' },
        });
        setEditOrder(null);
      } else {
        alert('Failed to update order.');
      }
    } catch (error) {
      alert('An error occurred while updating the order.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await fetch(`http://your-backend-api/orders/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setOrders(orders.filter((order) => order.id !== id));
        } else {
          alert('Failed to delete order.');
        }
      } catch (error) {
        alert('An error occurred while deleting the order.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5">Order List</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Search Orders"
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
            Create Order
          </Button>
        </Box>
      </Box>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredOrders}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      </div>

      {/* Dialog Create Order */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={newOrder.product}
            onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
          />
          <TextField
            label="Distributor"
            fullWidth
            margin="normal"
            value={newOrder.distributor}
            onChange={(e) => setNewOrder({ ...newOrder, distributor: e.target.value })}
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={newOrder.quantity}
            onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Customer (if existing)</InputLabel>
            <Select
              value={newOrder.customerId}
              onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={newOrder.status}
              onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
            >
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Created At"
              value={newOrder.createdAt}
              onChange={(newValue) => setNewOrder({ ...newOrder, createdAt: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </LocalizationProvider>

          {!newOrder.customerId && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>New Customer Information</Typography>
              <TextField
                label="Customer Name"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.name}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, name: e.target.value } })}
              />
              <TextField
                label="City"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.city}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, city: e.target.value } })}
              />
              <TextField
                label="Channel"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.channel}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, channel: e.target.value } })}
              />
              <TextField
                label="Sub-channel"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.sub_channel}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, sub_channel: e.target.value } })}
              />
              <TextField
                label="Country"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.country}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, country: e.target.value } })}
              />
              <TextField
                label="Latitude"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.latitude}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, latitude: e.target.value } })}
              />
              <TextField
                label="Longitude"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.longitude}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, longitude: e.target.value } })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleCreateOrder} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Edit Order */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Order</DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={newOrder.product}
            onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
          />
          <TextField
            label="Distributor"
            fullWidth
            margin="normal"
            value={newOrder.distributor}
            onChange={(e) => setNewOrder({ ...newOrder, distributor: e.target.value })}
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={newOrder.quantity}
            onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Customer (if existing)</InputLabel>
            <Select
              value={newOrder.customerId}
              onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={newOrder.status}
              onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
            >
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Created At"
              value={newOrder.createdAt}
              onChange={(newValue) => setNewOrder({ ...newOrder, createdAt: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </LocalizationProvider>

          {!newOrder.customerId && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>New Customer Information</Typography>
              <TextField
                label="Customer Name"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.name}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, name: e.target.value } })}
              />
              <TextField
                label="City"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.city}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, city: e.target.value } })}
              />
              <TextField
                label="Channel"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.channel}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, channel: e.target.value } })}
              />
              <TextField
                label="Sub-channel"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.sub_channel}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, sub_channel: e.target.value } })}
              />
              <TextField
                label="Country"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.country}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, country: e.target.value } })}
              />
              <TextField
                label="Latitude"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.latitude}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, latitude: e.target.value } })}
              />
              <TextField
                label="Longitude"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.longitude}
                onChange={(e) => setNewOrder({ ...newOrder, newCustomer: { ...newOrder.newCustomer, longitude: e.target.value } })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateOrder} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OrderList;