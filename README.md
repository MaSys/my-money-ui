# My Money - Personal Finance Manager

A modern Vue.js frontend application for personal finance management with theme customization and authentication.

## Features

- **Multi-theme Support**: 4 color themes (Blue, Green, Purple, Red) with light/dark mode
- **Authentication System**: Complete login/logout with route protection
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Dashboard**: Financial overview with balance cards and transaction history
- **API Integration**: Structured service layer for Ruby on Rails backend

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client for API calls
- **Vite** - Build tool and development server

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my_money-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Copy `.env.example` to `.env` and configure your API settings:
   ```bash
   cp .env.example .env
   ```
   
   Update the variables in `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   VITE_APP_TITLE=My Money
   VITE_APP_VERSION=1.0.0
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## API Service Architecture

The application uses a structured service layer for API communication:

### Service Structure
```
src/services/
├── api.js              # Base API configuration with interceptors
├── authService.js      # Authentication endpoints
├── userService.js      # User management endpoints
├── transactionService.js # Transaction CRUD operations
└── index.js           # Service exports
```

### API Configuration (`src/services/api.js`)
- **Base URL**: Configurable via environment variables
- **Request Interceptors**: Automatic auth token and CSRF token injection
- **Response Interceptors**: Global error handling and logging
- **Error Handling**: Structured error responses for different HTTP status codes

### Authentication Service (`src/services/authService.js`)
- `login(credentials)` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `resetPassword(email)` - Password reset
- `verifyToken()` - Token verification
- `refreshToken()` - Token refresh

### User Service (`src/services/userService.js`)
- `getCurrentUser()` - Get current user profile
- `updateCurrentUser(userData)` - Update current user
- `changePassword(passwordData)` - Change user password
- Full CRUD operations for user management

### Transaction Service (`src/services/transactionService.js`)
- `getTransactions(params)` - Get transactions with filtering
- `createTransaction(data)` - Create new transaction
- `updateTransaction(id, data)` - Update transaction
- `deleteTransaction(id)` - Delete transaction
- `getCategories()` - Get transaction categories
- `getTransactionStats(params)` - Get transaction statistics

## API Integration with Rails Backend

The services are designed to work with Ruby on Rails RESTful API conventions:

### Expected API Endpoints
```
POST /api/login
DELETE /api/logout
POST /api/signup
POST /api/passwords/reset
GET /api/verify

GET /api/users/me
PUT /api/users/me
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id

GET /api/transactions
POST /api/transactions
GET /api/transactions/:id
PUT /api/transactions/:id
DELETE /api/transactions/:id
```

### Rails Response Format
Services expect Rails responses in this format:
```javascript
// Success Response
{
  "success": true,
  "data": {
    "user": { /* user data */ },
    "token": "jwt-token-here"
  }
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "errors": {
    "email": ["is invalid"],
    "password": ["is too short"]
  }
}
```

## Using the API Services

### In Vue Components
```vue
<script setup>
import { useApi } from '@/composables/useApi'
import { authService } from '@/services/authService'

const { execute, isLoading, error } = useApi()

const handleLogin = async () => {
  const result = await execute(
    () => authService.login(credentials),
    {
      onSuccess: (userData) => {
        // Handle success
      },
      onError: (error) => {
        // Handle error
      }
    }
  )
}
</script>
```

### In Pinia Stores
```javascript
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      if (response.success) {
        // Update store state
      }
      return response
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
})
```

## Theme Customization

The application supports 4 color themes with light/dark mode:

- **Blue Theme** (default)
- **Green Theme**
- **Purple Theme**
- **Red Theme**

Theme settings are persisted in localStorage and automatically applied on page load.

## Authentication Flow

1. User submits login credentials
2. Frontend calls `authService.login()`
3. API service handles request with interceptors
4. Success: Token stored, user redirected to dashboard
5. Error: User sees validation errors
6. All subsequent requests include auth token automatically

## Development Best Practices

- **Error Handling**: All API calls return consistent `{ success, data, error, errors }` format
- **Loading States**: Use `useApi()` composable for loading indicators
- **Token Management**: Automatic token injection and refresh
- **Route Protection**: Router guards protect authenticated routes
- **Development Logging**: Detailed API request/response logging in development mode

## Project Structure

```
src/
├── components/         # Reusable Vue components
├── composables/       # Vue composables for shared logic
├── router/            # Vue Router configuration
├── services/          # API service layer
├── stores/            # Pinia stores
├── views/             # Page components
└── style.css          # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 
