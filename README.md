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
5. **Profile Initialization**: Automatically fetch user profiles from `/api/v1/profiles`
6. **Profile Selection**: Set first profile (or default profile) as active in localStorage
7. **Default Profile Creation**: If no profiles exist, create a default "Personal" profile
8. Error: User sees validation errors
9. All subsequent requests include auth token and profile context automatically

## Profile Management Flow

1. **After Login/Signup**: Profiles are automatically fetched and first profile is set as active
2. **Profile Switching**: User can switch between profiles using the dropdown
3. **Data Refresh**: When profile is switched, all data (transactions, dashboard, etc.) automatically refreshes
4. **Profile Context**: All API requests include `X-Current-Profile` header for backend filtering
5. **Persistence**: Current profile selection is saved in localStorage and restored on page reload

## Expected Rails Response for Profiles
```javascript
// GET /api/v1/profiles response
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": 1,
        "name": "Personal",
        "description": "My personal finances",
        "color": "#3B82F6",
        "is_default": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Business",
        "description": "Business expenses and income",
        "color": "#10B981",
        "is_default": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## Profile Switching Architecture

### **Watcher-Based Data Refresh**

Instead of making API calls to switch profiles, the system uses Vue watchers to automatically refresh view data when the profile changes:

1. **Profile Selection**: User selects different profile from dropdown
2. **Local State Update**: Profile store updates `currentProfile` and localStorage
3. **Watcher Triggers**: Views with `useProfileData` composable automatically detect the change
4. **Data Refresh**: Each view refreshes its specific data (transactions, accounts, etc.)
5. **Context Headers**: All API requests include `X-Current-Profile` header for backend filtering

### **Implementation Examples**

**Basic View with Auto-Refresh:**
```vue
<script setup>
import { useProfileData } from '@/composables/useProfileData'
import { transactionService } from '@/services/transactionService'

// Set up automatic refresh when profile changes
const { isRefreshing, currentProfile } = useProfileData(fetchTransactions)

async function fetchTransactions() {
  // This function will be called automatically when profile changes
  const response = await transactionService.getTransactions()
  // Handle response...
}

onMounted(() => {
  fetchTransactions() // Initial load
})
</script>
```

**Multiple Refresh Functions:**
```vue
<script setup>
import { useMultipleProfileData } from '@/composables/useProfileData'

const { onProfileSwitch, offProfileSwitch } = useMultipleProfileData()

// Register multiple refresh functions
onProfileSwitch(fetchTransactions)
onProfileSwitch(fetchAccounts)
onProfileSwitch(fetchBudgets)

// Functions will be called automatically when profile changes
</script>
```

### **API Context Headers**

All API requests automatically include the current profile context:
```javascript
// Headers sent with every request:
{
  'Authorization': 'Bearer jwt-token',
  'X-Current-Profile': '123',  // Current profile ID
  'Content-Type': 'application/json'
}
```

### **Rails Backend Implementation**

Your Rails backend should filter data based on the profile header:
```ruby
class TransactionsController < ApplicationController
  before_action :set_current_profile

  private

  def set_current_profile
    @current_profile_id = request.headers['X-Current-Profile']
    # Use this to filter data: Transaction.where(profile_id: @current_profile_id)
  end
end
```

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
