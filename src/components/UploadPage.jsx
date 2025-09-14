/** @format */

import React, { useState } from "react";
import {
	Box,
	Container,
	Typography,
	Paper,
	Button,
	Stepper,
	Step,
	StepLabel,
	StepConnector,
	LinearProgress,
	Chip,
	Grid,
	Alert,
	CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { colorScheme } from "../utils/colorScheme";
import { dashboardColors as colors } from '../utils/dashboardColors';

import { dashboardColors } from "../utils/dashboardColors";
import { useAuth } from "../utils/authContext";
import axios from "axios";
import AppHeader from "./common/AppHeader";
import StepOneInputFields from "./upload/StepOneInputFields";
import StepTwoGLAccountList from "./upload/StepTwoGLAccountList";
import StepThreeFileUpload from "./upload/StepThreeFileUpload";
import {
	Person as PersonIcon,
	Assignment as AssignmentIcon,
	CloudUpload as CloudUploadIcon,
	CheckCircle as CheckCircleIcon,
	ArrowBack as ArrowBackIcon,
	ArrowForward as ArrowForwardIcon,
	Summarize as SummarizeIcon,
	Home as HomeIcon,
	Celebration as CelebrationIcon,
	ErrorOutline as ErrorIcon,
} from "@mui/icons-material";

// Custom styled components for modern wizard design
const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
	"&.Mui-active .MuiStepConnector-line": {
		backgroundColor: colors.primary,
	},
	"&.Mui-completed .MuiStepConnector-line": {
		backgroundColor: colors.primary,
	},
	"& .MuiStepConnector-line": {
		height: 2,
		border: 0,
		backgroundColor: "#E0E0E0",
		borderRadius: 1,
	},
}));

const steps = [
  { 
		title: "Organization Details",
		description: "Enter engagement details",
		icon: PersonIcon,
		completed: false,
	},
	{
		title: "General Ledger List",
		description: "Upload general ledger list",
		icon: AssignmentIcon,
		completed: false,
	},
	{
		title: "TB and Chart of Accounts",
		description: "Upload files and complete",
		icon: CloudUploadIcon,
		completed: false,
	},
	{
		title: "Summary",
		description: "Review and complete",
		icon: SummarizeIcon,
		completed: false,
	},
];

export default function UploadPage() {
  const navigate = useNavigate();
	const { token } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
	const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', or null
	const [validationError, setValidationError] = useState(""); // For showing validation errors
	const [uploading, setUploading] = useState(false); // For showing loading state during upload
  const [formData, setFormData] = useState({
    // Step 1: Input Fields
		engagement_id: "ENG-008",
		client_name: "Muhammad Yasir",
		fiscal_year: "2025",
		audit_start_date: "2025-01-01",
		audit_end_date: "2025-12-31",
		company_name: "Irtiqa International",
		description: "Test",
    
    // Step 2: GL Account List (now handled as file upload)
    // Step 3: File Upload
    files: {
      trial_balance: null,
      chart_of_accounts: null,
			gl_accounts: null,
		},
  });

  // Header event handlers
	const handleMenuClick = () => console.log("Menu clicked");
	const handleSearchChange = (value) => console.log("Search:", value);
	const handleAddClick = () => console.log("Add clicked");
	const handleCalendarClick = () => console.log("Calendar clicked");
	const handleUserClick = () => console.log("User clicked");

  const handleNext = () => {
		// Clear any previous validation errors
		setValidationError("");
		
		// Validate current step before proceeding
		if (validateCurrentStep()) {
			if (activeStep === 2) {
				// Step 3 (index 2) - trigger completion
				handleComplete();
			} else if (activeStep < steps.length - 1) {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
			}
		}
	};

	const validateCurrentStep = () => {
		switch (activeStep) {
			case 0: // Step 1: Organization Details
				const requiredFields = ['engagement_id', 'client_name', 'fiscal_year', 'audit_start_date', 'audit_end_date', 'company_name'];
				const missingFields = requiredFields.filter(field => !formData[field]?.trim());
				if (missingFields.length > 0) {
					setValidationError(`Please fill in all required fields: ${missingFields.join(', ')}`);
					return false;
				}
				return true;

			case 1: // Step 2: General Ledger List
				if (!formData.files.gl_accounts) {
					setValidationError('Please upload the General Ledger CSV or Excel file');
					return false;
				}
				return true;

			case 2: // Step 3: Trial Balance & Chart of Accounts
				const missingFiles = [];
				if (!formData.files.trial_balance) missingFiles.push('Trial Balance');
				if (!formData.files.chart_of_accounts) missingFiles.push('Chart of Accounts');
				
				if (missingFiles.length > 0) {
					setValidationError(`Please upload the following files: ${missingFiles.join(', ')}`);
					return false;
				}
				return true;

			default:
				return true;
		}
  };

  const handleStepClick = (stepIndex) => {
		// Clear validation errors when navigating
		setValidationError("");
		
    // Allow navigation to previous steps or current step
    if (stepIndex <= activeStep) {
      setActiveStep(stepIndex);
    }
  };

  const handleBack = () => {
		// Clear validation errors when going back
		setValidationError("");
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

	const updateFormData = (newData) => {
		setFormData((prev) => ({ ...prev, ...newData }));
	};

	const handleComplete = async () => {
		// First validate all files are present
		if (!formData.files.trial_balance || !formData.files.chart_of_accounts || !formData.files.gl_accounts) {
			setValidationError('Please upload all required files before submitting.');
			return;
		}

		setUploading(true);
		setValidationError("");

		try {
			// Create FormData for file upload
			const uploadFormData = new FormData();
			
			// Add files
			uploadFormData.append('trial_balance', formData.files.trial_balance);
			uploadFormData.append('chart_of_accounts', formData.files.chart_of_accounts);
			uploadFormData.append('gl_accounts', formData.files.gl_accounts);
			
			// Add form fields
			Object.keys(formData).forEach(key => {
				if (key !== 'files') {
					uploadFormData.append(key, formData[key]);
				}
			});

			console.log('Submitting form data to API:', formData);

			// Make API call
			const response = await axios.post('http://localhost:8000/api/upload/', uploadFormData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': `Bearer ${token}`
				},
			});

			console.log('Upload successful:', response.data);
			setUploadStatus("success");
			setActiveStep(3); // Move to summary step
		} catch (error) {
			console.error('Upload failed:', error);
			const errorMessage = error.response?.data?.message || 'Failed to upload files. Please try again.';
			setValidationError(errorMessage);
			setUploadStatus("error");
			setActiveStep(3); // Move to summary step
		} finally {
			setUploading(false);
		}
	};

	const handleGoHome = () => {
		navigate("/");
  };

  const handleReset = () => {
    setActiveStep(0);
		setUploadStatus(null);
    setFormData({
			engagement_id: "",
			client_name: "",
			fiscal_year: "",
			audit_start_date: "",
			audit_end_date: "",
			company_name: "",
			description: "",
      files: {
        trial_balance: null,
        chart_of_accounts: null,
				gl_accounts: null,
			},
    });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <StepOneInputFields 
            formData={formData} 
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <StepTwoGLAccountList 
            formData={formData} 
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <StepThreeFileUpload 
            formData={formData} 
            updateFormData={updateFormData}
						onComplete={handleComplete}
          />
        );
			case 3:
				return renderSummaryStep();
      default:
				return "Unknown step";
		}
	};

	const renderSummaryStep = () => {
		if (uploadStatus === "success") {
			return (
				<Box sx={{ textAlign: "center", py: 6 }}>
					{/* Success Header */}
					<Box sx={{ mb: 4 }}>
						<Box
							sx={{
								width: 80,
								height: 80,
								borderRadius: 2,
								bgcolor: colors.primary,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								mx: "auto",
								mb: 3,
							}}>
							<CheckCircleIcon sx={{ fontSize: 40, color: "white" }} />
						</Box>
						<Typography
							variant='h4'
							sx={{
								fontFamily: '"Inter", sans-serif',
								fontWeight: 600,
								color: "#333",
								fontSize: "1.4rem",
								letterSpacing: "-0.02em",
								mb: 2,
							}}>
							Submitted successfully!
						</Typography>
					</Box>

					{/* Success Illustration Area */}
					<Box
						sx={{
							mb: 6,
							minHeight: 200,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							bgcolor: "#F8F9FA",
							borderRadius: 2,
							border: "2px dashed #E0E0E0",
						}}>
						<Box sx={{ textAlign: "center" }}>
							<CelebrationIcon
								sx={{ fontSize: 60, color: colors.primary, mb: 2 }}
							/>
							<Typography
								variant='body1'
								sx={{
									fontFamily: '"Inter", sans-serif',
									color: "#666",
									fontSize: "0.85rem",
									fontWeight: 400,
								}}>
								Your audit data has been successfully uploaded and is ready for
								analysis!
							</Typography>
						</Box>
					</Box>

					{/* Action Buttons */}
					<Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
						<Button
							onClick={handleReset}
							variant='outlined'
							sx={{
								fontFamily: '"Inter", sans-serif',
								color: "#666",
								borderColor: "#E0E0E0",
								textTransform: "none",
								fontWeight: 500,
								fontSize: "0.8rem",
								px: 3,
								py: 1.5,
							}}>
							Reset
						</Button>
						<Button
							onClick={handleGoHome}
							variant='contained'
							startIcon={<HomeIcon />}
							sx={{
								"fontFamily": '"Inter", sans-serif',
								"bgcolor": colors.primary,
								"color": "white",
								"textTransform": "none",
								"fontWeight": 600,
								"fontSize": "0.8rem",
								"px": 3,
								"py": 1.5,
								"&:hover": {
									bgcolor: colors.primaryDark,
								},
							}}>
							Go to Home
						</Button>
					</Box>
				</Box>
			);
		} else if (uploadStatus === "error") {
			return (
				<Box sx={{ textAlign: "center", py: 6 }}>
					{/* Error Header */}
					<Box sx={{ mb: 4 }}>
						<Box
							sx={{
								width: 80,
								height: 80,
								borderRadius: 2,
								bgcolor: "#f44336",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								mx: "auto",
								mb: 3,
							}}>
							<ErrorIcon sx={{ fontSize: 40, color: "white" }} />
						</Box>
						<Typography variant='h4' fontWeight={600} color='#333' mb={2}>
							Upload Failed!
						</Typography>
						<Typography variant='body1' color='#666'>
							There was an error processing your files. Please try again.
						</Typography>
					</Box>

					{/* Action Buttons */}
					<Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
						<Button
							onClick={() => setActiveStep(2)}
							variant='outlined'
							sx={{
								color: colors.primary,
								borderColor: colors.primary,
								textTransform: "none",
								fontWeight: 500,
								px: 3,
								py: 1.5,
							}}>
							Try Again
						</Button>
						<Button
							onClick={handleGoHome}
							variant='contained'
							startIcon={<HomeIcon />}
							sx={{
								"fontFamily": '"Inter", sans-serif',
								"bgcolor": colors.primary,
								"color": "white",
								"textTransform": "none",
								"fontWeight": 600,
								"fontSize": "0.8rem",
								"px": 3,
								"py": 1.5,
								"&:hover": {
									bgcolor: colors.primaryDark,
								},
							}}>
							Go to Home
						</Button>
					</Box>
				</Box>
			);
		} else {
			// Default summary view
			return (
				<Box sx={{ py: 4 }}>
					<Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
						<Box
							sx={{
								width: 48,
								height: 48,
								borderRadius: 2,
								bgcolor: colors.primary,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								mr: 3,
							}}>
							<SummarizeIcon sx={{ fontSize: 24, color: "white" }} />
						</Box>
						<Box>
							<Typography variant='h5' fontWeight={600} color='#333' mb={1}>
								Review & Submit
							</Typography>
							<Typography variant='body2' color='#666' lineHeight={1.5}>
								Please review your information before submitting.
							</Typography>
						</Box>
					</Box>

					{/* Summary Content */}
					<Box sx={{ mb: 4 }}>
						<Typography variant='h6' fontWeight={600} color='#333' mb={2}>
							Upload Summary
						</Typography>
						<Paper
							sx={{ p: 3, bgcolor: "#F8F9FA", border: "1px solid #E0E0E0" }}>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={6}>
									<Typography variant='body2' color='#666' mb={1}>
										Organization:
									</Typography>
									<Typography variant='body1' fontWeight={500}>
										{formData.company_name || "Not specified"}
									</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant='body2' color='#666' mb={1}>
										Client:
									</Typography>
									<Typography variant='body1' fontWeight={500}>
										{formData.client_name || "Not specified"}
									</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant='body2' color='#666' mb={1}>
										Fiscal Year:
									</Typography>
									<Typography variant='body1' fontWeight={500}>
										{formData.fiscal_year || "Not specified"}
									</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant='body2' color='#666' mb={1}>
										Files Uploaded:
									</Typography>
									<Typography variant='body1' fontWeight={500}>
										{
											Object.values(formData.files).filter((file) => file)
												.length
										}{" "}
										files
									</Typography>
								</Grid>
							</Grid>
						</Paper>
					</Box>

					{/* Submit Button */}
					<Box sx={{ textAlign: "center" }}>
						<Button
							onClick={handleComplete}
							variant='contained'
							size='large'
							sx={{
								"fontFamily": '"Inter", sans-serif',
								"bgcolor": colors.primary,
								"color": "white",
								"textTransform": "none",
								"fontWeight": 600,
								"px": 4,
								"py": 1.5,
								"&:hover": {
									bgcolor: colors.primaryDark,
								},
							}}>
							Submit Upload
						</Button>
					</Box>
				</Box>
			);
    }
  };

  return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: "#F5F5F5",
				display: "flex",
				flexDirection: "column",
    }}>
      <AppHeader
        onMenuClick={handleMenuClick}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
        onCalendarClick={handleCalendarClick}
        onUserClick={handleUserClick}
				userName='Muhammad Yasir'
				userRole='Software Engineer'
				userInitials='MY'
				searchPlaceholder='Search uploads...'
			/>

			<Box
				sx={{
					width: "100%",
					px: 3.5,
					py: 3.5,
				}}>
				{/* Left Sidebar - Wizard Steps */}
				<Grid container spacing={3}>
					<Grid item size={{ xs: 12, md: 3 }}>
						<Box
							sx={{
								flexShrink: 0,
								width: "100%",
								display: { xs: "none", md: "block" },
							}}>
							<Box
								sx={{
									p: 3,
									borderRadius: 2,
									height: "fit-content",
									// bgcolor: 'white',
								}}>
          {/* Header */}
								<Box sx={{ mb: 4 }}>
									<Typography
										variant='h6'
										sx={{
											fontFamily: '"Inter", sans-serif',
											fontWeight: 600,
											color: "#333",
											fontSize: "0.9rem",
											letterSpacing: "-0.01em",
											mb: 1,
										}}>
										Audit Analytics Upload
          </Typography>
									<Typography
										variant='body2'
										sx={{
											fontFamily: '"Inter", sans-serif',
											color: "#666",
											fontSize: "0.75rem",
											fontWeight: 400,
											lineHeight: 1.5,
											letterSpacing: "-0.01em",
										}}>
										Upload your trial balance and chart of accounts for
										comprehensive audit analysis and anomaly detection.
          </Typography>
        </Box>

								{/* Steps */}
								<Box>
									{steps.map((step, index) => {
										const isActive = index === activeStep;
										const isCompleted = index < activeStep;
										const IconComponent = step.icon;

										return (
											<Box
												key={index}
												sx={{
													display: "flex",
													alignItems: "center",
													mb: 3,
													cursor: index <= activeStep ? "pointer" : "default",
													opacity: index > activeStep ? 0.5 : 1,
												}}
												onClick={() =>
													index <= activeStep && handleStepClick(index)
												}>
												{/* Step Number */}
												<Box
													sx={{
														width: 32,
														height: 32,
														borderRadius: "50%",
														bgcolor: isCompleted
															? colors.primary
															: isActive
															? colors.primary
															: "#E0E0E0",
														color: isCompleted || isActive ? "white" : "#999",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														mr: 3,
														fontSize: "14px",
														fontWeight: 600,
														transition: "all 0.3s ease",
													}}>
													{isCompleted ? (
														<CheckCircleIcon sx={{ fontSize: 18 }} />
													) : (
														index + 1
													)}
												</Box>

												{/* Step Info */}
												<Box>
													<Typography
														variant='body2'
														sx={{
															fontFamily: '"Inter", sans-serif',
															fontWeight: 600,
															color: isActive ? colors.primary : "#333",
															fontSize: "0.8rem",
															letterSpacing: "-0.01em",
															mb: 0.5,
														}}>
														{step.title}
													</Typography>
													<Typography
														variant='caption'
														sx={{
															fontFamily: '"Inter", sans-serif',
															color: "#666",
															fontSize: "0.7rem",
															fontWeight: 400,
															letterSpacing: "-0.01em",
														}}>
														{step.description}
													</Typography>
												</Box>
											</Box>
										);
									})}
								</Box>
							</Box>
						</Box>
          </Grid>
					<Grid item size={{ xs: 12, md: 9 }}>
						{/* Right Content Area */}
						<Paper
							sx={{
								p: 4,
								borderRadius: 2,
								bgcolor: "white",
								boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
								display: "flex",
								flexDirection: "column",
								width: "100%",
							}}>
							{/* Mobile Steps Indicator */}
							<Box sx={{ display: { xs: "block", md: "none" }, mb: 3 }}>
								<LinearProgress
									variant='determinate'
									value={(activeStep / (steps.length - 1)) * 100}
									sx={{
										"height": 6,
										"borderRadius": 3,
										"bgcolor": "#E0E0E0",
										"& .MuiLinearProgress-bar": {
											bgcolor: colors.primary,
              borderRadius: 3,
										},
									}}
								/>
								<Typography
									variant='body2'
									sx={{
										fontFamily: '"Inter", sans-serif',
										color: "#666",
										fontSize: "0.75rem",
										fontWeight: 400,
										mt: 1,
									}}>
									Step {activeStep + 1} of {steps.length}
								</Typography>
              </Box>
              
							{/* Validation Error Display */}
							{validationError && (
								<Alert severity="error" sx={{ mb: 3 }}>
									{validationError}
								</Alert>
							)}

							{/* Step Content */}
							<Box sx={{ flexGrow: 1 }}>{renderStepContent(activeStep)}</Box>

							{/* Navigation Buttons - Hide when upload is completed */}
							{!(activeStep === 3 && uploadStatus) && (
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
                mt: 4,
										pt: 3,
										borderTop: "1px solid #E0E0E0",
              }}>
                  <Button
                    onClick={handleBack}
										disabled={activeStep === 0}
										startIcon={<ArrowBackIcon />}
                    
                    sx={{
											"fontFamily": '"Inter", sans-serif',
											"color": "#666",
											"textTransform": "none",
											"fontWeight": 500,
											"fontSize": "0.8rem",
											"&:disabled": {
												color: "#CCC",
											},
                      "&:hover": {
                        bgcolor: colors.primary,
                        color: "white",
                      },
										}}>
										Previous step
                  </Button>

									<Button
										onClick={handleNext}
										disabled={activeStep === steps.length - 1 || uploading}
										endIcon={uploading ? null : <ArrowForwardIcon />}
										variant='contained'
										sx={{
											"fontFamily": '"Inter", sans-serif',
											"bgcolor": colors.primary,
											"color": "white",
											"textTransform": "none",
											"fontWeight": 600,
											"fontSize": "0.8rem",
											"px": 3,
											"py": 1.5,
											"&:hover": {
												bgcolor: colors.primary,
											},
											"&:disabled": {
												bgcolor: "#CCC",
											},
										}}									>
										{uploading ? (
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<CircularProgress size={16} sx={{ color: 'white' }} />
												Uploading...
											</Box>
										) : (
											activeStep === 2 ? 'Submit & Complete' : 'Next step'
										)}
									</Button>
              </Box>
							)}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
