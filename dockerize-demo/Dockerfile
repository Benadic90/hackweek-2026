# Use a lightweight base image to optimize image size
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run the application as a non-root user for security
USER node

# Start the Node.js application
CMD ["npm", "start"]
