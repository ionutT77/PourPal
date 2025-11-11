# PourPal Frontend Documentation

## Overview
PourPal is a web application designed to help adults (18+) connect and make platonic friends through casual, group-based social events called "Hangouts." This frontend documentation provides an overview of the structure, components, and setup instructions for the React application.

## Project Structure
The frontend of the PourPal project is organized as follows:

```
frontend/
├── public/
│   └── index.html          # Main HTML file for the React application
├── src/
│   ├── components/         # Contains all React components
│   │   ├── Auth/           # Authentication components
│   │   │   ├── Login.jsx   # Login form component
│   │   │   └── Register.jsx # Registration form component
│   │   ├── Hangouts/       # Hangout-related components
│   │   │   ├── HangoutList.jsx      # List of upcoming Hangouts
│   │   │   ├── HangoutDetails.jsx   # Details of a specific Hangout
│   │   │   └── CreateHangout.jsx    # Form to create a new Hangout
│   │   ├── Profile/        # User profile component
│   │   │   └── UserProfile.jsx       # View and edit user profile
│   │   └── Chat/          # Chat functionality component
│   │       └── GroupChat.jsx          # Real-time chat for Hangouts
│   ├── services/           # API service functions
│   │   └── api.js         # Functions for making API calls
│   ├── App.jsx             # Main application component
│   └── index.js           # Entry point for the React application
├── package.json            # Project metadata and dependencies
└── README.md               # Frontend documentation
```

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd PourPal/frontend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

### Running the Application
To start the development server, run:
```
npm start
```
This will launch the application in your default web browser at `http://localhost:3000`.

### Building for Production
To create a production build of the application, run:
```
npm run build
```
This will generate an optimized build in the `build` directory.

## Contributing
Contributions are welcome! Please follow the standard Git workflow for submitting issues and pull requests.

## License
This project is licensed under the MIT License. See the LICENSE file for details.