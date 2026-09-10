FROM node:22-alpine AS builder
WORKDIR /app

ARG DEPLOY=v6-gitsha-2026-09-09
ARG GIT_SHA=unknown

# O valor do ARG participa de um comando RUN real, então mudar o DEPLOY
# quebra o cache do Docker e força o rebuild completo (npm ci + vite build).
COPY package.json package-lock.json* bun.lock* ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi

COPY . .
RUN echo "deploy=$DEPLOY" > .deploy-version \
 && echo "git-sha=$GIT_SHA" > .git-sha \
 && echo ">> BUILDING deploy=$DEPLOY git-sha=$GIT_SHA" \
 && npm run build \
 && test -f dist/server/index.mjs \
 && echo "Build OK: dist/server/index.mjs existe ($DEPLOY / $GIT_SHA)" \
 && ls -la dist/client/ \
 && ls -la dist/client/assets/ | head -5

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const p=process.env.PORT||3000;fetch('http://127.0.0.1:'+p+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "scripts/easypanel-server.mjs"]
