# Use the official Node.js 20 image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Tell Docker the app listens on port 5000
EXPOSE 5000

# Start the backend
CMD ["node", "server.js"]