import os
from typing import Optional

try:
    from minio import Minio
except Exception:  # pragma: no cover
    Minio = None  # type: ignore

_client: Optional["Minio"] = None


def ensure_minio_bucket() -> None:
    """Ensure MinIO bucket exists; skip silently if not configured."""
    endpoint = os.getenv("MINIO_ENDPOINT", "")
    access = os.getenv("MINIO_ACCESS_KEY", "")
    secret = os.getenv("MINIO_SECRET_KEY", "")
    bucket = os.getenv("MINIO_BUCKET", "kids-photo-temp")

    if not endpoint or Minio is None:
        return

    secure = endpoint.startswith("https://")
    host = endpoint.replace("http://", "").replace("https://", "")
    client = Minio(host, access_key=access, secret_key=secret, secure=secure)
    global _client
    _client = client

    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)

    # NOTE: 生命周期规则（7 天保留）可在后续加上；此处仅保证桶存在以便开发使用。