/** @format */

import React, { useRef } from "react";
import { Button, Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import logoFull from "../../assets/full_logo.svg";
import "./pdf.scss";

// Import chart components for PDF
import DuplicateTypeChart from "../charts/DuplicateTypeChart";
import DuplicateRiskChart from "../charts/DuplicateRiskChart";
import DuplicateUserChart from "../charts/DuplicateUserChart";
import DuplicateAmountChart from "../charts/DuplicateAmountChart";
import DuplicateMonthlyTrendChart from "../charts/DuplicateMonthlyTrendChart";
import DuplicateFSLineChart from "../charts/DuplicateFSLineChart";

// Import ColorCodedDuplicateList component
import ColorCodedDuplicateList from "./shared/ColorCodedDuplicateList";

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
    // Reset error state when component mounts
    setHasError(false);
  }, []);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className='chart-section'>
      {/* <div className='chart-title'>{title}</div> */}
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

  // Create simple HTML-based chart visualization
  const renderSimpleChart = () => {
    if (!data || typeof data !== 'object') {
      return <div>No data available</div>;
    }

    const entries = Object.entries(data).slice(0, 5); // Show top 5 items
    if (entries.length === 0) {
      return <div>No data available</div>;
    }

    // Find max value for scaling
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

const DuplicateAnalysisPDF = ({
  open,
  setOpen,
  data,
  currency = 'SAR',
  fileInfo
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

  // Extract data from the sheet structure - Map real file info from sheet
  const analysisInfo = data?.analysis_info || {};
  const summary = data?.summary || {};
  const detailedResults = data?.detailed_results || {};
  
  // Extract company and client information from sheet data
  const companyInfo = {
    company_name: fileInfo?.companyName || 'N/A',
    client_name: fileInfo?.clientName || 'N/A',
    engagement_id: fileInfo?.engagementId || 'N/A',
    fiscal_year: fileInfo?.fiscalYear || 'N/A'
  };
  
  // Simplified chart data structure
  const chartData = {
    duplicate_types_distribution: {
      labels: Object.keys(detailedResults.duplicate_by_type || {}).filter(type => 
        detailedResults.duplicate_by_type[type] && detailedResults.duplicate_by_type[type].length > 0
      ),
      data: Object.keys(detailedResults.duplicate_by_type || {}).filter(type => 
        detailedResults.duplicate_by_type[type] && detailedResults.duplicate_by_type[type].length > 0
      ).map(type => detailedResults.duplicate_by_type[type].length),
      colors: ['#925a9b', '#e74c3c', '#f39c12', '#27ae60', '#3498db', '#9b59b6']
    },
    risk_level_distribution: {
      labels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      data: [0, 0, 0, 0],
      colors: ['#40b159', '#ffc516', '#dc3545', '#ff0000']
    },
    duplicate_activity_by_user: {
      labels: Object.keys(detailedResults.duplicate_patterns?.user_activity_patterns || {}),
      data: Object.keys(detailedResults.duplicate_patterns?.user_activity_patterns || {}).map(user => 
        detailedResults.duplicate_patterns.user_activity_patterns[user].count || 0
      )
    },
    duplicate_amount_distribution: {
      labels: ['Low Amount', 'Medium Amount', 'High Amount', 'Critical Amount'],
      data: [0, 0, 0, 0],
      colors: ['#40b159', '#ffc516', '#dc3545', '#ff0000']
    },
    financial_statement_line_breakdown: {
      labels: Object.keys(detailedResults.duplicate_patterns?.account_patterns || {}),
      data: Object.keys(detailedResults.duplicate_patterns?.account_patterns || {}).map(account => 
        detailedResults.duplicate_patterns.account_patterns[account].count || 0
      )
    },
    monthly_duplicate_trend: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  };
  
  // Core data extraction
  const duplicateEntries = detailedResults.duplicate_entries || [];
  const duplicatePatterns = detailedResults.duplicate_patterns || {};
  const recommendations = summary.high_priority_recommendations || [];
  const criticalAlerts = summary.compliance_issues?.filter(issue => issue.severity === 'HIGH') || [];

  // Calculate derived values
  const totalDuplicates = summary.total_duplicates || 0;
  const totalDuplicateAmount = summary.total_amount || 0;
  
  // Risk assessment
  const overallRiskScore = summary.overall_risk_score || 0;
  const riskLevel = summary.overall_risk_level || 'LOW';

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

  const riskLevelNumber = getRiskLevelNumber(overallRiskScore);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  const currentDateTime = getCurrentDateTime();

  const handlePrint = () => {
    // Modify the HTML before printing
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
      // Chart specific styles for PDF
      ".chart-container { page-break-inside: avoid; margin: 20px 0; }" +
      ".chart-section { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 15px 0; background: white; page-break-inside: avoid; }" +
      ".chart-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; }" +
      ".chart-content { min-height: 200px; display: flex; align-items: center; justify-content: center; }" +
      ".chart-placeholder { color: #666; font-style: italic; }" +
      ".chart-fallback { padding: 20px; text-align: center; color: #666; border: 2px dashed #ddd; border-radius: 8px; background-color: #f9f9f9; }" +
      // Professional header styles for PDF
      ".professional-header { page-break-inside: avoid; margin-bottom: 30px; }" +
      ".header-banner { background: linear-gradient(135deg, #925a9b 0%, #7a4a82 100%) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }" +
      ".header-stats { page-break-inside: avoid; margin-bottom: 25px; }" +
      ".stat-card { background: white !important; border: 1px solid #e9ecef !important; border-radius: 10px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }" +
      // Page header styles for printing
      "@media print { " +
      "  .page-header { position: running(header); }" +
      "  .page-footer { position: running(footer); }" +
      "  .professional-header { page-break-after: avoid; }" +
      "  .header-banner { background: linear-gradient(135deg, #925a9b 0%, #7a4a82 100%) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }" +
      "  .header-stats { page-break-inside: avoid; }" +
      "  @page { " +
      "    @top-center { content: element(header); }" +
      "    @bottom-center { content: element(footer); }" +
      "  }" +
      "}" +
      "</style>";

    var divToPrint = document.getElementById("DuplicateAnalysisPDF");
    htmlToPrint += divToPrint.outerHTML;

    let newWin = window.open("", "_blank");
    newWin.document.write(htmlToPrint);
    newWin.document.title = `${companyInfo.company_name} - Duplicate Analysis Report`;
    setTimeout(() => {
      newWin.focus(); // necessary for IE >= 10
      newWin.print(); // change window to winPrint
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
        <div
          style={{
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
            <div id='DuplicateAnalysisPDF' className='modal-content'>
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
                  <span><strong>{companyInfo.company_name}</strong> - Duplicate Analysis Report</span>
                  <span>Analysis ID: {fileInfo?.fileName || fileInfo?.file_id || analysisInfo?.analysis_id || data?.analysis_id || "N/A"}</span>
                </div>
              </div>
              
              <div className='modal-body bg-white text-dark'>
                <div style={{ padding: "20px" }}>
                  <div className='content-section'>
                    <div className='sections'>
                      <table
                        width='100%'
                        style={{ borderBottom: "4px solid #925a9b" }}>
                        <tbody>
                          <tr>
                            <td
                              align='left'
                              style={{ verticalAlign: "top", width: "33%" }}>
                              <h2 style={{ fontWeight: "bold" }}>Duplicate Analysis</h2>
                              <b>Analysis ID:</b> {fileInfo?.fileName || fileInfo?.file_id || analysisInfo?.analysis_id || data?.analysis_id || "N/A"}
                              <br />
                              <b>Status:</b> {fileInfo?.status || "COMPLETED"}
                              <br />
                              <b>Currency:</b> {currency}
                            </td>
                            <td
                              align='center'
                              style={{ verticalAlign: "center", width: "33%" }}>
                              <a href='javascript:;'>
                                <img src={logoFull} width={200} />
                              </a>
                            </td>
                            <td
                              align='right'
                              style={{ verticalAlign: "bottom", width: "33%" }}>
                              Generated on {currentDateTime}
                              <br />
                              Analysis Date: {formatDate(analysisInfo?.analysis_date || fileInfo?.uploadedAt)}
                              <br />
                              <b>Risk Level:</b> {riskLevel}
                              <br />
                              <p style={{ maxWidth: "90%" }}>
                                Total Duplicates: {duplicateEntries.length}
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className='sections'>                      
                      <h5 style={{ margin: "20px 0 10px 0" }}>Duplicate Analysis Overview</h5>
                      
                      {/* Analysis Status Alert */}
                      <div style={{ 
                        padding: "15px", 
                        backgroundColor: totalDuplicates > 0 ? "#fff3cd" : "#d4edda", 
                        border: `1px solid ${totalDuplicates > 0 ? "#ffeaa7" : "#c3e6cb"}`, 
                        borderRadius: "8px",
                        marginBottom: "20px"
                      }}>
                        <div style={{ 
                          fontWeight: "bold", 
                          color: totalDuplicates > 0 ? "#856404" : "#155724",
                          fontSize: "14px",
                          marginBottom: "5px"
                        }}>
                          {totalDuplicates > 0 
                            ? `Found ${duplicateEntries.length} duplicate groups involving ${totalDuplicates} transactions`
                            : "No duplicate transactions found"
                          }
                        </div>
                        {totalDuplicates > 0 && (
                          <div style={{ 
                            color: totalDuplicates > 0 ? "#856404" : "#155724",
                            fontSize: "12px"
                          }}>
                            Total amount involved: {formatCurrency(totalDuplicateAmount || 0)}
                          </div>
                        )}
                      </div>
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
                          <strong>Test Description:</strong> This test identifies Journal Lines which have identical characteristics. The classification for Duplicates are categorized as below:
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
                            <strong style={{ color: "#925a9b" }}>Type 1 Duplicate</strong><br/>
                            Account Number + Amount
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Type 2 Duplicate</strong><br/>
                            Account Number + Source + Amount
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Type 3 Duplicate</strong><br/>
                            Account Number + User + Amount
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Type 4 Duplicate</strong><br/>
                            Account Number + Posted Date + Amount
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Type 5 Duplicate</strong><br/>
                            Account Number + Effective Date + Amount
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px",
                            gridColumn: "1 / -1"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Type 6 Duplicate</strong><br/>
                            Account Number + Effective Date + Posted Date + User + Source + Amount
                          </div>
                        </div>
                      </div>
                      
                      {/* Top Summary Banner */}
                     
                      <table
                        width='100%'
                        style={{ height: "100%" }}
                        className='border'
                        cellSpacing='5'>
                        <tbody>
                          <tr style={{ display: "flex", alignItems: "stretch" }}>
                            {/* Overall Risk Assessment */}
                            <td style={{ width: "25%" }}>
                              <strong
                                style={{
                                  display: "block",
                                  padding: "10px",
                                  background: "#EEE",
                                }}>
                                Overall Risk Assessment
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <span style={{ display: "block" }}>
                                  Risk Score
                                  <br />
                                  <b
                                    style={{
                                      color: RiskColor[riskLevelNumber],
                                      fontSize: "18px"
                                    }}>
                                    {overallRiskScore}%
                                  </b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Risk Level
                                  <br />
                                  <b
                                    style={{
                                      color: RiskColor[riskLevelNumber],
                                    }}>
                                    {riskLevel}
                                  </b>
                                </span>
                              </div>
                            </td>

                            {/* Duplicate Statistics */}
                            <td style={{ width: "25%" }}>
                              <strong
                                style={{
                                  display: "block",
                                  padding: "10px",
                                  background: "#EEE",
                                }}>
                                Duplicate Statistics
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <b style={{ display: "block" }}>Total Duplicates</b>
                                {duplicateEntries.length}
                                <br />
                                <b style={{ display: "block" }}>Total Transactions</b>
                                {totalDuplicates}
                                <br />
                                <b style={{ display: "block" }}>Total Amount</b>
                                {formatCurrency(totalDuplicateAmount || 0)}
                              </div>
                            </td>

                            {/* File Information */}
                            <td style={{ width: "25%" }}>
                              <strong
                                style={{
                                  display: "block",
                                  padding: "10px",
                                  background: "#EEE",
                                }}>
                                File Information
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <b style={{ display: "block" }}>Company</b>
                                {companyInfo.company_name}
                                <br />
                                <b style={{ display: "block" }}>Client</b>
                                {companyInfo.client_name}
                                <br />
                                <b style={{ display: "block" }}>Engagement ID</b>
                                {companyInfo.engagement_id}
                                <br />
                                <b style={{ display: "block" }}>Fiscal Year</b>
                                {companyInfo.fiscal_year}
                                <br />
                                <b style={{ display: "block" }}>File ID</b>
                                {fileInfo?.fileName || fileInfo?.file_id || analysisInfo?.analysis_id || data?.analysis_id || "N/A"}
                                <br />
                                <b style={{ display: "block" }}>Status</b>
                                {fileInfo?.status || "COMPLETED"}
                                <br />
                                <b style={{ display: "block" }}>Currency</b>
                                {currency}
                              </div>
                            </td>

                            {/* Analysis Details */}
                            <td style={{ width: "25%" }}>
                              <strong
                                style={{
                                  display: "block",
                                  padding: "10px",
                                  background: "#EEE",
                                }}>
                                Analysis Details
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <span style={{ display: "block" }}>
                                  Duplicate Types
                                  <br />
                                  <b>{chartData.duplicate_types_distribution?.labels?.length || 0}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Users Involved
                                  <br />
                                  <b>{chartData.duplicate_activity_by_user?.labels?.length || 0}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  GL Accounts
                                  <br />
                                  <b>{chartData.financial_statement_line_breakdown?.labels?.length || 0}</b>
                                </span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <br />
                    <br />

                    {/* Charts Section - Same as UI Dashboard */}
                    <div className='sections'>
                      <h5 style={{ margin: "20px 0" }}>Visual Analysis Dashboard</h5>
                      
                      {/* Duplicate Analysis Dashboard Overview */}
                      <div style={{ 
                        padding: "15px", 
                        backgroundColor: "#f8f9fa", 
                        border: "1px solid #e9ecef", 
                        borderRadius: "8px",
                        marginBottom: "20px"
                      }}>
                        <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                          Duplicate Analysis Dashboard Overview
                        </h6>
                        <p style={{ 
                          margin: "0 0 15px 0", 
                          fontSize: "14px", 
                          lineHeight: "1.5",
                          color: "#333"
                        }}>
                          This dashboard provides comprehensive visual analysis of duplicate transactions, including type distribution, risk assessment, user activity, amount distribution, financial statement line breakdown, and monthly trends.
                        </p>
                      </div>
                      
                      {/* Charts Grid - 2 columns */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                        
                        {/* Duplicate Type Chart */}
                        <PDFChartWrapper 
                          title="Duplicate Types Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Duplicate Types Distribution" 
                              data={chartData.duplicate_types_distribution}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateTypeChart data={{
                            ...data,
                            chart_data: {
                              duplicate_types_distribution: chartData.duplicate_types_distribution
                            }
                          }} currency={currency} />
                        </PDFChartWrapper>

                        {/* Risk Distribution Chart */}
                        <PDFChartWrapper 
                          title="Risk Level Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Risk Level Distribution" 
                              data={chartData.risk_level_distribution}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateRiskChart data={{
                            ...data,
                            chart_data: {
                              risk_level_distribution: chartData.risk_level_distribution
                            }
                          }} currency={currency} />
                        </PDFChartWrapper>

                        {/* User Activity Chart */}
                        <PDFChartWrapper 
                          title="Duplicate Activity by User"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Duplicate Activity by User" 
                              data={chartData.duplicate_activity_by_user}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateUserChart data={{
                            ...data,
                            chart_data: {
                              duplicate_activity_by_user: chartData.duplicate_activity_by_user
                            }
                          }} currency={currency} />
                        </PDFChartWrapper>

                        {/* Amount Distribution Chart */}
                        <PDFChartWrapper 
                          title="Duplicate Amount Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Duplicate Amount Distribution" 
                              data={chartData.duplicate_amount_distribution}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateAmountChart data={{
                            ...data,
                            chart_data: {
                              duplicate_amount_distribution: chartData.duplicate_amount_distribution
                            }
                          }} currency={currency} />
                        </PDFChartWrapper>

                        {/* Financial Statement Line Chart */}
                        <PDFChartWrapper 
                          title="Financial Statement Line Breakdown"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Financial Statement Line Breakdown" 
                              data={chartData.financial_statement_line_breakdown}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateFSLineChart data={{
                            ...data,
                            chart_data: {
                              financial_statement_line_breakdown: chartData.financial_statement_line_breakdown
                            }
                          }} currency={currency} />
                        </PDFChartWrapper>

                        {/* Monthly Trend Chart */}
                        <PDFChartWrapper 
                          title="Monthly Duplicate Trend"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Monthly Duplicate Trend" 
                              data={chartData.monthly_duplicate_trend}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateMonthlyTrendChart data={{
                            ...data,
                            chart_data: {
                              monthly_duplicate_trend: chartData.monthly_duplicate_trend
                            }
                          }} currency={currency} />
                        </PDFChartWrapper>

                      </div>
                    </div>

                    {/* Duplicate Analysis Dashboard */}
                    <div className='sections'>
                      <h5 style={{ margin: "20px 0" }}>Duplicate Analysis Dashboard</h5>
                      <div style={{ 
                        padding: "15px", 
                        backgroundColor: "#f8f9fa", 
                        border: "1px solid #e9ecef", 
                        borderRadius: "8px",
                        marginBottom: "20px"
                      }}>
                        <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                          Comprehensive Dashboard Overview
                        </h6>
                        <p style={{ 
                          margin: "0 0 15px 0", 
                          fontSize: "14px", 
                          lineHeight: "1.5",
                          color: "#333"
                        }}>
                          The Duplicate Analysis Dashboard provides a comprehensive view of all duplicate transactions, including type distribution, risk assessment, user activity, amount distribution, financial statement line breakdown, and monthly trends. This dashboard is the same as the one used in the main application interface.
                        </p>
                      </div>
                    </div>

                    {/* Color-Coded Duplicate Lists */}
                    {duplicateEntries && duplicateEntries.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "20px 0" }}>Color-Coded Duplicate Analysis</h5>
                        <div style={{ 
                          padding: "20px", 
                          backgroundColor: "#f8f9fa", 
                          border: "1px solid #e9ecef", 
                          borderRadius: "8px",
                          marginBottom: "20px"
                        }}>
                          <ColorCodedDuplicateList 
                            data={{
                              ...data,
                              duplicates: duplicateEntries.map((entry, index) => ({
                                type: entry.duplicate_type || `Type ${index + 1}`,
                                amount: entry.transaction1.amount + entry.transaction2.amount,
                                count: 2,
                                risk_score: entry.risk_level === 'HIGH' ? 70 : entry.risk_level === 'MEDIUM' ? 50 : 30,
                                criteria: `Account: ${entry.transaction1.account}, Amount: ${entry.transaction1.amount}`,
                                gl_account: entry.transaction1.account,
                                duplicate_type: entry.duplicate_type || `Type ${index + 1}`,
                                transactions: 2,
                                debit_amount: entry.transaction1.amount,
                                credit_amount: entry.transaction2.amount
                              }))
                            }} 
                            currency={currency} 
                          />
                        </div>
                      </div>
                    )}



                    {/* Duplicate Type Summary Cards */}
                    {chartData.duplicate_types_distribution && chartData.duplicate_types_distribution.labels.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Duplicate Type Summary</h5>
                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                          gap: "15px",
                          marginBottom: "20px"
                        }}>
                          {chartData.duplicate_types_distribution.labels.map((type, index) => {
                            const count = chartData.duplicate_types_distribution.data[index] || 0;
                            const color = chartData.duplicate_types_distribution.colors[index] || '#925a9b';
                            // Since the new response doesn't have duplicate_type, we'll use the first entry for this type
                            const duplicateEntry = duplicateEntries[index] || duplicateEntries[0];
                            const amount = duplicateEntry ? 
                              (duplicateEntry.transaction1.amount + duplicateEntry.transaction2.amount) : 0;
                            const transactions = duplicateEntry ? 2 : 0;
                            
                            return (
                              <div key={type} style={{ 
                                padding: "15px", 
                                backgroundColor: "white", 
                                border: "1px solid #e9ecef", 
                                borderRadius: "8px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                              }}>
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  marginBottom: "10px" 
                                }}>
                                  <div style={{ 
                                    width: "40px", 
                                    height: "40px", 
                                    backgroundColor: color,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    marginRight: "10px"
                                  }}>
                                    {type.charAt(0)}
                                  </div>
                                  <div>
                                    <div style={{ 
                                      fontWeight: "bold", 
                                      color: "#2c3e50",
                                      fontSize: "14px"
                                    }}>
                                      {type}
                                    </div>
                                    <div style={{ 
                                      padding: "2px 8px", 
                                      backgroundColor: amount > 10000000 ? '#dc3545' : amount > 5000000 ? '#ffc107' : '#28a745',
                                      color: "white",
                                      borderRadius: "12px",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                      display: "inline-block",
                                      marginTop: "2px"
                                    }}>
                                      {amount > 10000000 ? 'HIGH' : amount > 5000000 ? 'MEDIUM' : 'LOW'}
                                    </div>
                                  </div>
                                </div>
                                
                                <div style={{ 
                                  display: "grid", 
                                  gridTemplateColumns: "1fr 1fr", 
                                  gap: "10px",
                                  marginBottom: "10px"
                                }}>
                                  <div style={{ textAlign: "center" }}>
                                    <div style={{ 
                                      fontWeight: "bold", 
                                      color: color,
                                      fontSize: "18px"
                                    }}>
                                      {count}
                                    </div>
                                    <div style={{ 
                                      color: "#6c757d",
                                      fontSize: "10px"
                                    }}>
                                      Groups
                                    </div>
                                  </div>
                                  <div style={{ textAlign: "center" }}>
                                    <div style={{ 
                                      fontWeight: "bold", 
                                      color: color,
                                      fontSize: "18px"
                                    }}>
                                      {transactions}
                                    </div>
                                    <div style={{ 
                                      color: "#6c757d",
                                      fontSize: "10px"
                                    }}>
                                      Transactions
                                    </div>
                                  </div>
                                </div>
                                
                                <div style={{ 
                                  borderTop: "1px solid #e9ecef", 
                                  paddingTop: "10px",
                                  textAlign: "center"
                                }}>
                                  <div style={{ 
                                    fontWeight: "bold", 
                                    color: "#2c3e50",
                                    fontSize: "16px"
                                  }}>
                                    {formatCurrency(amount)}
                                  </div>
                                  <div style={{ 
                                    color: "#6c757d",
                                    fontSize: "10px"
                                  }}>
                                    Total Amount
                                  </div>
                                </div>
                                
                                <div style={{ 
                                  display: "flex", 
                                  justifyContent: "space-between", 
                                  marginTop: "10px"
                                }}>
                                  <div style={{ textAlign: "center", flex: 1 }}>
                                    <div style={{ 
                                      fontWeight: "bold", 
                                      color: "#28a745",
                                      fontSize: "12px"
                                    }}>
                                      {formatCurrency(amount / 2)}
                                    </div>
                                    <div style={{ 
                                      color: "#6c757d",
                                      fontSize: "9px"
                                    }}>
                                      Debit
                                    </div>
                                  </div>
                                  <div style={{ textAlign: "center", flex: 1 }}>
                                    <div style={{ 
                                      fontWeight: "bold", 
                                      color: "#dc3545",
                                      fontSize: "12px"
                                    }}>
                                      {formatCurrency(amount / 2)}
                                    </div>
                                    <div style={{ 
                                      color: "#6c757d",
                                      fontSize: "9px"
                                    }}>
                                      Credit
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Duplicate Type Breakdown */}
                    {chartData.duplicate_types_distribution && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Duplicate Type Breakdown</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Duplicate Type</th>
                              <th>Groups</th>
                              <th>Transactions</th>
                              <th>Total Amount</th>
                              <th>Debit Amount</th>
                              <th>Credit Amount</th>
                              <th>Risk Level</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {chartData.duplicate_types_distribution.labels.map((type, index) => {
                              const count = chartData.duplicate_types_distribution.data[index] || 0;
                              // Since the new response doesn't have duplicate_type, we'll use the first entry for this type
                              const duplicateEntry = duplicateEntries[index] || duplicateEntries[0];
                              const amount = duplicateEntry ? 
                                (duplicateEntry.transaction1.amount + duplicateEntry.transaction2.amount) : 0;
                              const transactions = duplicateEntry ? 2 : 0;
                              
                              return (
                              <tr key={type}>
                                <td>{type}</td>
                                <td>{count}</td>
                                <td>{transactions}</td>
                                <td>{formatCurrency(amount)}</td>
                                <td>{formatCurrency(amount / 2)}</td>
                                <td>{formatCurrency(amount / 2)}</td>
                                <td>{amount > 10000000 ? 'HIGH' : amount > 5000000 ? 'MEDIUM' : 'LOW'}</td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}



                    {/* User Breakdown */}
                    {chartData.duplicate_activity_by_user && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>User Breakdown Analysis</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>User Name</th>
                              <th>Duplicate Groups</th>
                              <th>Transactions</th>
                              <th>Total Amount</th>
                              <th>Unique Accounts</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {chartData.duplicate_activity_by_user.labels.map((userName, index) => {
                              const userData = {
                                duplicate_groups: chartData.duplicate_activity_by_user.data[index] || 0,
                                transactions: chartData.duplicate_activity_by_user.data[index] * 2 || 0,
                                amount: 0,
                                unique_accounts: 1
                              };
                              
                              // Calculate amount from duplicate entries
                              const userDuplicates = duplicateEntries.filter(entry => 
                                entry.transaction1.user === userName || entry.transaction2.user === userName
                              );
                              userData.amount = userDuplicates.reduce((sum, entry) => 
                                sum + entry.transaction1.amount + entry.transaction2.amount, 0
                              );
                              
                              // Calculate unique accounts for this user
                              const uniqueAccounts = new Set();
                              userDuplicates.forEach(entry => {
                                uniqueAccounts.add(entry.transaction1.account);
                                uniqueAccounts.add(entry.transaction2.account);
                              });
                              userData.unique_accounts = uniqueAccounts.size;
                              
                              return (
                              <tr key={index}>
                                <td>{userName}</td>
                                <td>{userData.duplicate_groups}</td>
                                <td>{userData.transactions}</td>
                                <td>{formatCurrency(userData.amount)}</td>
                                <td>{userData.unique_accounts}</td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}



                    {/* GL Account Breakdown */}
                    {chartData.financial_statement_line_breakdown && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Financial Statement Line Breakdown</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>GL Account</th>
                              <th>Duplicate Groups</th>
                              <th>Transactions</th>
                              <th>Total Amount</th>
                              <th>Debit Amount</th>
                              <th>Credit Amount</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {chartData.financial_statement_line_breakdown.labels.map((account, index) => {
                              const accountData = {
                                duplicate_groups: chartData.financial_statement_line_breakdown.data[index] || 0,
                                transactions: chartData.financial_statement_line_breakdown.data[index] * 2 || 0,
                                amount: 0,
                                debit_amount: 0,
                                credit_amount: 0
                              };
                              
                              // Calculate amounts from duplicate entries
                              const accountDuplicates = duplicateEntries.filter(entry => 
                                entry.transaction1.account === account || entry.transaction2.account === account
                              );
                              accountData.amount = accountDuplicates.reduce((sum, entry) => 
                                sum + entry.transaction1.amount + entry.transaction2.amount, 0
                              );
                              accountData.debit_amount = accountDuplicates.reduce((sum, entry) => 
                                sum + entry.transaction1.amount, 0
                              );
                              accountData.credit_amount = accountDuplicates.reduce((sum, entry) => 
                                sum + entry.transaction2.amount, 0
                              );
                              
                              return (
                              <tr key={index}>
                                <td>{account}</td>
                                <td>{accountData.duplicate_groups}</td>
                                <td>{accountData.transactions}</td>
                                <td>{formatCurrency(accountData.amount)}</td>
                                <td>{formatCurrency(accountData.debit_amount)}</td>
                                <td>{formatCurrency(accountData.credit_amount)}</td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}



                    {/* Risk Breakdown */}
                    {summary.risk_distribution && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Risk Level Breakdown</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Risk Level</th>
                              <th>Groups</th>
                              <th>Transactions</th>
                              <th>Total Amount</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {Object.entries(summary.risk_distribution).map(([riskLevel, count], index) => {
                              const riskData = {
                                groups: count,
                                transactions: count * 2,
                                amount: 0
                              };
                              
                              // Calculate amount from duplicate entries based on risk level
                              const riskLevelDuplicates = duplicateEntries.filter(entry => {
                                const entryRiskLevel = getRiskLevel(entry.risk_score);
                                // Convert risk level from API format (e.g., "low_risk") to standard format (e.g., "LOW")
                                const apiRiskLevel = riskLevel.replace('_risk', '').toUpperCase();
                                return entryRiskLevel === apiRiskLevel;
                              });
                              riskData.amount = riskLevelDuplicates.reduce((sum, entry) => 
                                sum + entry.transaction1.amount + entry.transaction2.amount, 0
                              );
                              
                              return (
                              <tr key={index}>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(riskData.amount > 10000000 ? 80 : riskData.amount > 5000000 ? 60 : 40)],
                                      fontWeight: "bold"
                                    }}>
                                    {riskLevel.replace('_risk', '').toUpperCase()}
                                  </span>
                                </td>
                                <td>{riskData.groups}</td>
                                <td>{riskData.transactions}</td>
                                <td>{formatCurrency(riskData.amount)}</td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Detailed Duplicates List */}
                    {duplicateEntries && duplicateEntries.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Detailed Duplicates Analysis</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>GL Account</th>
                              <th>User</th>
                              <th>Posting Date</th>
                              <th>Amount</th>
                              <th>Risk Score</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {duplicateEntries.map((duplicate, index) => (
                              <tr key={index}>
                                <td>{duplicate.duplicate_type || 'Unknown'}</td>
                                <td>{duplicate.transaction1.account}</td>
                                <td>{duplicate.transaction1.user}</td>
                                <td>{formatDate(duplicate.transaction1.posting_date || duplicate.transaction1.date)}</td>
                                <td>{formatCurrency(duplicate.transaction1.amount + duplicate.transaction2.amount)}</td>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(duplicate.risk_score || 0)],
                                      fontWeight: "bold"
                                    }}>
                                    {duplicate.risk_score || 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Duplicate Items Listing */}
                    {duplicateEntries && duplicateEntries.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "20px 0" }}>Duplicate Items Listing</h5>
                        
                        {/* Duplicate Items Overview */}
                        <div style={{ 
                          padding: "15px", 
                          backgroundColor: "#f8f9fa", 
                          border: "1px solid #e9ecef", 
                          borderRadius: "8px",
                          marginBottom: "20px"
                        }}>
                          <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                            Complete Duplicate Items Analysis
                          </h6>
                          <p style={{ 
                            margin: "0 0 15px 0", 
                            fontSize: "14px", 
                            lineHeight: "1.5",
                            color: "#333"
                          }}>
                            This section provides a comprehensive listing of all duplicate items found in the analysis, including detailed information about each duplicate pair, their characteristics, and risk assessment.
                          </p>
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
                              <strong style={{ color: "#925a9b" }}>Total Duplicates</strong><br/>
                              {duplicateEntries.length}
                            </div>
                            <div style={{ 
                              padding: "10px", 
                              backgroundColor: "white", 
                              border: "1px solid #dee2e6", 
                              borderRadius: "6px",
                              textAlign: "center"
                            }}>
                              <strong style={{ color: "#925a9b" }}>Total Transactions</strong><br/>
                              {duplicateEntries.length * 2}
                            </div>
                            <div style={{ 
                              padding: "10px", 
                              backgroundColor: "white", 
                              border: "1px solid #dee2e6", 
                              borderRadius: "6px",
                              textAlign: "center"
                            }}>
                              <strong style={{ color: "#925a9b" }}>Total Amount</strong><br/>
                              {formatCurrency(duplicateEntries.reduce((sum, entry) => 
                                sum + (entry.transaction1.amount + entry.transaction2.amount), 0
                              ))}
                            </div>
                            <div style={{ 
                              padding: "10px", 
                              backgroundColor: "white", 
                              border: "1px solid #dee2e6", 
                              borderRadius: "6px",
                              textAlign: "center"
                            }}>
                              <strong style={{ color: "#925a9b" }}>Average Risk Score</strong><br/>
                              {duplicateEntries.length > 0 ? 
                                (duplicateEntries.reduce((sum, entry) => sum + (entry.risk_score || 0), 0) / duplicateEntries.length).toFixed(1) : 0
                              }
                            </div>
                          </div>
                        </div>

                        {/* Detailed Duplicate Items Table */}
                        <div style={{ marginBottom: "20px" }}>
                          <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                            Detailed Duplicate Items Listing
                          </h6>
                          <table
                            width='100%'
                            border='1'
                            className='border'
                            cellSpacing='0'>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Duplicate Type</th>
                                <th>GL Account</th>
                                <th>User</th>
                                <th>Posting Date</th>
                                <th>Transaction 1 Amount</th>
                                <th>Transaction 2 Amount</th>
                                <th>Total Amount</th>
                                <th>Risk Score</th>
                                <th>Risk Level</th>
                              </tr>
                            </thead>
                            <tbody style={{ textAlign: "center" }}>
                              {duplicateEntries.map((duplicate, index) => (
                                <tr key={index} style={{ 
                                  backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white"
                                }}>
                                  <td style={{ fontWeight: "bold" }}>{index + 1}</td>
                                  <td>
                                    <span style={{ 
                                      padding: "2px 8px", 
                                      backgroundColor: "#925a9b", 
                                      color: "white", 
                                      borderRadius: "12px", 
                                      fontSize: "10px", 
                                      fontWeight: "bold" 
                                    }}>
                                      {duplicate.duplicate_type || 'Unknown'}
                                    </span>
                                  </td>
                                  <td>{duplicate.transaction1.account}</td>
                                  <td>{duplicate.transaction1.user}</td>
                                  <td>{formatDate(duplicate.transaction1.posting_date || duplicate.transaction1.date)}</td>
                                  <td style={{ color: "#28a745", fontWeight: "bold" }}>
                                    {formatCurrency(duplicate.transaction1.amount)}
                                  </td>
                                  <td style={{ color: "#dc3545", fontWeight: "bold" }}>
                                    {formatCurrency(duplicate.transaction2.amount)}
                                  </td>
                                  <td style={{ color: "#925a9b", fontWeight: "bold" }}>
                                    {formatCurrency(duplicate.transaction1.amount + duplicate.transaction2.amount)}
                                  </td>
                                  <td>
                                    <span style={{ 
                                      padding: "2px 6px", 
                                      backgroundColor: RiskColor[getRiskLevelNumber(duplicate.risk_score || 0)], 
                                      color: "white", 
                                      borderRadius: "8px", 
                                      fontSize: "10px", 
                                      fontWeight: "bold" 
                                    }}>
                                      {duplicate.risk_score || 'N/A'}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{ 
                                      padding: "2px 6px", 
                                      backgroundColor: RiskColor[getRiskLevelNumber(duplicate.risk_score || 0)], 
                                      color: "white", 
                                      borderRadius: "8px", 
                                      fontSize: "10px", 
                                      fontWeight: "bold" 
                                    }}>
                                      {getRiskLevel(duplicate.risk_score || 0)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Duplicate Items by Type */}
                        <div style={{ marginBottom: "20px" }}>
                          <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                            Duplicate Items Grouped by Type
                          </h6>
                          {Object.entries(
                            duplicateEntries.reduce((groups, entry) => {
                              const type = entry.duplicate_type || 'Unknown';
                              if (!groups[type]) {
                                groups[type] = [];
                              }
                              groups[type].push(entry);
                              return groups;
                            }, {})
                          ).map(([type, items]) => (
                            <div key={type} style={{ 
                              marginBottom: "15px", 
                              border: "1px solid #e9ecef", 
                              borderRadius: "8px",
                              overflow: "hidden"
                            }}>
                              <div style={{ 
                                padding: "10px", 
                                backgroundColor: "#925a9b", 
                                color: "white", 
                                fontWeight: "bold",
                                fontSize: "14px"
                              }}>
                                {type} - {items.length} items
                              </div>
                              <table
                                width='100%'
                                border='1'
                                className='border'
                                cellSpacing='0'>
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>GL Account</th>
                                    <th>User</th>
                                    <th>Posting Date</th>
                                    <th>Amount</th>
                                    <th>Risk Score</th>
                                  </tr>
                                </thead>
                                <tbody style={{ textAlign: "center" }}>
                                  {items.map((item, index) => (
                                    <tr key={index} style={{ 
                                      backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white"
                                    }}>
                                      <td style={{ fontWeight: "bold" }}>{index + 1}</td>
                                      <td>{item.transaction1.account}</td>
                                      <td>{item.transaction1.user}</td>
                                      <td>{formatDate(item.transaction1.posting_date || item.transaction1.date)}</td>
                                      <td style={{ color: "#925a9b", fontWeight: "bold" }}>
                                        {formatCurrency(item.transaction1.amount + item.transaction2.amount)}
                                      </td>
                                      <td>
                                        <span style={{ 
                                          padding: "2px 6px", 
                                          backgroundColor: RiskColor[getRiskLevelNumber(item.risk_score || 0)], 
                                          color: "white", 
                                          borderRadius: "8px", 
                                          fontSize: "10px", 
                                          fontWeight: "bold" 
                                        }}>
                                          {item.risk_score || 'N/A'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>

                        {/* Duplicate Items by Risk Level */}
                        <div style={{ marginBottom: "20px" }}>
                          <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                            Duplicate Items Grouped by Risk Level
                          </h6>
                          {Object.entries(
                            duplicateEntries.reduce((groups, entry) => {
                              const riskLevel = getRiskLevel(entry.risk_score || 0);
                              if (!groups[riskLevel]) {
                                groups[riskLevel] = [];
                              }
                              groups[riskLevel].push(entry);
                              return groups;
                            }, {})
                          ).map(([riskLevel, items]) => (
                            <div key={riskLevel} style={{ 
                              marginBottom: "15px", 
                              border: "1px solid #e9ecef", 
                              borderRadius: "8px",
                              overflow: "hidden"
                            }}>
                              <div style={{ 
                                padding: "10px", 
                                backgroundColor: RiskColor[getRiskLevelNumber(items[0]?.risk_score || 0)], 
                                color: "white", 
                                fontWeight: "bold",
                                fontSize: "14px"
                              }}>
                                {riskLevel} Risk - {items.length} items
                              </div>
                              <table
                                width='100%'
                                border='1'
                                className='border'
                                cellSpacing='0'>
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Type</th>
                                    <th>GL Account</th>
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Risk Score</th>
                                  </tr>
                                </thead>
                                <tbody style={{ textAlign: "center" }}>
                                  {items.map((item, index) => (
                                    <tr key={index} style={{ 
                                      backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white"
                                    }}>
                                      <td style={{ fontWeight: "bold" }}>{index + 1}</td>
                                      <td>{item.duplicate_type}</td>
                                      <td>{item.transaction1.account}</td>
                                      <td>{item.transaction1.user}</td>
                                      <td style={{ color: "#925a9b", fontWeight: "bold" }}>
                                        {formatCurrency(item.transaction1.amount + item.transaction2.amount)}
                                      </td>
                                      <td>
                                        <span style={{ 
                                          padding: "2px 6px", 
                                          backgroundColor: RiskColor[getRiskLevelNumber(item.risk_score || 0)], 
                                          color: "white", 
                                          borderRadius: "8px", 
                                          fontSize: "10px", 
                                          fontWeight: "bold" 
                                        }}>
                                          {item.risk_score || 'N/A'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* API Duplicate Listing Data */}
                    {data?.duplicate_listing && data.duplicate_listing.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "20px 0" }}>API Duplicate Listing Data</h5>
                        
                        {/* API Data Overview */}
                        <div style={{ 
                          padding: "15px", 
                          backgroundColor: "#f8f9fa", 
                          border: "1px solid #e9ecef", 
                          borderRadius: "8px",
                          marginBottom: "20px"
                        }}>
                          <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                            API Duplicate Entries Overview
                          </h6>
                          <p style={{ 
                            margin: "0 0 15px 0", 
                            fontSize: "14px", 
                            lineHeight: "1.5",
                            color: "#333"
                          }}>
                            This section displays the duplicate entries fetched from the API endpoint, providing detailed information about each duplicate transaction including transaction ID, type, user, account, posting date, and risk assessment.
                          </p>
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
                              <strong style={{ color: "#925a9b" }}>Total API Entries</strong><br/>
                              {data.duplicate_listing.length}
                            </div>
                            <div style={{ 
                              padding: "10px", 
                              backgroundColor: "white", 
                              border: "1px solid #dee2e6", 
                              borderRadius: "6px",
                              textAlign: "center"
                            }}>
                              <strong style={{ color: "#925a9b" }}>Total Amount</strong><br/>
                              {formatCurrency(data.duplicate_listing.reduce((sum, entry) => sum + (entry.amount || 0), 0))}
                            </div>
                            <div style={{ 
                              padding: "10px", 
                              backgroundColor: "white", 
                              border: "1px solid #dee2e6", 
                              borderRadius: "6px",
                              textAlign: "center"
                            }}>
                              <strong style={{ color: "#925a9b" }}>Avg Similarity</strong><br/>
                              {Math.round(data.duplicate_listing.reduce((sum, entry) => sum + (entry.similarity_score || 0), 0) / data.duplicate_listing.length)}
                            </div>
                            <div style={{ 
                              padding: "10px", 
                              backgroundColor: "white", 
                              border: "1px solid #dee2e6", 
                              borderRadius: "6px",
                              textAlign: "center"
                            }}>
                              <strong style={{ color: "#925a9b" }}>Unique Users</strong><br/>
                              {new Set(data.duplicate_listing.map(entry => entry.user)).size}
                            </div>
                          </div>
                        </div>

                        {/* API Duplicate Listing Table */}
                        <div style={{ marginBottom: "20px" }}>
                          <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                            API Duplicate Entries Listing
                          </h6>
                          <table
                            width='100%'
                            border='1'
                            className='border'
                            cellSpacing='0'>
                            <thead>
                              <tr>
                                <th>Transaction ID</th>
                                <th>Type</th>
                                <th>User</th>
                                <th>Account</th>
                                <th>Posting Date</th>
                                <th>Group ID</th>
                                <th>Similarity Score</th>
                                <th>Amount</th>
                                <th>Risk Level</th>
                                <th>Severity</th>
                              </tr>
                            </thead>
                            <tbody style={{ textAlign: "center" }}>
                              {data.duplicate_listing.map((entry, index) => (
                                <tr key={index} style={{ 
                                  backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white"
                                }}>
                                  <td style={{ fontWeight: "bold" }}>{entry.transaction_id || `Transaction-${index + 1}`}</td>
                                  <td>
                                    <span style={{ 
                                      padding: "2px 8px", 
                                      backgroundColor: "#925a9b", 
                                      color: "white", 
                                      borderRadius: "12px", 
                                      fontSize: "10px", 
                                      fontWeight: "bold" 
                                    }}>
                                      {entry.duplicate_type?.toUpperCase() || 'N/A'}
                                    </span>
                                  </td>
                                  <td>{entry.user || entry.transaction1?.user || 'N/A'}</td>
                                  <td>
                                    <span style={{ 
                                      padding: "2px 6px", 
                                      backgroundColor: "#17a2b8", 
                                      color: "white", 
                                      borderRadius: "8px", 
                                      fontSize: "10px", 
                                      fontWeight: "bold" 
                                    }}>
                                      {entry.account || 'N/A'}
                                    </span>
                                  </td>
                                  <td>{formatDate(entry.posting_date)}</td>
                                  <td>{entry.duplicate_group_id || 'N/A'}</td>
                                  <td>
                                    <span style={{ 
                                      padding: "2px 6px", 
                                      backgroundColor: (entry.similarity_score || 0) > 90 ? '#28a745' : 
                                                       (entry.similarity_score || 0) > 70 ? '#ffc107' : '#dc3545', 
                                      color: "white", 
                                      borderRadius: "8px", 
                                      fontSize: "10px", 
                                      fontWeight: "bold" 
                                    }}>
                                      {entry.similarity_score || 0}%
                                    </span>
                                  </td>
                                  <td style={{ color: "#925a9b", fontWeight: "bold" }}>
                                    {entry.amount_formatted || formatCurrency(entry.amount || 0)}
                                  </td>
                                  <td>
                                    <span style={{ 
                                      padding: "2px 6px", 
                                      backgroundColor: RiskColor[getRiskLevelNumber(entry.risk_score || 0)], 
                                      color: "white", 
                                      borderRadius: "8px", 
                                      fontSize: "10px", 
                                      fontWeight: "bold" 
                                    }}>
                                      {entry.risk_level?.toUpperCase() || 'N/A'}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{ 
                                      padding: "2px 6px", 
                                      backgroundColor: entry.duplicate_severity === 'HIGH' ? '#dc3545' : 
                                                   entry.duplicate_severity === 'MEDIUM' ? '#ffc107' : '#28a745', 
                                      color: "white", 
                                      borderRadius: "8px", 
                                      fontSize: "10px", 
                                      fontWeight: "bold" 
                                    }}>
                                      {entry.duplicate_severity?.toUpperCase() || 'N/A'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Additional Duplicate Items Analysis */}
                    {duplicateEntries && duplicateEntries.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "20px 0" }}>Additional Duplicate Items Analysis</h5>
                        
                        {/* Duplicate Items by User */}
                        <div style={{ marginBottom: "20px" }}>
                          <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                            Duplicate Items Grouped by User
                          </h6>
                          {Object.entries(
                            duplicateEntries.reduce((groups, entry) => {
                              const user = entry.transaction1.user || 'Unknown User';
                              if (!groups[user]) {
                                groups[user] = [];
                              }
                              groups[user].push(entry);
                              return groups;
                            }, {})
                          ).map(([user, items]) => (
                            <div key={user} style={{ 
                              marginBottom: "15px", 
                              border: "1px solid #e9ecef", 
                              borderRadius: "8px",
                              overflow: "hidden"
                            }}>
                              <div style={{ 
                                padding: "10px", 
                                backgroundColor: "#6c757d", 
                                color: "white", 
                                fontWeight: "bold",
                                fontSize: "14px"
                              }}>
                                {user} - {items.length} items - Total: {formatCurrency(items.reduce((sum, item) => 
                                  sum + (item.transaction1.amount + item.transaction2.amount), 0
                                ))}
                              </div>
                              <table
                                width='100%'
                                border='1'
                                className='border'
                                cellSpacing='0'>
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Type</th>
                                    <th>GL Account</th>
                                    <th>Posting Date</th>
                                    <th>Amount</th>
                                    <th>Risk Score</th>
                                  </tr>
                                </thead>
                                <tbody style={{ textAlign: "center" }}>
                                  {items.map((item, index) => (
                                    <tr key={index} style={{ 
                                      backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white"
                                    }}>
                                      <td style={{ fontWeight: "bold" }}>{index + 1}</td>
                                      <td>{item.duplicate_type}</td>
                                      <td>{item.transaction1.account}</td>
                                      <td>{formatDate(item.transaction1.posting_date || item.transaction1.date)}</td>
                                      <td style={{ color: "#925a9b", fontWeight: "bold" }}>
                                        {formatCurrency(item.transaction1.amount + item.transaction2.amount)}
                                      </td>
                                      <td>
                                        <span style={{ 
                                          padding: "2px 6px", 
                                          backgroundColor: RiskColor[getRiskLevelNumber(item.risk_score || 0)], 
                                          color: "white", 
                                          borderRadius: "8px", 
                                          fontSize: "10px", 
                                          fontWeight: "bold" 
                                        }}>
                                          {item.risk_score || 'N/A'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>

                        {/* Duplicate Items by GL Account */}
                        <div style={{ marginBottom: "20px" }}>
                          <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                            Duplicate Items Grouped by GL Account
                          </h6>
                          {Object.entries(
                            duplicateEntries.reduce((groups, entry) => {
                              const account = entry.transaction1.account || 'Unknown Account';
                              if (!groups[account]) {
                                groups[account] = [];
                              }
                              groups[account].push(entry);
                              return groups;
                            }, {})
                          ).map(([account, items]) => (
                            <div key={account} style={{ 
                              marginBottom: "15px", 
                              border: "1px solid #e9ecef", 
                              borderRadius: "8px",
                              overflow: "hidden"
                            }}>
                              <div style={{ 
                                padding: "10px", 
                                backgroundColor: "#17a2b8", 
                                color: "white", 
                                fontWeight: "bold",
                                fontSize: "14px"
                              }}>
                                {account} - {items.length} items - Total: {formatCurrency(items.reduce((sum, item) => 
                                  sum + (item.transaction1.amount + item.transaction2.amount), 0
                                ))}
                              </div>
                              <table
                                width='100%'
                                border='1'
                                className='border'
                                cellSpacing='0'>
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Type</th>
                                    <th>User</th>
                                    <th>Posting Date</th>
                                    <th>Amount</th>
                                    <th>Risk Score</th>
                                  </tr>
                                </thead>
                                <tbody style={{ textAlign: "center" }}>
                                  {items.map((item, index) => (
                                    <tr key={index} style={{ 
                                      backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white"
                                    }}>
                                      <td style={{ fontWeight: "bold" }}>{index + 1}</td>
                                      <td>{item.duplicate_type}</td>
                                      <td>{item.transaction1.user}</td>
                                      <td>{formatDate(item.transaction1.posting_date || item.transaction1.date)}</td>
                                      <td style={{ color: "#925a9b", fontWeight: "bold" }}>
                                        {formatCurrency(item.transaction1.amount + item.transaction2.amount)}
                                      </td>
                                      <td>
                                        <span style={{ 
                                          padding: "2px 6px", 
                                          backgroundColor: RiskColor[getRiskLevelNumber(item.risk_score || 0)], 
                                          color: "white", 
                                          borderRadius: "8px", 
                                          fontSize: "10px", 
                                          fontWeight: "bold" 
                                        }}>
                                          {item.risk_score || 'N/A'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>

                        {/* Duplicate Items Summary Statistics */}
                        <div style={{ marginBottom: "20px" }}>
                          <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                            Duplicate Items Summary Statistics
                          </h6>
                          <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                            gap: "15px"
                          }}>
                            {/* By Type Statistics */}
                            <div style={{ 
                              padding: "15px", 
                              backgroundColor: "white", 
                              border: "1px solid #e9ecef", 
                              borderRadius: "8px"
                            }}>
                              <h6 style={{ margin: "0 0 10px 0", color: "#925a9b", fontWeight: "bold" }}>
                                By Duplicate Type
                              </h6>
                              {Object.entries(
                                duplicateEntries.reduce((groups, entry) => {
                                  const type = entry.duplicate_type || 'Unknown';
                                  if (!groups[type]) {
                                    groups[type] = { count: 0, totalAmount: 0, avgRisk: 0 };
                                  }
                                  groups[type].count++;
                                  groups[type].totalAmount += entry.transaction1.amount + entry.transaction2.amount;
                                  groups[type].avgRisk += entry.risk_score || 0;
                                  return groups;
                                }, {})
                              ).map(([type, stats]) => (
                                <div key={type} style={{ 
                                  marginBottom: "8px", 
                                  padding: "8px", 
                                  backgroundColor: "#f8f9fa", 
                                  borderRadius: "4px",
                                  fontSize: "12px"
                                }}>
                                  <strong>{type}:</strong> {stats.count} items, {formatCurrency(stats.totalAmount)}, Avg Risk: {(stats.avgRisk / stats.count).toFixed(1)}
                                </div>
                              ))}
                            </div>

                            {/* By Risk Level Statistics */}
                            <div style={{ 
                              padding: "15px", 
                              backgroundColor: "white", 
                              border: "1px solid #e9ecef", 
                              borderRadius: "8px"
                            }}>
                              <h6 style={{ margin: "0 0 10px 0", color: "#925a9b", fontWeight: "bold" }}>
                                By Risk Level
                              </h6>
                              {Object.entries(
                                duplicateEntries.reduce((groups, entry) => {
                                  const riskLevel = getRiskLevel(entry.risk_score || 0);
                                  if (!groups[riskLevel]) {
                                    groups[riskLevel] = { count: 0, totalAmount: 0, avgRisk: 0 };
                                  }
                                  groups[riskLevel].count++;
                                  groups[riskLevel].totalAmount += entry.transaction1.amount + entry.transaction2.amount;
                                  groups[riskLevel].avgRisk += entry.risk_score || 0;
                                  return groups;
                                }, {})
                              ).map(([riskLevel, stats]) => (
                                <div key={riskLevel} style={{ 
                                  marginBottom: "8px", 
                                  padding: "8px", 
                                  backgroundColor: "#f8f9fa", 
                                  borderRadius: "4px",
                                  fontSize: "12px"
                                }}>
                                  <strong>{riskLevel}:</strong> {stats.count} items, {formatCurrency(stats.totalAmount)}, Avg Risk: {(stats.avgRisk / stats.count).toFixed(1)}
                                </div>
                              ))}
                            </div>

                            {/* By User Statistics */}
                            <div style={{ 
                              padding: "15px", 
                              backgroundColor: "white", 
                              border: "1px solid #e9ecef", 
                              borderRadius: "8px"
                            }}>
                              <h6 style={{ margin: "0 0 10px 0", color: "#925a9b", fontWeight: "bold" }}>
                                By User
                              </h6>
                              {Object.entries(
                                duplicateEntries.reduce((groups, entry) => {
                                  const user = entry.transaction1.user || 'Unknown';
                                  if (!groups[user]) {
                                    groups[user] = { count: 0, totalAmount: 0, avgRisk: 0 };
                                  }
                                  groups[user].count++;
                                  groups[user].totalAmount += entry.transaction1.amount + entry.transaction2.amount;
                                  groups[user].avgRisk += entry.risk_score || 0;
                                  return groups;
                                }, {})
                              ).map(([user, stats]) => (
                                <div key={user} style={{ 
                                  marginBottom: "8px", 
                                  padding: "8px", 
                                  backgroundColor: "#f8f9fa", 
                                  borderRadius: "4px",
                                  fontSize: "12px"
                                }}>
                                  <strong>{user}:</strong> {stats.count} items, {formatCurrency(stats.totalAmount)}, Avg Risk: {(stats.avgRisk / stats.count).toFixed(1)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}





                    {/* Detailed Insights */}
                    {(recommendations.length > 0 || summary.compliance_issues?.length > 0) && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Detailed Insights & Recommendations</h5>
                        
                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                          <div style={{ marginBottom: "20px" }}>
                            <h6 style={{ margin: "10px 0" }}>Recommendations</h6>
                            <ul style={{ marginLeft: "20px" }}>
                              {recommendations.map((recommendation, index) => (
                                <li key={index}>
                                  <strong>{recommendation.action || recommendation.title || `Recommendation ${index + 1}`}:</strong> {recommendation.description || recommendation.recommendation || recommendation.message || 'No description available'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Audit Implications */}
                        {summary.compliance_issues && (
                          <div style={{ marginBottom: "20px" }}>
                            <h6 style={{ margin: "10px 0" }}>Audit Implications</h6>
                            <div>
                              <strong>Immediate Actions:</strong>
                              <ul style={{ marginLeft: "20px" }}>
                                                                  {summary.compliance_issues.map((issue, index) => (
                                    <li key={index}>{issue.description || issue}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Fallback Recommendations - Check other possible data paths */}
                        {recommendations.length === 0 && data?.recommendations && data.recommendations.length > 0 && (
                          <div style={{ marginBottom: "20px" }}>
                            <h6 style={{ margin: "10px 0" }}>Recommendations (Alternative Source)</h6>
                            <ul style={{ marginLeft: "20px" }}>
                              {data.recommendations.map((recommendation, index) => (
                                <li key={index}>
                                  <strong>{recommendation.action || recommendation.title || `Recommendation ${index + 1}`}:</strong> {recommendation.description || recommendation.recommendation || recommendation.message || 'No description available'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Critical Alerts */}
                        {criticalAlerts.length > 0 && (
                          <div style={{ marginBottom: "20px" }}>
                            <h6 style={{ margin: "10px 0", color: "#dc3545", fontWeight: "bold" }}>
                              Critical Alerts
                            </h6>
                            <div style={{ 
                              padding: "15px", 
                              backgroundColor: "#fff3cd", 
                              border: "1px solid #ffeaa7", 
                              borderRadius: "8px"
                            }}>
                              <ul style={{ marginLeft: "20px" }}>
                                {criticalAlerts.map((alert, index) => (
                                  <li key={index} style={{ marginBottom: "5px" }}>
                                    <strong style={{ color: "#856404" }}>{alert.severity || 'HIGH'}:</strong> {alert.message || alert.description || alert.issue || 'No message available'} - Action Required: {alert.action_required || 'Review and investigate'}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}


                      </div>
                    )}



                    {/* Conclusion */}
                    <div className='sections'>
                      <h5 style={{ margin: "20px 0" }}>Conclusion</h5>
                      <table
                        width='100%'
                        border='1'
                        className='border'
                        cellSpacing='0'>
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
                            <td>{overallRiskScore}%</td>
                            <td>
                              <span
                                style={{
                                  color: RiskColor[riskLevelNumber],
                                  fontWeight: "bold"
                                }}>
                                {riskLevel}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Total Duplicates Found</td>
                            <td>{duplicateEntries.length}</td>
                            <td>
                              <span style={{ color: duplicateEntries.length > 10 ? '#dc3545' : duplicateEntries.length > 5 ? '#ffc516' : '#40b159' }}>
                                {duplicateEntries.length > 10 ? 'High' : duplicateEntries.length > 5 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Total Amount Involved</td>
                            <td>{formatCurrency(totalDuplicateAmount || 0)}</td>
                            <td>
                              <span style={{ color: (totalDuplicateAmount || 0) > 10000000 ? '#dc3545' : (totalDuplicateAmount || 0) > 5000000 ? '#ffc516' : '#40b159' }}>
                                {(totalDuplicateAmount || 0) > 10000000 ? 'High' : (totalDuplicateAmount || 0) > 5000000 ? 'Medium' : 'Low'}
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

export default DuplicateAnalysisPDF; 