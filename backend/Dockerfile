# Use LTS Node
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
# Fly will hit whatever PORT your app binds; we'll use 8080
ENV PORT=8080

# Faster, smaller installs
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Optional: healthcheck for Fly (must succeed)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT||8080) + '/reservations?date=2099-01-01').then(r=>process.exit(0)).catch(()=>process.exit(1))"

EXPOSE 8080
CMD ["npm", "start"]