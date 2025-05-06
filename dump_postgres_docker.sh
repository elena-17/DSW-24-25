#!/bin/bash

# === CONFIGURACIÓN ===
CONTAINER_NAME="zap-postgres-bank"
DB_NAME="zap_db_bank"
DB_USER="zap_admin"
TAG="bank" 
DUMP_FILE="dump_${TAG}_$(date +%Y%m%d_%H%M%S).sql"
GZ_FILE="$DUMP_FILE.gz"

# === VERIFICAR CONTENEDOR ===
echo "📦 Verificando contenedor '$CONTAINER_NAME'..."
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ El contenedor '$CONTAINER_NAME' no está en ejecución. Aborta."
    exit 1
fi

# === HACER DUMP ===
echo "💾 Realizando dump de la base de datos '$DB_NAME'..."
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$DUMP_FILE"

if [ $? -ne 0 ]; then
    echo "❌ Error al hacer el dump."
    exit 1
fi

# === COMPRIMIR ===
echo "📦 Comprimiendo archivo..."
gzip "$DUMP_FILE"

# === RESULTADO ===
echo "✅ Dump completado y comprimido: $GZ_FILE"