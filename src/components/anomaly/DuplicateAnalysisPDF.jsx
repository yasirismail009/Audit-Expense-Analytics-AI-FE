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
      <div className='chart-title'>{title}</div>
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
  const analysisInfo = data?.analysis_info || {};
  const duplicateList = data?.duplicate_list || [];
  const chartData = data?.chart_data || {};
  const breakdowns = data?.breakdowns || {};
  const detailedInsights = data?.detailed_insights || {};
  const fileInfo = data?.file_info || {};

  // Calculate overall risk score
  const totalDuplicates = analysisInfo.total_duplicate_groups || 0;
  const totalTransactions = analysisInfo.total_transactions || 0;
  const overallRiskScore = totalTransactions > 0 ? Math.round((totalDuplicates / totalTransactions) * 100) : 0;

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

  const riskLevel = getRiskLevel(overallRiskScore);
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
      "</style>";

    var divToPrint = document.getElementById("DuplicateAnalysisPDF");
    htmlToPrint += divToPrint.outerHTML;

    let newWin = window.open("", "_blank");
    newWin.document.write(htmlToPrint);
    newWin.document.title = "Duplicate Analysis Report";
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
                              <b>Risk Level:</b> {riskLevel}
                              <br />
                              <p style={{ maxWidth: "90%" }}>
                                Total Duplicates: {totalDuplicates}
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className='sections'>
                      <h5 style={{ margin: "10px 0" }}>Duplicate Analysis Overview</h5>
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
                          <strong>Test Description:</strong> This test identifies Document Numbers which have identical characteristics. The classification for Duplicates are categorized as below:
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
                                {totalDuplicates}
                                <br />
                                <b style={{ display: "block" }}>Total Transactions</b>
                                {analysisInfo.total_duplicate_transactions || 0}
                                <br />
                                <b style={{ display: "block" }}>Total Amount</b>
                                {formatCurrency(analysisInfo.total_amount_involved || 0)}
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
                                  Duplicate Types
                                  <br />
                                  <b>{Object.keys(breakdowns.duplicate_flags || {}).length}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Users Involved
                                  <br />
                                  <b>{Object.keys(breakdowns.user_breakdown || {}).length}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  GL Accounts
                                  <br />
                                  <b>{Object.keys(breakdowns.fs_line_breakdown || {}).length}</b>
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
                      
                      {/* Charts Grid - 2 columns */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                        
                        {/* Duplicate Type Chart */}
                        <PDFChartWrapper 
                          title="Duplicate Types Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Duplicate Types Distribution" 
                              data={chartData.duplicate_type_chart || breakdowns.duplicate_flags}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateTypeChart data={data} currency={currency} />
                        </PDFChartWrapper>

                        {/* Risk Distribution Chart */}
                        <PDFChartWrapper 
                          title="Risk Level Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Risk Level Distribution" 
                              data={chartData.risk_level_chart || breakdowns.risk_breakdown}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateRiskChart data={data} currency={currency} />
                        </PDFChartWrapper>

                        {/* User Activity Chart */}
                        <PDFChartWrapper 
                          title="Duplicate Activity by User"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Duplicate Activity by User" 
                              data={chartData.user_breakdown_chart || breakdowns.user_breakdown}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateUserChart data={data} currency={currency} />
                        </PDFChartWrapper>

                        {/* Amount Distribution Chart */}
                        <PDFChartWrapper 
                          title="Duplicate Amount Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Duplicate Amount Distribution" 
                              data={chartData.amount_distribution_chart}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateAmountChart data={data} currency={currency} />
                        </PDFChartWrapper>

                        {/* Financial Statement Line Chart */}
                        <PDFChartWrapper 
                          title="Financial Statement Line Breakdown"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Financial Statement Line Breakdown" 
                              data={chartData.fs_line_chart || breakdowns.fs_line_breakdown}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateFSLineChart data={data} currency={currency} />
                        </PDFChartWrapper>

                        {/* Monthly Trend Chart */}
                        <PDFChartWrapper 
                          title="Monthly Duplicate Trend"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Monthly Duplicate Trend" 
                              data={chartData.monthly_trend_chart}
                              currency={currency}
                            />
                          }
                        >
                          <DuplicateMonthlyTrendChart data={data} currency={currency} />
                        </PDFChartWrapper>

                      </div>
                    </div>

                    {/* Duplicate Type Breakdown */}
                    {breakdowns.duplicate_flags && (
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
                            {Object.entries(breakdowns.duplicate_flags).map(([type, details], index) => (
                              <tr key={type}>
                                <td>{type}</td>
                                <td>{details.count}</td>
                                <td>{details.transactions}</td>
                                <td>{formatCurrency(details.amount)}</td>
                                <td>{formatCurrency(details.debit_amount)}</td>
                                <td>{formatCurrency(details.credit_amount)}</td>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(details.amount > 10000000 ? 80 : details.amount > 5000000 ? 60 : 40)],
                                      fontWeight: "bold"
                                    }}>
                                    {details.amount > 10000000 ? 'HIGH' : details.amount > 5000000 ? 'MEDIUM' : 'LOW'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* User Breakdown */}
                    {breakdowns.user_breakdown && (
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
                            {Object.entries(breakdowns.user_breakdown).map(([userName, userData], index) => (
                              <tr key={index}>
                                <td>{userName}</td>
                                <td>{userData.duplicate_groups}</td>
                                <td>{userData.transactions}</td>
                                <td>{formatCurrency(userData.amount)}</td>
                                <td>{userData.unique_accounts}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* GL Account Breakdown */}
                    {breakdowns.fs_line_breakdown && (
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
                            {Object.entries(breakdowns.fs_line_breakdown).map(([account, accountData], index) => (
                              <tr key={index}>
                                <td>{account}</td>
                                <td>{accountData.duplicate_groups}</td>
                                <td>{accountData.transactions}</td>
                                <td>{formatCurrency(accountData.amount)}</td>
                                <td>{formatCurrency(accountData.debit_amount)}</td>
                                <td>{formatCurrency(accountData.credit_amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Risk Breakdown */}
                    {breakdowns.risk_breakdown && (
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
                            {Object.entries(breakdowns.risk_breakdown).map(([riskLevel, riskData], index) => (
                              <tr key={index}>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(riskLevel === 'CRITICAL' ? 80 : riskLevel === 'HIGH' ? 60 : riskLevel === 'MEDIUM' ? 40 : 20)],
                                      fontWeight: "bold"
                                    }}>
                                    {riskLevel}
                                  </span>
                                </td>
                                <td>{riskData.groups}</td>
                                <td>{riskData.transactions}</td>
                                <td>{formatCurrency(riskData.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Detailed Duplicates List */}
                    {duplicateList && duplicateList.length > 0 && (
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
                            {duplicateList.map((duplicate, index) => (
                              <tr key={index}>
                                <td>{duplicate.duplicate_type}</td>
                                <td>{duplicate.gl_account}</td>
                                <td>{duplicate.user_name}</td>
                                <td>{formatDate(duplicate.posting_date)}</td>
                                <td>{formatCurrency(duplicate.amount)}</td>
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

                    {/* Detailed Insights */}
                    {detailedInsights && Object.keys(detailedInsights).length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Detailed Insights & Recommendations</h5>
                        
                        {/* Risk Assessment */}
                        {detailedInsights.risk_assessment && (
                          <div style={{ marginBottom: "20px" }}>
                            <h6 style={{ margin: "10px 0" }}>Risk Assessment</h6>
                            {detailedInsights.risk_assessment.mitigation_suggestions && (
                              <div>
                                <strong>Mitigation Suggestions:</strong>
                                <ul style={{ marginLeft: "20px" }}>
                                  {detailedInsights.risk_assessment.mitigation_suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Audit Recommendations */}
                        {detailedInsights.audit_recommendations && (
                          <div style={{ marginBottom: "20px" }}>
                            <h6 style={{ margin: "10px 0" }}>Audit Recommendations</h6>
                            {detailedInsights.audit_recommendations.monitoring_suggestions && (
                              <div>
                                <strong>Monitoring Suggestions:</strong>
                                <ul style={{ marginLeft: "20px" }}>
                                  {detailedInsights.audit_recommendations.monitoring_suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Comparative Analysis */}
                        {detailedInsights.comparative_analysis && (
                          <div>
                            <h6 style={{ margin: "10px 0" }}>Comparative Analysis</h6>
                            <table
                              width='100%'
                              border='1'
                              className='border'
                              cellSpacing='0'>
                              <thead>
                                <tr>
                                  <th>Metric</th>
                                  <th>Value</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody style={{ textAlign: "center" }}>
                                <tr>
                                  <td>Duplicate Transaction Rate</td>
                                  <td>{detailedInsights.comparative_analysis.duplicate_percentage?.transaction_count?.toFixed(1) || 0}%</td>
                                  <td>
                                    <span style={{ color: "#6c757d" }}>Current Rate</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Current Duplicate Rate</td>
                                  <td>{detailedInsights.comparative_analysis.benchmark_comparison?.current_duplicate_rate?.toFixed(1) || 0}%</td>
                                  <td>
                                    <span style={{ color: "#6c757d" }}>Benchmark</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>vs Industry Average</td>
                                  <td>{detailedInsights.comparative_analysis.benchmark_comparison?.status || 'Unknown'}</td>
                                  <td>
                                    <span
                                      style={{
                                        color: detailedInsights.comparative_analysis.benchmark_comparison?.status === 'Above Average' ? '#dc3545' : '#28a745',
                                        fontWeight: "bold"
                                      }}>
                                      {detailedInsights.comparative_analysis.benchmark_comparison?.status || 'Unknown'}
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
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
                            <td>{totalDuplicates}</td>
                            <td>
                              <span style={{ color: totalDuplicates > 10 ? '#dc3545' : totalDuplicates > 5 ? '#ffc516' : '#40b159' }}>
                                {totalDuplicates > 10 ? 'High' : totalDuplicates > 5 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Total Amount Involved</td>
                            <td>{formatCurrency(analysisInfo.total_amount_involved || 0)}</td>
                            <td>
                              <span style={{ color: (analysisInfo.total_amount_involved || 0) > 10000000 ? '#dc3545' : (analysisInfo.total_amount_involved || 0) > 5000000 ? '#ffc516' : '#40b159' }}>
                                {(analysisInfo.total_amount_involved || 0) > 10000000 ? 'High' : (analysisInfo.total_amount_involved || 0) > 5000000 ? 'Medium' : 'Low'}
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

export default DuplicateAnalysisPDF; 