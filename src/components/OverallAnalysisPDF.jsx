import React, { useRef } from "react";
import { Button, Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import logoFull from "../assets/full_logo.svg";
import "./anomaly/pdf.scss";

// Import chart components for PDF
import RiskDistributionChart from "./charts/RiskDistributionChart";
import AnomaliesDistributionChart from "./charts/AnomaliesDistributionChart";
import EmployeeExpensesChart from "./charts/EmployeeExpensesChart";
import CategoryExpensesChart from "./charts/CategoryExpensesChart";
import DepartmentExpensesChart from "./charts/DepartmentExpensesChart";

const RiskValue = {
  1: "Low",
  2: "Medium", 
  3: "High",
  4: "Critical",
};

const RiskColor = {
  1: "#40b159",
  2: "#ffc516", 
  3: "#dc3545",
  4: "#ff0000",
};

// PDF Chart Wrapper Component with Error Boundary
const PDFChartWrapper = ({ title, children, fallbackContent }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, []);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className='chart-section'>
      <div className='chart-content'>
        {!hasError ? (
          <React.Suspense fallback={<div>Loading chart...</div>}>
            <ErrorBoundary onError={handleError} fallback={fallbackContent}>
              {children}
            </ErrorBoundary>
          </React.Suspense>
        ) : (
          fallbackContent
        )}
      </div>
    </div>
  );
};

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart rendering error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Chart failed to load</div>;
    }
    return this.props.children;
  }
}

// Fallback Chart Content
const FallbackChartContent = ({ title, data, currency = 'SAR' }) => {
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    if (num >= 1000000000000) {
      return `${(num / 1000000000000).toFixed(1)}T ${currency}`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M ${currency}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K ${currency}`;
    } else {
      return `${num.toFixed(0)} ${currency}`;
    }
  };

  const renderSimpleChart = () => {
    if (!data || typeof data !== 'object') {
      return <div>No data available</div>;
    }

    const entries = Object.entries(data).slice(0, 5);
    if (entries.length === 0) {
      return <div>No data available</div>;
    }

    const maxValue = Math.max(...entries.map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return value.count || value.amount || value.groups || 0;
      }
      return typeof value === 'number' ? value : 0;
    }));

    return (
      <div style={{ width: '100%', padding: '10px' }}>
        {entries.map(([key, value], index) => {
          const numericValue = typeof value === 'object' && value !== null 
            ? (value.count || value.amount || value.groups || 0)
            : (typeof value === 'number' ? value : 0);
          
          const percentage = maxValue > 0 ? (numericValue / maxValue) * 100 : 0;
          
          return (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '2px',
                fontSize: '11px'
              }}>
                <span style={{ fontWeight: 'bold' }}>{key}</span>
                <span>{formatCurrency(numericValue)}</span>
              </div>
              <div style={{
                width: '100%',
                height: '12px',
                backgroundColor: '#f0f0f0',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: '#925a9b',
                  borderRadius: '6px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '15px', 
      textAlign: 'center', 
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#925a9b' }}>
        {title}
      </div>
      <div style={{ fontSize: '11px', marginBottom: '10px', color: '#666' }}>
        Interactive chart not available in PDF
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {renderSimpleChart()}
      </div>
    </div>
  );
};

const OverallAnalysisPDF = ({
  open,
  setOpen,
  data,
  fileId,
  comprehensiveStats,
  anomalyData,
  glAccountsData,
  glAccountsSummary,
  chartsData,
  glChartsData,
  fileInfo,
  overallRiskScore,
  riskLevel,
  anomalyRate,
  currency = 'SAR'
}) => {
  const printRef = useRef();

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    
    if (num >= 1000000000000) {
      return `${(num / 1000000000000).toFixed(1)}T ${currency}`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M ${currency}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K ${currency}`;
    } else {
      return `${num.toFixed(0)} ${currency}`;
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  const currentDateTime = getCurrentDateTime();

  const getRiskLevelNumber = (score) => {
    if (score >= 80) return 4;
    if (score >= 60) return 3;
    if (score >= 40) return 2;
    return 1;
  };

  const riskLevelNumber = getRiskLevelNumber(overallRiskScore);

  const handlePrint = () => {
    var htmlToPrint =
      "" +
      '<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">' +
      '<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />' +
      '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet">' +
      '<style type="text/css">' +
      "* { margin: 0; padding: 0; outline: none!important; font-family: Barlow, sans-serif; }" +
      "html, body { font-family: Barlow, sans-serif; line-height:1 !important; background:#FFF !important; }" +
      "#printPDF{margin:0 auto;width:100%;background:#f2f5ff;color:#333;}" +
      "header h2, header h3 { margin: 15px 0; text-align: left!important; }" +
      ".sections tr th { background: #EEE; color: #333; -webkit-print-color-adjust: exact; print-color-adjust: exact; }" +
      ".sections tr td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }" +
      ".sections h3 { font-weight: bold; padding: 15px 0; text-align: left!important; }" +
      ".sections table tr td { padding: 5px 5px 5px 0; line-height: 20px; color: #333; }" +
      ".sections table.border tr td, .sections table.border tr th { border: 1px solid #EEE; padding: 5px; }" +
      "strong { -webkit-print-color-adjust: exact; print-color-adjust: exact; }" +
      ".bg-light { background: #f2f5ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }" +
      "@media print { @page {margin: 0.7in; } }" +
      "@media print { .content-section { page-break-after: always;} }" +
      "@media print { .time-date { display: none; } }" +
      ".chart-container { page-break-inside: avoid; margin: 20px 0; }" +
      ".chart-section { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 15px 0; background: white; page-break-inside: avoid; }" +
      ".chart-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; }" +
      ".chart-content { min-height: 200px; display: flex; align-items: center; justify-content: center; }" +
      ".professional-header { page-break-inside: avoid; margin-bottom: 30px; }" +
      ".header-banner { background: linear-gradient(135deg, #925a9b 0%, #7a4a82 100%) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }" +
      ".header-stats { page-break-inside: avoid; margin-bottom: 25px; }" +
      ".stat-card { background: white !important; border: 1px solid #e9ecef !important; border-radius: 10px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }" +
      "</style>";

    var divToPrint = document.getElementById("OverallAnalysisPDF");
    htmlToPrint += divToPrint.outerHTML;

    let newWin = window.open("", "_blank");
    newWin.document.write(htmlToPrint);
    newWin.document.title = `${fileInfo?.companyName || 'Company'} - Overall Analysis Report`;
    setTimeout(() => {
      newWin.focus();
      newWin.print();
      newWin.close();
    }, 1000);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className='pdf-dialog'
      fullWidth
      maxWidth='lg'>
      <div>
        <div style={{
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
        }}>
          <Button
            variant='contained'
            style={{
              padding: "10px 20px",
              boxShadow: "none",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
            onClick={handlePrint}>
            Download PDF
          </Button>
          <CloseIcon
            fontSize='large'
            onClick={() => setOpen(false)}
            style={{ cursor: "pointer" }}
          />
        </div>
        <hr style={{ margin: 0 }} />
        <div
          className='modal fade'
          data-bs-backdrop='static'
          data-bs-keyboard='false'
          tabIndex='-1'
          aria-hidden='true'
          ref={printRef}
          style={{ padding: "20px 10px" }}>
          <div className='modal-dialog modal-xl modal-dialog-centered'>
            <div id='OverallAnalysisPDF' className='modal-content'>
              <div className='modal-body bg-white text-dark'>
                <div style={{ padding: "20px" }}>
                  <div className='content-section'>
                    <div className='sections'>
                      <table width='100%' style={{ borderBottom: "4px solid #925a9b" }}>
                        <tbody>
                          <tr>
                            <td align='left' style={{ verticalAlign: "top", width: "33%" }}>
                              <h2 style={{ fontWeight: "bold" }}>Overall Analysis Report</h2>
                              <b>File ID:</b> {fileInfo?.fileName || fileInfo?.file_id || "N/A"}
                              <br />
                              <b>Status:</b> {fileInfo?.status || "COMPLETED"}
                              <br />
                              <b>Currency:</b> {currency}
                            </td>
                            <td align='center' style={{ verticalAlign: "center", width: "33%" }}>
                              <a href='javascript:;'>
                                <img src={logoFull} width={200} />
                              </a>
                            </td>
                            <td align='right' style={{ verticalAlign: "bottom", width: "33%" }}>
                              Generated on {currentDateTime}
                              <br />
                              Analysis Date: {formatDate(fileInfo?.uploadedAt)}
                              <br />
                              <b>Risk Level:</b> {riskLevel}
                              <br />
                              <p style={{ maxWidth: "90%" }}>
                                Total Transactions: {comprehensiveStats?.totalTransactions || 0}
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Executive Summary */}
                    <div className='sections'>
                      <h5 style={{ margin: "20px 0 10px 0" }}>Executive Summary</h5>
                      <div style={{ 
                        padding: "15px", 
                        backgroundColor: overallRiskScore >= 60 ? "#fff3cd" : "#d4edda", 
                        border: `1px solid ${overallRiskScore >= 60 ? "#ffeaa7" : "#c3e6cb"}`, 
                        borderRadius: "8px",
                        marginBottom: "20px"
                      }}>
                        <div style={{ 
                          fontWeight: "bold", 
                          color: overallRiskScore >= 60 ? "#856404" : "#155724",
                          fontSize: "14px",
                          marginBottom: "5px"
                        }}>
                          {overallRiskScore >= 60 
                            ? `High Risk Analysis - ${anomalyData?.totalAnomalies || 0} anomalies detected`
                            : "Low Risk Analysis - Minimal anomalies detected"
                          }
                        </div>
                        <div style={{ 
                          color: overallRiskScore >= 60 ? "#856404" : "#155724",
                          fontSize: "12px"
                        }}>
                          Overall Risk Score: {overallRiskScore}% | Anomaly Rate: {anomalyRate}%
                        </div>
                      </div>
                    </div>

                    {/* Key Statistics */}
                    <div className='sections'>
                      <h5 style={{ margin: "20px 0" }}>Key Statistics Overview</h5>
                      <table width='100%' style={{ height: "100%" }} className='border' cellSpacing='5'>
                        <tbody>
                          <tr style={{ display: "flex", alignItems: "stretch" }}>
                            <td style={{ width: "25%" }}>
                              <strong style={{ display: "block", padding: "10px", background: "#EEE" }}>
                                Overall Risk Assessment
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <span style={{ display: "block" }}>
                                  Risk Score
                                  <br />
                                  <b style={{ color: RiskColor[riskLevelNumber], fontSize: "18px" }}>
                                    {overallRiskScore}%
                                  </b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Risk Level
                                  <br />
                                  <b style={{ color: RiskColor[riskLevelNumber] }}>
                                    {riskLevel}
                                  </b>
                                </span>
                              </div>
                            </td>

                            <td style={{ width: "25%" }}>
                              <strong style={{ display: "block", padding: "10px", background: "#EEE" }}>
                                Transaction Statistics
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <b style={{ display: "block" }}>Total Transactions</b>
                                {comprehensiveStats?.totalTransactions || 0}
                                <br />
                                <b style={{ display: "block" }}>Total Amount</b>
                                {formatCurrency(comprehensiveStats?.totalAmount || 0)}
                                <br />
                                <b style={{ display: "block" }}>Average Amount</b>
                                {formatCurrency(comprehensiveStats?.avgAmount || 0)}
                              </div>
                            </td>

                            <td style={{ width: "25%" }}>
                              <strong style={{ display: "block", padding: "10px", background: "#EEE" }}>
                                Anomaly Statistics
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <b style={{ display: "block" }}>Total Anomalies</b>
                                {anomalyData?.totalAnomalies || 0}
                                <br />
                                <b style={{ display: "block" }}>Anomaly Rate</b>
                                {anomalyRate}%
                                <br />
                                <b style={{ display: "block" }}>Flagged Transactions</b>
                                {comprehensiveStats?.flaggedTransactions || 0}
                              </div>
                            </td>

                            <td style={{ width: "25%" }}>
                              <strong style={{ display: "block", padding: "10px", background: "#EEE" }}>
                                User & Account Stats
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <b style={{ display: "block" }}>Unique Users</b>
                                {comprehensiveStats?.uniqueUsers || 0}
                                <br />
                                <b style={{ display: "block" }}>Unique Accounts</b>
                                {comprehensiveStats?.uniqueAccounts || 0}
                                <br />
                                <b style={{ display: "block" }}>High Risk Users</b>
                                {anomalyData?.highRiskUsers || 0}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                                         {/* Anomaly Breakdown */}
                     <div className='sections'>
                       <h5 style={{ margin: "20px 0" }}>Anomaly Analysis Breakdown</h5>
                       <table width='100%' border='1' className='border' cellSpacing='0'>
                         <thead>
                           <tr>
                             <th>Anomaly Type</th>
                             <th>Count</th>
                             <th>Risk Level</th>
                             <th>Description</th>
                           </tr>
                         </thead>
                         <tbody style={{ textAlign: "center" }}>
                           <tr>
                             <td>Duplicate Entries</td>
                             <td>{anomalyData?.duplicateEntries || 0}</td>
                             <td>{anomalyData?.duplicateEntries > 10 ? 'HIGH' : anomalyData?.duplicateEntries > 5 ? 'MEDIUM' : 'LOW'}</td>
                             <td>Identical transactions detected</td>
                           </tr>
                           <tr>
                             <td>User Anomalies</td>
                             <td>{anomalyData?.userAnomalies || 0}</td>
                             <td>{anomalyData?.userAnomalies > 15 ? 'HIGH' : anomalyData?.userAnomalies > 8 ? 'MEDIUM' : 'LOW'}</td>
                             <td>Suspicious user behavior patterns</td>
                           </tr>
                           <tr>
                             <td>Backdated Entries</td>
                             <td>{anomalyData?.backdatedEntries || 0}</td>
                             <td>{anomalyData?.backdatedEntries > 5 ? 'HIGH' : anomalyData?.backdatedEntries > 2 ? 'MEDIUM' : 'LOW'}</td>
                             <td>Transactions posted on past dates</td>
                           </tr>
                           <tr>
                             <td>Closing Entries</td>
                             <td>{anomalyData?.closingEntries || 0}</td>
                             <td>{anomalyData?.closingEntries > 20 ? 'HIGH' : anomalyData?.closingEntries > 10 ? 'MEDIUM' : 'LOW'}</td>
                             <td>Period-end closing transactions</td>
                           </tr>
                           <tr>
                             <td>Unusual Days</td>
                             <td>{anomalyData?.unusualDays || 0}</td>
                             <td>{anomalyData?.unusualDays > 15 ? 'HIGH' : anomalyData?.unusualDays > 8 ? 'MEDIUM' : 'LOW'}</td>
                             <td>Weekend/holiday transactions</td>
                           </tr>
                           <tr>
                             <td>Holiday Entries</td>
                             <td>{anomalyData?.holidayEntries || 0}</td>
                             <td>{anomalyData?.holidayEntries > 5 ? 'HIGH' : anomalyData?.holidayEntries > 2 ? 'MEDIUM' : 'LOW'}</td>
                             <td>Transactions on holidays</td>
                           </tr>
                         </tbody>
                       </table>
                     </div>

                     {/* Detailed Anomaly Analysis */}
                     <div className='sections'>
                       <h5 style={{ margin: "20px 0" }}>Detailed Anomaly Analysis</h5>
                       
                       {/* Anomaly Summary Statistics */}
                       <div style={{ 
                         padding: "15px", 
                         backgroundColor: "#f8f9fa", 
                         border: "1px solid #e9ecef", 
                         borderRadius: "8px",
                         marginBottom: "20px"
                       }}>
                         <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                           Anomaly Analysis Summary
                         </h6>
                         <div style={{ 
                           display: "grid", 
                           gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                           gap: "15px",
                           fontSize: "12px"
                         }}>
                           <div style={{ 
                             padding: "10px", 
                             backgroundColor: "white", 
                             border: "1px solid #dee2e6", 
                             borderRadius: "6px",
                             textAlign: "center"
                           }}>
                             <strong style={{ color: "#925a9b" }}>Total Anomalies</strong><br/>
                             {anomalyData?.totalAnomalies || 0}
                           </div>
                           <div style={{ 
                             padding: "10px", 
                             backgroundColor: "white", 
                             border: "1px solid #dee2e6", 
                             borderRadius: "6px",
                             textAlign: "center"
                           }}>
                             <strong style={{ color: "#925a9b" }}>Anomaly Rate</strong><br/>
                             {anomalyRate}%
                           </div>
                           <div style={{ 
                             padding: "10px", 
                             backgroundColor: "white", 
                             border: "1px solid #dee2e6", 
                             borderRadius: "6px",
                             textAlign: "center"
                           }}>
                             <strong style={{ color: "#925a9b" }}>High Risk Types</strong><br/>
                             {(() => {
                               const highRiskCount = [
                                 anomalyData?.duplicateEntries > 10 ? 1 : 0,
                                 anomalyData?.userAnomalies > 15 ? 1 : 0,
                                 anomalyData?.backdatedEntries > 5 ? 1 : 0,
                                 anomalyData?.closingEntries > 20 ? 1 : 0,
                                 anomalyData?.unusualDays > 15 ? 1 : 0,
                                 anomalyData?.holidayEntries > 5 ? 1 : 0
                               ].reduce((sum, val) => sum + val, 0);
                               return highRiskCount;
                             })()}
                           </div>
                           <div style={{ 
                             padding: "10px", 
                             backgroundColor: "white", 
                             border: "1px solid #dee2e6", 
                             borderRadius: "6px",
                             textAlign: "center"
                           }}>
                             <strong style={{ color: "#925a9b" }}>High Risk Users</strong><br/>
                             {anomalyData?.highRiskUsers || 0}
                           </div>
                         </div>
                       </div>

                       {/* Anomaly Patterns & Insights */}
                       <div style={{ 
                         padding: "15px", 
                         backgroundColor: "#fff3cd", 
                         border: "1px solid #ffeaa7", 
                         borderRadius: "8px",
                         marginBottom: "20px"
                       }}>
                         <h6 style={{ margin: "10px 0", color: "#856404", fontWeight: "bold" }}>
                           🔍 Anomaly Patterns & Insights
                         </h6>
                         <div style={{ 
                           display: "grid", 
                           gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                           gap: "15px"
                         }}>
                           <div style={{ 
                             padding: "10px", 
                             backgroundColor: "white", 
                             border: "1px solid #ffeaa7", 
                             borderRadius: "6px"
                           }}>
                             <strong style={{ color: "#856404" }}>Most Common Anomaly Type:</strong><br/>
                             {(() => {
                               const types = [
                                 { name: 'Closing Entries', count: anomalyData?.closingEntries || 0 },
                                 { name: 'Unusual Days', count: anomalyData?.unusualDays || 0 },
                                 { name: 'User Anomalies', count: anomalyData?.userAnomalies || 0 },
                                 { name: 'Duplicate Entries', count: anomalyData?.duplicateEntries || 0 },
                                 { name: 'Backdated Entries', count: anomalyData?.backdatedEntries || 0 },
                                 { name: 'Holiday Entries', count: anomalyData?.holidayEntries || 0 }
                               ];
                               const maxType = types.reduce((max, type) => type.count > max.count ? type : max, types[0]);
                               return maxType.name;
                             })()}
                           </div>
                           <div style={{ 
                             padding: "10px", 
                             backgroundColor: "white", 
                             border: "1px solid #ffeaa7", 
                             borderRadius: "6px"
                           }}>
                             <strong style={{ color: "#856404" }}>Overall Risk Assessment:</strong><br/>
                             {(() => {
                               const highRiskCount = [
                                 anomalyData?.duplicateEntries > 10 ? 1 : 0,
                                 anomalyData?.userAnomalies > 15 ? 1 : 0,
                                 anomalyData?.backdatedEntries > 5 ? 1 : 0,
                                 anomalyData?.closingEntries > 20 ? 1 : 0,
                                 anomalyData?.unusualDays > 15 ? 1 : 0,
                                 anomalyData?.holidayEntries > 5 ? 1 : 0
                               ].reduce((sum, val) => sum + val, 0);
                               
                               if (highRiskCount >= 4) return 'CRITICAL';
                               if (highRiskCount >= 2) return 'HIGH';
                               if (highRiskCount >= 1) return 'MEDIUM';
                               return 'LOW';
                             })()}
                           </div>
                         </div>
                       </div>

                       {/* Individual Anomaly Type Analysis */}
                       <div style={{ marginBottom: "20px" }}>
                         <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                           Individual Anomaly Type Analysis
                         </h6>
                         <div style={{ 
                           display: "grid", 
                           gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                           gap: "15px"
                         }}>
                           {[
                             { 
                               label: 'Duplicate Entries', 
                               value: anomalyData?.duplicateEntries || 0, 
                               color: '#9862A0',
                               description: 'Identical transactions detected',
                               riskLevel: (anomalyData?.duplicateEntries || 0) > 10 ? 'HIGH' : (anomalyData?.duplicateEntries || 0) > 5 ? 'MEDIUM' : 'LOW'
                             },
                             { 
                               label: 'User Anomalies', 
                               value: anomalyData?.userAnomalies || 0, 
                               color: '#9862A0',
                               description: 'Suspicious user behavior patterns',
                               riskLevel: (anomalyData?.userAnomalies || 0) > 15 ? 'HIGH' : (anomalyData?.userAnomalies || 0) > 8 ? 'MEDIUM' : 'LOW'
                             },
                             { 
                               label: 'Backdated Entries', 
                               value: anomalyData?.backdatedEntries || 0, 
                               color: '#9862A0',
                               description: 'Transactions posted on past dates',
                               riskLevel: (anomalyData?.backdatedEntries || 0) > 5 ? 'HIGH' : (anomalyData?.backdatedEntries || 0) > 2 ? 'MEDIUM' : 'LOW'
                             },
                             { 
                               label: 'Closing Entries', 
                               value: anomalyData?.closingEntries || 0, 
                               color: '#9862A0',
                               description: 'Period-end closing transactions',
                               riskLevel: (anomalyData?.closingEntries || 0) > 20 ? 'HIGH' : (anomalyData?.closingEntries || 0) > 10 ? 'MEDIUM' : 'LOW'
                             },
                             { 
                               label: 'Unusual Days', 
                               value: anomalyData?.unusualDays || 0, 
                               color: '#9862A0',
                               description: 'Weekend/holiday transactions',
                               riskLevel: (anomalyData?.unusualDays || 0) > 15 ? 'HIGH' : (anomalyData?.unusualDays || 0) > 8 ? 'MEDIUM' : 'LOW'
                             },
                             { 
                               label: 'Holiday Entries', 
                               value: anomalyData?.holidayEntries || 0, 
                               color: '#9862A0',
                               description: 'Transactions on holidays',
                               riskLevel: (anomalyData?.holidayEntries || 0) > 5 ? 'HIGH' : (anomalyData?.holidayEntries || 0) > 2 ? 'MEDIUM' : 'LOW'
                             }
                           ].map((item, index) => (
                             <div key={index} style={{ 
                               padding: "15px", 
                               backgroundColor: `${item.color}08`, 
                               border: `1px solid ${item.color}20`, 
                               borderRadius: "8px"
                             }}>
                               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                 <div>
                                   <div style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>
                                     {item.label}
                                   </div>
                                   <div style={{ color: "#666", fontSize: "12px" }}>
                                     {item.description}
                                   </div>
                                 </div>
                                 <div style={{ textAlign: "right" }}>
                                   <div style={{ fontWeight: "bold", color: item.color, fontSize: "18px" }}>
                                     {item.value}
                                   </div>
                                   <div style={{ 
                                     padding: "2px 8px", 
                                     backgroundColor: item.color, 
                                     color: "white", 
                                     borderRadius: "12px", 
                                     fontSize: "10px", 
                                     fontWeight: "bold",
                                     display: "inline-block"
                                   }}>
                                     {item.riskLevel}
                                   </div>
                                 </div>
                               </div>
                               <div style={{ 
                                 width: "100%", 
                                 height: "8px", 
                                 backgroundColor: "#f0f0f0", 
                                 borderRadius: "4px", 
                                 overflow: "hidden" 
                               }}>
                                 <div style={{ 
                                   width: `${Math.min((item.value / (anomalyData?.totalAnomalies || 1)) * 100, 100)}%`, 
                                   height: "100%", 
                                   backgroundColor: item.color, 
                                   borderRadius: "4px" 
                                 }} />
                               </div>
                             </div>
                           ))}
                         </div>
                                               </div>
                      </div>

                     {/* Detailed Anomaly Data from API */}
                     {data?.anomalies_data && (
                       <div className='sections'>
                         <h5 style={{ margin: "20px 0" }}>Detailed Anomaly Data Analysis</h5>
                         
                         {/* API Anomaly Data Overview */}
                         <div style={{ 
                           padding: "15px", 
                           backgroundColor: "#f8f9fa", 
                           border: "1px solid #e9ecef", 
                           borderRadius: "8px",
                           marginBottom: "20px"
                         }}>
                           <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                             API Anomaly Data Overview
                           </h6>
                           <div style={{ 
                             display: "grid", 
                             gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                             gap: "15px",
                             fontSize: "12px"
                           }}>
                             <div style={{ 
                               padding: "10px", 
                               backgroundColor: "white", 
                               border: "1px solid #dee2e6", 
                               borderRadius: "6px",
                               textAlign: "center"
                             }}>
                               <strong style={{ color: "#925a9b" }}>Total API Anomalies</strong><br/>
                               {data.anomalies_data?.total_anomalies || 0}
                             </div>
                             <div style={{ 
                               padding: "10px", 
                               backgroundColor: "white", 
                               border: "1px solid #dee2e6", 
                               borderRadius: "6px",
                               textAlign: "center"
                             }}>
                               <strong style={{ color: "#925a9b" }}>High Risk Anomalies</strong><br/>
                               {data.anomalies_data?.high_risk_anomalies || 0}
                             </div>
                             <div style={{ 
                               padding: "10px", 
                               backgroundColor: "white", 
                               border: "1px solid #dee2e6", 
                               borderRadius: "6px",
                               textAlign: "center"
                             }}>
                               <strong style={{ color: "#925a9b" }}>Medium Risk Anomalies</strong><br/>
                               {data.anomalies_data?.medium_risk_anomalies || 0}
                             </div>
                             <div style={{ 
                               padding: "10px", 
                               backgroundColor: "white", 
                               border: "1px solid #dee2e6", 
                               borderRadius: "6px",
                               textAlign: "center"
                             }}>
                               <strong style={{ color: "#925a9b" }}>Low Risk Anomalies</strong><br/>
                               {data.anomalies_data?.low_risk_anomalies || 0}
                             </div>
                           </div>
                         </div>

                         {/* Anomaly Summary Table */}
                         {data.anomalies_data?.anomaly_summary && (
                           <div style={{ marginBottom: "20px" }}>
                             <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                               Anomaly Summary Breakdown
                             </h6>
                             <table width='100%' border='1' className='border' cellSpacing='0'>
                               <thead>
                                 <tr>
                                   <th>Anomaly Type</th>
                                   <th>Count</th>
                                   <th>Percentage</th>
                                   <th>Risk Level</th>
                                 </tr>
                               </thead>
                               <tbody style={{ textAlign: "center" }}>
                                 <tr>
                                   <td>Duplicate Entries</td>
                                   <td>{data.anomalies_data.anomaly_summary.duplicate_entries || 0}</td>
                                   <td>{data.anomalies_data.anomaly_summary.duplicate_entries_percentage || 0}%</td>
                                   <td>
                                     <span style={{ 
                                       padding: "2px 6px", 
                                       backgroundColor: (data.anomalies_data.anomaly_summary.duplicate_entries || 0) > 10 ? '#dc3545' : 
                                                      (data.anomalies_data.anomaly_summary.duplicate_entries || 0) > 5 ? '#ffc107' : '#28a745', 
                                       color: "white", 
                                       borderRadius: "8px", 
                                       fontSize: "10px", 
                                       fontWeight: "bold" 
                                     }}>
                                       {(data.anomalies_data.anomaly_summary.duplicate_entries || 0) > 10 ? 'HIGH' : 
                                        (data.anomalies_data.anomaly_summary.duplicate_entries || 0) > 5 ? 'MEDIUM' : 'LOW'}
                                     </span>
                                   </td>
                                 </tr>
                                 <tr>
                                   <td>User Anomalies</td>
                                   <td>{data.anomalies_data.anomaly_summary.user_anomalies || 0}</td>
                                   <td>{data.anomalies_data.anomaly_summary.user_anomalies_percentage || 0}%</td>
                                   <td>
                                     <span style={{ 
                                       padding: "2px 6px", 
                                       backgroundColor: (data.anomalies_data.anomaly_summary.user_anomalies || 0) > 15 ? '#dc3545' : 
                                                      (data.anomalies_data.anomaly_summary.user_anomalies || 0) > 8 ? '#ffc107' : '#28a745', 
                                       color: "white", 
                                       borderRadius: "8px", 
                                       fontSize: "10px", 
                                       fontWeight: "bold" 
                                     }}>
                                       {(data.anomalies_data.anomaly_summary.user_anomalies || 0) > 15 ? 'HIGH' : 
                                        (data.anomalies_data.anomaly_summary.user_anomalies || 0) > 8 ? 'MEDIUM' : 'LOW'}
                                     </span>
                                   </td>
                                 </tr>
                                 <tr>
                                   <td>Backdated Entries</td>
                                   <td>{data.anomalies_data.anomaly_summary.backdated_entries || 0}</td>
                                   <td>{data.anomalies_data.anomaly_summary.backdated_entries_percentage || 0}%</td>
                                   <td>
                                     <span style={{ 
                                       padding: "2px 6px", 
                                       backgroundColor: (data.anomalies_data.anomaly_summary.backdated_entries || 0) > 5 ? '#dc3545' : 
                                                      (data.anomalies_data.anomaly_summary.backdated_entries || 0) > 2 ? '#ffc107' : '#28a745', 
                                       color: "white", 
                                       borderRadius: "8px", 
                                       fontSize: "10px", 
                                       fontWeight: "bold" 
                                     }}>
                                       {(data.anomalies_data.anomaly_summary.backdated_entries || 0) > 5 ? 'HIGH' : 
                                        (data.anomalies_data.anomaly_summary.backdated_entries || 0) > 2 ? 'MEDIUM' : 'LOW'}
                                     </span>
                                   </td>
                                 </tr>
                                 <tr>
                                   <td>Closing Entries</td>
                                   <td>{data.anomalies_data.anomaly_summary.closing_entries || 0}</td>
                                   <td>{data.anomalies_data.anomaly_summary.closing_entries_percentage || 0}%</td>
                                   <td>
                                     <span style={{ 
                                       padding: "2px 6px", 
                                       backgroundColor: (data.anomalies_data.anomaly_summary.closing_entries || 0) > 20 ? '#dc3545' : 
                                                      (data.anomalies_data.anomaly_summary.closing_entries || 0) > 10 ? '#ffc107' : '#28a745', 
                                       color: "white", 
                                       borderRadius: "8px", 
                                       fontSize: "10px", 
                                       fontWeight: "bold" 
                                     }}>
                                       {(data.anomalies_data.anomaly_summary.closing_entries || 0) > 20 ? 'HIGH' : 
                                        (data.anomalies_data.anomaly_summary.closing_entries || 0) > 10 ? 'MEDIUM' : 'LOW'}
                                     </span>
                                   </td>
                                 </tr>
                                 <tr>
                                   <td>Unusual Days</td>
                                   <td>{data.anomalies_data.anomaly_summary.unusual_days || 0}</td>
                                   <td>{data.anomalies_data.anomaly_summary.unusual_days_percentage || 0}%</td>
                                   <td>
                                     <span style={{ 
                                       padding: "2px 6px", 
                                       backgroundColor: (data.anomalies_data.anomaly_summary.unusual_days || 0) > 15 ? '#dc3545' : 
                                                      (data.anomalies_data.anomaly_summary.unusual_days || 0) > 8 ? '#ffc107' : '#28a745', 
                                       color: "white", 
                                       borderRadius: "8px", 
                                       fontSize: "10px", 
                                       fontWeight: "bold" 
                                     }}>
                                       {(data.anomalies_data.anomaly_summary.unusual_days || 0) > 15 ? 'HIGH' : 
                                        (data.anomalies_data.anomaly_summary.unusual_days || 0) > 8 ? 'MEDIUM' : 'LOW'}
                                     </span>
                                   </td>
                                 </tr>
                                 <tr>
                                   <td>Holiday Entries</td>
                                   <td>{data.anomalies_data.anomaly_summary.holiday_entries || 0}</td>
                                   <td>{data.anomalies_data.anomaly_summary.holiday_entries_percentage || 0}%</td>
                                   <td>
                                     <span style={{ 
                                       padding: "2px 6px", 
                                       backgroundColor: (data.anomalies_data.anomaly_summary.holiday_entries || 0) > 5 ? '#dc3545' : 
                                                      (data.anomalies_data.anomaly_summary.holiday_entries || 0) > 2 ? '#ffc107' : '#28a745', 
                                       color: "white", 
                                       borderRadius: "8px", 
                                       fontSize: "10px", 
                                       fontWeight: "bold" 
                                     }}>
                                       {(data.anomalies_data.anomaly_summary.holiday_entries || 0) > 5 ? 'HIGH' : 
                                        (data.anomalies_data.anomaly_summary.holiday_entries || 0) > 2 ? 'MEDIUM' : 'LOW'}
                                     </span>
                                   </td>
                                 </tr>
                               </tbody>
                             </table>
                           </div>
                         )}
                       </div>
                     )}

                     {/* Charts Section */}
                    <div className='sections'>
                      <h5 style={{ margin: "20px 0" }}>Visual Analysis Dashboard</h5>
                      
                      {/* Risk Distribution Chart */}
                      <PDFChartWrapper 
                        title="Risk Distribution"
                        fallbackContent={
                          <FallbackChartContent 
                            title="Risk Distribution" 
                            data={{
                              'Low Risk': comprehensiveStats?.lowRiskTransactions || 0,
                              'Medium Risk': comprehensiveStats?.mediumRiskTransactions || 0,
                              'High Risk': comprehensiveStats?.highRiskTransactions || 0,
                              'Critical Risk': comprehensiveStats?.criticalRiskTransactions || 0
                            }}
                            currency={currency}
                          />
                        }
                      >
                        <RiskDistributionChart data={{
                          labels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                          data: [
                            comprehensiveStats?.lowRiskTransactions || 0,
                            comprehensiveStats?.mediumRiskTransactions || 0,
                            comprehensiveStats?.highRiskTransactions || 0,
                            comprehensiveStats?.criticalRiskTransactions || 0
                          ]
                        }} />
                      </PDFChartWrapper>

                      {/* Anomalies Distribution Chart */}
                      <PDFChartWrapper 
                        title="Anomalies Distribution"
                        fallbackContent={
                          <FallbackChartContent 
                            title="Anomalies Distribution" 
                            data={{
                              'Duplicate Entries': anomalyData?.duplicateEntries || 0,
                              'User Anomalies': anomalyData?.userAnomalies || 0,
                              'Backdated Entries': anomalyData?.backdatedEntries || 0,
                              'Closing Entries': anomalyData?.closingEntries || 0,
                              'Unusual Days': anomalyData?.unusualDays || 0,
                              'Holiday Entries': anomalyData?.holidayEntries || 0
                            }}
                            currency={currency}
                          />
                        }
                      >
                        <AnomaliesDistributionChart data={{
                          labels: ['Duplicate Entries', 'User Anomalies', 'Backdated Entries', 'Closing Entries', 'Unusual Days', 'Holiday Entries'],
                          data: [
                            anomalyData?.duplicateEntries || 0,
                            anomalyData?.userAnomalies || 0,
                            anomalyData?.backdatedEntries || 0,
                            anomalyData?.closingEntries || 0,
                            anomalyData?.unusualDays || 0,
                            anomalyData?.holidayEntries || 0
                          ]
                        }} />
                      </PDFChartWrapper>

                      {/* Employee Expenses Chart */}
                      {chartsData?.topUsersByAmount && chartsData.topUsersByAmount.length > 0 && (
                        <PDFChartWrapper 
                          title="Top Users by Amount"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Top Users by Amount" 
                              data={chartsData.topUsersByAmount.reduce((acc, user, index) => {
                                acc[user.userName || `User ${index + 1}`] = user.totalAmount || 0;
                                return acc;
                              }, {})}
                              currency={currency}
                            />
                          }
                        >
                          <EmployeeExpensesChart data={{
                            labels: chartsData.topUsersByAmount.map(user => user.userName || 'Unknown User'),
                            data: chartsData.topUsersByAmount.map(user => user.totalAmount || 0)
                          }} />
                        </PDFChartWrapper>
                      )}

                      {/* GL Accounts Chart */}
                      {glChartsData?.topAccountsByAmount && glChartsData.topAccountsByAmount.length > 0 && (
                        <PDFChartWrapper 
                          title="GL Accounts Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="GL Accounts Distribution" 
                              data={glChartsData.topAccountsByAmount.reduce((acc, account, index) => {
                                acc[`Account ${account.accountId}`] = account.totalAmount || 0;
                                return acc;
                              }, {})}
                              currency={currency}
                            />
                          }
                        >
                          <DepartmentExpensesChart data={{
                            labels: glChartsData.topAccountsByAmount.map(account => `Account ${account.accountId}`),
                            data: glChartsData.topAccountsByAmount.map(account => account.totalAmount || 0)
                          }} />
                        </PDFChartWrapper>
                      )}
                    </div>

                    {/* GL Accounts Summary */}
                    {glAccountsSummary && (
                      <div className='sections'>
                        <h5 style={{ margin: "20px 0" }}>GL Accounts Summary</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Metric</th>
                              <th>Value</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            <tr>
                              <td>Total Accounts</td>
                              <td>{glAccountsSummary.total_accounts}</td>
                              <td>Number of unique GL accounts</td>
                            </tr>
                            <tr>
                              <td>Total Amount</td>
                              <td>{formatCurrency(glAccountsSummary.total_amount)}</td>
                              <td>Sum of all account balances</td>
                            </tr>
                            <tr>
                              <td>Average Risk Score</td>
                              <td>{glAccountsSummary.avg_risk_score?.toFixed(1) || '0.0'}</td>
                              <td>Average risk score across all accounts</td>
                            </tr>
                            <tr>
                              <td>Accounts with Anomalies</td>
                              <td>{glAccountsSummary.accounts_with_anomalies || 0}</td>
                              <td>Accounts containing suspicious transactions</td>
                            </tr>
                            <tr>
                              <td>Anomaly Rate</td>
                              <td>{glAccountsSummary.anomaly_rate?.toFixed(1) || 0}%</td>
                              <td>Percentage of accounts with anomalies</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Conclusion */}
                    <div className='sections'>
                      <h5 style={{ margin: "20px 0" }}>Conclusion & Recommendations</h5>
                      <table width='100%' border='1' className='border' cellSpacing='0'>
                        <thead>
                          <tr>
                            <th>Metric</th>
                            <th>Value</th>
                            <th>Risk Assessment</th>
                          </tr>
                        </thead>
                        <tbody style={{ textAlign: "center" }}>
                          <tr>
                            <td>Overall Risk Score</td>
                            <td>{overallRiskScore}%</td>
                            <td>
                              <span style={{ color: RiskColor[riskLevelNumber], fontWeight: "bold" }}>
                                {riskLevel}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Total Anomalies</td>
                            <td>{anomalyData?.totalAnomalies || 0}</td>
                            <td>
                              <span style={{ color: (anomalyData?.totalAnomalies || 0) > 100 ? '#dc3545' : (anomalyData?.totalAnomalies || 0) > 50 ? '#ffc516' : '#40b159' }}>
                                {(anomalyData?.totalAnomalies || 0) > 100 ? 'High' : (anomalyData?.totalAnomalies || 0) > 50 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Anomaly Rate</td>
                            <td>{anomalyRate}%</td>
                            <td>
                              <span style={{ color: anomalyRate > 10 ? '#dc3545' : anomalyRate > 5 ? '#ffc516' : '#40b159' }}>
                                {anomalyRate > 10 ? 'High' : anomalyRate > 5 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Footer */}
                    <div className='sections' style={{ marginTop: "30px" }}>
                      <div style={{ 
                        padding: "20px", 
                        backgroundColor: "#f8f9fa", 
                        border: "1px solid #e9ecef", 
                        borderRadius: "8px",
                        textAlign: "center"
                      }}>
                        <div style={{ 
                          color: "#925a9b", 
                          fontSize: "16px",
                          fontWeight: "bold",
                          marginBottom: "10px"
                        }}>
                          Overall Analysis Report Generated by Analytics System
                        </div>
                        <div style={{ 
                          color: "#6c757d", 
                          fontSize: "12px",
                          marginBottom: "5px"
                        }}>
                          File ID: {fileInfo?.fileName || fileInfo?.file_id || "N/A"}
                        </div>
                        <div style={{ 
                          color: "#6c757d", 
                          fontSize: "12px"
                        }}>
                          Generated on {currentDateTime}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default OverallAnalysisPDF;
