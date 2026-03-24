from PIL import Image
import os

def fix_png(path):
    try:
        img = Image.open(path)
        # Convert to RGB if it has alpha to be safe, or just re-save as PNG
        # Most icons should have alpha, but let's just re-save it cleanly
        img.save(path, "PNG")
        print(f"Successfully re-saved {path}")
    except Exception as e:
        print(f"Error fixing {path}: {e}")

assets_dir = r"c:\Users\softs\Desktop\KU APP\apps\mobile\assets"
for filename in ["logo.png", "icon.png", "splash-icon.png"]:
    fix_png(os.path.join(assets_dir, filename))
