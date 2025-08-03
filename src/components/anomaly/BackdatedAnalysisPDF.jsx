/** @format */

import React, { useRef } from "react";
import { Button, Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import logoFull from "../../assets/full_logo.svg";
import "./pdf.scss";

// Import chart components for PDF
import RiskDistributionChart from '../charts/RiskDistributionChart';
import AnomaliesDistributionChart from '../charts/AnomaliesDistributionChart';

// Import Recharts for custom gradient charts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Area, AreaChart } from 'recharts';

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

  // Extract data from the new API structure
  const fileInfo = data?.file_info || {};
  const analysisInfo = data?.analysis_info || {};
  const summaryStats = data?.summary_statistics || {};
  const riskAssessment = data?.risk_assessment || {};
  const chartData = data?.chart_data || {};
  const backdatedEntries = data?.backdated_entries || [];
  const backdatedPatterns = data?.backdated_patterns || {};
  const recommendations = data?.recommendations || [];
  const auditImplications = data?.audit_implications || {};
  const criticalAlerts = data?.critical_alerts || {};

  // Calculate overall risk score based on new data structure
  const totalBackdated = summaryStats.backdated_transactions || 0;
  const totalTransactions = summaryStats.total_transactions || 0;
  const overallRiskScore = summaryStats.avg_risk_score || 0;
  const riskLevel = riskAssessment.risk_level || 'LOW';

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
                        style={{ borderBottom: "4px solid #925a9b" }}>
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
                            <strong style={{ color: "#925a9b" }}>Detection Criteria</strong><br/>
                            Posting Date &gt; Effective Date
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Required Fields</strong><br/>
                            Both Posting Date and Effective Date must be present
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Risk Assessment</strong><br/>
                            Higher risk for longer date differences
                          </div>
                          
                          <div style={{ 
                            padding: "10px", 
                            backgroundColor: "white", 
                            border: "1px solid #dee2e6", 
                            borderRadius: "6px"
                          }}>
                            <strong style={{ color: "#925a9b" }}>Audit Implications</strong><br/>
                            May indicate timing manipulation or errors
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
                                {formatCurrency(summaryStats.total_backdated_amount || 0)}
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
                                  Avg Days
                                  <br />
                                  <b>{summaryStats.avg_backdated_days || 0}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Avg Amount
                                  <br />
                                  <b>{formatCurrency(summaryStats.avg_backdated_amount || 0)}</b>
                                </span>
                                <span style={{ display: "block" }}>
                                  Max Days
                                  <br />
                                  <b>{summaryStats.max_backdated_days || 0}</b>
                                </span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <br />
                    <br />

                    {/* Charts Section - All Six Charts */}
                    <div className='sections'>
                      <h5 style={{ margin: "20px 0" }}>Visual Analysis Dashboard</h5>
                      
                      {/* Charts Grid - 2 columns */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                        
                        {/* Risk Distribution Chart */}
                        <PDFChartWrapper 
                          title="Risk Level Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Risk Level Distribution" 
                              data={chartData.risk_level_distribution || {
                                labels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                                data: [
                                  riskAssessment.risk_distribution?.low_risk || 0,
                                  riskAssessment.risk_distribution?.medium_risk || 0,
                                  riskAssessment.risk_distribution?.high_risk || 0,
                                  riskAssessment.risk_distribution?.critical_risk || 0
                                ]
                              }}
                              currency={currency}
                            />
                          }
                        >
                          <RiskDistributionChart 
                            data={chartData.risk_level_distribution || {
                              labels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                              data: [
                                riskAssessment.risk_distribution?.low_risk || 0,
                                riskAssessment.risk_distribution?.medium_risk || 0,
                                riskAssessment.risk_distribution?.high_risk || 0,
                                riskAssessment.risk_distribution?.critical_risk || 0
                              ]
                            }}
                            title="Risk Level Distribution"
                            subtitle="Distribution of backdated entries by risk level"
                          />
                        </PDFChartWrapper>

                        {/* Days Difference Distribution Chart */}
                        <PDFChartWrapper 
                          title="Backdated Days Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Backdated Days Distribution" 
                              data={(() => {
                                const distribution = {
                                  '1-7 days': 0,
                                  '8-30 days': 0,
                                  '31-90 days': 0,
                                  '91-365 days': 0,
                                  '365+ days': 0
                                };
                                
                                if (backdatedEntries && backdatedEntries.length > 0) {
                                  backdatedEntries.forEach(entry => {
                                    const days = Math.abs(entry.days_difference || 0);
                                    if (days <= 7) distribution['1-7 days']++;
                                    else if (days <= 30) distribution['8-30 days']++;
                                    else if (days <= 90) distribution['31-90 days']++;
                                    else if (days <= 365) distribution['91-365 days']++;
                                    else distribution['365+ days']++;
                                  });
                                }
                                
                                return {
                                  labels: Object.keys(distribution),
                                  data: Object.values(distribution),
                                  colors: ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384', '#36A2EB']
                                };
                              })()}
                              currency={currency}
                            />
                          }
                        >
                          <AnomaliesDistributionChart 
                            data={(() => {
                              const distribution = {
                                '1-7 days': 0,
                                '8-30 days': 0,
                                '31-90 days': 0,
                                '91-365 days': 0,
                                '365+ days': 0
                              };
                              
                              if (backdatedEntries && backdatedEntries.length > 0) {
                                backdatedEntries.forEach(entry => {
                                  const days = Math.abs(entry.days_difference || 0);
                                  if (days <= 7) distribution['1-7 days']++;
                                  else if (days <= 30) distribution['8-30 days']++;
                                  else if (days <= 90) distribution['31-90 days']++;
                                  else if (days <= 365) distribution['91-365 days']++;
                                  else distribution['365+ days']++;
                                });
                              }
                              
                              return {
                                labels: Object.keys(distribution),
                                data: Object.values(distribution),
                                colors: ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384', '#36A2EB']
                              };
                            })()}
                            title="Backdated Days Distribution"
                            subtitle="Distribution of backdated entries by days difference"
                          />
                        </PDFChartWrapper>

                        {/* Backdated Entries by User Chart */}
                        <PDFChartWrapper 
                          title="Backdated Entries by User"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Backdated Entries by User" 
                              data={chartData.backdated_activity_by_user}
                              currency={currency}
                            />
                          }
                        >
                          <div style={{ height: 300 }}>
                            {chartData.backdated_activity_by_user && chartData.backdated_activity_by_user.labels.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.backdated_activity_by_user.labels.map((user, index) => ({
                                  user: user,
                                  entries: chartData.backdated_activity_by_user.data[index] || 0
                                }))}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis 
                                    dataKey="user" 
                                    tick={{ fontSize: 12 }} 
                                    axisLine={false} 
                                    tickLine={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis 
                                    tick={{ fontSize: 12 }} 
                                    axisLine={false} 
                                    tickLine={false}
                                  />
                                  <Tooltip 
                                    content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <div style={{ 
                                            backgroundColor: 'white', 
                                            border: '1px solid #ccc', 
                                            borderRadius: 8, 
                                            padding: 12,
                                            boxShadow: 2
                                          }}>
                                            <p style={{ fontWeight: 'bold', margin: 0 }}>{label}</p>
                                            <p style={{ margin: 0 }}>Entries: {payload[0].value}</p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="entries" 
                                    stroke="#925a9b" 
                                    fill="url(#userGradient)"
                                    strokeWidth={2}
                                  />
                                  <defs>
                                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#925a9b" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#925a9b" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: '100%',
                                color: '#666',
                                fontSize: '14px'
                              }}>
                                No user data available
                              </div>
                            )}
                          </div>
                        </PDFChartWrapper>

                        {/* Amount Distribution Chart */}
                        <PDFChartWrapper 
                          title="Backdated Amount Distribution"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Backdated Amount Distribution" 
                              data={chartData.backdated_amount_distribution}
                              currency={currency}
                            />
                          }
                        >
                          <div style={{ height: 300 }}>
                            {chartData.backdated_amount_distribution && chartData.backdated_amount_distribution.labels.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.backdated_amount_distribution.labels.map((range, index) => ({
                                  range: range,
                                  transactions: chartData.backdated_amount_distribution.data[index] || 0
                                }))}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis 
                                    dataKey="range" 
                                    tick={{ fontSize: 12 }} 
                                    axisLine={false} 
                                    tickLine={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis 
                                    tick={{ fontSize: 12 }} 
                                    axisLine={false} 
                                    tickLine={false}
                                  />
                                  <Tooltip 
                                    content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <div style={{ 
                                            backgroundColor: 'white', 
                                            border: '1px solid #ccc', 
                                            borderRadius: 8, 
                                            padding: 12,
                                            boxShadow: 2
                                          }}>
                                            <p style={{ fontWeight: 'bold', margin: 0 }}>{label}</p>
                                            <p style={{ margin: 0 }}>Transactions: {payload[0].value}</p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="transactions" 
                                    stroke="#e65100" 
                                    fill="url(#amountGradient)"
                                    strokeWidth={2}
                                  />
                                  <defs>
                                    <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#e65100" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#e65100" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: '100%',
                                color: '#666',
                                fontSize: '14px'
                              }}>
                                No amount distribution data available
                              </div>
                            )}
                          </div>
                        </PDFChartWrapper>

                        {/* Financial Statement Line Breakdown Chart */}
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
                          <div style={{ height: 300 }}>
                            {chartData.financial_statement_line_breakdown && chartData.financial_statement_line_breakdown.labels.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.financial_statement_line_breakdown.labels.map((account, index) => ({
                                  account: account,
                                  entries: chartData.financial_statement_line_breakdown.data[index] || 0
                                }))}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis 
                                    dataKey="account" 
                                    tick={{ fontSize: 12 }} 
                                    axisLine={false} 
                                    tickLine={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis 
                                    tick={{ fontSize: 12 }} 
                                    axisLine={false} 
                                    tickLine={false}
                                  />
                                  <Tooltip 
                                    content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <div style={{ 
                                            backgroundColor: 'white', 
                                            border: '1px solid #ccc', 
                                            borderRadius: 8, 
                                            padding: 12,
                                            boxShadow: 2
                                          }}>
                                            <p style={{ fontWeight: 'bold', margin: 0 }}>{label}</p>
                                            <p style={{ margin: 0 }}>Entries: {payload[0].value}</p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="entries" 
                                    stroke="#2c3e50" 
                                    fill="url(#accountGradient)"
                                    strokeWidth={2}
                                  />
                                  <defs>
                                    <linearGradient id="accountGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#2c3e50" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#2c3e50" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: '100%',
                                color: '#666',
                                fontSize: '14px'
                              }}>
                                No account breakdown data available
                              </div>
                            )}
                          </div>
                        </PDFChartWrapper>

                        {/* Monthly Backdated Trend Chart */}
                        <PDFChartWrapper 
                          title="Monthly Backdated Trend"
                          fallbackContent={
                            <FallbackChartContent 
                              title="Monthly Backdated Trend" 
                              data={chartData.monthly_backdated_trend}
                              currency={currency}
                            />
                          }
                        >
                          <div style={{ height: 300 }}>
                            {chartData.monthly_backdated_trend && chartData.monthly_backdated_trend.labels.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.monthly_backdated_trend.labels.map((month, index) => ({
                                  month: month,
                                  backdated: chartData.monthly_backdated_trend.data[index] || 0
                                }))}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis 
                                    dataKey="month" 
                                    tick={{ fontSize: 12 }} 
                                    axisLine={false} 
                                    tickLine={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis 
                                    tick={{ fontSize: 12 }} 
                                    axisLine={false} 
                                    tickLine={false}
                                  />
                                  <Tooltip 
                                    content={({ active, payload, label }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <div style={{ 
                                            backgroundColor: 'white', 
                                            border: '1px solid #ccc', 
                                            borderRadius: 8, 
                                            padding: 12,
                                            boxShadow: 2
                                          }}>
                                            <p style={{ fontWeight: 'bold', margin: 0 }}>{label}</p>
                                            <p style={{ margin: 0 }}>Backdated: {payload[0].value}</p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="backdated" 
                                    stroke="#28a745" 
                                    fill="url(#trendGradient)"
                                    strokeWidth={2}
                                  />
                                  <defs>
                                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#28a745" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#28a745" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: '100%',
                                color: '#666',
                                fontSize: '14px'
                              }}>
                                No monthly trend data available
                              </div>
                            )}
                          </div>
                        </PDFChartWrapper>

                      </div>
                    </div>

                    {/* Backdated Entries List */}
                    {backdatedEntries && backdatedEntries.length > 0 && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Backdated Entries Analysis</h5>
                        <table
                          width='100%'
                          border='1'
                          className='border'
                          cellSpacing='0'>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>User</th>
                              <th>Account</th>
                              <th>Posting Date</th>
                              <th>Effective Date</th>
                              <th>Days Difference</th>
                              <th>Amount</th>
                              <th>Risk Level</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {backdatedEntries.map((entry, index) => (
                              <tr key={index}>
                                <td>{entry.transaction_id || entry.id || 'N/A'}</td>
                                <td>{entry.user || entry.user_name || entry.created_by || 'N/A'}</td>
                                <td>{entry.account || entry.gl_account || entry.account_code || 'N/A'}</td>
                                <td>{formatDate(entry.posting_date)}</td>
                                <td>{formatDate(entry.document_date || entry.effective_date)}</td>
                                <td>{entry.days_difference || entry.date_difference || 0}</td>
                                <td>{formatCurrency(entry.amount || entry.amount_local_currency || entry.debit_amount || entry.credit_amount || 0)}</td>
                                <td>
                                  <span
                                    style={{
                                      color: RiskColor[getRiskLevelNumber(entry.risk_score || 0)],
                                      fontWeight: "bold"
                                    }}>
                                    {entry.risk_level || entry.risk_category || getRiskLevel(entry.risk_score || 0)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Detailed Insights */}
                    {(recommendations.length > 0 || auditImplications.immediate_actions) && (
                      <div className='sections'>
                        <h5 style={{ margin: "10px 0" }}>Detailed Insights & Recommendations</h5>
                        
                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                          <div style={{ marginBottom: "20px" }}>
                            <h6 style={{ margin: "10px 0" }}>Recommendations</h6>
                            <ul style={{ marginLeft: "20px" }}>
                              {recommendations.map((recommendation, index) => (
                                <li key={index}>
                                  <strong>{recommendation.action}:</strong> {recommendation.description}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Audit Implications */}
                        {auditImplications.immediate_actions && (
                          <div style={{ marginBottom: "20px" }}>
                            <h6 style={{ margin: "10px 0" }}>Audit Implications</h6>
                            <div>
                              <strong>Immediate Actions:</strong>
                              <ul style={{ marginLeft: "20px" }}>
                                {auditImplications.immediate_actions.map((action, index) => (
                                  <li key={index}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Critical Alerts */}
                        {criticalAlerts.length > 0 && (
                          <div style={{ marginBottom: "20px" }}>
                            <h6 style={{ margin: "10px 0" }}>Critical Alerts</h6>
                            <ul style={{ marginLeft: "20px" }}>
                              {criticalAlerts.map((alert, index) => (
                                <li key={index}>
                                  <strong>{alert.severity}:</strong> {alert.message} - Action Required: {alert.action_required}
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
                            <td>{formatCurrency(summaryStats.total_backdated_amount || 0)}</td>
                            <td>
                              <span style={{ color: (summaryStats.total_backdated_amount || 0) > 10000000 ? '#dc3545' : (summaryStats.total_backdated_amount || 0) > 5000000 ? '#ffc516' : '#40b159' }}>
                                {(summaryStats.total_backdated_amount || 0) > 10000000 ? 'High' : (summaryStats.total_backdated_amount || 0) > 5000000 ? 'Medium' : 'Low'}
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