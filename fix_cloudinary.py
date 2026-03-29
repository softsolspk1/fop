import os
import re

def fix_cloudinary(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    # This is a robust search-and-replace for the specific window.open pattern
    # We want to catch 'const fileUrl = mat.url;' or 'const fileUrl = asgn.fileUrl;'
    # and transform it into a version that checks for Cloudinary.
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Target: const fileUrl = mat.url;
        if 'const fileUrl = mat.url;' in line:
            indent = line[:line.find('const')]
            print(f"Found mat.url at line {i+1}")
            # Replace the block
            new_lines.append(f"{indent}let fileUrl = mat.url;\n")
            new_lines.append(f"{indent}if (fileUrl.includes('res.cloudinary.com')) {{\n")
            new_lines.append(f"{indent}  fileUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');\n")
            new_lines.append(f"{indent}}}\n")
            i += 1 # skip old const line
            continue
            
        # Target: const fileUrl = asgn.fileUrl;
        if 'const fileUrl = asgn.fileUrl;' in line:
            indent = line[:line.find('const')]
            print(f"Found asgn.fileUrl at line {i+1}")
            new_lines.append(f"{indent}let fileUrl = asgn.fileUrl;\n")
            new_lines.append(f"{indent}if (fileUrl.includes('res.cloudinary.com')) {{\n")
            new_lines.append(f"{indent}  fileUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');\n")
            new_lines.append(f"{indent}}}\n")
            i += 1
            continue

        new_lines.append(line)
        i += 1

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    fix_cloudinary(r"c:\Users\softs\Desktop\KU APP\apps\web\app\dashboard\courses\page.tsx")
