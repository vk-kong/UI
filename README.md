# Kong Deploy UI

A comprehensive web-based user interface for managing Kong environment deployments with third-party software integration. This application enables users to easily configure, deploy, and manage Kong environments both locally and in the cloud.

## Features

### 🔐 Authentication
- Secure login system with user authentication
- Protected routes ensuring only authenticated users can access deployment features
- Session management with logout functionality

### 🎯 Third-Party Software Selection
The UI provides an intuitive interface to select from a variety of popular third-party software components:

- **Grafana** - Analytics & monitoring platform
- **Prometheus** - Monitoring system & time series database
- **Jaeger** - Distributed tracing system
- **Elasticsearch** - Search and analytics engine
- **Kibana** - Data visualization dashboard
- **PostgreSQL** - Relational database
- **Redis** - In-memory data store
- **HashiCorp Vault** - Secrets management

### 🚀 Deployment Options

#### Local Deployment
- Deploy Kong environment with selected components locally using Docker containers
- One-click deployment initiation
- Real-time deployment status feedback
- Perfect for development and testing

#### Cloud Deployment
- Push local Kong environment to cloud platforms
- Support for multiple cloud providers:
  - Amazon Web Services (AWS)
  - Google Cloud Platform (GCP)
  - Microsoft Azure
- Configurable region and instance type settings
- Comprehensive configuration validation

### 📊 Dashboard
- Clean, modern, and responsive user interface
- Tab-based navigation between local and cloud deployment
- Visual component selection with checkboxes
- Real-time configuration summary
- Deployment status tracking

## Technology Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7
- **Routing**: React Router DOM
- **Styling**: Custom CSS with responsive design
- **Language**: JavaScript (ES6+)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vk-kong/UI.git
cd UI
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Development

#### Frontend Development

Run the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173/`

#### Backend Development

Run the backend server:
```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:3000/` (or the port configured in your backend)

The application will be available at `http://localhost:5173/`

### Building for Production

Build the frontend application:
```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

Preview the production build:
```bash
cd frontend
npm run preview
```

### Linting

Check frontend code quality:
```bash
cd frontend
npm run lint
```

## Project Structure

```
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/            # React Context providers
│   │   │   └── AuthContext.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Login.css
│   │   │   ├── Dashboard.jsx
│   │   │   └── Dashboard.css
│   │   ├── App.jsx             # Main application component
│   │   ├── App.css             # Global application styles
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Global CSS reset and base styles
│   ├── public/                 # Static assets
│   ├── index.html             # HTML entry point
│   ├── vite.config.js         # Vite configuration
│   ├── package.json           # Frontend dependencies and scripts
│   └── eslint.config.js       # ESLint configuration
├── backend/                # Node.js/Express backend API
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── migrations/         # Database migrations
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── server.js           # Express server entry point
│   └── package.json        # Backend dependencies and scripts
└── README.md               # Project documentation
```

## Usage Guide

### Logging In

1. Navigate to the application URL
2. Enter your username and password
3. Click the "Login" button

**Note**: For development purposes, any non-empty username and password combination will authenticate successfully.

### Deploying Locally

1. After logging in, you'll land on the dashboard
2. Select the third-party software components you want to include by clicking on the cards
3. Review your selections in the "Local Environment Configuration" section
4. Click "Deploy Locally" to initiate the deployment
5. Wait for the success notification

### Deploying to Cloud

1. Click on the "Cloud Deployment" tab
2. Select your desired third-party software components
3. Configure the cloud settings:
   - Choose cloud provider (AWS, GCP, or Azure)
   - Enter the region (e.g., us-east-1)
   - Specify instance type (e.g., t3.medium)
4. Review your configuration
5. Click "Deploy to Cloud" to initiate the cloud deployment

## Integration Points

This UI is designed to integrate with backend automation scripts that:

- Build Kong environments locally with Docker
- Deploy selected third-party software components
- Provision cloud infrastructure
- Manage deployment lifecycles

**Note**: The current implementation includes placeholder deployment logic. To integrate with actual automation scripts, implement API endpoints and update the deployment handlers in the Dashboard component.

## Future Enhancements

- Backend API integration for real automation
- WebSocket support for real-time deployment progress
- Deployment history and logs viewer
- Advanced configuration options for each third-party component
- Multi-environment management
- Role-based access control
- Deployment rollback capabilities

## Screenshots

### Login Page
![Login Page](https://github.com/user-attachments/assets/5e5dc51c-9aea-4451-a5f6-63c5be057891)

### Dashboard - Local Deployment
![Dashboard Local](https://github.com/user-attachments/assets/a0adfd8c-411e-4f87-b3ba-2de7778779a5)

### Dashboard - With Selections
![Dashboard Selections](https://github.com/user-attachments/assets/2d482a3b-c446-4424-bf53-6ff8a549525a)

### Dashboard - Cloud Deployment
![Dashboard Cloud](https://github.com/user-attachments/assets/1683ece1-023d-4b05-ae56-02b435cfc241)

## License

This project is part of the vk-kong organization.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
