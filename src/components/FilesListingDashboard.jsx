import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Fab,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  CloudUpload,
  FileCopy,
  CheckCircle,
  Error,
  Schedule,
  TrendingUp,
  Warning,
  Refresh,
  Visibility,
  Download,
  Delete,
  Storage,
  Speed
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import UploadModal from './UploadModal';
import axios from 'axios';

// Beautiful color palette mixing purple and black
const colors = {
  primary: '#9A5FA3',      // Rich purple
  primaryDark: '#7B4A82',  // Darker purple
  primaryLight: '#B894C4', // Light purple
  black: '#1C355E',        // Deep blue-black (best shade)
  blackLight: '#2A4A7A',   // Rich blue-black
  blackLighter: '#3A5A8A', // Sophisticated blue-gray
  gray: '#64748B',         // Premium medium gray
  grayLight: '#94A3B8',    // Elegant light gray
  white: '#FFFFFF',        // Pure white
  accent: '#9A5FA3'        // Purple accent
};

// Enhanced Chart Components with Gradients
const SimpleBarChart = ({ data, height = 180 }) => {
  const maxValue = Math.max(...Object.values(data));
  
  return (
    <Box sx={{ height, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'end', height: height - 40, gap: 2, justifyContent: 'center' }}>
        {Object.entries(data).map(([key, value], index) => (
          <Box key={key} sx={{ textAlign: 'center', flex: 1 }}>
            <Box
              sx={{
                height: `${(value / maxValue) * 100}%`,
                background: index === 0 
                  ? `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`
                  : `linear-gradient(180deg, ${colors.black} 0%, ${colors.blackLight} 100%)`,
                borderRadius: '8px 8px 0 0',
                minHeight: 16,
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'scaleY(1.05)',
                  boxShadow: `0 4px 12px ${index === 0 ? colors.primary : colors.black}40`
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '30%',
                  background: `linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)`,
                  borderRadius: '8px 8px 0 0'
                }
              }}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.gray }}>
              {key}
            </Typography>
            <Typography variant="body2" fontWeight={600} color={colors.black}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const SimplePieChart = ({ data, height = 180 }) => {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  const chartColors = [colors.primary, colors.black, colors.primaryLight, colors.blackLight];
  
  return (
    <Box sx={{ height, p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {Object.entries(data).map(([key, value], index) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${chartColors[index % chartColors.length]} 0%, ${chartColors[(index + 1) % chartColors.length]} 100%)`,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '20%',
                  left: '20%',
                  width: '60%',
                  height: '60%',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%)`
                }
              }}
            />
            <Typography variant="body2" sx={{ flex: 1, color: colors.black }}>
              {key}
            </Typography>
            <Typography variant="body2" fontWeight={600} color={colors.black}>
              {value} ({Math.round((value / total) * 100)}%)
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const ProgressRing = ({ value, maxValue, size = 80, strokeWidth = 4, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = value / maxValue;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <svg width={size} height={size}>
          <defs>
            <linearGradient id={`gradient-${Math.random()}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.primaryLight} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`${colors.grayLight}30`}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gradient-${Math.random()})"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(154, 95, 163, 0.3))' }}
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" fontWeight={600} color={colors.primary}>
            {Math.round(progress * 100)}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color={colors.gray} sx={{ mt: 1 }}>
        {label}
      </Typography>
    </Box>
  );
};

// New Line Chart Component with Gradient
const LineChart = ({ data, height = 200 }) => {
  const values = Object.values(data);
  const labels = Object.keys(data);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;
  
  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * (height - 60),
    y: height - 60 - ((value - minValue) / range) * (height - 60)
  }));

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <Box sx={{ height, p: 2, position: 'relative' }}>
      <svg width="100%" height={height - 40} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.primaryLight} stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Area fill */}
        <path
          d={`${pathData} L ${points[points.length - 1].x} ${height - 60} L ${points[0].x} ${height - 60} Z`}
          fill="url(#lineGradient)"
          opacity="0.2"
        />
        
        {/* Line */}
        <path
          d={pathData}
          stroke={colors.primary}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={colors.white}
            stroke={colors.primary}
            strokeWidth="2"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(154, 95, 163, 0.3))' }}
          />
        ))}
      </svg>
      
      {/* Labels */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        {labels.map((label, index) => (
          <Typography key={index} variant="caption" color={colors.gray} sx={{ fontSize: '0.7rem' }}>
            {label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default function FilesListingDashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, [token]);

  const fetchFiles = () => {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    setLoading(true);
    axios.get('http://localhost:8000/api/files-listing/', config)
      .then(res => {
        const filesData = res.data.files || res.data;
        setFiles(Array.isArray(filesData) ? filesData : []);
        setSummary(res.data.summary || null);
        setFilters(res.data.filters_applied || {});
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching file list:', error);
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
        setFiles([]);
        setSummary(null);
        setLoading(false);
      });
  };

  const handleUploadSuccess = () => {
    fetchFiles();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#E6FFFA', color: '#2F855A', icon: <CheckCircle fontSize="small" /> };
      case 'PROCESSING':
        return { bg: '#FEF5E7', color: '#C05621', icon: <Schedule fontSize="small" /> };
      case 'FAILED':
        return { bg: '#FED7D7', color: '#C53030', icon: <Error fontSize="small" /> };
      case 'PENDING':
        return { bg: '#EBF8FF', color: '#2B6CB0', icon: <Warning fontSize="small" /> };
      default:
        return { bg: '#F7FAFC', color: '#4A5568', icon: <Warning fontSize="small" /> };
    }
  };

  const getProcessingStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#E6FFFA', color: '#2F855A', icon: <CheckCircle fontSize="small" /> };
      case 'PROCESSING':
        return { bg: '#FEF5E7', color: '#C05621', icon: <Schedule fontSize="small" /> };
      case 'FAILED':
        return { bg: '#FED7D7', color: '#C53030', icon: <Error fontSize="small" /> };
      case 'NOT_STARTED':
        return { bg: '#F7FAFC', color: '#4A5568', icon: <Warning fontSize="small" /> };
      default:
        return { bg: '#F7FAFC', color: '#4A5568', icon: <Warning fontSize="small" /> };
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSuccessRate = () => {
    if (!summary || summary.total_files === 0) return 0;
    const rate = (summary.processed_files / summary.total_files) * 100;
    return Math.round(rate);
  };

  const getProcessingStatusCount = (status) => {
    if (!summary) return 0;
    switch (status) {
      case 'COMPLETED':
        return summary.celery_completed || 0;
      case 'PROCESSING':
        return summary.celery_processing || 0;
      case 'FAILED':
        return summary.celery_failed || 0;
      default:
        return 0;
    }
  };

  const getChartData = () => {
    if (!summary) return {};
    
    return {
      fileStatus: {
        'Processed': summary.processed_files || 0,
        'Pending': summary.pending_files || 0,
        'Failed': summary.failed_files || 0
      },
      processingStatus: {
        'Completed': summary.celery_completed || 0,
        'Processing': summary.celery_processing || 0,
        'Failed': summary.celery_failed || 0
      }
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} sx={{ color: colors.primary }} />
      </Box>
    );
  }

  const chartData = getChartData();

  return (
    <Box sx={{ p: 3, bgcolor: colors.white, minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors.black, mb: 1 }}>
          Files Dashboard
        </Typography>
        <Typography variant="body1" color={colors.gray}>
          Overview of your file processing operations
        </Typography>
      </Box>

      {/* Summary Statistics Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ 
              height: '100%', 
              bgcolor: colors.white,
              borderRadius: 2,
              border: `2px solid ${colors.primary}20`,
              boxShadow: `0 4px 12px ${colors.primary}15`,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: colors.primary,
                boxShadow: `0 6px 20px ${colors.primary}25`
              }
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Storage sx={{ fontSize: 32, mb: 2, color: colors.primary }} />
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: colors.black }}>
                  {summary.total_files}
                </Typography>
                <Typography variant="body2" color={colors.gray} fontWeight={500}>
                  Total Files
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ 
              height: '100%', 
              bgcolor: colors.white,
              borderRadius: 2,
              border: `2px solid ${colors.black}20`,
              boxShadow: `0 4px 12px ${colors.black}15`,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: colors.black,
                boxShadow: `0 6px 20px ${colors.black}25`
              }
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 32, mb: 2, color: colors.black }} />
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: colors.black }}>
                  {summary.processed_files}
                </Typography>
                <Typography variant="body2" color={colors.gray} fontWeight={500}>
                  Processed Files
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ 
              height: '100%', 
              bgcolor: colors.white,
              borderRadius: 2,
              border: `2px solid ${colors.primaryLight}20`,
              boxShadow: `0 4px 12px ${colors.primaryLight}15`,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: colors.primaryLight,
                boxShadow: `0 6px 20px ${colors.primaryLight}25`
              }
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 32, mb: 2, color: colors.primaryLight }} />
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: colors.black }}>
                  {getSuccessRate()}%
                </Typography>
                <Typography variant="body2" color={colors.gray} fontWeight={500}>
                  Success Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ 
              height: '100%', 
              bgcolor: colors.white,
              borderRadius: 2,
              border: `2px solid ${colors.accent}20`,
              boxShadow: `0 4px 12px ${colors.accent}15`,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: colors.accent,
                boxShadow: `0 6px 20px ${colors.accent}25`
              }
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Speed sx={{ fontSize: 32, mb: 2, color: colors.accent }} />
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: colors.black }}>
                  {summary.celery_completed || 0}
                </Typography>
                <Typography variant="body2" color={colors.gray} fontWeight={500}>
                  Completed Jobs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

             {/* Charts Section */}
       {summary && (
         <Grid container spacing={3} sx={{ mb: 4 }}>
           <Grid item size={{xs: 12, md: 4}}>
             <Card sx={{ 
               borderRadius: 2, 
               border: `1px solid ${colors.grayLight}30`,
               height: '100%', 
               bgcolor: colors.white, 
               boxShadow: `0 2px 8px ${colors.black}08`
             }}>
               <CardContent sx={{ p: 3 }}>
                 <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.black }}>
                   File Status Distribution
                 </Typography>
                 <SimpleBarChart data={chartData.fileStatus} height={200} />
               </CardContent>
             </Card>
           </Grid>

           <Grid item size={{xs: 12, md: 4}}>
             <Card sx={{ 
               borderRadius: 2, 
               border: `1px solid ${colors.grayLight}30`,
               height: '100%', 
               bgcolor: colors.white, 
               boxShadow: `0 2px 8px ${colors.black}08`
             }}>
               <CardContent sx={{ p: 3 }}>
                 <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.black }}>
                   Processing Status
                 </Typography>
                 <SimplePieChart data={chartData.processingStatus} height={200} />
               </CardContent>
             </Card>
           </Grid>

           <Grid item size={{xs: 12, md: 4}}>
             <Card sx={{ 
               borderRadius: 2, 
               border: `1px solid ${colors.grayLight}30`,
               height: '100%', 
               bgcolor: colors.white, 
               boxShadow: `0 2px 8px ${colors.black}08`
             }}>
               <CardContent sx={{ p: 3 }}>
                 <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.black }}>
                   Processing Trend
                 </Typography>
                 <LineChart data={{
                   'Jan': summary.processed_files || 0,
                   'Feb': summary.celery_completed || 0,
                   'Mar': summary.total_files || 0,
                   'Apr': summary.processed_files || 0,
                   'May': summary.celery_completed || 0
                 }} height={200} />
               </CardContent>
             </Card>
           </Grid>
         </Grid>
       )}

      {/* Progress Overview */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item size={{xs: 12, md: 4}}>
            <Card sx={{ 
              borderRadius: 2, 
              border: `1px solid ${colors.grayLight}30`,
              height: '100%', 
              bgcolor: colors.white, 
              boxShadow: `0 2px 8px ${colors.black}08`
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.black }}>
                  Overall Progress
                </Typography>
                <ProgressRing 
                  value={summary.processed_files || 0} 
                  maxValue={summary.total_files || 1} 
                  size={100}
                  label="Files Processed"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item size={{xs: 12, md: 4}}>
            <Card sx={{ 
              borderRadius: 2, 
              border: `1px solid ${colors.grayLight}30`,
              height: '100%', 
              bgcolor: colors.white, 
              boxShadow: `0 2px 8px ${colors.black}08`
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.black }}>
                  Job Completion
                </Typography>
                <ProgressRing 
                  value={summary.celery_completed || 0} 
                  maxValue={Math.max((summary.celery_completed || 0) + (summary.celery_processing || 0) + (summary.celery_failed || 0), 1)} 
                  size={100}
                  label="Jobs Completed"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item size={{xs: 12, md: 4}}>
            <Card sx={{ 
              borderRadius: 2, 
              border: `1px solid ${colors.grayLight}30`,
              height: '100%', 
              bgcolor: colors.white, 
              boxShadow: `0 2px 8px ${colors.black}08`
            }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: colors.black }}>
                  Success Rate
                </Typography>
                <ProgressRing 
                  value={getSuccessRate()} 
                  maxValue={100} 
                  size={100}
                  label="Processing Success"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Files Table */}
      <Card sx={{ 
        borderRadius: 2, 
        border: `1px solid ${colors.grayLight}30`,
        overflow: 'hidden', 
        bgcolor: colors.white, 
        boxShadow: `0 2px 8px ${colors.black}08`
      }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${colors.grayLight}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: colors.black }}>
            <FileCopy sx={{ mr: 1, color: colors.primary }} />
            Files ({files.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchFiles} size="small" sx={{ color: colors.primary }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {files.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <FileCopy sx={{ fontSize: 60, color: colors.grayLight, mb: 2 }} />
            <Typography variant="h6" color={colors.gray} sx={{ mb: 1 }}>
              No files found
            </Typography>
            <Typography variant="body2" color={colors.gray}>
              Upload your first file to get started
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: `${colors.grayLight}10` }}>
                  <TableCell sx={{ fontWeight: 600, color: colors.black }}>File</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.black }}>Client Info</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.black }}>Processing</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.black }}>Records</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.black }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.black }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow
                    key={file.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: `${colors.primary}05` },
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: colors.primary, mr: 2, width: 36, height: 36 }}>
                          <FileCopy />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: colors.black }}>
                            {file.file_name}
                          </Typography>
                          <Typography variant="caption" color={colors.gray}>
                            {formatFileSize(file.file_size)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: colors.black }}>
                          {file.client_name}
                        </Typography>
                        <Typography variant="caption" color={colors.gray}>
                          {file.company_name} • {file.engagement_id}
                        </Typography>
                        <Typography variant="caption" color={colors.gray} display="block">
                          FY {file.fiscal_year}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getProcessingStatusColor(file.processing_status).icon}
                          <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, color: colors.black }}>
                            {file.processing_status}
                          </Typography>
                        </Box>
                        {file.processing_duration && (
                          <Typography variant="caption" color={colors.gray}>
                            {file.processing_duration.toFixed(2)}s
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.black }}>
                          {file.total_records?.toLocaleString() || 0}
                        </Typography>
                        {file.processed_records > 0 && (
                          <LinearProgress
                            variant="determinate"
                            value={(file.processed_records / file.total_records) * 100}
                            sx={{ 
                              mt: 1, 
                              height: 4, 
                              borderRadius: 2, 
                              bgcolor: `${colors.grayLight}30`,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: colors.primary
                              }
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={file.file_status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(file.file_status).bg,
                          color: getStatusColor(file.file_status).color,
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: getStatusColor(file.file_status).color
                          }
                        }}
                        icon={getStatusColor(file.file_status).icon}
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/expense-sheet-details/${file.id}`)}
                            sx={{ color: colors.primary }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small" sx={{ color: colors.gray }}>
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" sx={{ color: colors.gray }}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="upload"
        onClick={() => setUploadModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: colors.primary,
          '&:hover': { bgcolor: colors.primaryDark },
          boxShadow: `0 4px 16px ${colors.primary}40`
        }}
      >
        <CloudUpload />
      </Fab>

      {/* Upload Modal */}
      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </Box>
  );
}
