FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3006

# Hot reload for development
CMD ["npm", "run", "dev"]
