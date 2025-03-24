import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Avatar,
  Tooltip,
  Badge,
  Card,
  Divider,
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  WarningAmber as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  FilterList as FilterIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import { getAllStudentsWithClasses, deleteStudent } from '../services/studentService';
import { StudentWithClasses } from '../types';

const Students: React.FC = () => {
  const [students, setStudents] = useState<StudentWithClasses[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithClasses[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentWithClasses | null>(null);
  const [deleting, setDeleting] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(student => 
          student.name.toLowerCase().includes(query) || 
          (student.email && student.email.toLowerCase().includes(query))
        )
      );
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const allStudents = await getAllStudentsWithClasses();
      setStudents(allStudents);
      setFilteredStudents(allStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (student: StudentWithClasses) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      setDeleting(true);
      await deleteStudent(studentToDelete.id);
      setSuccess(`Student "${studentToDelete.name}" has been deleted successfully.`);
      
      // Update the students list
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseAlert = () => {
    setSuccess('');
    setError('');
  };

  // Helper function to get status color and text
  const getClassStatus = (remainingClasses: number) => {
    if (remainingClasses <= 0) {
      return {
        color: theme.palette.error.main,
        text: 'No classes',
        icon: <ErrorIcon fontSize="small" />,
        chipColor: 'error'
      };
    } else if (remainingClasses <= 2) {
      return {
        color: theme.palette.warning.main,
        text: 'Low',
        icon: <WarningIcon fontSize="small" />,
        chipColor: 'warning'
      };
    } else {
      return {
        color: theme.palette.success.main,
        text: 'Good',
        icon: <CheckCircleIcon fontSize="small" />,
        chipColor: 'success'
      };
    }
  };

  return (
    <PageContainer 
      title="Student Management"
      subtitle="View, edit and delete student information"
    >
      <Card 
        sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.05)',
          overflow: 'visible'
        }}
      >
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2
        }}>
          <TextField
            placeholder="Search by name or email..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            size="medium"
            sx={{ 
              maxWidth: { sm: 400 },
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: '1px',
                },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            component={Link} 
            to="/students/add" 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: 2.5,
              py: 1.2,
              fontWeight: 600,
              boxShadow: '0 4px 10px rgba(67, 97, 238, 0.2)',
              alignSelf: { xs: 'stretch', sm: 'auto' }
            }}
          >
            Add New Student
          </Button>
        </Box>
      </Card>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(229, 56, 59, 0.1)'
          }} 
          onClose={handleCloseAlert}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(6, 214, 160, 0.1)'
          }} 
          onClose={handleCloseAlert}
        >
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : filteredStudents.length === 0 ? (
        <Card
          sx={{ 
            p: 6, 
            borderRadius: 3, 
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'rgba(0, 0, 0, 0.01)'
          }}
        >
          <Box sx={{ 
            maxWidth: 400, 
            mx: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'
          }}>
            {searchQuery ? (
              <>
                <SearchIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>No Matching Students</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  No students match your search "{searchQuery}". Try a different search term or clear the search.
                </Typography>
                <Button 
                  onClick={() => setSearchQuery('')}
                  variant="outlined"
                  color="primary"
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <AddIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>No Students Found</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  You don't have any students yet. Start by adding a new student to your database.
                </Typography>
                <Button 
                  component={Link}
                  to="/students/add"
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                >
                  Add Your First Student
                </Button>
              </>
            )}
          </Box>
        </Card>
      ) : (
        <Card sx={{ 
          borderRadius: 3, 
          border: '1px solid', 
          borderColor: 'rgba(0, 0, 0, 0.05)', 
          boxShadow: 'none',
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, ml: 2 }}>
              {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                icon={<FilterIcon fontSize="small" />} 
                label="Filter" 
                variant="outlined" 
                sx={{ borderRadius: 2, mr: 1 }}
              />
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <Chip 
                color="primary" 
                variant="filled" 
                label="All" 
                sx={{ borderRadius: 2, fontWeight: 600 }}
              />
            </Box>
          </Box>
          <Divider />
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 3 }}><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Student</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Contact</Typography></TableCell>
                  <TableCell align="center"><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Class Status</Typography></TableCell>
                  <TableCell align="center"><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Classes Left</Typography></TableCell>
                  <TableCell align="center"><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Attended</Typography></TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => {
                  const status = getClassStatus(student.remainingClasses);
                  return (
                    <TableRow 
                      key={student.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { 
                          borderBottom: 0 
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(67, 97, 238, 0.04)',
                        },
                      }}
                    >
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ pl: 3 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              mr: 2,
                              bgcolor: theme.palette.primary.light,
                              color: theme.palette.primary.main,
                              fontWeight: 600
                            }}
                          >
                            {student.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {student.name}
                            </Typography>
                            {student.notificationEmail && (
                              <Typography variant="caption" color="text.secondary">
                                Notification: {student.notificationEmail}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {student.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <MailIcon fontSize="small" color="action" sx={{ mr: 1, fontSize: 16 }} />
                              <Typography variant="body2">{student.email}</Typography>
                            </Box>
                          )}
                          {student.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon fontSize="small" color="action" sx={{ mr: 1, fontSize: 16 }} />
                              <Typography variant="body2">{student.phone}</Typography>
                            </Box>
                          )}
                          {!student.email && !student.phone && (
                            <Typography variant="body2" color="text.secondary">No contact info</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={status.icon}
                          label={status.text}
                          color={status.chipColor as any}
                          size="small"
                          variant="filled"
                          sx={{ 
                            borderRadius: 1.5,
                            fontWeight: 600,
                            px: 0.5
                          }}
                        />
                      </TableCell>
                      <TableCell 
                        align="center"
                      >
                        <Typography 
                          variant="h6" 
                          fontWeight={700}
                          sx={{ color: status.color }}
                        >
                          {student.remainingClasses}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Badge 
                          badgeContent={student.totalAttended} 
                          color="primary"
                          max={999}
                          sx={{ 
                            '& .MuiBadge-badge': { 
                              fontSize: '0.75rem', 
                              height: 22, 
                              minWidth: 22,
                              borderRadius: 11,
                              fontWeight: 600
                            } 
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              width: 36, 
                              height: 36, 
                              bgcolor: 'rgba(67, 97, 238, 0.1)',
                              color: theme.palette.primary.main,
                              fontSize: '0.9rem',
                              fontWeight: 600
                            }}
                          >
                            {student.totalAttended}
                          </Avatar>
                        </Badge>
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <Tooltip title="View Attendance History">
                          <IconButton 
                            color="info" 
                            component={Link} 
                            to={`/students/${student.id}/attendance`}
                            size="small"
                            sx={{ 
                              mr: 1, 
                              bgcolor: 'rgba(3, 169, 244, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(3, 169, 244, 0.2)',
                              }
                            }}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Student">
                          <IconButton 
                            color="primary" 
                            component={Link} 
                            to={`/students/${student.id}`}
                            size="small"
                            sx={{ 
                              mr: 1, 
                              bgcolor: 'rgba(67, 97, 238, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(67, 97, 238, 0.2)',
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Student">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleOpenDeleteDialog(student)}
                            sx={{ 
                              bgcolor: 'rgba(229, 56, 59, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(229, 56, 59, 0.2)',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon color="error" sx={{ mr: 1 }} />
            Confirm Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete <strong>{studentToDelete?.name}</strong>? This action cannot be undone.
            {studentToDelete && studentToDelete.totalAttended > 0 && (
              <Box 
                component="span" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 158, 0, 0.1)',
                  color: 'warning.dark',
                  gap: 1
                }}
              >
                <WarningIcon fontSize="small" color="warning" />
                <Typography variant="body2" fontWeight={600}>
                  This student has {studentToDelete.totalAttended} attendance records that will also be deleted.
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDeleteDialog} 
            disabled={deleting}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteStudent} 
            color="error" 
            variant="contained"
            autoFocus 
            disabled={deleting}
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(229, 56, 59, 0.2)',
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Students; 