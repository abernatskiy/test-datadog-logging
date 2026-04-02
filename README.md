# Minimal EVM squid with Datadog logging

This is a starter template of a squid indexer for EVM networks (Ethereum, Polygon, BSC, etc.). It's modified to send logs to Datadog.

Dependencies: Node.js v20 or newer, Git, Docker.

## Quickstart

1. Clone the repo.

2. Create and populate the `.env` file using `.env.example` as a starter

3. Start the squid

```bash
npm ci
npm run build
docker compose up -d
node -r dotenv/config lib/main.js
```
