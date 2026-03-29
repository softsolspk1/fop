import os

def refine_fl_attachment(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Old logic: fileUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');
    # New logic: only for image/video upload paths
    
    old_line = "fileUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');"
    new_line = "if (fileUrl.includes('/image/upload/') || fileUrl.includes('/video/upload/')) { fileUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/'); }"
    
    if old_line in content:
        print("Updating fl_attachment logic...")
        content = content.replace(old_line, new_line)
    else:
        print("Target line not found precisely. Checking for manual edits...")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    refine_fl_attachment(r"c:\Users\softs\Desktop\KU APP\apps\web\app\dashboard\courses\page.tsx")
