# Argument mit Standard-Fallback definieren
ARG NODE_VERSION=24-alpine

# Stufe 1: Build-Umgebung
FROM node:${NODE_VERSION} AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stufe 2: Produktions-Umgebung
FROM node:${NODE_VERSION}

WORKDIR /usr/src/app

# Pakete aktualisieren, curl für den Healthcheck installieren und Cache leeren
RUN apk update && apk upgrade && apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/openapi.yaml .

# Unprivilegierten Benutzer erstellen und verwenden
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

EXPOSE 3000

# Healthcheck, der prüft, ob die API und die DB-Verbindung funktionieren
# KORREKTUR: Längere start-period und mehr retries, um der App Zeit zum Verbinden zu geben
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD [ "npm", "start" ]