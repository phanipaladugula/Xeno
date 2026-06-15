# XenoAgent - True Agent Application

A monolithic SpringBoot + React application implementing a "True Agent" with LLM capabilities (OpenRouter) and browser automation (Apify).

## Features

- **User Authentication** - Secure login/registration with BCrypt password encoding
- **Single and Group Chat** - AI-powered conversations with message history
- **Task Management** - Create, update, and track tasks with status and priority
- **Web Search** - Browser automation via Apify for real-time web searches
- **Voice Assistant** - Web Speech API integration for voice input/output
- **Memory System** - Context persistence for improved AI responses

## Tech Stack

- **Backend**: Java 17 + SpringBoot 3.x
- **Frontend**: React 18 + Vite
- **Database**: MySQL with connection pooling
- **APIs**: OpenRouter (LLM), Apify (Browser automation)
- **Architecture**: Monolithic MVC (Model-View-Controller)

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

2. Create `.env` file:
```properties
OPENROUTER_API_KEY=your_openrouter_api_key
APIFY_API_KEY=your_apify_api_key
DB_URL=jdbc:mysql://localhost:3306/xenodb
DB_USERNAME=xenouser
DB_PASSWORD=xenopassword
```

3. Build the project:
```bash
./mvnw clean install
```

4. Run the application:
```bash
./mvnw spring-boot:run
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

## Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Test Coverage
```bash
cd backend
./mvnw test jacoco:report
```

## Deployment

### Manual Deployment

1. Build for production:
```bash
cd frontend
npm run build

cd ../backend
./mvnw clean package -Pproduction
```

2. Copy frontend build:
```bash
cp -r frontend/dist/* backend/src/main/resources/static/
```

3. Run production server:
```bash
java -jar backend/target/xeno-agent-1.0.0.jar --spring.profiles.active=production
```

### Using Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

### Environment Variables for Production

- `OPENROUTER_API_KEY` - OpenRouter API key for LLM access
- `APIFY_API_KEY` - Apify API key for browser automation
- `DB_URL` - MySQL connection URL
- `DB_USERNAME` - MySQL username
- `DB_PASSWORD` - MySQL password
- `CORS_ORIGINS` - Comma-separated list of allowed CORS origins

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Chat
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `POST /api/chats/group` - Create group chat
- `GET /api/chats/{id}/messages` - Get chat messages
- `POST /api/chats/{id}/messages` - Send message
- `DELETE /api/chats/{id}` - Delete chat
- `POST /api/chats/{id}/participants` - Add participant
- `DELETE /api/chats/{id}/participants/{userId}` - Remove participant

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PUT /api/tasks/{id}/complete` - Mark task complete
- `GET /api/tasks/status/{status}` - Filter by status
- `GET /api/tasks/priority/{priority}` - Filter by priority

### Agent
- `POST /api/agent/chat` - Process message with AI
- `GET /api/agent/status` - Check agent configuration
- `POST /api/agent/search` - Perform web search
- `POST /api/agent/extract` - Extract content from URL

### Memory
- `GET /api/memory/preferences` - Get user preferences
- `PUT /api/memory/preferences` - Update preferences
- `GET /api/memory/context` - Get memory context
- `GET /api/memory/stats` - Get memory statistics

## Project Structure

```
XenoAgent/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/xeno/agent/
│   │   │   │   ├── controller/    # REST endpoints
│   │   │   │   ├── service/        # Business logic
│   │   │   │   ├── repository/     # Data access
│   │   │   │   ├── model/          # JPA entities
│   │   │   │   ├── dto/            # Data transfer objects
│   │   │   │   └── config/         # Configuration
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application-production.properties
│   │   └── test/                   # Unit and integration tests
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
└── frontend/
    ├── src/
    │   ├── components/            # React components
    │   ├── services/              # API clients
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## Code Style

This project follows student-level coding conventions:

**Backend:**
- No lambda functions
- No complex streams
- Basic error handling with try-catch
- Simple service layer methods
- Standard getters/setters

**Frontend:**
- No complex hooks beyond useState and useEffect
- No custom hooks
- Basic CSS (no styled-components)
- Simple component composition
- Standard React patterns

## License

This project is part of the Xeno Engineering Internship Assignment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit with conventional commit messages
4. Push to the branch
5. Create a Pull Request

## Support

For issues and questions, please create an issue in the repository.