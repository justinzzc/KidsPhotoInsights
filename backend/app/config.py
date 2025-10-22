import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

class Settings:
    def __init__(self) -> None:
        self.API_KEY = os.getenv("API_KEY", "")
        self.DATABASE_URL = os.getenv("DATABASE_URL", "")
        self.MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "")
        self.MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "")
        self.MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "")
        self.MINIO_BUCKET = os.getenv("MINIO_BUCKET", "kids-photo-temp")
        self.RETENTION_DAYS = int(os.getenv("RETENTION_DAYS", "7"))