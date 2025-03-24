import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Tab,
  Tabs,
  Paper
} from '@mui/material';
import { 
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import PageContainer from '../components/common/PageContainer';
import { getAllStudentsWithClasses, recordAttendance, getStudentWithClasses } from '../services/studentService';
import { checkAndSendReminderIfNeeded } from '../services/notificationService';
import { StudentWithClasses } from '../types';
import AttendanceHistory from '../components/AttendanceHistory';
import { Link } from 'react-router-dom';

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
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
      style={{ paddingTop: '16px' }}
    >
      {value === index && (
        <Box>{children}</Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `attendance-tab-${index}`,
    'aria-controls': `attendance-tabpanel-${index}`,
  };
};

const Attendance: React.FC = () => {
  const [students, setStudents] = useState<StudentWithClasses[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithClasses[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithClasses | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Added state for class details
  const [className, setClassName] = useState('');
  const [location, setLocation] = useState('');
  const [coach, setCoach] = useState('');
  const [notes, setNotes] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(student => 
          student.name.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const allStudents = await getAllStudentsWithClasses();
      setStudents(allStudents);
      setFilteredStudents(allStudents);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = (student: StudentWithClasses) => {
    setSelectedStudent(student);
    if (student.remainingClasses <= 0) {
      setError('This student has no remaining classes');
    } else {
      setClassName('');
      setLocation('');
      setCoach('');
      setNotes('');
      setEndTime('');
      setOpenDialog(true);
    }
  };

  const handleConfirmAttendance = async () => {
    if (!selectedStudent) return;
    
    try {
      const remainingClassesBefore = selectedStudent.remainingClasses;
      const now = new Date();
      
      // Calculate end time if provided
      let timeOut = null;
      if (endTime) {
        const [hours, minutes] = endTime.split(':').map(num => parseInt(num, 10));
        if (!isNaN(hours) && !isNaN(minutes)) {
          timeOut = new Date(now);
          timeOut.setHours(hours, minutes, 0, 0);
        }
      }
      
      // Record attendance with all the detailed information
      await recordAttendance({
        studentId: selectedStudent.id,
        attendanceDate: now,
        timeIn: now,
        timeOut: timeOut,
        className: className || undefined,
        location: location || undefined,
        coach: coach || undefined,
        notes: notes || undefined
      });
      
      // Fetch updated student data
      const updatedStudent = await getStudentWithClasses(selectedStudent.id);
      
      if (updatedStudent) {
        // Check if we need to send a reminder email
        await checkAndSendReminderIfNeeded(
          selectedStudent.id,
          remainingClassesBefore,
          updatedStudent.remainingClasses
        );
        
        // Update local state
        setStudents(prev => 
          prev.map(s => s.id === updatedStudent.id ? updatedStudent : s)
        );
        
        // Show success message with class information
        let message = `Attendance recorded for ${selectedStudent.name} at ${format(now, 'h:mm a')}`;
        
        if (endTime) {
          const [hours, minutes] = endTime.split(':');
          message += ` - ${hours}:${minutes} ${parseInt(hours) >= 12 ? 'PM' : 'AM'}`;
        }
        
        if (className) {
          message += ` - ${className}`;
        }
        
        message += `. ${updatedStudent.remainingClasses} class(es) remaining.`;
        
        setSuccessMessage(message);
      }
    } catch (err) {
      console.error('Error recording attendance:', err);
      setError('Failed to record attendance. Please try again.');
    }
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setError('');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <PageContainer 
      title="Student Attendance"
      subtitle="Record attendance and view attendance history"
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="attendance tabs"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 3,
              py: 2
            },
            '& .Mui-selected': {
              fontWeight: 'bold',
            }
          }}
        >
          <Tab 
            icon={<CalendarIcon sx={{ mr: 1 }} />} 
            iconPosition="start" 
            label="Take Attendance" 
            {...a11yProps(0)} 
          />
          <Tab 
            icon={<HistoryIcon sx={{ mr: 1 }} />} 
            iconPosition="start" 
            label="Attendance History" 
            {...a11yProps(1)} 
          />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Search Students"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  mt: { xs: 1, md: 0 }
                }}>
                  <CalendarIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Today: {format(new Date(), 'EEEE, MMMM do, yyyy')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
  
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredStudents.length === 0 ? (
            <Alert severity="info">No students found. Try a different search term.</Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredStudents.map((student) => (
                <Grid item xs={12} sm={6} md={4} key={student.id}>
                  <Card 
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'rgba(0, 0, 0, 0.05)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                        {student.name}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <Typography 
                          variant="h6" 
                          color={student.remainingClasses > 0 ? 'primary' : 'error'}
                          fontWeight={700}
                        >
                          {student.remainingClasses} Classes
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total: {student.totalAttended}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 1.5,
                        bgcolor: student.remainingClasses > 0 
                          ? 'rgba(67, 97, 238, 0.08)' 
                          : 'rgba(229, 56, 59, 0.08)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography 
                          variant="body2" 
                          color={student.remainingClasses > 0 ? 'primary.main' : 'error.main'}
                        >
                          {student.remainingClasses > 0 
                            ? `Available for classes` 
                            : `No classes remaining`}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        size="large" 
                        variant="contained" 
                        fullWidth
                        color={student.remainingClasses > 0 ? 'primary' : 'error'}
                        onClick={() => handleAttendance(student)}
                        disabled={student.remainingClasses <= 0}
                        sx={{ 
                          borderRadius: 2,
                          py: 1,
                          boxShadow: student.remainingClasses > 0 
                            ? '0 4px 10px rgba(67, 97, 238, 0.2)'
                            : 'none'
                        }}
                      >
                        {student.remainingClasses > 0 
                          ? 'Sign In for Class' 
                          : 'No Classes Left'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.05)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Recent Attendance Records
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View detailed records of all attendance with time and class information
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/students"
                variant="outlined"
                color="primary"
                startIcon={<HistoryIcon />}
                sx={{ borderRadius: 2 }}
              >
                Student Histories
              </Button>
            </Box>
            
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              For better organization, you can view individual student attendance histories from the Students page.
              Click on the history icon <HistoryIcon fontSize="small" sx={{ verticalAlign: 'middle' }} /> next to a student.
            </Alert>
            
            <AttendanceHistory showStudentName={true} />
          </Paper>
        </Box>
      </TabPanel>

      {/* Confirmation Dialog with Class Details */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Record Attendance
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Recording attendance for <strong>{selectedStudent?.name}</strong>. 
            They currently have <strong>{selectedStudent?.remainingClasses}</strong> class(es) remaining.
          </DialogContentText>
          
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Class Details (Optional)
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class Type"
                placeholder="e.g. Regular Training, Private Lesson"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                margin="normal"
                helperText="Enter the type of class"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                placeholder="e.g. Main Court, Court A"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                margin="normal"
                helperText="Where the class was held"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Coach"
                placeholder="e.g. Coach Smith"
                value={coach}
                onChange={(e) => setCoach(e.target.value)}
                margin="normal"
                helperText="Coach or instructor for this class"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Time (HH:MM)"
                placeholder="e.g. 15:30"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                margin="normal"
                helperText="24-hour format (e.g. 15:30 for 3:30 PM)"
                inputProps={{
                  pattern: "[0-9]{2}:[0-9]{2}"
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                placeholder="Any additional notes about this class..."
                multiline
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAttendance} 
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(67, 97, 238, 0.2)',
            }}
          >
            Confirm Attendance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error messages */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
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

export default Attendance; 