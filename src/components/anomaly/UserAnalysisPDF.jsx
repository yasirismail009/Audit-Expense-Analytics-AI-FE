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
  currency = 'SAR'
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
  const fileInfo = data?.file_info || {};
  const analysisInfo = data?.analysis_info || {};
  const userSummary = data?.user_analysis?.user_transaction_summary || [];
  const userAnomalies = data?.anomaly_detection?.user_anomalies || [];
  const userRiskScores = data?.risk_assessment?.user_risk_scores || [];
  const userAccountDistribution = data?.user_analysis?.user_account_distribution || [];
  const summary = data?.summary || {};
  const riskDistribution = summary?.risk_distribution || {};
  const chartData = data?.visualizations?.chart_data || {};

  // Calculate overall risk score
  const totalAmount = userSummary.reduce((sum, user) => sum + (user.total_amount || 0), 0);
  const totalTransactions = userSummary.reduce((sum, user) => sum + (user.total_transactions || 0), 0);
  const avgRiskScore = userRiskScores.length > 0 ? 
    userRiskScores.reduce((sum, user) => sum + (user.risk_score || 0), 0) / userRiskScores.length : 0;
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
                                <td>{user.total_transactions}</td>
                                <td>{userRisk?.risk_score || 0}</td>
                                <td>{userAnomaly?.anomaly_count || 0}</td>
                                <td>
                                  <span style={{
                                    color: RiskColor[getRiskLevelNumber(userRisk?.risk_score || 0)],
                                    fontWeight: "bold"
                                  }}>
                                    {getRiskLevel(userRisk?.risk_score || 0)}
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
                              const userRiskLevel = getRiskLevel(user.risk_score || 0);
                              return userRiskLevel === level.toUpperCase();
                            });
                            
                            const totalAmount = riskLevelUsers.reduce((sum, user) => {
                              const userSummaryItem = userSummary.find(u => u.user === user.user);
                              return sum + (userSummaryItem?.total_amount || 0);
                            }, 0);
                            
                            const totalTransactions = riskLevelUsers.reduce((sum, user) => {
                              const userSummaryItem = userSummary.find(u => u.user === user.user);
                              return sum + (userSummaryItem?.total_transactions || 0);
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