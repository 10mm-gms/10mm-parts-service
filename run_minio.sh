#!/usr/bin/env bash
# Script to launch MinIO for local S3-compatible testing
# Standard Version: 0.1

CONTAINER_NAME="gms-minio"
DATA_DIR="./data/minio"

mkdir -p "$DATA_DIR"

echo "Stopping and removing existing MinIO container..."
docker stop "$CONTAINER_NAME" 2>/dev/null
docker rm "$CONTAINER_NAME" 2>/dev/null

echo "Launching MinIO..."
docker run -d \
    --name "$CONTAINER_NAME" \
    -p 9000:9000 \
    -p 9001:9001 \
    -e "MINIO_ROOT_USER=minioadmin" \
    -e "MINIO_ROOT_PASSWORD=minioadmin" \
    -v "$(pwd)/data/minio:/data" \
    minio/minio server /data --console-address ":9001"

echo "------------------------------------------------"
echo "MinIO is running at http://localhost:9000"
echo "Console is at http://localhost:9001"
echo "Credentials: minioadmin / minioadmin"
echo "------------------------------------------------"
