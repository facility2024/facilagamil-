FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:22-slim AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/server/index.mjs"]
