import json
import os

import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from dotenv import load_dotenv

load_dotenv()

service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")
storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET", "your-app-id.appspot.com")

if service_account_json:
    cred = credentials.Certificate(json.loads(service_account_json))
else:
    cred = credentials.Certificate(service_account_path)

firebase_admin.initialize_app(cred, {
    "storageBucket": storage_bucket
})

db = firestore.client()
bucket = storage.bucket()
