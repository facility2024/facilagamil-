FROM node:22-alpine AS builder
WORKDIR /app

ARG DEPLOY=v5-index-2026-09-08

# O valor do ARG participa de um comando RUN real, então mudar o DEPLOY
# quebra o cache do Docker e força o rebuild completo (npm ci + vite build).
COPY package.json package-lock.json* bun.lock* ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi

COPY . .
RUN echo "deploy=$DEPLOY" > .deploy-version \
 && npm run build \
 && test -f dist/server/index.mjs \
 && echo "Build OK: dist/server/index.mjs existe ($DEPLOY)" \
 && ls -la dist/client/ \
 && ls -la dist/client/assets/ | head -5

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const p=process.env.PORT||3000;fetch('http://127.0.0.1:'+p+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server/index.mjs"]
