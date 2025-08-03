import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { colorScheme, getRiskColor } from '../utils/colorScheme';

const RiskLevelChip = ({ level, score }) => {
  const getColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return '#d32f2f';
      case 'HIGH':
        return '#f57c00';
      case 'MEDIUM':
        return '#f57c00';
      case 'LOW':
        return '#388e3c';
      default:
        return '#925A9B';
    }
  };

  return (
    <Chip
      label={`${level} (${score})`}
      sx={{
        backgroundColor: getColor(level),
        color: 'white',
        fontWeight: 600,
        fontSize: '0.75rem',
        px: 1,
        py: 0.2
      }}
      size="small"
    />
  );
};

const PriorityChip = ({ priority }) => {
  const getColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return '#d32f2f';
      case 'HIGH':
        return '#f57c00';
      case 'MEDIUM':
        return '#f57c00';
      case 'LOW':
        return '#388e3c';
      default:
        return '#925A9B';
    }
  };

  return (
    <Chip
      label={priority}
      sx={{
        backgroundColor: getColor(priority),
        color: 'white',
        fontWeight: 600,
        fontSize: '0.75rem'
      }}
      size="small"
    />
  );
};

const RiskGauge = ({ value, maxValue, riskLevel, color }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ color: colorScheme.textSecondary, fontSize: '0.875rem' }}>
          Overall Risk Score
        </Typography>
        <Typography variant="body1" sx={{ color: colorScheme.textPrimary, fontWeight: 600, fontSize: '0.9rem' }}>
          {value}/{maxValue}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#f0f0f0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 4,
          }
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" sx={{ color: colorScheme.textSecondary, fontSize: '0.7rem' }}>
          0
        </Typography>
        <Typography variant="caption" sx={{ color: colorScheme.textSecondary, fontSize: '0.7rem' }}>
          {maxValue}
        </Typography>
      </Box>
    </Box>
  );
};

export default function DetailedRiskAnalysis({ riskAnalysis }) {
  if (!riskAnalysis) {
    return (
      <Alert severity="info">
        No detailed risk analysis data available.
      </Alert>
    );
  }

  const {
    methodology,
    risk_factors,
    scoring_criteria,
    risk_calculations,
    risk_distributions,
    recommendations,
    audit_implications,
    overall_risk_gauge
  } = riskAnalysis;
console.log("riskAnalysis", riskAnalysis);
  return (
    <Card sx={{ 
      mb: 4, 
      background: 'white',
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e9ecef'
    }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <SecurityIcon sx={{ 
            color: colorScheme.primary, 
            fontSize: 32, 
            mr: 2 
          }} />
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: colorScheme.textPrimary,
            fontSize: '1.75rem'
          }}>
            Detailed Risk Analysis
          </Typography>
        </Box>
        
        <Typography variant="body1" sx={{ 
          color: colorScheme.textSecondary, 
          mb: 4,
          fontSize: '1rem'
        }}>
          Comprehensive risk assessment using advanced algorithms and statistical methods to identify potential anomalies, fraud indicators, and compliance risks.
        </Typography>

        {/* Summary Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item size={{xs: 12, md: 4}}>
            <Box sx={{ textAlign: 'center', p: 3, background: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: colorScheme.textPrimary,
                mb: 1
              }}>
                {methodology?.total_transactions_analyzed || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                Transactions Analyzed
              </Typography>
            </Box>
          </Grid>
          <Grid item size={{xs: 12, md: 4}}>
            <Box sx={{ textAlign: 'center', p: 3, background: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: colorScheme.textPrimary,
                mb: 1
              }}>
                {methodology?.version || '1.0.0'}
              </Typography>
              <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                Analysis Version
              </Typography>
            </Box>
          </Grid>
          <Grid item size={{xs: 12, md: 4}}>
            <Box sx={{ textAlign: 'center', p: 3, background: '#f8f9fa', borderRadius: 2 }}>
              <RiskLevelChip 
                level={overall_risk_gauge?.risk_level || 'LOW'} 
                score={overall_risk_gauge?.value || 0} 
              />
              <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mt: 1 }}>
                Overall Risk Level
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Overall Risk Gauge */}
        <Box sx={{ mb: 4, p: 3, background: '#f8f9fa', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AssessmentIcon sx={{ 
              color: colorScheme.primary, 
              fontSize: 24, 
              mr: 1.5 
            }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: colorScheme.textPrimary,
              fontSize: '1.2rem'
            }}>
              Overall Risk Assessment
            </Typography>
          </Box>
          
          <RiskGauge
            value={overall_risk_gauge?.value || 0}
            maxValue={overall_risk_gauge?.max_value || 100}
            riskLevel={overall_risk_gauge?.risk_level}
            color={overall_risk_gauge?.color || colorScheme.primary}
          />
          
          {overall_risk_gauge?.definition && (
            <Box sx={{ mt: 3, p: 2, background: 'white', borderRadius: 2, border: '1px solid #e9ecef' }}>
              <Typography variant="subtitle1" sx={{ 
                color: colorScheme.textPrimary, 
                fontWeight: 600,
                mb: 1
              }}>
                {overall_risk_gauge.definition.title}
              </Typography>
              <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                {overall_risk_gauge.definition.description}
              </Typography>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Risk Factors */}
          <Grid item size={{xs: 12, md: 6}}>
            <Box sx={{ p: 3, background: '#f8f9fa', borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUpIcon sx={{ 
                  color: colorScheme.primary, 
                  fontSize: 20, 
                  mr: 1.5 
                }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: colorScheme.textPrimary,
                  fontSize: '1.1rem'
                }}>
                  Risk Factors Analysis
                </Typography>
              </Box>
              
              <List dense sx={{ p: 0 }}>
                {Object.entries(risk_factors || {}).map(([key, factor]) => (
                  <ListItem key={key} sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ 
                            color: colorScheme.textPrimary, 
                            fontWeight: 500,
                            textTransform: 'capitalize'
                          }}>
                            {key.replace(/_/g, ' ')}
                          </Typography>
                          <Chip
                            label={`${factor.count} (${factor.percentage?.toFixed(1)}%)`}
                            size="small"
                            sx={{
                              backgroundColor: factor.count > 0 ? '#d32f2f' : '#388e3c',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.75rem'
                        }}>
                          {factor.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          {/* Risk Distribution */}
          <Grid item size={{xs: 12, md: 6}}>
            <Box sx={{ p: 3, background: '#f8f9fa', borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimelineIcon sx={{ 
                  color: colorScheme.primary, 
                  fontSize: 20, 
                  mr: 1.5 
                }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: colorScheme.textPrimary,
                  fontSize: '1.1rem'
                }}>
                  Risk Distribution
                </Typography>
              </Box>
              
              <List dense sx={{ p: 0 }}>
                {Object.entries(risk_distributions || {}).map(([key, count]) => (
                  <ListItem key={key} sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ 
                            color: colorScheme.textPrimary, 
                            fontWeight: 500,
                            textTransform: 'capitalize'
                          }}>
                            {key.replace(/_/g, ' ')}
                          </Typography>
                          <Chip
                            label={count}
                            size="small"
                            sx={{
                              backgroundColor: count > 0 ? '#d32f2f' : '#388e3c',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          {/* Recommendations */}
          <Grid item size={{xs: 12}}>
            <Box sx={{ p: 3, background: '#f8f9fa', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AnalyticsIcon sx={{ 
                  color: colorScheme.primary, 
                  fontSize: 20, 
                  mr: 1.5 
                }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: colorScheme.textPrimary,
                  fontSize: '1.1rem'
                }}>
                  Recommendations & Actions Required
                </Typography>
              </Box>
              
              <List>
                {recommendations?.map((rec, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 2 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body1" sx={{ 
                            color: colorScheme.textPrimary, 
                            fontWeight: 600,
                            fontSize: '1rem'
                          }}>
                            {rec.action}
                          </Typography>
                          <PriorityChip priority={rec.priority} />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ 
                            color: colorScheme.textSecondary,
                            mb: 1
                          }}>
                            {rec.description}
                          </Typography>
                          {rec.count && (
                            <Typography variant="caption" sx={{ 
                              color: colorScheme.textSecondary,
                              fontSize: '0.75rem'
                            }}>
                              Affected items: {rec.count}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          {/* Audit Implications */}
          <Grid item size={{xs: 12}}>
            <Accordion sx={{ 
              borderRadius: 2,
              boxShadow: 'none',
              background: '#f8f9fa',
              '&:before': { display: 'none' }
            }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: colorScheme.primary }} />}
                sx={{ 
                  background: 'white',
                  borderRadius: 2,
                  color: colorScheme.textPrimary
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ mr: 2, color: colorScheme.primary }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colorScheme.textPrimary }}>
                    Audit Implications & Compliance Considerations
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item size={{xs: 12, md: 4}}>
                    <Box sx={{ p: 3, background: 'white', borderRadius: 2, border: '1px solid #ffcdd2' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ 
                        color: '#d32f2f', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <ErrorIcon sx={{ mr: 1, color: '#d32f2f' }} />
                        Immediate Actions
                      </Typography>
                      <List dense>
                        {audit_implications?.immediate_actions?.map((action, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemText 
                              primary={action}
                              sx={{ 
                                '& .MuiListItemText-primary': {
                                  fontSize: '0.875rem',
                                  color: colorScheme.textPrimary
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Grid>
                  
                  <Grid item size={{xs: 12, md: 4}}>
                    <Box sx={{ p: 3, background: 'white', borderRadius: 2, border: '1px solid #ffe0b2' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ 
                        color: '#f57c00', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <WarningIcon sx={{ mr: 1, color: '#f57c00' }} />
                        Follow-up Actions
                      </Typography>
                      <List dense>
                        {audit_implications?.follow_up_actions?.map((action, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemText 
                              primary={action}
                              sx={{ 
                                '& .MuiListItemText-primary': {
                                  fontSize: '0.875rem',
                                  color: colorScheme.textPrimary
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Grid>
                  
                  <Grid item size={{xs: 12, md: 4}}>
                    <Box sx={{ p: 3, background: 'white', borderRadius: 2, border: '1px solid #c8e6c9' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ 
                        color: '#388e3c', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <CheckCircleIcon sx={{ mr: 1, color: '#388e3c' }} />
                        Compliance Considerations
                      </Typography>
                      <List dense>
                        {audit_implications?.compliance_considerations?.map((consideration, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemText 
                              primary={consideration}
                              sx={{ 
                                '& .MuiListItemText-primary': {
                                  fontSize: '0.875rem',
                                  color: colorScheme.textPrimary
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Business Impact */}
          {overall_risk_gauge?.business_impact && (
            <Grid item size={{xs: 12}}>
              <Box sx={{ p: 3, background: '#f8f9fa', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <BusinessIcon sx={{ 
                    color: colorScheme.primary, 
                    fontSize: 20, 
                    mr: 1.5 
                  }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: colorScheme.textPrimary,
                    fontSize: '1.1rem'
                  }}>
                    Business Impact Assessment
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  {Object.entries(overall_risk_gauge.business_impact).map(([key, impact]) => (
                    <Grid item size={{xs: 12, sm: 6, md: 3}} key={key}>
                      <Box sx={{ 
                        p: 3, 
                        background: 'white', 
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        textAlign: 'center'
                      }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ 
                          color: colorScheme.textPrimary,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          mb: 2
                        }}>
                          {key.replace('_', ' ')}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.875rem'
                        }}>
                          {impact}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
} 