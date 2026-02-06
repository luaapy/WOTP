FROM node:22-slim

# Install system dependencies for Baileys
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Create volume for WhatsApp session
VOLUME ["/app/auth_info_baileys", "/app/db"]

EXPOSE 3000

CMD ["node", "src/index.js"]
