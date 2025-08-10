import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
  Skeleton,
  Alert,
  AlertTitle,
  Collapse,
  Fade,
  Grow,
  Slide,
  Zoom,
  Fab,
  CardActions,
  CardMedia,
  CardHeader,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  MobileStepper,
  Breadcrumbs,
  Link,
  Divider as MuiDivider,
  ListItemButton,
  ListItemAvatar,
  ListSubheader,
  ListItemSecondaryAction,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelActions,
  StepConnector,
  StepIcon,
  StepLabel as MuiStepLabel,
  StepContent as MuiStepContent,
  MobileStepper as MuiMobileStepper,
  Breadcrumbs as MuiBreadcrumbs,
  Link as MuiLink,
  Divider as MuiDivider2,
  ListItemButton as MuiListItemButton,
  ListItemAvatar as MuiListItemAvatar,
  ListSubheader as MuiListSubheader,
  ListItemSecondaryAction as MuiListItemSecondaryAction,
  ExpansionPanel as MuiExpansionPanel,
  ExpansionPanelSummary as MuiExpansionPanelSummary,
  ExpansionPanelDetails as MuiExpansionPanelDetails,
  ExpansionPanelActions as MuiExpansionPanelActions
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Info,
  Download,
  Print,
  Share,
  FilterList,
  Search,
  Sort,
  Visibility,
  Edit,
  Delete,
  Refresh,
  Add,
  Remove,
  ExpandMore,
  ExpandLess,
  ArrowUpward,
  ArrowDownward,
  AccountBalance,
  AttachMoney,
  Assessment,
  Security,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  TableChart,
  Dashboard,
  Receipt,
  AccountCircle,
  Business,
  DateRange,
  Category,
  LocalOffer,
  Flag,
  PriorityHigh,
  LowPriority,
  Block,
  Check,
  Close,
  MoreVert,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  FirstPage,
  LastPage,
  NavigateNext,
  NavigateBefore,
  Schedule,
  Update,
  History,
  Restore,
  Undo,
  Redo,
  RotateLeft,
  RotateRight,
  Autorenew,
  Loop,
  Sync,
  SyncAlt,
  Transform,
  Transform3d,
  ViewInAr,
  ViewModule,
  ViewList,
  ViewComfy,
  ViewCompact,
  ViewHeadline,
  ViewQuilt,
  ViewStream,
  ViewWeek,
  ViewDay,
  ViewAgenda,
  ViewCarousel,
  ViewColumn,
  ViewArray,
  ViewTimeline,
  ViewKanban,
  ViewSidebar,
  ViewComfyAlt,
  ViewCompactAlt,
  ViewHeadlineAlt,
  ViewQuiltAlt,
  ViewStreamAlt,
  ViewWeekAlt,
  ViewDayAlt,
  ViewAgendaAlt,
  ViewCarouselAlt,
  ViewColumnAlt,
  ViewArrayAlt,
  ViewTimelineAlt,
  ViewKanbanAlt,
  ViewSidebarAlt,
  ViewComfyAlt2,
  ViewCompactAlt2,
  ViewHeadlineAlt2,
  ViewQuiltAlt2,
  ViewStreamAlt2,
  ViewWeekAlt2,
  ViewDayAlt2,
  ViewAgendaAlt2,
  ViewCarouselAlt2,
  ViewColumnAlt2,
  ViewArrayAlt2,
  ViewTimelineAlt2,
  ViewKanbanAlt2,
  ViewSidebarAlt2
} from '@mui/icons-material';
import { colorScheme, getRiskColor, formatCurrency } from '../../utils/colorScheme';

export default function SummaryInsightsChart({ sheetData, analysisSummary }) {
  if (!sheetData || !analysisSummary) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Summary Insights</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const {
    total_expenses,
    total_amount,
    sheet_date,
    display_name
  } = sheetData;

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const formatPercentage = (value) => {
    return `${value?.toFixed(1)}%`;
  };

  // Calculate anomaly percentages from anomalies_detected
  const anomalies = analysisSummary.anomalies_detected || {};
  const totalFlagged = analysisSummary.total_flagged_expenses || 0;
  
  const amountAnomalyPercentage = totalFlagged > 0 ? (anomalies.amount_anomalies / totalFlagged) * 100 : 0;
  const timingAnomalyPercentage = totalFlagged > 0 ? (anomalies.timing_anomalies / totalFlagged) * 100 : 0;
  const vendorAnomalyPercentage = totalFlagged > 0 ? (anomalies.vendor_anomalies / totalFlagged) * 100 : 0;
  const employeeAnomalyPercentage = totalFlagged > 0 ? (anomalies.employee_anomalies / totalFlagged) * 100 : 0;

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>
          Comprehensive Analysis Summary
        </Typography>

        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: colorScheme.primary, fontWeight: 'bold' }}>
                Financial Overview
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Total Expenses:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {total_expenses.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {formatCurrency(total_amount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Average per Expense:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(total_amount / total_expenses)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Analysis Date:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {new Date(sheet_date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Risk Analysis */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: colorScheme.primary, fontWeight: 'bold' }}>
                Risk Assessment
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Overall Risk Score:</Typography>
                  <Chip 
                    label={formatPercentage(analysisSummary.overall_fraud_score)}
                    size="small"
                    sx={{ 
                      backgroundColor: getRiskColor(getRiskLevel(analysisSummary.overall_fraud_score)),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Risk Level:</Typography>
                  <Chip 
                    label={getRiskLevel(analysisSummary.overall_fraud_score)}
                    size="small"
                    sx={{ 
                      backgroundColor: getRiskColor(getRiskLevel(analysisSummary.overall_fraud_score)),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Flagged Expenses:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {analysisSummary.total_flagged_expenses || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Flag Rate:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatPercentage(analysisSummary.flag_rate)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Detailed Analysis */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: colorScheme.primary, fontWeight: 'bold' }}>
            Anomaly Detection Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Amount Anomalies
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[0] }}>
                  {formatPercentage(amountAnomalyPercentage)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Timing Anomalies
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[1] }}>
                  {formatPercentage(timingAnomalyPercentage)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Vendor Anomalies
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[2] }}>
                  {formatPercentage(vendorAnomalyPercentage)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Employee Anomalies
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[3] }}>
                  {formatPercentage(employeeAnomalyPercentage)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Recommendations */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Key Recommendations:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {analysisSummary.overall_fraud_score > 60 && (
              <Typography variant="caption" color="text.secondary">
                • High risk detected - Immediate review of flagged expenses recommended
              </Typography>
            )}
            {amountAnomalyPercentage > 50 && (
              <Typography variant="caption" color="text.secondary">
                • Significant amount anomalies detected - Review expense amounts
              </Typography>
            )}
            {vendorAnomalyPercentage > 50 && (
              <Typography variant="caption" color="text.secondary">
                • High vendor anomaly rate - Verify vendor relationships
              </Typography>
            )}
            {analysisSummary.overall_fraud_score <= 20 && (
              <Typography variant="caption" color="text.secondary">
                • Low risk profile - Continue monitoring for changes
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 