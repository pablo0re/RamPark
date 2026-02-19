import firebase_admin
from firebase_admin import credentials, firestore, storage, auth

# Initialize Firebase Admin SDK
# Path to your downloaded serviceAccountKey.json
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'your-app-id.appspot.com'
})

db = firestore.client()
bucket = storage.bucket()