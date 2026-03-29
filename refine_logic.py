import os

def refine_download_logic(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The existing logic (lines 1406-1421)
    old_logic = """                                           onClick={() => {
                                             if (mat.type === 'SCHEDULED_LECTURE') {
                                               router.push(`/dashboard/courses/${viewingCourse.id}/live?scheduledId=${mat.id}`);
                                             } else {
                                               let fileUrl = mat.url;
                                               if (fileUrl.includes('res.cloudinary.com')) {
                                                 if (fileUrl.includes('/image/upload/') || fileUrl.includes('/video/upload/')) { fileUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/'); }
                                               }
                                               const isOfficeFile = fileUrl.match(/\\.(docx|pptx|xlsx|doc|ppt|xls)/i);
                                               if (isOfficeFile) {
                                                  window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`, '_blank');
                                               } else {
                                                  window.open(fileUrl, '_blank');
                                               }
                                             }
                                           }}"""

    # NEW logic: Support Drive links directly, Cloudinary via Proxy.
    new_logic = """                                           onClick={() => {
                                             if (mat.type === 'SCHEDULED_LECTURE') {
                                               router.push(`/dashboard/courses/${viewingCourse.id}/live?scheduledId=${mat.id}`);
                                             } else {
                                               const fileUrl = mat.url || '';
                                               const isDrive = fileUrl.includes('drive.google.com') || fileUrl.includes('docs.google.com');
                                               const isCloudinary = fileUrl.includes('res.cloudinary.com');
                                               
                                               if (isDrive) {
                                                  window.open(fileUrl, '_blank');
                                               } else if (isCloudinary) {
                                                  const token = localStorage.getItem('token');
                                                  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://fop-backend.vercel.app').replace(/\\/$/, '');
                                                  window.open(`${baseUrl}/api/lms/materials/${mat.id}/download?token=${token}`, '_blank');
                                               } else {
                                                  window.open(fileUrl, '_blank');
                                               }
                                             }
                                           }}"""

    if old_logic in content:
        print("Found old_logic, replacing...")
        content = content.replace(old_logic, new_logic)
    else:
        print("Could not find old_logic EXACT match. Checking if it's already updated...")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    refine_download_logic(r"c:\Users\softs\Desktop\KU APP\apps\web\app\dashboard\courses\page.tsx")
