import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Card,
  IconButton,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Grid,
  Snackbar
} from '@mui/material';
import { 
  AccessTime as TimeIcon, 
  Event as EventIcon, 
  Class as ClassIcon,
  LocationOn as LocationIcon, 
  Person as CoachIcon,
  Notes as NotesIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  ArrowRightAlt as ArrowRightAltIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format, parse } from 'date-fns';
import { Attendance, AttendanceWithStudentDetails } from '../types';
import { getAttendancesByStudent, getAllAttendancesWithStudentDetails, updateAttendance, deleteAttendance } from '../services/studentService';
import { useAuth } from '../contexts/AuthContext';

interface AttendanceHistoryProps {
  studentId?: string; // Optional: If provided, shows only this student's history
  limit?: number;     // Optional: Limit the number of records shown
  showStudentName?: boolean; // Whether to show student name column
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ 
  studentId, 
  limit,
  showStudentName = false
}) => {
  const [attendances, setAttendances] = useState<Attendance[] | AttendanceWithStudentDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | AttendanceWithStudentDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    className: '',
    location: '',
    coach: '',
    notes: '',
    timeIn: '',
    timeOut: '',
    attendanceDate: ''
  });
  const [saving, setSaving] = useState(false);
  const [dateChangeConfirmOpen, setDateChangeConfirmOpen] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState<Attendance | AttendanceWithStudentDetails | null>(null);
  const [deleting, setDeleting] = useState(false);
  const theme = useTheme();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAttendanceData();
  }, [studentId]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      let data;
      
      if (studentId) {
        // Fetch attendance for a specific student
        data = await getAttendancesByStudent(studentId);
      } else {
        // Fetch all attendance with student details
        data = await getAllAttendancesWithStudentDetails();
      }
      
      // Apply limit if specified
      if (limit && limit > 0) {
        data = data.slice(0, limit);
      }
      
      setAttendances(data);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (attendance: Attendance | AttendanceWithStudentDetails) => {
    setSelectedAttendance(attendance);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedAttendance(null);
  };

  const handleEditAttendance = (attendance: Attendance | AttendanceWithStudentDetails) => {
    setSelectedAttendance(attendance);
    setEditForm({
      className: attendance.className || '',
      location: attendance.location || '',
      coach: attendance.coach || '',
      notes: attendance.notes || '',
      timeIn: attendance.timeIn ? formatTime(attendance.timeIn) : formatTime(attendance.attendanceDate),
      timeOut: attendance.timeOut ? formatTime(attendance.timeOut) : '',
      attendanceDate: format(attendance.attendanceDate, 'yyyy-MM-dd')
    });
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedAttendance(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedAttendance) return;

    try {
      const updates: any = {};
      
      if (editForm.className !== (selectedAttendance.className || '')) {
        updates.className = editForm.className || null;
      }
      
      if (editForm.location !== (selectedAttendance.location || '')) {
        updates.location = editForm.location || null;
      }
      
      if (editForm.coach !== (selectedAttendance.coach || '')) {
        updates.coach = editForm.coach || null;
      }
      
      if (editForm.notes !== (selectedAttendance.notes || '')) {
        updates.notes = editForm.notes || null;
      }
      
      // Handle date change
      const originalDateStr = format(selectedAttendance.attendanceDate, 'yyyy-MM-dd');
      if (editForm.attendanceDate !== originalDateStr) {
        try {
          // Parse the new date from the input
          const newDate = parse(editForm.attendanceDate, 'yyyy-MM-dd', new Date());
          
          // Validate the date
          if (isNaN(newDate.getTime())) {
            throw new Error("Invalid date format");
          }
          
          // Set time to match the original time or the new timeIn if it's being edited
          const originalTime = selectedAttendance.timeIn || selectedAttendance.attendanceDate;
          newDate.setHours(originalTime.getHours());
          newDate.setMinutes(originalTime.getMinutes());
          
          updates.attendanceDate = newDate;
          
          // If we're also updating timeIn, we need to make sure to use the new date
          if (editForm.timeIn !== formatTime(originalTime)) {
            try {
              const [hours, minutes] = editForm.timeIn.split(':');
              if (hours && minutes) {
                const newTimeIn = new Date(newDate);
                newTimeIn.setHours(parseInt(hours, 10));
                newTimeIn.setMinutes(parseInt(minutes, 10));
                updates.timeIn = newTimeIn;
              }
            } catch (error) {
              console.error('Invalid time format:', error);
              setError('Invalid time format. Please use HH:MM format.');
              return;
            }
          }
          
          // If we're also updating timeOut, we need to make sure to use the new date
          if (editForm.timeOut) {
            try {
              const [hours, minutes] = editForm.timeOut.split(':');
              if (hours && minutes) {
                const newTimeOut = new Date(newDate);
                newTimeOut.setHours(parseInt(hours, 10));
                newTimeOut.setMinutes(parseInt(minutes, 10));
                updates.timeOut = newTimeOut;
              }
            } catch (error) {
              console.error('Invalid time format:', error);
              setError('Invalid time format. Please use HH:MM format.');
              return;
            }
          }
          
          // Store the updates for confirmation
          setPendingUpdates(updates);
          setDateChangeConfirmOpen(true);
          return; // Wait for confirmation before proceeding
        } catch (error) {
          console.error('Invalid date format:', error);
          setError('Invalid date format. Please use YYYY-MM-DD format.');
          return;
        }
      } else {
        // Only update timeIn if it's changed and valid (and date hasn't changed)
        const originalTimeIn = selectedAttendance.timeIn || selectedAttendance.attendanceDate;
        const originalTimeInStr = formatTime(originalTimeIn);
        
        if (editForm.timeIn !== originalTimeInStr) {
          try {
            // We need to keep the same date but change the time
            const originalDate = selectedAttendance.attendanceDate;
            const [hours, minutes] = editForm.timeIn.split(':');
            
            if (hours && minutes) {
              const newTimeIn = new Date(originalDate);
              newTimeIn.setHours(parseInt(hours, 10));
              newTimeIn.setMinutes(parseInt(minutes, 10));
              updates.timeIn = newTimeIn;
            }
          } catch (error) {
            console.error('Invalid time format:', error);
            setError('Invalid time format. Please use HH:MM format.');
            return;
          }
        }

        // Update timeOut if it's changed and valid
        const originalTimeOut = selectedAttendance.timeOut;
        const originalTimeOutStr = originalTimeOut ? formatTime(originalTimeOut) : '';
        
        if (editForm.timeOut !== originalTimeOutStr) {
          try {
            const originalDate = selectedAttendance.attendanceDate;
            const [hours, minutes] = editForm.timeOut.split(':');
            
            if (hours && minutes) {
              const newTimeOut = new Date(originalDate);
              newTimeOut.setHours(parseInt(hours, 10));
              newTimeOut.setMinutes(parseInt(minutes, 10));
              updates.timeOut = newTimeOut;
            } else if (editForm.timeOut === '') {
              // Clear the timeOut if the field is empty
              updates.timeOut = null;
            }
          } catch (error) {
            console.error('Invalid time format:', error);
            setError('Invalid time format. Please use HH:MM format.');
            return;
          }
        }
      }
      
      // If we're only updating non-date fields or just the time, save directly
      if (Object.keys(updates).length > 0) {
        await saveUpdates(updates);
      } else {
        setSuccessMessage('No changes were made');
        setEditOpen(false);
        setSelectedAttendance(null);
      }
    } catch (err) {
      console.error('Error preparing updates:', err);
      setError('Failed to prepare updates for attendance');
    }
  };

  const confirmDateChange = async () => {
    if (!pendingUpdates) return;
    
    try {
      setSaving(true);
      await saveUpdates(pendingUpdates);
    } catch (err) {
      console.error('Error confirming date change:', err);
      setError('Failed to update attendance date');
    } finally {
      setDateChangeConfirmOpen(false);
      setPendingUpdates(null);
      setSaving(false);
    }
  };

  const cancelDateChange = () => {
    setDateChangeConfirmOpen(false);
    setPendingUpdates(null);
  };

  const saveUpdates = async (updates: any) => {
    if (!selectedAttendance) return;
    
    try {
      setSaving(true);
      await updateAttendance(selectedAttendance.id, updates);
      
      // Update local state
      setAttendances(prev => 
        prev.map(item => 
          item.id === selectedAttendance.id 
            ? { ...item, ...updates } 
            : item
        )
      );
      
      setSuccessMessage('Attendance details updated successfully');
      setEditOpen(false);
      setSelectedAttendance(null);
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance details');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setError('');
  };

  // Helper to format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  // Helper to format time
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  // Helper to format display time - now showing a range when timeOut is available
  const formatDisplayTime = (startTime: Date, endTime?: Date | null) => {
    const start = format(startTime, 'h:mm a');
    if (endTime) {
      const end = format(endTime, 'h:mm a');
      return `${start} - ${end}`;
    }
    return start;
  };

  const isAttendanceWithStudentDetails = (
    attendance: Attendance | AttendanceWithStudentDetails
  ): attendance is AttendanceWithStudentDetails => {
    return 'studentName' in attendance;
  };

  // Helper to generate CSV data for export
  const generateCSV = () => {
    const headers = [
      'Date', 
      'Time Range',
      'Class',
      'Location',
      'Coach',
      'Notes'
    ];
    
    if (showStudentName) {
      headers.unshift('Student', 'Email');
    }
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    attendances.forEach(attendance => {
      const timeRange = attendance.timeOut 
        ? `${formatDisplayTime(attendance.timeIn || attendance.attendanceDate, attendance.timeOut)}`
        : formatDisplayTime(attendance.timeIn || attendance.attendanceDate);
        
      const row = [
        formatDate(attendance.attendanceDate),
        timeRange,
        attendance.className || 'Not specified',
        attendance.location || 'Not specified',
        attendance.coach || 'Not specified',
        (attendance.notes || '').replace(/,/g, ';').replace(/\n/g, ' ')
      ];
      
      if (showStudentName && isAttendanceWithStudentDetails(attendance)) {
        row.unshift(
          attendance.studentName,
          attendance.studentEmail || ''
        );
      }
      
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  };

  // Download attendance history as CSV
  const handleDownload = () => {
    const csvData = generateCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const studentName = studentId && attendances.length > 0 && isAttendanceWithStudentDetails(attendances[0]) 
      ? attendances[0].studentName.replace(/\s+/g, '_')
      : 'all_students';
    
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `attendance_history_${studentName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setSuccessMessage('Attendance history downloaded successfully!');
  };

  // Print attendance history
  const handlePrint = () => {
    if (tableRef.current) {
      const printContents = tableRef.current.outerHTML;
      const originalContents = document.body.innerHTML;
      const studentName = studentId && attendances.length > 0 && isAttendanceWithStudentDetails(attendances[0]) 
        ? attendances[0].studentName
        : 'All Students';
        
      const printStyles = `
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .print-header { text-align: center; margin-bottom: 20px; }
          @media print {
            body { margin: 0; padding: 20px; }
            button { display: none; }
          }
        </style>
      `;
      
      const printContent = `
        <html>
          <head>
            <title>Attendance History</title>
            ${printStyles}
          </head>
          <body>
            <div class="print-header">
              <h1>Attendance History - ${studentName}</h1>
              <p>Printed on ${new Date().toLocaleDateString()}</p>
            </div>
            ${printContents}
          </body>
        </html>
      `;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContents;
      
      // Restore state after printing
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  // Handle delete attendance click
  const handleDeleteAttendance = (attendance: Attendance | AttendanceWithStudentDetails) => {
    setAttendanceToDelete(attendance);
    setDeleteConfirmOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setAttendanceToDelete(null);
  };

  // Confirm delete attendance
  const confirmDelete = async () => {
    if (!attendanceToDelete) return;
    
    try {
      setDeleting(true);
      await deleteAttendance(attendanceToDelete.id);
      
      // Update local state by removing the deleted attendance
      setAttendances(prev => prev.filter(item => item.id !== attendanceToDelete.id));
      
      setSuccessMessage('Attendance record deleted successfully');
    } catch (err) {
      console.error('Error deleting attendance:', err);
      setError('Failed to delete attendance record');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setAttendanceToDelete(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (attendances.length === 0) {
    return (
      <Alert severity="info">
        No attendance records found{studentId ? ' for this student' : ''}.
      </Alert>
    );
  }

  return (
    <>
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tooltip title="Download as CSV">
            <IconButton 
              onClick={handleDownload}
              size="small"
              sx={{ 
                mr: 1,
                bgcolor: 'success.light',
                color: 'success.contrastText',
                '&:hover': {
                  bgcolor: 'success.main',
                }
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Attendance History">
            <IconButton 
              onClick={handlePrint}
              size="small"
              sx={{ 
                bgcolor: 'info.light',
                color: 'info.contrastText',
                '&:hover': {
                  bgcolor: 'info.main',
                }
              }}
            >
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <TableContainer component={Paper} elevation={0} ref={tableRef}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {showStudentName && (
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>Student</Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight={600}>Date</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight={600}>Time</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ClassIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight={600}>Class</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight={600}>Location</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight={600}>Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendances.map((attendance) => (
                <TableRow 
                  key={attendance.id}
                  sx={{ 
                    '&:hover': {
                      backgroundColor: 'rgba(67, 97, 238, 0.04)',
                    },
                  }}
                >
                  {showStudentName && isAttendanceWithStudentDetails(attendance) && (
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight={500}>
                        {attendance.studentName}
                      </Typography>
                      {attendance.studentEmail && (
                        <Typography variant="caption" color="text.secondary">
                          {attendance.studentEmail}
                        </Typography>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip 
                      label={formatDate(attendance.attendanceDate)} 
                      size="small"
                      color="info"
                      sx={{ fontWeight: 500, bgcolor: 'info.light', color: 'info.contrastText' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {attendance.timeOut 
                        ? formatDisplayTime(attendance.timeIn || attendance.attendanceDate, attendance.timeOut)
                        : formatDisplayTime(attendance.timeIn || attendance.attendanceDate)
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {attendance.className ? (
                      <Typography variant="body2">{attendance.className}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Not specified</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {attendance.location ? (
                      <Typography variant="body2">{attendance.location}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Not specified</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewDetails(attendance)}
                          sx={{ 
                            mr: 1,
                            bgcolor: 'rgba(67, 97, 238, 0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(67, 97, 238, 0.2)',
                            }
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {isAdmin && (
                        <>
                          <Tooltip title="Edit Attendance">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => handleEditAttendance(attendance)}
                              sx={{ 
                                mr: 1,
                                bgcolor: 'rgba(247, 37, 133, 0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(247, 37, 133, 0.2)',
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Record">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteAttendance(attendance)}
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
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Attendance Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        {selectedAttendance && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Attendance Details
                  </Typography>
                </Box>
                
                {isAdmin && (
                  <Tooltip title="Edit Attendance">
                    <IconButton 
                      color="secondary"
                      onClick={() => {
                        handleCloseDetails();
                        handleEditAttendance(selectedAttendance);
                      }}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ py: 1 }}>
                {isAttendanceWithStudentDetails(selectedAttendance) && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Student
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedAttendance.studentName}
                    </Typography>
                    {selectedAttendance.studentEmail && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedAttendance.studentEmail}
                      </Typography>
                    )}
                  </Box>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Date
                    </Typography>
                    <Chip 
                      icon={<EventIcon />}
                      label={formatDate(selectedAttendance.attendanceDate)}
                      color="info"
                      sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Time
                    </Typography>
                    <Chip 
                      icon={<TimeIcon />}
                      label={selectedAttendance.timeOut 
                        ? formatDisplayTime(selectedAttendance.timeIn || selectedAttendance.attendanceDate, selectedAttendance.timeOut)
                        : formatDisplayTime(selectedAttendance.timeIn || selectedAttendance.attendanceDate)
                      }
                      color="secondary"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Class Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedAttendance.className || 'Not specified'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {selectedAttendance.location || 'Not specified'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Coach
                  </Typography>
                  <Typography variant="body1">
                    {selectedAttendance.coach || 'Not specified'}
                  </Typography>
                </Box>

                {selectedAttendance.notes && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Notes
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: 'background.default' 
                      }}
                    >
                      <Typography variant="body2">
                        {selectedAttendance.notes}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={handleCloseDetails} 
                variant="contained"
                color="primary"
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog
        open={editOpen}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        {selectedAttendance && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EditIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" component="div" fontWeight={600}>
                  Edit Attendance Details
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ py: 1 }}>
                {isAttendanceWithStudentDetails(selectedAttendance) && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Student
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedAttendance.studentName}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Date
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    name="attendanceDate"
                    value={editForm.attendanceDate}
                    onChange={handleInputChange}
                    margin="normal"
                    helperText="Attendance date (YYYY-MM-DD format)"
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Time (HH:MM)"
                      name="timeIn"
                      value={editForm.timeIn}
                      onChange={handleInputChange}
                      placeholder="e.g. 14:30"
                      margin="normal"
                      helperText="24-hour format (e.g. 14:30 for 2:30 PM)"
                      inputProps={{
                        pattern: "[0-9]{2}:[0-9]{2}"
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="End Time (HH:MM)"
                      name="timeOut"
                      value={editForm.timeOut}
                      onChange={handleInputChange}
                      placeholder="e.g. 15:30"
                      margin="normal"
                      helperText="Leave empty if no end time"
                      inputProps={{
                        pattern: "[0-9]{2}:[0-9]{2}"
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Class Type"
                      name="className"
                      value={editForm.className}
                      onChange={handleInputChange}
                      placeholder="e.g. Regular Training, Private Lesson"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Main Court, Court A"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Coach"
                      name="coach"
                      value={editForm.coach}
                      onChange={handleInputChange}
                      placeholder="e.g. Coach Smith"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      name="notes"
                      value={editForm.notes}
                      onChange={handleInputChange}
                      placeholder="Any additional notes about this class..."
                      multiline
                      rows={3}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={handleCloseEdit} 
                variant="outlined"
                color="inherit"
                sx={{ borderRadius: 2 }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges} 
                variant="contained"
                color="secondary"
                startIcon={<SaveIcon />}
                sx={{ 
                  borderRadius: 2,
                  boxShadow: '0 4px 10px rgba(247, 37, 133, 0.2)'
                }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Date Change Confirmation Dialog */}
      <Dialog
        open={dateChangeConfirmOpen}
        onClose={cancelDateChange}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="h6" component="div" fontWeight={600}>
              Confirm Date Change
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAttendance && pendingUpdates && (
            <Box sx={{ py: 1 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Changing the attendance date is a significant change that may affect billing or scheduling.
              </Alert>
              
              <Typography variant="body1" gutterBottom>
                You are changing the attendance date from:
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 1 }}>
                <Chip 
                  icon={<EventIcon />}
                  label={formatDate(selectedAttendance.attendanceDate)}
                  color="info"
                  sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}
                />
                <ArrowRightAltIcon />
                <Chip 
                  icon={<EventIcon />}
                  label={pendingUpdates.attendanceDate ? formatDate(pendingUpdates.attendanceDate) : ''}
                  color="secondary"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Are you sure you want to proceed with this change?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={cancelDateChange}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDateChange}
            variant="contained"
            color="warning"
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(255, 152, 0, 0.2)'
            }}
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Confirm Date Change'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
            <Typography variant="h6" component="div" fontWeight={600}>
              Delete Attendance Record
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {attendanceToDelete && (
            <Box sx={{ py: 1 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                This action is permanent and cannot be undone.
              </Alert>
              
              <DialogContentText gutterBottom>
                Are you sure you want to delete this attendance record?
              </DialogContentText>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                {isAttendanceWithStudentDetails(attendanceToDelete) && (
                  <Typography variant="body1" fontWeight={500} gutterBottom>
                    Student: {attendanceToDelete.studentName}
                  </Typography>
                )}
                <Typography variant="body1" gutterBottom>
                  Date: {formatDate(attendanceToDelete.attendanceDate)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Time: {attendanceToDelete.timeOut 
                    ? formatDisplayTime(attendanceToDelete.timeIn || attendanceToDelete.attendanceDate, attendanceToDelete.timeOut)
                    : formatDisplayTime(attendanceToDelete.timeIn || attendanceToDelete.attendanceDate)}
                </Typography>
                {attendanceToDelete.className && (
                  <Typography variant="body1" gutterBottom>
                    Class: {attendanceToDelete.className}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDeleteConfirm}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 10px rgba(229, 56, 59, 0.2)'
            }}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error messages */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={4000} 
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
        autoHideDuration={4000} 
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
    </>
  );
};

export default AttendanceHistory; 