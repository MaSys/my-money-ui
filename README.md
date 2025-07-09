# My Money - Personal Finance Manager

A modern Vue.js frontend application for personal finance management with theme customization and authentication.

## Features

- **Authentication System**: Complete login/logout with route protection
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Dashboard**: Financial overview with balance cards and transaction history

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
   cd my-money-ui
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 
