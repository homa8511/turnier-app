<p align="center">
  <img src="https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg" alt="License: CC BY-NC-ND 4.0">
  <a href="https://github.com/homa8511/turnier-app/actions/workflows/ci.yml"><img src="https://github.com/homa8511/turnier-app/actions/workflows/ci.yml/badge.svg" alt="CI Pipeline"></a>
  <a href="https://github.com/homa8511/turnier-app/actions/workflows/security-scan.yml"><img src="https://github.com/homa8511/turnier-app/actions/workflows/security-scan.yml/badge.svg" alt="Security Scan"></a>
  <a href="https://sonarcloud.io/summary/new_code?id=DEIN_PROJEKT_KEY"><img src="https://sonarcloud.io/api/project_badges/measure?project=DEIN_PROJEKT_KEY&metric=alert_status" alt="Quality Gate Status"></a>
</p>

# Fußballturnier-Manager (Schweizer System)

Eine voll funktionsfähige Webanwendung zur Verwaltung von Fußballturnieren, die auf einer professionellen, modernen Architektur basiert.

---

## Features

* **Dynamische Turnierkonfiguration:** Name, Spielort, Beschreibung, Turnierbild und flexible Regeln (Gruppen, Teams, Felder, Spielzeiten).
* **Speichern & Laden:** Jedes Turnier erhält eine eindeutige ID und wird persistent in einer PostgreSQL-Datenbank gespeichert.
* **Automatischer Spielplan:** Zufällige erste Runde, Folgerunden nach Schweizer System.
* **Live-Ansicht:** Echtzeit-Tabellen und ein Spielplan, der nach Gruppen oder chronologisch sortiert werden kann.
* **URL-basiertes Rechtesystem:** Private Admin-Links (`/host/event/<id>`) und öffentliche Zuschauer-Links (`/event/<id>`).
* **Automatisierte Qualitätssicherung & Deployment:** CI/CD-Pipeline mit Linting, Unit/API-Tests, Code-Analyse (SonarCloud), Abhängigkeits-Management (Renovate), Sicherheits-Scans (Trivy) und automatischem Veröffentlichen der Docker-Images in der GitHub Container Registry.

---

## Tech Stack

* **Frontend:** Vue.js 3, TypeScript, Vite, Tailwind CSS
* **Backend:** Node.js 22, Express.js, TypeScript, Domain-Driven Design (DDD)
* **Datenbank:** PostgreSQL
* **Infrastruktur & Deployment:** Docker & Docker Compose, Nginx
* **Qualitätssicherung:** Jest, Supertest, ESLint, Prettier, SonarCloud, Renovate, Trivy

---

## Installation & Start (Produktion mit Docker)

Diese Methode ist für den Betrieb auf einem Server oder für einen einfachen lokalen Start empfohlen, da sie die vorgefertigten Docker-Images aus der GitHub Container Registry verwendet.

**1. Voraussetzungen:** Docker und Docker Compose müssen installiert sein.

**2. Umgebungsvariablen konfigurieren**
Kopieren Sie die `.env.example`-Datei nach `.env`.
```bash
cp .env.example .env
```
Die `IMAGE_OWNER`-Variable ist bereits korrekt auf `homa8511` gesetzt. Sie können optional den `TAG` ändern, um eine spezifische Version zu starten.

**3. Anwendung starten**
Führen Sie im Hauptverzeichnis des Projekts aus:
```bash
docker-compose up -d
```
Docker Compose lädt nun die passenden Images von `ghcr.io/homa8511/turnier-app...` herunter und startet die Container im Hintergrund.

**4. Anwendung aufrufen**
Die Anwendung ist jetzt unter **http://localhost:8080** erreichbar.

---

## Lokale Entwicklung (ohne Docker)

Diese Methode ist ideal für die aktive Entwicklung am Code, da sie schnellere Ladezeiten und Hot-Reloading ermöglicht.

**1. Voraussetzungen:**
* Node.js (Version 22 oder höher)
* Eine laufende PostgreSQL-Instanz

**2. Backend einrichten**
```bash
# 1. Ins Backend-Verzeichnis wechseln
cd backend

# 2. Abhängigkeiten installieren
npm install

# 3. Test-Umgebungsvariablen als Vorlage kopieren
cp .env.test .env

# 4. .env-Datei anpassen: Tragen Sie die Verbindungsdaten
#    Ihrer lokalen PostgreSQL-Datenbank ein.

# 5. Backend im Entwicklungsmodus starten (mit Hot-Reload)
npm run dev
```
Das Backend läuft nun auf `http://localhost:3000`.

**3. Frontend einrichten** (in einem zweiten Terminal)
```bash
# 1. Ins Frontend-Verzeichnis wechseln
cd frontend

# 2. Abhängigkeiten installieren
npm install

# 3. Frontend-Entwicklungsserver starten
npm run dev
```
Das Frontend läuft nun auf **http://localhost:5173** (oder einem anderen Port, falls dieser belegt ist).

---

## Testing

Das Backend verfügt über eine umfassende Suite von Unit- und API-Tests.

* **Unit-Tests ausführen:** `cd backend && npm test`
* **API-Tests ausführen (benötigt laufende Docker-Container):** `cd backend && npm run test:api`

---

## Lizenz

Dieses Projekt ist unter der **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)** lizenziert.

Den vollständigen Lizenztext finden Sie in der [LICENSE](LICENSE)-Datei.