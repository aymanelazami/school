# SCHOLA Frontend

The React frontend for the SCHOLA School Management System.

## 🛠 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router 7
- **Styling**: TailwindCSS
- **Icons**: Lucide React

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at `http://localhost:5173`

## 📁 Structure

```
src/
├── components/      # Reusable components
│   ├── settings/    # Settings page components
│   └── ui/          # UI primitives
├── contexts/        # React contexts
├── hooks/           # Custom hooks
├── libs/            # API utilities
└── pages/           # Page components
    └── settings/    # Settings pages
```

## 🔧 Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔑 Test Credentials

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@schola.com    | admin123    |
| Teacher | teacher@schola.com  | teacher123  |
| Student | student@schola.com  | student123  |

## 📱 Pages

- `/login` - Authentication page
- `/dashboard` - Main dashboard with stats
- `/settings/profile` - Profile settings
- `/settings/security` - Security settings
- `/settings/notifications` - Notification preferences
