import os

def implement_proxy_download(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to find the materials download button onClick handler
    # and replace the window.open logic.
    
    # 1. Add API URL detection logic if needed, or just use hardcoded relative path if possible.
    # But for window.open we need a full URL if it's on a different subdomain.
    
    # I'll inject a helper inside the component or just use the logic inline.
    
    old_mat_logic = """                                               let fileUrl = mat.url;
                                               if (fileUrl.includes('res.cloudinary.com')) {
                                                 if (fileUrl.includes('/image/upload/') || fileUrl.includes('/video/upload/')) { fileUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/'); }
                                               }
                                               const isOfficeFile = fileUrl.match(/\\.(docx|pptx|xlsx|doc|ppt|xls)/i);
                                               if (isOfficeFile) {
                                                  window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`, '_blank');
                                               } else {
                                                  window.open(fileUrl, '_blank');
                                               }"""

    # New logic using the backend proxy
    new_mat_logic = """                                               const token = localStorage.getItem('token');
                                               const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://fop-backend.vercel.app').replace(/\\/$/, '');
                                               const downloadUrl = `${baseUrl}/api/lms/materials/${mat.id}/download?token=${token}`;
                                               
                                               const isOfficeFile = mat.url?.match(/\\.(docx|pptx|xlsx|doc|ppt|xls)/i);
                                               if (isOfficeFile) {
                                                  window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(mat.url)}`, '_blank');
                                               } else {
                                                  window.open(downloadUrl, '_blank');
                                               }"""

    if old_mat_logic in content:
        print("Found old_mat_logic, replacing...")
        content = content.replace(old_mat_logic, new_mat_logic)
    else:
        print("Could not find old_mat_logic EXACT match. Checking for manual edits...")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    implement_proxy_download(r"c:\Users\softs\Desktop\KU APP\apps\web\app\dashboard\courses\page.tsx")
