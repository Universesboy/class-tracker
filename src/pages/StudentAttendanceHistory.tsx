import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CircularProgress, 
  Alert,
  Paper,
  Avatar,
  Grid,
  Chip,
  Divider,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import { useParams, Navigate } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import AttendanceHistory from '../components/AttendanceHistory';
import { getStudentWithClasses } from '../services/studentService';
import { StudentWithClasses } from '../types';
import { 
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  Download as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';

const StudentAttendanceHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentWithClasses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const studentData = await getStudentWithClasses(id);
        if (studentData) {
          setStudent(studentData);
        } else {
          setError('Student not found');
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  if (!id) {
    return <Navigate to="/students" />;
  }

  if (loading) {
    return (
      <PageContainer title="Loading...">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !student) {
    return (
      <PageContainer title="Error">
        <Alert severity="error">{error || 'Student not found'}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title={`${student.name}'s Attendance History`}
      subtitle="View detailed attendance records for this student"
    >
      {/* Student Summary Card */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: 4, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.05)'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: 'primary.main',
                  mr: 2
                }}
              >
                {student.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  {student.name}
                </Typography>
                {student.email && (
                  <Typography variant="body2" color="text.secondary">
                    {student.email}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', md: 'flex-end' }
            }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: { xs: 'flex-start', md: 'center' } 
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Remaining Classes
                </Typography>
                <Chip 
                  label={student.remainingClasses} 
                  color={student.remainingClasses > 0 ? "primary" : "error"}
                  sx={{ fontWeight: 700, fontSize: '1rem' }}
                />
              </Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: { xs: 'flex-start', md: 'center' } 
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Total Attended
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {student.totalAttended}
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: { xs: 'flex-start', md: 'center' } 
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Total Purchased
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {student.totalPurchased}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Card 
        elevation={0} 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.05)'
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 }, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Attendance Records
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Download Attendance History">
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<DownloadIcon />}
                  sx={{ 
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                  onClick={() => {
                    // Find the download button in the AttendanceHistory component and trigger a click
                    const downloadBtn = document.querySelector('[title="Download as CSV"]');
                    if (downloadBtn) {
                      (downloadBtn as HTMLElement).click();
                    }
                  }}
                >
                  Download
                </Button>
              </Tooltip>
              <Tooltip title="Print Attendance History">
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<PrintIcon />}
                  sx={{ 
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                  onClick={() => {
                    // Find the print button in the AttendanceHistory component and trigger a click
                    const printBtn = document.querySelector('[title="Print Attendance History"]');
                    if (printBtn) {
                      (printBtn as HTMLElement).click();
                    }
                  }}
                >
                  Print
                </Button>
              </Tooltip>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Complete attendance history showing class details, dates, times, and locations
          </Typography>
        </Box>
        <Divider />
        <Box>
          <AttendanceHistory 
            studentId={id} 
            showStudentName={false} 
          />
        </Box>
      </Card>
    </PageContainer>
  );
};

export default StudentAttendanceHistory; 