CONTAINER_NAME="zap-postgres-bank"
DB_NAME="zap_db_bank"
DB_USER="zap_admin"
FILE="dump_bank_20250506_225051.sql.gz"
FILE_PATH="/tmp/$FILE"

echo "Checking container '$CONTAINER_NAME'..."
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "The container '$CONTAINER_NAME' is not running. Aborting."
    exit 1
fi

echo "Copying dump file to container..."
docker cp "$FILE" "$CONTAINER_NAME:$FILE_PATH"

echo "Decompressing dump file inside the container..."
docker exec -i "$CONTAINER_NAME" gunzip -f "$FILE_PATH"

FILE_PATH_SQL="${FILE_PATH%.gz}"

echo "Restoring database '$DB_NAME'..."
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -f "$FILE_PATH_SQL"

echo "Database restoration completed."
