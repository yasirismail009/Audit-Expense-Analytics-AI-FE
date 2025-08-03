/** @format */

import React, { useRef } from "react";
import { Button, Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import logoFull from "../../assets/full_logo.svg";
import "./pdf.scss";

// Import chart components for PDF
import UnusualDaysDashboardChart from "../charts/UnusualDaysDashboardPDF";
import UnusualDaysTrendChart from "../charts/UnusualDaysTrendChart";

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

const UnusualDaysAnalysisPDF = ({
  open,
  setOpen,
  data,
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

  // Extract data from the API structure
  const fileInfo = data?.file_info || {};
  const analysisInfo = data?.analysis_info || {};
  const summary = data?.summary || {};
  const unusualDaysAnalysis = data?.unusual_days_analysis || {};
  const riskAssessment = data?.risk_assessment || {};
  
  // Extract specific data
  const weekendPostings = unusualDaysAnalysis.weekend_postings || [];
  const unusualDays = unusualDaysAnalysis.unusual_days || [];
  const dayOfWeekActivity = unusualDaysAnalysis.day_of_week_activity || {};
  const userDayPatterns = unusualDaysAnalysis.user_day_patterns || [];
  const fsLineDayPatterns = unusualDaysAnalysis.fs_line_day_patterns || {};
  
  // Calculate totals
  const totalWeekendTransactions = weekendPostings.length;
  const totalWeekendAmount = weekendPostings.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  const totalUnusualDays = unusualDays.length;
  const avgRiskScore = weekendPostings.length > 0 ? 
    weekendPostings.reduce((sum, transaction) => sum + (transaction.risk_score || 0), 0) / weekendPostings.length : 0;
  
  // Get unique users from weekend postings
  const uniqueUsers = [...new Set(weekendPostings.map(t => t.user_name))];

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
  const overallRiskLevel = getRiskLevel(avgRiskScore);

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
      "</style>";

    var divToPrint = document.getElementById("UnusualDaysAnalysisPDF");
    htmlToPrint += divToPrint.outerHTML;

    let newWin = window.open("", "_blank");
    newWin.document.write(htmlToPrint);
    newWin.document.title = "Unusual Days Analysis Report";
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
            <div id='UnusualDaysAnalysisPDF' className='modal-content'>
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
                              <h2 style={{ fontWeight: "bold" }}>Unusual Days Analysis</h2>
                              <b>Analysis ID:</b> {fileInfo.file_id || "N/A"}
                              <br />
                              <b>Status:</b> {fileInfo.status || "COMPLETED"}
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
                              Analysis Date: {formatDate(analysisInfo.analysis_date)}
                              <br />
                              <b>Risk Level:</b> {overallRiskLevel}
                              <br />
                              <p style={{ maxWidth: "90%" }}>
                                Weekend Transactions: {totalWeekendTransactions}
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className='sections'>
                      <h5 style={{ margin: "10px 0" }}>Unusual Days Analysis Overview</h5>
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
                          <strong>Test Description:</strong> This analysis identifies transactions on unusual business days (weekends, holidays, etc.) and patterns that deviate from normal business operations. The classification for Unusual Days are categorized as below:
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
                            <strong style={{ color: "#925a9b" }}>Weekend Postings</strong><br/>
                            Transactions posted on weekends (Friday/Saturday)
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>High Activity Days</strong><br/>
                            Days with unusually high transaction volumes
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Low Activity Days</strong><br/>
                            Days with unusually low transaction volumes
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Holiday Patterns</strong><br/>
                            Transactions on holidays or non-business days
                          </div>
                        </div>
                      </div>

                      <h5 style={{ margin: "20px 0 10px 0" }}>Analysis Summary</h5>
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
                                    {avgRiskScore.toFixed(1)}%
                                  </b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Risk Level
                                  <br />
                                  <b
                                    style={{
                                      color: RiskColor[riskLevelNumber],
                                    }}>
                                    {overallRiskLevel}
                                  </b>
                                </span>
                              </div>
                            </td>

                            {/* Weekend Statistics */}
                            <td style={{ width: "25%" }}>
                              <strong
                                style={{
                                  display: "block",
                                  padding: "10px",
                                  background: "#EEE",
                                }}>
                                Weekend Statistics
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <b style={{ display: "block" }}>Weekend Transactions</b>
                                {totalWeekendTransactions}
                                <br />
                                <b style={{ display: "block" }}>Weekend Amount</b>
                                {formatCurrency(totalWeekendAmount)}
                                <br />
                                <b style={{ display: "block" }}>Users Involved</b>
                                {uniqueUsers.length}
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
                                  Unusual Days
                                  <br />
                                  <b>{totalUnusualDays}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Total Transactions
                                  <br />
                                  <b>{summary.total_transactions || 0}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Risk Score
                                  <br />
                                  <b>{summary.overall_risk_score?.toFixed(1) || 0}%</b>
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
                      
                      {/* Unusual Days Dashboard Overview */}
                      <div style={{ 
                        padding: "15px", 
                        backgroundColor: "#f8f9fa", 
                        border: "1px solid #e9ecef", 
                        borderRadius: "8px",
                        marginBottom: "20px"
                      }}>
                        <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                          Unusual Days Analysis Dashboard Overview
                        </h6>
                        <p style={{ 
                          margin: "0 0 15px 0", 
                          fontSize: "14px", 
                          lineHeight: "1.5",
                          color: "#333"
                        }}>
                          This dashboard provides comprehensive visual analysis of unusual days transactions, including weekend activity, day of week patterns, unusual days distribution, risk assessment, user patterns, and trend analysis.
                        </p>
                      </div>
                      
                      {/* Main Chart - Full Width */}
                      <div style={{ width: "100%", marginBottom: "30px" }}>
                        <PDFChartWrapper 
                          title="Weekend Activity by User"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Weekend Activity by User" 
                              data={weekendPostings.reduce((acc, transaction) => {
                                if (!acc[transaction.user_name]) {
                                  acc[transaction.user_name] = { amount: 0, count: 0 };
                                }
                                acc[transaction.user_name].amount += transaction.amount || 0;
                                acc[transaction.user_name].count += 1;
                                return acc;
                              }, {})}
                              currency={currency}
                            />
                          }
                        >
                          <UnusualDaysDashboardChart data={data} />
                        </PDFChartWrapper>
                      </div>

                    
                    </div>

                    {/* Weekend Postings Table */}
                    {weekendPostings.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Weekend Postings Analysis</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>User</th>
                              <th>GL Account</th>
                              <th>Amount</th>
                              <th>Day</th>
                              <th>Risk Score</th>
                              <th>Risk Level</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {weekendPostings.map((transaction, index) => (
                              <tr key={index}>
                                <td>{transaction.posting_date}</td>
                                <td>{transaction.user_name}</td>
                                <td>{transaction.gl_account}</td>
                                <td>{formatCurrency(transaction.amount)}</td>
                                <td>{transaction.day_name}</td>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(transaction.risk_score || 0)],
                                      fontWeight: "bold"
                                    }}>
                                    {transaction.risk_score || 'N/A'}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(transaction.risk_score || 0)],
                                      fontWeight: "bold"
                                    }}>
                                    {getRiskLevel(transaction.risk_score || 0)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Unusual Days Table */}
                    {unusualDays.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Unusual Days Patterns</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Day</th>
                              <th>Type</th>
                              <th>Transaction Count</th>
                              <th>Average Expected</th>
                              <th>Deviation %</th>
                              <th>Risk Level</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {unusualDays.map((day, index) => (
                              <tr key={index}>
                                <td>{day.day_name}</td>
                                <td>{day.unusual_type.replace('_', ' ').toUpperCase()}</td>
                                <td>{day.transaction_count}</td>
                                <td>{day.average_transactions}</td>
                                <td>{day.deviation_percentage?.toFixed(1)}%</td>
                                <td>
                                  <span
                                    style={{
                                      color: day.unusual_type === 'high_activity' ? RiskColor[3] : RiskColor[2],
                                      fontWeight: "bold"
                                    }}>
                                    {day.unusual_type === 'high_activity' ? 'HIGH' : 'MEDIUM'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* User Day Patterns */}
                    {userDayPatterns.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>User Day Patterns</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Total Amount</th>
                              <th>Total Transactions</th>
                              <th>Weekend Amount</th>
                              <th>Weekend Transactions</th>
                              <th>Weekend %</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {userDayPatterns.map((user, index) => (
                              <tr key={index}>
                                <td>{user.user_name}</td>
                                <td>{formatCurrency(user.total_amount)}</td>
                                <td>{user.total_transactions}</td>
                                <td>{formatCurrency(user.weekend_amount)}</td>
                                <td>{user.weekend_transactions}</td>
                                <td>
                                  {user.total_transactions > 0 ? 
                                    ((user.weekend_transactions / user.total_transactions) * 100).toFixed(1) : 0}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Risk Assessment */}
                    {riskAssessment && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Risk Assessment Summary</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Risk Metric</th>
                              <th>Value</th>
                              <th>Risk Level</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            <tr>
                              <td>Weekend Risk Score</td>
                              <td>{riskAssessment.weekend_risk_score?.toFixed(1) || 0}%</td>
                              <td>
                                <span
                                  style={{
                                    color: RiskColor[getRiskLevelNumber(riskAssessment.weekend_risk_score || 0)],
                                    fontWeight: "bold"
                                  }}>
                                  {getRiskLevel(riskAssessment.weekend_risk_score || 0)}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td>Pattern Risk Score</td>
                              <td>{riskAssessment.unusual_pattern_risk_score?.toFixed(1) || 0}%</td>
                              <td>
                                <span
                                  style={{
                                    color: RiskColor[getRiskLevelNumber(riskAssessment.unusual_pattern_risk_score || 0)],
                                    fontWeight: "bold"
                                  }}>
                                  {getRiskLevel(riskAssessment.unusual_pattern_risk_score || 0)}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td>Overall Risk Score</td>
                              <td>{riskAssessment.overall_risk_score?.toFixed(1) || 0}%</td>
                              <td>
                                <span
                                  style={{
                                    color: RiskColor[getRiskLevelNumber(riskAssessment.overall_risk_score || 0)],
                                    fontWeight: "bold"
                                  }}>
                                  {getRiskLevel(riskAssessment.overall_risk_score || 0)}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Risk Recommendations */}
                        {riskAssessment.risk_assessment?.recommendations && (
                          <div style={{ marginTop: "20px" }}>
                            <h6 style={{ margin: "10px 0", color: "#925a9b", fontWeight: "bold" }}>
                              Recommendations
                            </h6>
                            <div style={{ 
                              padding: "15px", 
                              backgroundColor: "#f8f9fa", 
                              border: "1px solid #e9ecef", 
                              borderRadius: "8px"
                            }}>
                              <ul style={{ marginLeft: "20px" }}>
                                {riskAssessment.risk_assessment.recommendations.map((recommendation, index) => (
                                  <li key={index} style={{ marginBottom: "5px" }}>
                                    {recommendation}
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
                            <td>{avgRiskScore.toFixed(1)}%</td>
                            <td>
                              <span
                                style={{
                                  color: RiskColor[riskLevelNumber],
                                  fontWeight: "bold"
                                }}>
                                {overallRiskLevel}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Weekend Transactions</td>
                            <td>{totalWeekendTransactions}</td>
                            <td>
                              <span style={{ color: totalWeekendTransactions > 20 ? '#dc3545' : totalWeekendTransactions > 10 ? '#ffc516' : '#40b159' }}>
                                {totalWeekendTransactions > 20 ? 'High' : totalWeekendTransactions > 10 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Weekend Amount</td>
                            <td>{formatCurrency(totalWeekendAmount)}</td>
                            <td>
                              <span style={{ color: totalWeekendAmount > 10000000 ? '#dc3545' : totalWeekendAmount > 5000000 ? '#ffc516' : '#40b159' }}>
                                {totalWeekendAmount > 10000000 ? 'High' : totalWeekendAmount > 5000000 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Unusual Days</td>
                            <td>{totalUnusualDays}</td>
                            <td>
                              <span style={{ color: totalUnusualDays > 5 ? '#dc3545' : totalUnusualDays > 3 ? '#ffc516' : '#40b159' }}>
                                {totalUnusualDays > 5 ? 'High' : totalUnusualDays > 3 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
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

export default UnusualDaysAnalysisPDF; 