# ==========================================
# DOCKERFILE FOR DATABASE SERVICE
# ==========================================

# 1. Use Node.js base image
FROM node:18-slim

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# 4. Copy source code
COPY . .

# 5. Expose port 5000
EXPOSE 5000

# 6. Start the service
CMD ["npm", "start"]
