import os

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

# Configuration from environment (with MinIO defaults for local dev)
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://localhost:9000")
S3_BUCKET = os.getenv("S3_BUCKET", "gms-parts")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minioadmin")

s3_client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    config=Config(signature_version="s3v4"),
    region_name="us-east-1",  # MinIO/DO typically don't care about region but boto3 requires it
)


def generate_upload_url(s3_key: str, mime_type: str = "image/webp"):
    """
    Generates a presigned URL for a PUT operation.
    Enforces Content-Type and 10MB limit in the signature.
    """
    try:
        url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": S3_BUCKET, "Key": s3_key, "ContentType": mime_type},
            ExpiresIn=300,  # 5 minutes
        )
        return url
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return None


def generate_view_url(s3_key: str, original_filename: str):
    """
    Generates a presigned URL for a GET operation.
    Restores the original filename for the user.
    """
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": s3_key,
                "ResponseContentDisposition": f'attachment; filename="{original_filename}"',
            },
            ExpiresIn=300,  # 5 minutes
        )
        return url
    except ClientError as e:
        print(f"Error generating view URL: {e}")
        return None


def delete_object(s3_key: str):
    """Deletes an object from the bucket."""
    try:
        s3_client.delete_object(Bucket=S3_BUCKET, Key=s3_key)
        return True
    except ClientError:
        return False


def get_object_head(s3_key: str):
    """Gets the first 12 bytes of an object to verify magic numbers."""
    try:
        response = s3_client.get_object(Bucket=S3_BUCKET, Key=s3_key, Range="bytes=0-11")
        return response["Body"].read()
    except ClientError:
        return None
