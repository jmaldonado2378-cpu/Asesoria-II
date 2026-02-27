import os
import django
import sys
import urllib.request
import urllib.error
from django.utils import timezone

import codecs

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend-next', '.env.local')
if os.path.exists(env_path):
    with open(env_path, 'rb') as f:
        content = f.read()
    try:
        text = content.decode('utf-8')
    except UnicodeDecodeError:
        text = content.decode('utf-16le')
    
    for line in text.splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            os.environ[k.strip()] = v.strip().strip("'").strip('"')

print("DEBUG ENV SUPABASE_URL:", os.environ.get("NEXT_PUBLIC_SUPABASE_URL"))
print("DEBUG ENV SUPABASE_KEY:", bool(os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from lab.models import EnsayoImage, ComplaintImage

def upload_to_supabase(local_path, supabase_url, supabase_key, bucket_name, folder=""):
    """
    Uploads a local file to Supabase Storage and returns the public URL.
    """
    if not os.path.exists(local_path):
        print(f"File not found: {local_path}")
        return None

    filename = os.path.basename(local_path)
    safe_name = filename.replace(' ', '_')
    new_filename = f"{timezone.now().strftime('%Y%m%d_%H%M%S')}_{safe_name}"
    
    path_in_bucket = f"{folder}/{new_filename}" if folder else new_filename

    upload_url = f"{supabase_url}/storage/v1/object/{bucket_name}/{path_in_bucket}"
    
    # Guess mime type based on extension
    ext = os.path.splitext(local_path)[1].lower()
    content_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    }
    content_type = content_types.get(ext, 'application/octet-stream')

    with open(local_path, 'rb') as f:
        file_data = f.read()

    req_upload = urllib.request.Request(upload_url, data=file_data, method="POST")
    req_upload.add_header("Authorization", f"Bearer {supabase_key}")
    req_upload.add_header("apikey", supabase_key)
    req_upload.add_header("Content-Type", content_type)
    
    try:
        with urllib.request.urlopen(req_upload, timeout=30.0) as res:
            pass # Upload success
        
        public_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{path_in_bucket}"
        return public_url
    except urllib.error.HTTPError as e:
        print(f"Failed to upload {local_path} to Supabase: HTTP Error {e.code} - {e.read().decode('utf-8', errors='ignore')}")
        return None
    except Exception as e:
        print(f"Failed to upload {local_path}: {e}")
        return None

def migrate_images():
    supabase_url = settings.SUPABASE_URL
    supabase_key = settings.SUPABASE_KEY
    if not supabase_url or not supabase_key:
        print("Error: Supabase config is missing.")
        return

    print("Migrating Ensayo Images...")
    ensayo_images = EnsayoImage.objects.all()
    for img in ensayo_images:
        url_str = str(img.image)
        if url_str and not url_str.startswith('http'):
            print(f"Migrating EnsayoImage ID {img.id}: {url_str}")
            # Resolve local path
            local_path = os.path.join(settings.BASE_DIR, 'media', url_str.replace('/', os.sep))
            public_url = upload_to_supabase(local_path, supabase_url, supabase_key, "ensayo_photos")
            if public_url:
                img.image = public_url
                img.save()
                print(f" -> Migrated to: {public_url}")

    print("\nMigrating Complaint Images...")
    complaint_images = ComplaintImage.objects.all()
    for img in complaint_images:
        url_str = str(img.image)
        if url_str and not url_str.startswith('http'):
            print(f"Migrating ComplaintImage ID {img.id}: {url_str}")
            # Usually stored in "ensayo_photos" inside complaints folder previously
            # or in generic media, let's trace exactly
            # The field was `upload_to='complaints/'`
            local_path = os.path.join(settings.BASE_DIR, 'media', url_str.replace('/', os.sep))
            public_url = upload_to_supabase(local_path, supabase_url, supabase_key, "ensayo_photos", folder="complaints")
            if public_url:
                img.image = public_url
                img.save()
                print(f" -> Migrated to: {public_url}")

if __name__ == '__main__':
    migrate_images()
