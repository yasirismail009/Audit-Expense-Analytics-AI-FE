/** @format */

import React from "react";
import { Box, Grid, Typography, Paper, Card, 
  CardContent } from "@mui/material";
import { colorScheme } from "../../utils/colorScheme";
import DuplicateTypeChart from "./DuplicateTypeChart";
import DuplicateRiskChart from "./DuplicateRiskChart";
import DuplicateUserChart from "./DuplicateUserChart";
import DuplicateAmountChart from "./DuplicateAmountChart";
import DuplicateMonthlyTrendChart from "./DuplicateMonthlyTrendChart";
import DuplicateFSLineChart from "./DuplicateFSLineChart";

export default function DuplicateAnalysisDashboard({ data }) {
	// Extract currency from data or use default
	const currency = data?.currency || data?.file_info?.currency || data?.summary_statistics?.currency || 'SAR';

	if (!data) {
		return (
			<Paper sx={{ p: 3, textAlign: "center" }}>
				<Typography variant='body1' color='text.secondary'>
					No duplicate analysis data available
				</Typography>
			</Paper>
		);
	}

	return (
		<Box
			sx={{
				p: 3,
			}}>

			<Grid container spacing={3}>
				{/* Type Distribution Chart */}
				{data?.chart_data?.duplicate_distribution && (
					<Grid item size={{xs: 12, md: 6}}>
							<DuplicateTypeChart data={data} currency={currency} />
					</Grid>
				)}

				{/* Risk Distribution Chart */}
				<Grid item size={{xs: 12, md: 6}}>
						<DuplicateRiskChart data={data} currency={currency} />
				</Grid>

				{/* User Activity Chart */}
				<Grid item size={{xs: 12, md: 6}}>
						<DuplicateUserChart data={data} currency={currency} />
				</Grid>

				{/* Amount Distribution Chart */}
				<Grid item size={{xs: 12, md: 6}}>
						<DuplicateAmountChart data={data} currency={currency} />
				</Grid>

				{/* Financial Statement Line Chart */}
				<Grid item size={{xs: 12, md: 6}}>
						<DuplicateFSLineChart data={data} currency={currency} />
				</Grid>

				{/* Monthly Trend Chart */}
				<Grid item size={{xs: 12, md: 6}}>
						<DuplicateMonthlyTrendChart data={data} currency={currency} />
				</Grid>
			</Grid>
		</Box>
	);
}
