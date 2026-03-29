import os

def fix_cloudinary_downloads(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to find the window.open calls and wrap them with fl_attachment logic
    # We target the specific blocks in Courses Page
    
    # 1. Students Materials
    old_mat = """                                               const fileUrl = mat.url;
                                               const isOfficeFile = fileUrl.match(/\\.(docx|pptx|xlsx|doc|ppt|xls)/i);
                                               if (isOfficeFile) {
                                                  window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`, '_blank');
                                               } else {
                                                  window.open(fileUrl, '_blank');
                                               }"""
    
    new_mat = """                                               let fileUrl = mat.url;
                                               const isCloudinary = fileUrl.includes('res.cloudinary.com');
                                               const isOfficeFile = fileUrl.match(/\\.(docx|pptx|xlsx|doc|ppt|xls)/i);

                                               if (isCloudinary && !isOfficeFile) {
                                                  // Force download for Cloudinary PDFs/Images
                                                  fileUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');
                                               }

                                               if (isOfficeFile) {
                                                  window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`, '_blank');
                                               } else {
                                                  window.open(fileUrl, '_blank');
                                               }"""

    # 2. Students Assignments
    old_asgn = """                                               const fileUrl = asgn.fileUrl;
                                               const isOfficeFile = fileUrl.match(/\\.(docx|pptx|xlsx|doc|ppt|xls)/i);
                                               if (isOfficeFile) {
                                                  window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`, '_blank');
                                               } else {
                                                  window.open(fileUrl, '_blank');
                                               }"""
    
    new_asgn = """                                               let fileUrl = asgn.fileUrl;
                                               const isCloudinary = fileUrl.includes('res.cloudinary.com');
                                               const isOfficeFile = fileUrl.match(/\\.(docx|pptx|xlsx|doc|ppt|xls)/i);

                                               if (isCloudinary && !isOfficeFile) {
                                                  // Force download for Cloudinary PDFs/Images
                                                  fileUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');
                                               }

                                               if (isOfficeFile) {
                                                  window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`, '_blank');
                                               } else {
                                                  window.open(fileUrl, '_blank');
                                               }"""

    # Replace if found
    if old_mat in content:
        print("Found old_mat, replacing...")
        content = content.replace(old_mat, new_mat)
    else:
        print("Could not find old_mat EXACT match. Trying with flexible whitespace...")
        # Since the direct match failed, I've already seen them in view_file.
        # I'll use a more surgical approach in the next step if this fails.

    if old_asgn in content:
        print("Found old_asgn, replacing...")
        content = content.replace(old_asgn, new_asgn)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    fix_cloudinary_downloads(r"c:\Users\softs\Desktop\KU APP\apps\web\app\dashboard\courses\page.tsx")
