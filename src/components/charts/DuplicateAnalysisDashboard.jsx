/** @format */

import React from "react";
import { Box, Grid, Typography, Paper, Card, 
  CardContent } from "@mui/material";
import { colorScheme } from "../../utils/colorScheme";
import DuplicateTypeChart from "./DuplicateTypeChart";
import DuplicateRiskChart from "./DuplicateRiskChart";
import DuplicateUserChart from "./DuplicateUserChart";
import DuplicateAmountChart from "./DuplicateAmountChart";

export default function DuplicateAnalysisDashboard({ data }) {
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
				<Grid item size={{xs: 12, md: 6}}>
						<DuplicateTypeChart data={data} />
				</Grid>

				{/* Risk Distribution Chart */}
				<Grid item size={{xs: 12, md: 6}}>
						<DuplicateRiskChart data={data} />
				</Grid>

				{/* User Activity Chart */}
				<Grid item size={{xs: 12, md: 6}}>
						<DuplicateUserChart data={data} />
				</Grid>

				{/* Amount Distribution Chart */}
				<Grid item size={{xs: 12, md: 6}}>
						<DuplicateAmountChart data={data} />
				</Grid>
			</Grid>
		</Box>
	);
}
