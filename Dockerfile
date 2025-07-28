FROM --platform=linux/amd64 node:18-slim

WORKDIR /app

# Copy all necessary files
COPY package.json .
COPY package-lock.json .
COPY node_modules ./node_modules
COPY . .

# Run main.js
ENTRYPOINT ["node", "app/main.js"]
