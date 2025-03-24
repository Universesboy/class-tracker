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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import { getAllStudents, addPurchase, getStudentWithClasses } from '../services/studentService';
import { Student } from '../types';

const RecordPurchase: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    classesPurchased: 10,
    purchaseDate: new Date(),
    notes: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const allStudents = await getAllStudents();
      setStudents(allStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({
      ...formData,
      studentId: e.target.value
    });
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData({
        ...formData,
        purchaseDate: date
      });
    }
  };

  const handleClassesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    
    if (!isNaN(value) && value > 0) {
      setFormData({
        ...formData,
        classesPurchased: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId) {
      setError('Please select a student');
      return;
    }
    
    if (formData.classesPurchased <= 0) {
      setError('Number of classes must be greater than 0');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const purchaseData = {
        studentId: formData.studentId,
        classesPurchased: formData.classesPurchased,
        purchaseDate: formData.purchaseDate,
        notes: formData.notes
      };
      
      await addPurchase(purchaseData);
      
      // Get updated student data to show in success message
      const updatedStudent = await getStudentWithClasses(formData.studentId);
      const studentName = students.find(s => s.id === formData.studentId)?.name || 'Student';
      
      setSuccess(`Purchase recorded successfully! ${studentName} now has ${updatedStudent?.remainingClasses || 0} classes remaining.`);
      
      // Reset form or navigate
      setTimeout(() => {
        navigate('/students');
      }, 2000);
      
    } catch (err) {
      console.error('Error recording purchase:', err);
      setError('Failed to record purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  return (
    <PageContainer title="Record Class Purchase">
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Purchase Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth disabled={studentsLoading}>
                <InputLabel id="student-select-label">Student</InputLabel>
                <Select
                  labelId="student-select-label"
                  id="student-select"
                  value={formData.studentId}
                  label="Student"
                  onChange={handleSelectChange}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select a student
                  </MenuItem>
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name}
                    </MenuItem>
                  ))}
                </Select>
                {studentsLoading && (
                  <FormHelperText>Loading students...</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Number of Classes"
                name="classesPurchased"
                type="number"
                value={formData.classesPurchased}
                onChange={handleClassesChange}
                variant="outlined"
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
            
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
                  disabled={loading || studentsLoading}
                >
                  {loading ? 'Recording...' : 'Record Purchase'}
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

export default RecordPurchase; 