import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  HolidayVillage as HolidayIcon
} from '@mui/icons-material';
import axios from 'axios';
import { colorScheme } from '../utils/colorScheme';
import {
  DuplicateAnalysisContent,
  UserAnalysisContent,
  BackdatedAnalysisContent,
  ClosingAnalysisContent,
  UnusualDaysAnalysisContent,
  HolidayAnalysisContent
} from './anomaly';

const anomalyTypes = [
  {
    id: 'duplicate',
    title: 'Duplicate Entries',
    icon: <TrendingUpIcon />,
    description: 'Analysis of duplicate transactions and entries',
    apiEndpoint: '/api/duplicate-analysis/',
    color: '#FF6384'
  },
  {
    id: 'user',
    title: 'User Analysis',
    icon: <PersonIcon />,
    description: 'User behavior and transaction patterns',
    apiEndpoint: '/api/user-analysis/',
    color: '#36A2EB'
  },
  {
    id: 'backdated',
    title: 'Backdated Entries',
    icon: <CalendarIcon />,
    description: 'Transactions posted on dates different from document dates',
    apiEndpoint: '/api/backdated-analysis/',
    color: '#FFCE56'
  },
  {
    id: 'closing',
    title: 'Closing Entries',
    icon: <EventIcon />,
    description: 'Transactions posted on month-end closing dates',
    apiEndpoint: '/api/closing-entries-analysis/',
    color: '#4BC0C0'
  },
  {
    id: 'unusual',
    title: 'Unusual Days',
    icon: <WarningIcon />,
    description: 'Transactions on unusual business days',
    apiEndpoint: '/api/unusual-days-analysis/',
    color: '#9966FF'
  },
  {
    id: 'holidays',
    title: 'Holidays',
    icon: <HolidayIcon />,
    description: 'Transactions posted on holidays',
    apiEndpoint: '/api/holiday-analysis/',
    color: '#FF9F40'
  }
];

export default function AnomalyAnalysisAccordion({ sheetId, anomalySummary, totalAnomalies }) {
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [anomalyData, setAnomalyData] = useState({});
  const [errorStates, setErrorStates] = useState({});

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : null);
    
    if (isExpanded && !anomalyData[panel]) {
      fetchAnomalyData(panel);
    }
  };

  const fetchAnomalyData = async (anomalyType) => {
    const anomalyConfig = anomalyTypes.find(type => type.id === anomalyType);
    if (!anomalyConfig) return;

    setLoadingStates(prev => ({ ...prev, [anomalyType]: true }));
    setErrorStates(prev => ({ ...prev, [anomalyType]: null }));

    try {
      const response = await axios.get(
        `http://localhost:8000${anomalyConfig.apiEndpoint}${sheetId}/`
      );
      
      setAnomalyData(prev => ({ ...prev, [anomalyType]: response.data }));
    } catch (error) {
      console.error(`Error fetching ${anomalyType} data:`, error);
      setErrorStates(prev => ({ 
        ...prev, 
        [anomalyType]: `Failed to load ${anomalyType} analysis data` 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [anomalyType]: false }));
    }
  };

  const renderAnomalyContent = (anomalyType, data) => {
    if (!data) return null;

    // Get distribution data for this anomaly type
    const distributionData = getDistributionDataForAnomalyType(anomalyType, anomalySummary);
    
    const contentProps = { 
      data,
      distributionData,
      anomalySummary,
      sheetId,
      totalAnomalies
    };

    switch (anomalyType) {
      case 'duplicate':
        return <DuplicateAnalysisContent {...contentProps} />;
      case 'user':
        return <UserAnalysisContent {...contentProps} />;
      case 'backdated':
        return <BackdatedAnalysisContent {...contentProps} />;
      case 'closing':
        return <ClosingAnalysisContent {...contentProps} />;
      case 'unusual':
        return <UnusualDaysAnalysisContent {...contentProps} />;
      case 'holidays':
        return <HolidayAnalysisContent {...contentProps} />;
      default:
        return <GenericAnalysisContent {...contentProps} />;
    }
  };

  const getDistributionDataForAnomalyType = (anomalyType, summary) => {
    if (!summary) return null;

    const typeMapping = {
      'duplicate': 'duplicateEntries',
      'user': 'userAnomalies',
      'backdated': 'backdatedEntries',
      'closing': 'closingEntries',
      'unusual': 'unusualDays',
      'holidays': 'holidayEntries'
    };

    const key = typeMapping[anomalyType];
    if (!key) return null;



    return {
      count: summary[key] || 0,
      percentage: summary[`${key}_percentage`] || 0,
      total: summary.totalAnomalies || 0
    };
  };
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: colorScheme.primary }}>
          Anomaly Analysis
        </Typography>
        
        {anomalyTypes.map((anomalyType) => (
          <Accordion
            key={anomalyType.id}
            expanded={expandedAccordion === anomalyType.id}
            onChange={handleAccordionChange(anomalyType.id)}
            sx={{ 
              mb: 2,
              '&:before': { display: 'none' },
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: 2
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: colorScheme.background,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: `${anomalyType.color}10`
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{ 
                  color: anomalyType.color,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {anomalyType.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {anomalyType.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {anomalyType.description}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {anomalySummary && (
                    <>
                      <Box sx={{ 
                        backgroundColor: `${anomalyType.color}20`,
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 'bold',
                          color: anomalyType.color
                        }}>
                          {getDistributionDataForAnomalyType(anomalyType.id, anomalySummary)?.count || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Count
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        backgroundColor: `${anomalyType.color}15`,
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 'bold',
                          color: anomalyType.color
                        }}>
                          {((getDistributionDataForAnomalyType(anomalyType.id, anomalySummary)?.count/totalAnomalies)*100).toFixed(2) || 0}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          of Total
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails sx={{ backgroundColor: 'white' }}>
              {loadingStates[anomalyType.id] ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : errorStates[anomalyType.id] ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorStates[anomalyType.id]}
                </Alert>
              ) : (
                renderAnomalyContent(anomalyType.id, anomalyData[anomalyType.id])
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </CardContent>
    </Card>
  );
}

// Generic fallback component
function GenericAnalysisContent({ data }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {JSON.stringify(data, null, 2)}
      </Typography>
    </Box>
  );
} 