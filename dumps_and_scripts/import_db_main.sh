CONTAINER_NAME="zap-postgres-main"
DB_NAME="zap_db_main"
DB_USER="zap_admin"
FILE="dump_main_20250506_224906.sql"
FILE_PATH="/tmp/$FILE"

echo "Checking container '$CONTAINER_NAME'..."
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "The container '$CONTAINER_NAME' is not running. Aborting."
    exit 1
fi

echo "Copying dump file to container..."
docker cp "$FILE" "$CONTAINER_NAME:$FILE_PATH"

echo "Decompressing dump file inside the container..."
docker exec -i "$CONTAINER_NAME" gunzip -f "$FILE_PATH.gz"


echo "Restoring database '$DB_NAME'..."
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -f "$FILE_PATH"
# Double import due to constraints errors
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -f "$FILE_PATH"

echo "Database restoration completed."
