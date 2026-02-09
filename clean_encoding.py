import os

files_to_clean = [
    'backend/requirements.txt',
    'backend/core/settings.py',
    'backend/lab/admin.py'
]

for file_path in files_to_clean:
    if os.path.exists(file_path):
        print(f"Cleaning {file_path}...")
        with open(file_path, 'rb') as f:
            content = f.read()
        
        # Remove null bytes and other potentially problematic bytes
        cleaned_content = content.replace(b'\x00', b'')
        
        # Write back as pure UTF-8 (no BOM)
        with open(file_path, 'wb') as f:
            f.write(cleaned_content)
        print(f"Successfully cleaned {file_path}")
    else:
        print(f"File not found: {file_path}")
