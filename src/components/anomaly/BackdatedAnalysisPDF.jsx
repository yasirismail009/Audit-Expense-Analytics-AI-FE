/** @format */

import React, { useRef } from "react";
import { Button, Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import logoFull from "../../assets/full_logo.svg";
import "./pdf.scss";

// Import chart components for PDF
import RiskDistributionChart from "../charts/RiskDistributionChart";
import AnomaliesDistributionChart from "../charts/AnomaliesDistributionChart";

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
                  backgroundColor: '#e65100',
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
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#e65100' }}>
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

const BackdatedAnalysisPDF = ({
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
  const backdatedList = data?.backdated_list || [];
  const chartData = data?.chart_data || {};
  const breakdowns = data?.breakdowns || {};
  const detailedInsights = data?.detailed_insights || {};
  const fileInfo = data?.file_info || {};

  // Helper functions
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

  // Calculate overall risk score
  const totalBackdated = analysisInfo.total_backdated_entries || 0;
  const totalTransactions = analysisInfo.total_transactions || 0;
  
  // Calculate risk based on actual risk scores from the data
  let overallRiskScore = 0;
  let riskLevel = 'LOW';
  
  if (backdatedList.length > 0) {
    // Calculate average risk score from all backdated entries
    const totalRiskScore = backdatedList.reduce((sum, entry) => sum + (entry.risk_score || 0), 0);
    overallRiskScore = Math.round(totalRiskScore / backdatedList.length);
    riskLevel = getRiskLevel(overallRiskScore);
  } else if (totalBackdated > 0) {
    // Fallback: calculate based on percentage if no detailed risk scores
    overallRiskScore = totalTransactions > 0 ? Math.round((totalBackdated / totalTransactions) * 100) : 0;
    riskLevel = getRiskLevel(overallRiskScore);
  }
  
  // Override with high risk if there are high-risk entries
  const highRiskEntries = analysisInfo.high_risk_entries || 0;
  const criticalRiskEntries = backdatedList.filter(entry => entry.risk_level === 'CRITICAL').length;
  
  if (criticalRiskEntries > 0 || highRiskEntries > 0) {
    riskLevel = criticalRiskEntries > 0 ? 'CRITICAL' : 'HIGH';
    overallRiskScore = Math.max(overallRiskScore, criticalRiskEntries > 0 ? 95 : 85);
  }

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

    var divToPrint = document.getElementById("BackdatedAnalysisPDF");
    htmlToPrint += divToPrint.outerHTML;

    let newWin = window.open("", "_blank");
    newWin.document.write(htmlToPrint);
    newWin.document.title = "Backdated Analysis Report";
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
            <div id='BackdatedAnalysisPDF' className='modal-content'>
              <div className='modal-body bg-white text-dark'>
                <div style={{ padding: "20px" }}>
                  <div className='content-section'>
                    <div className='sections'>
                      <table
                        width='100%'
                        style={{ borderBottom: "4px solid #e65100" }}>
                        <tbody>
                          <tr>
                            <td
                              align='left'
                              style={{ verticalAlign: "top", width: "33%" }}>
                              <h2 style={{ fontWeight: "bold" }}>Backdated Analysis</h2>
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
                                Total Backdated: {totalBackdated}
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className='sections'>
                      <h5 style={{ margin: "10px 0" }}>Backdated Analysis Overview</h5>
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
                          <strong>Test Description:</strong> This test identifies all the Journal Lines for which the Posting Date is after the Effective Date, i.e backdated entries. Both date fields are required to be present in the GL data for this test.
                        </p>
                        
                        <div style={{ 
                          padding: "10px", 
                          backgroundColor: "#fff3e0", 
                          border: "1px solid #ffcc02", 
                          borderRadius: "6px",
                          fontSize: "12px"
                        }}>
                          <strong style={{ color: "#e65100" }}>Key Requirements:</strong>
                          <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
                            <li>Both Posting Date and Effective Date must be present in GL data</li>
                            <li>Backdated entries are identified when Posting Date &gt; Effective Date</li>
                            <li>Risk assessment based on the number of days difference</li>
                          </ul>
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

                            {/* Backdated Statistics */}
                            <td style={{ width: "25%" }}>
                              <strong
                                style={{
                                  display: "block",
                                  padding: "10px",
                                  background: "#EEE",
                                }}>
                                Backdated Statistics
                              </strong>
                              <div style={{ padding: "10px" }}>
                                <b style={{ display: "block" }}>Total Backdated</b>
                                {totalBackdated}
                                <br />
                                <b style={{ display: "block" }}>Total Transactions</b>
                                {totalTransactions}
                                <br />
                                <b style={{ display: "block" }}>Total Amount</b>
                                {formatCurrency(analysisInfo.total_amount || 0)}
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
                                  Unique Users
                                  <br />
                                  <b>{analysisInfo.unique_users || 0}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Unique Documents
                                  <br />
                                  <b>{analysisInfo.unique_documents || 0}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Unique Accounts
                                  <br />
                                  <b>{analysisInfo.unique_accounts || 0}</b>
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
                        
                        {/* Risk Distribution Chart */}
                        <PDFChartWrapper 
                          title="Risk Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Risk Distribution" 
                              data={chartData.risk_distribution || {
                                'High Risk': analysisInfo.high_risk_entries || 0,
                                'Medium Risk': analysisInfo.medium_risk_entries || 0,
                                'Low Risk': analysisInfo.low_risk_entries || 0
                              }}
                              currency={currency}
                            />
                          }
                        >
                          <RiskDistributionChart 
                            data={chartData.risk_distribution || {
                              labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                              data: [
                                analysisInfo.high_risk_entries || 0,
                                analysisInfo.medium_risk_entries || 0,
                                analysisInfo.low_risk_entries || 0
                              ]
                            }}
                          />
                        </PDFChartWrapper>

                        {/* Days Difference Distribution Chart */}
                        <PDFChartWrapper 
                          title="Days Difference Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Days Difference Distribution" 
                              data={chartData.days_difference_distribution || {
                                '1-7 days': 0,
                                '8-30 days': 0,
                                '31-90 days': 0,
                                '90+ days': 0
                              }}
                              currency={currency}
                            />
                          }
                        >
                          <AnomaliesDistributionChart 
                            data={chartData.days_difference_distribution || {
                              labels: ['1-7 days', '8-30 days', '31-90 days', '90+ days'],
                              data: [0, 0, 0, 0]
                            }}
                          />
                        </PDFChartWrapper>

                        {/* User Breakdown Chart */}
                        <PDFChartWrapper 
                          title="Backdated Entries by User"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Backdated Entries by User" 
                              data={breakdowns.by_user?.reduce((acc, user) => {
                                acc[user.user_name] = user.total_amount;
                                return acc;
                              }, {}) || {}}
                              currency={currency}
                            />
                          }
                        >
                          <div style={{ padding: '15px', height: '100%' }}>
                            {breakdowns.by_user && breakdowns.by_user.length > 0 ? (
                              <div>
                                {breakdowns.by_user.slice(0, 5).map((user, index) => (
                                  <div key={index} style={{ 
                                    marginBottom: '10px', 
                                    padding: '10px', 
                                    backgroundColor: '#f8f9fa', 
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    <div style={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center', 
                                      marginBottom: '5px' 
                                    }}>
                                      <span style={{ fontWeight: 'bold', fontSize: '12px' }}>
                                        {user.user_name}
                                      </span>
                                      <span style={{ 
                                        backgroundColor: RiskColor[getRiskLevelNumber(user.risk_score)],
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: 'bold'
                                      }}>
                                        {user.risk_score}
                                      </span>
                                    </div>
                                    <div style={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center',
                                      fontSize: '11px',
                                      color: '#666'
                                    }}>
                                      <span>{user.transaction_count} entries</span>
                                      <span style={{ fontWeight: 'bold', color: '#e65100' }}>
                                        {formatCurrency(user.total_amount)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ 
                                height: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: '#666',
                                fontSize: '12px'
                              }}>
                                No user breakdown data available
                              </div>
                            )}
                          </div>
                        </PDFChartWrapper>

                        {/* Amount Distribution Chart */}
                        <PDFChartWrapper 
                          title="Amount Distribution Trend"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Amount Distribution Trend" 
                              data={backdatedList?.slice(0, 5).reduce((acc, entry, index) => {
                                acc[`Entry ${index + 1}`] = entry.amount || 0;
                                return acc;
                              }, {}) || {}}
                              currency={currency}
                            />
                          }
                        >
                          <div style={{ padding: '15px', height: '100%' }}>
                            {backdatedList && backdatedList.length > 0 ? (
                              <div>
                                <div style={{ 
                                  marginBottom: '10px', 
                                  padding: '10px', 
                                  backgroundColor: '#fff3e0', 
                                  borderRadius: '8px', 
                                  border: '1px solid #ffcc02' 
                                }}>
                                  <div style={{ fontWeight: 'bold', color: '#e65100', fontSize: '12px' }}>
                                    Total Amount: {formatCurrency(analysisInfo.total_amount || 0)}
                                  </div>
                                  <div style={{ fontSize: '10px', color: '#666' }}>
                                    Average per entry: {formatCurrency((analysisInfo.total_amount || 0) / (totalBackdated || 1))}
                                  </div>
                                </div>
                                
                                <div style={{ fontSize: '11px' }}>
                                  {backdatedList.slice(0, 5).map((entry, index) => (
                                    <div key={index} style={{ 
                                      marginBottom: '8px',
                                      padding: '8px',
                                      backgroundColor: '#f8f9fa',
                                      borderRadius: '4px'
                                    }}>
                                      <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        marginBottom: '2px'
                                      }}>
                                        <span style={{ fontWeight: 'bold' }}>Entry {index + 1}</span>
                                        <span style={{ color: '#e65100', fontWeight: 'bold' }}>
                                          {formatCurrency(entry.amount || 0)}
                                        </span>
                                      </div>
                                      <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        fontSize: '10px',
                                        color: '#666'
                                      }}>
                                        <span>Risk: {entry.risk_score || 'N/A'}</span>
                                        <span>{entry.user_name}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div style={{ 
                                height: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: '#666',
                                fontSize: '12px'
                              }}>
                                No amount data available
                              </div>
                            )}
                          </div>
                        </PDFChartWrapper>

                      </div>
                    </div>

                    {/* Detailed Backdated Entries Table */}
                    {backdatedList && backdatedList.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Detailed Backdated Entries Analysis</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Document Number</th>
                              <th>User</th>
                              <th>Account</th>
                              <th>Posting Date</th>
                              <th>Document Date</th>
                              <th>Days Difference</th>
                              <th>Amount</th>
                              <th>Risk Level</th>
                              <th>Risk Score</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {backdatedList.map((entry, index) => (
                              <tr key={index}>
                                <td>{entry.document_number}</td>
                                <td>{entry.user_name}</td>
                                <td>{entry.gl_account} - {entry.account_name}</td>
                                <td>{formatDate(entry.posting_date)}</td>
                                <td>{formatDate(entry.document_date)}</td>
                                <td>
                                  <span
                                    style={{
                                      color: Math.abs(entry.days_difference) > 30 ? '#dc3545' : Math.abs(entry.days_difference) > 7 ? '#ffc107' : '#28a745',
                                      fontWeight: "bold"
                                    }}>
                                    {entry.days_difference} days
                                  </span>
                                </td>
                                <td>{formatCurrency(entry.amount)}</td>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(entry.risk_score || 0)],
                                      fontWeight: "bold"
                                    }}>
                                    {entry.risk_level}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(entry.risk_score || 0)],
                                      fontWeight: "bold"
                                    }}>
                                    {entry.risk_score || 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* User Breakdown */}
                    {breakdowns.by_user && (
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
                              <th>Backdated Entries</th>
                              <th>Total Amount</th>
                              <th>Risk Score</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {breakdowns.by_user.map((user, index) => (
                              <tr key={index}>
                                <td>{user.user_name}</td>
                                <td>{user.transaction_count}</td>
                                <td>{formatCurrency(user.total_amount)}</td>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(user.risk_score)],
                                      fontWeight: "bold"
                                    }}>
                                    {user.risk_score}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Account Breakdown */}
                    {breakdowns.by_account && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Account Breakdown Analysis</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>GL Account</th>
                              <th>Backdated Entries</th>
                              <th>Total Amount</th>
                              <th>Risk Score</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {breakdowns.by_account.map((account, index) => (
                              <tr key={index}>
                                <td>{account.account} - {account.account_name}</td>
                                <td>{account.transaction_count}</td>
                                <td>{formatCurrency(account.total_amount)}</td>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(account.risk_score)],
                                      fontWeight: "bold"
                                    }}>
                                    {account.risk_score}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Document Breakdown */}
                    {breakdowns.by_document && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Document Breakdown Analysis</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>Document Number</th>
                              <th>Backdated Entries</th>
                              <th>Total Amount</th>
                              <th>Risk Score</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {breakdowns.by_document.map((doc, index) => (
                              <tr key={index}>
                                <td>{doc.document_number}</td>
                                <td>{doc.transaction_count}</td>
                                <td>{formatCurrency(doc.total_amount)}</td>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(doc.risk_score)],
                                      fontWeight: "bold"
                                    }}>
                                    {doc.risk_score}
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
                        
                        {/* Risk Analysis */}
                        {detailedInsights.risk_analysis && (
                          <div style={{ marginBottom: "20px" }}>
                            <h6 style={{ margin: "10px 0" }}>Risk Analysis</h6>
                            <table
                              width='100%'
                              border='1'
                              className='border'
                              cellSpacing='0'>
                              <thead>
                                <tr>
                                  <th>Metric</th>
                                  <th>Value</th>
                                </tr>
                              </thead>
                              <tbody style={{ textAlign: "center" }}>
                                <tr>
                                  <td>Overall Risk Level</td>
                                  <td>{detailedInsights.risk_analysis?.overall_risk_level || 'N/A'}</td>
                                </tr>
                                <tr>
                                  <td>High Risk Entries</td>
                                  <td>{detailedInsights.risk_analysis?.high_risk_entries || 0}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Audit Implications */}
                        {detailedInsights.audit_implications && (
                          <div style={{ marginBottom: "20px" }}>
                            <h6 style={{ margin: "10px 0" }}>Audit Implications</h6>
                            <ul style={{ marginLeft: "20px" }}>
                              {detailedInsights.audit_implications.map((implication, index) => (
                                <li key={index}>
                                  <strong>{implication.implication}:</strong> {implication.description}
                                </li>
                              ))}
                            </ul>
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
                            <td>Total Backdated Found</td>
                            <td>{totalBackdated}</td>
                            <td>
                              <span style={{ color: totalBackdated > 10 ? '#dc3545' : totalBackdated > 5 ? '#ffc516' : '#40b159' }}>
                                {totalBackdated > 10 ? 'High' : totalBackdated > 5 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td>Total Amount Involved</td>
                            <td>{formatCurrency(analysisInfo.total_amount || 0)}</td>
                            <td>
                              <span style={{ color: (analysisInfo.total_amount || 0) > 10000000 ? '#dc3545' : (analysisInfo.total_amount || 0) > 5000000 ? '#ffc516' : '#40b159' }}>
                                {(analysisInfo.total_amount || 0) > 10000000 ? 'High' : (analysisInfo.total_amount || 0) > 5000000 ? 'Medium' : 'Low'}
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

export default BackdatedAnalysisPDF; 