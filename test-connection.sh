#!/bin/bash
# Script para probar la conexión con la API de Google Stitch

set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ -f "$DIR/.env" ]; then
  export $(grep -v '^#' "$DIR/.env" | xargs)
else
  echo "❌ Error: No se encontró el archivo .env"
  exit 1
fi

if [ -z "$STITCH_API_KEY" ]; then
  echo "❌ Error: STITCH_API_KEY no está definida en .env"
  exit 1
fi

echo "🚀 Conectando a Google Stitch (https://stitch.googleapis.com/mcp)..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "https://stitch.googleapis.com/mcp" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $STITCH_API_KEY" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"list_projects","arguments":{}},"id":1}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ ¡Conexión exitosa! (Código HTTP 200)"
  echo "Proyectos encontrados en tu cuenta:"
  echo "$BODY" | grep -o '"title":"[^"]*"' | sed 's/"title":/ - /g' | tr -d '"'
else
  echo "❌ Error al conectar. Código HTTP: $HTTP_CODE"
  echo "$BODY"
fi
