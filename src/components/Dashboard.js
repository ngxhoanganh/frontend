import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Toolbar, Grid, Paper, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Sidebar from './Sidebar';
import Header from './Header';
import ProductList from './ProductList';
import DistributorList from './DistributorList';
import TeamList from './TeamList';
import OrderList from './OrderList';
import UserManagement from './UserManagement';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const drawerWidth = 240;

const chartData = {
  labels: ['Oxymotroban Fexoforrmin', 'Amavirse', 'Paronim Atracustone'],
  datasets: [
    {
      label: 'Stock',
      data: [20, 7, 2],
      backgroundColor: '#2e7d32',
    },
  ],
};

function Dashboard() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)`, bgcolor: 'background.default' }}
      >
        <Header />
        <Toolbar />
        <Routes>
          <Route
            path="/"
            element={
              <Box>
                <Typography variant="h5" gutterBottom>
                  Overview
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">Total Products</Typography>
                      <Typography variant="h4" color="primary">3</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">Orders This Month</Typography>
                      <Typography variant="h4" color="primary">2</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">Distributors</Typography>
                      <Typography variant="h4" color="primary">1</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Product Stock Chart
                      </Typography>
                      <Bar
                        data={chartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: 'top' },
                            title: { display: true, text: 'Product Stock' },
                          },
                        }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            }
          />
          <Route path="/products" element={<ProductList />} />
          <Route path="/distributors" element={<DistributorList />} />
          <Route path="/teams" element={<TeamList />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default Dashboard;