# PourPal Backend Documentation

## Overview
PourPal is a web application designed to help adults (18+) make platonic friends by connecting them through casual, group-based social events called "Hangouts." This backend documentation outlines the structure and functionality of the backend services built using Django.

## Project Structure
The backend is organized into several key components:

- **pourpal/**: Contains the main Django project settings and configuration files.
  - `settings.py`: Configuration for the Django project, including database settings and installed apps.
  - `urls.py`: URL routing for the application.
  - `wsgi.py`: Entry point for WSGI-compatible web servers.

- **users/**: Manages user-related functionalities.
  - `models.py`: Defines the User model and related models.
  - `views.py`: Handles user-related API requests (registration, login).
  - `serializers.py`: Serializes User model instances to and from JSON.
  - `urls.py`: URL routing for user-related endpoints.

- **hangouts/**: Manages Hangout-related functionalities.
  - `models.py`: Defines the Hangout model and related models.
  - `views.py`: Handles Hangout-related API requests.
  - `serializers.py`: Serializes Hangout model instances to and from JSON.
  - `urls.py`: URL routing for Hangout-related endpoints.

- **chat/**: Manages chat functionalities for Hangouts.
  - `models.py`: Defines the Chat model and related models.
  - `views.py`: Handles chat-related API requests.
  - `serializers.py`: Serializes Chat model instances to and from JSON.
  - `consumers.py`: Implements WebSocket consumers for real-time chat.

- `manage.py`: Command-line utility for managing the Django project.
- `requirements.txt`: Lists the Python packages required for the backend.

## Installation
To set up the backend development environment, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd PourPal/backend
   ```

2. **Create a Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the Development Server**
   ```bash
   python manage.py runserver
   ```

## API Endpoints
The backend provides several API endpoints for user management, Hangout creation, and chat functionalities. Refer to the individual `urls.py` files in each app for detailed routing information.

## Contributing
Contributions to the PourPal project are welcome! Please follow the standard Git workflow for submitting changes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.