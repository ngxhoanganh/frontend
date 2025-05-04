import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, InputAdornment, IconButton } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

function ProductList() {
  const { role, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', class: '', quantity: '', price: '' });
  const [editProduct, setEditProduct] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://your-backend-api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [token]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Product Name', width: 200 },
    { field: 'class', headerName: 'Product Class', width: 150 },
    { field: 'quantity', headerName: 'Stock Quantity', width: 110 },
    {
      field: 'price',
      headerName: 'Price',
      width: 110,
      valueFormatter: ({ value }) => (value != null && !isNaN(value) ? Number(value).toLocaleString() : 'N/A'),
    },
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.class.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddProduct = async () => {
    const price = newProduct.price ? Number(newProduct.price) : 0;
    const quantity = newProduct.quantity ? Number(newProduct.quantity) : 0;

    try {
      const response = await fetch('http://your-backend-api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newProduct, price, quantity }),
      });

      if (response.ok) {
        const addedProduct = await response.json();
        setProducts([...products, addedProduct]);
        setOpenAdd(false);
        setNewProduct({ name: '', class: '', quantity: '', price: '' });
      } else {
        alert('Failed to add product.');
      }
    } catch (error) {
      alert('An error occurred while adding the product.');
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setNewProduct({ name: product.name, class: product.class, quantity: product.quantity, price: product.price });
    setOpenEdit(true);
  };

  const handleUpdateProduct = async () => {
    const price = newProduct.price ? Number(newProduct.price) : 0;
    const quantity = newProduct.quantity ? Number(newProduct.quantity) : 0;

    try {
      const response = await fetch(`http://your-backend-api/products/${editProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newProduct, price, quantity }),
      });

      if (response.ok) {
        setProducts(
          products.map((product) =>
            product.id === editProduct.id
              ? { ...product, ...newProduct, price, quantity }
              : product
          )
        );
        setOpenEdit(false);
        setNewProduct({ name: '', class: '', quantity: '', price: '' });
        setEditProduct(null);
      } else {
        alert('Failed to update product.');
      }
    } catch (error) {
      alert('An error occurred while updating the product.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://your-backend-api/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setProducts(products.filter((product) => product.id !== id));
        } else {
          alert('Failed to delete product.');
        }
      } catch (error) {
        alert('An error occurred while deleting the product.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5">Product List</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Search Products"
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
              Add Product
            </Button>
          )}
        </Box>
      </Box>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredProducts}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      </div>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />
          <TextField
            label="Product Class"
            fullWidth
            margin="normal"
            value={newProduct.class}
            onChange={(e) => setNewProduct({ ...newProduct, class: e.target.value })}
            required
          />
          <TextField
            label="Stock Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.quantity}
            onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAddProduct} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />
          <TextField
            label="Product Class"
            fullWidth
            margin="normal"
            value={newProduct.class}
            onChange={(e) => setNewProduct({ ...newProduct, class: e.target.value })}
            required
          />
          <TextField
            label="Stock Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.quantity}
            onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateProduct} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductList;