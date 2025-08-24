# Authentication System Documentation

## Overview

This analytics frontend application now includes a complete authentication system with login and signup functionality. The system is built using React with Material-UI components and includes proper form validation, error handling, and protected routes.

## Features

### Authentication Pages

1. **Login Page** (`/login`)
   - Email and password authentication
   - Form validation with real-time error feedback
   - Password visibility toggle
   - Remember user session
   - Redirect to dashboard on successful login

2. **Signup Page** (`/signup`)
   - Complete user registration form
   - Comprehensive form validation including:
     - Username requirements (3+ characters, alphanumeric + underscore)
     - Email validation
     - Password strength requirements (8+ chars, uppercase, lowercase, number, special char)
     - Password confirmation matching
     - First and last name validation
   - Password visibility toggles for both password fields
   - Success/error messaging

### Authentication Context

- Global authentication state management
- Automatic token persistence in localStorage
- User session management
- Logout functionality
- Protected route handling

### Protected Routes

- All dashboard routes require authentication
- Automatic redirect to login for unauthenticated users
- Loading states during authentication checks
- Proper error handling for expired/invalid tokens

### User Interface

- User avatar with initials in top navigation
- User dropdown menu with profile info and logout
- Consistent styling with existing design system
- Responsive design for mobile and desktop

## API Endpoints

The authentication system expects the following API endpoints:

### Login
```
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "username",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Signup
```
POST /api/auth/signup/
Content-Type: application/json

{
  "username": "yasir_ismail",
  "email": "yasir@test.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "yasir_ismail",
    "email": "yasir@test.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

## Usage

### Starting the Application

1. Ensure the backend API is running on `http://localhost:8000`
2. Start the frontend development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

### Authentication Flow

1. **First-time users**: Navigate to `/signup` to create an account
2. **Existing users**: Navigate to `/login` to sign in
3. **Authenticated users**: Automatically redirected to dashboard (`/`)
4. **Logout**: Click user avatar → Logout option

### Protected Routes

All dashboard functionality is now protected:
- File listing page (`/`)
- Expense sheet details (`/expense-sheet-details/:id`)
- File upload functionality
- All API requests include authentication headers

## Security Features

- JWT token-based authentication
- Automatic token inclusion in all API requests
- Token expiration handling
- Secure password requirements
- Form validation and sanitization
- Protected route implementation
- Automatic logout on authentication errors

## File Structure

```
src/
├── components/
│   └── auth/
│       ├── Login.jsx          # Login page component
│       └── Signup.jsx         # Signup page component
├── utils/
│   ├── authContext.jsx        # Authentication context provider
│   └── colorScheme.js         # Design system colors
├── App.jsx                    # Main app with routing
├── main.jsx                   # App entry point with AuthProvider
└── components/
    ├── TopBar.jsx             # Updated with user menu
    └── UploadModal.jsx        # Updated with auth headers
```

## Customization

### Styling
The authentication pages use the existing color scheme defined in `src/utils/colorScheme.js`. To customize:

1. Update colors in `colorScheme.js`
2. Modify component styling in the auth components
3. Update Material-UI theme if needed

### Validation Rules
Form validation rules can be modified in:
- `Login.jsx` - Email and password validation
- `Signup.jsx` - All field validation rules

### API Configuration
Update API endpoints in:
- `Login.jsx` - Login API call
- `Signup.jsx` - Signup API call
- `App.jsx` - File listing API calls
- `UploadModal.jsx` - File upload API calls

## Error Handling

The system includes comprehensive error handling:
- Network errors
- Authentication failures
- Form validation errors
- API response errors
- Token expiration handling

All errors are displayed to users with appropriate messaging and recovery options.

## Browser Compatibility

- Modern browsers with ES6+ support
- LocalStorage support required
- Responsive design for mobile and desktop
- Material-UI components for consistent UI

## Development Notes

- Uses React Router v6 for navigation
- Material-UI v5 for components
- Axios for API requests
- Context API for state management
- LocalStorage for token persistence
