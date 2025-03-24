import React, { useState, useEffect } from 'react';
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
  Checkbox,
  CircularProgress,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon,
  History as HistoryIcon 
} from '@mui/icons-material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import { getStudent, updateStudent } from '../services/studentService';
import AttendanceHistory from '../components/AttendanceHistory';

interface FormData {
  name: string;
  email: string;
  phone: string;
  notificationEmail: string;
  useEmailForNotifications: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tab-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>{children}</Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `student-tab-${index}`,
    'aria-controls': `student-tabpanel-${index}`,
  };
};

const EditStudent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    notificationEmail: '',
    useEmailForNotifications: false
  });

  useEffect(() => {
    if (id) {
      fetchStudent(id);
    }
  }, [id]);

  const fetchStudent = async (studentId: string) => {
    try {
      setFetching(true);
      const student = await getStudent(studentId);
      
      if (!student) {
        setError('Student not found');
        return;
      }
      
      setFormData({
        name: student.name,
        email: student.email || '',
        phone: student.phone || '',
        notificationEmail: student.notificationEmail,
        useEmailForNotifications: student.email === student.notificationEmail
      });
    } catch (err) {
      console.error('Error fetching student:', err);
      setError('Failed to load student information. Please try again.');
    } finally {
      setFetching(false);
    }
  };

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
    
    if (!id) {
      setError('Student ID is missing');
      return;
    }
    
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
      
      await updateStudent(id, studentData);
      setSuccess(`Student "${formData.name}" updated successfully!`);
      
      // Navigate to students list after delay
      setTimeout(() => {
        navigate('/students');
      }, 2000);
      
    } catch (err) {
      console.error('Error updating student:', err);
      setError('Failed to update student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (fetching) {
    return (
      <PageContainer title="Edit Student">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Edit Student: ${formData.name}`}>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        aria-label="student tabs"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 2,
          '& .MuiTab-root': {
            minWidth: 120,
            fontWeight: 500
          },
          '& .Mui-selected': {
            fontWeight: 600
          }
        }}
      >
        <Tab 
          icon={<PersonIcon sx={{ mr: 1 }} />}
          iconPosition="start"
          label="Information" 
          {...a11yProps(0)} 
        />
        <Tab 
          icon={<HistoryIcon sx={{ mr: 1 }} />}
          iconPosition="start"
          label="Attendance History" 
          {...a11yProps(1)} 
        />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            maxWidth: 800, 
            mx: 'auto',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.05)'
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
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
                    color="inherit"
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                    sx={{ 
                      borderRadius: 2,
                      minWidth: 100,
                      boxShadow: '0 4px 10px rgba(67, 97, 238, 0.2)',
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            maxWidth: 1000, 
            mx: 'auto',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.05)'
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Attendance History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View detailed record of all classes attended by {formData.name}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<HistoryIcon />}
              component={Link}
              to={`/students/${id}/attendance`}
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 4px 10px rgba(67, 97, 238, 0.2)',
              }}
            >
              View Full History
            </Button>
          </Box>

          {id && <AttendanceHistory studentId={id} />}
        </Paper>
      </TabPanel>
      
      {/* Success/Error messages */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default EditStudent; 