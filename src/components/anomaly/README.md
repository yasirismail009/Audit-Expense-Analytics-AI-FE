# Anomaly Analysis Components

This directory contains modular components for displaying different types of anomaly analysis data in the analytics dashboard.

## Component Structure

```
anomaly/
├── index.js                           # Main export file
├── README.md                          # This documentation
├── DuplicateAnalysisContent.jsx       # Duplicate entries analysis
├── UserAnalysisContent.jsx            # User behavior analysis
├── BackdatedAnalysisContent.jsx       # Backdated entries analysis
├── ClosingAnalysisContent.jsx         # Closing entries analysis
├── UnusualDaysAnalysisContent.jsx     # Unusual days analysis
├── HolidayAnalysisContent.jsx         # Holiday analysis
└── shared/                            # Reusable components
    ├── SummaryMetrics.jsx             # Summary statistics display
    ├── RiskChip.jsx                   # Risk score display
    └── RawDataDisplay.jsx             # Raw JSON data display
```

## Usage

### Main Components

Each analysis component accepts a `data` prop containing the API response data:

```jsx
import { DuplicateAnalysisContent } from './anomaly';

<DuplicateAnalysisContent data={apiResponseData} />
```

### Shared Components

#### SummaryMetrics

Display summary statistics in a consistent grid layout:

```jsx
import { SummaryMetrics } from './anomaly';

const metrics = [
  {
    value: '150',
    label: 'Total Transactions',
    bgColor: '#e3f2fd',
    color: '#1565c0'
  },
  {
    value: '$1,250,000',
    label: 'Total Amount',
    bgColor: '#fff3e0',
    color: '#e65100'
  }
];

<SummaryMetrics metrics={metrics} />
```

#### RiskChip

Display risk scores with consistent color coding:

```jsx
import { RiskChip } from './anomaly';

<RiskChip score={75} size="small" />
```

#### RawDataDisplay

Display raw JSON data for debugging:

```jsx
import { RawDataDisplay } from './anomaly';

<RawDataDisplay data={apiResponse} title="API Response Data" />
```

## Component Features

### DuplicateAnalysisContent
- Summary metrics (total duplicates, transactions, amounts)
- Type breakdown table
- Detailed duplicates with expandable transaction details
- User breakdown analysis
- Financial statement line breakdown
- Model metrics and feature importance
- Risk scoring with color-coded chips

### UserAnalysisContent
- User activity patterns
- Transaction counts and amounts by user
- Risk scoring per user
- Pattern identification

### BackdatedAnalysisContent
- Backdated entries identification
- Date difference analysis
- Risk scoring based on timing discrepancies

### ClosingAnalysisContent
- Month-end closing entries analysis
- Closing date patterns
- Risk assessment for closing period transactions

### UnusualDaysAnalysisContent
- Weekend and holiday transaction analysis
- Unusual business day patterns
- Risk scoring for non-business day activities

### HolidayAnalysisContent
- Holiday-specific transaction analysis
- Holiday name and date identification
- Risk assessment for holiday transactions

## Data Structure

Each component expects specific data structures from the API:

### Duplicate Analysis
```javascript
{
  message: string,
  total_duplicates: number,
  total_transactions_involved: number,
  total_amount_involved: number,
  type_breakdown: object,
  duplicates: array,
  charts_data: object,
  training_data: object
}
```

### Other Analyses
```javascript
{
  summary: object,
  [specific_entries]: array,
  // Additional fields based on analysis type
}
```

## Styling

All components use Material-UI components and follow consistent styling patterns:
- Color-coded risk indicators
- Hover effects on interactive elements
- Responsive grid layouts
- Consistent spacing and typography

## Extending

To add a new analysis type:

1. Create a new component file (e.g., `NewAnalysisContent.jsx`)
2. Follow the existing component structure
3. Add the component to `index.js` exports
4. Update the main `AnomalyAnalysisAccordion.jsx` to include the new type
5. Add the corresponding API endpoint configuration 