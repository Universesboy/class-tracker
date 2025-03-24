import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  Snackbar,
  Alert,
  Typography,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import { addStudent } from '../services/studentService';

interface FormData {
  name: string;
  email: string;
  phone: string;
  notificationEmail: string;
  useEmailForNotifications: boolean;
}

const AddStudent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    notificationEmail: '',
    useEmailForNotifications: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    
    if (name === 'useEmailForNotifications') {
      setFormData({
        ...formData,
        useEmailForNotifications: checked,
        notificationEmail: checked ? formData.email : formData.notificationEmail
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
        ...(name === 'email' && formData.useEmailForNotifications 
          ? { notificationEmail: value } 
          : {})
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Student name is required');
      return;
    }
    
    if (formData.useEmailForNotifications && !formData.email) {
      setError('Email is required when using it for notifications');
      return;
    }
    
    if (!formData.useEmailForNotifications && !formData.notificationEmail) {
      setError('Notification email is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create a base student object
      const studentData: {
        name: string;
        notificationEmail: string;
        email?: string;
        phone?: string;
      } = {
        name: formData.name,
        notificationEmail: formData.useEmailForNotifications ? formData.email : formData.notificationEmail
      };
      
      // Only add email and phone if they have values
      if (formData.email) {
        studentData.email = formData.email;
      }
      
      if (formData.phone) {
        studentData.phone = formData.phone;
      }
      
      const studentId = await addStudent(studentData);
      setSuccess(`Student "${formData.name}" added successfully!`);
      
      // Reset form or navigate to students list
      setTimeout(() => {
        navigate('/students');
      }, 2000);
      
    } catch (err) {
      console.error('Error adding student:', err);
      setError('Failed to add student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  return (
    <PageContainer title="Add New Student">
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Student Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Student Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.useEmailForNotifications}
                    onChange={handleInputChange}
                    name="useEmailForNotifications"
                  />
                }
                label="Use the same email for notifications"
              />
            </Grid>
            
            {!formData.useEmailForNotifications && (
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Notification Email"
                  name="notificationEmail"
                  type="email"
                  value={formData.notificationEmail}
                  onChange={handleInputChange}
                  variant="outlined"
                  helperText="Email to send reminders about remaining classes"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/students')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Student'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default AddStudent; 