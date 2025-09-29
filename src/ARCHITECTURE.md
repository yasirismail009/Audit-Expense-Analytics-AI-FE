# Feature-Sliced Design (FSD) Architecture

This project follows the Feature-Sliced Design methodology for organizing React components and business logic.

## Directory Structure

```
src/
├── app/                    # Application layer
├── pages/                  # Page components
├── widgets/                # Complex UI blocks
│   ├── completeness-report/
│   ├── account-analysis/
│   └── document-analysis/
├── features/               # Business features
│   ├── completeness-test/
│   ├── account-verifications/
│   └── document-verifications/
├── entities/               # Business entities
│   ├── account/
│   ├── document/
│   └── engagement/
├── shared/                 # Reusable code
│   ├── ui/                 # UI components
│   │   ├── status-card/
│   │   ├── metric-card/
│   │   └── data-table/
│   ├── lib/                # Utilities and libraries
│   │   ├── api/
│   │   └── utils/
│   └── config/             # Configuration
└── components/             # Legacy components (to be migrated)
```

## Layer Rules

### 1. **App Layer** (`src/app/`)
- Application initialization
- Global providers
- Routing configuration
- Error boundaries

### 2. **Pages Layer** (`src/pages/`)
- Page-level components
- Route handlers
- Page-specific layouts

### 3. **Widgets Layer** (`src/widgets/`)
- Complex UI blocks that combine multiple features
- Independent, reusable components
- Examples: `CompletenessReportWidget`, `AccountAnalysisWidget`

### 4. **Features Layer** (`src/features/`)
- Business features and user scenarios
- Self-contained functionality
- Examples: `completeness-test`, `account-verifications`

### 5. **Entities Layer** (`src/entities/`)
- Business entities and domain models
- Data structures and business logic
- Examples: `account`, `document`, `engagement`

### 6. **Shared Layer** (`src/shared/`)
- Reusable code across the application
- UI components, utilities, configurations
- No business logic dependencies

## Import Rules

### ✅ Allowed Imports

```javascript
// Pages can import from all layers
import { CompletenessTestReport } from '../features/completeness-test';

// Widgets can import from features, entities, and shared
import { AccountVerificationsSection } from '../features/account-verifications';
import { EngagementBanner } from '../entities/engagement';

// Features can import from entities and shared
import { StatusCard } from '../../shared/ui/status-card';
import { completenessApi } from '../../shared/lib/api';

// Entities can only import from shared
import { formatCurrency } from '../../shared/lib/utils';

// Shared cannot import from any other layer
```

### ❌ Forbidden Imports

```javascript
// ❌ Features cannot import from widgets
import { CompletenessReportWidget } from '../../widgets/completeness-report';

// ❌ Entities cannot import from features
import { AccountVerificationsSection } from '../features/account-verifications';

// ❌ Shared cannot import from any other layer
import { CompletenessTestReport } from '../features/completeness-test';
```

## Completeness Test Feature Structure

### Features
- **completeness-test**: Main completeness test functionality
- **account-verifications**: Account verification features
- **document-verifications**: Document verification features

### Widgets
- **completeness-report**: Report display widgets
- **account-analysis**: Account analysis widgets
- **document-analysis**: Document analysis widgets

### Entities
- **engagement**: Engagement data and UI
- **account**: Account data and UI
- **document**: Document data and UI

### Shared
- **ui/status-card**: Reusable status card component
- **ui/metric-card**: Reusable metric card component
- **ui/data-table**: Reusable data table component
- **lib/api**: API utilities
- **lib/utils**: Data transformation utilities

## Benefits of FSD

1. **Clear Separation of Concerns**: Each layer has a specific responsibility
2. **Scalability**: Easy to add new features without affecting existing code
3. **Reusability**: Shared components can be used across features
4. **Maintainability**: Clear import rules prevent circular dependencies
5. **Team Collaboration**: Different teams can work on different layers
6. **Testing**: Each layer can be tested independently

## Migration Strategy

1. **Phase 1**: Create FSD structure and shared components
2. **Phase 2**: Extract features from monolithic components
3. **Phase 3**: Create widgets for complex UI blocks
4. **Phase 4**: Migrate remaining components to appropriate layers
5. **Phase 5**: Remove legacy components

## Best Practices

1. **Keep features independent**: Features should not depend on each other
2. **Use shared layer wisely**: Only put truly reusable code in shared
3. **Follow import rules**: Respect the layer hierarchy
4. **Create clear interfaces**: Define props and APIs clearly
5. **Document components**: Each component should have clear documentation
6. **Test at layer boundaries**: Test how layers interact with each other
