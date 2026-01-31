# Multi-stage build: build frontend (Vite) then run server which serves the built files

FROM node:18-alpine AS builder
WORKDIR /app

# install root deps for building the frontend
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

# copy everything and build
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# install server deps only
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm ci --only=production --silent || (cd server && npm install --silent)

# copy server code
COPY server ./server

# copy built frontend from builder
COPY --from=builder /app/dist ./dist

WORKDIR /app/server
EXPOSE 3001
ENV PORT=3001
CMD ["node", "index.js"]
