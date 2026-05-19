import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth

if os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON"):
    service_account_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"])
    cred = credentials.Certificate(service_account_info)
else:
    cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    'storageBucket': os.environ.get("FIREBASE_STORAGE_BUCKET", "your-app-id.appspot.com")
})

db = firestore.client()
bucket = storage.bucket()