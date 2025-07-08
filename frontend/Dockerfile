FROM node:18-alpine

# Install dependencies for development
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"] 