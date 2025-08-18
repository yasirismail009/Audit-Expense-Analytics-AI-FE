/** @format */

import React, { useRef } from "react";
import { Button, Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import logoFull from "../../assets/full_logo.svg";
import "./pdf.scss";

// Import chart components for PDF
import UserAnalysisDashboard from "../charts/UserAnalysisDashboard";

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

// Fallback Chart Content with Simple HTML Visualization
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

const UserAnalysisPDF = ({
  open,
  setOpen,
  data,
  currency = 'SAR',
  fileInfo,
  sheetId,
  userListing = [],
  listingLoading = false,
  listingError = null,
  listingPagination = {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    pageSize: 10
  }
}) => {
  const printRef = useRef();

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

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Extract data from the API structure
  // const fileInfo = data?.file_info || {};
  const analysisInfo = data?.analysis_info || {};
  const userSummary = data?.user_analysis?.user_transaction_summary || [];
  const userAnomalies = data?.anomaly_detection?.user_anomalies || [];
  const userRiskScores = data?.risk_assessment?.user_risk_scores || [];
  const userAccountDistribution = data?.user_analysis?.user_account_distribution || [];
  const summary = data?.summary || {};
  const riskDistribution = summary?.risk_distribution || {};
  const chartData = data?.visualizations?.chart_data || {};
  
  // Extract company and client information from file data
  const companyInfo = {
    company_name: fileInfo?.companyName || 'N/A',
    client_name: fileInfo?.clientName || 'N/A',
    engagement_id: fileInfo?.engagementId || 'N/A',
    fiscal_year: fileInfo?.fiscalYear || 'N/A'
  };
  
  // Extract additional data structures
  const patterns = data?.patterns || {};
  const auditRecommendations = data?.audit_recommendations || {};
  const complianceAssessment = data?.compliance_assessment || {};
  const financialStatementImpact = data?.financial_statement_impact || {};
  const exportData = data?.export_data || {};
  
  // Extract detailed patterns and trends
  const activityTrends = patterns?.activity_trends || {};
  const userBehaviorAnalysis = patterns?.user_behavior_analysis || {};
  const temporalPatterns = patterns?.temporal_patterns || {};
  
  // Extract audit recommendations
  const highPriorityRecommendations = auditRecommendations?.high_priority_recommendations || [];
  const mediumPriorityRecommendations = auditRecommendations?.medium_priority_recommendations || [];
  const lowPriorityRecommendations = auditRecommendations?.low_priority_recommendations || [];
  const complianceIssues = auditRecommendations?.compliance_issues || [];
  const followUpActions = auditRecommendations?.follow_up_actions || [];
  
  // Extract compliance assessment
  const complianceRisks = complianceAssessment?.compliance_risks || [];
  const regulatoryImplications = complianceAssessment?.regulatory_implications || [];
  const internalControlAssessment = complianceAssessment?.internal_control_assessment || {};
  
  // Extract financial statement impact
  const materialImpactAssessment = financialStatementImpact?.material_impact_assessment || {};
  const financialStatementRisks = financialStatementImpact?.financial_statement_risks || [];
  const disclosureRequirements = financialStatementImpact?.disclosure_requirements || [];
  const auditImplications = financialStatementImpact?.audit_implications || [];

  // Calculate overall risk score
  const totalAmount = userSummary.reduce((sum, user) => sum + (user.total_amount || 0), 0);
  const totalTransactions = userSummary.reduce((sum, user) => sum + (user.transaction_count || 0), 0);
  
  // Calculate average risk score based on risk levels (since no numeric scores in new API)
  const riskLevelScores = {
    'LOW': 20,
    'MEDIUM': 50,
    'HIGH': 80,
    'CRITICAL': 95
  };
  
  const avgRiskScore = userRiskScores.length > 0 ? 
    userRiskScores.reduce((sum, user) => sum + (riskLevelScores[user.risk_level] || 0), 0) / userRiskScores.length : 0;
  const overallRiskLevel = avgRiskScore >= 60 ? 'HIGH' : avgRiskScore >= 40 ? 'MEDIUM' : 'LOW';

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const getRiskLevelNumber = (score) => {
    if (score >= 80) return 4;
    if (score >= 60) return 3;
    if (score >= 40) return 2;
    return 1;
  };

  const riskLevelNumber = getRiskLevelNumber(avgRiskScore);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  const currentDateTime = getCurrentDateTime();

  // Note: userListing data is now passed from parent component
  // No need to fetch data here as it's already available from UserAnalysisContent.jsx

  const handlePrint = () => {
    var htmlToPrint =
      "" +
      '<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">' +
      '<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />' +
      '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-gH2yIJqKdNHPEq0n4Mqa/HGKIhSkIHeL5AyhkYV8i59U5AR6csBvApHHNl/vI1Bx" crossorigin="anonymous">' +
      '<link rel="stylesheet" href="https://financialerp.lyca.sa/styles.8e8a51593c94db3380ac.css">' +
      '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-A3rJD856KowSb7dwlZdYEkO39Gagi7vIsF0jrRAoQmDKKtQBHUuLZ9AsSv4jD4Xa" crossorigin="anonymous"></script>' +
      '<style type="text/css">' +
      ".printpage .toppaging, .printpage .printbtns, .printpage .reportpaging, .printpage .showipad, .printpage .reporttopbutton, .printpage .pagingbottom {" +
      "display: none" +
      "}" +
      "* {" +
      "margin: 0;" +
      "padding: 0;" +
      "outline: none!important;" +
      "font-family: Barlow, sans-serif;" +
      "}" +
      "html, body, div, span, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, abbr, address, cite, code, del, dfn, em, img, ins, kbd, q, samp, small, strong, sub, sup, var, b, i, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, figcaption, figure, footer, header, hgroup, menu, nav, section, summary, mark, audio, video {" +
      "margin: 0;" +
      "padding: 0;" +
      "border: 0;" +
      "outline: 0;" +
      "font-size: 100%;" +
      "vertical-align: baseline;" +
      "}" +
      ".bg-primary2 {background: #9984f1!important;}" +
      "background:#f2f5ff !important;" +
      "body, html{" +
      "font-family: Barlow, sans-serif;" +
      "line-height:1 !important;" +
      "background:#FFF !important;" +
      "}" +
      "@media (min-width: 1200px) {" +
      '#reportbody[dir="rtl"] .col-lg-1, #reportbody[dir="rtl"] .col-lg-2, #reportbody[dir="rtl"] .col-lg-3, #reportbody[dir="rtl"] .col-lg-4, #reportbody[dir="rtl"] .col-lg-5, #reportbody[dir="rtl"] .col-lg-6, #reportbody[dir="rtl"] .col-lg-7, #reportbody[dir="rtl"] .col-lg-8, #reportbody[dir="rtl"] .col-lg-9, #reportbody[dir="rtl"] .col-lg-10, #reportbody[dir="rtl"] .col-lg-11, #reportbody[dir="rtl"] .col-lg-12 {' +
      "float: right;" +
      "}" +
      "}" +
      "@media (min-width: 992px) {" +
      '#reportbody[dir="rtl"] .col-md-1, #reportbody[dir="rtl"] .col-md-2, #reportbody[dir="rtl"] .col-md-3, #reportbody[dir="rtl"] .col-md-4, #reportbody[dir="rtl"] .col-md-5, #reportbody[dir="rtl"] .col-md-6, #reportbody[dir="rtl"] .col-md-7, #reportbody[dir="rtl"] .col-md-8, #reportbody[dir="rtl"] .col-md-9, #reportbody[dir="rtl"] .col-md-10, #reportbody[dir="rtl"] .col-md-11, #reportbody[dir="rtl"] .col-md-12 {' +
      "float: right;" +
      "}" +
      "}" +
      "@media (min-width: 768px) {" +
      '#reportbody[dir="rtl"] .col-sm-1, #reportbody[dir="rtl"] .col-sm-2, #reportbody[dir="rtl"] .col-sm-3, #reportbody[dir="rtl"] .col-sm-4, #reportbody[dir="rtl"] .col-sm-5, #reportbody[dir="rtl"] .col-sm-6, #reportbody[dir="rtl"] .col-sm-7, #reportbody[dir="rtl"] .col-sm-8, #reportbody[dir="rtl"] .col-sm-9, #reportbody[dir="rtl"] .col-sm-10, #reportbody[dir="rtl"] .col-sm-11, #reportbody[dir="rtl"] .col-sm-12 {' +
      "float: right;" +
      "}" +
      "}" +
      "#printPDF{margin:0 auto;width:100%;background:#f2f5ff;color:#333;}" +
      "header h2, header h3 {" +
      "margin: 15px 0;" +
      "text-align: left!important;" +
      "}" +
      ".sections tr th {" +
      "background: #EEE;" +
      "color: #333;" +
      "-webkit-print-color-adjust: exact;" +
      "print-color-adjust: exact;" +
      "}" +
      ".sections tr td {" +
      "-webkit-print-color-adjust: exact;" +
      "print-color-adjust: exact;" +
      "}" +
      ".sections h3 {" +
      "font-weight: bold;" +
      "padding: 15px 0;" +
      "text-align: left!important;" +
      "}" +
      ".sections table tr td {" +
      "padding: 5px 5px 5px 0;" +
      "line-height: 20px;" +
      "color: #333;" +
      "}" +
      ".sections table.border tr td, .sections table.border tr th {" +
      "border: 1px solid #EEE;" +
      "padding: 5px;" +
      "}" +
      'input[type = "text"], input[type = "number"], input[type = "date"], input[type = "email"], textarea, select {' +
      "width: 100 %;" +
      "}" +
      "strong {" +
      "-webkit-print-color-adjust: exact;" +
      "print-color-adjust: exact;" +
      "}" +
      '.sections.form-check - input: disabled ~ .form-heck - label, .sections.form-check - input[disabled] ~ .form-check - label, .sections.form-check - input: checked[type = "radio"], .sections.form-check - input: checked[type = "checkbox"] {' +
      "opacity: 1!important;" +
      "}" +
      ".bg-light {" +
      "background: #f2f5ff !important;" +
      "-webkit-print-color-adjust: exact;" +
      "print-color-adjust: exact;" +
      "}" +
      "label{opacity:1 !important;line-height:1;}" +
      ".form-check-input[type=radio] {border-radius:50% !important;}" +
      ".form-check input {height: 18px!important;width: 18px!important;}" +
      ".form-check-input.checked {background-color:#6259ca !important;border-color:#6259ca !important;-webkit-print-color-adjust: exact;print-color-adjust: exact;opacity:1;}" +
      ".form-check-input.checked[type=radio]{background-image:url(https://financialerp.lyca.sa/assets/images/radio.png);}" +
      ".form-check-input.checked[type=checkbox]{background-image:url(https://financialerp.lyca.sa/assets/images/checkbox.png);}" +
      "@media print { @page {margin: 0.7in; }}" +
      "@media print { .content-section { page-break-after: always;}}" +
      "@media print { .time-date { display: none; }}" +
      "#InvoiceDetailsPDF { word-wrap: break-word;  white-space: pre-wrap;}" +
      ".chart-container { page-break-inside: avoid; margin: 20px 0; }" +
      ".chart-section { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 15px 0; background: white; page-break-inside: avoid; }" +
      ".chart-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; }" +
      ".chart-content { min-height: 200px; display: flex; align-items: center; justify-content: center; }" +
      ".chart-placeholder { color: #666; font-style: italic; }" +
      ".chart-fallback { padding: 20px; text-align: center; color: #666; border: 2px dashed #ddd; border-radius: 8px; background-color: #f9f9f9; }" +
      "  .page-header { position: running(header); }" +
      "  .page-footer { position: running(footer); }" +
      "  @page {" +
      "    @top-center { content: element(header); }" +
      "    @bottom-center { content: element(footer); }" +
      "  }" +
      "</style>";

    var divToPrint = document.getElementById("UserAnalysisPDF");
    htmlToPrint += divToPrint.outerHTML;

    let newWin = window.open("", "_blank");
    newWin.document.write(htmlToPrint);
    newWin.document.title = "User Analysis Report";
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
          className='modal fade '
          data-bs-backdrop='static'
          data-bs-keyboard='false'
          tabIndex='-1'
          aria-hidden='true'
          ref={printRef}
          style={{ padding: "20px 10px" }}>
          <div className='modal-dialog modal-xl modal-dialog-centered'>
            <div id='UserAnalysisPDF' className='modal-content'>
              {/* Page Header for Printing */}
              <div className='page-header' style={{ 
                display: "none",
                padding: "10px 20px",
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #dee2e6",
                fontSize: "12px",
                color: "#6c757d"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span><strong>{companyInfo.company_name}</strong> - User Analysis Report</span>
                  <span>Analysis ID: {fileInfo?.fileName || fileInfo?.file_id || analysisInfo?.analysis_id || data?.analysis_id || "N/A"}</span>
                </div>
              </div>
              
              <div className='modal-body bg-white text-dark'>
                <div style={{ padding: "20px" }}>
                  <div className='content-section'>
                    <div className='sections'>
                      <table width='100%' style={{ borderBottom: "4px solid #925a9b" }}>
                        <tbody>
                          <tr>
                            <td align='left' style={{ verticalAlign: "top", width: "33%" }}>
                              <h2 style={{ fontWeight: "bold" }}>User Analysis</h2>
                              <b>Analysis ID:</b> {fileInfo.file_id || "N/A"}
                              <br />
                              <b>Status:</b> {fileInfo.status || "COMPLETED"}
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
                              Analysis Date: {formatDate(analysisInfo.analysis_date)}
                              <br />
                              <b>Risk Level:</b> {overallRiskLevel}
                              <br />
                              <p style={{ maxWidth: "90%" }}>
                                Total Users: {userSummary.length}
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className='sections'>
                      <h5 style={{ margin: "10px 0" }}>User Analysis Overview</h5>
                      
                      {/* Analysis Status Alert */}
                      <div style={{ 
                        padding: "15px", 
                        backgroundColor: userAnomalies.length > 0 ? "#fff3cd" : "#d4edda", 
                        border: `1px solid ${userAnomalies.length > 0 ? "#ffeaa7" : "#c3e6cb"}`, 
                        borderRadius: "8px",
                        marginBottom: "20px"
                      }}>
                        <div style={{ 
                          fontWeight: "bold", 
                          color: userAnomalies.length > 0 ? "#856404" : "#155724",
                          fontSize: "14px",
                          marginBottom: "5px"
                        }}>
                          {userAnomalies.length > 0 
                            ? `Found ${userAnomalies.length} users with anomalies involving ${totalTransactions} transactions`
                            : "No user anomalies found"
                          }
                        </div>
                        {userAnomalies.length > 0 && (
                          <div style={{ 
                            color: userAnomalies.length > 0 ? "#856404" : "#155724",
                            fontSize: "12px"
                          }}>
                            Total amount involved: {formatCurrency(totalAmount)}
                          </div>
                        )}
                      </div>

                      {/* User Analysis Definitions */}
                      <div style={{ 
                        padding: "15px", 
                        backgroundColor: "#f8f9fa", 
                        border: "1px solid #e9ecef", 
                        borderRadius: "8px",
                        marginBottom: "20px"
                      }}>
                        <p style={{ 
                          margin: "0 0 15px 0", 
                          fontSize: "14px", 
                          lineHeight: "1.5",
                          color: "#333"
                        }}>
                          <strong>Test Description:</strong> This test identifies user behavior patterns and transaction anomalies. The classification for User Anomalies are categorized as below:
                        </p>
                        
                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "1fr 1fr", 
                          gap: "15px",
                          fontSize: "12px"
                        }}>
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>High Amount Anomaly</strong><br/>
                            Unusually large transaction amounts
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Unusual Balance Pattern</strong><br/>
                            Abnormal debit/credit balance ratios
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Account Concentration</strong><br/>
                            Limited account diversity usage
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Transaction Pattern</strong><br/>
                            Unusual transaction frequency patterns
                          </div>
                        </div>
                      </div>

                      <h5 style={{ margin: "20px 0 10px 0" }}>Analysis Summary</h5>
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
                                    {Math.round(avgRiskScore)}%
                                  </b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Risk Level
                                  <br />
                                  <b style={{ color: RiskColor[riskLevelNumber] }}>
                                    {overallRiskLevel}
                                  </b>
                                </span>
                              </div>
                            </td>

                            <td style={{ width: "25%" }}>
                              <strong style={{ display: "block", padding: "10px", background: "#EEE" }}>
                                User Statistics
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <b style={{ display: "block" }}>Total Users</b>
                                {userSummary.length}
                                <br />
                                <b style={{ display: "block" }}>Total Transactions</b>
                                {totalTransactions}
                                <br />
                                <b style={{ display: "block" }}>Total Amount</b>
                                {formatCurrency(totalAmount)}
                              </div>
                            </td>

                            <td style={{ width: "25%" }}>
                              <strong style={{ display: "block", padding: "10px", background: "#EEE" }}>
                                File Information
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <b style={{ display: "block" }}>File ID</b>
                                {fileInfo.file_id || "N/A"}
                                <br />
                                <b style={{ display: "block" }}>Status</b>
                                {fileInfo.status || "COMPLETED"}
                                <br />
                                <b style={{ display: "block" }}>Currency</b>
                                {currency}
                              </div>
                            </td>

                            <td style={{ width: "25%" }}>
                              <strong style={{ display: "block", padding: "10px", background: "#EEE" }}>
                                Analysis Details
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <span style={{ display: "block" }}>
                                  Users with Anomalies
                                  <br />
                                  <b>{userAnomalies.length}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  High Risk Users
                                  <br />
                                  <b>{userRiskScores.filter(u => (u.risk_score || 0) >= 60).length}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Average Risk Score
                                  <br />
                                  <b>{Math.round(avgRiskScore)}%</b>
                                </span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <br />
                    <br />

                    {/* Charts Section */}
                    <div className='sections'>
                      <h5 style={{ margin: "20px 0" }}>Visual Analysis Dashboard</h5>
                      
                      <div style={{ 
                        padding: "15px", 
                        backgroundColor: "#f8f9fa", 
                        border: "1px solid #e9ecef", 
                        borderRadius: "8px",
                        marginBottom: "20px"
                      }}>
                        <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                          User Analysis Dashboard Overview
                        </h6>
                        <p style={{ 
                          margin: "0 0 15px 0", 
                          fontSize: "14px", 
                          lineHeight: "1.5",
                          color: "#333"
                        }}>
                          This dashboard provides comprehensive visual analysis of user behavior patterns, including amount distribution, risk assessment, activity patterns, anomaly distribution, risk trends, and account diversity.
                        </p>
                      </div>
                      
                      {/* User Analysis Dashboard */}
                      <PDFChartWrapper 
                        title="User Analysis Dashboard"
                        fallbackContent={
                          <FallbackChartContent 
                            title="User Analysis Dashboard" 
                            data={chartData}
                            currency={currency}
                          />
                        }
                      >
                        <UserAnalysisDashboard data={data} />
                      </PDFChartWrapper>
                    </div>

                    {/* User Analysis Table */}
                    <div className='sections'>
                      <h5 style={{ margin: "10px 0" }}>User Analysis & Risk Assessment</h5>
                      <table width='100%' border='1' className='border' cellSpacing='0'>
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Total Amount</th>
                            <th>Transactions</th>
                            <th>Risk Score</th>
                            <th>Anomalies</th>
                            <th>Risk Level</th>
                          </tr>
                        </thead>
                        <tbody style={{ textAlign: "center" }}>
                          {userSummary.map((user, index) => {
                            const userAnomaly = userAnomalies.find(a => a.user === user.user);
                            const userRisk = userRiskScores.find(r => r.user === user.user);
                            const userAccount = userAccountDistribution.find(a => a.user === user.user);
                            
                            return (
                              <tr key={index}>
                                <td>{user.user}</td>
                                <td>{formatCurrency(user.total_amount)}</td>
                                <td>{user.transaction_count}</td>
                                <td>{riskLevelScores[userRisk?.risk_level] || 0}</td>
                                <td>{userAnomaly ? 1 : 0}</td>
                                <td>
                                  <span style={{
                                    color: RiskColor[getRiskLevelNumber(riskLevelScores[userRisk?.risk_level] || 0)],
                                    fontWeight: "bold"
                                  }}>
                                    {userRisk?.risk_level || 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                                         {/* Risk Assessment Summary */}
                     <div className='sections'>
                       <h5 style={{ margin: "10px 0" }}>Risk Assessment Summary</h5>
                       <table width='100%' border='1' className='border' cellSpacing='0'>
                         <thead>
                           <tr>
                             <th>Risk Level</th>
                             <th>Users</th>
                             <th>Transactions</th>
                             <th>Total Amount</th>
                           </tr>
                         </thead>
                         <tbody style={{ textAlign: "center" }}>
                           {Object.entries(riskDistribution).map(([level, count], index) => {
                             const riskLevelUsers = userRiskScores.filter(user => {
                               return user.risk_level === level.toUpperCase();
                             });
                             
                             const totalAmount = riskLevelUsers.reduce((sum, user) => {
                               const userSummaryItem = userSummary.find(u => u.user === user.user);
                               return sum + (userSummaryItem?.total_amount || 0);
                             }, 0);
                             
                             const totalTransactions = riskLevelUsers.reduce((sum, user) => {
                               const userSummaryItem = userSummary.find(u => u.user === user.user);
                               return sum + (userSummaryItem?.transaction_count || 0);
                             }, 0);
                             
                             return (
                               <tr key={index}>
                                 <td>
                                   <span style={{
                                     color: RiskColor[getRiskLevelNumber(level === 'high' ? 80 : level === 'medium' ? 60 : 40)],
                                     fontWeight: "bold"
                                   }}>
                                     {level.toUpperCase()}
                                   </span>
                                 </td>
                                 <td>{count}</td>
                                 <td>{totalTransactions}</td>
                                 <td>{formatCurrency(totalAmount)}</td>
                               </tr>
                             );
                           })}
                         </tbody>
                       </table>
                     </div>

                     {/* User Listing from API */}
                     <div className='sections'>
                       <h5 style={{ margin: "10px 0" }}>User Entries Listing (First Page)</h5>
                       
                       {listingLoading && (
                         <div style={{ 
                           padding: "20px", 
                           textAlign: "center", 
                           color: "#6c757d",
                           fontStyle: "italic"
                         }}>
                           Loading user entries from API...
                         </div>
                       )}
                       
                       {listingError && (
                         <div style={{ 
                           padding: "15px", 
                           backgroundColor: "#f8d7da", 
                           border: "1px solid #f5c6cb", 
                           borderRadius: "8px",
                           color: "#721c24",
                           marginBottom: "20px"
                         }}>
                           <strong>Error loading user entries:</strong> {listingError}
                         </div>
                       )}
                       
                       {!listingLoading && !listingError && userListing.length > 0 && (
                         <>
                           <div style={{ 
                             padding: "10px", 
                             backgroundColor: "#f8f9fa", 
                             border: "1px solid #e9ecef", 
                             borderRadius: "8px",
                             marginBottom: "15px",
                             fontSize: "12px",
                             color: "#6c757d"
                           }}>
                             Found {listingPagination.count} user entries from API (showing page {listingPagination.currentPage} of {Math.ceil(listingPagination.count / listingPagination.pageSize)})
                           </div>
                           
                           <table width='100%' border='1' className='border' cellSpacing='0'>
                             <thead>
                               <tr>
                                 <th>User</th>
                                 <th>Transaction Count</th>
                                 <th>Total Amount</th>
                                 <th>Risk Level</th>
                                 <th>Anomaly Count</th>
                               </tr>
                             </thead>
                             <tbody style={{ textAlign: "left" }}>
                               {userListing.map((entry, index) => (
                                 <tr key={index}>
                                   <td style={{ fontWeight: "bold" }}>
                                     {entry.user || `User-${index + 1}`}
                                   </td>
                                   <td style={{ textAlign: "center" }}>
                                     {entry.transaction_count || 0}
                                   </td>
                                   <td style={{ textAlign: "right" }}>
                                     {entry.amount_formatted || formatCurrency(entry.total_amount || 0)}
                                   </td>
                                   <td style={{ textAlign: "center" }}>
                                     <span style={{
                                       color: entry.risk_level === 'HIGH' ? '#dc3545' : 
                                              entry.risk_level === 'MEDIUM' ? '#ffc107' : '#28a745',
                                       fontWeight: "bold"
                                     }}>
                                       {entry.risk_level?.toUpperCase() || 'N/A'}
                                     </span>
                                   </td>
                                   <td style={{ textAlign: "center" }}>
                                     <span style={{
                                       color: (entry.anomaly_count || 0) > 0 ? '#dc3545' : '#6c757d',
                                       fontWeight: "bold"
                                     }}>
                                       {entry.anomaly_count || 0}
                                     </span>
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                           
                           {/* Listing Summary */}
                           <div style={{ 
                             marginTop: "15px",
                             padding: "10px",
                             backgroundColor: "#e9ecef",
                             borderRadius: "8px",
                             fontSize: "12px"
                           }}>
                             <strong>Summary:</strong> Total Amount: {formatCurrency(userListing.reduce((sum, entry) => sum + (entry.total_amount || 0), 0))} | 
                             Unique Users: {new Set(userListing.map(entry => entry.user)).size} | 
                             Total Accounts: {userListing.reduce((sum, entry) => sum + (entry.accounts_count || 0), 0)}
                           </div>
                         </>
                       )}
                       
                       {!listingLoading && !listingError && userListing.length === 0 && (
                         <div style={{ 
                           padding: "20px", 
                           textAlign: "center", 
                           color: "#6c757d",
                           fontStyle: "italic",
                           backgroundColor: "#f8f9fa",
                           border: "1px solid #e9ecef",
                           borderRadius: "8px"
                         }}>
                           No user entries found in the API response
                         </div>
                       )}
                     </div>

                    {/* User Behavior Analysis */}
                    {userBehaviorAnalysis.unusual_activities && userBehaviorAnalysis.unusual_activities.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>User Behavior Analysis</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>User Name</th>
                              <th>Reason</th>
                              <th>Transaction Count</th>
                              <th>Total Amount</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            {userBehaviorAnalysis.unusual_activities.map((activity, index) => (
                              <tr key={index}>
                                <td style={{ fontWeight: "bold" }}>{activity.user}</td>
                                <td>{activity.reason}</td>
                                <td style={{ textAlign: "center" }}>{activity.transaction_count}</td>
                                <td style={{ textAlign: "right" }}>{formatCurrency(activity.total_amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Activity Trends - Most Active Users */}
                    {activityTrends.most_active_users && activityTrends.most_active_users.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Most Active Users</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>User Name</th>
                              <th>Transaction Count</th>
                              <th>Total Amount</th>
                              <th>Average Amount</th>
                              <th>Accounts</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            {activityTrends.most_active_users.map((user, index) => (
                              <tr key={index}>
                                <td style={{ fontWeight: "bold" }}>{user.user}</td>
                                <td style={{ textAlign: "center" }}>{user.transaction_count}</td>
                                <td style={{ textAlign: "right" }}>{formatCurrency(user.total_amount)}</td>
                                <td style={{ textAlign: "right" }}>{formatCurrency(user.avg_amount)}</td>
                                <td style={{ textAlign: "center" }}>{user.accounts?.length || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Highest Value Users */}
                    {activityTrends.highest_value_users && activityTrends.highest_value_users.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Highest Value Users</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>User Name</th>
                              <th>Transaction Count</th>
                              <th>Total Amount</th>
                              <th>Average Amount</th>
                              <th>Accounts</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            {activityTrends.highest_value_users.map((user, index) => (
                              <tr key={index}>
                                <td style={{ fontWeight: "bold" }}>{user.user}</td>
                                <td style={{ textAlign: "center" }}>{user.transaction_count}</td>
                                <td style={{ textAlign: "right" }}>{formatCurrency(user.total_amount)}</td>
                                <td style={{ textAlign: "right" }}>{formatCurrency(user.avg_amount)}</td>
                                <td style={{ textAlign: "center" }}>{user.accounts?.length || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* User Activity Distribution */}
                    {activityTrends.users_by_transaction_count && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>User Activity Distribution</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Activity Level</th>
                              <th>Number of Users</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {Object.entries(activityTrends.users_by_transaction_count).map(([level, count], index) => (
                              <tr key={index}>
                                <td style={{ fontWeight: "bold", textTransform: "capitalize" }}>{level}</td>
                                <td>{count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Export Data Summary */}
                    {exportData.user_summary && exportData.user_summary.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Export Data Summary</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Transaction Count</th>
                              <th>Total Amount</th>
                              <th>Average Amount</th>
                              <th>Accounts</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            {exportData.user_summary.map((user, index) => (
                              <tr key={index}>
                                <td style={{ fontWeight: "bold" }}>{user.user}</td>
                                <td style={{ textAlign: "center" }}>{user.transaction_count}</td>
                                <td style={{ textAlign: "right" }}>{formatCurrency(user.total_amount)}</td>
                                <td style={{ textAlign: "right" }}>{formatCurrency(user.avg_amount)}</td>
                                <td style={{ fontSize: "11px" }}>{user.accounts}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}



                    {/* Recommendations Export Data */}
                    {exportData.recommendations_export && exportData.recommendations_export.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Recommendations Export Data</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Priority</th>
                              <th>Category</th>
                              <th>Recommendation</th>
                              <th>Rationale</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            {exportData.recommendations_export.map((recommendation, index) => (
                              <tr key={index}>
                                <td>
                                  <span style={{
                                    color: recommendation.priority === 'HIGH' ? '#dc3545' : 
                                           recommendation.priority === 'MEDIUM' ? '#ffc107' : '#28a745',
                                    fontWeight: "bold"
                                  }}>
                                    {recommendation.priority}
                                  </span>
                                </td>
                                <td>{recommendation.category}</td>
                                <td>{recommendation.recommendation}</td>
                                <td>{recommendation.rationale}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Audit Recommendations */}
                    {(highPriorityRecommendations.length > 0 || mediumPriorityRecommendations.length > 0 || lowPriorityRecommendations.length > 0) && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Audit Recommendations</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Priority</th>
                              <th>Category</th>
                              <th>Recommendation</th>
                              <th>Rationale</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            {[...highPriorityRecommendations, ...mediumPriorityRecommendations, ...lowPriorityRecommendations].map((recommendation, index) => (
                              <tr key={index}>
                                <td>
                                  <span style={{
                                    color: recommendation.priority === 'HIGH' ? '#dc3545' : 
                                           recommendation.priority === 'MEDIUM' ? '#ffc107' : '#28a745',
                                    fontWeight: "bold"
                                  }}>
                                    {recommendation.priority}
                                  </span>
                                </td>
                                <td>{recommendation.category}</td>
                                <td>{recommendation.recommendation}</td>
                                <td>{recommendation.rationale}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Compliance Assessment */}
                    {(complianceRisks.length > 0 || regulatoryImplications.length > 0) && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Compliance Assessment</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Description</th>
                              <th>Risk Level</th>
                              <th>Impact</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            {complianceRisks.map((risk, index) => (
                              <tr key={index}>
                                <td>Compliance Risk</td>
                                <td>{risk.description}</td>
                                <td>
                                  <span style={{
                                    color: risk.risk_level === 'HIGH' ? '#dc3545' : 
                                           risk.risk_level === 'MEDIUM' ? '#ffc107' : '#28a745',
                                    fontWeight: "bold"
                                  }}>
                                    {risk.risk_level}
                                  </span>
                                </td>
                                <td>{risk.mitigation}</td>
                              </tr>
                            ))}
                            {regulatoryImplications.map((implication, index) => (
                              <tr key={index}>
                                <td>Regulatory</td>
                                <td>{implication.implication}</td>
                                <td>
                                  <span style={{
                                    color: implication.impact === 'HIGH' ? '#dc3545' : 
                                           implication.impact === 'MEDIUM' ? '#ffc107' : '#28a745',
                                    fontWeight: "bold"
                                  }}>
                                    {implication.impact}
                                  </span>
                                </td>
                                <td>{implication.regulation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Financial Statement Impact */}
                    {(financialStatementRisks.length > 0 || disclosureRequirements.length > 0) && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Financial Statement Impact</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Description</th>
                              <th>Risk Level</th>
                              <th>Required Action</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            {financialStatementRisks.map((risk, index) => (
                              <tr key={index}>
                                <td>Financial Risk</td>
                                <td>{risk.description}</td>
                                <td>
                                  <span style={{
                                    color: risk.risk_level === 'HIGH' ? '#dc3545' : 
                                           risk.risk_level === 'MEDIUM' ? '#ffc107' : '#28a745',
                                    fontWeight: "bold"
                                  }}>
                                    {risk.risk_level}
                                  </span>
                                </td>
                                <td>{risk.mitigation}</td>
                              </tr>
                            ))}
                            {disclosureRequirements.map((disclosure, index) => (
                              <tr key={index}>
                                <td>Disclosure</td>
                                <td>{disclosure.description}</td>
                                <td>
                                  <span style={{
                                    color: disclosure.required === 'YES' ? '#dc3545' : '#28a745',
                                    fontWeight: "bold"
                                  }}>
                                    {disclosure.required}
                                  </span>
                                </td>
                                <td>{disclosure.timeline}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Follow-up Actions */}
                    {followUpActions.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Follow-up Actions</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Action</th>
                              <th>Timeline</th>
                              <th>Responsible Party</th>
                              <th>Deadline</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            {followUpActions.map((action, index) => (
                              <tr key={index}>
                                <td>{action.action}</td>
                                <td>
                                  <span style={{
                                    color: action.timeline === 'IMMEDIATE' ? '#dc3545' : 
                                           action.timeline === 'SHORT_TERM' ? '#ffc107' : '#28a745',
                                    fontWeight: "bold"
                                  }}>
                                    {action.timeline}
                                  </span>
                                </td>
                                <td>{action.responsible_party}</td>
                                <td>{action.deadline}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Internal Control Assessment */}
                    {internalControlAssessment.overall_effectiveness && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Internal Control Assessment</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Assessment Area</th>
                              <th>Status</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            <tr>
                              <td style={{ fontWeight: "bold" }}>Overall Effectiveness</td>
                              <td>
                                <span style={{
                                  color: internalControlAssessment.overall_effectiveness === 'ADEQUATE' ? '#28a745' : 
                                         internalControlAssessment.overall_effectiveness === 'WEAK' ? '#ffc107' : '#dc3545',
                                  fontWeight: "bold"
                                }}>
                                  {internalControlAssessment.overall_effectiveness}
                                </span>
                              </td>
                              <td>Overall assessment of internal control effectiveness</td>
                            </tr>
                            {internalControlAssessment.control_deficiencies && internalControlAssessment.control_deficiencies.map((deficiency, index) => (
                              <tr key={index}>
                                <td style={{ fontWeight: "bold" }}>Control Deficiency</td>
                                <td>
                                  <span style={{
                                    color: deficiency.impact === 'HIGH' ? '#dc3545' : 
                                           deficiency.impact === 'MEDIUM' ? '#ffc107' : '#28a745',
                                    fontWeight: "bold"
                                  }}>
                                    {deficiency.impact}
                                  </span>
                                </td>
                                <td>{deficiency.deficiency} - {deficiency.recommendation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Material Impact Assessment */}
                    {materialImpactAssessment.materiality_assessment && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Material Impact Assessment</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Assessment Type</th>
                              <th>Level</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            <tr>
                              <td style={{ fontWeight: "bold" }}>Materiality Assessment</td>
                              <td>
                                <span style={{
                                  color: materialImpactAssessment.materiality_assessment === 'HIGH' ? '#dc3545' : 
                                         materialImpactAssessment.materiality_assessment === 'MEDIUM' ? '#ffc107' : '#28a745',
                                  fontWeight: "bold"
                                }}>
                                  {materialImpactAssessment.materiality_assessment}
                                </span>
                              </td>
                              <td>Assessment of material impact on financial statements</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: "bold" }}>Quantified Impact</td>
                              <td style={{ textAlign: "right" }}>{formatCurrency(materialImpactAssessment.quantified_impact || 0)}</td>
                              <td>Total quantified financial impact</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Audit Implications */}
                    {auditImplications.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Audit Implications</h5>
                        <table width='100%' border='1' className='border' cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Implication Type</th>
                              <th>Description</th>
                              <th>Impact</th>
                              <th>Required Action</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "left" }}>
                            {auditImplications.map((implication, index) => (
                              <tr key={index}>
                                <td style={{ fontWeight: "bold" }}>{implication.implication_type}</td>
                                <td>{implication.description}</td>
                                <td>
                                  <span style={{
                                    color: implication.impact === 'HIGH' ? '#dc3545' : 
                                           implication.impact === 'MEDIUM' ? '#ffc107' : '#28a745',
                                    fontWeight: "bold"
                                  }}>
                                    {implication.impact}
                                  </span>
                                </td>
                                <td>{implication.action_required}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Conclusion */}
                    <div className='sections'>
                      <h5 style={{ margin: "20px 0" }}>Conclusion</h5>
                      <table width='100%' border='1' className='border' cellSpacing='0'>
                        <thead>
                          <tr>
                            <th>Metric</th>
                            <th>Value</th>
                            <th>Risk Level</th>
                          </tr>
                        </thead>
                        <tbody style={{ textAlign: "center" }}>
                          <tr>
                            <td>Overall Risk Score</td>
                            <td>{Math.round(avgRiskScore)}%</td>
                            <td>
                              <span style={{ color: RiskColor[riskLevelNumber], fontWeight: "bold" }}>
                                {overallRiskLevel}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Total Users Analyzed</td>
                            <td>{userSummary.length}</td>
                            <td>
                              <span style={{ color: userSummary.length > 50 ? '#dc3545' : userSummary.length > 20 ? '#ffc516' : '#40b159' }}>
                                {userSummary.length > 50 ? 'High' : userSummary.length > 20 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Users with Anomalies</td>
                            <td>{userAnomalies.length}</td>
                            <td>
                              <span style={{ color: userAnomalies.length > 10 ? '#dc3545' : userAnomalies.length > 5 ? '#ffc516' : '#40b159' }}>
                                {userAnomalies.length > 10 ? 'High' : userAnomalies.length > 5 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Total Amount Involved</td>
                            <td>{formatCurrency(totalAmount)}</td>
                            <td>
                              <span style={{ color: totalAmount > 10000000 ? '#dc3545' : totalAmount > 5000000 ? '#ffc516' : '#40b159' }}>
                                {totalAmount > 10000000 ? 'High' : totalAmount > 5000000 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Footer Section */}
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
                          Report Generated by Analytics System
                        </div>
                        <div style={{ 
                          color: "#6c757d", 
                          fontSize: "12px",
                          marginBottom: "5px"
                        }}>
                          Company: {companyInfo.company_name} | Client: {companyInfo.client_name}
                        </div>
                        <div style={{ 
                          color: "#6c757d", 
                          fontSize: "12px",
                          marginBottom: "5px"
                        }}>
                          Engagement ID: {companyInfo.engagement_id} | Fiscal Year: {companyInfo.fiscal_year}
                        </div>
                        <div style={{ 
                          color: "#6c757d", 
                          fontSize: "12px"
                        }}>
                          Generated on {currentDateTime} | Analysis ID: {fileInfo?.fileName || fileInfo?.file_id || analysisInfo?.analysis_id || data?.analysis_id || "N/A"}
                        </div>
                      </div>
                    </div>
                    
                    {/* Page Footer for Printing */}
                    <div className='page-footer' style={{ 
                      display: "none",
                      padding: "10px 20px",
                      backgroundColor: "#f8f9fa",
                      borderTop: "1px solid #dee2e6",
                      fontSize: "10px",
                      color: "#6c757d",
                      textAlign: "center"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{companyInfo.company_name} - {companyInfo.client_name}</span>
                        <span>Page <span className="page-number"></span></span>
                        <span>{currentDateTime}</span>
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

export default UserAnalysisPDF; 