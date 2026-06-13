#!/bin/bash

# Xeno Agent Deployment Script

echo "🚀 Starting Xeno Agent Deployment..."

# Set colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if environment variables are set
echo -e "${YELLOW}Checking environment variables...${NC}"

if [ -z "$DB_URL" ]; then
    echo -e "${RED}Error: DB_URL environment variable is not set${NC}"
    exit 1
fi

if [ -z "$OPENROUTER_API_KEY" ]; then
    echo -e "${YELLOW}Warning: OPENROUTER_API_KEY not set. AI features will not work.${NC}"
fi

if [ -z "$APIFY_API_KEY" ]; then
    echo -e "${YELLOW}Warning: APIFY_API_KEY not set. Browser automation will not work.${NC}"
fi

echo -e "${GREEN}Environment variables OK${NC}"

# Build backend
echo -e "${YELLOW}Building backend...${NC}"
cd backend
./mvnw clean package -DskipTests -Pproduction
if [ $? -ne 0 ]; then
    echo -e "${RED}Backend build failed${NC}"
    exit 1
fi
echo -e "${GREEN}Backend built successfully${NC}"

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd ../frontend
npm ci
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend build failed${NC}"
    exit 1
fi
echo -e "${GREEN}Frontend built successfully${NC}"

# Copy frontend build to backend static
echo -e "${YELLOW}Copying frontend to backend static...${NC}"
cp -r dist/* ../backend/src/main/resources/static/
echo -e "${GREEN}Frontend copied${NC}"

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
cd ../backend
java -jar target/xeno-agent-1.0.0.jar --spring.profiles.active=production --spring.datasource.url=$DB_URL --spring.jpa.hibernate.ddl-auto=update &
BACKEND_PID=$!

# Wait for backend to start
sleep 10

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}Backend started successfully (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}Backend failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}Backend running on port 8080${NC}"
echo -e "${GREEN}To stop: kill $BACKEND_PID${NC}"