import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  Paper,
  Avatar,
  Divider,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  CardHeader,
  Fade,
  Skeleton,
  alpha
} from '@mui/material';
import { 
  Group as GroupIcon, 
  PersonAdd as PersonAddIcon,
  AddShoppingCart as AddShoppingCartIcon,
  HowToReg as HowToRegIcon,
  KeyboardArrowRight as ArrowRightIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import DashboardButton from '../components/common/DashboardButton';
import { useAuth } from '../contexts/AuthContext';
import { getAllStudentsWithClasses } from '../services/studentService';
import { StudentWithClasses } from '../types';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [studentsData, setStudentsData] = useState<{
    total: number;
    noClasses: number;
    lowClasses: number;
  }>({
    total: 0,
    noClasses: 0,
    lowClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentStudents, setRecentStudents] = useState<StudentWithClasses[]>([]);

  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        const students = await getAllStudentsWithClasses();
        
        // Sort by creation date (newest first) for recent students
        const sortedStudents = [...students].sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        setStudentsData({
          total: students.length,
          noClasses: students.filter(s => s.remainingClasses <= 0).length,
          lowClasses: students.filter(s => s.remainingClasses > 0 && s.remainingClasses <= 2).length
        });
        
        setRecentStudents(sortedStudents.slice(0, 5));
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentsData();
  }, []);
  
  const actionCards = [
    {
      title: 'Students',
      description: 'View and manage all students',
      icon: <GroupIcon />,
      path: '/students',
      color: theme.palette.primary.main,
      gradient: 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)'
    },
    {
      title: 'Add Student',
      description: 'Register a new student',
      icon: <PersonAddIcon />,
      path: '/students/add',
      color: theme.palette.success.main,
      gradient: 'linear-gradient(135deg, #06d6a0 0%, #00a371 100%)'
    },
    {
      title: 'Record Purchase',
      description: 'Record a class package purchase',
      icon: <AddShoppingCartIcon />,
      path: '/record-purchase',
      color: theme.palette.secondary.main,
      gradient: 'linear-gradient(135deg, #f72585 0%, #dc246d 100%)'
    },
    {
      title: 'Attendance',
      description: 'Take attendance for a class',
      icon: <HowToRegIcon />,
      path: '/attendance',
      color: theme.palette.warning.main,
      gradient: 'linear-gradient(135deg, #ff9e00 0%, #c67100 100%)'
    }
  ];

  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);

  return (
    <PageContainer 
      title={`Welcome, ${currentUser?.displayName || 'Admin'}`}
      subtitle={
        <>
          Today is{' '}
          <Typography 
            component="span" 
            color="text.primary" 
            fontWeight={700}
            sx={{ 
              borderRadius: 1,
              px: 1.5,
              py: 0.5,
              bgcolor: alpha(theme.palette.secondary.main, 0.15),
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
              border: '1px solid',
              borderColor: alpha(theme.palette.secondary.main, 0.3),
              color: theme.palette.secondary.dark
            }}
          >
            {formattedDate}
          </Typography>{' '}
          · Let's manage your badminton classes
        </>
      }
    >
      <Box sx={{ mb: 5 }}>
        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'rgba(0, 0, 0, 0.05)',
                background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.03) 0%, rgba(76, 201, 240, 0.02) 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    width: 44, 
                    height: 44,
                    boxShadow: '0px 4px 10px rgba(67, 97, 238, 0.2)'
                  }}>
                    <TrendingIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Student Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overview of current students
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained"
                  size="small"
                  component={Link}
                  to="/students"
                  endIcon={<ArrowRightIcon />}
                  sx={{ 
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    boxShadow: '0px 4px 10px rgba(67, 97, 238, 0.2)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(3px)',
                      boxShadow: '0px 6px 15px rgba(67, 97, 238, 0.3)',
                    }
                  }}
                >
                  View All
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Fade in={!loading} timeout={700}>
                    <Box 
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        height: '100%',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.05)',
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Total Students
                        </Typography>
                        <Avatar 
                          sx={{ 
                            width: 30, 
                            height: 30, 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main'
                          }}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                      </Box>
                      {loading ? (
                        <Skeleton variant="rectangular" width="100%" height={32} />
                      ) : (
                        <Typography variant="h4" fontWeight={700} color="primary.main">
                          {studentsData.total}
                        </Typography>
                      )}
                    </Box>
                  </Fade>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Fade in={!loading} timeout={900}>
                    <Box 
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        height: '100%',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.05)',
                          borderColor: 'warning.main'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Low Classes
                        </Typography>
                        <Avatar 
                          sx={{ 
                            width: 30, 
                            height: 30, 
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: 'warning.main'
                          }}
                        >
                          <WarningIcon fontSize="small" />
                        </Avatar>
                      </Box>
                      {loading ? (
                        <Skeleton variant="rectangular" width="100%" height={32} />
                      ) : (
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          {studentsData.lowClasses}
                        </Typography>
                      )}
                    </Box>
                  </Fade>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Fade in={!loading} timeout={1100}>
                    <Box 
                      sx={{ 
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        height: '100%',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.05)',
                          borderColor: 'error.main'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          No Classes
                        </Typography>
                        <Avatar 
                          sx={{ 
                            width: 30, 
                            height: 30, 
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: 'error.main'
                          }}
                        >
                          <ErrorIcon fontSize="small" />
                        </Avatar>
                      </Box>
                      {loading ? (
                        <Skeleton variant="rectangular" width="100%" height={32} />
                      ) : (
                        <Typography variant="h4" fontWeight={700} color="error.main">
                          {studentsData.noClasses}
                        </Typography>
                      )}
                    </Box>
                  </Fade>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Classes Status Distribution
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="success.main" width={100}>
                    Good
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={studentsData.total ? (studentsData.total - studentsData.lowClasses - studentsData.noClasses) / studentsData.total * 100 : 0}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      flexGrow: 1,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'success.main',
                      }
                    }}
                  />
                  <Typography variant="body2" fontWeight={500} width={40} textAlign="right">
                    {studentsData.total ? Math.round((studentsData.total - studentsData.lowClasses - studentsData.noClasses) / studentsData.total * 100) : 0}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="warning.main" width={100}>
                    Low
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={studentsData.total ? studentsData.lowClasses / studentsData.total * 100 : 0}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      flexGrow: 1,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'warning.main',
                      }
                    }}
                  />
                  <Typography variant="body2" fontWeight={500} width={40} textAlign="right">
                    {studentsData.total ? Math.round(studentsData.lowClasses / studentsData.total * 100) : 0}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="error.main" width={100}>
                    No Classes
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={studentsData.total ? studentsData.noClasses / studentsData.total * 100 : 0}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      flexGrow: 1,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'error.main',
                      }
                    }}
                  />
                  <Typography variant="body2" fontWeight={500} width={40} textAlign="right">
                    {studentsData.total ? Math.round(studentsData.noClasses / studentsData.total * 100) : 0}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'rgba(0, 0, 0, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ 
                    bgcolor: 'secondary.main', 
                    width: 44, 
                    height: 44,
                    boxShadow: '0px 4px 10px rgba(247, 37, 133, 0.2)'
                  }}>
                    <CalendarIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Today's Schedule
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 3, textAlign: 'center', py: 8 }}>
                <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                <Typography variant="body1" fontWeight={500} color="text.secondary">
                  No classes scheduled today
                </Typography>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0px 4px 8px rgba(247, 37, 133, 0.15)'
                    }
                  }}
                >
                  Add Class
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            Quick Actions
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {actionCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={card.title}>
                <Fade in={true} timeout={700 + (index * 200)}>
                  <Box>
                    <DashboardButton 
                      title={card.title}
                      description={card.description}
                      icon={card.icon}
                      path={card.path}
                      color={card.color}
                      gradient={card.gradient}
                    />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            Recent Students
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {loading ? (
              Array.from(new Array(4)).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Skeleton variant="rounded" height={180} />
                </Grid>
              ))
            ) : recentStudents.length > 0 ? (
              recentStudents.map((student, index) => (
                <Grid item xs={12} sm={6} md={3} key={student.id}>
                  <Fade in={true} timeout={700 + (index * 200)}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        borderRadius: 3,
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Avatar 
                            sx={{ 
                              bgcolor: student.remainingClasses > 2 
                                ? 'success.main' 
                                : student.remainingClasses > 0 
                                ? 'warning.main' 
                                : 'error.main',
                              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            {student.name.charAt(0)}
                          </Avatar>
                        }
                        title={student.name}
                        subheader={`Added on ${student.createdAt.toLocaleDateString()}`}
                        action={
                          <IconButton 
                            component={Link} 
                            to={`/students/${student.id}`}
                            size="small"
                          >
                            <ArrowRightIcon fontSize="small" />
                          </IconButton>
                        }
                        titleTypographyProps={{ fontWeight: 600 }}
                      />
                      <CardContent sx={{ pt: 0 }}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Remaining Classes
                          </Typography>
                          <Typography 
                            variant="body1" 
                            fontWeight={700}
                            color={
                              student.remainingClasses > 2 
                                ? 'success.main' 
                                : student.remainingClasses > 0 
                                ? 'warning.main' 
                                : 'error.main'
                            }
                          >
                            {student.remainingClasses}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Attended Classes
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {student.totalAttended}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    py: 5, 
                    textAlign: 'center', 
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    No students have been added yet
                  </Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/students/add"
                    startIcon={<PersonAddIcon />}
                    sx={{ 
                      mt: 2,
                      borderRadius: 2
                    }}
                  >
                    Add Your First Student
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Dashboard; 