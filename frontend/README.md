# Appo Frontend

React frontend for Appo task management application.

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- Socket.io Client
- Axios

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── context/         # React Context providers
├── services/        # API and external services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── styles/          # Global styles
```

## Features

- JWT authentication
- Real-time updates with Socket.io
- Responsive design
- Task management
- Project collaboration
- Notification system

## Environment Variables

See `.env.example` for required environment variables.

## License

MIT
