# Stufe 1: Build-Umgebung
# Verwende eine spezifische, aktuelle Version für Reproduzierbarkeit und Sicherheit
FROM node:22.18.0-alpine AS builder

WORKDIR /app

# Zuerst nur package.json kopieren, um den Cache von Docker zu nutzen
COPY package*.json ./
RUN npm install
RUN npm install @tailwindcss/postcss

# Den gesamten Quellcode kopieren
COPY . .
# Führe den Type-Check und den Build aus
RUN npm run build

# Stufe 2: Produktions-Umgebung
# Verwende eine spezifische, aktuelle Version
FROM nginx:1.29.1-alpine

# --- Pakete aktualisieren und Cache leeren ---
RUN apk update && apk upgrade && \
    rm -rf /var/cache/apk/*

# Kopiere die gebauten, statischen Dateien aus der Build-Stufe
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiere die Nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80