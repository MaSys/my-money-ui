# My Money - Personal Finance Manager

A modern Vue.js application for managing personal finances with customizable themes and comprehensive financial tracking.

## Features

- 🎨 **Theme Customization**: Choose from multiple color themes (Blue, Green, Purple, Red)
- 🔐 **Authentication**: Complete auth flow with login, signup, and password reset
- 📊 **Dashboard**: Financial overview with balance, income, expenses, and savings tracking
- 💼 **Sidebar Navigation**: Easy navigation with responsive mobile design
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🎯 **Budget Tracking**: Visual budget overview with progress indicators
- 📈 **Transaction History**: Recent transactions with categorization

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vue Router** - Official router for Vue.js
- **Pinia** - State management for Vue
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my_money-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── MainLayout.vue   # Main layout with sidebar
│   ├── Sidebar.vue      # Navigation sidebar
│   └── ThemeSwitcher.vue # Theme customization component
├── views/               # Page components
│   ├── LoginView.vue    # Login page
│   ├── SignupView.vue   # Registration page
│   ├── ResetPasswordView.vue # Password reset
│   └── DashboardView.vue # Main dashboard
├── stores/              # Pinia stores
│   └── theme.js         # Theme management
├── router/              # Vue Router configuration
│   └── index.js         # Route definitions
├── App.vue              # Root component
├── main.js              # Application entry point
└── style.css            # Global styles and theme variables
```

## Theme Customization

The application supports dynamic theme switching with 4 built-in color schemes:

- **Blue** (Default): Professional blue theme
- **Green**: Nature-inspired green theme  
- **Purple**: Creative purple theme
- **Red**: Bold red theme

Themes are implemented using CSS custom properties and can be easily extended by adding new color definitions in `src/style.css`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Lint and fix code

## Features Walkthrough

### Authentication Flow
- **Login**: Email/password authentication with remember me option
- **Signup**: User registration with form validation
- **Password Reset**: Email-based password recovery

### Dashboard
- **Financial Overview**: Key metrics display (Balance, Income, Expenses, Savings)
- **Recent Transactions**: Latest financial transactions with categorization
- **Budget Tracking**: Visual progress bars for different spending categories
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Navigation
- **Sidebar Menu**: Collapsible navigation with route highlighting
- **Mobile Support**: Hamburger menu for mobile devices
- **Theme Switcher**: Built-in theme customization controls

## Customization

### Adding New Themes

1. Add theme colors to `src/style.css`:
```css
[data-theme="your-theme"] {
  --color-primary-500: #your-color;
  /* Add other color variations */
}
```

2. Update the themes array in `src/stores/theme.js`:
```javascript
const themes = [
  // existing themes...
  { name: 'your-theme', label: 'Your Theme', color: '#your-color' }
]
```

### Adding New Routes

1. Create your Vue component in `src/views/`
2. Add the route to `src/router/index.js`
3. Update the sidebar navigation in `src/components/Sidebar.vue`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 