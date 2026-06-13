# XenoAgent - True Agent Application

A monolithic SpringBoot + React application implementing a "True Agent" with LLM capabilities (OpenRouter) and browser automation (Apify).

## Features

- User Authentication (Login/Registration)
- Single and Group Chat with AI responses
- Task Management System
- Web Search via Apify
- Voice Assistant (Web Speech API)
- Memory System for context persistence

## Tech Stack

- **Backend**: Java 17 + SpringBoot 3.x
- **Frontend**: React 18 + Vite
- **Database**: MySQL
- **APIs**: OpenRouter (LLM), Apify (Browser automation)

## Setup Instructions

### Prerequisites

1. Install Java 17 or later
2. Install Maven
3. Install Node.js and npm
4. Install MySQL and create database:
```sql
CREATE DATABASE xenodb;
CREATE USER 'xenouser'@'localhost' IDENTIFIED BY 'xenopassword';
GRANT ALL PRIVILEGES ON xenodb.* TO 'xenouser'@'localhost';
FLUSH PRIVILEGES;
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean package
```

3. Run the application:
```bash
mvn spring-boot:run
```

Backend will run on port 8080.

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Frontend will run on port 5173.

### Environment Variables

Create a `.env` file in the backend root:
```properties
OPENROUTER_API_KEY=your_openrouter_api_key
APIFY_API_KEY=your_apify_api_key
DB_URL=jdbc:mysql://localhost:3306/xenodb
DB_USERNAME=xenouser
DB_PASSWORD=xenopassword
```

## Project Structure

```
XenoAgent/
├── backend/          # SpringBoot backend
│   ├── src/
│   │   ├── main/     # Main application code
│   │   └── test/     # Tests
│   └── pom.xml       # Maven dependencies
└── frontend/         # React frontend
    ├── src/
    │   ├── components/
    │   └── services/
    └── package.json  # npm dependencies
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### Chat
- GET `/api/chats` - Get user's chats
- POST `/api/chats` - Create new chat
- GET `/api/chats/{id}/messages` - Get chat messages
- POST `/api/chats/{id}/messages` - Send message

### Tasks
- GET `/api/tasks` - Get user's tasks
- POST `/api/tasks` - Create new task
- PUT `/api/tasks/{id}` - Update task
- DELETE `/api/tasks/{id}` - Delete task

## Testing

### Backend Tests
```bash
cd backend
mvn clean test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## License

This project is part of the Xeno Engineering Internship Assignment.