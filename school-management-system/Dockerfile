# The official image of node js from docker hub
FROM node:25-alpine3.21

# The working directory in the container
WORKDIR /app-dire

# Copy package.json files first
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose your application port
EXPOSE 3400

# The final command to run in development mode
CMD ["npm", "run", "dev"]